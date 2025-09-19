'use strict';

const PDFDocument = require('pdfkit');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const hasS3 = Boolean(process.env.AWS_S3_BUCKET && process.env.AWS_REGION);
const s3 = hasS3
  ? new S3Client({
      region: process.env.AWS_REGION,
      credentials: process.env.AWS_ACCESS_KEY_ID
        ? {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          }
        : undefined,
    })
  : null;

const buildPdfBuffer = async (invoice) =>
  new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    const chunks = [];
    doc.fontSize(16).text(invoice.company.name, { align: 'right' });
    doc.fontSize(10).text(`NIF: ${invoice.company.taxId}`, { align: 'right' });
    doc.moveDown();
    doc.fontSize(12).text(`Factura ${invoice.series}${invoice.number}`);
    doc.text(`Fecha: ${invoice.issueDate}`);
    doc.moveDown();
    doc.text(`Cliente: ${invoice.customer.name}`);
    doc.text(`NIF: ${invoice.customer.taxId}`);
    doc.moveDown();

    doc.font('Helvetica-Bold');
    doc.text('Descripción', 40);
    doc.text('Cantidad', 280);
    doc.text('Precio', 340);
    doc.text('IVA', 400);
    doc.text('Total', 460);
    doc.moveDown();
    doc.font('Helvetica');

    invoice.lines.forEach((line) => {
      const base = Number(line.qty) * Number(line.unitPrice);
      const tax = (base * Number(line.taxRate)) / 100;
      const total = base + tax;
      const y = doc.y;
      doc.text(line.description, 40, y);
      doc.text(Number(line.qty).toFixed(2), 280, y);
      doc.text(Number(line.unitPrice).toFixed(2), 340, y);
      doc.text(`${Number(line.taxRate).toFixed(2)}%`, 400, y);
      doc.text(total.toFixed(2), 460, y);
      doc.moveDown();
    });

    doc.moveDown();
    doc.text(`Subtotal: ${Number(invoice.subtotal).toFixed(2)} ${invoice.currency}`, { align: 'right' });
    doc.text(`IVA: ${Number(invoice.taxTotal).toFixed(2)} ${invoice.currency}`, { align: 'right' });
    doc.text(`Total: ${Number(invoice.total).toFixed(2)} ${invoice.currency}`, { align: 'right' });

    doc.end();
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
  });

const uploadPdf = async (invoice, buffer) => {
  if (!s3) {
    return null;
  }
  const key = `invoices/${invoice.company.id}/${invoice.series}${invoice.number}.pdf`;
  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: 'application/pdf',
    })
  );
  return `s3://${process.env.AWS_S3_BUCKET}/${key}`;
};

module.exports = {
  async generate(invoice) {
    const buffer = await buildPdfBuffer(invoice);
    const location = await uploadPdf(invoice, buffer);
    return { buffer, location };
  },
};
