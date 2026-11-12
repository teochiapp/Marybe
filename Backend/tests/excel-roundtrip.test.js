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
  const row = ws._rows.findIndex(r => r && String(r.getCell(1).value).includes('P2-50')) + 1;
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
