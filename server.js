'use strict';
const Composer = require('./index');
const Config = require('./config').get('/');
const Boom = require('boom');
const AppInsights = require('applicationinsights');

// register app to AzureApplicationInsight for monitoring purposes
AppInsights.setup(Config.azureAppInsight.instrumentationKey)
    .setAutoDependencyCorrelation(true)
    .setAutoCollectRequests(true)
    .setAutoCollectPerformance(true)
    .setAutoCollectExceptions(true)
    .setAutoCollectDependencies(true)
    .setAutoCollectConsole(true)
    .setUseDiskRetryCaching(true)
    .start();

Composer((err, server) => {

    if (err) {
        throw err;
    }


   
    server.decorate('reply', 'ok', function(msg, data) {

        return this.response({ success: true, message: msg, data: data });

    });



    server.decorate('reply', 'notFound', notFound);
    server.decorate('reply', 'badImplementation', badImpl);
    server.decorate('reply', 'unauthorized', unauthorized);
    server.decorate('reply', 'badRequest', badRequest);
  

function notFound (message) {
    var error = Boom.notFound(message, { success: false, message: message, data: null });
    error.output.payload = error.data;

    return this.response(error);  
}

function badImpl (message) {
  return this.response(Boom.badImplementation(message));  
}

function unauthorized (message) {
    var error = Boom.unauthorized(message, { success: false, message: message, data: null });
    error.output.payload = error.data;

    return this.response(error);  
}

function badRequest (message, data){
    var error = Boom.badRequest(message, { success: false, message: message, data: (data || null) });
    error.output.payload = error.data;

    return this.response(error);  
}

    const cache = server.cache({ segment: 'sessions', expiresIn: 3 * 24 * 60 * 60 * 1000 });
    server.app.cache = cache;

    server.auth.strategy('azuread', 'bell', {
        provider: 'azuread',
        password: Config.auth.azure.cookieSecret,
        isSecure: false,
        clientId: Config.auth.azure.clientId,
        clientSecret: Config.auth.azure.clientSecret,
        scope: ['openid', 'offline_access', 'profile'],
        skipProfile: false,
        config: { tenant: Config.auth.azure.tenant },
    });

    server.start(() => {

        console.log('Started on port ' + server.info.port);
    });
});