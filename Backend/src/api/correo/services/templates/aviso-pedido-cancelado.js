module.exports = function generarAvisoPedidoCancelado(emailCliente, nombreCliente, pedido) {
  const { numero_pedido } = pedido;

  return `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 8px; overflow: hidden; background-color: #ffffff;">
      <!-- Header -->
      <div style="padding: 25px; text-align: center; border-bottom: 1px solid #eee;">
        <img src="https://marybe.surcodes.com/logo-marybe.png" alt="Marybe" style="max-height: 40px; width: auto;" />
      </div>
      
      <!-- Body -->
      <div style="padding: 30px;">
        <h2 style="color: #3E0102; margin-top: 0; font-size: 20px;">Aviso sobre tu pedido, ${nombreCliente}</h2>
        <p style="color: #555; line-height: 1.6; font-size: 15px;">Te escribimos para informarte que tu pedido <strong>#${numero_pedido}</strong> ha sido <strong>Cancelado</strong>.</p>
        
        <div style="background-color: #fdf5f5; padding: 15px; border-radius: 6px; margin-top: 25px; border: 1px solid #fbdcdc;">
          <h3 style="color: #3E0102; margin-top: 0; font-size: 16px;">¿Por qué fue cancelado?</h3>
          <p style="margin: 0; color: #555; line-height: 1.5; font-size: 14px;">
            Generalmente esto ocurre por falta de pago o por algún inconveniente con el método de pago seleccionado. Si crees que se trata de un error o deseas volver a realizar el pedido, no dudes en contactarnos.
          </p>
        </div>

        <!-- Footer -->
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
          <p style="color: #888; font-size: 13px; margin-bottom: 0;">¿Tienes alguna consulta? Responde a este correo.</p>
        </div>
      </div>
    </div>
  `;
};
