/**
 * Created by Msarabia on 16/09/2016.
 * Tabla de los servicios que ofrecen
 */
'use strict';
let mongoose = require('mongoose');

let blockModel = function () {
    let Schema = mongoose.Schema;

    let schema = new Schema({
            transactions: [{
                fromAddress: String,
                fromName: String,
                toAddress: String,
                toName: String,
                date: Date,
                amount: Number,
                btcPrice:Number,
                data: String,
            }],

            date: {type: Date, default: Date.now()},
            previusHash: String,
            hash: String,
            nonce: Number,
            merklerroot: String
        },
        // Define the name collection
        {
            collection: 'Block'
        },
        {
            toObject: {
                transform: function (doc, item) {
                    delete item._id;
                }
            },
            toJSON: {
                transform: function (doc, item) {
                    delete item._id;

                }
            }
        }
    );


    // automatic populate

//  function populateService (next) {
//    this.populate("groupItem");
//    next();
//  }


//  schema.pre("find",populateService);
//  schema.pre("findOne",populateService);


    return mongoose.model('Block', schema);
};

module.exports = blockModel();