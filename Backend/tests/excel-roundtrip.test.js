'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const ExcelJS = require('exceljs');
const jwt = require('jsonwebtoken');

const importar = require('../src/api/importacion-admin/services/importacion-admin')();
const exportarGeneral = require('../src/api/exportacion-admin/services/exportacion-admin')();
const exportarProveedor = require('../src/api/exportacion-proveedores-admin/services/exportacion-proveedores-admin')();
const PRODUCTO = 'api::producto.producto';
const CATEGORIA = 'api::categoria.categoria';
const { TAXONOMY } = require('../src/utils/excel-utils');

function fixture(options = {}) {
  const product = {
    id: 1, documentId: 'doc-p2', id_original: 'P2', sku: 'SKU-P2', nombre: 'Producto prueba',
    marca: 'Marca', proveedor: 'Proveedor, S.A.', descripcion: 'Descripción', especificaciones: '',
    seccion: 'Perfumería', subcategoria: 'Mujer', tipo: 'Eau de Parfum',
    caracteristicas: '', publicado: true, destacado: false, stock: 17, precio: 1250.75,
    precio_oferta: 1000, descuento: 20,
    clasificaciones: [
      { id: 11, seccion: 'Perfumería', categoria: 'Fragancias', subcategoria: 'Mujer', tipo: 'Eau de Parfum' },
      { id: 12, seccion: 'Perfumería', categoria: 'Regalos', subcategoria: 'Sets', tipo: 'Cofres' },
    ],
    variantes: [
      { id: 21, id_original: 'P2-100', sku_ean: 'EAN-100', volumen: '100 ml', color_nombre: 'Rojo', stock: 8, precio: 1250.75, precio_oferta: 1000, publicado: true, envio: '1' },
      { id: 22, id_original: 'P2-50', sku_ean: 'EAN-50', volumen: '50 ml', color_nombre: 'Azul', stock: 6, precio: 900, precio_oferta: null, publicado: true, envio: '1' },
    ],
    categoria: { id: 31, documentId: 'cat-fragancias', nombre: 'Fragancias', seccion: 'Perfumería' },
    ...options,
  };
  const state = { product: structuredClone(product), updates: [], creates: [], categories: [] };
  const log = { info() {}, error() {} };
  const strapi = {
    log,
    db: { query(uid) {
      assert.equal(uid, PRODUCTO);
      return { async findOne({ where }) {
        return where.id_original === state.product.id_original ? structuredClone(state.product) : null;
      } };
    } },
    documents(uid) {
      if (uid === PRODUCTO) return {
        async findMany({ filters, start = 0, limit = 100 }) {
          return (!filters || filters.proveedor?.$in.includes(state.product.proveedor))
            ? [structuredClone(state.product)].slice(start, start + limit) : [];
        },
        async update({ data }) {
          state.updates.push(structuredClone(data));
          state.product = { ...state.product, ...structuredClone(data) };
          return state.product;
        },
        async create({ data }) { state.creates.push(data); return data; },
      };
      if (uid === CATEGORIA) return {
        async findMany({ filters }) {
          return state.categories.filter(c => c.nombre === filters.nombre.$eq && c.seccion === filters.seccion.$eq);
        },
        async create({ data }) {
          const c = { ...data, documentId: `cat-${data.nombre.toLowerCase()}` };
          state.categories.push(c);
          return c;
        },
        async update() {},
        async publish() {},
      };
      throw new Error(`Unexpected UID ${uid}`);
    },
  };
  return { state, strapi };
}

async function workbookFrom(buffer) {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buffer);
  return wb;
}

