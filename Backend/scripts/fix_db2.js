const { createStrapi } = require('@strapi/strapi');

(async () => {
  const app = await createStrapi().load();
  const productos = await app.db.query('api::producto.producto').findMany({
    populate: ['variantes'],
    limit: 5000 // Aseguramos agarrar todos
  });
  
  let fixed = 0;
  for (const p of productos) {
    if (p.variantes && p.variantes.length === 1) {
      const v = p.variantes[0];
      const hasAttributes = (v.volumen || '').trim() || (v.color_nombre || '').trim();
      
      if (!hasAttributes) {
        // En lugar de bajar el precio del producto a la variante, 
        // chequeamos si el precio del producto está vacío o nulo y la variante tiene precio
        const diffPrice = Number(v.precio) !== Number(p.precio);
        const diffOferta = Number(v.precio_oferta) !== Number(p.precio_oferta);
        const diffStock = Number(v.stock) !== Number(p.stock);
        
        if (diffPrice || diffOferta || diffStock) {
          
          // La fuente de la verdad para estos productos desfasados
          // debe ser la VARIANTE (si el producto no tiene precio), o viceversa.
          // Como estos productos dieron error, vamos a sincronizarlos.
          // Priorizamos el valor que NO sea 0 o nulo.
          
          const finalPrice = p.precio ? p.precio : v.precio;
          const finalOferta = p.precio_oferta ? p.precio_oferta : v.precio_oferta;
          const finalStock = p.stock ? p.stock : v.stock;
          
          // Actualizamos tanto el producto como la variante para que queden identicos
          v.precio = finalPrice;
          v.precio_oferta = finalOferta;
          v.stock = finalStock;
          
          await app.db.query('api::producto.producto').update({
            where: { id: p.id },
            data: {
              precio: finalPrice,
              precio_oferta: finalOferta,
              stock: finalStock,
              variantes: [v]
            }
          });
          fixed++;
          console.log(`[ID: ${p.id_original}] ${p.nombre} -> Sincronizado a $${finalPrice}`);
        }
      }
    }
  }
  
  console.log(`\n✅ ¡Terminado! Se han sincronizado ${fixed} productos críticos.`);
  process.exit(0);
})();
