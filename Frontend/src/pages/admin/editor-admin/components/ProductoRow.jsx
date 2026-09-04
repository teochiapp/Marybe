import React, { useState, useCallback } from 'react';
import ImageUploader from './ImageUploader';
import GaleriaUploader from './GaleriaUploader';

/**
 * ProductoRow — Una fila de la tabla con campos editables.
 * Si el producto tiene variantes, muestra un botón para desplegarlas/colapsarlas.
 *
 * Props:
 *   producto       : objeto producto de Strapi (incluye variantes[])
 *   token          : JWT admin
 *   onMarkDirty    : (documentId, campo, valor) => void
 *   pendingChanges : objeto con cambios sin guardar para este producto
 *   lightboxSetter : (urlONull) => void
 *   showProveedor  : bool — si true muestra la columna Proveedor (buscador SKU)
 *   showSku        : bool — si true muestra la columna EAN/SKU (buscador SKU)
 */
export default function ProductoRow({ producto, token, onMarkDirty, pendingChanges, lightboxSetter, showProveedor, showSku }) {
  const { documentId } = producto;

  // Variantes del producto (pueden estar vacías)
  const variantesIniciales = producto.variantes || [];
  const tieneVariantes = variantesIniciales.length > 0;

  // Estado local
  const [portada, setPortada]         = useState(producto.portada || null);
  const [galeria, setGaleria]         = useState(producto.galeria || []);
  const [expanded, setExpanded]       = useState(false);

  // Valores locales para inputs del producto base
  const precio       = pendingChanges?.precio       ?? (producto.precio       ?? '');
  const precioOferta = pendingChanges?.precio_oferta ?? (producto.precio_oferta ?? '');
  const stock        = pendingChanges?.stock         ?? (producto.stock         ?? '');

  // Variantes con cambios pendientes superpuestos
  const variantesConCambios = pendingChanges?.variantes
    ? pendingChanges.variantes
    : variantesIniciales;

  const isDirty = !!pendingChanges && Object.keys(pendingChanges).length > 0;

  const handleNumChange = useCallback((campo, valor) => {
    onMarkDirty(documentId, campo, valor);
  }, [documentId, onMarkDirty]);

  /** Cuando se edita un campo de una variante, actualiza el array completo */
  const handleVarianteChange = useCallback((varIdx, campo, valor) => {
    // Construir el array completo con la variante modificada
    const base = pendingChanges?.variantes
      ? pendingChanges.variantes
      : variantesIniciales;

    const nuevasVariantes = base.map((v, i) => {
      if (i !== varIdx) return { ...v };
      return { ...v, [campo]: valor };
    });

    onMarkDirty(documentId, 'variantes', nuevasVariantes);
  }, [documentId, onMarkDirty, pendingChanges, variantesIniciales]);

  // Número de columnas totales (para el colspan de las filas de variantes)
  const totalCols = 8 + (showSku ? 1 : 0) + (showProveedor ? 1 : 0);

  return (
    <>
      {/* ── Fila principal del producto ─────────────────────────────────── */}
      <tr className={isDirty ? 'ea-row--dirty' : ''}>

        {/* Botón expand + ID Original */}
        <td className="ea-td--sticky">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {tieneVariantes ? (
              <button
                className={`ea-variant-toggle${expanded ? ' ea-variant-toggle--open' : ''}`}
                onClick={() => setExpanded(v => !v)}
                title={expanded ? 'Colapsar variantes' : `Ver ${variantesIniciales.length} variante${variantesIniciales.length !== 1 ? 's' : ''}`}
                aria-expanded={expanded}
              >
                <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 18, height: 18 }}>
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            ) : (
              <span style={{ width: 20, flexShrink: 0 }} />
            )}
            <span className="ea-cell-id">{producto.id_original || '—'}</span>
          </div>
        </td>

        {/* EAN / SKU (solo en buscador) */}
        {showSku && (
          <td>
            <span className="ea-cell-id" style={{ color: 'rgba(165,180,252,0.8)', fontSize: '0.71rem' }}
                  title={producto.sku || ''}>
              {producto.sku || '—'}
            </span>
          </td>
        )}

        {/* Proveedor (solo en buscador de SKU) */}
        {showProveedor && (
          <td>
            <span className="ea-cell-text ea-cell-proveedor" title={producto.proveedor || ''}>
              {producto.proveedor || '—'}
            </span>
          </td>
        )}

        {/* Marca */}
        <td>
          <span className="ea-cell-text" title={producto.marca || ''}>
            {producto.marca || '—'}
          </span>
        </td>

        {/* Nombre + badge variantes */}
        <td>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="ea-cell-text" title={producto.nombre || ''} style={{ maxWidth: 220 }}>
              {producto.nombre || '—'}
            </span>
            {tieneVariantes && (
              <span className="ea-variant-badge" title={`${variantesIniciales.length} variante${variantesIniciales.length !== 1 ? 's' : ''}`}>
                {variantesIniciales.length}
              </span>
            )}
          </div>
        </td>

        {/* Precio */}
        <td style={{ textAlign: 'center' }}>
          <input
            type="number"
            className={`ea-input-num${pendingChanges?.precio !== undefined ? ' ea-input-num--dirty' : ''}`}
            value={precio}
            min={0}
            step={0.01}
            placeholder="0.00"
            onChange={e => handleNumChange('precio', e.target.value)}
          />
        </td>

        {/* Precio Oferta */}
        <td style={{ textAlign: 'center' }}>
          <input
            type="number"
            className={`ea-input-num${pendingChanges?.precio_oferta !== undefined ? ' ea-input-num--dirty' : ''}`}
            value={precioOferta}
            min={0}
            step={0.01}
            placeholder="0.00"
            onChange={e => handleNumChange('precio_oferta', e.target.value)}
          />
        </td>

        {/* Stock */}
        <td style={{ textAlign: 'center' }}>
          <input
            type="number"
            className={`ea-input-num${pendingChanges?.stock !== undefined ? ' ea-input-num--dirty' : ''}`}
            value={stock}
            min={0}
            step={1}
            placeholder="0"
            style={{ maxWidth: 72, margin: '0 auto' }}
            onChange={e => handleNumChange('stock', e.target.value)}
          />
        </td>

        {/* Portada */}
        <td style={{ textAlign: 'center' }}>
          <ImageUploader
            productoDocumentId={documentId}
            portadaActual={portada}
            token={token}
            onUploaded={media => setPortada(media)}
          />
        </td>

        {/* Galería */}
        <td style={{ textAlign: 'center' }}>
          <GaleriaUploader
            productoDocumentId={documentId}
            galeriaActual={galeria}
            token={token}
            onGaleriaChange={setGaleria}
            lightboxSetter={lightboxSetter}
          />
        </td>
      </tr>

      {/* ── Filas de variantes (colapsables) ────────────────────────────── */}
      {tieneVariantes && expanded && (
        <>
          {/* Sub-encabezado de variantes */}
          <tr className="ea-variant-header-row">
            <td className="ea-td--sticky" style={{ border: 'none' }} />
            {showSku && <td style={{ border: 'none' }} />}
            {showProveedor && <td style={{ border: 'none' }} />}
            <td className="ea-variant-th">SKU / EAN</td>
            <td className="ea-variant-th">Detalles</td>
            <td className="ea-variant-th" style={{ textAlign: 'center' }}>Precio</td>
            <td className="ea-variant-th" style={{ textAlign: 'center' }}>Precio Oferta</td>
            <td className="ea-variant-th" style={{ textAlign: 'center' }}>Stock</td>
            <td className="ea-variant-th" style={{ textAlign: 'center' }}>Portada</td>
            <td style={{ border: 'none' }} />
          </tr>

          {/* Una fila por variante */}
          {variantesConCambios.map((variante, idx) => {
            const orig   = variantesIniciales[idx] || {};
            const isDirtyVariante = pendingChanges?.variantes !== undefined;

            return (
              <tr key={variante.id ?? idx} className={`ea-variant-row${isDirtyVariante ? ' ea-variant-row--dirty' : ''}`}>
                
                {/* Indicador visual de nivel */}
                <td className="ea-td--sticky" style={{ padding: 0 }}>
                  <div className="ea-variant-indent" />
                </td>

                {/* Columnas vacías condicionales */}
                {showSku && <td />}
                {showProveedor && <td />}

                {/* SKU / EAN */}
                <td className="ea-variant-td ea-variant-field--sku">
                  <span className="ea-cell-id" title={variante.sku_ean || ''} style={{ fontSize: '0.8rem', color: '#f2dc8f' }}>
                    {variante.sku_ean || <em style={{ opacity: 0.4 }}>—</em>}
                  </span>
                </td>

                {/* Detalles (Volumen y Color) */}
                <td className="ea-variant-td">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span className="ea-cell-text" style={{ fontSize: '0.8rem', color: '#f2dc8f' }}>
                      <span style={{ opacity: 0.6, fontSize: '0.72rem' }}>Volumen: </span>{variante.volumen || <em style={{ opacity: 0.4 }}>—</em>}
                    </span>
                    <span className="ea-cell-text" style={{ fontSize: '0.8rem', color: '#f2dc8f' }}>
                      <span style={{ opacity: 0.6, fontSize: '0.72rem' }}>Color: </span>{variante.color_nombre || <em style={{ opacity: 0.4 }}>—</em>}
                    </span>
                  </div>
                </td>

                {/* Precio variante */}
                <td className="ea-variant-td ea-variant-field--num" style={{ textAlign: 'center' }}>
                  <input
                    type="number"
                    className={`ea-input-num ea-input-num--sm${isDirtyVariante ? ' ea-input-num--dirty' : ''}`}
                    value={variante.precio ?? ''}
                    min={0}
                    step={0.01}
                    placeholder="0.00"
                    onChange={e => handleVarianteChange(idx, 'precio', e.target.value)}
                  />
                </td>

                {/* Precio Oferta variante */}
                <td className="ea-variant-td ea-variant-field--num" style={{ textAlign: 'center' }}>
                  <input
                    type="number"
                    className={`ea-input-num ea-input-num--sm${isDirtyVariante ? ' ea-input-num--dirty' : ''}`}
                    value={variante.precio_oferta ?? ''}
                    min={0}
                    step={0.01}
                    placeholder="0.00"
                    onChange={e => handleVarianteChange(idx, 'precio_oferta', e.target.value)}
                  />
                </td>

                {/* Stock variante */}
                <td className="ea-variant-td ea-variant-field--num" style={{ textAlign: 'center' }}>
                  <input
                    type="number"
                    className={`ea-input-num ea-input-num--sm${isDirtyVariante ? ' ea-input-num--dirty' : ''}`}
                    value={variante.stock ?? ''}
                    min={0}
                    step={1}
                    placeholder="0"
                    style={{ maxWidth: 60, margin: '0 auto' }}
                    onChange={e => handleVarianteChange(idx, 'stock', e.target.value)}
                  />
                </td>

                {/* Portada variante */}
                <td className="ea-variant-td" style={{ textAlign: 'center' }}>
                  <ImageUploader
                    productoDocumentId={documentId}
                    varianteId={idx}
                    portadaActual={variante.portada}
                    token={token}
                    onUploaded={media => handleVarianteChange(idx, 'portada', media)}
                  />
                </td>

                {/* Galería vacío para la variante */}
                <td />
              </tr>
            );
          })}

          {/* Separador final de sección variantes */}
          <tr className="ea-variant-footer-row">
            <td colSpan={totalCols} style={{ height: 2, padding: 0 }} />
          </tr>
        </>
      )}
    </>
  );
}
