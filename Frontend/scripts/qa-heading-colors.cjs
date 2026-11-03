// node scripts/qa-heading-colors.cjs <path-to-playwright-package> [base-url]
// All CMS responses are mocked; this script never writes actual content.
const { chromium } = require(process.argv[2] || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const baseUrl = process.argv[3] || 'http://localhost:3000';
const output = path.resolve(__dirname, '../tmp/heading-colors-qa');

(async () => {
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const page = await browser.newPage();
    let configured = false;
    const colors = configured => configured ? { color_titulo_cursiva: '#F4A6C0', color_titulo_normal: '#FFD166' } : { color_titulo_cursiva: '', color_titulo_normal: null };
    await page.route('**/api/**', async route => {
      assert.equal(route.request().method(), 'GET', 'La revisión debe ser solo de lectura');
      const url = new URL(route.request().url());
      let data = [];
      if (url.pathname === '/api/seccion-principal') {
        data = {
          secciones: ['Perfumeria', 'Hogar'].map(seccion => ({ seccion, titulo_cursiva: 'Lo nuevo', titulo_normal: `en Marybe ${seccion}`, ...colors(configured) })),
          descuento_perfumeria: { titulo_cursiva: 'Descuentos', titulo_normal: 'de Miércoles Perfumería', ...colors(configured) },
          descuento_hogar: { titulo_cursiva: 'Descuentos', titulo_normal: 'de Miércoles Hogar', ...colors(configured) },
        };
      }
      if (url.pathname === '/api/menu-barra-superior') data = { items: [
        { texto: 'Retirá gratis en tu sucursal', enlace: '/sucursales', icono: 'estrella', color_texto: configured ? '#FFD166' : '' },
        { texto: 'Envíos a todo el país', enlace: '/envios', icono: 'estrella', color_texto: configured ? '#F4A6C0' : '' },
        { texto: 'Sucursales Marybe', enlace: '/sucursales', icono: 'pin' },
      ] };
      if (url.pathname === '/api/banners-home') data = {};
      await route.fulfill({ json: { data } });
    });
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const area of ['perfumeria', 'hogar']) {
        const baseline = [];
        for (configured of [false, true]) {
          await page.goto(`${baseUrl}/?seccion=${area}`);
          await page.getByRole('heading', { name: `Lo nuevo en Marybe ${area === 'hogar' ? 'Hogar' : 'Perfumeria'}` }).waitFor();
          const top = page.getByText('Retirá gratis en tu sucursal', { exact: true });
          await page.waitForFunction(expected => [...document.querySelectorAll('a')].filter(element => element.textContent.trim() === 'Retirá gratis en tu sucursal').every(element => getComputedStyle(element).color === expected), configured ? 'rgb(255, 209, 102)' : 'rgb(255, 255, 255)');
          const topColors = await top.evaluateAll(elements => elements.map(element => getComputedStyle(element).color));
          assert.equal(topColors.length, 3);
          topColors.forEach(color => assert.equal(color, configured ? 'rgb(255, 209, 102)' : 'rgb(255, 255, 255)'));
          const secondColors = await page.getByText('Envíos a todo el país', { exact: true }).evaluateAll(elements => elements.map(element => getComputedStyle(element).color));
          secondColors.forEach(color => assert.equal(color, configured ? 'rgb(244, 166, 192)' : 'rgb(255, 255, 255)'));
          if (configured) await page.screenshot({ path: path.join(output, `${area}-${width}-nuevo.png`) });

          const discount = page.getByRole('heading', { name: `Descuentos de Miércoles ${area === 'hogar' ? 'Hogar' : 'Perfumería'}` });
          for (let i = 0; i < 40 && !(await discount.count()); i++) {
            await page.mouse.wheel(0, 650);
            await page.waitForTimeout(100);
          }
          await discount.waitFor();
          const headings = page.locator('h2').filter({ has: page.locator('.italic-text') });
          const values = await headings.evaluateAll(elements => elements.map(element => [...element.querySelectorAll('span')].map(span => ({ color: getComputedStyle(span).color, inline: span.style.color }))));
          assert.equal(values.length, 2);
          if (!configured) {
            baseline.push(...values);
            values.flat().forEach(value => assert.equal(value.inline, ''));
            assert.equal(values[0][0].color, 'rgb(255, 255, 255)');
            assert.equal(values[1][0].color, 'rgb(255, 255, 255)');
            assert.equal(values[1][1].color, 'rgb(255, 255, 255)');
          } else {
            values.forEach(parts => assert.deepEqual(parts.map(part => part.color), ['rgb(244, 166, 192)', 'rgb(255, 209, 102)']));
            assert.notDeepEqual(values, baseline);
            await discount.evaluate(element => element.scrollIntoView({ block: 'center', behavior: 'instant' }));
            await page.waitForTimeout(1000); // Allow the existing scroll-entry animation to finish.
            assert.ok(await discount.isVisible());
            await page.screenshot({ path: path.join(output, `${area}-${width}-descuentos.png`) });
          }
        }
      }
    }
    console.log('PASS: colores y estilos originales en Perfumería/Hogar, títulos/barra superior, escritorio y celular. Sin escrituras al CMS.');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
