'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');
const { SaxesParser } = require('saxes');

const IMAGE_LIMIT = 300 * 1024;
const VIDEO_LIMIT = 8 * 1024 * 1024;
function invalid(message) { const error = new Error(message); error.status = 400; throw error; }

function validateSvg(buffer) {
  let xml;
  try { xml = new TextDecoder('utf-8', { fatal: true }).decode(buffer); }
  catch { invalid('El SVG debe estar codificado en UTF-8.'); }
  const parser = new SaxesParser({ xmlns: true });
  let root = false;
  parser.on('doctype', () => invalid('El SVG no puede contener declaraciones DOCTYPE.'));
  parser.on('processinginstruction', () => invalid('El SVG contiene instrucciones no permitidas.'));
  parser.on('opentag', node => {
    const local = node.local.toLowerCase();
    if (!root) {
      if (local !== 'svg' || node.uri !== 'http://www.w3.org/2000/svg') invalid('El archivo no es un SVG válido.');
      root = true;
    }
    if (['script', 'foreignobject', 'style', 'iframe', 'object', 'embed', 'a', 'animate', 'animatetransform', 'animatemotion', 'set'].includes(local)) invalid('El SVG contiene elementos interactivos o externos. Exportalo como SVG estático.');
    for (const attr of Object.values(node.attributes)) {
      const name = attr.local.toLowerCase();
      const value = attr.value.trim();
      const withoutLocalUrls = value.replace(/url\(\s*(?:'#[\w.-]+'|"#[\w.-]+"|#[\w.-]+)\s*\)/gi, '');
      if (name.startsWith('on') || name === 'src' || (name === 'href' && value && !value.startsWith('#')) || /(?:javascript:|data:|@import|expression\s*\(|\\)/i.test(value) || /url\s*\(/i.test(withoutLocalUrls)) invalid('El SVG contiene enlaces, estilos o eventos no permitidos. Exportalo como SVG estático.');
    }
  });
  try { parser.write(xml).close(); } catch (error) { if (error.status) throw error; invalid('El archivo SVG está dañado o no es válido.'); }
  if (!root) invalid('El archivo SVG está vacío.');
}

async function validateBannerUpload(file) {
  if (!file || Array.isArray(file)) invalid('Seleccioná un archivo de imagen o video.');
  const claimed = String(file.mimetype || file.type || '').toLowerCase();
  const isSvg = claimed === 'image/svg+xml';
  const isImage = claimed.startsWith('image/');
  const isVideo = ['video/mp4', 'video/webm'].includes(claimed);
  if (!isImage && !isVideo) invalid('Subí una imagen o un video MP4 o WebM.');
  const limit = isImage ? IMAGE_LIMIT : VIDEO_LIMIT;
  if (!Number.isFinite(file.size) || file.size <= 0 || file.size > limit) invalid(isImage ? 'La imagen debe pesar como máximo 300 KB.' : 'El video debe pesar como máximo 8 MB.');
  const filename = file.originalFilename || file.name || '';
  const extension = path.extname(filename).toLowerCase();
  const filePath = file.filepath || file.path;
  if (!filePath) invalid('No se pudo leer el archivo.');
  const buffer = await fs.readFile(filePath);
  if (buffer.length !== file.size || buffer.length > limit) invalid('El tamaño del archivo no es válido.');
  if (isSvg) {
    if (extension !== '.svg') invalid('La extensión del archivo no coincide con su contenido.');
    validateSvg(buffer);
  } else {
    const { fileTypeFromBuffer } = await import('file-type');
    let detected;
    try { detected = await fileTypeFromBuffer(buffer); }
    catch { invalid('El archivo está dañado o no es válido.'); }
    if (!detected || (isImage ? !detected.mime.startsWith('image/') : detected.mime !== claimed)) invalid('El tipo del archivo no coincide con su contenido.');
    const extensions = detected.ext === 'jpg' ? ['.jpg', '.jpeg'] : detected.ext === 'tif' ? ['.tif', '.tiff'] : [`.${detected.ext}`];
    if (!extensions.includes(extension)) invalid('La extensión del archivo no coincide con su contenido.');
    file.mimetype = detected.mime;
  }
}

module.exports = { IMAGE_LIMIT, VIDEO_LIMIT, validateBannerUpload, validateSvg };
