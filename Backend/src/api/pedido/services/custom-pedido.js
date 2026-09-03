'use strict';

module.exports = ({ strapi }) => ({
  async validateCartAndCalculateTotal(productos, envioCostoFront, descuentoGiftCardFront) {
    let finalTotal = 0;
    const validatedItems = [];
    let totalFisico = 0;

    for (const item of productos) {
      const qty = Number(item.quantity) || 1;
      let unitPrice = 0;
      
      // Check if it's a gift card purchase
      if (item.product?.id?.toString().startsWith('gift-card-') || item.product?.nombre?.toLowerCase().includes('gift card')) {
        unitPrice = Number(item.price || item.product?.precio || 0);
        validatedItems.push({
          ...item,
          isGiftCard: true,
          validatedPrice: unitPrice
        });
      } else {
        // Real product from DB - Query by id or documentId depending on the type
        const filterCriteria = isNaN(Number(item.product.id)) 
          ? { documentId: item.product.id } 
          : { id: item.product.id };

        const dbProduct = await strapi.db.query('api::producto.producto').findOne({
          where: filterCriteria,
          populate: ['variantes']
        });

        if (!dbProduct) {
          throw new Error(`Producto no encontrado: ${item.product?.nombre} (ID: ${item.product?.id})`);
        }

        // Check for variant
        if (item.variant && item.variant.id_original) {
          const dbVariant = dbProduct.variantes?.find(v => v.id_original === item.variant.id_original);
          if (!dbVariant) {
            throw new Error(`Variante no encontrada para el producto: ${dbProduct.nombre}`);
          }
          
          // Stock check
          if (dbVariant.stock < qty) {
            throw new Error(`Sin stock suficiente para: ${dbProduct.nombre} (${dbVariant.volumen || dbVariant.color_nombre}). Disponible: ${dbVariant.stock}`);
          }

          unitPrice = Number(dbVariant.precio_oferta || dbVariant.precio);
          validatedItems.push({
            ...item,
            isGiftCard: false,
            validatedPrice: unitPrice,
            dbVariantId: dbVariant.id, // For stock deduction later
            dbProductId: dbProduct.id,
            dbVariantIdOriginal: dbVariant.id_original
          });
        } else {
          // No variant, check product stock directly
          if (dbProduct.stock < qty) {
            throw new Error(`Sin stock suficiente para: ${dbProduct.nombre}. Disponible: ${dbProduct.stock}`);
          }

          unitPrice = Number(dbProduct.precio_oferta || dbProduct.precio);
          validatedItems.push({
            ...item,
            isGiftCard: false,
            validatedPrice: unitPrice,
            dbProductId: dbProduct.id
          });
        }
        totalFisico += unitPrice * qty;
      }

      finalTotal += unitPrice * qty;
    }

    // Shipping cost logic
    let costoEnvioFinal = 0;
    try {
      const siteConfig = await strapi.entityService.findMany('api::configuracion-general.configuracion-general');
      if (siteConfig) {
        const configEnvio = siteConfig.costo_envio ?? 0;
        const envioGratisDesde = siteConfig.envio_gratis_desde ?? null;
        
        // El envío es gratis si solo se compraron Gift Cards (totalFisico === 0), o si superan el mínimo
        const envioEsGratis = (totalFisico === 0) || (envioGratisDesde !== null && totalFisico >= envioGratisDesde);
        
        // We also check if the frontend sent 0 for shipping (maybe it's in-store pickup)
        if (Number(envioCostoFront) === 0) {
          costoEnvioFinal = 0;
        } else {
          costoEnvioFinal = envioEsGratis ? 0 : configEnvio;
        }
      }
    } catch (err) {
      console.warn("Could not load configuracion-general", err);
      costoEnvioFinal = Number(envioCostoFront || 0); // fallback to frontend
    }

    finalTotal += costoEnvioFinal;
    
    // Descuento Gift Card (solo validamos que no supere el total)
    // El frontend ya restó esto, nosotros lo restamos del total calculado
    const descuentoGcNum = Number(descuentoGiftCardFront || 0);
    if (descuentoGcNum > 0) {
      finalTotal = Math.max(0, finalTotal - descuentoGcNum);
    }

    return {
      finalTotal,
      costoEnvioFinal,
      validatedItems
    };
  }
});
