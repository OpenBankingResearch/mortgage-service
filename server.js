'use strict';
const Composer = require('./index');
const Config = require('./config').get('/');
const Boom = require('boom');

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

    server.start(() => {

        console.log('Started mortgage service on port ' + server.info.port);
    });
});