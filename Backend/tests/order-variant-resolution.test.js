'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { resolveOrderVariant } = require('../src/api/mercado-pago/services/checkout-lifecycle');

test('recupera una variante por ID original único cuando cambia el ID interno', () => {
  const variants = [{ id: 20, id_original: 'v1' }, { id: 21, id_original: 'v2' }];
  assert.equal(resolveOrderVariant(variants, { id_variante: 10, id_variante_original: 'v2' }), variants[1]);
  assert.equal(resolveOrderVariant(variants, { id_variante: 20, id_variante_original: 'v2' }), variants[1]);
});

test('rechaza referencias ambiguas o que no permiten identificar una variante', () => {
  const variants = [{ id: 20, id_original: 'v1' }, { id: 21, id_original: 'v1' }];
  assert.equal(resolveOrderVariant(variants, { id_variante: 10, id_variante_original: 'v1' }), null);
  assert.equal(resolveOrderVariant(variants, { id_variante: 10 }), null);
});
