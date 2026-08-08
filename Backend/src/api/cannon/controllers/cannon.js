'use strict';

/**
 * Cannon Integration — Controller
 *
 * GET /api/cannon/product?ean=<EAN-13>
 * Header: X-Api-Key: <clave>
 *
 * Respuestas:
 *   200  → { data: { stock: bool, price: number, url: string } }
 *   401  → clave ausente o incorrecta
 *   404  → EAN no encontrado en el catálogo
 *   400  → parámetro ean ausente
 */
module.exports = {
  async product(ctx) {
    // ── 1. Validar X-Api-Key ──────────────────────────────────────────────────
    const apiKey = ctx.request.headers['x-api-key'] || '';
    const expectedKey = process.env.CANNON_API_KEY || '';

    if (!expectedKey) {
      strapi.log.error('[Cannon] CANNON_API_KEY no configurada en variables de entorno');
      return ctx.internalServerError('Integración no configurada en el servidor.');
    }

    if (!apiKey || apiKey !== expectedKey) {
      strapi.log.warn(`[Cannon] Intento con clave inválida: "${apiKey.slice(0, 8)}..."`);
      return ctx.unauthorized('API key inválida o ausente.');
    }

    // ── 2. Validar parámetro ean ─────────────────────────────────────────────
    const ean = (ctx.query.ean || '').trim();
    if (!ean) {
      return ctx.badRequest('Parámetro requerido: ean');
    }

    strapi.log.info(`[Cannon] Consulta EAN: ${ean}`);

    // ── 3. Buscar producto ───────────────────────────────────────────────────
    try {
      const servicio = strapi.service('api::cannon.cannon');
      const resultado = await servicio.buscarPorEan(strapi, ean);

      if (!resultado) {
        strapi.log.info(`[Cannon] EAN ${ean} → 404 (no listado)`);
        return ctx.notFound('No se encontró ningún producto con ese EAN.');
      }

      const { stock, price, url } = resultado;

      // Validaciones de integridad antes de responder
      if (typeof price !== 'number' || isNaN(price) || price <= 0) {
        strapi.log.warn(`[Cannon] EAN ${ean}: precio inválido (${price}), respondiendo 404`);
        return ctx.notFound('Producto sin precio válido.');
      }
      if (!url) {
        strapi.log.warn(`[Cannon] EAN ${ean}: URL vacía, respondiendo 404`);
        return ctx.notFound('Producto sin URL válida.');
      }

      strapi.log.info(`[Cannon] EAN ${ean} → 200 (stock=${stock}, price=${price})`);

      return ctx.send({
        data: { stock, price, url },
      });

    } catch (err) {
      strapi.log.error(`[Cannon] Error al consultar EAN ${ean}: ${err.message}`);
      return ctx.internalServerError(`Error interno: ${err.message}`);
    }
  },
};
