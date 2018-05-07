'use strict';
const Confidence = require('confidence');
const Config = require('./config');
const Pack = require('./package');


const criteria = {
    env: process.env.NODE_ENV
};


const manifest = {
    $meta: 'This file defines the authentication service',
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
                        AuthAttempt: './server/models/auth-attempt',
                        Session: './server/models/session',
                        User: './server/models/user'
                    },
                    autoIndex: Config.get('/hapiMongoModels/autoIndex')
                }
            }
        },
        // {
        //     plugin: {
        //         register: './app-start/mssql'
        //     }
        // },
        {
            plugin: './server/auth'
        },
        {
            plugin: './server/sendSms'
        },
        {
            plugin: './server/mailer'
        },
     
        {
            plugin: './server/api/auth-attempts',
            options: {
                routes: {
                    prefix: '/api'
                }
            }
        },
        {
            plugin: './server/api/index',
            options: {
                routes: {
                    prefix: '/api'
                }
            }
        },
        {
            plugin: './server/api/login',
            options: {
                routes: {
                    prefix: '/api'
                }
            }
        },
        {
            plugin: './server/api/logout',
            options: {
                routes: {
                    prefix: '/api'
                }
            }
        },
        {
            plugin: './server/api/sessions',
            options: {
                routes: {
                    prefix: '/api'
                }
            }
        },
        {
            plugin: './server/api/signup',
            options: {
                routes: {
                    prefix: '/api'
                }
            }
        },
        {
            plugin: './server/api/users',
            options: {
                routes: {
                    prefix: '/api'
                }
            }
        },
        {
            plugin: './server/web/index'
        },
        {
            plugin: 'hapi-auth-jwt2'
        },
        {
            plugin: {
                'register': 'hapi-swagger',
                'options': {
                    info: {
                        'title': 'Motix Authentication API Documentation',
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
                        ],
                        HTTPReporter: [{
                            module: 'good-squeeze',
                            name: 'Squeeze',
                            args: [{
                                log: "*",
                                response: "*",
                                ops: "*",
                                request: "*",
                                error: "*"
                            }]
                        }, {
                            module: 'good-http',
                            args: [process.env.LOG_API || 'http://MacBook-Pro-dom-2.local:4051/log/bulk', {
                                wreck: {
                                    headers: {
                                        'x-api-key': 12345
                                    }
                                }
                            }]
                        }]


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