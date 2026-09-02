/**
 * test_clasificaciones.js
 *
 * Tests unitarios para la lógica de múltiples clasificaciones.
 * No requiere Strapi corriendo — testea funciones puras del servicio de importación.
 *
 * USO:
 *   node scripts/test_clasificaciones.js
 */

'use strict';

// ─── Importar la función a testear ──────────────────────────────────────────
// Como el servicio usa module.exports = () => ({...}), lo invocamos para obtener el objeto.
const servicioFactory = require('../src/api/importacion-admin/services/importacion-admin');
const servicio = servicioFactory();
const { agruparFilasDuplicadas } = servicio;

// ─── Helpers de test ─────────────────────────────────────────────────────────
let passed = 0;
let failed = 0;
const logs = [];

function assert(condition, testName, detail = '') {
  if (condition) {
    passed++;
    console.log(`  ✅ ${testName}`);
  } else {
    failed++;
    console.log(`  ❌ FALLÓ: ${testName}`);
    if (detail) console.log(`       → ${detail}`);
  }
}

function assertEq(actual, expected, testName) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) {
    assert(false, testName, `esperado=${JSON.stringify(expected)}, recibido=${JSON.stringify(actual)}`);
  } else {
    assert(true, testName);
  }
}

const warn = (msg) => logs.push(msg);

// ─── DATOS DE PRUEBA ──────────────────────────────────────────────────────────

const filaBase = {
  id_original:  'PROD-001',
  nombre:       'Base Líquida Premium',
  marca:        'L\'Oréal',
  precio:       '5000',
  stock:        '10',
  publicado:    'SI',
  seccion:      'Perfumería',
  categoria:    'Maquillaje',
  subcategoria: 'Rostro',
  tipo:         'Bases de Maquillaje',
};

const filaClasifExtra = {
  id_original:  'PROD-001',
  nombre:       'Base Líquida Premium',
  marca:        'L\'Oréal',
  precio:       '5000',
  stock:        '10',
  publicado:    'SI',
  seccion:      'Perfumería',
  categoria:    'Ofertas',
  subcategoria: 'Maquillaje',
  tipo:         '',
};

const filaProducto2 = {
  id_original:  'PROD-002',
  nombre:       'Perfume Chanel N5',
  marca:        'Chanel',
  precio:       '15000',
  stock:        '5',
  publicado:    'SI',
  seccion:      'Perfumería',
  categoria:    'Fragancias',
  subcategoria: 'Femeninas',
  tipo:         'Premium',
};

// ─── TEST 1: Agrupación básica — 3 filas para PROD-001 ──────────────────────
console.log('\n📦 TEST 1: Agrupación por ID duplicado');
{
  const fila3 = { ...filaBase, categoria: 'Lanzamientos', subcategoria: '', tipo: '' };
  const filas = [filaBase, filaClasifExtra, fila3, filaProducto2];
  const resultado = agruparFilasDuplicadas(filas, warn);

  assert(resultado.length === 2, 'Debe producir 2 productos únicos (PROD-001 y PROD-002)');

  const prod1 = resultado.find(p => p.id_original === 'PROD-001');
  assert(prod1 !== undefined, 'PROD-001 debe estar en el resultado');
  assert(prod1.clasificaciones.length === 3, 'PROD-001 debe tener 3 clasificaciones', `tiene ${prod1.clasificaciones.length}`);

  assertEq(
    prod1.clasificaciones[0],
    { seccion: 'Perfumería', categoria: 'Maquillaje', subcategoria: 'Rostro', tipo: 'Bases de Maquillaje' },
    'Primera clasificación de PROD-001 correcta'
  );
  assertEq(
    prod1.clasificaciones[1],
    { seccion: 'Perfumería', categoria: 'Ofertas', subcategoria: 'Maquillaje', tipo: '' },
    'Segunda clasificación de PROD-001 correcta'
  );
}

// ─── TEST 2: Datos base de la primera fila ────────────────────────────────────
console.log('\n📦 TEST 2: Primera fila dicta los datos base');
{
  const filaConflictoNombre = { ...filaBase, nombre: 'Nombre Distinto', precio: '9999' };
  const filas = [filaBase, filaConflictoNombre, filaClasifExtra];
  const capturedLogs = [];
  const resultado = agruparFilasDuplicadas(filas, (msg) => capturedLogs.push(msg));

  const prod1 = resultado.find(p => p.id_original === 'PROD-001');
  assert(prod1.nombre === 'Base Líquida Premium', 'El nombre debe ser el de la fila 1');
  assert(prod1.precio === '5000', 'El precio debe ser el de la fila 1');

  const hayWarnNombre = capturedLogs.some(l => l.includes('CONFLICTO en nombre'));
  const hayWarnPrecio = capturedLogs.some(l => l.includes('CONFLICTO en precio'));
  assert(hayWarnNombre, 'Debe loguear warning de conflicto en nombre');
  assert(hayWarnPrecio, 'Debe loguear warning de conflicto en precio');
}

// ─── TEST 3: Idempotencia — mismas filas producen mismo resultado ─────────────
console.log('\n📦 TEST 3: Idempotencia');
{
  const filas = [filaBase, filaClasifExtra];
  const r1 = agruparFilasDuplicadas(filas, warn);
  const r2 = agruparFilasDuplicadas(filas, warn);
  assertEq(r1, r2, 'El mismo Excel produce siempre el mismo resultado (idempotente)');
}

