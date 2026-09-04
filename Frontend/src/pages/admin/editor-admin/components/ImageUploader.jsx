import React, { useRef, useState } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:1337';
const MAX_KB  = 200;

/**
 * ImageUploader — Botón/área de upload para la portada (máx 200KB).
 * Muestra el thumbnail actual. Al hacer clic abre el file input.
 * Llama a onUploaded(mediaObj) cuando el upload es exitoso.
 */
export default function ImageUploader({ productoDocumentId, varianteId, portadaActual, token, onUploaded }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError]         = useState('');
  const [draggingOver, setDraggingOver] = useState(false);

  const handleFile = async (file) => {
    setError('');

    if (!file.type.startsWith('image/')) {
      return setError('Solo se aceptan imágenes.');
    }

    if (file.size > MAX_KB * 1024) {
      return setError(`Máx ${MAX_KB}KB. (${Math.round(file.size / 1024)}KB recibidos)`);
    }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('portada', file);
      
      const endpoint = varianteId !== undefined
        ? `${API_URL}/api/editor-admin/productos/${productoDocumentId}/variantes/${varianteId}/portada`
        : `${API_URL}/api/editor-admin/productos/${productoDocumentId}/portada`;

      const res = await axios.post(
        endpoint,
        fd,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      onUploaded(res.data.media);
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.message || 'Error al subir portada';
      setError(msg);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleDropFile = (e) => {
    e.preventDefault();
    setDraggingOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const imgUrl = portadaActual?.url
    ? portadaActual.url.startsWith('http')
      ? portadaActual.url
      : `${API_URL}${portadaActual.url}`
    : null;

  return (
    <div 
      className={`ea-img-cell ${draggingOver ? 'ea-img-cell--dragover' : ''}`}
      title={error || 'Arrastrá una imagen o hacé clic para cambiar la portada'}
      onDragOver={e => { e.preventDefault(); setDraggingOver(true); }}
      onDragLeave={() => setDraggingOver(false)}
      onDrop={handleDropFile}
    >
      {/* Thumbnail */}
      {imgUrl ? (
        <img
          src={imgUrl}
          alt="portada"
          className="ea-img-thumb"
          onClick={() => !uploading && inputRef.current?.click()}
          title="Clic para cambiar portada"
        />
      ) : (
        <div className="ea-img-placeholder" title="Sin portada">
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
        </div>
      )}

      {/* Botón de upload */}
      <button
        type="button"
        className="ea-upload-btn"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        title={uploading ? 'Subiendo...' : `Subir portada (máx ${MAX_KB}KB)`}
      >
        {uploading
          ? <span className="ea-spinner" style={{ width: 12, height: 12, borderTopColor: '#f2dc8f' }} />
          : (
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          )
        }
      </button>

      {/* Error inline */}
      {error && (
        <span style={{ fontSize: '0.65rem', color: '#fca5a5', maxWidth: 100, lineHeight: 1.2 }}>
          {error}
        </span>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      />
    </div>
  );
}
