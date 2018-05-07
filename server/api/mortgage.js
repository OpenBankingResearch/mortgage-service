'use strict';
const Boom = require('boom');
const Joi = require('joi');
const Config = require('../../config');


const internals = {};


internals.applyRoutes = function (server, next) {

    const Mortgage = server.plugins['hapi-mongo-models'].Mortgage;


    server.route({
        method: 'GET',
        path: '/mortgage/{customerCode}',
        config: {
            auth: {
                //strategy: Config.get('/authStrategy'),
            },
            validate: {
                query: {
                    customerCode: Joi.string().token().lowercase(),
                    date: Joi.date()
                    //,group: Joi.string(),
                    //fields: Joi.string(),
                    //sort: Joi.string().default('_id'),
                    //limit: Joi.number().default(20),
                    //page: Joi.number().default(1)
                }
            },

        },
        handler: function (request, reply) {

            const query = {};

            Mortgage.find(query, (err, results) => {

                if (err) {
                    return reply(err);
                }

                reply(results);
            });
        }
    });

    next();
};


exports.register = function (server, options, next) {

    server.dependency(['auth', 'hapi-mongo-models'], internals.applyRoutes);

    next();
};


exports.register.attributes = {
    name: 'mortgage'
};
