'use strict';

const crypto = require('crypto');
const guestCustomer = require('../utils/guest-customer');
const { newCheckout, fulfill } = require('../../mercado-pago/services/checkout-lifecycle');
const { verificarAdmin: verificarAdminImportacion } = require('../../../utils/admin-auth');

module.exports = {
  async createGuestOrder(ctx) {
    ctx.state.guestCheckout = true;
    return module.exports.createMyOrder(ctx);
  },
  async createMyOrder(ctx) {
    try {
      const { productos, total, metodo_pago, direccion_envio, envio, descuento_gift_card, codigo_gift_card } = ctx.request.body;
      if (!['mercadopago', 'transferencia', 'efectivo', 'aconvenir'].includes(metodo_pago)) return ctx.badRequest('Elegí un método de pago válido.');
      const metodoEnvio = ctx.request.body.metodo_envio || direccion_envio?.metodo_envio || 'domicilio';
      if (!['domicilio', 'sucursal'].includes(metodoEnvio)) return ctx.badRequest('Método de envío inválido.');
      if (metodoEnvio === 'sucursal' && (!direccion_envio?.sucursal || !direccion_envio?.provincia)) {
        return ctx.badRequest('Seleccioná una sucursal de retiro antes de pagar.');
      }

      // Strapi's JWT populates ctx.state.user when the auth header is valid
      const user = ctx.state.user;
      
      if (!user && !ctx.state.guestCheckout) {
        return ctx.unauthorized('Debe iniciar sesión para realizar un pedido');
      }
      let guest = null;
      if (ctx.state.guestCheckout) {
        if (!['mercadopago', 'transferencia', 'efectivo', 'aconvenir'].includes(metodo_pago)) return ctx.badRequest('Elegí un método de pago válido.');
        try { guest = guestCustomer(ctx.request.body.cliente); }
        catch (error) { return ctx.badRequest(error.message); }
        if (metodoEnvio === 'domicilio' && !['calle', 'numero', 'ciudad', 'provincia', 'cp'].every(field => typeof direccion_envio?.[field] === 'string' && direccion_envio[field].trim())) {
          return ctx.badRequest('Completá la dirección de entrega.');
        }
      }
      const customerEmail = guest?.email || user?.email;
      const customerName = guest ? `${guest.nombre} ${guest.apellido}` : (direccion_envio?.nombre || user?.username || 'Cliente');
      const orderAddress = { ...direccion_envio, metodo_envio: metodoEnvio, ...(guest ? { nombre: customerName, email: guest.email, telefono: guest.telefono } : {}) };

      if (!productos || !Array.isArray(productos) || productos.length === 0) {
        return ctx.badRequest('El pedido no contiene productos.');
      }

      const tieneProductosValidos = productos.some(item => (item.quantity || 0) > 0);
      if (!tieneProductosValidos) {
        return ctx.badRequest('El pedido no tiene productos con cantidad válida.');
      }

      const tieneGiftCardAplicada = Number(descuento_gift_card) > 0 && Boolean(codigo_gift_card);
      if (total === undefined || total === null || Number(total) < 0 || (Number(total) === 0 && !tieneGiftCardAplicada)) {
        return ctx.badRequest('El total del pedido debe ser mayor a $0.');
      }

      // ── Validar precios, stock y calcular total real ──
      const customPedidoService = strapi.service('api::pedido.custom-pedido');
      let finalTotal = total;
      let validatedShipping = 0;
      let validatedProducts = [];
      let validatedDiscount = Number(descuento_gift_card || 0);
      
      try {
        const { finalTotal: calculatedTotal, costoEnvioFinal, validatedItems, descuentoAplicado } = 
          await customPedidoService.validateCartAndCalculateTotal(productos, envio, descuento_gift_card, metodoEnvio, codigo_gift_card);
        
        finalTotal = calculatedTotal;
        validatedShipping = costoEnvioFinal;
        validatedProducts = validatedItems;
        if (descuentoAplicado !== undefined) {
          validatedDiscount = descuentoAplicado;
        }

        if (finalTotal < 0 || (finalTotal === 0 && !(validatedDiscount > 0 && codigo_gift_card))) {
          return ctx.badRequest('El total del pedido calculado en el servidor debe ser mayor a $0.');
        }
      } catch (err) {
        strapi?.log?.warn?.(`[Pedido] Validación rechazada: ${err.message}`);
        return ctx.badRequest(err.message || 'Error validando los productos del pedido');
      }

      // Limpiar el JSON de productos para que sea fácil de leer en el panel de administrador
      const productosLimpios = validatedProducts.map(item => {
        let imageUrl = null;
        if (item.product?.portada?.url) {
          imageUrl = item.product.portada.url;
        } else if (item.product?.portada?.data?.attributes?.url) {
          imageUrl = item.product.portada.data.attributes.url;
        }

        // Store the same authoritative variant and price used to calculate payment.

        return {
          producto: item.product?.nombre || 'Producto',
          marca: item.product?.marca || '',
          variante: [item.variant?.volumen, item.variant?.color_nombre].filter(Boolean).join(' / ') || 'Única',
          cantidad: item.quantity || 1,
          precio_unitario: item.validatedPrice,
          subtotal: item.validatedPrice * (Number(item.quantity) || 1),
          sku: item.isGiftCard ? 'GIFT-CARD' : item.variant?.sku_ean || item.product?.sku || '',
          imagen: imageUrl,
          id_producto: item.product?.id,
          id_variante_original: item.variant?.id_original,
          id_variante: item.dbVariantId
        };
      });

      if (validatedShipping > 0) {
        productosLimpios.push({
          producto: 'Costo de Envío',
          marca: '',
          variante: 'Envío',
          cantidad: 1,
          precio_unitario: validatedShipping,
          subtotal: validatedShipping,
          sku: 'ENVIO',
          imagen: null
        });
      }

      if (validatedDiscount > 0) {
        productosLimpios.push({
          producto: `Descuento por Gift Card${codigo_gift_card ? ' (' + codigo_gift_card + ')' : ''}`,
          marca: '',
          variante: 'Descuento',
          cantidad: 1,
          precio_unitario: -validatedDiscount,
          subtotal: -validatedDiscount,
          sku: 'DESCUENTO-GC',
          imagen: null
        });
      }

      const numero_pedido = `M-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
      const requiresExternalPayment = ['mercadopago', 'qr'].includes(metodo_pago) && finalTotal > 0;
      const checkout = requiresExternalPayment ? newCheckout() : null;

      const baseOrderData = {
        numero_pedido,
        productos: productosLimpios,
        total: finalTotal, // Usamos el total validado
        metodo_pago: metodo_pago || 'No especificado',
        estado: checkout ? 'Pendiente de pago' : 'Procesando',
        ...(checkout ? { pago_mercadopago: checkout.metadata } : {}),
        ...(checkout ? { estado_pago: 'not_started' } : {}),
        direccion_envio: orderAddress,
        cliente_email: customerEmail,
        es_invitado: Boolean(guest),
        ...(!guest && user ? { usuario: user.documentId || user.id } : {})
      };

      let pedido;

      // ─── Lógica para métodos de pago distintos a Mercado Pago (o cubiertos 100% por Gift Card) ───
      if (!requiresExternalPayment) {
        const executeAtomicOrder = async (trx) => {
          const createdGCs = await fulfill({ numero_pedido, productos: productosLimpios }, trx);
          const created = await strapi.entityService.create('api::pedido.pedido', {
            data: {
              ...baseOrderData,
              ...(createdGCs.length > 0 ? { gift_cards_generadas: createdGCs } : {})
            }
          });
          return created;
        };

        try {
          if (typeof strapi.db?.transaction === 'function') {
            pedido = await strapi.db.transaction(async ({ trx }) => executeAtomicOrder(trx));
          } else {
            pedido = await executeAtomicOrder(null);
          }
        } catch (err) {
          strapi?.log?.error?.(`[Pedido ${numero_pedido}] Error transaccional al confirmar pedido:`, err.message);
          if (/Stock insuficiente|Sin stock|Gift card|no encontrado|inválid/i.test(err.message || '')) {
            return ctx.badRequest(err.message);
          }
          throw err;
        }

        // ─── Enviar Correo de Confirmación ───
        try {
          const nombreCliente = customerName;
          await strapi.service('api::correo.correo').enviarConfirmacionPedido(
            customerEmail,
            nombreCliente,
            pedido
          );
          
          // Enviar alerta al administrador
          await strapi.service('api::correo.correo').enviarAlertaNuevoPedidoAdmin(pedido, nombreCliente);
        } catch (err) {
          strapi?.log?.error?.(`[Pedido ${numero_pedido}] Error enviando email:`, err);
        }
      } else {
        pedido = await strapi.entityService.create('api::pedido.pedido', {
          data: baseOrderData
        });
      }

      // ─── NOTA: Para Mercado Pago, el consumo y generación de Gift Cards y el descuento de stock 
      // se procesa en el Webhook de Mercado Pago (webhook.js / mercado-pago.js) solo cuando el pago es Aprobado.

      const { pago_mercadopago, ...publicOrder } = pedido;
      return ctx.send({ data: publicOrder, ...(checkout ? { checkoutToken: checkout.token } : {}) });
    } catch (err) {
      strapi?.log?.error?.('[Pedido] Error al crear el pedido:', err);
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

      return ctx.send({ data: pedidos.map(({ pago_mercadopago, ...pedido }) => pedido) });
    } catch (err) {
      strapi?.log?.error?.('[Pedido] Error al obtener los pedidos:', err);
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
    
    const { id } = ctx.params;

    // Obtener pedido original antes de actualizar (usamos db.query para soportar documentId de Strapi 5)
    const pedidoAntiguo = await strapi.db.query('api::pedido.pedido').findOne({
      where: { documentId: id },
      populate: { usuario: true }
    });

    if (!pedidoAntiguo) {
      return ctx.notFound('Pedido no encontrado');
    }

    // Actualizar el pedido mediante el controlador por defecto
    const response = await strapi.controller('api::pedido.pedido').update(ctx);

    // Si se actualizó correctamente, revisamos si cambió el estado
    if (response && response.data) {
      const pedidoActualizado = await strapi.db.query('api::pedido.pedido').findOne({
        where: { documentId: id },
        populate: { usuario: true }
      });

      const estadoViejo = pedidoAntiguo.estado;
      const estadoNuevo = pedidoActualizado.estado;

      // Si el estado cambió, enviar el correo correspondiente
      if (estadoViejo !== estadoNuevo) {
        const nombreCliente = pedidoActualizado.direccion_envio?.nombre || pedidoActualizado.usuario?.username || pedidoActualizado.usuario?.nombre || 'Cliente';
        const emailCliente = pedidoActualizado.cliente_email || pedidoActualizado.usuario?.email;

        if (emailCliente) {
          try {
            if (estadoNuevo === 'Enviado') {
              await strapi.service('api::correo.correo').enviarAvisoPedidoEnviado(emailCliente, nombreCliente, pedidoActualizado);
            } else if (estadoNuevo === 'Completado') {
              await strapi.service('api::correo.correo').enviarAvisoPedidoCompletado(emailCliente, nombreCliente, pedidoActualizado);
            } else if (estadoNuevo === 'Cancelado') {
              await strapi.service('api::correo.correo').enviarAvisoPedidoCancelado(emailCliente, nombreCliente, pedidoActualizado);
            }
          } catch (error) {
            strapi.log.error(`Error enviando email de estado ${estadoNuevo} para pedido ${pedidoActualizado.numero_pedido}:`, error);
          }
        }
      }
    }

    return response;
  },

  async adminDelete(ctx) {
    if (!verificarAdminImportacion(ctx)) return ctx.unauthorized('No autenticado o sesión expirada');
    const { id } = ctx.params || {};
    const snapshot = await strapi.db?.query?.('api::pedido.pedido')?.findOne?.({ where: { documentId: id } }).catch?.(() => null);
    strapi?.log?.info?.(`[AUDIT] action=DELETE_PEDIDO documentId=${id} numero_pedido=${snapshot?.numero_pedido || 'N/A'} total=${snapshot?.total ?? 'N/A'} timestamp=${new Date().toISOString()}`);
    return await strapi.controller('api::pedido.pedido').delete(ctx);
  }
};
