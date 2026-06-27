'use strict';

module.exports = () => ({
  async crearPreferencia({ productos = [], total = 0, userEmail = '', externalReference = '', frontendUrl = '' }) {
    const accessToken = process.env.MP_ACCESS_TOKEN || 'APP_USR-691693310529160-062610-1056889f46d52fffc24ade8b643e4090-3499762458';
    if (!accessToken) {
      throw new Error('Mercado Pago Access Token no configurado en el backend');
    }

    const baseFrontendUrl = frontendUrl || process.env.FRONTEND_URL || 'https://marybe.surcodes.com';

    // Transformamos los productos del carrito al formato de Mercado Pago con validaciones estrictas
    const items = productos.map((item) => {
      const p = item.product || {};
      const title = (p.nombre || 'Producto Marybe').slice(0, 250);
      const description = (p.descripcion || 'Perfumería y cosmética').slice(0, 250);
      const unitPrice = Number(Number(p.precio_final || p.precio || item.price || total || 10).toFixed(2));
      const quantity = Number(item.quantity) || 1;

      return {
        title,
        description,
        category_id: 'others',
        quantity,
        unit_price: unitPrice,
      };
    });

    const finalItems = items.length > 0 ? items : [
      {
        title: 'Pedido Marybe',
        description: 'Compra en tienda Marybe',
        quantity: 1,
        unit_price: Number(Number(total || 10).toFixed(2)),
      }
    ];

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
      auto_return: 'all',
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
});
