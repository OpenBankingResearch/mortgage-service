'use strict';
const Confidence = require('confidence');
const Dotenv = require('dotenv');


Dotenv.config({
    silent: true
});

const criteria = {
    env: process.env.NODE_ENV
};


const config = {
    $meta: 'This is a mortgage micro service for the society hack',
    projectName: 'Mortgage micro service',
    port: {
        web: {
            $filter: 'env',
            test: 9000,
            production: process.env.PORT,
            $default: 8100
        }
    },
    baseUrl: {
        $filter: 'env',
        $meta: 'values should not end in "/"',
        production: process.env.BASE_URL,
        $default: process.env.BASE_URL
    },
    skipMobileForTest: '07111111111',
    authStrategy: 'jwt',
    authAttempts: {
        forIp: 50,
        forIpAndUser: 100
    },
    cookieSecret: {
        $filter: 'env',
        production: process.env.COOKIE_SECRET,
        $default: '!k3yb04rdK4tz~4qu4~k3yb04rdd0gz!'
    },

    jwtSecret: {
        $filter: 'env',
        production: process.env.JWT_SECRET,
        $default: 'aStrongJwtSecret-#mgtfYK@QuRV8VMM7T>WfN4;^fMVr)y'
    },
    auth: {
        azure: {
            $filter: 'env',
            production: {
                cookieSecret: '!k3yb04rdK4tz~4qu4~k3yb04rdd0gz!',
                clientId: '375869f6-f84c-41ce-957e-6ed067ec80af',
                clientSecret: 'rQeilJdix34KSB+lRZil+1v855KXM689FCK5vOznjjQ=',
                tenant: '6a3043d1-e2e3-4ac5-bab3-25d968c60e3c'
            },
            $default: {
                cookieSecret: '!k3yb04rdK4tz~4qu4~k3yb04rdd0gz!',
                clientId: '375869f6-f84c-41ce-957e-6ed067ec80af',
                clientSecret: 'rQeilJdix34KSB+lRZil+1v855KXM689FCK5vOznjjQ=',
                tenant: '6a3043d1-e2e3-4ac5-bab3-25d968c60e3c'

            }
        }
    },

    hapiMongoModels: {
        mongodb: {
            uri: {
                $filter: 'env',
                production: process.env.MONGODB_URI,
                development: process.env.MONGODB_URI_DEV,
                test: 'mongodb://motix-mongo-dev:AqrAKnz8MEU78A9eotZOeeMJeXWlvjnPY7vjSTKLA0MjjO8Qa2DKDPsD5NZxdbojL6DRO585eu5cnXWHBeBP0A==@motix-mongo-dev.documents.azure.com:10255/motix-mongo-dev?ssl=true&replicaSet=globaldb',
                $default: process.env.MONGODB_URI_DEV
            }
        },
        autoIndex: true
    },
    azureAppInsight: {
        instrumentationKey: '0a1b8a67-03b1-489b-af6d-52731bb1a88d'
    },
    sqlDb: {

        mssql: {
            $filter: 'env',
            production: {
                username: "motixdb@mvp-motix",
                password: "TeamJerrycan2017!",
                database: 'mvp-motix-test',
                host: 'mvp-motix.database.windows.net',
                port: 1433,
                pool: {
                    maxConnections: 5,
                    maxIdleTime: 30
                },
                dialect: 'mssql'
            },
            $default: {
                username: "motixdb@mvp-motix",
                password: "TeamJerrycan2017!",
                database: 'mvp-motix-test',
                host: 'mvp-motix.database.windows.net',
                port: 1433,
                pool: {
                    maxConnections: 5,
                    maxIdleTime: 30
                },
                dialect: 'mssql'
            }
        }
    },

    nodemailer: {
        host: 'smtp.mail.yahoo.com',
        port: 465,
        secure: true,
        auth: {
            user: 'motixsmtp@yahoo.com',
            pass: process.env.SMTP_PASSWORD
        }
    },
    system: {
        fromAddress: {
            name: 'Motix Accounts',
            address: 'motixsmtp@yahoo.com'
        },
        toAddress: {
            name: 'Motix Accounts',
            address: 'motixaccounts@yahoo.com'
        }
    },
    sms: {
        accountSid: 'ACa347f5ef0b8a044c13ce821e789b76e1', // Your Account SID from www.twilio.com/console
        authToken: 'd3dea2f5d6b54c9b77147dffec61fad7',
        telephoneNo: '+441952787026' // Your Auth Token from www.twilio.com/console
    },
    passwordReset:{
        validationEndpoint:'http://40.68.219.151:8080/mvp-dev/login/forgot/validate',
        linkingUri:process.env.URI_LINK || 'http://www.linkedIn.com'
    },
    microservices: {
        $filter: 'env',
        test: {
            authorization: {
                type: process.env.AUTHORIZATION_SVC_TYPE || 'tcp',
                host: process.env.AUTHORIZATION_SVC_HOST || "mvp-microservice-security.f7cf5f3b.svc.dockerapp.io",
                port: process.env.AUTHORIZATION_SVC_PORT || 8083,
                pin: 'role:authorization'
            },
        },
        production: {
            authorization: {
                type: process.env.AUTHORIZATION_SVC_TYPE || 'tcp',
                host: process.env.AUTHORIZATION_SVC_HOST,
                port: process.env.AUTHORIZATION_SVC_PORT || 8083,
                pin: 'role:authorization'
            },
            authentication: {
                type: process.env.AUTHENTICATION_SVC_TYPE || 'tcp',
                host: process.env.AUTHENTICATION_SVC_HOST,
                port: process.env.AUTHENTICATION_SVC_PORT || 3012,
                pin: 'role:auth'
            },
            audit: {
                type: process.env.AUDIT_SVC_TYPE || 'tcp',
                host: process.env.AUDIT_SVC_HOST,
                port: process.env.AUDIT_SVC_PORT || 3010,
                pin: 'role:audit'
            },

            comms: {
                type: process.env.COMMS_SVC_TYPE || 'tcp',
                host: process.env.COMMS_SVC_HOST,
                port: process.env.COMMS_SVC_PORT || 3013,
                pin: 'role:comms'
            }
        },
        development: {
            authorization: {
                type: process.env.AUTHORIZATION_SVC_TYPE || 'tcp',
                host: process.env.AUTHORIZATION_SVC_HOST,
                port: process.env.AUTHORIZATION_SVC_PORT || 8083,
                pin: 'role:authorization'
            },
            authentication: {
                type: process.env.AUTHENTICATION_SVC_TYPE || 'tcp',
                host: process.env.AUTHENTICATION_SVC_HOST,
                port: process.env.AUTHENTICATION_SVC_PORT || 3012,
                pin: 'role:auth'
            },
            audit: {
                type: process.env.AUDIT_SVC_TYPE || 'tcp',
                host: process.env.AUDIT_SVC_HOST,
                port: process.env.AUDIT_SVC_PORT || 3010,
                pin: 'role:audit'
            },

            comms: {
                type: process.env.COMMS_SVC_TYPE || 'http',
                host: process.env.COMMS_SVC_HOST,
                port: process.env.COMMS_SVC_PORT || 8083,
                pin: ['role:email,role:sms']
            }
        },
        $default: {
            authorization: {
                type: process.env.AUTHORIZATION_SVC_TYPE || 'tcp',
                host: process.env.AUTHORIZATION_SVC_HOST,
                port: process.env.AUTHORIZATION_SVC_PORT || 8083,
                pin: 'role:authorization'
            },
        }
    }
};


const store = new Confidence.Store(config);


exports.get = function (key) {

    return store.get(key, criteria);
};


exports.meta = function (key) {

    return store.meta(key, criteria);
};