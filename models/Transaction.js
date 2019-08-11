/**
 * Created by Msarabia on 16/09/2016.
 * Tabla de los servicios que ofrecen
 */
'use strict';
let mongoose = require('mongoose');

let transactionModel = function () {
    let Schema = mongoose.Schema;

    let schema = new Schema({
            fromAddress: String,
            fromName: String,
            toAddress: String,
            toName: String,
            date: {type: Date, default: Date.now()},
            amount: Number,
            btcPrice:Number,
            data: String,
        },
// Define the name collection
        {
            collection: 'Transactions'
        }
    );


    if (!schema.options.toJSON) schema.options.toJSON = {};
    schema.options.toJSON.transform = function (doc, ret, options) {
        delete ret._id;
        delete ret.__v;
    };


    return mongoose.model('Transactions', schema);
};

module.exports = transactionModel();