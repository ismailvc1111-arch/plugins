'use strict';

const { SignedXml } = require('xml-crypto');
const forge = require('node-forge');
const { create } = require('xmlbuilder2');

const FACTURAE_NS = 'http://www.facturae.es/Facturae/2009/v3.2.2/Facturae';

const loadP12 = () => {
  const p12Base64 = process.env.AEAT_P12_BASE64;
  const password = process.env.AEAT_P12_PASS;
  if (!p12Base64) {
    throw new Error('AEAT_P12_BASE64 env var missing');
  }
  const p12Der = forge.util.decode64(p12Base64);
  const p12Asn1 = forge.asn1.fromDer(p12Der);
  const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, password);
  const keyBags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag })[forge.pki.oids.pkcs8ShroudedKeyBag];
  const certBags = p12.getBags({ bagType: forge.pki.oids.certBag })[forge.pki.oids.certBag];
  if (!keyBags?.length || !certBags?.length) {
    throw new Error('No se encontró clave privada o certificado en el P12');
  }
  const privateKey = forge.pki.privateKeyToPem(keyBags[0].key);
  const certificate = forge.pki.certificateToPem(certBags[0].cert);
  return { privateKey, certificate };
};

const buildFacturaeXML = (invoice) => {
  const doc = create({
    version: '1.0',
    encoding: 'UTF-8',
  }).ele('Facturae', { xmlns: FACTURAE_NS, 'xmlns:ds': 'http://www.w3.org/2000/09/xmldsig#' });

  const header = doc.ele('FileHeader');
  header.ele('SchemaVersion').txt('3.2.2');
  header.ele('Modality').txt('I');
  header.ele('InvoiceIssuerType').txt('EM');
  header.ele('Batch').ele('BatchIdentifier').txt(`${invoice.series}${invoice.number}`);

  const parties = doc.ele('Parties');
  const seller = parties.ele('SellerParty');
  seller.ele('TaxIdentification').ele('PersonTypeCode').txt('J');
  seller.ele('TaxIdentification').ele('ResidenceTypeCode').txt('R');
  seller.ele('TaxIdentification').ele('TaxIdentificationNumber').txt(invoice.company.taxId);
  const sellerLegal = seller.ele('LegalEntity');
  sellerLegal.ele('CorporateName').txt(invoice.company.name);
  sellerLegal.ele('AddressInSpain').ele('Address').txt(invoice.company.address || '');

  const buyer = parties.ele('BuyerParty');
  buyer.ele('TaxIdentification').ele('PersonTypeCode').txt('J');
  buyer.ele('TaxIdentification').ele('ResidenceTypeCode').txt('R');
  buyer.ele('TaxIdentification').ele('TaxIdentificationNumber').txt(invoice.customer.taxId);
  const buyerLegal = buyer.ele('LegalEntity');
  buyerLegal.ele('CorporateName').txt(invoice.customer.name);

  const invoicesNode = doc.ele('Invoices');
  const invoiceNode = invoicesNode.ele('Invoice');
  invoiceNode.ele('InvoiceHeader').ele('InvoiceNumber').txt(`${invoice.series}${invoice.number}`);
  invoiceNode.ele('InvoiceIssueData').ele('InvoiceIssueDate').txt(invoice.issueDate);

  const totals = invoice.lines.reduce(
    (acc, line) => {
      const qty = Number(line.qty);
      const unitPrice = Number(line.unitPrice);
      const taxRate = Number(line.taxRate);
      const base = qty * unitPrice;
      const tax = (base * taxRate) / 100;
      return {
        base: acc.base + base,
        tax: acc.tax + tax,
        total: acc.total + base + tax,
      };
    },
    { base: 0, tax: 0, total: 0 }
  );

  const itemsNode = invoiceNode.ele('Items');
  invoice.lines.forEach((line) => {
    const qty = Number(line.qty);
    const unitPrice = Number(line.unitPrice);
    const taxRate = Number(line.taxRate);
    const base = qty * unitPrice;
    const tax = (base * taxRate) / 100;
    const item = itemsNode.ele('InvoiceLine');
    item.ele('ItemDescription').txt(line.description);
    item.ele('Quantity').txt(qty.toFixed(2));
    item.ele('UnitPriceWithoutTax').txt(unitPrice.toFixed(2));
    item.ele('TotalCost').txt(base.toFixed(2));
    const taxes = item.ele('TaxesOutputs').ele('Tax');
    taxes.ele('TaxTypeCode').txt('01');
    taxes.ele('TaxRate').txt(taxRate.toFixed(2));
    taxes.ele('TaxableBase').ele('TotalAmount').txt(base.toFixed(2));
    taxes.ele('TaxAmount').ele('TotalAmount').txt(tax.toFixed(2));
  });

  const totalsNode = invoiceNode.ele('Totals');
  totalsNode.ele('TotalGrossAmount').txt(totals.base.toFixed(2));
  totalsNode.ele('TotalGeneralTaxes').ele('TotalTaxOutputs').txt(totals.tax.toFixed(2));
  totalsNode.ele('TotalInvoiceAmount').txt(totals.total.toFixed(2));

  return doc.end({ prettyPrint: true });
};

const signFacturaeXML = (xml) => {
  const { privateKey, certificate } = loadP12();
  const sig = new SignedXml();
  sig.addReference("//*[local-name(.)='Facturae']", [
    'http://www.w3.org/2000/09/xmldsig#enveloped-signature',
  ]);
  sig.signingKey = privateKey;
  sig.keyInfoProvider = {
    getKeyInfo() {
      return `<ds:X509Data><ds:X509Certificate>${certificate
        .replace('-----BEGIN CERTIFICATE-----', '')
        .replace('-----END CERTIFICATE-----', '')
        .replace(/\n/g, '')}</ds:X509Certificate></ds:X509Data>`;
    },
  };
  sig.computeSignature(xml);
  return sig.getSignedXml();
};

module.exports = {
  async generateAndSign(invoice) {
    const xml = buildFacturaeXML(invoice);
    const signed = signFacturaeXML(xml);
    return { xml, signed };
  },
};
