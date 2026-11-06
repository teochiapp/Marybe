'use strict';

const crypto = require('crypto');
const path = require('path');
const jwt = require('jsonwebtoken');

const ALLOWED_IMAGE_MIMES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
]);

const ALLOWED_IMAGE_EXTENSIONS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.gif',
  '.avif',
]);

const rateLimitStore = new Map();

function getClientIp(ctx) {
  const forwarded = ctx?.request?.headers?.['x-forwarded-for'] || ctx?.request?.header?.['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0].trim();
  }
  return ctx?.request?.ip || ctx?.ip || '127.0.0.1';
}

function getJwtSecret(strapiInstance = global.strapi) {
  const secret = strapiInstance?.config?.get?.('plugin.users-permissions.jwtSecret') || process.env.JWT_SECRET;
  if (typeof secret !== 'string' || !secret.trim() || secret === 'custom-secret-key') {
    return null;
  }
  return secret;
}

function timingSafeCompare(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const hashA = crypto.createHash('sha256').update(a).digest();
  const hashB = crypto.createHash('sha256').update(b).digest();
  const equalDigest = crypto.timingSafeEqual(hashA, hashB);
  return equalDigest && a.length === b.length;
}

function verificarAdmin(ctx, strapiInstance = global.strapi) {
  const authHeader = ctx?.request?.header?.authorization || ctx?.request?.headers?.authorization || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  const secret = getJwtSecret(strapiInstance);
  if (!token || !secret) return false;

  try {
    const payload = jwt.verify(token, secret);
    return payload?.isAdminImport === true;
  } catch {
    return false;
  }
}

function consumeRateLimit(ctx, scope, { max = 5, windowMs = 60 * 1000 } = {}) {
  const now = Date.now();
  const key = `${scope}:${getClientIp(ctx)}`;
  const entry = rateLimitStore.get(key);

  if (!entry || now >= entry.expiresAt) {
    rateLimitStore.set(key, { count: 1, expiresAt: now + windowMs });
    return { limited: false, remaining: max - 1 };
  }

  entry.count += 1;
  if (entry.count > max) {
    return { limited: true, remaining: 0, retryAfterSec: Math.ceil((entry.expiresAt - now) / 1000) };
  }

  return { limited: false, remaining: max - entry.count };
}

function clearRateLimit(ctx, scope) {
  const key = `${scope}:${getClientIp(ctx)}`;
  rateLimitStore.delete(key);
}

function resetRateLimits() {
  rateLimitStore.clear();
}

function sendTooManyRequests(ctx, message = 'Demasiados intentos. Intentá nuevamente en unos minutos.') {
  ctx.status = 429;
  const payload = { error: { status: 429, name: 'TooManyRequestsError', message } };
  ctx.body = payload;
  return payload;
}

function handleAdminLogin(ctx, strapiInstance = global.strapi) {
  const limit = consumeRateLimit(ctx, 'admin-login', { max: 5, windowMs: 15 * 60 * 1000 });
  if (limit.limited) {
    return sendTooManyRequests(ctx, 'Demasiados intentos de inicio de sesión. Intentá nuevamente más tarde.');
  }

  const { identifier, password } = ctx?.request?.body || {};
  const adminEmail = process.env.IMPORT_ADMIN_EMAIL || 'admin@marybe.com';
  const adminPassword = process.env.IMPORT_ADMIN_PASSWORD;

  if (!adminPassword) {
    return ctx.internalServerError('Error del servidor: IMPORT_ADMIN_PASSWORD no configurado en entorno.');
  }

  const secret = getJwtSecret(strapiInstance);
  if (!secret) {
    return ctx.internalServerError('Error del servidor: JWT_SECRET no configurado.');
  }

  const validEmail = timingSafeCompare(String(identifier ?? ''), adminEmail);
  const validPass = timingSafeCompare(String(password ?? ''), adminPassword);

  if (validEmail && validPass) {
    clearRateLimit(ctx, 'admin-login');
    const token = jwt.sign({ isAdminImport: true, email: adminEmail }, secret, { expiresIn: '1d' });
    return ctx.send({ jwt: token });
  }

  return ctx.badRequest('Invalid identifier or password');
}

function validateImageUpload(file, { maxSizeBytes = 200 * 1024 } = {}) {
  if (!file || typeof file !== 'object') {
    return 'No se recibió un archivo válido.';
  }
  const mime = String(file.mimetype || file.type || '').toLowerCase().trim();
  const filename = String(file.name || file.originalFilename || '').toLowerCase().trim();
  const ext = path.extname(filename);

  if (!ALLOWED_IMAGE_MIMES.has(mime) || (ext && !ALLOWED_IMAGE_EXTENSIONS.has(ext))) {
    return 'Formato de archivo no permitido. Solo se aceptan imágenes JPG, PNG, WebP, GIF o AVIF.';
  }

  if (typeof file.size === 'number' && file.size > maxSizeBytes) {
    const maxKb = Math.round(maxSizeBytes / 1024);
    const recKb = Math.round(file.size / 1024);
    return `La imagen supera el tamaño máximo permitido (${maxKb}KB). Tamaño recibido: ${recKb}KB.`;
  }

  return null;
}

module.exports = {
  ALLOWED_IMAGE_MIMES,
  ALLOWED_IMAGE_EXTENSIONS,
  getJwtSecret,
  timingSafeCompare,
  verificarAdmin,
  consumeRateLimit,
  clearRateLimit,
  resetRateLimits,
  sendTooManyRequests,
  handleAdminLogin,
  validateImageUpload,
};
