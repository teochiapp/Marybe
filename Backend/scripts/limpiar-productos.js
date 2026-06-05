/**
 * limpiar-productos.js
 * Elimina TODOS los productos existentes de Strapi.
 *
 * Uso: node Backend/scripts/limpiar-productos.js
 * ⚠ Requiere que el Backend de Strapi esté corriendo en localhost:1337
 *    y que la API tenga permisos públicos o uses un token.
 */

const https = require('https');
const http  = require('http');

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const API_TOKEN  = process.env.STRAPI_API_TOKEN || '';

function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(STRAPI_URL + path);
    const isHttps = url.protocol === 'https:';
    const lib = isHttps ? https : http;

    const opts = {
      hostname: url.hostname,
      port:     url.port || (isHttps ? 443 : 80),
      path:     url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(API_TOKEN ? { Authorization: `Bearer ${API_TOKEN}` } : {}),
      },
    };

    const req = lib.request(opts, res => {
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function main() {
  console.log(`🔌 Conectando a Strapi en ${STRAPI_URL}...`);

  // Obtener todos los documentIds
  let page = 1;
  const pageSize = 100;
  const allDocs = [];

  while (true) {
    const res = await request('GET', `/api/productos?pagination[page]=${page}&pagination[pageSize]=${pageSize}&fields=id`);
    if (res.status !== 200) {
      console.error(`❌ Error al listar productos: HTTP ${res.status}`);
      if (res.status === 403) {
        console.error('   → Asegurate de que la ruta GET /api/productos tenga permisos públicos en Strapi.');
      }
      process.exit(1);
    }

    const items = res.body?.data || [];
    if (items.length === 0) break;

    items.forEach(item => {
      const docId = item.documentId || item.id;
      if (docId) allDocs.push(docId);
    });

    const total = res.body?.meta?.pagination?.total || 0;
    console.log(`   Página ${page}: ${items.length} productos (total: ${total})`);

    if (allDocs.length >= total) break;
    page++;
  }

  if (allDocs.length === 0) {
    console.log('ℹ No hay productos para eliminar.');
    return;
  }

  console.log(`\n🗑 Eliminando ${allDocs.length} productos...`);
  let deleted = 0;
  let errors  = 0;

  for (const docId of allDocs) {
    const res = await request('DELETE', `/api/productos/${docId}`);
    if (res.status === 200 || res.status === 204 || res.status === 201) {
      deleted++;
      if (deleted % 10 === 0) console.log(`   ✅ Eliminados: ${deleted}/${allDocs.length}`);
    } else {
      errors++;
      console.error(`   ❌ Error al eliminar ${docId}: HTTP ${res.status}`);
    }
  }

  console.log(`\n✅ Listo. Eliminados: ${deleted} | Errores: ${errors}`);
}

main().catch(err => {
  console.error('❌ Error fatal:', err.message);
  process.exit(1);
});
