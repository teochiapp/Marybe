import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { imageUrl } from '../../../../utils/bannerDesign';
import { acquireDedupedRequest, isRequestCanceled } from '../../../../utils/requestDedup';

const API = process.env.REACT_APP_STRAPI_URL || process.env.REACT_APP_API_URL || 'http://localhost:1337';

// Biblioteca de imágenes del Editor de Inicio: reutiliza los endpoints del editor de banners.
export default function MediaLibraryDialog({ token, title, onChoose, onClose }) {
  const [media, setMedia] = useState([]);
  const [search, setSearch] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const auth = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    let active = true;
    const request = acquireDedupedRequest(`banners-media:${token || ''}`, signal =>
      axios.get(`${API}/api/banners-admin/media`, { headers: { Authorization: `Bearer ${token}` }, signal })
    );
    request.promise
      .then(response => { if (active) setMedia(response.data.data || []); })
      .catch(requestError => {
        if (active && !isRequestCanceled(requestError)) {
          setError(requestError.response?.data?.error?.message || 'No se pudo cargar la biblioteca.');
        }
      })
      .finally(() => { if (active) setLoading(false); });
    return () => {
      active = false;
      request.release();
    };
  }, [token]);

  useEffect(() => {
    const keyboard = event => { if (event.key === 'Escape' && !busy) onClose(); };
    document.addEventListener('keydown', keyboard);
    return () => document.removeEventListener('keydown', keyboard);
  }, [busy, onClose]);

  async function upload(file) {
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      const data = new FormData();
      data.append('files', file);
      const response = await axios.post(`${API}/api/banners-admin/upload`, data, auth);
      onChoose(response.data.data[0]);
    } catch (requestError) {
      setError(requestError.response?.data?.error?.message || 'No se pudo subir la imagen.');
    } finally {
      setBusy(false);
    }
  }

  const visible = media.filter(file => file.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="ba-modal-backdrop" onClick={() => !busy && onClose()}>
      <section className="ba-media-modal" role="dialog" aria-modal="true" aria-label="Biblioteca de imágenes" onClick={event => event.stopPropagation()}>
        <header>
          <div><p className="ba-eyebrow">BIBLIOTECA MARYBE</p><h2>{title}</h2></div>
          <button aria-label="Cerrar biblioteca" disabled={busy} onClick={onClose}>×</button>
        </header>
        {error && <p role="alert" style={{ color: '#a53a37' }}>{error}</p>}
        <div className="ba-media-toolbar">
          <input id="ei-media-search" name="buscar_imagen" aria-label="Buscar imagen" placeholder="Buscar en las últimas 200 imágenes…" value={search} onChange={event => setSearch(event.target.value)} />
          <label htmlFor="ei-media-upload" className="ba-upload">{busy ? 'Subiendo…' : '＋ Subir imagen'}<input id="ei-media-upload" name="subir_imagen" type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" disabled={busy} onChange={event => upload(event.target.files[0])} /></label>
        </div>
        <p>JPG, PNG, WebP, GIF o AVIF · máximo 10 MB</p>
        {loading && <p role="status">Cargando imágenes…</p>}
        <div className="ba-media-grid">
          {visible.map(file => (
            <button key={file.id} disabled={busy} onClick={() => onChoose(file)}>
              <img src={imageUrl(file, API)} alt={file.name} loading="lazy" />
              <strong>{file.name}</strong>
              <small>{file.width} × {file.height}</small>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
