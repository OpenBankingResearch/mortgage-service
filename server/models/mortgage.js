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



    static findByUsername(username, callback) {

        const query = {
            username: username.toLowerCase()
        };

        this.findOne(query, callback);
    }
            
}

Mortgage.collection = 'users';

Mortgage.schema = Joi.object().keys({
    _id: Joi.object(),
    status: Joi.number().default(1),
    username: Joi.string(),
    password: Joi.string(),
    email: Joi.string().email().lowercase().required(),
    userId:Joi.number(),
    mobile:Joi.object().keys({
        number:Joi.string(),
        dateVerified: Joi.date().default(new Date()).required(),
        verified: Joi.boolean(),
        verificationCode:Joi.string(),
        pin: Joi.string(),
        dateSent: Joi.date().default(new Date()).required()
    }),
    emailVerification: Joi.object().keys({
        dateValid: Joi.date().default(new Date()).required(),
        valid: Joi.boolean(),
        code: Joi.string(),
        linkUri: Joi.string(),
        dateSent: Joi.date().default(new Date()).required()
    }),
    countryCode: Joi.string().required().default('gb'),
    devices: Joi.array().items(Joi.object().keys({
        id: Joi.string().required(),
        name: Joi.string().required()
    })),
    groups: Joi.array().items(Joi.object().keys({
        id: Joi.string().required(),
        name: Joi.string().required(),
        permissions: Joi.array().items(
            Joi.string()
        )
    })),
    resetPassword: Joi.object().keys({
        token: Joi.string().required(),
        uriLink:Joi.string().required(),
        tokenValid: Joi.boolean().required().default(false),
        expires: Joi.date().required()
    }),
    timeCreated: Joi.date()
});


Mortgage.indexes = [{
        key: {
            customerCode: 1,
            unique: 1
        }
    }
];


module.exports = Mortgage;