const strapi = require('@strapi/strapi')();
strapi.start().then(async () => {
  const docs = await strapi.documents('api::producto.producto').findMany({ filters: { id_original: { $eq: '4805' } } });
  console.log('Docs found:', docs.length);
  console.log(docs);
  process.exit(0);
});
