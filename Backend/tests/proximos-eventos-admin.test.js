'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const createService = require('../src/api/proximos-eventos-admin/services/proximos-eventos-admin');
const controller = require('../src/api/proximos-eventos-admin/controllers/proximos-eventos-admin');
const routes = require('../src/api/proximos-eventos-admin/routes/proximos-eventos-admin');

function createHarness() {
  const eventos = [
    {
      id: 1,
      documentId: 'ev-perfumes',
      titulo: 'Cata de Perfumes',
      descripcion: 'Descubrí nuevas fragancias\nAsesoramiento personalizado',
      fecha: 'Sábado 15 de Noviembre - 18:00 hs',
      ubicacion: 'Local Centro',
      whatsapp_numero: '5493813632682',
      createdAt: '2026-11-01T08:00:00.000Z',
    },
    {
      id: 2,
      documentId: 'ev-skincare',
      titulo: 'Taller de Skincare',
      descripcion: 'Rutina facial paso a paso\nDiagnóstico de piel sin cargo',
      fecha: 'Viernes 21 de Noviembre - 17:30 hs',
      ubicacion: 'Sucursal Yerba Buena',
      whatsapp_numero: '5493813632682',
      createdAt: '2026-11-01T09:00:00.000Z',
    },
  ];

  let mainRow = {
    id: 1,
    documentId: 'sec-1',
    updatedAt: '2026-11-01T10:00:00.000Z',
    diseno_secciones: {},
    borradores_editor_inicio: {},
  };

  const eventoUpdates = [];

  const strapi = {
    config: { get: () => 'test-secret' },
    log: { error() {}, warn() {}, info() {} },
    documents(uid) {
      if (uid === 'api::seccion-principal.seccion-principal') {
        return {
          async findFirst() {
            return mainRow ? { ...mainRow } : null;
          },
          async update({ data }) {
            mainRow = {
              ...mainRow,
              ...data,
              updatedAt: '2026-11-01T11:00:00.000Z',
            };
            return mainRow;
          },
          async create({ data }) {
            mainRow = {
              id: 1,
              documentId: 'sec-1',
              updatedAt: '2026-11-01T11:00:00.000Z',
              ...data,
            };
            return mainRow;
          },
        };
      }
      if (uid === 'api::evento.evento') {
        return {
          async findMany() {
            return eventos.map(e => ({ ...e }));
          },
        };
      }
      throw new Error(`Document UID inesperado: ${uid}`);
    },
    db: {
      query(uid) {
        if (uid === 'api::evento.evento') {
          return {
            async findMany({ where }) {
              return eventos
                .filter(e => e.documentId === where.documentId)
                .map(e => ({ id: e.id }));
            },
            async update({ where, data }) {
              eventoUpdates.push({ id: where.id, data });
              const target = eventos.find(e => e.id === where.id);
              if (target) {
                if (data.titulo !== undefined) target.titulo = data.titulo;
                if (data.descripcion !== undefined) target.descripcion = data.descripcion;
                if (data.fecha !== undefined) target.fecha = data.fecha;
                if (data.ubicacion !== undefined) target.ubicacion = data.ubicacion;
                if (data.whatsapp_numero !== undefined) target.whatsapp_numero = data.whatsapp_numero;
              }
              return target;
            },
          };
        }
        throw new Error(`Query inesperado: ${uid}`);
      },
    },
  };

  const service = createService({ strapi });
  strapi.service = () => service;

  return { strapi, service, eventos, eventoUpdates, getMain: () => mainRow };
}

test('routes define GET, PUT y DELETE para proximos-eventos-admin', () => {
  assert.equal(routes.routes.length, 3);
  assert.deepEqual(
    routes.routes.map(r => `${r.method} ${r.path}`),
    [
      'GET /proximos-eventos-admin',
      'PUT /proximos-eventos-admin/:area',
      'DELETE /proximos-eventos-admin/:area/borrador',
    ]
  );
});

