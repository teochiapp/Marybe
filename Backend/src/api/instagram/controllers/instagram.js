'use strict';

// Caché en memoria del servidor
let cachedFeed = null;
let lastFetchTime = null;
const CACHE_TTL = 1000 * 60 * 60 * 24; // 24 horas

module.exports = {
  async getFeed(ctx) {
    try {
      const now = Date.now();
      
      // 1. Devolver desde el caché de memoria si es válido
      if (cachedFeed && lastFetchTime && (now - lastFetchTime < CACHE_TTL)) {
        return ctx.send(cachedFeed);
      }

      // 2. Traer configuración de variables de entorno (.env de Strapi)
      const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
      const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST;
      const INSTAGRAM_USER_ID = process.env.INSTAGRAM_USER_ID || '8213928671';

      if (!RAPIDAPI_KEY || !RAPIDAPI_HOST) {
        return ctx.badRequest('Configuración de API de Instagram faltante en el servidor');
      }

      const url = `https://${RAPIDAPI_HOST}/ig/posts/?id_user=${INSTAGRAM_USER_ID}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'x-rapidapi-key': RAPIDAPI_KEY,
          'x-rapidapi-host': RAPIDAPI_HOST,
        },
      });

      if (!response.ok) {
        // Si hay error (ej. Rate Limit), intentamos devolver caché vencido si existe para no romper la app
        if (cachedFeed) {
          strapi.log.warn(`Instagram API falló con status ${response.status}. Devolviendo caché vencido.`);
          return ctx.send(cachedFeed);
        }
        return ctx.status(response.status).send({ error: 'Error al obtener el feed de Instagram' });
      }

      const data = await response.json();
      
      const items = data?.data?.items || data?.items || data?.data || [];
      if (!Array.isArray(items)) {
        if (cachedFeed) return ctx.send(cachedFeed);
        return ctx.send([]);
      }

      // Formateamos los datos acá en el backend para enviar al frontend un JSON livianito
      const postsFormateados = items.slice(0, 10).map((post) => ({
        id:     post.id || post.pk,
        code:   post.code || post.shortcode,
        titulo: post.caption?.text
          ? post.caption.text.substring(0, 50) + '...'
          : 'Ver en Instagram',
        img:
          post.thumbnail_url ||
          post.image_versions2?.candidates?.[0]?.url ||
          post.display_url ||
          '/inicio/teomaquillandose.webp',
        link: `https://www.instagram.com/p/${post.code || post.shortcode}/`,
      }));

      // Actualizamos el caché
      cachedFeed = postsFormateados;
      lastFetchTime = now;

      return ctx.send(postsFormateados);

    } catch (error) {
      strapi.log.error('Error interno en Instagram endpoint:', error);
      if (cachedFeed) {
        return ctx.send(cachedFeed);
      }
      return ctx.internalServerError('Error interno del servidor');
    }
  },
};
