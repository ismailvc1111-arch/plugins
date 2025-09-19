'use strict';

const facturaeService = require('../../../plugins/aeat/services/facturae');
const pdfService = require('../../../plugins/aeat/services/pdf');
const queue = require('../../../plugins/aeat/services/queue');

module.exports = {
  async beforeUpdate(event) {
    const { data, where } = event.params;
    if (data.status === 'issued') {
      const current = await strapi.entityService.findOne('api::invoice.invoice', where.id, {
        populate: ['company', 'customer', 'lines'],
      });
      if (!current.number) {
        const next = await strapi.entityService.findMany('api::invoice.invoice', {
          filters: { company: current.company.id, series: data.series || current.series },
          sort: { number: 'desc' },
          limit: 1,
        });
        const nextNumber = next[0] ? next[0].number + 1 : 1;
        data.number = nextNumber;
        data.series = data.series || current.series || process.env.INVOICE_DEFAULT_SERIES || 'A';
        data.issueDate = data.issueDate || new Date().toISOString().slice(0, 10);
      }
      const invoice = await strapi.entityService.findOne('api::invoice.invoice', where.id, {
        populate: ['company', 'customer', 'lines'],
      });
      const { signed } = await facturaeService.generateAndSign(invoice);
      const { buffer, location } = await pdfService.generate(invoice);
      const uploadService = strapi.plugin('upload').service('upload');
      const facturaeUpload = await uploadService.upload({
        data: {
          fileInfo: {
            name: `${invoice.series}${invoice.number}.xml`,
            alternativeText: 'Facturae XML',
          },
        },
        files: {
          path: undefined,
          name: `${invoice.series}${invoice.number}.xml`,
          type: 'application/xml',
          size: Buffer.byteLength(signed),
          buffer: Buffer.from(signed),
        },
      });
      const pdfUpload = await uploadService.upload({
        data: {
          fileInfo: {
            name: `${invoice.series}${invoice.number}.pdf`,
            alternativeText: 'Factura PDF',
          },
        },
        files: {
          path: undefined,
          name: `${invoice.series}${invoice.number}.pdf`,
          type: 'application/pdf',
          size: buffer.length,
          buffer,
        },
      });
      data.facturaeUrl = facturaeUpload[0]?.url || location;
      data.pdfUrl = pdfUpload[0]?.url || location;
      data.siiState = 'pending';
      try {
        await queue.enqueueSii(where.id);
      } catch (error) {
        strapi.log.warn(`No se pudo encolar envío SII: ${error.message}`);
      }
    }
  },
};