test('overview devuelve eventos publicados, orden, tipografía y controles por defecto', async () => {
  const { service } = createHarness();
  const state = await service.overview();

  assert.equal(state.version, '2026-11-01T10:00:00.000Z');
  const area = state.areas.general;
  assert.equal(area.eventosCatalogo.length, 2);
  assert.equal(area.published.titulo, 'Próximos eventos');
  assert.equal(area.published.icono, 'original');
  assert.equal(area.published.fuente, 'principal');
  assert.equal(area.published.tamano, 'grande');
  assert.equal(area.published.peso, 'semibold');
  assert.equal(area.published.estilo, 'cursiva');
  assert.equal(area.published.alineacion, 'izquierda');
  assert.equal(area.published.bordes_tarjeta, 'redondeado');
  assert.equal(area.published.espaciado_tarjetas, 'normal');
  assert.equal(area.published.cantidad_visible, 'todos');
  assert.equal(area.published.boton_redondeo, 'redondeado');
  assert.equal(area.published.enlace_inferior_texto, 'Ver todos los eventos');
  assert.equal(area.published.enlace_inferior_url, '#');
  assert.deepEqual(area.published.orden, ['ev-perfumes', 'ev-skincare']);
  assert.equal(area.published.eventos['ev-perfumes'].titulo, 'Cata de Perfumes');
  assert.equal(area.published.eventos['ev-perfumes'].boton_texto, 'Reservar turno');
  assert.equal(area.draft, null);
});

test('save en modo borrador guarda orden, diseño y eventos sin modificar los registros en Strapi', async () => {
  const { service, eventoUpdates } = createHarness();
  const initial = await service.overview();

  const updated = await service.save('general', {
    version: initial.version,
    publish: false,
    data: {
      titulo: 'Agenda de experiencias',
      icono: 'estrella',
      fuente: 'secundaria',
      tamano: 'grande',
      peso: 'bold',
      estilo: 'normal',
      alineacion: 'centro',
      bordes_tarjeta: 'muy-redondeado',
      espaciado_tarjetas: 'amplio',
      cantidad_visible: '2',
      boton_redondeo: 'pildora',
      enlace_inferior_texto: 'Ver agenda completa',
      enlace_inferior_url: '/eventos',
      orden: ['ev-skincare', 'ev-perfumes'],
      eventos: {
        'ev-perfumes': {
          titulo: 'Cata VIP de Perfumes',
          descripcion: 'Cupos limitados\nDegustación incluida',
          fecha: 'Domingo 16 de Noviembre - 19:00 hs',
          ubicacion: 'Showroom Central',
          whatsapp_numero: '5493810001111',
          boton_texto: 'Inscribirme ahora',
          boton_enlace: '/reservas/cata',
        },
      },
    },
  });

  assert.equal(eventoUpdates.length, 0);
  const area = updated.areas.general;
  assert.ok(area.draft);
  assert.equal(area.draft.titulo, 'Agenda de experiencias');
  assert.equal(area.draft.icono, 'estrella');
  assert.equal(area.draft.fuente, 'secundaria');
  assert.equal(area.draft.alineacion, 'centro');
  assert.equal(area.draft.bordes_tarjeta, 'muy-redondeado');
  assert.equal(area.draft.cantidad_visible, '2');
  assert.equal(area.draft.enlace_inferior_url, '/eventos');
  assert.deepEqual(area.draft.orden, ['ev-skincare', 'ev-perfumes']);
  assert.equal(area.draft.eventos['ev-perfumes'].titulo, 'Cata VIP de Perfumes');
  assert.equal(area.draft.eventos['ev-perfumes'].boton_texto, 'Inscribirme ahora');
  assert.equal(area.draft.eventos['ev-perfumes'].boton_enlace, '/reservas/cata');

  assert.equal(area.published.titulo, 'Próximos eventos');
  assert.equal(area.published.eventos['ev-perfumes'].titulo, 'Cata de Perfumes');
});

