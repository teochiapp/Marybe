'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { validateBannerUpload, validateSvg, IMAGE_LIMIT, VIDEO_LIMIT } = require('../src/api/banners-admin/services/banner-media');

async function withFile(buffer, name, mimetype, action) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'marybe-banner-media-'));
  const filePath = path.join(dir, name);
  try {
    await fs.writeFile(filePath, buffer);
    await action({ filepath: filePath, originalFilename: name, mimetype, size: buffer.length });
  } finally { await fs.rm(dir, { recursive: true, force: true }); }
}

test('admite imágenes y videos válidos hasta sus límites y rechaza archivos mayores', async () => {
  const png = Buffer.from('89504e470d0a1a0a0000000d49484452', 'hex');
  const mp4 = Buffer.from('000000186674797069736f6d0000020069736f6d69736f32', 'hex');
  const webm = Buffer.from('1a45dfa39f4286810142f7810142f2810442f381084282847765626d4287810242858102', 'hex');
  for (const [head, size, name, mime] of [[png, IMAGE_LIMIT, 'banner.png', 'image/png'], [mp4, VIDEO_LIMIT, 'banner.mp4', 'video/mp4'], [webm, 512, 'banner.webm', 'video/webm']]) {
    const buffer = Buffer.alloc(size); head.copy(buffer);
    await withFile(buffer, name, mime, validateBannerUpload);
    await assert.rejects(validateBannerUpload({ mimetype: mime, size: size === 512 ? VIDEO_LIMIT + 1 : size + 1 }), error => error.status === 400 && /máximo/.test(error.message));
  }
});

test('SVG estático admite referencias internas y rechaza contenido activo y externo', async () => {
  const valid = '<svg xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g"/></defs><path fill="url(#g)" style="stroke:url(\'\u0023g\')"/></svg>';
  await withFile(Buffer.from(valid), 'banner.svg', 'image/svg+xml', validateBannerUpload);
  for (const value of ['<script/>', '<foreignObject/>', '<path onload="alert(1)"/>', '<image href="https://example.com/a.png"/>', '<style>path{fill:red}</style>']) {
    assert.throws(() => validateSvg(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg">${value}</svg>`)), error => error.status === 400);
  }
  assert.throws(() => validateSvg(Buffer.from('<!DOCTYPE svg><svg xmlns="http://www.w3.org/2000/svg"/>')), error => error.status === 400);
});

test('rechaza tipos falsos, extensiones incorrectas y tamaños declarados falsos', async () => {
  const png = Buffer.from('89504e470d0a1a0a0000000d49484452', 'hex');
  await withFile(png, 'banner.mp4', 'video/mp4', file => assert.rejects(validateBannerUpload(file), /contenido/));
  await withFile(png, 'banner.html', 'image/png', file => assert.rejects(validateBannerUpload(file), /extensión/));
  await withFile(png, 'banner.png', 'image/png', file => assert.rejects(validateBannerUpload({ ...file, size: file.size + 1 }), /tamaño/));
  await assert.rejects(validateBannerUpload({ mimetype: 'audio/wav', size: 10 }), /imagen o un video/);
});
