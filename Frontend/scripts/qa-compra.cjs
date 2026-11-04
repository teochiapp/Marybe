// node scripts/qa-compra.cjs <path-to-playwright> [base-url]
// All CMS requests and order creation are intercepted; no real order is sent.
const { chromium } = require(process.argv[2] || 'playwright');
const assert = require('node:assert/strict');
const baseURL = process.argv[3] || 'http://localhost:3000';
const product = { id: 1, documentId: 'test-product', nombre: 'Perfume prueba', marca: 'Marca', publicado: true, variantes: [
  { id: 11, id_original: 'V100', volumen: '100 ml', precio: 1000, stock: 8, sku_ean: 'SKU100', publicado: true },
  { id: 12, id_original: 'V200', volumen: '200 ml', precio: 2000, precio_oferta: 1500, stock: 3, sku_ean: 'SKU200', publicado: true },
] };

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    for (const width of [1440, 390]) for (const entry of ['catalogo', 'ficha']) {
      const context = await browser.newContext({ viewport: { width, height: 900 } });
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      let order;
      await page.route('**/api/**', async route => {
        const request = route.request();
        const pathname = new URL(request.url()).pathname;
        let data = [];
        if (pathname === '/api/productos') data = [product];
        if (pathname === '/api/configuracion-general') data = { costo_envio: 6000, envio_gratis_desde: 50000, mp_habilitado: false, transf_habilitado: false, ac_habilitado: false, ef_habilitado: true };
        if (pathname === '/api/pagina-sucursales') data = { sucursales: [{ provincia: 'Tucumán', direccion: 'Sucursal de prueba', ciudad: 'Tucumán', telefono: '1234' }] };
        if (request.method() !== 'GET') {
          assert.equal(pathname, '/api/pedidos-invitado', 'Unexpected write');
          order = request.postDataJSON();
          data = { numero_pedido: 'M-TEST' };
        }
        await route.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify({ data, meta: { pagination: { total: 1, pageCount: 1 } } }) });
      });
      await page.goto(`${baseURL}${entry === 'catalogo' ? '/tienda' : '/producto/1-perfume-prueba'}`);
      await page.getByRole('radio', { name: '200 ml', exact: true }).first().click();
      if (entry === 'catalogo') {
        await page.getByRole('button', { name: 'Agregar', exact: true }).first().click();
        const modal = page.getByRole('heading', { name: 'Agregar al carrito' }).locator('..');
        await modal.getByRole('button', { name: '+', exact: true }).click();
        await modal.getByRole('button', { name: 'Agregar al carrito', exact: true }).click();
      } else {
        await page.getByRole('button', { name: '+', exact: true }).filter({ visible: true }).first().click();
        await page.getByRole('button', { name: 'Agregar', exact: true }).filter({ visible: true }).first().click();
      }
      await page.getByRole('button', { name: 'Ir al carrito' }).click();
      await page.waitForURL('**/carrito');
      await page.getByRole('button', { name: '+', exact: true }).click();
      assert.equal(await page.getByRole('button', { name: '+', exact: true }).isDisabled(), true);
      await page.getByRole('button', { name: 'Continuar', exact: true }).click();
      await page.waitForURL('**/login');
      for (const [label, value] of [['Nombre', 'Ana'], ['Apellido', 'Pérez'], ['Email', 'ana@example.test'], ['Teléfono', '3851234567']]) await page.getByLabel(label, { exact: true }).fill(value);
      await page.getByRole('button', { name: 'Continuar como invitado' }).click();
      await page.waitForURL('**/envio');
      const delivery = entry === 'catalogo' ? 'domicilio' : 'sucursal';
      if (delivery === 'domicilio') {
        for (const [label, value] of [['Calle', 'Mitre'], ['Número / Depto', '123'], ['Código postal', '4200'], ['Ciudad', 'Ciudad'], ['Provincia', 'Tucumán']]) await page.getByLabel(label, { exact: true }).fill(value);
      } else {
        await page.getByText('Retiro por sucursal', { exact: true }).click();
        await page.getByLabel('Elegí la sucursal de retiro').selectOption({ label: 'Sucursal de prueba - Tucumán' });
      }
      await page.getByRole('button', { name: 'Ir a pagar' }).click();
      await page.waitForURL('**/pago');
      await page.getByRole('button', { name: 'Hacer pedido' }).click();
      await page.waitForURL('**/order-success');
      assert.equal(order.metodo_envio, delivery);
      assert.equal(order.total, delivery === 'domicilio' ? 10500 : 4500);
      assert.deepEqual(order.productos.map(item => [item.product.id, item.variant.id, item.variant.sku_ean, item.quantity, item.price]), [[1, 12, 'SKU200', 3, 1500]]);
      assert.equal((await page.evaluate(() => JSON.parse(localStorage.getItem('marybe_cart')))).length, 0);
      assert.deepEqual(errors, []);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'Horizontal overflow');
      console.log(`PASS ${entry} ${width}px ${delivery}: variante, cantidad, envío y pedido`);
      await context.close();
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
