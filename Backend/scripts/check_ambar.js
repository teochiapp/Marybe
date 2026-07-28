const { createStrapi } = require('@strapi/strapi');

(async () => {
  const app = await createStrapi().load();
  const productos = await app.db.query('api::producto.producto').findMany({
    where: { nombre: { $contains: 'AMBAR NEGRO' } },
    populate: ['variantes']
  });
  console.dir(productos, { depth: null });
  process.exit(0);
})();