test('save con publish=true actualiza api::evento.evento en Strapi y persiste la configuración publicada', async () => {
  const { service, eventoUpdates, getMain } = createHarness();
  const initial = await service.overview();

  const published = await service.save('general', {
    version: initial.version,
    publish: true,
    data: {
      titulo: 'Próximos eventos Marybe',
      icono: 'corazon',
      fuente: 'principal',
      tamano: 'grande',
      peso: 'semibold',
      estilo: 'cursiva',
      alineacion: 'izquierda',
      bordes_tarjeta: 'cuadrado',
      espaciado_tarjetas: 'compacto',
      cantidad_visible: '3',
      boton_redondeo: 'pildora',
      enlace_inferior_texto: 'Conocer todos los eventos',
      enlace_inferior_url: 'https://marybe.com/eventos',
      orden: ['ev-skincare', 'ev-perfumes'],
      eventos: {
        'ev-perfumes': {
          titulo: 'Cata Exclusiva de Perfumes',
          descripcion: 'Nuevos lanzamientos\nRegalo de bienvenida',
          fecha: 'Sábado 22 de Noviembre - 18:30 hs',
          ubicacion: 'Local Centro',
          whatsapp_numero: '5493813632682',
          boton_texto: 'Reservar lugar',
          boton_enlace: '',
        },
        'ev-skincare': {
          titulo: 'Taller de Skincare',
          descripcion: 'Rutina facial paso a paso\nDiagnóstico de piel sin cargo',
          fecha: 'Viernes 21 de Noviembre - 17:30 hs',
          ubicacion: 'Sucursal Yerba Buena',
          whatsapp_numero: '5493813632682',
          boton_texto: 'Reservar turno',
          boton_enlace: '',
        },
      },
    },
  });

  assert.equal(eventoUpdates.length, 1);
  assert.equal(eventoUpdates[0].id, 1);
  assert.equal(eventoUpdates[0].data.titulo, 'Cata Exclusiva de Perfumes');
  assert.equal(eventoUpdates[0].data.fecha, 'Sábado 22 de Noviembre - 18:30 hs');

  const area = published.areas.general;
  assert.equal(area.draft, null);
  assert.equal(area.published.titulo, 'Próximos eventos Marybe');
  assert.equal(area.published.icono, 'corazon');
  assert.deepEqual(area.published.orden, ['ev-skincare', 'ev-perfumes']);
  assert.equal(area.published.eventos['ev-perfumes'].titulo, 'Cata Exclusiva de Perfumes');
  assert.equal(area.published.eventos['ev-perfumes'].boton_texto, 'Reservar lugar');

  const main = getMain();
  assert.equal(main.diseno_secciones['proximos-eventos'].general.titulo, 'Próximos eventos Marybe');
  assert.equal(main.borradores_editor_inicio['proximos-eventos']?.general, undefined);
});

test('discard elimina el borrador y restaura los valores publicados', async () => {
  const { service } = createHarness();
  const initial = await service.overview();

  const saved = await service.save('general', {
    version: initial.version,
    publish: false,
    data: {
      titulo: 'Borrador eventos',
      orden: ['ev-skincare', 'ev-perfumes'],
    },
  });
  assert.ok(saved.areas.general.draft);

  const discarded = await service.discard('general', { version: saved.version });
  assert.equal(discarded.areas.general.draft, null);
  assert.equal(discarded.areas.general.published.titulo, 'Próximos eventos');
});

test('rechaza enlaces inseguros, opciones inválidas y conflicto de versión', async () => {
  const { service } = createHarness();
  const initial = await service.overview();

  await assert.rejects(
    () =>
      service.save('general', {
        version: 'version-desactualizada',
        publish: false,
        data: { titulo: 'Test' },
      }),
    err => err.status === 409
  );

  await assert.rejects(
    () =>
      service.save('general', {
        version: initial.version,
        publish: false,
        data: { enlace_inferior_url: 'javascript:alert(1)' },
      }),
    err => err.status === 400
  );

  await assert.rejects(
    () =>
      service.save('general', {
        version: initial.version,
        publish: false,
        data: { icono: 'icono-inexistente' },
      }),
    err => err.status === 400
  );

  await assert.rejects(
    () =>
      service.save('general', {
        version: initial.version,
        publish: false,
        data: {
          eventos: {
            'ev-perfumes': {
              boton_enlace: 'javascript:void(0)',
            },
          },
        },
      }),
    err => err.status === 400
  );
});

test('controlador exige sesión de administrador', async () => {
  const { strapi } = createHarness();
  global.strapi = strapi;
  let unauthorizedMsg = null;
  const ctx = {
    request: { header: {} },
    unauthorized(msg) {
      unauthorizedMsg = msg;
      return { unauthorized: msg };
    },
  };
  await controller.overview(ctx);
  assert.equal(unauthorizedMsg, 'Iniciá sesión como administrador.');
});
