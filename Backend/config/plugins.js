module.exports = ({ env }) => ({
  'users-permissions': {
    config: {
      grant: {
        google: {
          enabled: true,
          key: env('GOOGLE_CLIENT_ID', ''),
          secret: env('GOOGLE_CLIENT_SECRET', ''),
          scope: ['email', 'profile'],
          callback: '/api/connect/google/callback',
          redirect_uri: `${env('PUBLIC_URL', 'http://localhost:1337')}/api/connect/google/callback`,
        },
      },
    },
  },
});
