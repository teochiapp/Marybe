const { createStrapi } = require('@strapi/strapi');
(async () => {
  const app = await createStrapi().load();
  const productos = await app.db.query('api::producto.producto').findMany({
    populate: ['variantes']
  });
  
  let fixed = 0;
  for (const p of productos) {
    if (p.variantes && p.variantes.length === 1) {
      const v = p.variantes[0];
      const hasAttributes = (v.volumen || '').trim() || (v.color_nombre || '').trim();
      
      if (!hasAttributes) {
        // Sync variant with product
        const changed = v.precio !== p.precio || v.stock !== p.stock || v.precio_oferta !== p.precio_oferta;
        if (changed) {
          v.precio = p.precio;
          v.precio_oferta = p.precio_oferta;
          v.stock = p.stock;
          v.sku_ean = p.sku;
          
          await app.db.query('api::producto.producto').update({
            where: { id: p.id },
            data: {
              variantes: [v]
            }
          });
          fixed++;
          console.log(`Fixed product ${p.id_original} (${p.nombre})`);
        }
      }
    }
  }
  console.log(`Done. Fixed ${fixed} products.`);
  process.exit(0);
})();
