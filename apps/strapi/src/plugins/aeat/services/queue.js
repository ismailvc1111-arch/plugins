'use strict';

const { Queue, Worker } = require('bullmq');
const sii = require('./sii');

const redisUrl = process.env.REDIS_URL;
const connection = redisUrl
  ? { connection: { url: redisUrl } }
  : process.env.NODE_ENV === 'production'
  ? { connection: { host: '127.0.0.1', port: 6379 } }
  : null;

let queue;

const initialize = (strapi) => {
  if (!connection) {
    strapi.log.warn('BullMQ deshabilitado: configure REDIS_URL para colas SII');
    return;
  }
  queue = new Queue('aeat:sii', connection);

  new Worker(
    'aeat:sii',
    async (job) => {
      const invoiceId = job.data.invoiceId;
      const invoice = await strapi.entityService.findOne('api::invoice.invoice', invoiceId, {
        populate: ['company', 'customer', 'lines'],
      });
      const result = await sii.sendInvoice(invoice);
      await strapi.entityService.create('api::event.event', {
        data: {
          invoice: invoiceId,
          type: 'sii.sent',
          payload: result,
        },
      });
      await strapi.entityService.update('api::invoice.invoice', invoiceId, {
        data: {
          siiState: result?.EstadoEnvio || 'sent',
        },
      });
    },
    connection
  );
};

const enqueueSii = async (invoiceId) => {
  if (!queue) {
    const invoice = await strapi.entityService.findOne('api::invoice.invoice', invoiceId, {
      populate: ['company', 'customer', 'lines'],
    });
    const result = await sii.sendInvoice(invoice);
    await strapi.entityService.create('api::event.event', {
      data: {
        invoice: invoiceId,
        type: 'sii.sent',
        payload: result,
      },
    });
    await strapi.entityService.update('api::invoice.invoice', invoiceId, {
      data: {
        siiState: result?.EstadoEnvio || 'sent',
      },
    });
    return;
  }
  await queue.add('send', { invoiceId }, { attempts: 3, backoff: { type: 'exponential', delay: 30000 } });
};

module.exports = { initialize, enqueueSii };
