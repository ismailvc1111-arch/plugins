'use strict';

const queue = require('../services/queue');

module.exports = {
  async sendSii(ctx) {
    const { invoiceId } = ctx.params;
    await queue.enqueueSii(invoiceId);
    ctx.body = { ok: true };
  },
};
