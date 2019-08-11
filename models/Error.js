/**
 * Created by Msarabia on 16/09/2016.
 * Tabla de los servicios que ofrecen
 */
'use strict';
let mongoose = require('mongoose');

let blockModel = function () {
    let Schema = mongoose.Schema;

    let schema = new Schema({
            date: {type: Date, default: Date.now()},
            Error: String
        },
        // Define the name collection
        {
            collection: 'Error'
        },
    );


    // automatic populate

//  function populateService (next) {
//    this.populate("groupItem");
//    next();
//  }


//  schema.pre("find",populateService);
//  schema.pre("findOne",populateService);


    return mongoose.model('Error', schema);
};

module.exports = blockModel();