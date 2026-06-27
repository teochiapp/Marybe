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
    },
  },
});
