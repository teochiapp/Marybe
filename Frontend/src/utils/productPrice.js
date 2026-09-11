/**
 * productPrice.js
 * Helper centralizado para obtener el precio correcto de un producto y sus variantes.
 *
 * Problema que resuelve:
 *   1. Prioriza el `precio_oferta` de la variante seleccionada y calcula el % de descuento
 *      dinámicamente según la diferencia entre precio normal y precio oferta.
 *   2. Evita que variantes sin precio de oferta hereden ofertas del producto padre o variantes hermanas.
 *   3. Filtra variantes "fantasma" (sin volumen ni color).
 */

/**
 * Filtra variantes que tienen al menos un atributo real (volumen o color).
 * @param {Array} variantes
 * @returns {Array}
 */
export function variantesReales(variantes = []) {
  return (variantes || []).filter(function(v) {
    return (v && ((v.volumen || '').trim() !== '' || (v.color_nombre || '').trim() !== ''));
  });
}

/**
 * Obtiene la variante principal para mostrar precio.
 * Prioriza: variante publicada con stock > 0, luego primera variante real.
 * Si no hay variantes reales, devuelve { variant: null, usarVariante: false }.
 * @param {Array} variantes
 * @returns {{ variant: Object|null, usarVariante: boolean }}
 */
export function getMainVariant(variantes = []) {
  var reales = variantesReales(variantes);
  if (reales.length === 0) return { variant: null, usarVariante: false };
  var conStock = reales.find(function(v) { return v.publicado !== false && v.stock > 0; });
  return { variant: conStock || reales[0], usarVariante: true };
}

/**
 * Obtiene los datos de precio, precio de oferta y descuento para una variante específica o producto padre.
 *
 * Reglas de Prioridad:
 * 1. Si hay una variante seleccionada o si el producto tiene variantes reales:
 *    - Precio base: `variant.precio` > 0 ? `variant.precio` : `attrs.precio`.
 *    - Precio de oferta: Si `variant.precio_oferta` está definido, no es nulo/vacío/0 y < price -> `variant.precio_oferta`.
 *      Si la variante NO tiene precio_oferta (nulo/vacío/0), NO TIENE OFERTA.
 *      No hereda el precio_oferta del padre ni el descuento global de variantes hermanas.
 * 2. Si NO hay variantes reales (producto simple):
 *    - Precio base: `attrs.precio`.
 *    - Precio de oferta: Si `attrs.precio_oferta` está definido, no es nulo/vacío/0 y < price -> `attrs.precio_oferta`.
 *      Si no hay precio_oferta pero `attrs.descuento` > 0 -> Math.round(price * (1 - descuento / 100)).
 * 3. Cálculo de % de Descuento:
 *    - Si `offerPrice` existe y 0 < `offerPrice` < `price`:
 *      `calcDescuento` = Math.round((1 - offerPrice / price) * 100).
 *    - De lo contrario, si es producto simple sin offerPrice pero con `attrs.descuento` > 0:
 *      `calcDescuento` = Math.round(attrs.descuento).
 *    - De lo contrario: 0.
 *
 * @param {Object|null} variant - Objeto variante (o null si no hay variante seleccionada)
 * @param {Object} attrs - Atributos del producto padre
 * @returns {{ price: number, offerPrice: number|null, tieneOferta: boolean, calcDescuento: number }}
 */
export function getVariantPrice(variant, attrs = {}) {
  var parentAttrs = attrs || {};
  var variantes = parentAttrs.variantes || [];
  var reales = variantesReales(variantes);
  var tieneVariantesReales = reales.length > 0;

  var isRealVariant = variant && (
    (variant.volumen || '').trim() !== '' ||
    (variant.color_nombre || '').trim() !== '' ||
    variant.id !== undefined
  );

  var price = 0;
  var offerPrice = null;

  if (isRealVariant || tieneVariantesReales) {
    var targetVariant = isRealVariant ? variant : (getMainVariant(variantes).variant || {});
    
    var vPrice = targetVariant.precio !== undefined && targetVariant.precio !== null && String(targetVariant.precio).trim() !== ''
      ? Number(targetVariant.precio)
      : (parentAttrs.precio ? Number(parentAttrs.precio) : 0);

    price = !isNaN(vPrice) && vPrice > 0 ? vPrice : 0;

    var vOffer = targetVariant.precio_oferta;
    if (vOffer !== null && vOffer !== undefined && String(vOffer).trim() !== '') {
      var numOffer = Number(vOffer);
      if (!isNaN(numOffer) && numOffer > 0 && numOffer < price) {
        offerPrice = numOffer;
      }
    }
  } else {
    // Producto simple sin variantes reales
    var pPrice = parentAttrs.precio ? Number(parentAttrs.precio) : 0;
    price = !isNaN(pPrice) && pPrice > 0 ? pPrice : 0;

    var pOffer = parentAttrs.precio_oferta;
    if (pOffer !== null && pOffer !== undefined && String(pOffer).trim() !== '') {
      var numPOffer = Number(pOffer);
      if (!isNaN(numPOffer) && numPOffer > 0 && numPOffer < price) {
        offerPrice = numPOffer;
      }
    } else if (parentAttrs.descuento && Number(parentAttrs.descuento) > 0 && price > 0) {
      var numDesc = Number(parentAttrs.descuento);
      if (!isNaN(numDesc)) {
        offerPrice = Math.round(price * (1 - numDesc / 100));
      }
    }
  }

  var tieneOferta = offerPrice !== null && offerPrice > 0 && offerPrice < price;
  var calcDescuento = 0;

  if (tieneOferta) {
    calcDescuento = Math.round((1 - offerPrice / price) * 100);
    if (calcDescuento <= 0) {
      tieneOferta = false;
      offerPrice = null;
      calcDescuento = 0;
    }
  } else if (!tieneVariantesReales && parentAttrs.descuento && Number(parentAttrs.descuento) > 0) {
    calcDescuento = Math.round(Number(parentAttrs.descuento));
  }

  return {
    price: price,
    offerPrice: tieneOferta ? offerPrice : null,
    tieneOferta: !!tieneOferta,
    calcDescuento: calcDescuento
  };
}

/**
 * Obtiene precio y precio de oferta para mostrar en una card o pagina general.
 * @param {Object} attrs - Atributos del producto
 * @returns {{ price: number, offerPrice: number|null, tieneOferta: boolean, calcDescuento: number }}
 */
export function getProductPrice(attrs = {}) {
  var result = getMainVariant((attrs || {}).variantes || []);
  return getVariantPrice(result.variant, attrs);
}

