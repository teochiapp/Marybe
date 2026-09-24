module.exports = function generarConfirmacionPedidoCliente(emailCliente, nombreCliente, pedido) {
  const { numero_pedido, total, metodo_pago, productos, direccion_envio } = pedido;
  
  // Generar filas de la tabla para cada producto
  const productosHtml = (productos || []).map(item => `
    <tr>
      <td style="padding: 12px 10px; border-bottom: 1px solid #eee; text-align: left;">
        <strong>${item.producto}</strong>
        ${item.variante !== 'Única' && item.variante !== 'Envío' && item.variante !== 'Descuento' ? `<br/><small style="color: #888;">Variante: ${item.variante}</small>` : ''}
      </td>
      <td style="padding: 12px 10px; border-bottom: 1px solid #eee; text-align: center;">${item.cantidad}</td>
      <td style="padding: 12px 10px; border-bottom: 1px solid #eee; text-align: right;">$${item.precio_unitario}</td>
      <td style="padding: 12px 10px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">$${item.subtotal}</td>
    </tr>
  `).join('');

  // Generar bloque de dirección si existe
  let envioHtml = '';
  if (direccion_envio && Object.keys(direccion_envio).length > 0) {
    const direccionTexto = direccion_envio.sucursal 
      ? `<strong>Sucursal de retiro:</strong><br/>${direccion_envio.sucursal}` 
      : `<strong>Dirección de envío:</strong><br/>${direccion_envio.calle} ${direccion_envio.altura || ''} ${direccion_envio.piso_depto ? '(' + direccion_envio.piso_depto + ')' : ''}<br/>${direccion_envio.ciudad || ''}, ${direccion_envio.provincia || ''}`;

    envioHtml = `
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 6px; margin-top: 25px;">
        <h3 style="color: #3E0102; margin-top: 0; font-size: 16px;">Datos de Entrega</h3>
        <p style="margin: 0; color: #555; line-height: 1.5; font-size: 14px;">
          ${direccionTexto}
        </p>
      </div>
    `;
  }

  // Generar mensaje de Gift Card si existe
  const tieneGiftCard = (productos || []).some(item => 
    item.producto && item.producto.toLowerCase().includes('gift card')
  );

  let giftCardHtml = '';
  if (tieneGiftCard) {
    giftCardHtml = `
      <div style="background-color: #fdf5f5; padding: 15px; border-radius: 6px; margin-top: 25px; border: 1px solid #fbdcdc;">
        <h3 style="color: #3E0102; margin-top: 0; font-size: 16px;">
          🎁 Sobre tu Gift Card
        </h3>
        <p style="margin: 0; color: #555; line-height: 1.5; font-size: 14px;">
          ¡Gracias por tu compra! Te informamos que <strong>una vez que tu pago esté confirmado</strong>, recibirás un correo electrónico aparte con tu código de Gift Card e instrucciones para utilizarlo o regalárselo a quien quieras.
        </p>
      </div>
    `;
  }

  return `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 8px; overflow: hidden; background-color: #ffffff;">
      <!-- Header -->
      <div style="padding: 25px; text-align: center; border-bottom: 1px solid #eee;">
        <img src="https://marybe.surcodes.com/logo-marybe.png" alt="Marybe" style="max-height: 40px; width: auto;" />
      </div>
      
      <!-- Body -->
      <div style="padding: 30px;">
        <h2 style="color: #3E0102; margin-top: 0; font-size: 20px;">¡Gracias por tu compra, ${nombreCliente}!</h2>
        <p style="color: #555; line-height: 1.6; font-size: 15px;">Tu pedido <strong>#${numero_pedido}</strong> ha sido confirmado exitosamente y ya comenzamos a prepararlo.</p>
        
        <h3 style="color: #3E0102; margin-top: 35px; border-bottom: 2px solid #eee; padding-bottom: 10px; font-size: 16px; text-transform: uppercase;">Resumen de Compra</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px; color: #444; font-size: 14px;">
          <thead>
            <tr style="background-color: #f4f4f4;">
              <th style="padding: 12px 10px; text-align: left; border-bottom: 2px solid #ddd;">Producto</th>
              <th style="padding: 12px 10px; text-align: center; border-bottom: 2px solid #ddd;">Cant.</th>
              <th style="padding: 12px 10px; text-align: right; border-bottom: 2px solid #ddd;">Precio</th>
              <th style="padding: 12px 10px; text-align: right; border-bottom: 2px solid #ddd;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${productosHtml}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" style="padding: 15px 10px 5px; text-align: right; color: #666;">Método de Pago:</td>
              <td style="padding: 15px 10px 5px; text-align: right; text-transform: capitalize; color: #666;">${metodo_pago || 'No especificado'}</td>
            </tr>
            <tr>
              <td colspan="3" style="padding: 5px 10px 20px; text-align: right; font-weight: bold; font-size: 18px; color: #111;">Total Pagado:</td>
              <td style="padding: 5px 10px 20px; text-align: right; font-weight: bold; font-size: 18px; color: #111;">$${total}</td>
            </tr>
          </tfoot>
        </table>

        ${giftCardHtml}
        ${envioHtml}

        <!-- Footer -->
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
          <p style="color: #888; font-size: 13px; margin-bottom: 5px;">En breve te enviaremos otra notificación cuando tu pedido esté en camino o listo para retirar.</p>
          <p style="color: #888; font-size: 13px; margin-bottom: 0;">¿Tienes alguna consulta? Responde a este correo.</p>
        </div>
      </div>
    </div>
  `;
};
