/**
 * Created by msarabia on 9/30/18.
 */
class Transaction {
    constructor(fromAddress, fromName, toAddress, toName, amount, price, data = '') {
        this.fromAddress = fromAddress;
        this.fromName = fromName;
        this.toAddress = toAddress;
        this.toName = toName;
        this.amount = amount;
        this.btcPrice = price;
        this.data = new Buffer.from(data).toString("hex");
    }
}

module.exports = Transaction;