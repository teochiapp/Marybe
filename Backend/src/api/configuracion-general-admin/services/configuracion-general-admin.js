'use strict';

const UID = 'api::configuracion-general.configuracion-general';

const DEFAULTS = {
  cuotas_activas: true,
  cuotas_texto_previo: '',
  cuotas_cantidad: 3,
  whatsapp_numero: '',
  costo_envio: null,
  envio_gratis_desde: null,
  costo_uber_moto: null,
  mp_habilitado: true,
  mp_titulo: 'Mercado Pago',
  mp_subtitulo: 'Tarjetas de crédito, débito o dinero en cuenta',
  mp_etiqueta: '',
  mp_descripcion: '',
  transf_habilitado: true,
  transf_titulo: 'Transferencia Bancaria',
  transf_subtitulo: '',
  transf_etiqueta: '',
  transf_banco: '',
  transf_titular: '',
  transf_cuit: '',
  transf_cbu: '',
  transf_alias: '',
  transf_mensaje_wp: '',
  ef_habilitado: true,
  ef_titulo: 'Efectivo al retirar',
  ef_subtitulo: '',
  ef_etiqueta: '',
  ef_horario: '',
  ac_habilitado: true,
  ac_titulo: 'A convenir',
  ac_subtitulo: '',
  ac_etiqueta: '',
  ac_descripcion: '',
  ac_respuesta: '',
};

function parseNumber(val) {
  if (val === null || val === undefined || val === '') return null;
  const n = Number(val);
  return Number.isFinite(n) && n >= 0 ? Math.round(n) : null;
}

function parseBool(val, fallback = true) {
  if (val === undefined || val === null) return fallback;
  return Boolean(val);
}

function parseStr(val) {
  return val != null ? String(val).trim() : '';
}

function sanitize(input = {}) {
  return {
    cuotas_activas: parseBool(input.cuotas_activas, true),
    cuotas_texto_previo: parseStr(input.cuotas_texto_previo),
    cuotas_cantidad: Math.max(1, Math.min(24, parseNumber(input.cuotas_cantidad) || 3)),
    whatsapp_numero: parseStr(input.whatsapp_numero),
    costo_envio: parseNumber(input.costo_envio),
    envio_gratis_desde: parseNumber(input.envio_gratis_desde),
    costo_uber_moto: parseNumber(input.costo_uber_moto),
    mp_habilitado: parseBool(input.mp_habilitado, true),
    mp_titulo: parseStr(input.mp_titulo) || DEFAULTS.mp_titulo,
    mp_subtitulo: parseStr(input.mp_subtitulo),
    mp_etiqueta: parseStr(input.mp_etiqueta),
    mp_descripcion: parseStr(input.mp_descripcion),
    transf_habilitado: parseBool(input.transf_habilitado, true),
    transf_titulo: parseStr(input.transf_titulo) || DEFAULTS.transf_titulo,
    transf_subtitulo: parseStr(input.transf_subtitulo),
    transf_etiqueta: parseStr(input.transf_etiqueta),
    transf_banco: parseStr(input.transf_banco),
    transf_titular: parseStr(input.transf_titular),
    transf_cuit: parseStr(input.transf_cuit),
    transf_cbu: parseStr(input.transf_cbu),
    transf_alias: parseStr(input.transf_alias),
    transf_mensaje_wp: parseStr(input.transf_mensaje_wp),
    ef_habilitado: parseBool(input.ef_habilitado, true),
    ef_titulo: parseStr(input.ef_titulo) || DEFAULTS.ef_titulo,
    ef_subtitulo: parseStr(input.ef_subtitulo),
    ef_etiqueta: parseStr(input.ef_etiqueta),
    ef_horario: parseStr(input.ef_horario),
    ac_habilitado: parseBool(input.ac_habilitado, true),
    ac_titulo: parseStr(input.ac_titulo) || DEFAULTS.ac_titulo,
    ac_subtitulo: parseStr(input.ac_subtitulo),
    ac_etiqueta: parseStr(input.ac_etiqueta),
    ac_descripcion: parseStr(input.ac_descripcion),
    ac_respuesta: parseStr(input.ac_respuesta),
  };
}

module.exports = ({ strapi }) => ({
  async get() {
    let record = null;
    if (strapi.documents) {
      record = await strapi.documents(UID).findFirst();
    } else if (strapi.entityService) {
      const list = await strapi.entityService.findMany(UID);
      record = Array.isArray(list) ? list[0] : list;
    } else if (strapi.db) {
      record = await strapi.db.query(UID).findOne();
    }
    return { ...DEFAULTS, ...(record || {}) };
  },

  async update(payload) {
    const cleanData = sanitize(payload);
    let record = null;
    if (strapi.documents) {
      record = await strapi.documents(UID).findFirst();
      if (record?.documentId) {
        return await strapi.documents(UID).update({
          documentId: record.documentId,
          data: cleanData,
        });
      }
      return await strapi.documents(UID).create({ data: cleanData });
    }
    if (strapi.entityService) {
      const list = await strapi.entityService.findMany(UID);
      record = Array.isArray(list) ? list[0] : list;
      if (record?.id) {
        return await strapi.entityService.update(UID, record.id, { data: cleanData });
      }
      return await strapi.entityService.create(UID, { data: cleanData });
    }
    if (strapi.db) {
      record = await strapi.db.query(UID).findOne();
      if (record?.id) {
        return await strapi.db.query(UID).update({ where: { id: record.id }, data: cleanData });
      }
      return await strapi.db.query(UID).create({ data: cleanData });
    }
    return cleanData;
  },
});
