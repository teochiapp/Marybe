
module.exports = ({ env }) => ({
  'users-permissions': {
    config: {
      jwtSecret: env('JWT_SECRET'),
      jwt: {
        expiresIn: '7d',
      },
      grant: {
        google: {
          enabled: true,
          key: env('GOOGLE_CLIENT_ID', ''),
          secret: env('GOOGLE_CLIENT_SECRET', ''),
          scope: ['email', 'profile'],
          callback: '/api/connect/google/callback',
          redirect_uri: `${env('PUBLIC_URL', 'https://admin.marybe.surcodes.com')}/api/connect/google/callback`,
          redirectUri: `${env('FRONTEND_URL', 'https://marybe.surcodes.com')}/?oauth_login=true`,
        },
      },
      // ── Plantillas de email personalizadas ───────────────────────────────────
      email: {
        reset_password: {
          display: 'Restablecer contraseña',
          icon: 'lock',
          options: {
            from: {
              name: 'Marybe',
              email: 'teochiapps@gmail.com',
            },
            response_email: '',
            object: 'Restablecer tu contraseña - Marybe',
            message: `
<div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 8px; overflow: hidden; background-color: #ffffff;">
  <div style="padding: 25px; text-align: center; border-bottom: 1px solid #eee;">
    <img src="https://marybe.surcodes.com/logo-marybe.png" alt="Marybe" style="display: block; margin: 0 auto; max-height: 40px; width: auto;" />
  </div>
  <div style="padding: 35px 30px; text-align: center;">
    <h2 style="color: #3E0102; margin-top: 0; font-size: 22px;">Recuperar contraseña</h2>
    <p style="color: #555; line-height: 1.7; font-size: 15px; margin-bottom: 8px;">Recibimos una solicitud para restablecer la contraseña de tu cuenta de <strong>Marybe</strong>.</p>
    <p style="color: #555; line-height: 1.7; font-size: 15px; margin-bottom: 30px;">Si fuiste vos, hacé clic en el botón de abajo. Si no solicitaste esto, podés ignorar este email.</p>
    <a href="<%= URL %>" style="background-color: #3E0102; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: bold; font-size: 15px; display: inline-block; margin-bottom: 25px;">Restablecer mi contraseña</a>
    <p style="color: #aaa; font-size: 12px; margin-top: 20px; margin-bottom: 0;">El enlace expira en 24 horas. Si el botón no funciona, copiá y pegá este enlace en tu navegador:<br/><a href="<%= URL %>" style="color: #3E0102; font-size: 11px; word-break: break-all;"><%= URL %></a></p>
  </div>
  <div style="background-color: #f9f9f9; padding: 20px 30px; text-align: center; border-top: 1px solid #eee;">
    <p style="color: #aaa; font-size: 12px; margin: 0;">Si no solicitaste restablecer tu contraseña, ignorá este mensaje. Tu cuenta está segura.<br/><a href="https://marybe.surcodes.com" style="color: #3E0102; text-decoration: none;">marybe.surcodes.com</a></p>
  </div>
</div>
            `,
          },
        },
      },
    },
  },

  // ── Plugin de Email (usado por forgot-password de Strapi) ──────────────────
  email: {
    config: {
      provider: 'nodemailer',
      providerOptions: {
        host: 'smtp-relay.brevo.com',
        port: 587,
        secure: false,
        auth: {
          user: env('BREVO_SMTP_USER'),
          pass: env('BREVO_SMTP_PASS'),
        },
      },
      settings: {
        defaultFrom: 'teochiapps@gmail.com',
        defaultReplyTo: 'teochiapps@gmail.com',
      },
    },
  },
});

