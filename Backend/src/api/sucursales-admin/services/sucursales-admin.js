'use strict';

const UID = 'api::pagina-sucursales.pagina-sucursales';

const DEFAULTS = {
  titulo: 'Nuestras Sucursales',
  sucursales: [],
};

function parseStr(val) {
  return val != null ? String(val).trim() : '';
}

function sanitizeSucursal(item = {}, index = 0) {
  const calle = parseStr(item.calle || item.direccion);
  const provincia = parseStr(item.provincia);

  if (!calle && !provincia) {
    return null; // fila vacía descartable
  }

  if (!calle) {
    const err = new Error(`La sucursal #${index + 1} requiere una calle o dirección.`);
    err.status = 400;
    throw err;
  }

  if (!provincia) {
    const err = new Error(`La sucursal #${index + 1} (${calle}) requiere una provincia.`);
    err.status = 400;
    throw err;
  }

  return {
    ...(item.id != null ? { id: item.id } : {}),
    provincia,
    ciudad: parseStr(item.ciudad),
    calle,
    numero_celular: parseStr(item.numero_celular || item.telefono),
    numero_fijo: parseStr(item.numero_fijo || item.telefonoFijo),
    embed_google_maps: parseStr(item.embed_google_maps || item.mapa),
  };
}

function sanitize(input = {}) {
  const titulo = parseStr(input.titulo) || DEFAULTS.titulo;
  const rawList = Array.isArray(input.sucursales) ? input.sucursales : [];
  const sucursales = rawList
    .map((item, idx) => sanitizeSucursal(item, idx))
    .filter(Boolean);

  return { titulo, sucursales };
}

module.exports = ({ strapi }) => ({
  async get() {
    let record = null;
    if (strapi.documents) {
      record = await strapi.documents(UID).findFirst({ populate: ['sucursales'] });
    } else if (strapi.entityService) {
      const list = await strapi.entityService.findMany(UID, { populate: ['sucursales'] });
      record = Array.isArray(list) ? list[0] : list;
    } else if (strapi.db) {
      record = await strapi.db.query(UID).findOne({ populate: ['sucursales'] });
    }

    if (!record) return { ...DEFAULTS };

    return {
      titulo: record.titulo || DEFAULTS.titulo,
      sucursales: Array.isArray(record.sucursales) ? record.sucursales.map(s => ({
        id: s.id,
        provincia: s.provincia || '',
        ciudad: s.ciudad || '',
        calle: s.calle || '',
        numero_celular: s.numero_celular || '',
        numero_fijo: s.numero_fijo || '',
        embed_google_maps: s.embed_google_maps || '',
      })) : [],
    };
  },

  async update(payload) {
    const cleanData = sanitize(payload);

    if (strapi.documents) {
      let record = await strapi.documents(UID).findFirst({ populate: ['sucursales'] });
      if (record?.documentId) {
        return await strapi.documents(UID).update({
          documentId: record.documentId,
          data: cleanData,
        });
      }
      return await strapi.documents(UID).create({ data: cleanData });
    }

    if (strapi.entityService) {
      const list = await strapi.entityService.findMany(UID, { populate: ['sucursales'] });
      const record = Array.isArray(list) ? list[0] : list;
      if (record?.id) {
        return await strapi.entityService.update(UID, record.id, { data: cleanData });
      }
      return await strapi.entityService.create(UID, { data: cleanData });
    }

    if (strapi.db) {
      const record = await strapi.db.query(UID).findOne();
      if (record?.id) {
        return await strapi.db.query(UID).update({ where: { id: record.id }, data: cleanData });
      }
      return await strapi.db.query(UID).create({ data: cleanData });
    }

    return cleanData;
  },
});
