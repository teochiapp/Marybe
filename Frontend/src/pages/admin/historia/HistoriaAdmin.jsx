import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useOutletContext } from 'react-router-dom';
import {
  FiBookOpen,
  FiExternalLink,
  FiImage,
  FiRotateCcw,
  FiSave,
  FiTrash2,
  FiUpload,
} from 'react-icons/fi';
import RichTextEditor from './RichTextEditor';
import './HistoriaAdmin.css';

const API_BASE = process.env.REACT_APP_STRAPI_URL || process.env.REACT_APP_API_URL || 'http://localhost:1337';

const ENCUADRE_OPTIONS = [
  { value: 'centro', label: 'Centro' },
  { value: 'arriba', label: 'Arriba' },
  { value: 'abajo', label: 'Abajo' },
  { value: 'izquierda', label: 'Izquierda' },
  { value: 'derecha', label: 'Derecha' },
];

const OBJECT_POSITIONS = {
  centro: 'center',
  arriba: 'center top',
  abajo: 'center bottom',
  izquierda: 'left center',
  derecha: 'right center',
};

const INITIAL_FORM = {
  titulo: 'Nuestra Historia',
  imagen_inicio: null,
  encuadre_imagen_inicio: 'centro',
  texto_banner_1: '',
  texto_intermedio: '',
  texto_banner_2: '',
  imagen_secundaria: null,
  encuadre_imagen_secundaria: 'centro',
  imagen_final_desktop: null,
  encuadre_imagen_final_desktop: 'centro',
  imagen_final_mobile: null,
  encuadre_imagen_final_mobile: 'centro',
};

