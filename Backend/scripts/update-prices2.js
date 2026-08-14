const { createStrapi } = require('@strapi/strapi');

async function updatePrices() {
  const app = await createStrapi().load();
  
  console.log('Fetching all products...');
  
  const products = await app.db.query('api::producto.producto').findMany({
    populate: ['variantes'],
    limit: 10000
  });
  
  console.log(`Found ${products.length} products. Updating...`);
  
  let updatedCount = 0;
  
  for (const product of products) {
    let min = Infinity;
    let max = -Infinity;
  
    // Root
    const rootPrice = parseFloat(product.precio_oferta) || parseFloat(product.precio);
    if (rootPrice) {
      if (rootPrice < min) min = rootPrice;
      if (rootPrice > max) max = rootPrice;
    }
  
    // Variantes
    if (product.variantes && Array.isArray(product.variantes)) {
      product.variantes.forEach(v => {
        const vPrice = parseFloat(v.precio_oferta) || parseFloat(v.precio);
        if (vPrice) {
          if (vPrice < min) min = vPrice;
          if (vPrice > max) max = vPrice;
        }
      });
    }
    
    const minCalculated = min !== Infinity ? min : null;
    const maxCalculated = max !== -Infinity ? max : null;
    
    if (product.precio_minimo_calculado !== minCalculated || product.precio_maximo_calculado !== maxCalculated) {
      await app.db.query('api::producto.producto').update({
        where: { id: product.id },
        data: {
          precio_minimo_calculado: minCalculated,
          precio_maximo_calculado: maxCalculated
        }
      });
      updatedCount++;
    }
  }
  
  console.log(`Updated ${updatedCount} products successfully.`);
  process.exit(0);
}

updatePrices().catch(err => {
  console.error(err);
  process.exit(1);
});
