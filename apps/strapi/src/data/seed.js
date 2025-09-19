'use strict';

module.exports = async ({ strapi }) => {
  const companyName = process.env.COMPANY_NAME || '{{company_name}}';
  const companyTaxId = process.env.COMPANY_TAX_ID || '{{company_tax_id}}';
  const companyCountry = process.env.COMPANY_COUNTRY || '{{company_country}}';
  const defaultCurrency = process.env.INVOICE_DEFAULT_CURRENCY || '{{currency}}';
  const defaultSeries = process.env.INVOICE_DEFAULT_SERIES || '{{series_format}}';
  const defaultVat = Number(process.env.DEFAULT_VAT || '{{iva}}');

  const existing = await strapi.entityService.findMany('api::company.company', {
    filters: { taxId: companyTaxId },
  });

  if (existing.length === 0) {
    const company = await strapi.entityService.create('api::company.company', {
      data: {
        name: companyName,
        taxId: companyTaxId,
        country: companyCountry,
        address: 'Avenida de la Innovación 42, 28000 Madrid',
        currency: defaultCurrency,
        series: defaultSeries,
      },
    });

    const customer = await strapi.entityService.create('api::customer.customer', {
      data: {
        company: company.id,
        name: 'Cliente de Prueba',
        taxId: 'B12345678',
        country: 'ES',
        email: 'cliente@example.com',
        address: 'Calle Demo, 123',
      },
    });

    const product = await strapi.entityService.create('api::product.product', {
      data: {
        company: company.id,
        name: 'Servicio Consultoría',
        defaultTaxRate: defaultVat,
        unitPrice: 100,
      },
    });

    const invoice = await strapi.entityService.create('api::invoice.invoice', {
      data: {
        company: company.id,
        customer: customer.id,
        status: 'draft',
        series: defaultSeries,
        issueDate: new Date().toISOString().slice(0, 10),
        currency: defaultCurrency,
        subtotal: 100,
        taxTotal: (100 * defaultVat) / 100,
        total: 100 + (100 * defaultVat) / 100,
      },
    });

    await strapi.entityService.create('api::invoice-line.invoice-line', {
      data: {
        invoice: invoice.id,
        product: product.id,
        description: 'Servicio mensual',
        qty: 1,
        unitPrice: 100,
        taxRate: defaultVat,
        lineTotal: 100 + (100 * defaultVat) / 100,
      },
    });
  }
};
