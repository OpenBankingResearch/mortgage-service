'use strict';
const Boom = require('boom');
const Joi = require('joi');
const Config = require('../../config');


const internals = {};


internals.applyRoutes = function (server, next) {

    const Mortgage = server.plugins['hapi-mongo-models'].Mortgage;


    server.route({
        method: 'GET',
        path: '/mortgage/{customerId}',
       
        config: {
            tags: ['api'],
            auth: false,
            validate: {
                params: {
                    customerId: Joi.string().token().lowercase()
                    //,group: Joi.string(),
                    //fields: Joi.string(),
                    //sort: Joi.string().default('_id'),
                    //limit: Joi.number().default(20),
                    //page: Joi.number().default(1)
                }
            },

        },
        handler: function (request, reply) {

            const query = {id:request.params.customerId};

            console.log('customer id:' + request.params.customerId)

            Mortgage.findByCustomerId(request.params.customerId, (err, results) => {

                if (err) {
                    return reply(err);
                }
                console.log("Error:" + err)
                reply(results);
            });
        }
    });

    next();
};


exports.register = function (server, options, next) {

    server.dependency(['hapi-mongo-models'], internals.applyRoutes);

    next();
};


exports.register.attributes = {
    name: 'mortgage'
};
