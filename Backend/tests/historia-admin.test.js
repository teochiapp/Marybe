const { test } = require('node:test');
const assert = require('node:assert/strict');
const serviceFactory = require('../src/api/historia-admin/services/historia-admin');

test('devuelve valores por defecto cuando no existe registro en pagina-historia', async () => {
  const strapi = {
    documents: () => ({
      findFirst: async () => null,
    }),
  };

  const service = serviceFactory({ strapi });
  const data = await service.get();

  assert.equal(data.titulo, 'Nuestra Historia');
  assert.equal(data.encuadre_imagen_inicio, 'centro');
  assert.equal(data.imagen_inicio, null);
  assert.equal(data.texto_banner_1, '');
});

test('obtiene el contenido existente de pagina-historia con imágenes formateadas', async () => {
  const strapi = {
    documents: () => ({
      findFirst: async () => ({
        documentId: 'ph-1',
        titulo: 'Nuestra Historia Marybe',
        encuadre_imagen_inicio: 'arriba',
        imagen_inicio: { id: 12, url: '/uploads/inicio.jpg', name: 'inicio.jpg', width: 1000, height: 800 },
        texto_banner_1: '<p>Fundación 1969</p>',
        texto_intermedio: '<p>Expansión</p>',
        texto_banner_2: '<p>Trayectoria</p>',
        encuadre_imagen_secundaria: 'izquierda',
        encuadre_imagen_final_desktop: 'centro',
        encuadre_imagen_final_mobile: 'abajo',
      }),
    }),
  };

  const service = serviceFactory({ strapi });
  const data = await service.get();

  assert.equal(data.titulo, 'Nuestra Historia Marybe');
  assert.equal(data.encuadre_imagen_inicio, 'arriba');
  assert.equal(data.imagen_inicio.id, 12);
  assert.equal(data.imagen_inicio.url, '/uploads/inicio.jpg');
  assert.equal(data.encuadre_imagen_final_mobile, 'abajo');
});

test('actualiza textos, encuadres e IDs de imágenes correctamente', async () => {
  let updatedArgs = null;
  const strapi = {
    documents: () => ({
      findFirst: async () => ({ documentId: 'ph-1' }),
      update: async (args) => {
        updatedArgs = args;
        return {
          documentId: args.documentId,
          ...args.data,
          imagen_inicio: args.data.imagen_inicio ? { id: args.data.imagen_inicio, url: '/uploads/new.jpg' } : null,
        };
      },
    }),
  };

  const service = serviceFactory({ strapi });
  const saved = await service.update({
    titulo: ' Historia Renovada ',
    texto_banner_1: '<p>Texto 1</p>',
    texto_intermedio: '<p>Texto 2</p>',
    texto_banner_2: '<p>Texto 3</p>',
    encuadre_imagen_inicio: 'DERECHA',
    encuadre_imagen_secundaria: 'invalido',
    imagen_inicio: { id: 44 },
    imagen_secundaria: null,
  });

  assert.equal(updatedArgs.documentId, 'ph-1');
  assert.equal(updatedArgs.data.titulo, 'Historia Renovada');
  assert.equal(updatedArgs.data.encuadre_imagen_inicio, 'derecha');
  assert.equal(updatedArgs.data.encuadre_imagen_secundaria, 'centro');
  assert.equal(updatedArgs.data.imagen_inicio, 44);
  assert.equal(updatedArgs.data.imagen_secundaria, null);
  assert.equal(saved.imagen_inicio.id, 44);
});
