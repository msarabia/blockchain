let Block       = require('./Block');
let Transaction = require('./Transaction');
let loader      = require('./loader');
let Db;


class BlockChain {
    constructor(db, difficulty = 2) {
        Db = this.db = db;
        this.difficulty          = 2;
        this.transactionByBlock  = 5;
        this.timeToMining        = 10;
        this.pendingTransactions = [];
        this.lastBlock           = null;
        this.timer               = null;

        this.getLastBlock                 = this.getLastBlock.bind(this);
        this.createFirstBlock             = this.createFirstBlock.bind(this);
        this.getPendingTransactionsFromDb = this.getPendingTransactionsFromDb.bind(this);
        this.minePendingTransaction       = this.minePendingTransaction.bind(this);
        this.createTransaction            = this.createTransaction.bind(this);
        this.getBalanceFromAddress        = this.getBalanceFromAddress.bind(this);
        this.isChainValid                 = this.isChainValid.bind(this);
        this.isValidNextBlock             = this.isValidNextBlock.bind(this);
        this.isValidHashDifficulty        = this.isValidHashDifficulty.bind(this);
        this.init                         = this.init.bind(this);
        this.loadModels();
    }

    loadModels() {
        let models = loader({
            dirname          : __dirname + '/../models',
            filter           : /(.+)\.(js)$/,
            keepDirectoryPath: true,
            flatten          : true,
            replaceVal       : '',
            identity         : false,
            aggregate        : false,
            optional         : true,
            _depth           : 0
        });

        for (let obj in models) {
            if (Object.keys(models[obj]).length > 0) {
                Db[obj] = models[obj];
            }
        }

    }

    /***
     * Establecemos la dioficultad de los bloques
     * @param difficulty
     */
    setDifficulty(difficulty) {
        if (!difficulty) return;
        this.difficulty = difficulty;
    }

    /***
     * Creamos el bloque genesis
     * @param genesis
     * @returns {Block}
     */
    createFirstBlock() {
        let instance = this;
        let newBlock = new Block(
            new Transaction("", "", "", "", 0, 0,"Genesis Block")
        );

        newBlock.mine(this.difficulty, function (err, block) {
            instance.lastBlock = block;
            if (err) process.exit(0);
            Db.Block.create(block, function (err, genesisBlock) {
                if (!err) {
                    instance.lastBlock = genesisBlock.toObject();
                }
            });
        });
    }

    getLastBlock(cb) {
        return this.lastBlock;
    }

    getPendingTransactionsFromDb() {
        let self = this;
        Db.Transaction.find({}, function (err, transactions) {
            if (!err) {
                self.pendingTransactions = transactions;
            }
        });
    }

    minePendingTransaction(cb) {
        let instance = this;
        if (this.pendingTransactions.length === 0)
            return;


        let previusBlock = this.getLastBlock();
        let onMinining;
        if (this.pendingTransactions.length >= this.transactionByBlock) {
            onMinining = this.pendingTransactions.slice(0, this.transactionByBlock);
        }
        else {
            onMinining = this.pendingTransactions.slice(0, this.pendingTransactions.length);
        }

        let block         = new Block(onMinining);
        block.previusHash = previusBlock.hash;
        block.mine(this.difficulty, function (err, blockMined) {
            if (instance.isValidNextBlock(blockMined, previusBlock)) {
                Db.Block.create(block, function (err, register) {
                    if (!err) {
                        instance.lastBlock = register;
                        instance.pendingTransactions.splice(0, onMinining.length);
                        if (cb) cb(register.toObject());

                        // Delete pending transactions from Database
                        let ids = register.transactions.map(function (item) {
                            return item._id
                        });

                        Db.Transaction.deleteMany({_id: {$in: ids}}, function (err, data) {
                            if (err) {
                                console.log("Fallo al eliminar las transacciones registradas en el bloque, Eliminar las trnasacciones pendientes");
                                instance.pendingTransactions = [];
                                return process.exit(-1);
                            }
                        });
                    }
                    else {
                        console.log("Fallo al grabar el Bloque de la transaccion", err.toString());
                    }
                });
                console.log('block successfully mined and validate');
            }
            else {
                console.log("Block is failed the verification ");
            }
        });
    }

    createTransaction(sender, receptor, amount, price, msg, cb) {
        let transaction         = new Transaction(sender.wallet, sender.fullname, receptor.wallet, receptor.fullname, amount, price, msg);
        let pendingTransactions = this.pendingTransactions;
        let instance            = this;
        Db.Transaction.create(transaction, function (err, trans) {
            if (!err) {
                pendingTransactions.push(trans);
                if (cb) {
                    cb(null, trans);
                    // console.log("Nueva Transaccion registrada");
                }

                // if (instance.pendingTransactions.length >= 3) {
                //     console.log("Inicio de minado de Bloque");
                //     instance.minePendingTransaction();
                // }
            }
            else {
                console.log("Error al grabar la transaccion");
                pendingTransactions.push(transaction);
                if (cb) cb(err, trans);
            }
        });

    }

    getBalanceFromAddress(address) {
        let balance = 0;
        for (const block of this.chain) {
            for (const trans of block.transactions) {
                if (trans.fromAddress === address) {
                    balance -= trans.amount;
                }
                if (trans.toAddress === address) {
                    balance += trans.amount;
                }
            }
        }

        return balance;
    }

    isChainValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const currenBlock  = this.chain[i];
            const previusBlock = this.chain[i - 1];
            if (currenBlock.hash !== currenBlock.calculateHash()) {
                return false;
            }

            if (currenBlock.hash !== previusBlock.hash) {
                return false;
            }
        }

        return true;
    }

    isValidNextBlock(nextBlock, previusBlock) {
        const nextBlockHash = nextBlock.calculateHash();

        if (previusBlock.date > nextBlock.date) {
            return false;
        }
        else if (previusBlock.hash !== nextBlock.previusHash) {
            return false;
        }
        else if (nextBlockHash !== nextBlock.hash) {
            return false;
        }
        else if (!this.isValidHashDifficulty(nextBlockHash)) {
            return false;
        } else {
            return true;
        }
    }

    isValidHashDifficulty(hash) {
        let i = 0;
        for (i = 0; i < hash.length; i++) {
            if (hash[i] !== "0") {
                break;
            }
        }
        return i >= this.difficulty;
    }

    startInterval(minutes) {
        let time         = minutes * 60000;
        let minefunction = this.minePendingTransaction;
        this.timer       = setInterval(function () {
            minefunction();
        }, time);
    }

    init(difficulty) {
        let instance                     = this;
        this.difficulty                  = difficulty || this.difficulty;
        let getPendingTransactionsFromDb = this.getPendingTransactionsFromDb.bind(this);
        this.startInterval(this.timeToMining);
        // Validate last block in DB
        if (!this.lastBlock) {
            Db.Block.findOne({}, {}, {sort: {'date': -1}}, function (err, register) {
                    // Exite
                    if (register) {
                        instance.lastBlock = register.toObject();
                        getPendingTransactionsFromDb();
                    }
                    else {
                        // no existe
                        instance.createFirstBlock();
                    }
                }
            );
        }
    }
}

module.exports = BlockChain;