// ─── TEST 4: Clasificación duplicada exacta NO se agrega dos veces ───────────
console.log('\n📦 TEST 4: No duplicar clasificaciones idénticas');
{
  const filas = [filaBase, filaBase]; // misma fila DOS veces
  const resultado = agruparFilasDuplicadas(filas, warn);
  const prod1 = resultado.find(p => p.id_original === 'PROD-001');
  assert(prod1.clasificaciones.length === 1, 'Clasificaciones idénticas no se duplican', `tiene ${prod1.clasificaciones.length}`);
}

// ─── TEST 5: Fila con subcategoría vacía ─────────────────────────────────────
console.log('\n📦 TEST 5: Fila con subcategoría vacía');
{
  const filaVacia = { ...filaBase, subcategoria: '', tipo: '' };
  const filas = [filaBase, filaVacia];
  const resultado = agruparFilasDuplicadas(filas, warn);
  const prod1 = resultado.find(p => p.id_original === 'PROD-001');
  // La fila vacía SÍ se agrega porque la clave es diferente (subcategoria vacía ≠ 'Rostro')
  assert(prod1.clasificaciones.length === 2, 'Fila con subcategoría vacía genera clasificación adicional');
  assertEq(prod1.clasificaciones[1], { seccion: 'Perfumería', categoria: 'Maquillaje', subcategoria: '', tipo: '' }, 'Segunda clasificación tiene subcategoría vacía');
}

// ─── TEST 6: Producto sin filas duplicadas tiene clasificaciones[0] ───────────
console.log('\n📦 TEST 6: Producto sin duplicados genera clasificaciones[0]');
{
  const filas = [filaProducto2];
  const resultado = agruparFilasDuplicadas(filas, warn);
  const prod2 = resultado.find(p => p.id_original === 'PROD-002');
  assert(prod2.clasificaciones.length === 1, 'Producto sin duplicados tiene exactamente 1 clasificación');
  assertEq(
    prod2.clasificaciones[0],
    { seccion: 'Perfumería', categoria: 'Fragancias', subcategoria: 'Femeninas', tipo: 'Premium' },
    'La única clasificación es correcta'
  );
}

// ─── TEST 7: Fila sin ID es ignorada ─────────────────────────────────────────
console.log('\n📦 TEST 7: Fila sin ID es ignorada por agruparFilasDuplicadas');
{
  const filaSinId = { ...filaBase, id_original: '' };
  const filas = [filaBase, filaSinId, filaProducto2];
  const resultado = agruparFilasDuplicadas(filas, warn);
  assert(resultado.length === 2, 'Fila sin ID no genera producto extra, solo hay PROD-001 y PROD-002');
}

// ─── TEST 8: Orden de clasificaciones preservado ──────────────────────────────
console.log('\n📦 TEST 8: Orden de clasificaciones respeta el orden del Excel');
{
  const clasificacionA = { ...filaBase, categoria: 'Maquillaje',    subcategoria: 'Rostro', tipo: 'Bases de Maquillaje' };
  const clasificacionB = { ...filaBase, categoria: 'Ofertas',        subcategoria: 'Maquillaje', tipo: '' };
  const clasificacionC = { ...filaBase, categoria: 'Lanzamientos',   subcategoria: '', tipo: '' };
  const filas = [clasificacionA, clasificacionB, clasificacionC];
  const resultado = agruparFilasDuplicadas(filas, warn);
  const prod1 = resultado.find(p => p.id_original === 'PROD-001');
  assert(prod1.clasificaciones[0].categoria === 'Maquillaje',    'Primera clasificación: Maquillaje');
  assert(prod1.clasificaciones[1].categoria === 'Ofertas',        'Segunda clasificación: Ofertas');
  assert(prod1.clasificaciones[2].categoria === 'Lanzamientos',   'Tercera clasificación: Lanzamientos');
}

// ─── TEST 9: Múltiples productos mezclados ────────────────────────────────────
console.log('\n📦 TEST 9: Múltiples productos mezclados en orden arbitrario');
{
  const filas = [
    { ...filaBase,         id_original: 'P001', categoria: 'Maquillaje' },
    { ...filaBase,         id_original: 'P002', categoria: 'Fragancias' },
    { ...filaBase,         id_original: 'P001', categoria: 'Ofertas' },
    { ...filaProducto2,    id_original: 'P003', categoria: 'Dermocosmetica' },
    { ...filaBase,         id_original: 'P002', categoria: 'Lanzamientos' },
  ];
  const resultado = agruparFilasDuplicadas(filas, warn);
  assert(resultado.length === 3, 'Deben existir 3 productos únicos (P001, P002, P003)');
  const p001 = resultado.find(p => p.id_original === 'P001');
  const p002 = resultado.find(p => p.id_original === 'P002');
  assert(p001.clasificaciones.length === 2, 'P001 tiene 2 clasificaciones');
  assert(p002.clasificaciones.length === 2, 'P002 tiene 2 clasificaciones');
}

// ─── RESUMEN ──────────────────────────────────────────────────────────────────
console.log('\n─────────────────────────────────────────────');
console.log(`✅ Tests pasados: ${passed}`);
console.log(`❌ Tests fallidos: ${failed}`);
console.log('─────────────────────────────────────────────');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('\n🎉 Todos los tests pasaron!');
  process.exit(0);
}
