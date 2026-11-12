// Browser QA with simulated media and CMS; it never uploads or publishes real content.
const { chromium } = require(process.argv[2] || 'playwright');
const assert = require('node:assert/strict');
const base = process.argv[3] || 'http://localhost:3011';

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    for (const type of ['video/mp4', 'video/webm']) {
      const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
      await context.addInitScript(() => localStorage.setItem('admin_jwt', 'qa-fixture-only'));
      const page = await context.newPage();
      const bytes = Buffer.from(await page.evaluate(async mime => {
        if (!MediaRecorder.isTypeSupported(mime)) throw new Error(`No se puede generar ${mime} en este navegador`);
        const canvas = document.createElement('canvas'); canvas.width = 320; canvas.height = 180;
        const ctx = canvas.getContext('2d');
        const stream = canvas.captureStream(15);
        const recorder = new MediaRecorder(stream, { mimeType: mime });
        const parts = [];
        recorder.ondataavailable = event => { if (event.data.size) parts.push(event.data); };
        const done = new Promise(resolve => { recorder.onstop = resolve; });
        recorder.start();
        const timer = setInterval(() => { ctx.fillStyle = '#5c0a0a'; ctx.fillRect(0, 0, 320, 180); ctx.fillStyle = 'white'; ctx.fillText('Marybe', 50, 80); }, 40);
        await new Promise(resolve => setTimeout(resolve, 900));
        clearInterval(timer); recorder.stop(); await done; stream.getTracks().forEach(track => track.stop());
        return Array.from(new Uint8Array(await new Blob(parts, { type: mime }).arrayBuffer()));
      }, type));
      assert(bytes.length > 100);
      const ext = type === 'video/mp4' ? 'mp4' : 'webm';
      const video = { id: 7, name: `qa.${ext}`, url: `/uploads/qa.${ext}`, mime: type, width: 320, height: 180 };
      const svg = { id: 8, name: 'mobile.svg', url: '/uploads/mobile.svg', mime: 'image/svg+xml' };
      let group = { documentId: 'qa-promo', updatedAt: 'v1', titulo: 'Prueba', seccion: 'Perfumería', Filas: [{ id: 1, __component: 'layout.fila-1-columna', diseno: {}, banners: [{ id: 2, titulo: 'Video prueba', imagen_desktop: svg, imagen_mobile: svg, diseno: { desktop: { height: 300 } } }] }] };
      let published = null;
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.route('**/uploads/qa.*', route => route.fulfill({ status: 200, contentType: type, headers: { 'access-control-allow-origin': '*' }, body: bytes }));
      await page.route('**/uploads/mobile.svg', route => route.fulfill({ contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180"><rect width="320" height="180" fill="#5c0a0a"/></svg>' }));
      await page.route('**/api/**', async route => {
        const url = new URL(route.request().url());
        if (url.pathname === '/api/banners-admin') return route.fulfill({ json: { data: { promotions: [group] } } });
        if (url.pathname === '/api/banners-admin/media') return route.fulfill({ json: { data: [svg] } });
        if (url.pathname === '/api/banners-admin/upload') return route.fulfill({ json: { data: [video] } });
        if (url.pathname.startsWith('/api/banners-admin/promociones/')) {
          const body = route.request().postDataJSON();
          group = { ...body.data, documentId: 'qa-promo', updatedAt: 'v2' };
          if (body.publish) published = group;
          return route.fulfill({ json: { data: group } });
        }
        if (url.pathname === '/api/promociones-inicios') return route.fulfill({ json: { data: published ? [published] : [] } });
        if (url.pathname === '/api/seccion-principal') return route.fulfill({ json: { data: { secciones: [], diseno_secciones: {} } } });
        if (url.pathname === '/api/ordenamiento-menu-header' || url.pathname === '/api/menu-lanzamientos-ofertas') return route.fulfill({ json: { data: {} } });
        return route.fulfill({ json: { data: [], meta: { pagination: { pageCount: 1, total: 0 } } } });
      });
      await page.goto(`${base}/banners-admin`);
      await page.getByRole('button', { name: 'Editar banner: Video prueba' }).click();
      await page.getByRole('button', { name: /Cambiar imagen o video/ }).click();
      const dialog = page.getByRole('dialog', { name: 'Biblioteca de imágenes y videos' });
      await dialog.locator('input[type=file]').setInputFiles({ name: `qa.${ext}`, mimeType: type, buffer: bytes });
      await page.getByLabel('Video seleccionado').waitFor();
      const frame = page.frameLocator('iframe[title="Vista previa de banners"]');
      const previewVideo = frame.locator('video.vb-video');
      await previewVideo.waitFor();
      await previewVideo.evaluate(element => new Promise((resolve, reject) => {
        if (element.readyState >= 2 && !element.paused) return resolve();
        element.addEventListener('playing', resolve, { once: true });
        element.addEventListener('error', () => reject(new Error('No se pudo reproducir el video de vista previa.')), { once: true });
        setTimeout(() => reject(new Error('El video no comenzó a reproducirse.')), 8000);
      }));
      await page.getByRole('button', { name: 'Celular', exact: true }).click();
      await frame.locator('img[src*="mobile.svg"]').waitFor();
      await page.getByRole('button', { name: 'Publicar en la tienda' }).click();
      await page.getByText(/Publicado\. Los cambios/).waitFor();
      assert.equal(published.Filas[0].banners[0].imagen_desktop.mime, type);
      await page.goto(`${base}/inicio?seccion=perfumeria`);
      const publicVideo = page.locator('video.vb-video').first();
      await publicVideo.waitFor();
      await publicVideo.evaluate(element => new Promise((resolve, reject) => {
        if (element.readyState >= 2 && !element.paused) return resolve();
        element.addEventListener('playing', resolve, { once: true });
        element.addEventListener('error', () => reject(new Error('No se pudo reproducir el video publicado.')), { once: true });
        setTimeout(() => reject(new Error('El video publicado no comenzó a reproducirse.')), 8000);
      }));
      await page.setViewportSize({ width: 390, height: 844 });
      await page.locator('.vb-banner img[src*="mobile.svg"]').first().waitFor();
      assert.deepEqual(errors, []);
      await context.close();
      console.log(`${type}: subida simulada, vista previa, reproducción y versión móvil verificadas.`);
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
