import React, { useRef, useState, useCallback } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:1337';

/**
 * GaleriaUploader — Muestra thumbnails de la galería existente con:
 *   - Eliminación individual (X en hover)
 *   - Reordenación por drag & drop
 *   - Botón/dropzone para agregar más imágenes
 *   - Lightbox al hacer clic en una imagen
 *
 * Props:
 *   productoDocumentId : string
 *   galeriaActual      : array de objetos media { id, url, name }
 *   token              : string JWT
 *   onGaleriaChange    : (nuevaGaleria) => void
 *   lightboxSetter     : (urlONull) => void  (comparte el lightbox global del padre)
 */
export default function GaleriaUploader({ productoDocumentId, galeriaActual, token, onGaleriaChange, lightboxSetter }) {
  const inputRef        = useRef(null);
  const [uploading, setUploading]   = useState(false);
  const [error, setError]           = useState('');
  const [draggingOver, setDraggingOver] = useState(false);

  // ── Drag & Drop para reordenar ────────────────────────────────────────────
  const dragItem = useRef(null);
  const dragOver = useRef(null);

  const handleDragStart = (idx) => { dragItem.current = idx; };
  const handleDragEnterItem = (idx) => { dragOver.current = idx; };

  const handleDragEnd = async () => {
    const from = dragItem.current;
    const to   = dragOver.current;
    if (from === null || to === null || from === to) {
      dragItem.current = dragOver.current = null;
      return;
    }

    const reordenada = [...galeriaActual];
    const [moved]    = reordenada.splice(from, 1);
    reordenada.splice(to, 0, moved);
    onGaleriaChange(reordenada); // actualización optimista

    dragItem.current = dragOver.current = null;

    // Persistir en backend
    try {
      await axios.patch(
        `${API_URL}/api/editor-admin/productos/${productoDocumentId}/galeria/reordenar`,
        { orden: reordenada.map(img => img.id) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      setError('Error al guardar el orden. Recargá la página.');
    }
  };

  // ── Eliminar imagen ───────────────────────────────────────────────────────
  const handleEliminar = async (img) => {
    if (!window.confirm(`¿Eliminar "${img.name || 'esta imagen'}" de la galería?`)) return;

    const nuevaGaleria = galeriaActual.filter(i => i.id !== img.id);
    onGaleriaChange(nuevaGaleria); // optimista

    try {
      await axios.delete(
        `${API_URL}/api/editor-admin/productos/${productoDocumentId}/galeria/${img.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      setError('Error al eliminar la imagen.');
      onGaleriaChange(galeriaActual); // revert
    }
  };

  // ── Subir nuevas imágenes ────────────────────────────────────────────────
  const handleFiles = useCallback(async (files) => {
    setError('');
    const arr = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (!arr.length) return;

    setUploading(true);
    try {
      const fd = new FormData();
      arr.forEach(f => fd.append('imagenes', f));
      const res = await axios.post(
        `${API_URL}/api/editor-admin/productos/${productoDocumentId}/galeria`,
        fd,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      const nuevas = res.data.nuevasImagenes || [];
      onGaleriaChange([...galeriaActual, ...nuevas]);
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.message || 'Error al subir';
      setError(msg);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }, [galeriaActual, onGaleriaChange, productoDocumentId, token]);

  // ── Drag & Drop de archivos sobre el contenedor ─────────────────────────────
  const handleDropContainer = (e) => {
    setDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      e.preventDefault();
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDragOverContainer = (e) => {
    // Only accept drag if it has files (external drag)
    if (e.dataTransfer.types && e.dataTransfer.types.includes('Files')) {
      e.preventDefault();
      setDraggingOver(true);
    }
  };

  const resolveUrl = (url) =>
    url ? (url.startsWith('http') ? url : `${API_URL}${url}`) : null;

  return (
    <div 
      className={`ea-galeria-cell ${draggingOver ? 'ea-galeria-cell--dragover' : ''}`}
      onDragOver={handleDragOverContainer}
      onDragLeave={() => setDraggingOver(false)}
      onDrop={handleDropContainer}
    >
      {/* Thumbnails existentes con drag para reordenar */}
      {galeriaActual.map((img, idx) => {
        const url = resolveUrl(img.url);
        return (
          <div
            key={img.id}
            className="ea-galeria-thumb-wrap"
            draggable
            onDragStart={() => handleDragStart(idx)}
            onDragEnter={() => handleDragEnterItem(idx)}
            onDragEnd={handleDragEnd}
            onDragOver={e => e.preventDefault()}
            title="Arrastrá para reordenar"
          >
            <img
              src={url}
              alt={img.name || `img-${idx}`}
              className="ea-galeria-thumb"
              onClick={() => lightboxSetter && lightboxSetter(url)}
              draggable={false}
            />
            <button
              type="button"
              className="ea-galeria-del"
              onClick={() => handleEliminar(img)}
              title="Eliminar imagen"
            >
              ✕
            </button>
          </div>
        );
      })}

      {/* Dropzone / botón para agregar */}
      <div
        className="ea-dropzone"
        onClick={() => inputRef.current?.click()}
        title="Agregar imágenes a la galería"
      >
        {uploading
          ? <span className="ea-spinner" style={{ width: 12, height: 12, borderTopColor: '#f2dc8f' }} />
          : (
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
          )
        }
      </div>

      {error && (
        <span style={{ fontSize: '0.62rem', color: '#fca5a5', width: '100%', lineHeight: 1.2 }}>
          {error}
        </span>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={e => handleFiles(e.target.files)}
      />
    </div>
  );
}
