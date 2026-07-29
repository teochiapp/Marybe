/**
 * productPrice.js
 * Helper centralizado para obtener el precio correcto de un producto.
 *
 * Problema que resuelve:
 *   Imports anteriores crearon variantes sinteticas sin volumen ni color
 *   (variantes "fantasma") con precios incorrectos. Si se usa variantes[0] directamente,
 *   esas variantes fantasma sobreescriben el precio real del producto padre.
 *
 * Solucion:
 *   Solo considerar variantes que tengan al menos un atributo real (volumen O color).
 *   Si no hay ninguna variante real -> usar el precio del producto padre directamente.
 */

/**
 * Filtra variantes que tienen al menos un atributo real (volumen o color).
 * @param {Array} variantes
 * @returns {Array}
 */
export function variantesReales(variantes = []) {
  return variantes.filter(function(v) {
    return (v.volumen || '').trim() !== '' || (v.color_nombre || '').trim() !== '';
  });
}

/**
 * Obtiene la variante principal para mostrar precio.
 * Prioriza: variante publicada con stock > 0, luego primera variante real.
 * Si no hay variantes reales, devuelve {} (usar precio del padre).
 * @param {Array} variantes
 * @returns {{ variant: Object, usarVariante: boolean }}
 */
export function getMainVariant(variantes = []) {
  var reales = variantesReales(variantes);
  if (reales.length === 0) return { variant: {}, usarVariante: false };
  var conStock = reales.find(function(v) { return v.publicado !== false && v.stock > 0; });
  return { variant: conStock || reales[0], usarVariante: true };
}

/**
 * Obtiene precio y precio de oferta para mostrar en una card o pagina.
 * Nunca usa precios de variantes fantasma (sin volumen ni color).
 * @param {Object} attrs - Atributos del producto
 * @returns {{ price: number, offerPrice: number|null, tieneOferta: boolean, calcDescuento: number }}
 */
export function getProductPrice(attrs = {}) {
  var variantes = attrs.variantes || [];
  var result = getMainVariant(variantes);
  var variant = result.variant;
  var usarVariante = result.usarVariante;
  var descuento = attrs.descuento || 0;

  var price = (usarVariante ? variant.precio : null) || attrs.precio;
  var offerPrice = (usarVariante ? variant.precio_oferta : null) || attrs.precio_oferta || null;

  // Fallback extremo: si no hay variantes reales ni precio en el padre,
  // pero SÍ hay variantes (fantasma), usamos la primera para no romper la tienda (mostrar $0).
  if (!price && variantes.length > 0) {
    price = variantes[0].precio;
    if (!offerPrice) offerPrice = variantes[0].precio_oferta || null;
  }
  
  price = price || 0;

  // Fallback: calcular precio oferta desde % descuento del producto padre
  if (!offerPrice && descuento > 0 && price > 0) {
    offerPrice = Math.round(price * (1 - descuento / 100));
  }

  var tieneOferta = offerPrice && offerPrice > 0 && offerPrice < price;
  var calcDescuento = tieneOferta
    ? Math.round((1 - offerPrice / price) * 100)
    : descuento;

  return {
    price: price,
    offerPrice: tieneOferta ? offerPrice : null,
    tieneOferta: !!tieneOferta,
    calcDescuento: calcDescuento
  };
}
