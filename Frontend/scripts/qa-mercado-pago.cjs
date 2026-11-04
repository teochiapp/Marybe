// node scripts/qa-mercado-pago.cjs <path-to-playwright-package> [base-url]
// Mercado Pago, CMS, stock and email endpoints are simulated. No real payments.
const { chromium } = require(process.argv[2] || 'playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const baseURL = process.argv[3] || 'http://localhost:3000';
const output = path.resolve(__dirname, '../tmp/mercado-pago-qa');

(async () => {
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    for (const width of [1440, 390]) {
      for (const scenario of ['aborted', 'pending', 'approved', 'network-error']) {
        const context = await browser.newContext({ viewport: { width, height: 900 } });
        const page = await context.newPage();
        const errors = []; page.on('pageerror', error => errors.push(error.message));
        let checks = 0;
        await page.route('**/api/**', async route => {
          const request = route.request();
          if (new URL(request.url()).pathname === '/api/mercado-pago/consultar-pago') {
            assert.equal(request.method(), 'POST');
            assert.equal(request.postDataJSON().externalReference, 'M-ABC123');
            assert.equal(request.postDataJSON().checkoutToken, 'qa-only-token'); checks++;
            const pagado = scenario === 'approved';
            return route.fulfill({ status: scenario === 'network-error' ? 503 : 200, contentType: 'application/json', body: JSON.stringify({ reference: 'M-ABC123', status: pagado ? 'approved' : scenario, pagado, estado: pagado ? 'Procesando' : scenario === 'aborted' ? 'Abortado' : 'Pendiente de pago' }) });
          }
          assert.equal(request.method(), 'GET', 'Unexpected write outside the simulated payment check');
          return route.fulfill({ contentType: 'application/json', body: JSON.stringify({ data: [] }) });
        });
        await context.addInitScript(() => {
          const cartItems = [{ cartId: 'qa', product: { id: 1, nombre: 'Perfume de prueba', portada: { url: '/placeholder.png', local: true } }, price: 1000, quantity: 2 }];
          localStorage.setItem('marybe_cart', JSON.stringify(cartItems));
          sessionStorage.setItem('mp_pending_order', JSON.stringify({ externalReference: 'M-ABC123', checkoutToken: 'qa-only-token', cartItems, cartTotal: 2000, paymentMethod: 'mercadopago', isGuest: true, email: 'qa@example.test', savedAddress: { metodo_envio: 'sucursal', sucursal: 'Local QA', provincia: 'Tucumán' } }));
        });
        const endpoint = scenario === 'aborted' ? '/order-error?reference=M-ABC123' : '/order-success?status=approved&payment_id=null&reference=M-ABC123';
        await page.goto(baseURL + endpoint);
        const heading = scenario === 'aborted' ? 'Pago abortado' : scenario === 'pending' ? 'Pago pendiente de confirmación' : scenario === 'approved' ? 'Pedido confirmado! M-ABC123' : 'No pudimos verificar el pago';
        await page.getByRole('heading', { name: heading, exact: true }).waitFor();
        if (scenario === 'approved') await page.waitForFunction(() => JSON.parse(localStorage.getItem('marybe_cart')).length === 0);
        else assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('marybe_cart')).length), 1);
        assert.ok(checks >= 1); assert.deepEqual(errors, []);
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
        await page.screenshot({ path: path.join(output, `${scenario}-${width}.png`), fullPage: true });
        console.log(`PASS ${scenario} ${width}px: verified result, cart and no runtime errors`);
        await context.close();
      }
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
