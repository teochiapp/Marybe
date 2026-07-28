const { createStrapi } = require('@strapi/strapi');

(async () => {
  console.log('Iniciando chequeo de precios...');
  const app = await createStrapi().load();
  
  // Buscar todos los productos con sus variantes
  const productos = await app.db.query('api::producto.producto').findMany({
    populate: ['variantes'],
    where: { publicado: true } // Opcional: solo chequear los publicados
  });
  
  let discrepancias = 0;
  
  console.log('====================================================');
  console.log('🔍 REPORTE DE DISCREPANCIAS DE PRECIOS');
  console.log('====================================================');

  for (const p of productos) {
    if (!p.variantes || p.variantes.length === 0) {
      console.log(`⚠️  [ID: ${p.id_original}] ${p.nombre}`);
      console.log(`   -> No tiene variantes. Precio producto: ${p.precio}`);
      continue;
    }

    // Chequeamos cada variante del producto
    for (const v of p.variantes) {
      // Consideramos que hay una discrepancia si el precio de la variante no coincide
      // con el precio base del producto.
      // (Nota: Si es normal que las variantes de distintos tamaños tengan distintos precios, 
      // esto te mostrará esos casos como información útil).
      if (Number(v.precio) !== Number(p.precio)) {
        discrepancias++;
        
        const descVariante = [v.volumen, v.color_nombre].filter(Boolean).join(' - ') || 'Variante Genérica';
        
        console.log(`❌ [ID: ${p.id_original}] ${p.nombre}`);
        console.log(`   -> Precio del Producto: $${p.precio}`);
        console.log(`   -> Precio de Variante (${descVariante}): $${v.precio}`);
        console.log(`----------------------------------------------------`);
      }
    }
  }

  if (discrepancias === 0) {
    console.log('✅ ¡Excelente! No se encontraron discrepancias. Todos los precios de los productos coinciden con sus variantes.');
  } else {
    console.log(`\n⚠️  Se encontraron ${discrepancias} casos donde el precio de la variante difiere del producto principal.`);
    console.log('Esto es normal si vendes distintos tamaños a distintos precios, pero si es una "Variante Genérica", indica un error de actualización.');
  }

  process.exit(0);
})();
