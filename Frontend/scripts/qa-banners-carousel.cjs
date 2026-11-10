// Verifica el editor y el carrusel público con respuestas simuladas de Strapi.
const { chromium } = require(process.argv[2] || 'playwright');
const assert = require('node:assert/strict');
const base = process.argv[3] || 'http://localhost:3000';

const image = { id: 1, url: '/inicio/featured.webp', name: 'Imagen' };
const banner = (id, width, extra = {}) => ({ id, titulo: `Banner ${id}`, enlace: `/tienda?banner=${id}`, activo: true, imagen_desktop: image, ancho_porcentaje: width, ...extra });
const custom = [
  { __component: 'layout.fila-mixta', es_carrusel: true, diseno: { desktop: { columns: 2, gap: 16 } }, banners: [banner(1, 35), banner(2, 45), banner(3, 60), banner(4, 30, { activo: false }), banner(5, 30, { diseno: { desktop: { hidden: true } } })] },
  { __component: 'layout.fila-2-columnas', es_carrusel: true, diseno: { desktop: { columns: 2 } }, banners: [banner(6, 50)] },
  { __component: 'layout.fila-2-columnas', es_carrusel: false, diseno: { desktop: { columns: 2 } }, banners: [banner(7, 50), banner(8, 50)] },
];
const legacy = [{ __component: 'layout.fila-mixta', es_carrusel: true, banners: [banner(1, 35), banner(2, 45), banner(3, 60)] }];
let promotion = { documentId: 'qa-carousel', updatedAt: 'v1', titulo: 'Banners de prueba', seccion: 'Perfumería', Filas: custom };

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  let mode = 'custom';
  try {
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' });
    await context.addInitScript(() => localStorage.setItem('admin_jwt', 'qa-only-fixture-token'));
    await context.route('**/api/**', async route => {
      const url = new URL(route.request().url());
      if (url.pathname === '/api/banners-admin') return route.fulfill({ json: { data: { promotions: [promotion] } } });
      if (url.pathname === '/api/banners-admin/promociones/qa-carousel') {
        const body = route.request().postDataJSON();
        assert.equal(body.publish, false);
        promotion = { ...body.data, updatedAt: 'v2' };
        return route.fulfill({ json: { data: promotion } });
      }
      if (url.pathname === '/api/promociones-inicios') return route.fulfill({ json: { data: [{ Filas: mode === 'legacy' ? legacy : mode === 'legacyConfig' ? [{ ...legacy[0], config_carrusel: { autoplay: false, intervalo: 5, indicador: 'contador', vistaParcial: true } }] : custom }] } });
      return route.fulfill({ json: { data: [] } });
    });
    const page = await context.newPage();
    await page.goto(`${base}/editor-inicio-admin/banners`);
    await page.getByRole('combobox', { name: 'Plantilla de distribución' }).waitFor();
    assert.equal(await page.getByRole('combobox', { name: 'Tipo de presentación' }).inputValue(), 'carousel');
    assert.equal(await page.getByRole('spinbutton', { name: 'Porcentaje de Banner 2' }).inputValue(), '45');
    assert.equal(await page.getByRole('spinbutton', { name: 'Intervalo en segundos' }).inputValue(), '7');
    await page.getByLabel('Avance automático').uncheck();
    await page.getByRole('spinbutton', { name: 'Intervalo en segundos' }).fill('5');
    await page.getByRole('combobox', { name: 'Indicador' }).selectOption('puntos');
    await page.getByLabel('Mostrar parte del próximo banner').check();
    await page.getByRole('button', { name: 'Guardar borrador', exact: true }).click();
    await page.getByRole('status').filter({ hasText: 'Borrador guardado' }).waitFor();
    await page.reload();
    await page.getByRole('combobox', { name: 'Indicador' }).waitFor();
    assert.equal(await page.getByRole('combobox', { name: 'Indicador' }).inputValue(), 'puntos');
    assert.equal(await page.getByLabel('Avance automático').isChecked(), false);
    assert.equal(await page.getByRole('spinbutton', { name: 'Intervalo en segundos' }).inputValue(), '5');
    assert.equal(await page.getByLabel('Mostrar parte del próximo banner').isChecked(), true);
    await page.getByRole('button', { name: 'Vista previa', exact: true }).click();
    const dialog = page.getByRole('dialog', { name: 'Banners de prueba' });
    const preview = dialog.frameLocator('iframe');
    for (const device of ['Computadora', 'Tablet', 'Celular']) {
      await dialog.getByRole('button', { name: device, exact: true }).click();
      await preview.locator('.vb-track--carousel').first().waitFor();
      await preview.getByRole('button', { name: 'Banner siguiente' }).first().waitFor();
      assert.ok(await preview.getByRole('button', { name: /Ir a posición/ }).count() > 1);
      const secondDot = preview.getByRole('button', { name: 'Ir a posición 2' }).first();
      await secondDot.focus();
      await secondDot.press('Enter');
      await page.waitForFunction(() => document.querySelector('iframe[title="Vista previa limpia de banners"]')?.contentDocument?.querySelector('[aria-label="Ir a posición 2"]')?.getAttribute('aria-current') === 'true');
      assert.equal(await preview.locator('.vb-row').first().locator('.vb-cell:visible').count(), 3);
      assert.ok(await preview.getByRole('button', { name: /Ir a posición/ }).count() <= 3);
      if (device === 'Celular') {
        const widths = await preview.locator('.vb-track--carousel').first().evaluate(element => ({ track: element.clientWidth, banner: element.querySelector('.vb-cell').getBoundingClientRect().width }));
        assert.ok(widths.banner < widths.track * .95, `Debe verse parte del próximo banner: ${JSON.stringify(widths)}`);
      }
      assert.equal(await preview.locator('.vb-row').nth(1).locator('.banner-carousel-arrow').count(), 0);
      assert.equal(await preview.locator('.vb-row').nth(2).locator('.banner-carousel').count(), 0);
      await preview.locator('.vb-track--carousel').first().evaluate(element => { element.scrollLeft = 0; });
      await preview.getByRole('button', { name: 'Banner siguiente' }).first().click();
      await preview.locator('.vb-track--carousel').first().evaluate(element => { if (element.scrollLeft <= 0) throw new Error('El carrusel no avanzó'); });
    }
    const previewUrl = await dialog.locator('iframe').evaluate(frame => frame.contentWindow.location.href);
    await preview.locator('.vb-cover-link').first().click({ force: true });
    assert.equal(await dialog.locator('iframe').evaluate(frame => frame.contentWindow.location.href), previewUrl);
    await dialog.getByRole('button', { name: 'Volver al editor' }).click();

    for (mode of ['custom', 'legacy']) {
      await page.goto(`${base}/inicio`);
      const track = page.locator(mode === 'custom' ? '.vb-track--carousel' : '.banner-carousel-track').first();
      await track.waitFor();
      const carousel = track.locator('..');
      await carousel.getByRole('button', { name: 'Banner siguiente' }).waitFor();
      assert.equal(await track.evaluate(element => getComputedStyle(element).scrollbarWidth), 'none');
      await carousel.getByRole('button', { name: 'Banner siguiente' }).click();
      const firstPosition = await track.evaluate(element => element.scrollLeft);
      assert.ok(firstPosition > 0);
      await carousel.getByRole('button', { name: 'Banner siguiente' }).click();
      assert.ok(await track.evaluate(element => element.scrollLeft) > firstPosition);
      await track.evaluate(element => { element.scrollLeft = element.scrollWidth - element.clientWidth; });
      await carousel.getByRole('button', { name: 'Banner siguiente' }).click();
      assert.equal(await track.evaluate(element => element.scrollLeft), 0);
      await carousel.getByRole('button', { name: 'Banner anterior' }).click();
      assert.ok(await track.evaluate(element => element.scrollLeft) > 0);
      await track.evaluate(element => { element.scrollLeft = 0; });
      await track.focus();
      await track.press('ArrowRight');
      assert.ok(await track.evaluate(element => element.scrollLeft) > 0, `Navegación por teclado ${mode}`);
      await track.evaluate(element => { element.scrollLeft = 0; });
      const link = track.locator('a').first();
      const box = await link.boundingBox();
      await page.mouse.move(box.x + box.width * 0.6, box.y + 40);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width * 0.3, box.y + 40, { steps: 8 });
      await page.mouse.up();
      assert.match(new URL(page.url()).pathname, /^\/inicio\/?$/, `El arrastre ${mode} no debe abrir el enlace`);
      await track.evaluate(element => { element.scrollLeft = 0; });
      await link.click();
      await page.waitForURL('**/tienda?banner=1');
    }
    await page.setViewportSize({ width: 390, height: 844 });
    const client = await context.newCDPSession(page);
    await client.send('Emulation.setTouchEmulationEnabled', { enabled: true });
    for (mode of ['custom', 'legacy']) {
      await page.goto(`${base}/inicio`);
      const track = page.locator(mode === 'custom' ? '.vb-track--carousel' : '.banner-carousel-track').first();
      await track.waitFor();
      await track.scrollIntoViewIfNeeded();
      await track.evaluate(element => { element.scrollLeft = 0; });
      const box = await track.boundingBox();
      const y = Math.max(20, Math.min(800, box.y + Math.min(100, box.height / 2)));
      const point = x => ({ x, y, radiusX: 2, radiusY: 2, force: 1, id: 0 });
      await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [point(box.x + box.width * 0.9)] });
      for (const fraction of [0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1]) {
        await client.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [point(box.x + box.width * fraction)] });
      }
      await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      await page.waitForTimeout(500);
      const touchState = await track.evaluate(element => ({ left: element.scrollLeft, width: element.clientWidth, scrollWidth: element.scrollWidth, top: element.getBoundingClientRect().top, height: element.clientHeight }));
      assert.ok(touchState.left > 0, `Gesto táctil ${mode}: ${JSON.stringify(touchState)}`);
      assert.match(new URL(page.url()).pathname, /^\/inicio\/?$/);
      const beforeScroll = await page.evaluate(() => window.scrollY);
      const x = box.x + box.width / 2;
      await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y, id: 0 }] });
      for (const distance of [20, 40, 60, 80, 100, 120]) {
        await client.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y - distance, id: 0 }] });
      }
      await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      await page.waitForTimeout(300);
      assert.ok(await page.evaluate(() => window.scrollY) > beforeScroll, `Desplazamiento vertical ${mode}`);
    }
    await client.detach();
    mode = 'legacyConfig';
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(`${base}/inicio`);
    await page.locator('.banner-carousel-counter').first().waitFor();
    assert.match(await page.locator('.banner-carousel-counter').first().innerText(), /^1\s*\/\s*\d+$/);
    await page.getByRole('button', { name: 'Banner siguiente' }).first().click();
    await page.waitForFunction(() => document.querySelector('.banner-carousel-counter')?.textContent.trim().startsWith('2 /'));
    for (mode of ['custom', 'legacy']) {
      const autoplayPage = await context.newPage();
      await autoplayPage.emulateMedia({ reducedMotion: 'no-preference' });
      await autoplayPage.clock.install();
      await autoplayPage.goto(`${base}/inicio`);
      const autoplayTrack = autoplayPage.locator(mode === 'custom' ? '.vb-track--carousel' : '.banner-carousel-track').first();
      await autoplayTrack.waitFor();
      await autoplayTrack.evaluate(element => { element.scrollTo = options => { element.scrollLeft = options.left; }; });
      await autoplayPage.clock.fastForward(7500);
      assert.ok(await autoplayTrack.evaluate(element => element.scrollLeft) > 0, `El autoplay ${mode} avanza con movimiento habilitado`);
      await autoplayTrack.evaluate(element => { element.scrollLeft = 0; });
      await autoplayTrack.hover();
      await autoplayPage.clock.fastForward(14000);
      assert.equal(await autoplayTrack.evaluate(element => element.scrollLeft), 0, `El autoplay ${mode} se pausa durante la interacción`);
      await autoplayPage.mouse.move(0, 0);
      await autoplayPage.emulateMedia({ reducedMotion: 'reduce' });
      await autoplayPage.clock.fastForward(14000);
      assert.equal(await autoplayTrack.evaluate(element => element.scrollLeft), 0, `Movimiento reducido detiene el autoplay ${mode}`);
      await autoplayPage.close();
    }
    console.log('QA banners OK: editor y vista previa por dispositivo, grilla, carruseles personalizado e histórico, anchos, ocultos, flechas, extremos y clic frente a arrastre.');
    await context.close();
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
