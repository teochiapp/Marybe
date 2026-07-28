const { createStrapi } = require('@strapi/strapi');

(async () => {
  const app = await createStrapi().load();
  const p = await app.db.query('api::producto.producto').findOne({
    where: { id_original: '4761' },
    populate: ['variantes']
  });
  console.dir(p, { depth: null });
  process.exit(0);
})();