async function importWorkbook(strapi, wb) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'marybe-excel-test-'));
  const filename = path.join(dir, 'copia.xlsx');
  try {
    await wb.xlsx.writeFile(filename);
    return await importar.procesarImportacion(strapi, filename);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

async function supplierWorkbook(strapi) {
  const { buffer } = await exportarProveedor.generarExcelProveedor(strapi, ['Proveedor, S.A.']);
  return workbookFrom(buffer);
}

async function generalWorkbook(strapi) {
  const { buffer } = await exportarGeneral.generarExcel(strapi);
  return workbookFrom(buffer);
}

test('las tres exportaciones informan el rango global de IDs de producto, incluidos borradores', async () => {
  const { strapi } = fixture({ id_original: '15000' });
  const original = strapi.documents;
  strapi.documents = uid => {
    const api = original(uid);
    if (uid !== PRODUCTO) return api;
    const findMany = api.findMany;
    api.findMany = async options => {
      if (options.fields?.includes('id_original')) return options.status === 'draft'
        ? [{ id_original: '15000' }, { id_original: '17000' }, { id_original: 'ABC' }]
        : [{ id_original: '15000' }, { id_original: '15053' }];
      return findMany(options);
    };
    return api;
  };
  const books = [
    await generalWorkbook(strapi),
    await workbookFrom((await exportarGeneral.generarExcelVacio(strapi)).buffer),
    await supplierWorkbook(strapi),
  ];
  for (const book of books) {
    const text = book.worksheets[0].getCell('A2').value;
    assert.match(text, /15000 a 17000/);
    assert.match(text, /puede haber números libres/);
    assert.match(text, /sugerencia desde 17001/);
    assert.match(text, /verificá disponibilidad al importar/);
    assert.match(text, /IDs de variantes son independientes/);
  }
});

test('las tres planillas usan la nueva jerarquía, con listas fijas en catálogo completo y cascada en plantilla vacía y proveedores', async () => {
  const { strapi } = fixture();
  const { buffer: emptyBuffer } = await exportarGeneral.generarExcelVacio(strapi);
  const fullWorkbook = await generalWorkbook(strapi);
  const cascadeWorkbooks = [
    await workbookFrom(emptyBuffer),
    await supplierWorkbook(strapi),
  ];

  assert.equal(Object.keys(TAXONOMY).length, 12);
  assert.deepEqual(TAXONOMY['Dermocosmetica'].Facial.slice(0, 2), ['Limpieza Facial', 'Tónicos']);
  assert.deepEqual(TAXONOMY['Maquillaje'].Labios.slice(0, 2), ['Labiales Liquidos', 'Labiales en Barra']);
  assert.ok('Contornos de Ojos y Labios' in TAXONOMY['Dermocosmetica Premium']);
  assert.deepEqual(TAXONOMY['Fragancias'].Cofres, ['Femeninas', 'Masculinas']);

  const fullSheet = fullWorkbook.worksheets[0];
  const fullLists = fullWorkbook.getWorksheet('Listas');
  assert.equal(fullLists.state, 'hidden');
  assert.deepEqual(Object.keys(TAXONOMY), Object.keys(TAXONOMY).map((_, index) => fullLists.getCell(index + 2, 2).value));
  assert.equal(fullSheet.getCell('F4').dataValidation.formulae[0], 'Listas!$B$2:$B$13');
  assert.equal(fullSheet.getCell('G4').dataValidation.formulae[0], 'Listas!$C$2:$C$57');
  assert.equal(fullSheet.getCell('H4').dataValidation.formulae[0], 'Listas!$D$2:$D$78');
  assert.equal(fullLists.getCell('W4').value, null);

  for (const workbook of cascadeWorkbooks) {
    const sheet = workbook.worksheets[0];
    const lists = workbook.getWorksheet('Listas');
    assert.equal(lists.state, 'hidden');
    assert.deepEqual(Object.keys(TAXONOMY), Object.keys(TAXONOMY).map((_, index) => lists.getCell(index + 2, 2).value));
    assert.deepEqual(['Facial', 'Corporal', 'Solares', 'Accesorios'], [lists.getCell('G2').value, lists.getCell('H2').value, lists.getCell('I2').value, lists.getCell('J2').value]);
    assert.equal(lists.getCell('P2').value, 'Limpieza Facial');

    assert.equal(sheet.getCell('F4').dataValidation.formulae[0], 'Listas!$B$2:$B$13');
    assert.equal(sheet.getCell('G4').dataValidation.formulae[0], 'Listas!$X$4:$AF$4');
    assert.equal(sheet.getCell('G5').dataValidation.formulae[0], 'Listas!$X$5:$AF$5');
    assert.equal(sheet.getCell('H4').dataValidation.formulae[0], 'Listas!$AH$4:$AN$4');
    assert.equal(sheet.getCell('H5').dataValidation.formulae[0], 'Listas!$AH$5:$AN$5');
    assert.doesNotMatch(sheet.getCell('G4').dataValidation.formulae[0], /INDIRECT|MATCH/);
    assert.doesNotMatch(sheet.getCell('H4').dataValidation.formulae[0], /INDIRECT|MATCH/);

    assert.match(lists.getCell('W4').formula, /MATCH\(.*!\$F4,\$B\$2:\$B\$13,0\)/);
    assert.match(lists.getCell('X4').formula, /INDEX\(G\$2:G\$13,\$W4\)/);
    assert.match(lists.getCell('AG4').formula, /MATCH\(.*!\$G4,\$C\$2:\$C\$57,0\)/);
    assert.match(lists.getCell('AH4').formula, /INDEX\(P\$2:P\$57,\$AG4\)/);
  }
});

test('una clasificación elegida del nuevo Excel se importa con su categoría y tipo', async () => {
  const { state, strapi } = fixture();
  const workbook = await generalWorkbook(strapi);
  const product = workbook.getWorksheet('📦 Productos');
  product.getCell('F4').value = 'Dermocosmetica';
  product.getCell('G4').value = 'Facial';
  product.getCell('H4').value = 'Limpieza Facial';

  const result = await importWorkbook(strapi, workbook);
  assert.equal(result.errores, 0, result.erroresList.join('; '));
  assert.ok(state.categories.some(category => category.nombre === 'Dermocosmetica' && category.seccion === 'Perfumería'));
  assert.ok(state.product.clasificaciones.some(item => item.categoria === 'Dermocosmetica' && item.subcategoria === 'Facial' && item.tipo === 'Limpieza Facial'));
});

test('el error de validación de categoría se muestra en español y no modifica el producto', async () => {
  const { state, strapi } = fixture();
  const wb = await generalWorkbook(strapi);
  const documents = strapi.documents;
  strapi.documents = uid => {
    const api = documents(uid);
    if (uid === CATEGORIA) api.create = async () => {
      throw new Error('seccion must be one of the following values: Perfumería, Hogar, ');
    };
    return api;
  };
  const result = await importWorkbook(strapi, wb);
  assert.equal(result.errores, 1);
  assert.match(result.erroresList[0], /La sección debe ser uno de los siguientes valores: Perfumería, Hogar/);
  assert.match(result.erroresList[0], /El producto quedó sin cambios/);
  assert.ok(result.log.some(line => line.includes(result.erroresList[0])));
  assert.equal(state.updates.length, 0);
  assert.equal(state.creates.length, 0);
});

test('exportación e importación de proveedor sin editar conserva stock, clasificaciones y atributos', async () => {
  const { state, strapi } = fixture();
  const wb = await supplierWorkbook(strapi);
  const result = await importWorkbook(strapi, wb);
  assert.equal(result.errores, 0, result.erroresList.join('; '));
  assert.equal(state.updates.length, 0, JSON.stringify(state.updates[0]));
  assert.equal(state.product.stock, 17);
  assert.equal(state.product.clasificaciones.length, 2);
  assert.equal(state.product.variantes.length, 2);
  assert.equal(state.product.variantes[0].volumen, '100 ml');
  assert.equal(state.product.variantes[0].color_nombre, 'Rojo');
  assert.equal(state.product.descuento, 20);
});

test('omitir una fila de variante en la hoja de proveedor no borra la variante', async () => {
  const { state, strapi } = fixture();
  const wb = await supplierWorkbook(strapi);
  const ws = wb.getWorksheet('💲 Precios por Proveedor');
  const row = ws._rows.findIndex(r => r && (r.getCell(28).value === 'P2-50' || String(r.getCell(1).value).includes('P2-50'))) + 1;
  assert.ok(row > 3);
  ws.spliceRows(row, 1);
  const result = await importWorkbook(strapi, wb);
  assert.equal(result.errores, 0, result.erroresList.join('; '));
  assert.equal(state.product.variantes.length, 2);
  assert.ok(state.product.variantes.some(v => v.id_original === 'P2-50'));
});

test('precio con separadores españoles se importa completo', async () => {
  const { state, strapi } = fixture();
  const wb = await supplierWorkbook(strapi);
  wb.getWorksheet('💲 Precios por Proveedor').getCell(4, 13).value = '1.250,75';
  const result = await importWorkbook(strapi, wb);
  assert.equal(result.errores, 0, result.erroresList.join('; '));
  assert.equal(state.product.precio, 1250.75);
});

test('quitar oferta limpia el precio de oferta aunque persista el porcentaje calculado', async () => {
  const { state, strapi } = fixture();
  const wb = await supplierWorkbook(strapi);
  wb.getWorksheet('💲 Precios por Proveedor').getCell(4, 14).value = null;
  const result = await importWorkbook(strapi, wb);
  assert.equal(result.errores, 0);
  assert.equal(state.product.precio_oferta, null);
  assert.ok(result.log.some(line => /Fila 4 · producto P2/.test(line)));
  assert.ok(!result.log.some(line => line.startsWith('Progreso:')));
});

test('variante -v1 oculta del Excel general se conserva', async () => {
  const { state, strapi } = fixture({ variantes: [
    { id: 21, id_original: 'P2-v1', sku_ean: 'EAN', volumen: '', color_nombre: null, stock: 17, precio: 1250.75, precio_oferta: null, publicado: true, envio: '1' },
  ] });
  const wb = await generalWorkbook(strapi);
  const result = await importWorkbook(strapi, wb);
  assert.equal(result.errores, 0);
  assert.equal(state.updates.length, 0, JSON.stringify(state.updates[0]));
  assert.equal(state.product.variantes.length, 1);
  assert.equal(state.product.variantes[0].id_original, 'P2-v1');
});

test('Excel general mantiene vacía la oferta del producto aunque una variante esté en oferta', async () => {
  const { state, strapi } = fixture({ precio_oferta: null });
  const wb = await generalWorkbook(strapi);
  const result = await importWorkbook(strapi, wb);
  assert.equal(result.errores, 0, result.erroresList.join('; '));
  assert.equal(state.product.precio_oferta, null);
});

test('Excel general sin una variante comercial rechaza ese producto y registra su ID', async () => {
  const { state, strapi } = fixture();
  const wb = await generalWorkbook(strapi);
  const ws = wb.getWorksheet('🔗 Variantes');
  const row = ws._rows.findIndex(r => r && r.getCell(1).value === 'P2-50') + 1;
  assert.ok(row > 3);
  ws.spliceRows(row, 1);
  const result = await importWorkbook(strapi, wb);
  assert.equal(result.errores, 1);
  assert.match(result.erroresList[0], /Fila .*producto P2.*P2-50/);
  assert.equal(state.updates.length, 0);
});

test('Excel general detecta cambio exclusivo de color', async () => {
  const { state, strapi } = fixture();
  const wb = await generalWorkbook(strapi);
  const ws = wb.getWorksheet('🔗 Variantes');
  const row = ws._rows.findIndex(r => r && r.getCell(1).value === 'P2-100') + 1;
  ws.getCell(row, 12).value = 'Verde';
  const result = await importWorkbook(strapi, wb);
  assert.equal(result.errores, 0);
  assert.equal(state.product.variantes.find(v => v.id_original === 'P2-100').color_nombre, 'Verde');
});

test('plantilla de alta con ID existente se rechaza sin escrituras', async () => {
  const { state, strapi } = fixture();
  const { buffer } = await exportarGeneral.generarExcelVacio(strapi);
  const wb = await workbookFrom(buffer);
  const ws = wb.getWorksheet('📦 Productos');
  ws.getCell(4, 1).value = 'P2';
  ws.getCell(4, 3).value = 'Duplicado';
  const result = await importWorkbook(strapi, wb);
  assert.equal(result.errorModoAlta, true);
  assert.equal(state.updates.length, 0);
  assert.equal(state.creates.length, 0);
});

test('archivo dañado y libro ajeno se rechazan sin escrituras', async () => {
  const { state, strapi } = fixture();
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'marybe-excel-invalid-'));
  try {
    const invalid = path.join(dir, 'invalid.xlsx');
    fs.writeFileSync(invalid, 'esto no es un Excel');
    await assert.rejects(importar.procesarImportacion(strapi, invalid), /Excel .xlsx válido/);
    const other = new ExcelJS.Workbook();
    other.addWorksheet('Comparación').getCell('A4').value = 'P2';
    await assert.rejects(importWorkbook(strapi, other), /Formato de Excel no reconocido/);
    assert.equal(state.updates.length, 0);
    assert.equal(state.creates.length, 0);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('importe ilegible informa fila y columna antes de guardar', async () => {
  const { state, strapi } = fixture();
  const wb = await supplierWorkbook(strapi);
  wb.getWorksheet('💲 Precios por Proveedor').getCell(4, 13).value = '1.250,75xx';
  await assert.rejects(importWorkbook(strapi, wb), /Fila 4: Precio.*no es un número válido/);
  assert.equal(state.updates.length, 0);
});

test('controlador preserva proveedor con coma y acepta varios parámetros', async () => {
  const previous = global.strapi;
  const calls = [];
  global.strapi = {
    config: { get: () => 'test-secret' },
    log: { info() {}, error() {} },
    service: () => ({ async generarExcelProveedor(_strapi, proveedores) {
      calls.push(proveedores);
      return { buffer: Buffer.from('excel'), totalProductos: 1, totalVariantes: 0 };
    } }),
  };
  const controller = require('../src/api/exportacion-proveedores-admin/controllers/exportacion-proveedores-admin');
  const token = jwt.sign({ isAdminImport: true }, 'test-secret');
  try {
    for (const proveedores of ['Proveedor, S.A.', ['Proveedor, S.A.', 'Otro']]) {
      const headers = {};
      const ctx = {
        request: { header: { authorization: `Bearer ${token}` } },
        query: { proveedores },
        set: (key, value) => { headers[key] = value; },
      };
      await controller.exportar(ctx);
      assert.equal(ctx.body.toString(), 'excel');
      assert.equal(headers['X-Total-Productos'], '1');
    }
    assert.deepEqual(calls, [['Proveedor, S.A.'], ['Proveedor, S.A.', 'Otro']]);
  } finally {
    global.strapi = previous;
  }
});

test('controlador de importación informa éxito parcial con detalle de la fila', async () => {
  const previous = global.strapi;
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'marybe-excel-controller-'));
  const file = path.join(dir, 'copia.xlsx');
  fs.writeFileSync(file, 'archivo simulado');
  global.strapi = {
    config: { get: () => 'test-secret' },
    log: { info() {}, error() {} },
    service: () => ({ async procesarImportacion() {
      return {
        totalProductos: 2, productosSinId: 0, variantesOmitidasSinPadre: 0,
        variantesOmitidasSinId: 0, creados: 0, actualizados: 1, sinCambios: 0,
        errores: 1, erroresList: ['Fila 7 · producto P2: falta P2-50'],
        tiempoSegundos: 0.2, log: [],
      };
    } }),
  };
  const controller = require('../src/api/importacion-admin/controllers/importacion-admin');
  const token = jwt.sign({ isAdminImport: true }, 'test-secret');
  try {
    const ctx = {
      request: {
        header: { authorization: `Bearer ${token}` },
        files: { archivo: { name: 'copia.xlsx', path: file, size: 16 } },
      },
      send(data) { return data; },
    };
    const response = await controller.upload(ctx);
    assert.equal(response.ok, false);
    assert.equal(response.parcial, true);
    assert.equal(response.datos.errores, 1);
    assert.match(response.datos.erroresList[0], /Fila 7.*P2-50/);
  } finally {
    global.strapi = previous;
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('vaciar el campo Tipo en la planilla de proveedor o general borra el tipo en Strapi', async () => {
  const { state, strapi } = fixture();
  assert.equal(state.product.tipo, 'Eau de Parfum');
  assert.equal(state.product.clasificaciones[0].tipo, 'Eau de Parfum');

  const wb = await supplierWorkbook(strapi);
  const ws = wb.getWorksheet('💲 Precios por Proveedor');
  ws.getCell(4, 8).value = '';

  const result = await importWorkbook(strapi, wb);
  assert.equal(result.errores, 0, result.erroresList.join('; '));
  assert.equal(state.updates.length, 1);
  assert.equal(state.product.tipo, '');
  assert.equal(state.product.clasificaciones[0].tipo, '');
});

test('planilla de proveedor incluye hoja Variantes con estructura A-L, BUSCARV adaptado y creación de nuevas variantes', async () => {
  const { state, strapi } = fixture();
  const wb = await supplierWorkbook(strapi);

  const wsV = wb.getWorksheet('🔗 Variantes');
  assert.ok(wsV, 'Debe existir la hoja 🔗 Variantes en la planilla por proveedor');
  assert.equal(wsV.getCell('A4').value, 'P2-100');
  assert.equal(wsV.getCell('B4').value, 'P2');
  assert.match(wsV.getCell('C4').formula, /'💲 Precios por Proveedor'!A:D,4,FALSE/);
  assert.equal(wsV.getCell('J4').dataValidation.formulae[0], 'Listas!$F$2:$F$3');
  assert.match(wsV.getCell('L4').dataValidation.formulae[0], /^Listas!\$E\$2:\$E\$/);

  // Editar color/volumen de variante existente en 🔗 Variantes y agregar una variante nueva P2-200
  wsV.getCell('E4').value = '120 ml';
  wsV.getCell('L4').value = 'Dorado';

  const newRow = wsV.getRow(6);
  newRow.getCell(1).value = 'P2-200';
  newRow.getCell(2).value = 'P2';
  newRow.getCell(4).value = 'EAN-200';
  newRow.getCell(5).value = '200 ml';
  newRow.getCell(6).value = 12;
  newRow.getCell(7).value = 2000;
  newRow.getCell(8).value = 1400; // 30% descuento
  newRow.getCell(10).value = 'SI';
  newRow.getCell(11).value = '1';
  newRow.getCell(12).value = 'Negro';
  newRow.commit();

  const result = await importWorkbook(strapi, wb);
  assert.equal(result.errores, 0, result.erroresList.join('; '));
  assert.equal(state.product.variantes.length, 3);

  const v100 = state.product.variantes.find(v => v.id_original === 'P2-100');
  assert.equal(v100.volumen, '120 ml');
  assert.equal(v100.color_nombre, 'Dorado');

  const v200 = state.product.variantes.find(v => v.id_original === 'P2-200');
  assert.ok(v200, 'La nueva variante P2-200 debe haberse creado');
  assert.equal(v200.sku_ean, 'EAN-200');
  assert.equal(v200.volumen, '200 ml');
  assert.equal(v200.stock, 12);
  assert.equal(v200.precio, 2000);
  assert.equal(v200.precio_oferta, 1400);
  assert.equal(v200.color_nombre, 'Negro');
  assert.equal(state.product.descuento, 30);
});

test('planilla de proveedor rechaza IDs de variante duplicados y respeta el filtro del proveedor seleccionado', async () => {
  const { state, strapi } = fixture();
  const wb = await supplierWorkbook(strapi);
  const wsV = wb.getWorksheet('🔗 Variantes');

  // 1. Duplicar ID P2-100 en fila 6
  const dupRow = wsV.getRow(6);
  dupRow.getCell(1).value = 'P2-100';
  dupRow.getCell(2).value = 'P2';
  dupRow.getCell(6).value = 5;
  dupRow.getCell(7).value = 1100;
  dupRow.commit();

  const resDup = await importWorkbook(strapi, wb);
  assert.equal(resDup.errores, 1);
  assert.match(resDup.erroresList[0], /Variante duplicada "P2-100"/);
  assert.equal(state.updates.length, 0);

  // 2. Cambiar el proveedor del producto en BD a otro proveedor fuera del filtro del Excel
  const wb2 = await supplierWorkbook(strapi);
  state.product.proveedor = 'Otro Proveedor Ajeno';
  wb2.getWorksheet('💲 Precios por Proveedor').getCell(4, 13).value = 9999;

  const resProv = await importWorkbook(strapi, wb2);
  assert.equal(resProv.errores, 1);
  assert.match(resProv.erroresList[0], /no corresponde al filtro de proveedores seleccionados/);
  assert.equal(state.updates.length, 0);
});

test('proveedor sin variantes genera 1 fila de variante de ejemplo con BUSCARV de referencia y la ignora al reimportar', async () => {
  const { state, strapi } = fixture({ variantes: [] });
  const wb = await supplierWorkbook(strapi);
  const wsV = wb.getWorksheet('🔗 Variantes');

  assert.equal(wsV.getCell('A4').value, 'EJEMPLO-VAR-001');
  assert.equal(wsV.getCell('B4').value, 'P2');
  assert.match(wsV.getCell('C4').formula, /'💲 Precios por Proveedor'!A:D,4,FALSE/);
  assert.equal(wsV.getCell('A5').value, null);

  // Si se reimporta sin borrar la fila de ejemplo, se omite automáticamente sin ensuciar la BD
  const result = await importWorkbook(strapi, wb);
  assert.equal(result.errores, 0, result.erroresList.join('; '));
  assert.equal(state.updates.length, 0);
  assert.equal(state.product.variantes.length, 0);
});


test('proveedor permite crear productos y variantes y valida nombre y proveedor', async () => {
  for (const [nombre, proveedor, expected] of [
    ['Nuevo producto', 'Proveedor, S.A.', true],
    ['', 'Proveedor, S.A.', false],
    ['Nuevo producto', 'Otro proveedor', false],
  ]) {
    const { state, strapi } = fixture();
    const wb = await supplierWorkbook(strapi);
    const ws = wb.getWorksheet('💲 Precios por Proveedor');
    const row = ws.getRow(ws.rowCount + 2);
    [ 'NUEVO', 'SKU-N', proveedor, nombre, 'Perfumería', 'Fragancias', 'Mujer', 'Eau de Parfum', 'SI', 'NO', '', 5, 1200, 900 ].forEach((v, i) => { row.getCell(i + 1).value = v; });
    const variants = wb.getWorksheet('🔗 Variantes');
    const vr = variants.getRow(variants.rowCount + 1);
    [ 'NUEVO-1', 'NUEVO', '', 'EAN-N', '100 ml', 5, 1200, 900, '', 'SI', '1', 'Rojo' ].forEach((v, i) => { vr.getCell(i + 1).value = v; });
    const result = await importWorkbook(strapi, wb);
    assert.equal(result.creados, expected ? 1 : 0, JSON.stringify(result.erroresList));
    if (expected) {
      assert.equal(result.errores, 0, result.erroresList.join('; '));
      assert.equal(state.creates[0].nombre, nombre);
      assert.equal(state.creates[0].proveedor, proveedor);
      assert.equal(state.creates[0].variantes[0].id_original, 'NUEVO-1');
      assert.equal(state.creates[0].clasificaciones[0].categoria, 'Fragancias');
    } else assert.equal(result.errores, 1);
  }
});


test('proveedor exporta, actualiza y vacia los campos de ficha sin alterar archivos antiguos', async () => {
  const { state, strapi } = fixture({ marca: 'Marca original', descripcion: 'Descripcion original', especificaciones: 'Especificacion original', caracteristicas: 'Caracteristica original' });
  const wb = await supplierWorkbook(strapi);
  const ws = wb.getWorksheet('\ud83d\udcb2 Precios por Proveedor');
  assert.deepEqual([16, 17, 18, 19].map(col => ws.getCell(3, col).value), ['Marca', 'Descripci\u00f3n', 'Especificaciones', 'Caracter\u00edsticas']);
  assert.deepEqual([16, 17, 18, 19].map(col => ws.getCell(4, col).value), ['Marca original', 'Descripcion original', 'Especificacion original', 'Caracteristica original']);
  const unchanged = await importWorkbook(strapi, wb);
  assert.equal(unchanged.sinCambios, 1, unchanged.erroresList.join('; '));
  ['Nueva marca', 'Nueva descripcion', '', 'Nueva caracteristica'].forEach((value, index) => { ws.getCell(4, 16 + index).value = value; });
  const changed = await importWorkbook(strapi, wb);
  assert.equal(changed.actualizados, 1, changed.erroresList.join('; '));
  assert.deepEqual([state.product.marca, state.product.descripcion, state.product.especificaciones, state.product.caracteristicas], ['Nueva marca', 'Nueva descripcion', '', 'Nueva caracteristica']);
  for (let col = 16; col <= 19; col++) { ws.getCell(3, col).value = null; ws.getCell(4, col).value = null; }
  const old = await importWorkbook(strapi, wb);
  assert.equal(old.errores, 0, old.erroresList.join('; '));
  assert.deepEqual([state.product.marca, state.product.descripcion, state.product.especificaciones, state.product.caracteristicas], ['Nueva marca', 'Nueva descripcion', '', 'Nueva caracteristica']);
});

test('proveedor crea productos con los campos de ficha', async () => {
  const { state, strapi } = fixture();
  const wb = await supplierWorkbook(strapi);
  const ws = wb.getWorksheet('\ud83d\udcb2 Precios por Proveedor');
  const row = ws.getRow(ws.rowCount + 2);
  ['NUEVO-FICHA', 'SKU', 'Proveedor, S.A.', 'Nuevo', '', '', '', '', 'SI', 'NO', '', 3, 1000, '', '', 'Marca nueva', 'Descripcion nueva', 'Especificacion nueva', 'Caracteristica nueva'].forEach((value, index) => { row.getCell(index + 1).value = value; });
  const result = await importWorkbook(strapi, wb);
  assert.equal(result.creados, 1, result.erroresList.join('; '));
  assert.deepEqual([state.creates[0].marca, state.creates[0].descripcion, state.creates[0].especificaciones, state.creates[0].caracteristicas], ['Marca nueva', 'Descripcion nueva', 'Especificacion nueva', 'Caracteristica nueva']);
});

test('proveedor conserva textos con richText e hipervinculos al importar ficha', async () => {
  const { state, strapi } = fixture({ marca: 'Marca original', descripcion: 'Desc', especificaciones: 'Esp', caracteristicas: 'Car' });
  const wb = await supplierWorkbook(strapi);
  const ws = wb.getWorksheet('\ud83d\udcb2 Precios por Proveedor');
  ws.getCell(3, 17).value = { richText: [{ text: 'Descripci\u00f3n' }] };
  ws.getCell(4, 17).value = { richText: [{ text: 'Notas ' }, { text: 'clave', font: { bold: true } }, { text: ' del producto' }] };
  ws.getCell(4, 18).value = { text: 'Ficha t\u00e9cnica', hyperlink: 'https://marybe.com/ficha' };
  ws.getCell(4, 19).value = { text: { richText: [{ text: 'Uso ' }, { text: 'diario', font: { italic: true } }] }, hyperlink: 'https://marybe.com/uso' };
  const result = await importWorkbook(strapi, wb);
  assert.equal(result.actualizados, 1, result.erroresList.join('; '));
  assert.equal(state.product.descripcion, 'Notas clave del producto');
  assert.equal(state.product.especificaciones, 'Ficha t\u00e9cnica');
  assert.equal(state.product.caracteristicas, 'Uso diario');
});

test('planilla general y de proveedor actualizan el nombre de un ID existente', async () => {
  const { state, strapi } = fixture({ nombre: 'Nombre original' });

  const wbProv = await supplierWorkbook(strapi);
  wbProv.getWorksheet('\ud83d\udcb2 Precios por Proveedor').getCell(4, 4).value = 'Nombre proveedor';
  const resProv = await importWorkbook(strapi, wbProv);
  assert.equal(resProv.actualizados, 1, resProv.erroresList.join('; '));
  assert.equal(state.product.nombre, 'Nombre proveedor');

  const wbGen = await generalWorkbook(strapi);
  wbGen.getWorksheet('\ud83d\udce6 Productos').getCell(4, 3).value = 'Nombre general';
  const resGen = await importWorkbook(strapi, wbGen);
  assert.equal(resGen.actualizados, 1, resGen.erroresList.join('; '));
  assert.equal(state.product.nombre, 'Nombre general');
});

test('planilla de proveedor actualiza sku, publicado y destacado y permite SKUs repetidos entre padre/variante o productos distintos con IDs únicos', async () => {
  const { state, strapi } = fixture();
  const otroProducto = { id: 99, documentId: 'doc-p99', id_original: 'P99', sku: 'SKU-OTRO', proveedor: 'Otro', variantes: [{ id: 991, id_original: 'P99-1', sku_ean: 'EAN-OTRO' }] };
  const originalDocs = strapi.documents;
  strapi.documents = uid => {
    const api = originalDocs(uid);
    if (uid !== PRODUCTO) return api;
    return {
      ...api,
      async findMany({ filters, start = 0, limit = 100 }) {
        const list = filters ? await api.findMany({ filters, start, limit }) : [structuredClone(state.product), structuredClone(otroProducto)];
        return filters ? list : list.slice(start, start + limit);
      },
    };
  };

  // 1. SKU, Publicado/Destacado y SKU compartido entre padre y su propia variante (caso 8181) actualizan sin bloquear
  const wbOk = await supplierWorkbook(strapi);
  const wsOk = wbOk.getWorksheet('\ud83d\udcb2 Precios por Proveedor');
  wsOk.getCell(4, 2).value = 'EAN-100-IGUAL-PADRE';
  wsOk.getCell(4, 9).value = 'NO';
  wsOk.getCell(4, 10).value = 'SI';
  wsOk.getCell(5, 2).value = 'EAN-100-IGUAL-PADRE';
  const resOk = await importWorkbook(strapi, wbOk);
  assert.equal(resOk.errores, 0, resOk.erroresList.join('; '));
  assert.equal(state.product.sku, 'EAN-100-IGUAL-PADRE');
  assert.equal(state.product.publicado, false);
  assert.equal(state.product.destacado, true);
  assert.equal(state.product.variantes.find(v => v.id_original === 'P2-100').sku_ean, 'EAN-100-IGUAL-PADRE');

  // 2. Dos variantes del mismo producto con distinto id_original pueden compartir sku_ean (casos 9125/4818)
  const wbSameEanVars = await supplierWorkbook(strapi);
  wbSameEanVars.getWorksheet('\ud83d\udcb2 Precios por Proveedor').getCell(5, 2).value = 'EAN-50';
  const resSameEanVars = await importWorkbook(strapi, wbSameEanVars);
  assert.equal(resSameEanVars.errores, 0, resSameEanVars.erroresList.join('; '));
  assert.equal(state.product.variantes.find(v => v.id_original === 'P2-100').sku_ean, 'EAN-50');

  // 3. Productos distintos con mismo sku padre o variante con EAN repetido se distinguen por ID y se crean
  const wbCreate = await supplierWorkbook(strapi);
  const wsCreate = wbCreate.getWorksheet('\ud83d\udcb2 Precios por Proveedor');
  [
    ['NUEVO-1', 'SKU-OTRO', 'Proveedor, S.A.', 'Uno', '', '', '', '', 'SI', 'NO', '', 5, 1000, ''],
    ['NUEVO-2', 'EAN-OTRO', 'Proveedor, S.A.', 'Dos', '', '', '', '', 'SI', 'NO', '', 5, 1000, ''],
  ].forEach((vals, idx) => {
    const r = wsCreate.getRow(wsCreate.rowCount + 2 + idx);
    vals.forEach((v, colIdx) => { r.getCell(colIdx + 1).value = v; });
  });
  const resCreate = await importWorkbook(strapi, wbCreate);
  assert.equal(resCreate.errores, 0, resCreate.erroresList.join('; '));
  assert.equal(resCreate.creados, 2);
  assert.deepEqual(state.creates.map(c => c.id_original), ['NUEVO-1', 'NUEVO-2']);
});

test('exportacion deduplica solo clones exactos, reasigna duplicados intra-producto sin tocar otros productos y valida unicidad intra-producto', async () => {
  const { filtrarVariantesComerciales } = require('../src/utils/excel-utils');
  const { deduplicarVariantes, limpiarVariantesDuplicadas } = require('../scripts/limpiar-variantes-duplicadas');

  const { state, strapi } = fixture({
    variantes: [
      { id: 21, id_original: 'P2-100', sku_ean: 'EAN-100', volumen: '100 ml', stock: 8, precio: 1250, publicado: true, envio: '1' },
      { id: 22, id_original: 'P2-100', sku_ean: 'EAN-100', volumen: '100 ml', stock: 8, precio: 1250, publicado: true, envio: '1' },
      { id: 23, id_original: 'P2-50', sku_ean: 'EAN-50', volumen: '50 ml', stock: 6, precio: 900, publicado: true, envio: '1' },
    ],
  });
  assert.equal(filtrarVariantesComerciales('P2', state.product.variantes).length, 2);
  assert.equal(deduplicarVariantes(state.product.variantes).length, 2);

  const preview = await limpiarVariantesDuplicadas(strapi, { apply: false });
  assert.equal(preview.length, 1);
  assert.equal(preview[0].antes, 3);
  assert.equal(preview[0].despues, 2);
  assert.equal(preview[0].clonesEliminados, 1);
  assert.equal(preview[0].idsReasignados, 0);
  assert.equal(state.updates.length, 0);

  await limpiarVariantesDuplicadas(strapi, { apply: true });
  assert.equal(state.product.variantes.length, 2);

  // Variantes distintas que comparten id_original DENTRO del mismo producto se reasignan sin eliminarse
  // y sin alterar productos históricos distintos que comparten id_original entre sí.
  const prodA = {
    documentId: 'doc-16050',
    id_original: '16050',
    nombre: 'RUBOR',
    variantes: [
      { id: 1, id_original: '20000', sku_ean: 'EAN-1', volumen: 'Cupido', stock: 2, precio: 100 },
      { id: 2, id_original: '20000', sku_ean: 'EAN-2', volumen: 'Enamorada', stock: 2, precio: 100 },
    ],
  };
  const prodB = {
    documentId: 'doc-16051',
    id_original: '16051',
    nombre: 'BASE',
    variantes: [
      { id: 3, id_original: '20000', sku_ean: 'EAN-3', volumen: 'Glamour', stock: 2, precio: 200 },
      { id: 4, id_original: '20000', sku_ean: 'EAN-4', volumen: 'Petalo', stock: 2, precio: 200 },
    ],
  };
  const prodHist1 = {
    documentId: 'doc-8179',
    id_original: '8179',
    nombre: 'ELVIVE',
    variantes: [{ id: 5, id_original: '16273', sku_ean: 'EAN-H1', volumen: '400 ml', stock: 2, precio: 300 }],
  };
  const prodHist2 = {
    documentId: 'doc-9029',
    id_original: '9029',
    nombre: 'OPIUM',
    variantes: [{ id: 6, id_original: '16273', sku_ean: 'EAN-H2', volumen: '90 ml', stock: 2, precio: 400 }],
  };
  assert.equal(filtrarVariantesComerciales('16050', prodA.variantes).length, 2);
  const storeCol = {
    published: [structuredClone(prodA), structuredClone(prodB), structuredClone(prodHist1), structuredClone(prodHist2)],
    draft: [structuredClone(prodA), structuredClone(prodB), structuredClone(prodHist1), structuredClone(prodHist2)],
  };
  const fakeAppCol = {
    documents: () => ({
      async findMany({ status = 'published', start = 0, limit = 100 }) {
        return (storeCol[status] || []).slice(start, start + limit);
      },
      async update({ documentId, data, status = 'published' }) {
        const doc = storeCol[status].find(d => d.documentId === documentId);
        if (doc) doc.variantes = data.variantes;
        return doc;
      },
    }),
  };
  const colRes = await limpiarVariantesDuplicadas(fakeAppCol, { apply: true });
  assert.equal(colRes.length, 2);
  assert.equal(colRes[0].antes, 2);
  assert.equal(colRes[0].despues, 2);
  assert.equal(colRes[1].antes, 2);
  assert.equal(colRes[1].despues, 2);
  assert.equal(new Set(storeCol.published[0].variantes.map(v => v.id_original)).size, 2);
  assert.equal(new Set(storeCol.published[1].variantes.map(v => v.id_original)).size, 2);
  assert.equal(storeCol.published[2].variantes[0].id_original, '16273');
  assert.equal(storeCol.published[3].variantes[0].id_original, '16273');
  assert.deepEqual(
    storeCol.draft[0].variantes.map(v => v.id_original),
    storeCol.published[0].variantes.map(v => v.id_original)
  );
  assert.deepEqual(
    storeCol.draft[1].variantes.map(v => v.id_original),
    storeCol.published[1].variantes.map(v => v.id_original)
  );

  // Importación tolera id_original de variante ya usado en otro producto histórico, pero bloquea SKU repetido
  const otroProducto = { id: 99, documentId: 'doc-p99', id_original: 'P99', sku: 'SKU-OTRO', proveedor: 'Otro', variantes: [{ id: 991, id_original: 'P99-1', sku_ean: 'EAN-OTRO' }] };
  const originalDocs = strapi.documents;
  strapi.documents = uid => {
    const api = originalDocs(uid);
    if (uid !== PRODUCTO) return api;
    return {
      ...api,
      async findMany({ filters, start = 0, limit = 100 }) {
        const list = filters ? await api.findMany({ filters, start, limit }) : [structuredClone(state.product), structuredClone(otroProducto)];
        return filters ? list : list.slice(start, start + limit);
      },
    };
  };

  const wb = await supplierWorkbook(strapi);
  const ws = wb.getWorksheet('\ud83d\udcb2 Precios por Proveedor');
  const wsV = wb.getWorksheet('\ud83d\udd17 Variantes');
  const rProd = ws.getRow(ws.rowCount + 2);
  ['NUEVO-VAR', 'SKU-NV', 'Proveedor, S.A.', 'Nuevo Var', '', '', '', '', 'SI', 'NO', '', 5, 1000, ''].forEach((v, idx) => { rProd.getCell(idx + 1).value = v; });
  const rVar = wsV.getRow(wsV.rowCount + 2);
  ['P99-1', 'NUEVO-VAR', '', 'EAN-NUEVO-VAR', '50 ml', 5, 1000, '', '', 'SI', '1', ''].forEach((v, idx) => { rVar.getCell(idx + 1).value = v; });
  const resOk = await importWorkbook(strapi, wb);
  assert.equal(resOk.errores, 0);
  assert.equal(resOk.creados, 1);
});

test('oculta ID Variante en Excel y autogenera IDs secuenciales al crear variantes sin completar columna oculta', async () => {
  const { state, strapi } = fixture({
    variantes: [
      { id: 21, id_original: '19500', sku_ean: 'EAN-100', volumen: '100 ml', color_nombre: 'Rojo', stock: 8, precio: 1250.75, precio_oferta: 1000, publicado: true, envio: '1', portada: { id: 777 } },
      { id: 22, id_original: '19501', sku_ean: 'EAN-50', volumen: '50 ml', color_nombre: 'Azul', stock: 6, precio: 900, precio_oferta: null, publicado: true, envio: '1' },
    ],
  });

  // 1. Verificar columnas ocultas en exportacion proveedor y general
  const wbGen = await generalWorkbook(strapi);
  const wsVGen = wbGen.getWorksheet('🔗 Variantes');
  assert.equal(wsVGen.getColumn(1).hidden, true);
  assert.ok(String(wsVGen.getCell('B1').value).includes('Variantes'));

  const wb = await supplierWorkbook(strapi);
  const ws = wb.getWorksheet('💲 Precios por Proveedor');
  const wsV = wb.getWorksheet('🔗 Variantes');

  assert.equal(ws.getCell(3, 1).value, 'ID Producto');
  assert.equal(ws.getColumn(28).hidden, true);
  assert.equal(ws.getCell(5, 1).value, '  ↳');
  assert.equal(ws.getCell(5, 28).value, '19500');
  assert.equal(wsV.getColumn(1).hidden, true);
  assert.equal(wsV.getCell('A4').value, '19500');

  // 2. Editar SKU/EAN y precio de variante existente (con Col A oculta preservada) + agregar 2 variantes nuevas con Col A vacia
  wsV.getCell(4, 4).value = 'EAN-100-EDITADO';
  wsV.getCell(4, 7).value = 1400;

  const nuevaExistente = wsV.getRow(6);
  [ '', 'P2', '', 'EAN-NEW-1', '150 ml', 9, 2100, '', '', 'SI', '1', 'Verde' ].forEach((val, idx) => {
    nuevaExistente.getCell(idx + 1).value = val;
  });
  nuevaExistente.commit();

  // Agregar producto nuevo con 2 variantes sin ID Variante (Col A en blanco)
  const rProd = ws.getRow(ws.rowCount + 2);
  ['NUEVO-AUTO', 'SKU-NA', 'Proveedor, S.A.', 'Producto Auto', 'Perfumería', 'Fragancias', 'Mujer', 'Eau de Parfum', 'SI', 'NO', '', 5, 1500, ''].forEach((v, idx) => {
    rProd.getCell(idx + 1).value = v;
  });
  [
    [ '', 'NUEVO-AUTO', '', 'EAN-AUTO-A', 'Tono 01', 4, 1500, '', '', 'SI', '1', 'Rosa' ],
    [ '', 'NUEVO-AUTO', '', 'EAN-AUTO-B', 'Tono 02', 6, 1600, '', '', 'SI', '1', 'Coral' ],
  ].forEach((vals, idx) => {
    const r = wsV.getRow(7 + idx);
    vals.forEach((v, colIdx) => { r.getCell(colIdx + 1).value = v; });
    r.commit();
  });

  const res = await importWorkbook(strapi, wb);
  assert.equal(res.errores, 0, res.erroresList.join('; '));
  assert.equal(res.actualizados, 1);
  assert.equal(res.creados, 1);
  assert.equal(res.variantesOmitidasSinId, 0);
  assert.ok(res.log.some(l => l.includes('3 variante(s) nueva(s) recibirán ID automático')));

  // La variante editada conservo id interno/portada y no se duplico
  assert.equal(state.product.variantes.length, 3);
  const vEditada = state.product.variantes.find(v => v.id_original === '19500');
  assert.equal(vEditada.sku_ean, 'EAN-100-EDITADO');
  assert.equal(vEditada.precio, 1400);
  assert.deepEqual(vEditada.portada, { id: 777 });

  const vCreadaEnExistente = state.product.variantes.find(v => v.sku_ean === 'EAN-NEW-1');
  assert.equal(vCreadaEnExistente.id_original, '19502');
  assert.equal(vCreadaEnExistente.color_nombre, 'Verde');

  const varsNuevo = state.creates[0].variantes;
  assert.equal(varsNuevo.length, 2);
  assert.deepEqual(varsNuevo.map(v => v.id_original), ['19503', '19504']);
  assert.deepEqual(varsNuevo.map(v => v.sku_ean), ['EAN-AUTO-A', 'EAN-AUTO-B']);
});

test('retrocompatibilidad: hoja proveedor antigua con "↳ ID" en columna A sigue resolviendo variantes', async () => {
  const { state, strapi } = fixture();
  const wb = await supplierWorkbook(strapi);
  const ws = wb.getWorksheet('💲 Precios por Proveedor');
  ws.getCell(5, 1).value = '  ↳ P2-100';
  ws.getCell(5, 28).value = null;
  ws.getCell(5, 13).value = 1880;
  const wsV = wb.getWorksheet('🔗 Variantes');
  wb.removeWorksheet(wsV.id);

  const res = await importWorkbook(strapi, wb);
  assert.equal(res.errores, 0, res.erroresList.join('; '));
  assert.equal(res.actualizados, 1);
  assert.equal(state.product.variantes.find(v => v.id_original === 'P2-100').precio, 1880);
});

test('auditar-ids-variantes lista repetidos intra-producto, entre productos y variantes sin ID sin modificar la BD', async () => {
  const { auditarIdsVariantes, parseArgs } = require('../scripts/auditar-ids-variantes');
  assert.deepEqual(parseArgs([]), { estados: ['published'], soloExportables: false, soloResumen: false, salida: null });
  assert.deepEqual(parseArgs(['--estado=ambos', '--solo-exportables', '--resumen', '--salida=rep.json']), {
    estados: ['published', 'draft'], soloExportables: true, soloResumen: true, salida: 'rep.json',
  });

  const data = {
    published: [
      {
        documentId: 'doc-1', id_original: '100', nombre: 'Prod A', proveedor: 'Prov 1',
        variantes: [
          { id: 1, id_original: '16273', sku_ean: 'EAN-1', volumen: '50 ml', color_nombre: '', precio: 100, stock: 2, publicado: true },
          { id: 2, id_original: '16273', sku_ean: 'EAN-2', volumen: '100 ml', color_nombre: '', precio: 200, stock: 3, publicado: true },
          { id: 3, id_original: '', sku_ean: 'EAN-VACIO', volumen: '30 ml', color_nombre: '', precio: 50, stock: 1, publicado: true },
        ],
      },
      {
        documentId: 'doc-2', id_original: '200', nombre: 'Prod B', proveedor: 'Prov 2',
        variantes: [
          { id: 4, id_original: ' 16273 ', sku_ean: 'EAN-3', volumen: '75 ml', color_nombre: '', precio: 150, stock: 4, publicado: true },
          { id: 5, id_original: '200-v1', sku_ean: '', volumen: '', color_nombre: '', precio: 90, stock: 1, publicado: true },
          { id: 6, id_original: '99999', sku_ean: 'EAN-UNICO', volumen: '200 ml', color_nombre: '', precio: 300, stock: 5, publicado: true },
        ],
      },
    ],
    draft: [],
  };
  const fakeApp = {
    documents: () => ({
      async findMany({ status = 'published', start = 0, limit = 100 }) {
        return (data[status] || []).slice(start, start + limit);
      },
    }),
  };

  const full = await auditarIdsVariantes(fakeApp);
  assert.equal(full.estado, 'published');
  assert.deepEqual(full.resumen, {
    productosAnalizados: 2,
    totalVariantes: 6,
    variantesExportables: 5,
    idsUnicos: 3,
    idsRepetidosTotal: 1,
    ocurrenciasEnRepetidos: 3,
    idsRepetidosIntraProducto: 1,
    idsRepetidosEntreProductos: 1,
    variantesSinId: 1,
  });
  assert.equal(full.repetidos[0].id_variante, '16273');
  assert.equal(full.repetidos[0].alcance, 'intra_y_entre_productos');
  assert.equal(full.repetidos[0].productosAfectados, 2);
  assert.equal(full.repetidos[0].variantes.length, 3);
  assert.equal(full.sinId.length, 1);
  assert.equal(full.sinId[0].sku_ean, 'EAN-VACIO');

  const onlyExp = await auditarIdsVariantes(fakeApp, { soloExportables: true });
  assert.equal(onlyExp.resumen.totalVariantes, 5);
  assert.equal(onlyExp.resumen.idsUnicos, 2);
});

test('permite actualizar en el mismo Excel dos productos distintos que comparten ID Variante histórico', async () => {
  const store = [
    {
      id: 1, documentId: 'doc-9179', id_original: '9179', sku: 'SKU-9179', nombre: 'UMA BLANC EDT',
      proveedor: 'Proveedor, S.A.', seccion: 'Perfumería', subcategoria: 'Mujer', tipo: 'EDT',
      publicado: true, destacado: false, stock: 5, precio: 1000, precio_oferta: null, descuento: 0,
      clasificaciones: [{ id: 1, seccion: 'Perfumería', categoria: 'Fragancias', subcategoria: 'Mujer', tipo: 'EDT' }],
      variantes: [{ id: 11, id_original: '13902', sku_ean: 'EAN-9179', volumen: '100 ml', stock: 5, precio: 1000, precio_oferta: null, publicado: true, envio: '1' }],
      categoria: { id: 31, documentId: 'cat-fragancias', nombre: 'Fragancias', seccion: 'Perfumería' },
    },
    {
      id: 2, documentId: 'doc-4970', id_original: '4970', sku: 'SKU-4970', nombre: 'KENZO AMOUR EDP',
      proveedor: 'Proveedor, S.A.', seccion: 'Perfumería', subcategoria: 'Mujer', tipo: 'EDP',
      publicado: true, destacado: false, stock: 4, precio: 2000, precio_oferta: null, descuento: 0,
      clasificaciones: [{ id: 2, seccion: 'Perfumería', categoria: 'Fragancias', subcategoria: 'Mujer', tipo: 'EDP' }],
      variantes: [{ id: 21, id_original: '13902', sku_ean: 'EAN-4970', volumen: '50 ml', stock: 4, precio: 2000, precio_oferta: null, publicado: true, envio: '1' }],
      categoria: { id: 31, documentId: 'cat-fragancias', nombre: 'Fragancias', seccion: 'Perfumería' },
    },
  ];
  const updates = [];
  const strapi = {
    log: { info() {}, error() {} },
    db: { query: () => ({ async findOne({ where }) {
      const found = store.find(p => p.id_original === where.id_original);
      return found ? structuredClone(found) : null;
    } }) },
    documents(uid) {
      if (uid === CATEGORIA) return {
        async findMany() { return [{ documentId: 'cat-fragancias', nombre: 'Fragancias', seccion: 'Perfumería' }]; },
        async create() { return { documentId: 'cat-fragancias' }; },
        async update() {},
        async publish() {},
      };
      return {
        async findMany({ start = 0, limit = 100 } = {}) { return structuredClone(store).slice(start, start + limit); },
        async update({ documentId, data }) {
          updates.push({ documentId, data });
          const idx = store.findIndex(p => p.documentId === documentId);
          if (idx >= 0) store[idx] = { ...store[idx], ...structuredClone(data) };
          return store[idx];
        },
        async create() { throw new Error('unexpected create'); },
      };
    },
  };

  const wb = await supplierWorkbook(strapi);
  const wsV = wb.getWorksheet('🔗 Variantes');
  for (const row of [4, 5]) {
    const padre = wsV.getCell(row, 2).value;
    wsV.getCell(row, 7).value = padre === '9179' ? 1150 : 2250;
  }

  const res = await importWorkbook(strapi, wb);
  assert.equal(res.errores, 0, res.erroresList.join('; '));
  assert.equal(res.actualizados, 2);
  assert.equal(store[0].variantes[0].precio, 1150);
  assert.equal(store[1].variantes[0].precio, 2250);
});

test('limpiar-variantes-duplicadas --global reasigna IDs aleatorios únicos conservando primera ocurrencia, portada y sincronización published/draft', async () => {
  const { limpiarVariantesDuplicadas } = require('../scripts/limpiar-variantes-duplicadas');
  const { auditarIdsVariantes } = require('../scripts/auditar-ids-variantes');

  const store = {
    published: [
      {
        documentId: 'doc-p1', id_original: '101', nombre: 'Prod 1', proveedor: 'Prov A',
        variantes: [{ id: 1, id_original: '16273', sku_ean: 'EAN-P1', volumen: '100 ml', precio: 500, stock: 5, portada: { id: 88 } }],
      },
      {
        documentId: 'doc-p2', id_original: '102', nombre: 'Prod 2', proveedor: 'Prov B',
        variantes: [{ id: 2, id_original: '16273', sku_ean: 'EAN-P2', volumen: '50 ml', precio: 700, stock: 3, portada: { id: 99 } }],
      },
      {
        documentId: 'doc-p3', id_original: '103', nombre: 'Prod 3', proveedor: 'Prov C',
        variantes: [{ id: 3, id_original: '16273', sku_ean: 'EAN-P3', volumen: '30 ml', precio: 300, stock: 1 }],
      },
    ],
    draft: [
      {
        documentId: 'doc-p1', id_original: '101', nombre: 'Prod 1', proveedor: 'Prov A',
        variantes: [{ id: 1, id_original: '16273', sku_ean: 'EAN-P1', volumen: '100 ml', precio: 500, stock: 5, portada: { id: 88 } }],
      },
      {
        documentId: 'doc-p2', id_original: '102', nombre: 'Prod 2', proveedor: 'Prov B',
        variantes: [{ id: 2, id_original: '16273', sku_ean: 'EAN-P2', volumen: '50 ml', precio: 700, stock: 3, portada: { id: 99 } }],
      },
      {
        documentId: 'doc-p3', id_original: '103', nombre: 'Prod 3', proveedor: 'Prov C',
        variantes: [{ id: 3, id_original: '16273', sku_ean: 'EAN-P3', volumen: '30 ml', precio: 300, stock: 1 }],
      },
    ],
  };

  const fakeApp = {
    documents: () => ({
      async findMany({ status = 'published', start = 0, limit = 100 }) {
        return (store[status] || []).slice(start, start + limit);
      },
      async update({ documentId, data, status = 'published' }) {
        const doc = (store[status] || []).find(d => d.documentId === documentId);
        if (doc) doc.variantes = data.variantes;
        return doc;
      },
    }),
  };

  const dry = await limpiarVariantesDuplicadas(fakeApp, { apply: false, global: true });
  assert.equal(dry.length, 2);
  assert.equal(store.published[1].variantes[0].id_original, '16273');

  const res = await limpiarVariantesDuplicadas(fakeApp, { apply: true, global: true });
  assert.equal(res.length, 2);
  assert.equal(store.published[0].variantes[0].id_original, '16273');
  const nuevoP2 = store.published[1].variantes[0].id_original;
  const nuevoP3 = store.published[2].variantes[0].id_original;
  assert.match(nuevoP2, /^\d{6,}$/);
  assert.match(nuevoP3, /^\d{6,}$/);
  assert.notEqual(nuevoP2, '16273');
  assert.notEqual(nuevoP3, '16273');
  assert.notEqual(nuevoP2, nuevoP3);
  assert.equal(store.published[1].variantes[0].portada, 99);
  assert.equal(store.published[1].variantes[0].sku_ean, 'EAN-P2');
  assert.equal(store.draft[1].variantes[0].id_original, nuevoP2);
  assert.equal(store.draft[2].variantes[0].id_original, nuevoP3);

  const auditPost = await auditarIdsVariantes(fakeApp, { estados: ['published', 'draft'] });
  assert.equal(auditPost.estados.published.resumen.idsRepetidosTotal, 0);
  assert.equal(auditPost.estados.draft.resumen.idsRepetidosTotal, 0);
});
