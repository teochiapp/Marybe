'use strict';

const crypto = require('crypto');
const jwt = require('jsonwebtoken');

function verificarAdminImportacion(ctx) {
  const authHeader = ctx.request.header.authorization || '';
  const token = authHeader.replace('Bearer ', '').trim();
  if (!token) return false;

  try {
    const secret = strapi.config.get('plugin.users-permissions.jwtSecret') || 'custom-secret-key';
    const payload = jwt.verify(token, secret);
    return payload.isAdminImport === true;
  } catch (err) {
    return false;
  }
}

module.exports = {
  async createMyOrder(ctx) {
    try {
      const { productos, total, metodo_pago, direccion_envio, envio, descuento_gift_card, codigo_gift_card } = ctx.request.body;

      // Strapi's JWT populates ctx.state.user when the auth header is valid
      const user = ctx.state.user;
      
      if (!user) {
        return ctx.unauthorized('Debe iniciar sesión para realizar un pedido');
      }

      if (!productos || !total) {
        return ctx.badRequest('Faltan datos del pedido (productos, total)');
      }

      // Limpiar el JSON de productos para que sea fácil de leer en el panel de administrador
      const productosLimpios = productos.map(item => {
        let imageUrl = null;
        if (item.product?.portada?.url) {
          imageUrl = item.product.portada.url;
        } else if (item.product?.portada?.data?.attributes?.url) {
          imageUrl = item.product.portada.data.attributes.url;
        }

        return {
          producto: item.product?.nombre || 'Producto',
          marca: item.product?.marca || '',
          variante: item.variant?.volumen || item.variant?.color_nombre || 'Única',
          cantidad: item.quantity || 1,
          precio_unitario: item.price || 0,
          subtotal: (item.price || 0) * (item.quantity || 1),
          sku: item.variant?.sku_ean || '',
          imagen: imageUrl
        };
      });

      if (envio > 0) {
        productosLimpios.push({
          producto: 'Costo de Envío',
          marca: '',
          variante: 'Envío',
          cantidad: 1,
          precio_unitario: envio,
          subtotal: envio,
          sku: 'ENVIO',
          imagen: null
        });
      }

      if (descuento_gift_card > 0) {
        productosLimpios.push({
          producto: `Descuento por Gift Card${codigo_gift_card ? ' (' + codigo_gift_card + ')' : ''}`,
          marca: '',
          variante: 'Descuento',
          cantidad: 1,
          precio_unitario: -descuento_gift_card,
          subtotal: -descuento_gift_card,
          sku: 'DESCUENTO-GC',
          imagen: null
        });
      }

      const numero_pedido = `M-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

      const pedido = await strapi.entityService.create('api::pedido.pedido', {
        data: {
          numero_pedido,
          productos: productosLimpios,
          total,
          metodo_pago: metodo_pago || 'No especificado',
          estado: 'Procesando',
          direccion_envio: direccion_envio || {},
          cliente_email: user.email,
          usuario: user.documentId || user.id
        }
      });

      // ─── Consumo de Gift Card Aplicada ───
      if (codigo_gift_card) {
        try {
          const gcs = await strapi.entityService.findMany('api::gift-card.gift-card', {
            filters: { codigo: codigo_gift_card },
            limit: 1,
          });
          if (gcs && gcs.length > 0) {
            await strapi.entityService.update('api::gift-card.gift-card', gcs[0].id, {
              data: { activa: false }
            });
            strapi.log.info(`[Pedido ${numero_pedido}] Gift card consumida: ${codigo_gift_card}`);
          }
        } catch (err) {
          strapi.log.error(`[Pedido ${numero_pedido}] Error consumiendo gift card:`, err);
        }
      }

      // ─── Generación de Nuevas Gift Cards ───
      try {
        const giftCardItems = productos.filter(item => 
          item.product?.id?.toString().startsWith('gift-card-') ||
          item.product?.nombre?.toLowerCase().includes('gift card')
        );

        if (giftCardItems.length > 0) {
          const createdGCs = [];
          for (const item of giftCardItems) {
            const monto = item.price || item.product?.precio || 0;
            const cantidad = item.quantity || 1;

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
          strapi.log.info(`[Pedido ${numero_pedido}] ${createdGCs.length} Gift Cards generadas: ${createdGCs.join(', ')}`);
        }
      } catch (err) {
        strapi.log.error(`[Pedido ${numero_pedido}] Error generando gift cards:`, err);
      }

      return ctx.send({ data: pedido });
    } catch (err) {
      console.error(err);
      return ctx.internalServerError('Error al crear el pedido');
    }
  },

  async getMyOrders(ctx) {
    try {
      const user = ctx.state.user;
      
      if (!user) {
        return ctx.unauthorized('Debe iniciar sesión para ver sus pedidos');
      }

      const pedidos = await strapi.entityService.findMany('api::pedido.pedido', {
        filters: { usuario: user.id },
        sort: { createdAt: 'desc' },
      });

      return ctx.send({ data: pedidos });
    } catch (err) {
      console.error(err);
      return ctx.internalServerError('Error al obtener los pedidos');
    }
  },

  // ─── Bypass Admin ────────────────────────────────────────────────────────────

  async adminFind(ctx) {
    if (!verificarAdminImportacion(ctx)) return ctx.unauthorized('No autenticado o sesión expirada');
    return await strapi.controller('api::pedido.pedido').find(ctx);
  },

  async adminUpdate(ctx) {
    if (!verificarAdminImportacion(ctx)) return ctx.unauthorized('No autenticado o sesión expirada');
    return await strapi.controller('api::pedido.pedido').update(ctx);
  },

  async adminDelete(ctx) {
    if (!verificarAdminImportacion(ctx)) return ctx.unauthorized('No autenticado o sesión expirada');
    return await strapi.controller('api::pedido.pedido').delete(ctx);
  }
};
