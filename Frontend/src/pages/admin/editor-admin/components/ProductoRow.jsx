import React, { useState, useCallback } from 'react';
import ImageUploader from './ImageUploader';
import GaleriaUploader from './GaleriaUploader';

/**
 * ProductoRow — Una fila de la tabla con campos editables.
 *
 * Props:
 *   producto       : objeto producto de Strapi
 *   token          : JWT admin
 *   onMarkDirty    : (documentId, campo, valor) => void  — notifica al padre que hay cambio pendiente
 *   pendingChanges : objeto { precio?, precio_oferta?, stock? } con cambios sin guardar para este producto
 *   lightboxSetter : (urlONull) => void
 *   showProveedor  : bool — si true muestra la columna Proveedor (usado en el buscador de SKU)
 *   showSku        : bool — si true muestra la columna EAN/SKU (usado en el buscador de SKU)
 */
export default function ProductoRow({ producto, token, onMarkDirty, pendingChanges, lightboxSetter, showProveedor, showSku }) {
  const { documentId } = producto;

  // Estado local de imágenes (se actualiza optimistamente)
  const [portada, setPortada]   = useState(producto.portada || null);
  const [galeria, setGaleria]   = useState(producto.galeria || []);

  // Valores locales para los inputs numéricos
  const precio       = pendingChanges?.precio       ?? (producto.precio       ?? '');
  const precioOferta = pendingChanges?.precio_oferta ?? (producto.precio_oferta ?? '');
  const stock        = pendingChanges?.stock         ?? (producto.stock         ?? '');

  const isDirty = !!pendingChanges && Object.keys(pendingChanges).length > 0;

  const handleNumChange = useCallback((campo, valor) => {
    onMarkDirty(documentId, campo, valor);
  }, [documentId, onMarkDirty]);

  return (
    <tr className={isDirty ? 'ea-row--dirty' : ''}>
      {/* ID Original */}
      <td className="ea-td--sticky">
        <span className="ea-cell-id">{producto.id_original || '—'}</span>
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

      {/* Nombre */}
      <td>
        <span className="ea-cell-text" title={producto.nombre || ''} style={{ maxWidth: 220 }}>
          {producto.nombre || '—'}
        </span>
      </td>

      {/* Precio */}
      <td>
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
      <td>
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
      <td>
        <input
          type="number"
          className={`ea-input-num${pendingChanges?.stock !== undefined ? ' ea-input-num--dirty' : ''}`}
          value={stock}
          min={0}
          step={1}
          placeholder="0"
          style={{ maxWidth: 72 }}
          onChange={e => handleNumChange('stock', e.target.value)}
        />
      </td>

      {/* Portada */}
      <td>
        <ImageUploader
          productoDocumentId={documentId}
          portadaActual={portada}
          token={token}
          onUploaded={media => setPortada(media)}
        />
      </td>

      {/* Galería */}
      <td>
        <GaleriaUploader
          productoDocumentId={documentId}
          galeriaActual={galeria}
          token={token}
          onGaleriaChange={setGaleria}
          lightboxSetter={lightboxSetter}
        />
      </td>
    </tr>
  );
}
