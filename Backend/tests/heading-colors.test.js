const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
// Exercise the installed Strapi validator, including clearing an optional field.
const coreRoot = path.dirname(require.resolve('@strapi/core/package.json'));
const { Validators } = require(path.join(coreRoot, 'dist/services/entity-validator/validators.js'));
const createRegistry = require(path.join(coreRoot, 'dist/registries/custom-fields.js'));
const { convertCustomFieldType } = require(path.join(coreRoot, 'dist/utils/convert-custom-field-type.js'));
const registry = createRegistry({});
require('../src/index').register({ strapi: {
  customFields: { register: field => registry.add(field) },
  server: { app: {}, use() {} },
  db: { lifecycles: { subscribe() {} } },
} });
const models = [
  [require('../src/components/shared/item-barra-superior.json'), ['color_texto']],
  [require('../src/components/shared/seccion-principal-item.json'), ['color_titulo_cursiva', 'color_titulo_normal']],
  [require('../src/components/inicio/descuentos.json'), ['color_titulo_cursiva', 'color_titulo_normal']],
];

for (const [model, fields] of models) {
  test(`${model.info.displayName}: colores opcionales, sin valor inicial y con HEX validado por Strapi`, async () => {
    for (const field of fields) {
      const attr = model.attributes[field];
      assert.equal(attr.type, 'customField');
      assert.equal(attr.customField, 'global::paleta-color');
      assert.equal(attr.default, undefined);
      assert.ok(!attr.required);
      const runtimeModel = structuredClone(model);
      convertCustomFieldType({ contentTypes: {}, components: { color: runtimeModel }, get: () => registry });
      assert.equal(runtimeModel.attributes[field].type, 'string');
      const validator = Validators.string({ attr: runtimeModel.attributes[field], model, updatedAttribute: { name: field, value: undefined } }, { isDraft: false }).nullable();
      for (const value of [undefined, null, '', '#560203', '#ABCdef', '#000000']) {
        assert.equal(await validator.validate(value), value);
      }
      for (const value of ['red', '#fff', '#gggggg', '#12345678', 'color:red;', 'var(--color)']) {
        await assert.rejects(validator.validate(value));
      }
    }
  });
}

test('la barra superior configura colores solo en cada ítem, sin campo general', () => {
  const model = require('../src/api/menu-barra-superior/content-types/menu-barra-superior/schema.json');
  assert.equal(model.attributes.color_texto, undefined);
  assert.equal(model.attributes.items.component, 'shared.item-barra-superior');
});
