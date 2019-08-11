const crypto = require('crypto');

function calculateHash(date, previusHash, nonce, transactions) {
    let hash = crypto.createHash('sha256');
    let digest = hash.update(date + previusHash + nonce + JSON.stringify(transactions));
    return digest.digest('hex');
}


class Block {
    constructor(transactions, previusHash = '') {
        if (Array.isArray(transactions)) {
            this.transactions = transactions;
        }
        else {
            this.transactions = [transactions];
        }

        this.nonce = 0;
        this.date = new Date();
        this.previusHash = previusHash;
        this.hash = calculateHash(this.date, this.previusHash, this.nonce);
    }


    calculateHash() {
        let hash = crypto.createHash('sha256');
        let digest = hash.update(this.date + this.previusHash + this.nonce + JSON.stringify(this.transactions));
        return digest.digest('hex');
    }

    mine(difficulty, callback) {
        while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
            this.nonce++;
            this.hash = this.calculateHash();
        }
        if (callback) {
            callback(null, this);
        }
        console.log("Block found :" + this.hash);
    }
}

module.exports = Block;