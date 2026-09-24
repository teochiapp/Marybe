module.exports = function generarAvisoPedidoCompletado(emailCliente, nombreCliente, pedido) {
  const { numero_pedido, gift_cards_generadas } = pedido;

  let giftCardHtml = '';
  if (gift_cards_generadas && Array.isArray(gift_cards_generadas) && gift_cards_generadas.length > 0) {
    const codigosHtml = gift_cards_generadas.map(code => 
      `<div style="background-color: #ffffff; padding: 10px 15px; border-radius: 4px; border: 1px dashed #ccc; font-family: monospace; font-size: 16px; color: #333; margin-bottom: 8px; font-weight: bold; text-align: center;">${code}</div>`
    ).join('');

    giftCardHtml = `
      <div style="background-color: #fdf5f5; padding: 25px 20px; border-radius: 8px; margin-top: 25px; border: 1px solid #fbdcdc; text-align: center;">
        <h3 style="color: #3E0102; margin: 0 0 15px 0; font-size: 20px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase;">Tu Gift Card está lista</h3>
        <p style="margin: 0 0 20px 0; color: #555; line-height: 1.5; font-size: 15px;">
          Como parte de tu compra, has adquirido una Gift Card. Aquí tienes tu código:
        </p>
        ${codigosHtml}
        <p style="margin: 15px 0 0 0; color: #555; line-height: 1.5; font-size: 14px;">
          <strong>¿Cómo usarla?</strong> Puedes ingresar este código en la sección de pago durante tu próxima compra, o reenviarle este correo a la persona a la que deseas regalárselo para que lo utilice en nuestra tienda online.
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
        <h2 style="color: #3E0102; margin-top: 0; font-size: 20px;">Tu pedido ha sido completado</h2>
        <p style="color: #555; line-height: 1.6; font-size: 15px;">Hola ${nombreCliente}, te confirmamos que tu pedido <strong>#${numero_pedido}</strong> ha finalizado su proceso y ha sido marcado como completado exitosamente.</p>
        
        ${giftCardHtml}

        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 6px; margin-top: 25px;">
          <h3 style="color: #3E0102; margin-top: 0; font-size: 16px;">Gracias por tu compra</h3>
          <p style="margin: 0; color: #555; line-height: 1.5; font-size: 14px;">
            Agradecemos sinceramente que nos hayas elegido. Esperamos que disfrutes de la experiencia y de la calidad de tus productos.
          </p>
        </div>

        <!-- Footer -->
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
          <p style="color: #888; font-size: 13px; margin-bottom: 0;">Ante cualquier duda, consulta o inconveniente, simplemente responde a este correo.</p>
        </div>
      </div>
    </div>
  `;
};
