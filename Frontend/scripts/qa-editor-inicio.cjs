// Verificación en navegador del Editor de Inicio con un CMS simulado. Nunca guarda ni publica datos reales.
// node scripts/qa-editor-inicio.cjs <path-to-playwright-package> [base-url]
const { chromium } = require(process.argv[2] || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const baseUrl = process.argv[3] || 'http://localhost:3000';
const output = path.resolve(__dirname, '../tmp/editor-inicio-qa');
const JWT = 'qa-only-admin-token';
const SECTIONS = [
  ['banners', 'Banners'],
  ['seccion-destacada', 'Sección Destacada'],
  ['categorias', 'Categorías'],
  ['categoria-destacada-1', 'Categoría Destacada (1)'],
  ['ofertas', 'Ofertas'],
  ['descuentos', 'Descuentos'],
  ['categoria-destacada-2', 'Categoría Destacada (2)'],
  ['beneficios', 'Beneficios'],
  ['gift-card', 'Gift Card'],
  ['proximos-eventos', 'Próximos Eventos'],
];
const group = { documentId: 'qa-promo', updatedAt: 'v1', titulo: 'Campaña QA', seccion: 'Perfumería', Filas: [{ id: 1, __component: 'layout.fila-1-columna', diseno: { desktop: { columns: 1 } }, banners: [{ id: 2, titulo: 'Banner QA', imagen_desktop: { id: 3, url: '/inicio/giftcard.webp' }, diseno: { desktop: { height: 420 } } }] }] };

const destacadaArea = { published: { titulo_cursiva: 'Lo nuevo', titulo_normal: 'en Marybe', color_titulo_cursiva: '', color_titulo_normal: '', subtitulo: 'Intensidad, seducción y carácter en un solo lugar.', imagen_desktop: { id: 3, url: '/inicio/featured.webp' }, imagen_mobile: null, banners: [], productos: [] }, draft: null };
const destacada = { version: 'v1', exists: true, areas: { perfumeria: destacadaArea, hogar: destacadaArea }, products: {} };
const PENDING = SECTIONS.filter(([id]) => !['banners', 'seccion-destacada', 'categorias', 'categoria-destacada-1', 'ofertas'].includes(id));

const noOverflow = page => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);

async function mockApi(page, log) {
  await page.route('**/api/**', async route => {
    const request = route.request();
    const url = new URL(request.url());
    log.push({ method: request.method(), path: url.pathname, auth: request.headers().authorization || '' });
    if (url.pathname === '/api/importacion-admin/login') {
      const body = request.postDataJSON();
      if (body.identifier === 'admin@marybe.com' && body.password === 'correcta') return route.fulfill({ json: { jwt: JWT } });
      return route.fulfill({ status: 400, json: { error: { message: 'Credenciales inválidas' } } });
    }
    if (url.pathname === '/api/destacada-admin') {
      if (request.headers().authorization !== `Bearer ${JWT}`) return route.fulfill({ status: 401, json: { error: { message: 'No autorizado' } } });
      return route.fulfill({ json: { data: destacada } });
    }
    if (url.pathname === '/api/destacada-admin/productos') return route.fulfill({ json: { data: [] } });
    if (url.pathname.startsWith('/api/banners-admin')) {
      if (request.headers().authorization !== `Bearer ${JWT}`) return route.fulfill({ status: 401, json: { error: { message: 'No autorizado' } } });
      if (url.pathname === '/api/banners-admin') return route.fulfill({ json: { data: { promotions: [group] } } });
      assert.fail(`El QA no debe guardar ni consultar ${url.pathname}`);
    }
    return route.fulfill({ json: { data: [] } });
  });
}

async function expectSelector(page) {
  await page.getByRole('heading', { level: 1, name: '¿Qué querés modificar hoy?' }).waitFor();
  const cards = page.getByRole('list', { name: 'Secciones de la página de inicio' }).getByRole('link');
  assert.equal(await cards.count(), 10);
  return cards;
}

