module.exports = function generarResetContrasena(enlace) {
  return `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 8px; overflow: hidden; background-color: #ffffff;">
      
      <!-- Header -->
      <div style="padding: 25px; text-align: center; border-bottom: 1px solid #eee;">
        <img src="https://marybe.surcodes.com/logo-marybe.png" alt="Marybe" style="display: block; margin: 0 auto; max-height: 40px; width: auto;" />
      </div>

      <!-- Body -->
      <div style="padding: 35px 30px; text-align: center;">
        <h2 style="color: #3E0102; margin-top: 0; font-size: 22px;">Recuperar contraseña</h2>
        <p style="color: #555; line-height: 1.7; font-size: 15px; margin-bottom: 8px;">
          Recibimos una solicitud para restablecer la contraseña de tu cuenta de <strong>Marybe</strong>.
        </p>
        <p style="color: #555; line-height: 1.7; font-size: 15px; margin-bottom: 30px;">
          Si fuiste vos, hacé clic en el botón de abajo. Si no solicitaste esto, podés ignorar este email.
        </p>

        <!-- CTA Button -->
        <a href="${enlace}" style="background-color: #3E0102; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: bold; font-size: 15px; display: inline-block; margin-bottom: 25px;">
          Restablecer mi contraseña
        </a>

        <p style="color: #aaa; font-size: 12px; margin-top: 20px; margin-bottom: 0;">
          El enlace expira en 24 horas. Si el botón no funciona, copiá y pegá este enlace en tu navegador:<br/>
          <a href="${enlace}" style="color: #3E0102; font-size: 11px; word-break: break-all;">${enlace}</a>
        </p>
      </div>

      <!-- Footer -->
      <div style="background-color: #f9f9f9; padding: 20px 30px; text-align: center; border-top: 1px solid #eee;">
        <p style="color: #aaa; font-size: 12px; margin: 0;">
          Si no solicitaste restablecer tu contraseña, ignorá este mensaje. Tu cuenta está segura.<br/>
          <a href="https://marybe.surcodes.com" style="color: #3E0102; text-decoration: none;">marybe.surcodes.com</a>
        </p>
      </div>

    </div>
  `;
};
