import { test, expect } from '@playwright/test';

const shouldMock = process.env.E2E_MOCK === '1';

(shouldMock ? test : test.skip)('create, issue and send invoice', async ({ page }) => {
  await page.route('**/api/invoices', (route, request) => {
    if (request.method() === 'POST') {
      return route.fulfill({
        json: { data: { id: 42 } },
      });
    }
    return route.continue();
  });

  await page.route('**/api/invoices/42?**', async (route) => {
    await route.fulfill({
      json: {
        data: {
          id: 42,
          status: 'draft',
          series: 'A',
          number: null,
          issueDate: '2024-01-01',
          subtotal: 100,
          taxTotal: 21,
          total: 121,
          currency: 'EUR',
          facturaeUrl: null,
          pdfUrl: null,
          siiState: 'pending',
          customer: { id: 1, name: 'Cliente Demo' },
          lines: [
            { id: 1, description: 'Servicio', qty: 1, unitPrice: 100, taxRate: 21 },
          ],
        },
      },
    });
  });

  await page.route('**/api/customers', async (route) => {
    await route.fulfill({ json: { data: [{ id: 1, attributes: { name: 'Cliente Demo' } }] } });
  });

  await page.route('**/api/invoices/42/issue', async (route) => {
    await route.fulfill({ json: { data: { status: 'issued' } } });
  });

  await page.route('**/api/invoices/42/pdf', async (route) => {
    await route.fulfill({ json: { url: 'https://example.com/pdf' } });
  });

  await page.route('**/api/invoices/42/send/sii', async (route) => {
    await route.fulfill({ json: { ok: true } });
  });

  await page.goto('/invoices/new');
  await expect(page).toHaveURL(/invoices\/42/);

  await page.getByRole('button', { name: 'Emitir (S)' }).click();
  await page.getByRole('button', { name: 'PDF (P)' }).click();

  await page.goto('/invoices/42');
  await page.getByRole('button', { name: 'Enviar SII' }).click();
  await expect(page.getByText('Estado: draft')).toBeVisible();
});
