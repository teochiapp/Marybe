module.exports = function generarAvisoPedidoEnviado(emailCliente, nombreCliente, pedido) {
  const { numero_pedido, direccion_envio, codigo_seguimiento } = pedido;
  
  let envioHtml = '';
  if (direccion_envio && Object.keys(direccion_envio).length > 0) {
    const direccionTexto = direccion_envio.sucursal 
      ? `<strong>Sucursal de retiro:</strong><br/>${direccion_envio.sucursal}` 
      : `<strong>Dirección de entrega:</strong><br/>${direccion_envio.calle} ${direccion_envio.altura || ''} ${direccion_envio.piso_depto ? '(' + direccion_envio.piso_depto + ')' : ''}<br/>${direccion_envio.ciudad || ''}, ${direccion_envio.provincia || ''}`;

    envioHtml = `
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 6px; margin-top: 25px;">
        <h3 style="color: #3E0102; margin-top: 0; font-size: 16px;">Datos de Entrega</h3>
        <p style="margin: 0; color: #555; line-height: 1.5; font-size: 14px;">
          ${direccionTexto}
        </p>
      </div>
    `;
  }

  let trackingHtml = '';
  if (codigo_seguimiento) {
    trackingHtml = `
      <div style="background-color: #f0f8ff; padding: 15px; border-radius: 6px; margin-top: 25px; border: 1px solid #cce5ff;">
        <h3 style="color: #004085; margin-top: 0; font-size: 16px;">📦 Seguimiento de tu envío</h3>
        <p style="margin: 0; color: #555; line-height: 1.5; font-size: 14px;">
          Tu código de seguimiento es: <strong style="font-size: 16px; color: #004085;">${codigo_seguimiento}</strong>
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
        <h2 style="color: #3E0102; margin-top: 0; font-size: 20px;">¡Buenas noticias, ${nombreCliente}!</h2>
        <p style="color: #555; line-height: 1.6; font-size: 15px;">Tu pedido <strong>#${numero_pedido}</strong> ya fue <strong>Enviado</strong> y se encuentra en camino.</p>
        
        ${trackingHtml}
        ${envioHtml}

        <!-- Footer -->
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
          <p style="color: #888; font-size: 13px; margin-bottom: 5px;">Recibirás otra notificación cuando el pedido sea entregado.</p>
          <p style="color: #888; font-size: 13px; margin-bottom: 0;">¿Tienes alguna consulta? Responde a este correo.</p>
        </div>
      </div>
    </div>
  `;
};
