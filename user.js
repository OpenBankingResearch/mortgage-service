'use strict';

const Async = require('async');
const Bcrypt = require('bcrypt');
const Joi = require('joi');
const MongoModels = require('mongo-models');


class User extends MongoModels {
    static generatePasswordHash(password, callback) {

        Async.auto({
            salt: function (done) {

                Bcrypt.genSalt(10, done);
            },
            hash: ['salt', function (results, done) {

                Bcrypt.hash(password, results.salt, done);
            }]
        }, (err, results) => {

            if (err) {
                return callback(err);
            }

            callback(null, {
                password,
                hash: results.hash
            });
        });
    }

    static create(payload, callback) {

        const deviceId = payload.deviceId;
        const password = payload.password;
        const username = payload.username;
        const email = payload.email;
        const countryCode = payload.countryCode;

        const self = this;

        Async.auto({
            passwordHash: this.generatePasswordHash.bind(this, password),
            newUser: ['passwordHash', function (results, done) {

                const document = {
                    status: 0,
                    username: username.toLowerCase(),
                    password: results.passwordHash.hash,
                    countryCode: countryCode.toUpperCase(),
                    email: email.toLowerCase(),
                    devices: [{
                        id: deviceId,
                        name: username.toLowerCase() + '_' + deviceId
                    }],
                    timeCreated: new Date()
                };

                console.log('insertOne called');

                self.insertOne(document, done);
            }],
            postSQL: ['passwordHash', function (results, done) {

                const document = {
                    deviceId: deviceId.toLowerCase(),
                    password: results.passwordHash.hash,
                    email: email.toLowerCase(),
                    countryCode: countryCode.toLowerCase()
                };


                const uri = 'http://' + Config.get('/microservices/authorization/host') + ':' + Config.get('/microservces/authorization/port');
                const options = {

                    payload: JSON.stringify(document),
                    headers: { /* http headers */ },
                    redirects: 3,
                    beforeRedirect: (redirectMethod, statusCode, location, resHeaders, redirectOptions, next) => next(),
                    redirected: function (statusCode, location, req) {},
                    timeout: 1000, // 1 second, default: unlimited
                    maxBytes: 1048576, // 1 MB, default: unlimited
                    rejectUnauthorized: true || false,
                    downstreamRes: null,
                    agent: null // Node Core http.Agent
                    //secureProtocol: 'SSLv3_method', // The SSL method to use
                    // sciphers: 'DES-CBC3-SHA' // The TLS ciphers to support
                };


                const postUser = async function () {

                    const {
                        res,
                        document
                    } = await Wreck.post(uri, options);

                };

                Wreck.post(uri, options, (err, res, payload) => {
                    if (err) console.warn(err);

                    console.log('userSQL Model:User.Create', payload);

                    // TODO: Add Audit

                    done(null, document);


                })

            }]
        }, (err, results) => {

            if (err) {
                return callback(err);
            }

            results.newUser[0].password = results.passwordHash.password;

            callback(null, results.newUser[0]);
        });
    }

    static findByCredentials(username, password, callback) {

        const self = this;

        Async.auto({
            user: function (done) {

                const query = {
                    status: 0
                };

                if (username.indexOf('@') > -1) {
                    query.email = username.toLowerCase();
                } else {
                    query.username = username.toLowerCase();
                }

                self.findOne(query, done);
            },
            passwordMatch: ['user', function (results, done) {

                if (!results.user) {
                    return done(null, false);
                }

                const source = results.user.password;
                Bcrypt.compare(password, source, done);
            }]
        }, (err, results) => {

            if (err) {
                return callback(err);
            }

            if (results.passwordMatch) {
                return callback(null, results.user);
            }

            callback();
        });
    }

    static findByUsername(username, callback) {

        const query = {
            username: username.toLowerCase()
        };

        this.findOne(query, callback);
    }

    constructor(attrs) {

        super(attrs);

        Object.defineProperty(this, '_roles', {
            writable: true,
            enumerable: false
        });
    }

    canPlayRole(group) {

        if (!this.groups) {
            return false;
        }

        return this.groups.hasOwnProperty(group);
    }

    hydrateRoles(callback) {

        if (!this.groups) {
            this._roles = {};
            return callback(null, this._roles);
        }

        if (this._roles) {
            return callback(null, this._roles);
        }

        const self = this;
        const tasks = {};


        Async.auto(tasks, (err, results) => {

            if (err) {
                return callback(err);
            }

            self._roles = results;

            callback(null, self._roles);
        });
    }
}


User.collection = 'users';


User.schema = Joi.object().keys({
    _id: Joi.object(),
    status: Joi.number().default(1),
    username: Joi.string().token().lowercase().required(),
    password: Joi.string(),
    email: Joi.string().email().lowercase().required(),
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
        expires: Joi.date().required()
    }),
    timeCreated: Joi.date()
});


User.indexes = [{
        key: {
            username: 1,
            unique: 1
        }
    },
    {
        key: {
            email: 1,
            unique: 1
        }
    }
];


module.exports = User;