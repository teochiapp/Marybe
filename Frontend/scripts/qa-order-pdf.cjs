// Verify the real order modal and print CSS with fixture data; no CMS writes.
// node scripts/qa-order-pdf.cjs <path-to-playwright-package> [base-url]
const { chromium } = require(process.argv[2] || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const output = path.resolve(__dirname, '../tmp/pdfs');
const baseUrl = process.argv[3] || 'http://localhost:3000';
const products = [
  { producto: '1 MILLION EDT', marca: 'Paco Rabanne', variante: '200 ml', sku: '3349668566372', cantidad: 1, precio_unitario: 225000, subtotal: 225000, id_producto: 101, id_variante_original: 'VAR-200' },
  { producto: '1 MILLION ELIXIR PARFUM INTENSE', marca: 'Paco Rabanne', variante: '100 ml', sku: '3349668600304', cantidad: 2, precio_unitario: 189000, subtotal: 378000, id_producto: 102, id_variante_original: 'VAR-100' },
  { producto: 'CREMA CORPORAL HIDRATANTE', marca: 'Marybe', variante: '250 ml', sku: 'SKU-CREMA-250', cantidad: 1, precio_unitario: 15000, subtotal: 15000, id_producto: 103, id_variante_original: 'VAR-250' },
];
const base = { id: 77, documentId: 'qa-pedido-57374', numero_pedido: 'M-57374', createdAt: '2026-11-03T13:30:00Z', updatedAt: '2026-11-03T14:15:00Z', estado: 'Enviado', metodo_pago: 'Transferencia bancaria', cliente_email: 'cliente.prueba@example.com', es_invitado: true, codigo_seguimiento: 'AR-QA-57374', productos: products, total: 618000, gift_cards_generadas: ['GC-QA-57374'], direccion_envio: { nombre: 'Ana Pérez', telefono: '385 555 0100', metodo_envio: 'domicilio', calle: 'Belgrano', numero: '123', piso: '2 B', ciudad: 'Santiago del Estero', provincia: 'Santiago del Estero', cp: '4200', nota: 'Entregar por la tarde' } };
const many = { ...base, numero_pedido: 'M-57375', documentId: 'qa-pedido-57375', productos: Array.from({ length: 30 }, (_, i) => ({ ...products[i % products.length], producto: `Artículo de prueba ${String(i + 1).padStart(2, '0')} - ${products[i % products.length].producto}`, sku: `SKU-QA-${String(i + 1).padStart(2, '0')}` })), total: 6180000, direccion_envio: { nombre: 'Ana Pérez', telefono: '385 555 0100', metodo_envio: 'retiro_sucursal', sucursal: 'Absalón Rojas 55', provincia: 'Santiago del Estero', telefono_sucursal: '385 555 0200' } };

(async () => {
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    await context.addInitScript(() => {
      localStorage.setItem('admin_jwt', 'qa-only-token');
      window.__printCalls = 0;
      window.print = () => { window.__printCalls++; };
    });
    const page = await context.newPage();
    let order = base;
    await page.route('**/api/**', async route => {
      assert.equal(route.request().method(), 'GET', 'La revisión no debe modificar pedidos');
      return route.fulfill({ json: { data: route.request().url().includes('/api/admin-pedidos') ? [order] : [], meta: { pagination: { pageCount: 1 } } } });
    });
    for (const [name, fixture] of [['comprobante-diseno', base], ['comprobante-varias-paginas', many]]) {
      order = fixture;
      await page.goto(`${baseUrl}/pedidos-admin`);
      // The quick-view print action must still open the same complete order.
      await page.getByRole('button', { name: `Descargar pedido ${order.numero_pedido} en PDF` }).click();
      await page.locator('.pa-print-order').waitFor();
      await page.waitForFunction(() => window.__printCalls === 1);
      await page.locator('.pa-print-logo').evaluate(image => image.decode());
      await page.evaluate(() => document.fonts.ready);
      assert.equal(await page.locator('.pa-receipt-table tbody tr').count(), order.productos.length);
      for (const product of order.productos) {
        assert.ok((await page.locator('.pa-print-order').innerText()).includes(product.sku));
      }
      await page.locator('.pa-print-button').click();
      assert.equal(await page.evaluate(() => window.__printCalls), 2);
      await page.emulateMedia({ media: 'print' });
      await page.pdf({ path: path.join(output, `${name}.pdf`), format: 'A4', printBackground: true, preferCSSPageSize: true });
      await page.emulateMedia({ media: 'screen' });
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({ path: path.join(output, 'detalle-mobile.png') });
    assert.ok(await page.evaluate(() => {
      const modal = document.querySelector('.pa-modal');
      return modal.scrollWidth <= modal.clientWidth + 1;
    }));
    fs.writeFileSync(path.join(output, 'expected.json'), JSON.stringify({ 'comprobante-diseno': base, 'comprobante-varias-paginas': many }, null, 2));
    console.log('PASS: ambos accesos a imprimir, datos y SKUs conservados, PDFs A4 corto/largo generados y modal móvil sin desborde.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
