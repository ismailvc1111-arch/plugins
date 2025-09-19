module.exports = {
  register() {},
  async bootstrap({ strapi }) {
    const queue = require('./plugins/aeat/services/queue');
    queue.initialize(strapi);
    const seed = require('./data/seed');
    await seed({ strapi });
  },
};
