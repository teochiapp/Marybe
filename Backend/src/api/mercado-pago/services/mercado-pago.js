'use strict';

module.exports = () => ({
  async crearPreferencia({ productos = [], total = 0, userEmail = '', externalReference = '', frontendUrl = '', envio = 0, descuentoGiftCard = 0 }) {
    const accessToken = process.env.MP_ACCESS_TOKEN || 'APP_USR-691693310529160-062610-1056889f46d52fffc24ade8b643e4090-3499762458';
    if (!accessToken) {
      throw new Error('Mercado Pago Access Token no configurado en el backend');
    }

    const baseFrontendUrl = frontendUrl || process.env.FRONTEND_URL || 'https://marybe.surcodes.com';

    // ── Validar con el servicio centralizado de Pedidos ──
    const customPedidoService = strapi.service('api::pedido.custom-pedido');
    let finalTotal = 0;
    let validatedItems = [];
    let costoEnvioFinal = 0;
    
    try {
      const result = await customPedidoService.validateCartAndCalculateTotal(productos, envio, descuentoGiftCard);
      finalTotal = result.finalTotal;
      validatedItems = result.validatedItems;
      costoEnvioFinal = result.costoEnvioFinal;
    } catch (err) {
      throw new Error(err.message || 'Error validando los productos para Mercado Pago');
    }

    // Transformamos los productos validados al formato de Mercado Pago
    const items = validatedItems.map((item) => {
      const title = (item.product?.nombre || 'Producto Marybe').slice(0, 250);
      const description = (item.product?.descripcion || 'Perfumería y cosmética').slice(0, 250);
      const quantity = Number(item.quantity) || 1;

      return {
        title,
        description,
        category_id: 'others',
        quantity,
        unit_price: item.validatedPrice, // Ya validado desde BD
      };
    });

    let finalItems = items;

    if (costoEnvioFinal > 0) {
      finalItems.push({
        title: 'Costo de Envío',
        description: 'Envío de pedido a domicilio o sucursal',
        category_id: 'others',
        quantity: 1,
        unit_price: costoEnvioFinal,
      });
    }

    const descuentoGcNum = Number(descuentoGiftCard || 0);
    if (descuentoGcNum > 0) {
      // Mercado Pago doesn't support negative items.
      // We must pass a single total item or apply a discount. 
      // A common workaround is to send a single item with the final price if there's a discount,
      // because unit_price cannot be negative.
      finalItems = [
        {
          title: 'Pedido Marybe (con Gift Card)',
          description: 'Compra en tienda Marybe',
          category_id: 'others',
          quantity: 1,
          unit_price: finalTotal,
        }
      ];
    }


    const body = {
      items: finalItems,
      payer: {
        email: userEmail || 'invitado@marybe.com',
      },
      back_urls: {
        success: `${baseFrontendUrl}/order-success`,
        pending: `${baseFrontendUrl}/order-success`,
        failure: `${baseFrontendUrl}/order-error`,
      },
      // auto_return: 'approved',
      binary_mode: true,
      external_reference: externalReference || `MARYBE-${Date.now()}`,
      statement_descriptor: 'MARYBE PERFUMERIA',
    };

    try {
      const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Error detallado de Mercado Pago:', JSON.stringify(data, null, 2));
        throw new Error(data.message || data.error || 'Error al crear preferencia en Mercado Pago');
      }

      return data;
    } catch (error) {
      console.error('Error en el servicio de Mercado Pago:', error);
      throw error;
    }
  },

  async consultarPago({ externalReference }) {
    const accessToken = process.env.MP_ACCESS_TOKEN || 'APP_USR-691693310529160-062610-1056889f46d52fffc24ade8b643e4090-3499762458';
    if (!accessToken) {
      throw new Error('Mercado Pago Access Token no configurado en el backend');
    }

    if (!externalReference) {
      return { pagado: false };
    }

    try {
      const response = await fetch(`https://api.mercadopago.com/v1/payments/search?external_reference=${externalReference}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Error al consultar pago en Mercado Pago:', data);
        return { pagado: false };
      }

      // Buscamos si hay algún pago aprobado en los resultados devueltos por MP
      const pagosAprobados = (data.results || []).filter(p => p.status === 'approved');

      if (pagosAprobados.length > 0) {
        return {
          pagado: true,
          paymentId: pagosAprobados[0].id,
          status: pagosAprobados[0].status,
        };
      }

      return { pagado: false };
    } catch (error) {
      console.error('Error en consultarPago service:', error);
      return { pagado: false };
    }
  },

  async procesarWebhookDePago(paymentId) {
    const accessToken = process.env.MP_ACCESS_TOKEN || 'APP_USR-691693310529160-062610-1056889f46d52fffc24ade8b643e4090-3499762458';
    
    // Obtener info del pago
    const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });
    
    if (!response.ok) {
      throw new Error('No se pudo obtener información del pago de Mercado Pago');
    }
    
    const payment = await response.json();
    
    if (payment.status === 'approved') {
      const orderNumber = payment.external_reference;
      
      // Buscar pedido en Strapi
      const pedidos = await strapi.entityService.findMany('api::pedido.pedido', {
        filters: { numero_pedido: orderNumber },
        limit: 1
      });
      
      if (!pedidos || pedidos.length === 0) {
        console.error(`Pedido ${orderNumber} no encontrado para procesar pago.`);
        return;
      }
      
      const pedido = pedidos[0];
      
      // Si ya está pagado o completado, ignorar
      if (pedido.estado !== 'Procesando') {
        return;
      }
      
      // Actualizar estado del pedido a Pagado/Completado (usamos Completado para reflejar que está listo, o Enviado)
      // Como solo hay: Procesando, Enviado, Completado, Cancelado, lo ponemos en "Completado" o un estado custom.
      // El esquema tiene: "Procesando", "Enviado", "Completado", "Cancelado"
      // Asumamos "Completado" (o si quieres mantener Procesando pero enviar un email? Lo marcaremos como Pagado agregando un flag, pero 'Completado' es más seguro si es digital, o lo dejamos como 'Procesando' y anotamos pagado).
      // Actualizaremos el método_pago si era QR o similar para dejar registro del Payment ID.
      
      await strapi.entityService.update('api::pedido.pedido', pedido.id, {
        data: {
          estado: 'Procesando', // Lo dejamos en Procesando para la preparación física, pero marcamos que pagó.
          metodo_pago: `mercadopago (Pagado - ID: ${paymentId})`
        }
      });
      
      console.log(`Pedido ${orderNumber} marcado como pagado. Descontando stock...`);

      // ─── Lógica de Stock ───
      const productos = pedido.productos || [];
      for (const item of productos) {
        if (!item.id_producto) continue;

        const filterCriteria = isNaN(Number(item.id_producto)) 
          ? { documentId: item.id_producto } 
          : { id: item.id_producto };

        const dbProduct = await strapi.db.query('api::producto.producto').findOne({
          where: filterCriteria,
          populate: ['variantes']
        });

        if (dbProduct) {
          if (item.id_variante_original) {
            // Es una variante
            const varIndex = dbProduct.variantes.findIndex(v => v.id_original === item.id_variante_original);
            if (varIndex !== -1) {
              dbProduct.variantes[varIndex].stock = Math.max(0, (dbProduct.variantes[varIndex].stock || 0) - (item.cantidad || 1));
              await strapi.entityService.update('api::producto.producto', dbProduct.id, {
                data: { variantes: dbProduct.variantes }
              });
            }
          } else {
            // Producto simple
            await strapi.entityService.update('api::producto.producto', dbProduct.id, {
              data: { stock: Math.max(0, (dbProduct.stock || 0) - (item.cantidad || 1)) }
            });
          }
        }
      }

      // ─── Consumo y Generación de Gift Cards ───
      const crypto = require('crypto');
      
      // Buscar si consumió alguna
      const descuentoGc = productos.find(p => p.sku === 'DESCUENTO-GC');
      if (descuentoGc) {
        const regex = /\(([^)]+)\)/;
        const match = descuentoGc.producto.match(regex);
        if (match && match[1]) {
          const codigo_gift_card = match[1];
          try {
            const gcs = await strapi.entityService.findMany('api::gift-card.gift-card', {
              filters: { codigo: codigo_gift_card },
              limit: 1,
            });
            if (gcs && gcs.length > 0) {
              await strapi.entityService.update('api::gift-card.gift-card', gcs[0].id, {
                data: { activa: false }
              });
              strapi.log.info(`[Webhook MP ${orderNumber}] Gift card consumida: ${codigo_gift_card}`);
            }
          } catch (e) {
            console.error(`Error consumiendo GC ${codigo_gift_card}`, e);
          }
        }
      }
      
      // Generación
      const giftCardItems = productos.filter(item => 
        item.producto?.toLowerCase().includes('gift card') && item.sku !== 'DESCUENTO-GC'
      );

      if (giftCardItems.length > 0) {
        const createdGCs = [];
        for (const item of giftCardItems) {
          const monto = item.precio_unitario || 0;
          const cantidad = item.cantidad || 1;

          for (let i = 0; i < cantidad; i++) {
            let codigo;
            let attempts = 0;
            while (attempts < 10) {
              const candidato = 'GC-' + crypto.randomBytes(4).toString('hex').toUpperCase();
              const existente = await strapi.entityService.findMany('api::gift-card.gift-card', {
                filters: { codigo: candidato },
                limit: 1,
              });
              if (!existente || existente.length === 0) {
                codigo = candidato;
                break;
              }
              attempts++;
            }

            if (codigo) {
              const fechaExpiracion = new Date();
              fechaExpiracion.setFullYear(fechaExpiracion.getFullYear() + 1);

              await strapi.entityService.create('api::gift-card.gift-card', {
                data: {
                  codigo,
                  monto,
                  activa: true,
                  fecha_expiracion: fechaExpiracion.toISOString(),
                },
              });
              createdGCs.push(codigo);
            }
          }
        }
        strapi.log.info(`[Webhook MP ${orderNumber}] ${createdGCs.length} Gift Cards generadas: ${createdGCs.join(', ')}`);
      }
    }
  }
});
