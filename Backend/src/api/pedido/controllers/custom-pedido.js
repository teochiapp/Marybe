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
      const { productos, total, metodo_pago, direccion_envio } = ctx.request.body;

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
