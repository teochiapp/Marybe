// Local browser QA with a simulated CMS; never writes production data.
const { chromium } = require(process.argv[2] || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const base = process.argv[3] || 'http://localhost:3011';
const output = path.resolve(__dirname, '../tmp/composicion-qa');
const defaults = {
  perfumeria: ['banners', 'seccion-destacada', 'categorias', 'categoria-destacada-1', 'ofertas', 'descuentos', 'categoria-destacada-2', 'beneficios', 'gift-card', 'proximos-eventos', 'descubri-mas'],
  hogar: ['banners', 'ofertas', 'seccion-destacada', 'categorias', 'categoria-destacada-1', 'descuentos', 'categoria-destacada-2', 'beneficios', 'gift-card', 'proximos-eventos', 'descubri-mas'],
};

(async () => {
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    for (const mobile of [false, true]) {
      let version = 1;
      const areas = Object.fromEntries(Object.entries(defaults).map(([area, orden]) => [area, { published: { orden, ocultos: [] }, draft: null }]));
      const snapshot = () => ({ version: String(version), areas });
      const context = await browser.newContext({ viewport: mobile ? { width: 390, height: 844 } : { width: 1280, height: 800 }, isMobile: mobile, hasTouch: mobile });
      await context.addInitScript(() => localStorage.setItem('admin_jwt', 'qa-fixture-only'));
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.route('**/api/**', async route => {
        const url = new URL(route.request().url());
        if (url.pathname.startsWith('/api/secciones-inicio-admin/composicion')) {
          if (route.request().method() === 'PUT') {
            const body = route.request().postDataJSON();
            if (body.version !== String(version)) return route.fulfill({ status: 409, json: { error: { message: 'Versión anterior.' } } });
            const area = url.pathname.split('/').pop();
            if (body.publish) { areas[area].published = body.data; areas[area].draft = null; }
            else areas[area].draft = body.data;
            version++;
          }
          return route.fulfill({ json: { data: snapshot() } });
        }
        if (url.pathname === '/api/seccion-principal') return route.fulfill({ json: { data: { composicion_inicio: Object.fromEntries(Object.entries(areas).map(([area, value]) => [area, value.published])), secciones: [], diseno_secciones: {} } } });
        if (url.pathname === '/api/ordenamiento-menu-header') return route.fulfill({ json: { data: {} } });
        if (url.pathname === '/api/menu-lanzamientos-ofertas') return route.fulfill({ json: { data: {} } });
        return route.fulfill({ json: { data: [], meta: { pagination: { pageCount: 1, total: 0 } } } });
      });
      await page.goto(`${base}/editor-inicio-admin`);
      await page.getByRole('button', { name: 'Mover Banners', exact: true }).waitFor();
      const rows = page.locator('[data-composition-id]');
      assert.equal(await rows.count(), 11);
      await page.screenshot({ path: path.join(output, mobile ? 'mobile-header.png' : 'notebook-header.png') });
      await rows.first().scrollIntoViewIfNeeded();
      await page.evaluate(() => window.scrollBy(0, 180));
      const handle = page.getByRole('button', { name: 'Mover Banners', exact: true });
      const from = await handle.boundingBox();
      const destination = await rows.nth(mobile ? 1 : 2).boundingBox();
      let cdp;
      if (mobile) {
        cdp = await context.newCDPSession(page);
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: from.x + from.width / 2, y: from.y + from.height / 2 }] });
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: destination.x + 40, y: destination.y + destination.height / 2 }] });
      } else {
        await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
        await page.mouse.down();
        await page.mouse.move(destination.x + 40, destination.y + destination.height / 2, { steps: 8 });
      }
      await page.locator('[data-drop="true"]').waitFor();
      await page.screenshot({ path: path.join(output, mobile ? 'mobile-drag.png' : 'notebook-drag.png') });
      if (mobile) await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      else await page.mouse.up();
      await page.waitForFunction(index => document.querySelectorAll('[data-composition-id]')[index].dataset.compositionId === 'banners', mobile ? 1 : 2);
      await page.getByRole('button', { name: 'Deshacer', exact: true }).click();
      assert.equal(await rows.first().getAttribute('data-composition-id'), 'banners');
      await handle.focus();
      await page.keyboard.press('ArrowDown');
      assert.equal(await rows.nth(1).getAttribute('data-composition-id'), 'banners');
      await page.getByRole('button', { name: 'Ocultar Banners', exact: true }).click();
      await page.getByRole('button', { name: 'Hogar', exact: true }).click();
      assert.equal(await rows.first().getAttribute('data-composition-id'), 'banners');
      await page.getByRole('button', { name: 'Perfumería', exact: true }).click();
      await page.getByRole('button', { name: 'Mostrar Banners', exact: true }).waitFor();
      // Enter an individual editor and return without losing local composition.
      await page.locator('[data-composition-id="banners"]').getByRole('link', { name: 'Editar', exact: true }).click();
      await page.getByRole('button', { name: /Editor de Inicio/ }).click();
      await page.getByRole('button', { name: 'Mostrar Banners', exact: true }).waitFor();
      assert.equal(await rows.nth(1).getAttribute('data-composition-id'), 'banners');
      await page.getByRole('button', { name: 'Guardar borrador', exact: true }).click();
      await page.getByText('Borrador guardado.', { exact: true }).waitFor();
      assert.deepEqual(areas.perfumeria.published.ocultos, []);
      await page.getByRole('button', { name: 'Publicar', exact: true }).click();
      await page.getByText('Composición publicada.', { exact: true }).first().waitFor();
      assert.deepEqual(areas.perfumeria.published.ocultos, ['banners']);
      await page.getByRole('button', { name: 'Vista previa', exact: true }).click();
      const preview = page.frameLocator('iframe[title="Vista previa de Inicio"]');
      await preview.locator('[data-inicio-area="perfumeria"]').waitFor();
      assert.equal(await preview.locator('[data-inicio-block="banners"]').count(), 0);
      await page.getByRole('button', { name: 'Vista previa', exact: true }).click();
      await page.screenshot({ path: path.join(output, mobile ? 'mobile-editor.png' : 'notebook-editor.png'), fullPage: true });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true);
      // All blocks hidden: public Inicio renders none and an anchor has a valid fallback.
      areas.hogar.published = { orden: defaults.hogar, ocultos: defaults.hogar };
      await page.goto(`${base}/inicio?seccion=hogar`);
      await page.locator('[data-inicio-ready="true"]').waitFor();
      assert.equal(await page.locator('[data-inicio-block]').count(), 0);
      await page.goto(`${base}/inicio?seccion=hogar#seccion-eventos-hogar`);
      await page.waitForURL('**/contacto');
      assert.deepEqual(errors, []);
      await context.close();
      console.log(`${mobile ? 'Mobile touch' : 'Notebook mouse'}: drag, keyboard, visibility, draft, publication, overflow and hidden-anchor fallback passed.`);
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
