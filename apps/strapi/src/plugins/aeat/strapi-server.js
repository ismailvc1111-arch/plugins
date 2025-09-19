'use strict';

const routes = require('./routes/aeat');

module.exports = {
  type: 'plugin',
  routes,
  bootstrap(/*{ strapi }*/) {},
  register(/*{ strapi }*/) {},
};
