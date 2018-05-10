'use strict';
const Confidence = require('confidence');
const Config = require('./config');
const Pack = require('./package');


const criteria = {
    env: process.env.NODE_ENV
};


const manifest = {
    $meta: 'This file defines the mortgage service',
    server: {
        debug: {
            request: ['error']
        },
        connections: {
            routes: {
                security: true
            }
        }
    },
    connections: [{
        port: Config.get('/port/web'),
        labels: ['web']
    }],
    registrations: [{
            plugin: 'hapi-auth-basic'
        },
        {
            plugin: 'lout'
        },
        {
            plugin: 'inert'
        },
        {
            plugin: 'vision'
        },
        {
            plugin: 'hapi-auth-cookie'
        },
        {
            plugin: 'bell'
        },
        {
            plugin: {
                register: 'visionary',
                options: {
                    engines: {
                        jade: 'jade'
                    },
                    path: './server/web'
                }
            }
        },
        {
            plugin: {
                register: 'hapi-mongo-models',
                options: {
                    mongodb: Config.get('/hapiMongoModels/mongodb'),
                    models: {                        
                        Mortgage: './server/models/mortgage'
                    },
                    autoIndex: Config.get('/hapiMongoModels/autoIndex')
                }
            }
        },
     
        {
         plugin: './server/api/mortgage',
            options: {
                routes: {
                    prefix: '/api'
                }
            }
        },

        // {
        //     plugin: './server/web/index'
        // },
        {
            plugin: 'hapi-auth-jwt2'
        },
        {
            plugin: {
                'register': 'hapi-swagger',
                'options': {
                    info: {
                        'title': 'Mortgage API Documentation',
                        'version': Pack.version,
                    },
                    securityDefinitions: {
                        jwt: {
                            description: "Application token",
                            type: 'apiKey',
                            name: 'usertoken',
                            in: 'header'
                        },
                        security: [{
                            'jwt': []
                        }]
                    }
                }
            }
        },
        {
            plugin: {
                register: "good",
                options: {
                    ops: {
                        interval: 5000
                    },
                    reporters: {
                        console: [{
                                module: "good-squeeze",
                                name: "Squeeze",
                                args: [{
                                    log: "*",
                                    response: "*"
                                }]
                            },
                            {
                                module: "good-console"
                            },
                            "stdout"
                        ]


                    }
                }
            }
        }
    ]
};


const store = new Confidence.Store(manifest);


exports.get = function (key) {

    return store.get(key, criteria);
};


exports.meta = function (key) {

    return store.meta(key, criteria);
};