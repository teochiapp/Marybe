module.exports = [
  'strapi::logger',
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:'],
          'img-src': ["'self'", 'data:', 'blob:', 'res.cloudinary.com', 'https:'],
          'media-src': ["'self'", 'data:', 'blob:', 'res.cloudinary.com', 'https:'],
          upgradeInsecureRequests: null,
        },
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
      },
      crossOriginEmbedderPolicy: false, // Prevents breaking images if they don't have CORS setup
    },
  },
  {
    name: 'strapi::cors',
    config: {
      origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'https://marybe.surcodes.com', 'https://www.marybe.surcodes.com'],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
      headers: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
      keepHeaderOnError: true,
    },
  },
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  {
    name: 'strapi::session',
    config: {
      secure: false,
    },
  },
  'strapi::favicon',
  'strapi::public',
];

