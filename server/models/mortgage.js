'use strict';

const Async = require('async');
const Bcrypt = require('bcrypt');
const Joi = require('joi');
const MongoModels = require('mongo-models');
const Config = require('../../config');
const Wreck = require('wreck');


class Mortgage extends MongoModels {

    static audit(userId,data,callback){


        const uri = config.get('/microservices/audit/protocol') + '://' 
                    + Config.get('/microservices/audit/host') + ':' 
                    + Config.get('/microservices/audit/port') + '/audit';

        console.log('data logged to uri:' + uri)
        
        const options = {

            payload: data,
            redirects: 3,
            beforeRedirect: (redirectMethod, statusCode, location, resHeaders, redirectOptions, next) => next(),
            redirected: function (statusCode, location, req) {},
            timeout: 10000, // 1 second, default: unlimited
            maxBytes: 1048576, // 1 MB, default: unlimited
            rejectUnauthorized: true || false,
            downstreamRes: null,
            agent: null 
        };

        const postAudit = async function () {
                try {

                    const promise = Wreck.request('POST', uri, options);
                    const res = await promise;
                    const body = await Wreck.read(res,{json:'true'});
                    callback(null, body);
                    
                }
                catch (err) {
                    callback(err);
                }
            };


        postAudit();
    }

    static getCustomerData(customerCode,callback){

        const uri = config.get('/microservices/customer/protocol') + '://' 
        + Config.get('/microservices/customer/host') + ':' 
        + Config.get('/microservices/customer/port') + '/customer/' + customerCode;

        console.log('uri:' + uri)
        
        const options = {
            redirects: 3,
            beforeRedirect: (redirectMethod, statusCode, location, resHeaders, redirectOptions, next) => next(),
            redirected: function (statusCode, location, req) {},
            timeout: 100000, // 1 second, default: unlimited
            maxBytes: 1048576, // 1 MB, default: unlimited
            rejectUnauthorized: true || false,
            downstreamRes: null,
            agent: null 
        };

        const getCustomer = async function () {
            
            try {
                console.log('loading profile..')

                const promise = Wreck.request('GET', uri, options);
                const res = await promise;
                const body = await Wreck.read(res,{json:'true'});

                callback(null, body);
                
            }
            catch (err) {
                callback(err);
            }
        }
            
        getCustomer();
    }



    static findByCustomerId(customerId, callback) {

        const query = {
            customerId: customerId
        };

        console.log("query:" + query.customerId)
        this.find(query, callback);
    }
            
}

Mortgage.collection = 'mortgage';

Mortgage.schema = Joi.object().keys({
    _id: Joi.object(),

    customerId: Joi.string(),
    accountInterestRate: Joi.number(),
    amountGranted: Joi.number(),
    amountAdvanced: Joi.number(),
    repayment: Joi.number(),
    grossOrNet: Joi.string(),
    advanceDate: Joi.date(),
    totalProductTerm: Joi.number(),
    remainingProductTerm: Joi.number(),
    twinAccount: Joi.boolean(),
    accountType: Joi.number(),
    principalBalance: Joi.number(),
    interestBalance: Joi.number(),
    currentBalance: Joi.number(),
    openingDate: Joi.date(),
    openingBalance: Joi.number(),
    openingBranch: Joi.string()
});

Mortgage.indexes = [{
        key: {
            id: 1,
            unique: 1
        }
    }
];


module.exports = Mortgage;