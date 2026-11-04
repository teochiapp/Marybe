// Chrome review with mocked CMS/email and an isolated static Strapi admin build.
// node scripts/qa-logo.cjs <path-to-playwright-package> [frontend-url]
const { chromium } = require(process.argv[2] || 'playwright');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const baseURL = process.argv[3] || 'http://localhost:3000';
const output = path.resolve(__dirname, '../tmp/logo-qa');
const root = path.resolve(__dirname, '../../Backend/build');
const types = { '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.svg': 'image/svg+xml', '.html': 'text/html', '.woff2': 'font/woff2' };

async function inspect(image, expectedWidth) {
  await image.evaluate(img => img.decode());
  const size = await image.evaluate(img => { const rect = img.getBoundingClientRect(); return { width: rect.width, height: rect.height, naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight }; });
  assert.equal(size.naturalWidth, 629); assert.equal(size.naturalHeight, 168);
  assert.ok(Math.abs(size.width / size.height - 629 / 168) < .02, `Distorted logo: ${JSON.stringify(size)}`);
  if (expectedWidth) assert.ok(Math.abs(size.width - expectedWidth) < 1, JSON.stringify(size));
  return size;
}

(async () => {
  fs.mkdirSync(output, { recursive: true });
  const server = http.createServer((req, res) => {
    const pathname = new URL(req.url, 'http://localhost').pathname;
    let relative = pathname.replace(/^\/admin\/?/, '');
    if (!path.extname(relative)) relative = 'index.html';
    const file = path.resolve(root, relative);
    if (!file.startsWith(root + path.sep) || !fs.existsSync(file)) { res.writeHead(404); res.end(); return; }
    res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream'); fs.createReadStream(file).pipe(res);
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const adminURL = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    for (const width of [1440, 768, 390, 320]) {
      const page = await browser.newPage({ viewport: { width, height: 1000 } });
      await page.route('**/api/**', route => { assert.equal(route.request().method(), 'GET'); return route.fulfill({ json: { data: [] } }); });
      await page.goto(baseURL + '/recuperar-contrasena?code=qa');
      const nav = page.locator('nav img[src="/logo-marybe.png"]');
      await inspect(nav, width > 768 ? 200 : Math.min(180, Math.max(128, width * .43)));
      await inspect(page.locator('footer img[src="/logo-marybe.png"]'), 200);
      await inspect(page.locator('img[src="/logo-marybe.png"]').nth(1));
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      if (width <= 768) {
        const logo = await nav.boundingBox(); const search = await page.getByRole('button', { name: 'Buscar', exact: true }).boundingBox();
        assert.ok(logo.x + logo.width <= search.x, `Logo overlaps search at ${width}px`);
        await page.getByRole('button', { name: 'Menú', exact: true }).click();
        await page.getByRole('button', { name: 'Cerrar', exact: true }).evaluate(async button => { await Promise.all(button.parentElement.parentElement.getAnimations().map(animation => animation.finished)); });
        const drawer = page.locator('img[src="/logo-marybe.png"]').filter({ visible: true });
        const expectedDrawerWidth = Math.min(192, Math.min(width * .8, 320) - 112);
        const logos = await drawer.all();
        let found = false;
        for (const logo of logos) { const bounds = await logo.boundingBox(); if (Math.abs(bounds.width - expectedDrawerWidth) < 1) { await inspect(logo, expectedDrawerWidth); assert.ok(bounds.x >= 0 && bounds.x + bounds.width <= width); found = true; } }
        assert.ok(found, 'Drawer logo was not rendered');
      }
      await page.screenshot({ path: path.join(output, `web-${width}.png`), fullPage: true });
      console.log(`PASS web ${width}px: header, footer, recovery and mobile drawer`); await page.close();
    }
    for (const width of [1440, 390]) {
      const page = await browser.newPage({ viewport: { width, height: 1000 } });
      await page.addInitScript(() => localStorage.setItem('admin_jwt', 'qa-only-token'));
      await page.route('**/api/**', route => { assert.equal(route.request().method(), 'GET'); return route.fulfill({ json: { data: route.request().url().includes('/api/banners-admin') ? { promotions: [], main: {} } : [] } }); });
      await page.goto(baseURL + '/banners-admin');
      await inspect(page.locator('.ba-brand img'), width > 800 ? 122 : 100);
      await page.screenshot({ path: path.join(output, `banners-${width}.png`), fullPage: true });
      console.log(`PASS Banners Admin ${width}px: proportional logo`); await page.close();
    }
    for (const width of [1440, 390]) {
      const page = await browser.newPage({ viewport: { width, height: 1000 } });
      await page.route('https://marybe.surcodes.com/logo-marybe.png', route => route.fulfill({ path: path.resolve(__dirname, '../public/logo-marybe.png'), contentType: 'image/png' }));
      const email = require('../../Backend/src/api/correo/services/templates/reset-contrasena')('https://example.test/reset');
      await page.setContent(email);
      const logo = page.locator('img[alt="Marybe"]');
      const bounds = await inspect(logo);
      assert.ok(bounds.width >= 300 && bounds.width <= 323);
      console.log(`PASS email ${width}px: new artwork, natural ratio and responsive width`); await page.close();
    }
    for (const width of [1440, 390]) {
      const page = await browser.newPage({ viewport: { width, height: 1000 } });
      page.on('pageerror', error => console.error('Strapi runtime:', error.stack));
      await page.route('**/*', route => {
        const url = new URL(route.request().url());
        if (url.pathname === '/admin/init') return route.fulfill({ json: { data: { hasAdmin: true, uuid: 'qa', menuLogo: null, authLogo: null, isEE: false, features: [] } } });
        if (url.pathname === '/admin/project-type') return route.fulfill({ json: { data: { isEE: false, isTrial: false, features: [], flags: {}, ai: {} } } });
        if (url.pathname === '/admin/project-settings') return route.fulfill({ json: {} });
        if (url.origin === adminURL && (path.extname(url.pathname) || url.pathname.includes('/auth/'))) return route.continue();
        return route.fulfill({ json: { data: {} } });
      });
      await page.goto(adminURL + '/admin/auth/login');
      await page.screenshot({ path: path.join(output, `strapi-loading-${width}.png`), fullPage: true });
      const logo = page.locator('main img[aria-hidden="true"]');
      await logo.waitFor(); await inspect(logo);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      await page.screenshot({ path: path.join(output, `strapi-login-${width}.png`), fullPage: true });
      console.log(`PASS Strapi login ${width}px: built admin asset and aspect ratio`); await page.close();
    }
  } finally { await browser.close(); await new Promise(resolve => server.close(resolve)); }
})().catch(error => { console.error(error); process.exitCode = 1; });
