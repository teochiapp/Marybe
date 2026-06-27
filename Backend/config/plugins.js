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
          callback: `${env('FRONTEND_URL', 'https://marybe.surcodes.com')}/auth/google/callback`,
          scope: ['email', 'profile'],
        },
      },
    },
  },
});