function resolveMediaUrl(media) {
  const url = media?.url || '';
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${API_BASE}${url}`;
}

function ImageField({
  id,
  label,
  hint,
  media,
  encuadre,
  encuadreId,
  uploading,
  onUpload,
  onClear,
  onEncuadreChange,
}) {
  const previewUrl = resolveMediaUrl(media);

  return (
    <div className="ha-media-box">
      <div className="ha-field">
        <label htmlFor={id}>{label}</label>
        {hint && <span className="ha-hint">{hint}</span>}
      </div>

      <div className="ha-media-preview">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt={label}
            style={{ objectPosition: OBJECT_POSITIONS[encuadre] || 'center' }}
          />
        ) : (
          <span><FiImage /> Sin imagen cargada</span>
        )}
      </div>

      <div className="ha-media-actions">
        <label className="ha-file-label" htmlFor={id}>
          <FiUpload /> {uploading ? 'Subiendo...' : previewUrl ? 'Cambiar imagen' : 'Subir imagen'}
          <input
            id={id}
            type="file"
            accept="image/*"
            className="ha-file-input"
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onUpload(file);
              e.target.value = '';
            }}
          />
        </label>
        {previewUrl && (
          <button
            type="button"
            className="ha-btn ha-btn--danger ha-btn--sm"
            onClick={onClear}
            disabled={uploading}
          >
            <FiTrash2 /> Quitar
          </button>
        )}
      </div>

      <div className="ha-field">
        <label htmlFor={encuadreId}>Encuadre prioritario</label>
        <select
          id={encuadreId}
          value={encuadre}
          onChange={(e) => onEncuadreChange(e.target.value)}
        >
          {ENCUADRE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default function HistoriaAdmin() {
  const context = useOutletContext() || {};
  const token = context.token || localStorage.getItem('admin_jwt') || '';

  const [form, setForm] = useState(INITIAL_FORM);
  const [snapshot, setSnapshot] = useState(JSON.stringify(INITIAL_FORM));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isDirty = useMemo(() => JSON.stringify(form) !== snapshot, [form, snapshot]);

  const fetchHistoria = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${API_BASE}/api/historia-admin`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = { ...INITIAL_FORM, ...(res.data?.data || {}) };
      setForm(data);
      setSnapshot(JSON.stringify(data));
    } catch (err) {
      setError(err.response?.data?.error?.message || 'No se pudo cargar Nuestra Historia.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchHistoria();
  }, [fetchHistoria]);

  useEffect(() => {
    if (!isDirty) return undefined;
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const handleUploadImage = async (field, file) => {
    setUploadingField(field);
    setError('');
    setSuccess('');
    try {
      const formData = new FormData();
      formData.append('files', file);
      const res = await axios.post(`${API_BASE}/api/historia-admin/upload`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const uploaded = res.data?.data;
      if (uploaded?.id) {
        setForm((prev) => ({ ...prev, [field]: uploaded }));
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'No se pudo subir la imagen.');
    } finally {
      setUploadingField('');
    }
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const payload = {
        titulo: form.titulo,
        texto_banner_1: form.texto_banner_1,
        texto_intermedio: form.texto_intermedio,
        texto_banner_2: form.texto_banner_2,
        encuadre_imagen_inicio: form.encuadre_imagen_inicio,
        encuadre_imagen_secundaria: form.encuadre_imagen_secundaria,
        encuadre_imagen_final_desktop: form.encuadre_imagen_final_desktop,
        encuadre_imagen_final_mobile: form.encuadre_imagen_final_mobile,
        imagen_inicio: form.imagen_inicio?.id || null,
        imagen_secundaria: form.imagen_secundaria?.id || null,
        imagen_final_desktop: form.imagen_final_desktop?.id || null,
        imagen_final_mobile: form.imagen_final_mobile?.id || null,
      };

      const res = await axios.put(`${API_BASE}/api/historia-admin`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const saved = { ...INITIAL_FORM, ...(res.data?.data || form) };
      setForm(saved);
      setSnapshot(JSON.stringify(saved));
      setSuccess('Cambios de Nuestra Historia guardados correctamente.');
    } catch (err) {
      setError(err.response?.data?.error?.message || 'No se pudieron guardar los cambios.');
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    setForm(JSON.parse(snapshot));
    setError('');
    setSuccess('');
  };

  if (loading) {
    return (
      <div className="ha-page">
        <div className="ha-loading">Cargando contenido de Nuestra Historia...</div>
      </div>
    );
  }

  return (
    <form className="ha-page" onSubmit={handleSave}>
      <header className="ha-header">
        <div className="ha-title-group">
          <div className="ha-icon-badge" aria-hidden="true">
            <FiBookOpen />
          </div>
          <div>
            <h1 className="ha-title">Nuestra Historia</h1>
            <p className="ha-subtitle">Diseño · Contenido e imágenes de la página institucional</p>
          </div>
        </div>
        <div className="ha-header-actions">
          <a
            href="/nuestra-historia"
            target="_blank"
            rel="noopener noreferrer"
            className="ha-btn ha-btn--secondary"
          >
            <FiExternalLink /> Ver página
          </a>
          <button
            type="button"
            className="ha-btn ha-btn--secondary"
            onClick={handleDiscard}
            disabled={!isDirty || saving}
          >
            <FiRotateCcw /> Descartar
          </button>
          <button
            type="submit"
            className="ha-btn ha-btn--primary"
            disabled={!isDirty || saving}
          >
            <FiSave /> {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </header>

      {error && <div className="ha-alert ha-alert--error" role="alert">{error}</div>}
      {success && <div className="ha-alert ha-alert--success" role="status">{success}</div>}

      <section className="ha-card">
        <div className="ha-card-header">
          <h2>Encabezado general</h2>
          <p>Título principal visible al ingresar a Nuestra Historia.</p>
        </div>
        <div className="ha-field">
          <label htmlFor="ha-titulo">Título de la página</label>
          <input
            id="ha-titulo"
            type="text"
            value={form.titulo}
            onChange={(e) => setForm((prev) => ({ ...prev, titulo: e.target.value }))}
          />
        </div>
      </section>

      <section className="ha-card">
        <div className="ha-card-header">
          <h2>Bloque 1 · Banner inicial</h2>
          <p>Imagen lateral inicial (recomendado 1000 x 800 px) y texto sobre fundación y valores.</p>
        </div>
        <div className="ha-two-col">
          <ImageField
            id="ha-upload-inicio"
            encuadreId="ha-encuadre-inicio"
            label="Imagen inicial"
            hint="Recomendado: 1000 x 800 px (5:4)"
            media={form.imagen_inicio}
            encuadre={form.encuadre_imagen_inicio}
            uploading={uploadingField === 'imagen_inicio'}
            onUpload={(file) => handleUploadImage('imagen_inicio', file)}
            onClear={() => setForm((prev) => ({ ...prev, imagen_inicio: null }))}
            onEncuadreChange={(value) => setForm((prev) => ({ ...prev, encuadre_imagen_inicio: value }))}
          />
          <RichTextEditor
            id="ha-texto-1"
            label="Texto banner 1"
            value={form.texto_banner_1}
            onChange={(value) => setForm((prev) => ({ ...prev, texto_banner_1: value }))}
            placeholder="Escribí el texto inicial sobre fundación y valores..."
          />
        </div>
      </section>

      <section className="ha-card">
        <div className="ha-card-header">
          <h2>Bloque 2 · Texto intermedio</h2>
          <p>Párrafo central a ancho completo sobre expansión y sucursales.</p>
        </div>
        <RichTextEditor
          id="ha-texto-intermedio"
          label="Texto intermedio"
          value={form.texto_intermedio}
          onChange={(value) => setForm((prev) => ({ ...prev, texto_intermedio: value }))}
          placeholder="Escribí el texto central sobre expansión y sucursales..."
        />
      </section>

      <section className="ha-card">
        <div className="ha-card-header">
          <h2>Bloque 3 · Banner secundario</h2>
          <p>Texto sobre trayectoria e imagen lateral secundaria (recomendado 1000 x 800 px).</p>
        </div>
        <div className="ha-two-col">
          <RichTextEditor
            id="ha-texto-2"
            label="Texto banner 2"
            value={form.texto_banner_2}
            onChange={(value) => setForm((prev) => ({ ...prev, texto_banner_2: value }))}
            placeholder="Escribí el texto sobre trayectoria..."
          />
          <ImageField
            id="ha-upload-secundaria"
            encuadreId="ha-encuadre-secundaria"
            label="Imagen secundaria"
            hint="Recomendado: 1000 x 800 px (5:4)"
            media={form.imagen_secundaria}
            encuadre={form.encuadre_imagen_secundaria}
            uploading={uploadingField === 'imagen_secundaria'}
            onUpload={(file) => handleUploadImage('imagen_secundaria', file)}
            onClear={() => setForm((prev) => ({ ...prev, imagen_secundaria: null }))}
            onEncuadreChange={(value) => setForm((prev) => ({ ...prev, encuadre_imagen_secundaria: value }))}
          />
        </div>
      </section>

      <section className="ha-card">
        <div className="ha-card-header">
          <h2>Bloque 4 · Imagen panorámica final</h2>
          <p>Versiones diferenciadas para escritorio y dispositivos móviles.</p>
        </div>
        <div className="ha-two-col">
          <ImageField
            id="ha-upload-final-desktop"
            encuadreId="ha-encuadre-final-desktop"
            label="Imagen final Desktop"
            hint="Recomendado: 1920 x 840 px (16:7)"
            media={form.imagen_final_desktop}
            encuadre={form.encuadre_imagen_final_desktop}
            uploading={uploadingField === 'imagen_final_desktop'}
            onUpload={(file) => handleUploadImage('imagen_final_desktop', file)}
            onClear={() => setForm((prev) => ({ ...prev, imagen_final_desktop: null }))}
            onEncuadreChange={(value) => setForm((prev) => ({ ...prev, encuadre_imagen_final_desktop: value }))}
          />
          <ImageField
            id="ha-upload-final-mobile"
            encuadreId="ha-encuadre-final-mobile"
            label="Imagen final Mobile"
            hint="Recomendado: 800 x 1000 px (4:5)"
            media={form.imagen_final_mobile}
            encuadre={form.encuadre_imagen_final_mobile}
            uploading={uploadingField === 'imagen_final_mobile'}
            onUpload={(file) => handleUploadImage('imagen_final_mobile', file)}
            onClear={() => setForm((prev) => ({ ...prev, imagen_final_mobile: null }))}
            onEncuadreChange={(value) => setForm((prev) => ({ ...prev, encuadre_imagen_final_mobile: value }))}
          />
        </div>
      </section>

      {isDirty && (
        <div className="ha-save-bar">
          <span className="ha-save-bar-text">Tenés cambios sin guardar</span>
          <button type="submit" className="ha-btn ha-btn--primary ha-btn--sm" disabled={saving}>
            <FiSave /> {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      )}
    </form>
  );
}