(async () => {
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch(process.env.QA_CHROME_CHANNEL ? { channel: process.env.QA_CHROME_CHANNEL } : {});
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 960 } });
    const page = await context.newPage();
    const errors = [];
    const log = [];
    page.on('pageerror', error => errors.push(error.message));
    await mockApi(page, log);

    // Acceso directo sin sesión: solo se ve el login y no se consulta la API administrativa.
    await page.goto(`${baseUrl}/editor-inicio-admin/banners`);
    await page.getByRole('button', { name: 'Iniciar sesión' }).waitFor();
    assert.equal(await page.getByText('¿Qué querés modificar hoy?').count(), 0);
    assert.equal(await page.getByRole('spinbutton', { name: 'Alto', exact: true }).count(), 0);
    assert.equal(log.filter(entry => entry.path.startsWith('/api/banners-admin')).length, 0);
    await page.goto(`${baseUrl}/editor-inicio-admin/ofertas`);
    await page.getByRole('button', { name: 'Iniciar sesión' }).waitFor();
    assert.equal(await page.getByText('Editor próximamente disponible').count(), 0);
    assert.equal(await page.locator('footer').count(), 0, 'El editor no muestra el footer de la tienda');
    await page.screenshot({ path: path.join(output, 'login.png'), fullPage: true });

    // Credenciales: rechazo y acceso con las credenciales administrativas existentes.
    await page.goto(`${baseUrl}/editor-inicio-admin`);
    await page.getByLabel('Email administrador').fill('admin@marybe.com');
    await page.getByLabel('Contraseña', { exact: true }).fill('incorrecta');
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();
    await page.getByRole('alert').filter({ hasText: 'Credenciales inválidas' }).waitFor();
    await page.getByLabel('Contraseña', { exact: true }).fill('correcta');
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();
    const cards = await expectSelector(page);
    assert.equal(await page.evaluate(() => localStorage.getItem('admin_jwt')), JWT);
    assert.deepEqual(await cards.evaluateAll(links => links.map(link => link.getAttribute('aria-label'))), SECTIONS.map(([, title]) => title));
    await page.screenshot({ path: path.join(output, 'selector-desktop.png'), fullPage: true });

    // Cada sección pendiente abre su vista temporal y permite volver.
    // Sección Destacada abre su editor visual.
    await page.getByRole('link', { name: 'Sección Destacada', exact: true }).click();
    await page.waitForURL(`${baseUrl}/editor-inicio-admin/seccion-destacada`);
    await page.getByRole('heading', { level: 1, name: 'Sección Destacada' }).waitFor();
    await page.frameLocator('iframe[title="Vista previa de la Sección Destacada"]').getByText('Lo nuevo').waitFor();
    await page.getByRole('button', { name: '← Editor de Inicio' }).click();
    await expectSelector(page);

    for (const [id, title] of PENDING) {
      await page.getByRole('link', { name: title, exact: true }).click();
      await page.waitForURL(`${baseUrl}/editor-inicio-admin/${id}`);
      await page.getByRole('heading', { level: 1, name: title }).waitFor();
      await page.getByText('Editor próximamente disponible').waitFor();
      if (id === 'beneficios') await page.screenshot({ path: path.join(output, 'placeholder-desktop.png'), fullPage: true });
      await page.getByRole('link', { name: 'Volver al selector', exact: true }).click();
      await expectSelector(page);
    }

    // Recarga y navegación directa con sesión activa.
    await page.goto(`${baseUrl}/editor-inicio-admin/categoria-destacada-2`);
    await page.getByRole('heading', { level: 1, name: 'Categoría Destacada (2)' }).waitFor();
    await page.reload();
    await page.getByRole('heading', { level: 1, name: 'Categoría Destacada (2)' }).waitFor();
    await page.getByRole('link', { name: 'Editor de Inicio', exact: true }).click();
    await expectSelector(page);
    await page.goto(`${baseUrl}/editor-inicio-admin/no-existe`);
    await page.waitForURL(`${baseUrl}/editor-inicio-admin`);
    await expectSelector(page);
    await page.goto(`${baseUrl}/editor-inicio-admin/`);
    await expectSelector(page);

    // Banners abre el editor existente con el mismo token y vuelve al selector.
    await page.getByRole('link', { name: 'Banners', exact: true }).click();
    await page.waitForURL(`${baseUrl}/editor-inicio-admin/banners`);
    await page.getByRole('spinbutton', { name: 'Alto', exact: true }).waitFor();
    assert.ok(log.some(entry => entry.path === '/api/banners-admin' && entry.auth === `Bearer ${JWT}`));
    await page.getByRole('heading', { name: 'Página de Inicio' }).waitFor();
    await page.screenshot({ path: path.join(output, 'banners-integrado.png') });
    await page.reload();
    await page.getByRole('spinbutton', { name: 'Alto', exact: true }).waitFor();
    await page.getByRole('button', { name: '← Editor de Inicio' }).click();
    await expectSelector(page);

    // Con cambios sin guardar, volver pide confirmación.
    await page.getByRole('link', { name: 'Banners', exact: true }).click();
    await page.getByRole('spinbutton', { name: 'Alto', exact: true }).fill('500');
    page.once('dialog', dialog => dialog.dismiss());
    await page.getByRole('button', { name: '← Editor de Inicio' }).click();
    assert.ok(page.url().endsWith('/editor-inicio-admin/banners'));
    page.once('dialog', dialog => dialog.accept());
    await page.getByRole('button', { name: '← Editor de Inicio' }).click();
    await expectSelector(page);

    // /banners-admin sigue funcionando por separado con la misma sesión.
    await page.goto(`${baseUrl}/banners-admin`);
    await page.getByRole('spinbutton', { name: 'Alto', exact: true }).waitFor();
    assert.equal(await page.getByRole('button', { name: '← Editor de Inicio' }).count(), 0);

    // Responsive.
    for (const [name, viewport] of [['phone', { width: 390, height: 844 }], ['tablet', { width: 820, height: 1180 }]]) {
      await page.setViewportSize(viewport);
      await page.goto(`${baseUrl}/editor-inicio-admin`);
      await expectSelector(page);
      assert.ok(await noOverflow(page), `El selector no debe desbordarse en ${name}`);
      await page.screenshot({ path: path.join(output, `selector-${name}.png`), fullPage: true });
      await page.goto(`${baseUrl}/editor-inicio-admin/gift-card`);
      await page.getByText('Editor próximamente disponible').waitFor();
      assert.ok(await noOverflow(page), `La vista temporal no debe desbordarse en ${name}`);
      await page.screenshot({ path: path.join(output, `placeholder-${name}.png`), fullPage: true });
    }
    await page.setViewportSize({ width: 1440, height: 960 });

    // Cierre de sesión desde el selector y desde el editor de banners.
    await page.goto(`${baseUrl}/editor-inicio-admin/beneficios`);
    await page.getByRole('button', { name: 'Cerrar sesión' }).click();
    await page.getByRole('button', { name: 'Iniciar sesión' }).waitFor();
    assert.equal(await page.evaluate(() => localStorage.getItem('admin_jwt')), null);
    await page.goto(`${baseUrl}/editor-inicio-admin/banners`);
    await page.getByRole('button', { name: 'Iniciar sesión' }).waitFor();
    await page.getByLabel('Email administrador').fill('admin@marybe.com');
    await page.getByLabel('Contraseña', { exact: true }).fill('correcta');
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();
    await page.getByRole('spinbutton', { name: 'Alto', exact: true }).waitFor();
    await page.getByText('Más opciones').click();
    await page.getByRole('button', { name: 'Salir', exact: true }).click();
    await page.getByText('Editor de Inicio', { exact: true }).waitFor();
    await page.getByRole('button', { name: 'Iniciar sesión' }).waitFor();
    assert.equal(await page.evaluate(() => localStorage.getItem('admin_jwt')), null);

    assert.deepEqual(errors, []);

    // La landing pública conserva su estructura (header y footer de la tienda).
    await page.goto(`${baseUrl}/inicio`);
    await page.locator('footer').first().waitFor();
    console.log('Browser QA OK: login, acceso directo protegido, 10 secciones en orden, vistas temporales, recarga, rutas inválidas, banners integrado, confirmación de cambios, /banners-admin, responsive y cierre de sesión.');
    console.log(output);
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
