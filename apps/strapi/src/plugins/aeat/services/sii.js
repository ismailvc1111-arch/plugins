'use strict';

const https = require('https');
const soap = require('soap');

const agent = new https.Agent({
  pfx: process.env.AEAT_P12_BASE64 ? Buffer.from(process.env.AEAT_P12_BASE64, 'base64') : undefined,
  passphrase: process.env.AEAT_P12_PASS,
  rejectUnauthorized: true,
});

const createClient = async () => {
  const wsdlUrl = process.env.AEAT_SII_WSDL;
  if (!wsdlUrl) {
    throw new Error('AEAT_SII_WSDL env var missing');
  }
  return soap.createClientAsync(wsdlUrl, {
    wsdl_options: {
      agent,
    },
  });
};

const buildPayload = (invoice) => {
  const subtotal = Number(invoice.subtotal);
  const taxTotal = Number(invoice.taxTotal);
  const total = Number(invoice.total);
  return {
    Cabecera: {
      IDVersionSii: '1.1',
      Titular: {
        NIF: invoice.company.taxId,
        NombreRazon: invoice.company.name,
      },
      TipoComunicacion: 'A0',
    },
    RegistroLRFacturasEmitidas: [
      {
        PeriodoLiquidacion: {
          Ejercicio: new Date(invoice.issueDate).getFullYear().toString(),
          Periodo: String(new Date(invoice.issueDate).getMonth() + 1).padStart(2, '0'),
        },
        IDFactura: {
          NumSerieFacturaEmisor: `${invoice.series}${invoice.number}`,
          FechaExpedicionFacturaEmisor: invoice.issueDate,
        },
        FacturaExpedida: {
          Contraparte: {
            NombreRazon: invoice.customer.name,
            NIF: invoice.customer.taxId,
          },
          TipoFactura: 'F1',
          ClaveRegimenEspecialOTrascendencia: '01',
          DescripcionOperacion: invoice.lines.map((l) => l.description).join(', '),
          CuotaRepercutida: [
            {
              TipoImpositivo: invoice.lines[0] ? Number(invoice.lines[0].taxRate).toFixed(2) : '0.00',
              BaseImponible: subtotal.toFixed(2),
              CuotaRepercutida: taxTotal.toFixed(2),
            },
          ],
          ImporteTotal: total.toFixed(2),
        },
      },
    ],
  };
};

module.exports = {
  async sendInvoice(invoice) {
    const endpoint = process.env.AEAT_SII_ENDPOINT;
    if (!endpoint) {
      throw new Error('AEAT_SII_ENDPOINT env var missing');
    }
    const client = await createClient();
    client.setEndpoint(endpoint);
    const payload = buildPayload(invoice);
    const [result] = await client.SuministroLRFacturasEmitidasAsync(
      { SuministroLRFacturasEmitidas: payload },
      {
        wsdl_headers: {
          'Content-Type': 'text/xml; charset=utf-8',
        },
        wsdl_options: {
          agent,
        },
      }
    );
    return result;
  },
};
