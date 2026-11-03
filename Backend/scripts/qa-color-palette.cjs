// Exercise the actual registered admin input in a controlled form; no CMS writes.
// node scripts/qa-color-palette.cjs <path-to-playwright-package>
const { chromium } = require(process.argv[2] || 'playwright');
const { build } = require('esbuild');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const output = path.join(root, '.tmp/color-palette-qa');

(async () => {
  const result = await build({
    stdin: { resolveDir: root, loader: 'jsx', contents: `
      import React, {useState} from 'react';
      import {createRoot} from 'react-dom/client';
      import admin from './src/admin/app';
      let registration;
      admin.register({customFields: {register: value => registration = value}});
      if (registration.name !== 'paleta-color' || registration.type !== 'string') throw Error('Registro incorrecto');
      const {default: Input} = await registration.components.Input();
      function Form() {
        const [values, setValues] = useState(() => JSON.parse(localStorage.getItem('qa-palette') || 'null') || {'items.0.color_texto': null, 'items.1.color_texto': null, 'secciones.0.color_titulo_cursiva': '#123456', 'secciones.0.color_titulo_normal': null});
        const [disabled, setDisabled] = useState(false);
        const [error, setError] = useState(false);
        return <main style={{maxWidth: 1000, margin: 'auto', padding: 24, fontFamily: 'Arial', color: '#32324D'}}>
          <h1>Paleta de colores · Marybe</h1><p>Prueba local del mismo selector registrado en Strapi.</p>
          <form onSubmit={event => {event.preventDefault(); localStorage.setItem('qa-palette', JSON.stringify(values));}}>
            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 24}}>
              {Object.keys(values).map((name, i) => <section key={name} data-testid={'field-' + i}>
                <h2 style={{fontSize: 16}}>{i < 2 ? 'Mensaje ' + (i + 1) : 'Título de Inicio'}</h2>
                <Input name={name} value={values[name]} disabled={disabled} error={error ? 'Revisá el color seleccionado.' : undefined} onChange={event => setValues(previous => ({...previous, [event.target.name]: event.target.value}))} />
              </section>)}
            </div>
            <button type="submit" style={{marginTop:20}}>Guardar simulación</button>
          </form>
          <button onClick={() => setDisabled(!disabled)}>Alternar solo lectura</button>
          <button onClick={() => setError(!error)}>Alternar error</button>
          <output data-testid="values" hidden>{JSON.stringify(values)}</output>
        </main>;
      }
      createRoot(document.getElementById('root')).render(<Form/>);
    ` },
    bundle: true, format: 'esm', write: false, define: { 'process.env.NODE_ENV': '"production"' },
  });
  const server = http.createServer((request, response) => {
    if (request.url === '/bundle.js') { response.setHeader('Content-Type', 'text/javascript'); response.end(result.outputFiles[0].contents); }
    else { response.setHeader('Content-Type', 'text/html'); response.end('<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>QA Paleta Marybe</title><body style="margin:0;background:#F6F6F9"><div id="root"></div><script type="module" src="/bundle.js"></script></body></html>'); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    fs.mkdirSync(output, { recursive: true });
    const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`http://127.0.0.1:${server.address().port}`);
    const first = page.getByTestId('field-0');
    const second = page.getByTestId('field-1');
    const title = page.getByTestId('field-2');
    await first.getByRole('status').waitFor();
    assert.equal(await first.getByRole('status').innerText(), 'Color original');
    assert.equal(await first.getByRole('button', { pressed: true }).count(), 0);
    assert.equal(await title.getByRole('status').innerText(), 'Color personalizado');
    await first.getByRole('button', { name: 'Bordó Marybe', exact: true }).click();
    await second.getByRole('button', { name: 'Azul', exact: true }).focus();
    await page.keyboard.press('Space');
    let values = JSON.parse(await page.getByTestId('values').textContent());
    assert.equal(values['items.0.color_texto'], '#560203');
    assert.equal(values['items.1.color_texto'], '#1E88E5');
    assert.equal(await first.getByRole('button', { name: 'Bordó Marybe', exact: true }).getAttribute('aria-pressed'), 'true');
    await title.locator('input[type=color]').evaluate(element => {
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
      setter.call(element, '#12ab34');
      element.dispatchEvent(new Event('input', {bubbles:true}));
      element.dispatchEvent(new Event('change', {bubbles:true}));
    });
    values = JSON.parse(await page.getByTestId('values').textContent());
    assert.equal(values['secciones.0.color_titulo_cursiva'], '#12AB34');
    await page.getByRole('button', { name: 'Guardar simulación' }).click();
    await page.reload();
    await first.getByRole('status').waitFor();
    assert.equal(await first.getByRole('status').innerText(), 'Bordó Marybe');
    assert.equal(await second.getByRole('status').innerText(), 'Azul');
    await first.getByRole('button', { name: 'Restaurar color original' }).click();
    values = JSON.parse(await page.getByTestId('values').textContent());
    assert.equal(values['items.0.color_texto'], null);
    assert.equal(values['items.1.color_texto'], '#1E88E5');
    await page.getByRole('button', { name: 'Alternar solo lectura' }).click();
    assert.equal(await first.getByRole('button', { name: 'Rojo', exact: true }).isDisabled(), true);
    assert.equal(await first.locator('input[type=color]').isDisabled(), true);
    await page.getByRole('button', { name: 'Alternar solo lectura' }).click();
    await page.getByRole('button', { name: 'Alternar error' }).click();
    assert.equal(await first.getByRole('alert').innerText(), 'Revisá el color seleccionado.');
    await page.getByRole('button', { name: 'Alternar error' }).click();
    await page.screenshot({ path: path.join(output, 'paleta-desktop.png'), fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({ path: path.join(output, 'paleta-mobile.png'), fullPage: true });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    assert.deepEqual(errors, []);
    console.log('PASS: registro y carga del selector real, colores por ítem, teclado, color personalizado, guardado/restauración simulados, solo lectura, errores y vista móvil.');
  } finally { await browser.close(); await new Promise(resolve => server.close(resolve)); }
})().catch(error => { console.error(error); process.exitCode = 1; });
