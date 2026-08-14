module.exports = {
  async beforeCreate(event) {
    calculatePrices(event.params.data, event.params.data);
  },

  async beforeUpdate(event) {
    const { data, where } = event.params;

    try {
      // Obtener el producto existente para no perder datos si la actuazliacion es parcial
      const existingProduct = await strapi.db.query('api::producto.producto').findOne({
        where,
        populate: ['variantes'],
      });

      if (!existingProduct) return;

      const mergedData = {
        ...existingProduct,
        ...data,
        variantes: data.variantes !== undefined ? data.variantes : existingProduct.variantes,
      };

      calculatePrices(mergedData, data);
    } catch (error) {
      console.error('Error en beforeUpdate lifecycle de Producto:', error);
    }
  },
};

function calculatePrices(sourceData, targetData) {
  let min = Infinity;
  let max = -Infinity;

  // Analizar precio root
  const rootPrice = parseFloat(sourceData.precio_oferta) || parseFloat(sourceData.precio);
  if (rootPrice) {
    if (rootPrice < min) min = rootPrice;
    if (rootPrice > max) max = rootPrice;
  }

  // Analizar precios de variantes
  if (sourceData.variantes && Array.isArray(sourceData.variantes)) {
    sourceData.variantes.forEach(v => {
      const vPrice = parseFloat(v.precio_oferta) || parseFloat(v.precio);
      if (vPrice) {
        if (vPrice < min) min = vPrice;
        if (vPrice > max) max = vPrice;
      }
    });
  }

  if (min !== Infinity) {
    targetData.precio_minimo_calculado = min;
  } else {
    targetData.precio_minimo_calculado = null;
  }

  if (max !== -Infinity) {
    targetData.precio_maximo_calculado = max;
  } else {
    targetData.precio_maximo_calculado = null;
  }
}
