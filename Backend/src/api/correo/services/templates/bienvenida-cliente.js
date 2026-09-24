module.exports = function generarBienvenidaCliente(nombreCliente) {
  return `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 8px; overflow: hidden; background-color: #ffffff;">
      
      <!-- Header -->
      <div style="padding: 25px; text-align: center; border-bottom: 1px solid #eee;">
        <img src="https://marybe.surcodes.com/logo-marybe.png" alt="Marybe" style="display: block; margin: 0 auto; max-height: 40px; width: auto;" />
      </div>

      <!-- Body -->
      <div style="padding: 35px 30px; text-align: center;">
        <h2 style="color: #3E0102; margin-top: 0; font-size: 22px;">¡Bienvenido a Marybe, ${nombreCliente}!</h2>
        <p style="color: #555; line-height: 1.7; font-size: 15px; margin-bottom: 8px;">
          Nos alegra tenerte con nosotros. En Marybe encontrarás una cuidada selección de fragancias, perfumes y productos de hogar pensados para hacer tu vida más especial.
        </p>
        <p style="color: #555; line-height: 1.7; font-size: 15px; margin-bottom: 30px;">
          Explorá nuestro catálogo y encontrá tu fragancia favorita.
        </p>

        <!-- CTA Button -->
        <a href="https://marybe.surcodes.com" style="background-color: #3E0102; color: #ffffff; text-decoration: none; padding: 13px 30px; border-radius: 5px; font-weight: bold; font-size: 15px; display: inline-block;">
          Explorar la tienda
        </a>
      </div>

      <!-- Footer -->
      <div style="background-color: #f9f9f9; padding: 20px 30px; text-align: center; border-top: 1px solid #eee;">
        <p style="color: #aaa; font-size: 12px; margin: 0;">
          Recibiste este correo porque creaste una cuenta en <a href="https://marybe.surcodes.com" style="color: #3E0102; text-decoration: none;">marybe.surcodes.com</a>.<br/>
          Si no fuiste vos, podés ignorar este mensaje.
        </p>
      </div>

    </div>
  `;
};
