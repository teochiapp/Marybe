'use strict';

module.exports = ({ strapi }) => ({
  async validateCartAndCalculateTotal(productos, envioCostoFront, descuentoGiftCardFront, metodoEnvio = 'domicilio', codigoGiftCard) {
    if (!Array.isArray(productos) || productos.length === 0) throw new Error('El pedido no contiene productos.');
    if (!['domicilio', 'sucursal'].includes(metodoEnvio)) throw new Error('Método de envío inválido.');
    let finalTotal = 0;
    const validatedItems = [];
    let totalFisico = 0;
    const requestedStock = new Map();

    for (const item of productos) {
      const qty = Number(item.quantity ?? 1);
      if (!Number.isInteger(qty) || qty < 1) throw new Error('Cantidad de producto inválida.');
      let unitPrice = 0;
      
      // Check if it's a gift card purchase
      if (/^gift-card-\d+$/.test(String(item.product?.id))) {
        unitPrice = Number(String(item.product.id).slice('gift-card-'.length));
        if (!Number.isFinite(unitPrice) || unitPrice <= 0 || unitPrice > 10000000) throw new Error('Monto de gift card inválido.');
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
        if (item.variant && (item.variant.id_original != null || item.variant.id != null)) {
          const dbVariant = dbProduct.variantes?.find(v => item.variant.id_original != null
            ? String(v.id_original) === String(item.variant.id_original)
            : String(v.id) === String(item.variant.id));
          if (!dbVariant) {
            throw new Error(`Variante no encontrada para el producto: ${dbProduct.nombre}`);
          }
          
          // Stock check
          const stockKey = `${dbProduct.id}-variant-${dbVariant.id}`;
          const required = (requestedStock.get(stockKey) || 0) + qty;
          requestedStock.set(stockKey, required);
          if (dbVariant.publicado === false) throw new Error(`Variante no disponible: ${dbProduct.nombre}`);
          if (Number(dbVariant.stock || 0) < required) {
            throw new Error(`Sin stock suficiente para: ${dbProduct.nombre} (${dbVariant.volumen || dbVariant.color_nombre}). Disponible: ${dbVariant.stock}`);
          }

          const basePrice = Number(dbVariant.precio ?? dbProduct.precio);
          const offerPrice = Number(dbVariant.precio_oferta);
          unitPrice = offerPrice > 0 && offerPrice < basePrice ? offerPrice : basePrice;
          if (!Number.isFinite(unitPrice) || unitPrice <= 0) throw new Error(`Precio inválido: ${dbProduct.nombre}`);
          validatedItems.push({
            ...item,
            product: { ...item.product, nombre: dbProduct.nombre, marca: dbProduct.marca, sku: dbProduct.sku },
            variant: dbVariant,
            isGiftCard: false,
            validatedPrice: unitPrice,
            dbVariantId: dbVariant.id, // For stock deduction later
            dbProductId: dbProduct.id,
            dbVariantIdOriginal: dbVariant.id_original
          });
        } else {
          if (dbProduct.variantes?.some(v => v.volumen || v.color_nombre)) throw new Error(`Seleccioná una variante para: ${dbProduct.nombre}`);
          // No variant, check product stock directly
          const stockKey = `${dbProduct.id}-product`;
          const required = (requestedStock.get(stockKey) || 0) + qty;
          requestedStock.set(stockKey, required);
          if (Number(dbProduct.stock || 0) < required) {
            throw new Error(`Sin stock suficiente para: ${dbProduct.nombre}. Disponible: ${dbProduct.stock}`);
          }

          unitPrice = Number(dbProduct.precio_oferta || dbProduct.precio);
          if (!Number.isFinite(unitPrice) || unitPrice <= 0) throw new Error(`Precio inválido: ${dbProduct.nombre}`);
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
      const siteConfigList = await strapi.entityService.findMany('api::configuracion-general.configuracion-general');
      const siteConfig = Array.isArray(siteConfigList) ? siteConfigList[0] : siteConfigList;
      if (!siteConfig) throw new Error('Configuración de envío no disponible.');
      if (siteConfig) {
        const configEnvio = siteConfig.costo_envio ?? 0;
        const envioGratisDesde = siteConfig.envio_gratis_desde ?? null;
        
        // El envío es gratis si solo se compraron Gift Cards (totalFisico === 0), o si superan el mínimo
        const envioEsGratis = (totalFisico === 0) || (envioGratisDesde !== null && totalFisico >= envioGratisDesde);
        
        // Pickup is explicit: a client-supplied zero must not waive home delivery.
        if (metodoEnvio === 'sucursal') {
          costoEnvioFinal = 0;
        } else {
          costoEnvioFinal = envioEsGratis ? 0 : Number(configEnvio);
        }
      }
    } catch (err) {
      console.warn("Could not load configuracion-general", err);
      if (metodoEnvio !== 'sucursal' && totalFisico > 0) throw new Error('No se pudo calcular el costo de envío. Intentá nuevamente.');
      costoEnvioFinal = 0;
    }

    finalTotal += costoEnvioFinal;
    
    // Descuento Gift Card (solo validamos que no supere el total)
    // El frontend ya restó esto, nosotros lo restamos del total calculado
    const descuentoGcNum = Number(descuentoGiftCardFront || 0);
    if (!Number.isFinite(descuentoGcNum) || descuentoGcNum < 0) throw new Error('Descuento de gift card inválido.');
    if (descuentoGcNum > 0) {
      if (!codigoGiftCard) throw new Error('Falta el código de la gift card.');
      const cards = await strapi.entityService.findMany('api::gift-card.gift-card', { filters: { codigo: codigoGiftCard }, limit: 1 });
      const card = cards?.[0];
      if (!card?.activa || (card.fecha_expiracion && Date.parse(card.fecha_expiracion) <= Date.now()) || !Number.isFinite(Number(card.monto)) || Number(card.monto) <= 0) throw new Error('La gift card no está disponible.');
      if (descuentoGcNum !== Number(card.monto)) throw new Error('El descuento no coincide con la gift card.');
      finalTotal = Math.max(0, finalTotal - Number(card.monto));
    }

    // ─── Validación crítica: no permitir pedidos a $0 ───
    // Solo se permite $0 si TODOS los items son gift cards (que ya tienen precio propio)
    const soloGiftCards = validatedItems.length > 0 && validatedItems.every(i => i.isGiftCard);
    if (finalTotal <= 0 && !soloGiftCards) {
      throw new Error('No se puede procesar un pedido con total $0. Verificá que los productos tengan precio configurado.');
    }

    return {
      finalTotal,
      costoEnvioFinal,
      validatedItems
    };
  }
});
