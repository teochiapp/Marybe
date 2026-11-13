import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { acquireDedupedRequest, isRequestCanceled } from '../../../utils/requestDedup';
import {
  FiMapPin,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiCopy,
  FiExternalLink,
  FiSearch,
  FiCheck,
  FiArrowUp,
  FiArrowDown,
  FiPhone,
  FiSmartphone,
  FiGlobe,
  FiAlertCircle,
  FiX,
  FiRotateCcw,
  FiSave,
} from 'react-icons/fi';
import './SucursalesAdmin.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:1337';

const EMPTY_BRANCH = {
  provincia: 'Santiago del Estero',
  ciudad: '',
  calle: '',
  numero_celular: '',
  numero_fijo: '',
  embed_google_maps: '',
};

export default function SucursalesAdmin() {
  const outlet = useOutletContext();
  const token = outlet?.token || localStorage.getItem('admin_jwt') || '';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);

  const [titulo, setTitulo] = useState('Nuestras Sucursales');
  const [sucursales, setSucursales] = useState([]);
  const [initialState, setInitialState] = useState({ titulo: 'Nuestras Sucursales', sucursales: [] });

  const [search, setSearch] = useState('');
  const [filterProvincia, setFilterProvincia] = useState('todas');

  const [modal, setModal] = useState({
    open: false,
    mode: 'create', // 'create' | 'edit'
    index: null,
    formData: EMPTY_BRANCH,
    errors: {},
  });

  // ── Cargar datos desde Strapi ──────────────────────────────────────────────
  useEffect(() => {
    if (!token) return undefined;
    let active = true;
    setLoading(true);
    setAlert(null);
    const request = acquireDedupedRequest(`sucursales-admin:${token}`, (signal) =>
      axios.get(`${API_URL}/api/sucursales-admin`, {
        headers: { Authorization: `Bearer ${token}` },
        signal,
      })
    );
    request.promise
      .then((res) => {
        if (!active) return;
        const data = res.data?.data || {};
        const nextTitulo = data.titulo || 'Nuestras Sucursales';
        const nextList = Array.isArray(data.sucursales) ? data.sucursales : [];

        setTitulo(nextTitulo);
        setSucursales(nextList);
        setInitialState({ titulo: nextTitulo, sucursales: JSON.parse(JSON.stringify(nextList)) });
      })
      .catch((err) => {
        if (!active || isRequestCanceled(err)) return;
        const msg = err.response?.data?.error?.message || err.message || 'Error al cargar las sucursales.';
        setAlert({ type: 'error', message: msg });
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
      request.release();
    };
  }, [token]);

  // ── Detección de cambios pendientes (Dirty) ────────────────────────────────
  const isDirty = useMemo(() => {
    if (titulo !== initialState.titulo) return true;
    if (sucursales.length !== initialState.sucursales.length) return true;
    return JSON.stringify(sucursales) !== JSON.stringify(initialState.sucursales);
  }, [titulo, sucursales, initialState]);

  useEffect(() => {
    if (!isDirty) return;
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // ── Provincias únicas para el selector de filtros ──────────────────────────
  const provinciasDisponibles = useMemo(() => {
    const set = new Set();
    sucursales.forEach((s) => {
      if (s.provincia && s.provincia.trim()) set.add(s.provincia.trim());
    });
    return Array.from(set).sort();
  }, [sucursales]);

  // ── Filtrado por búsqueda y provincia ──────────────────────────────────────
  const sucursalesFiltradas = useMemo(() => {
    const q = search.trim().toLowerCase();
    return sucursales
      .map((suc, originalIndex) => ({ suc, originalIndex }))
      .filter(({ suc }) => {
        if (filterProvincia !== 'todas' && suc.provincia?.trim().toLowerCase() !== filterProvincia.toLowerCase()) {
          return false;
        }
        if (!q) return true;
        const target = `${suc.calle} ${suc.ciudad} ${suc.provincia} ${suc.numero_celular} ${suc.numero_fijo}`.toLowerCase();
        return target.includes(q);
      });
  }, [sucursales, search, filterProvincia]);

  // ── Operaciones CRUD ───────────────────────────────────────────────────────
  const handleOpenCreate = () => {
    setModal({
      open: true,
      mode: 'create',
      index: null,
      formData: { ...EMPTY_BRANCH, provincia: filterProvincia !== 'todas' ? filterProvincia : 'Santiago del Estero' },
      errors: {},
    });
  };

  const handleOpenEdit = (originalIndex) => {
    setModal({
      open: true,
      mode: 'edit',
      index: originalIndex,
      formData: { ...sucursales[originalIndex] },
      errors: {},
    });
  };

  const handleDuplicate = (originalIndex) => {
    const base = sucursales[originalIndex];
    const copia = {
      ...base,
      id: undefined,
      calle: `${base.calle || ''} (Copia)`.trim(),
    };
    setSucursales((prev) => {
      const next = [...prev];
      next.splice(originalIndex + 1, 0, copia);
      return next;
    });
    setAlert({ type: 'success', message: 'Sucursal duplicada. Hacé clic en Guardar para persistir los cambios.' });
  };

  const handleDelete = (originalIndex) => {
    const item = sucursales[originalIndex];
    const confirmMsg = `¿Eliminar la sucursal de "${item.calle || 'Sin dirección'}" (${item.provincia || ''})?`;
    if (!window.confirm(confirmMsg)) return;

    setSucursales((prev) => prev.filter((_, idx) => idx !== originalIndex));
    setAlert({ type: 'success', message: 'Sucursal removida de la lista. Guardá los cambios para confirmar.' });
  };

  const handleMove = (originalIndex, direction) => {
    const targetIndex = originalIndex + direction;
    if (targetIndex < 0 || targetIndex >= sucursales.length) return;

    setSucursales((prev) => {
      const next = [...prev];
      const [moved] = next.splice(originalIndex, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
  };

  const handleModalClose = () => {
    setModal((prev) => ({ ...prev, open: false, errors: {} }));
  };

  const handleModalSubmit = (e) => {
    e.preventDefault();
    const { formData, mode, index } = modal;
    const errors = {};

    if (!formData.calle || !formData.calle.trim()) {
      errors.calle = 'La calle o dirección es obligatoria.';
    }
    if (!formData.provincia || !formData.provincia.trim()) {
      errors.provincia = 'La provincia es obligatoria.';
    }

    if (Object.keys(errors).length > 0) {
      setModal((prev) => ({ ...prev, errors }));
      return;
    }

    const cleanItem = {
      ...formData,
      calle: formData.calle.trim(),
      provincia: formData.provincia.trim(),
      ciudad: formData.ciudad?.trim() || '',
      numero_celular: formData.numero_celular?.trim() || '',
      numero_fijo: formData.numero_fijo?.trim() || '',
      embed_google_maps: formData.embed_google_maps?.trim() || '',
    };

    setSucursales((prev) => {
      const next = [...prev];
      if (mode === 'edit' && index !== null) {
        next[index] = cleanItem;
      } else {
        next.push(cleanItem);
      }
      return next;
    });

    handleModalClose();
  };

  const handleDiscard = () => {
    if (!window.confirm('¿Descartar todos los cambios sin guardar y restaurar los datos anteriores?')) return;
    setTitulo(initialState.titulo);
    setSucursales(JSON.parse(JSON.stringify(initialState.sucursales)));
    setAlert({ type: 'success', message: 'Cambios descartados.' });
  };

  const handleSaveAll = async () => {
    setSaving(true);
    setAlert(null);
    try {
      const payload = {
        titulo: titulo.trim() || 'Nuestras Sucursales',
        sucursales: sucursales.map((s) => ({
          ...(s.id ? { id: s.id } : {}),
          provincia: s.provincia?.trim() || '',
          ciudad: s.ciudad?.trim() || '',
          calle: s.calle?.trim() || '',
          numero_celular: s.numero_celular?.trim() || '',
          numero_fijo: s.numero_fijo?.trim() || '',
          embed_google_maps: s.embed_google_maps?.trim() || '',
        })),
      };

      const res = await axios.put(`${API_URL}/api/sucursales-admin`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const updated = res.data?.data || payload;
      const nextTitulo = updated.titulo || payload.titulo;
      const nextList = Array.isArray(updated.sucursales) ? updated.sucursales : payload.sucursales;

      setTitulo(nextTitulo);
      setSucursales(nextList);
      setInitialState({ titulo: nextTitulo, sucursales: JSON.parse(JSON.stringify(nextList)) });
      setAlert({ type: 'success', message: '¡Sucursales guardadas y publicadas correctamente!' });
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.message || 'No se pudieron guardar las sucursales.';
      setAlert({ type: 'error', message: msg });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="suc-page">
      {/* ── Encabezado principal ────────────────────────────────────────── */}
      <header className="suc-header">
        <div className="suc-header-copy">
          <p className="suc-eyebrow">Diseño · Locales Físicos</p>
          <h1>Página de Sucursales</h1>
          <p className="suc-intro">
            Administrá visualmente las sucursales, teléfonos de contacto, direcciones y enlaces a Google Maps
            mostrados a los clientes en la tienda.
          </p>
        </div>
        <div className="suc-header-actions">
          <span className={`suc-status-pill${isDirty ? ' suc-status-pill--dirty' : ''}`}>
            {isDirty ? '● Cambios sin guardar' : '✓ Al día'}
          </span>
          <a
            href="/sucursales"
            target="_blank"
            rel="noopener noreferrer"
            className="suc-btn suc-btn--outline-light"
            title="Ver cómo queda la página pública de sucursales"
          >
            <FiExternalLink /> Ver en tienda
          </a>
          <button
            type="button"
            className="suc-btn suc-btn--primary"
            onClick={handleOpenCreate}
            aria-label="Agregar sucursal"
          >
            <FiPlus /> Nueva Sucursal
          </button>
        </div>
      </header>

      {/* ── Alertas ──────────────────────────────────────────────────────── */}
      {alert && (
        <div className={`suc-alert suc-alert--${alert.type}`} role={alert.type === 'error' ? 'alert' : 'status'}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {alert.type === 'success' ? <FiCheck /> : <FiAlertCircle />}
            <span>{alert.message}</span>
          </div>
          <button type="button" className="suc-alert-close" onClick={() => setAlert(null)} aria-label="Cerrar alerta">
            <FiX />
          </button>
        </div>
      )}

      {/* ── Tarjeta de Configuración Global y Filtros ────────────────────── */}
      <section className="suc-controls-card" aria-label="Controles de sucursales">
        {/* Título de la sección */}
        <div className="suc-title-row">
          <label htmlFor="suc-titulo-seccion" className="suc-title-label">
            <FiMapPin /> Título de la página:
          </label>
          <input
            id="suc-titulo-seccion"
            type="text"
            className="suc-title-input"
            value={titulo}
            placeholder="Ej: Nuestras Sucursales"
            onChange={(e) => setTitulo(e.target.value)}
          />
        </div>

        {/* Búsqueda y Filtros de Provincias */}
        <div className="suc-filters-row">
          <div className="suc-search-wrap">
            <FiSearch className="suc-search-icon" />
            <input
              id="suc-search-input"
              name="buscar_sucursal"
              type="text"
              className="suc-search-input"
              placeholder="Buscar por calle, ciudad o provincia…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Filtrar sucursales"
            />
          </div>

          <div className="suc-province-pills" role="tablist" aria-label="Filtrar por provincia">
            <button
              type="button"
              className={`suc-pill-btn${filterProvincia === 'todas' ? ' is-active' : ''}`}
              onClick={() => setFilterProvincia('todas')}
            >
              Todas ({sucursales.length})
            </button>
            {provinciasDisponibles.map((prov) => {
              const count = sucursales.filter((s) => s.provincia?.trim().toLowerCase() === prov.toLowerCase()).length;
              return (
                <button
                  key={prov}
                  type="button"
                  className={`suc-pill-btn${filterProvincia.toLowerCase() === prov.toLowerCase() ? ' is-active' : ''}`}
                  onClick={() => setFilterProvincia(prov)}
                >
                  {prov} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Listado / Grid de Sucursales ─────────────────────────────────── */}
      {loading ? (
        <div className="suc-empty">
          <p>Cargando información de sucursales…</p>
        </div>
      ) : sucursalesFiltradas.length === 0 ? (
        <div className="suc-empty">
          <FiMapPin />
          <h3>No se encontraron sucursales</h3>
          <p>
            {search || filterProvincia !== 'todas'
              ? 'Probá modificando los términos de búsqueda o el filtro de provincia.'
              : 'Aún no cargaste sucursales en la tienda.'}
          </p>
          <button type="button" className="suc-btn suc-btn--wine" onClick={handleOpenCreate}>
            <FiPlus /> Crear la primera sucursal
          </button>
        </div>
      ) : (
        <div className="suc-list" aria-label="Lista de sucursales">
          {sucursalesFiltradas.map(({ suc, originalIndex }) => (
            <article className="suc-card" key={`suc-${suc.id || 'new'}-${originalIndex}-${suc.calle}`}>
              <div className="suc-card-main">
                <div className="suc-card-order-controls" aria-label="Reordenar sucursal">
                  <button
                    type="button"
                    className="suc-order-btn"
                    disabled={originalIndex === 0}
                    onClick={() => handleMove(originalIndex, -1)}
                    title="Mover arriba"
                    aria-label="Mover arriba"
                  >
                    <FiArrowUp />
                  </button>
                  <button
                    type="button"
                    className="suc-order-btn"
                    disabled={originalIndex === sucursales.length - 1}
                    onClick={() => handleMove(originalIndex, 1)}
                    title="Mover abajo"
                    aria-label="Mover abajo"
                  >
                    <FiArrowDown />
                  </button>
                </div>

                <div className="suc-card-body">
                  <div className="suc-card-meta">
                    <span className="suc-card-badge">{suc.provincia || 'Sin provincia'}</span>
                    {suc.ciudad && <span className="suc-card-ciudad">{suc.ciudad}</span>}
                  </div>

                  <h3 className="suc-card-calle">
                    <FiMapPin />
                    <span>{suc.calle || 'Sin dirección'}</span>
                  </h3>

                  {(suc.numero_celular || suc.numero_fijo || suc.embed_google_maps) && (
                    <div className="suc-card-contacts">
                      {suc.numero_celular && (
                        <div className="suc-contact-item">
                          <FiSmartphone title="Celular / WhatsApp" />
                          <a
                            href={`https://wa.me/${suc.numero_celular.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Enviar WhatsApp"
                          >
                            {suc.numero_celular}
                          </a>
                        </div>
                      )}
                      {suc.numero_fijo && (
                        <div className="suc-contact-item">
                          <FiPhone title="Teléfono fijo" />
                          <span>{suc.numero_fijo}</span>
                        </div>
                      )}
                      {suc.embed_google_maps && (
                        <a
                          href={suc.embed_google_maps}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="suc-card-map-link"
                          title="Abrir mapa en Google Maps"
                        >
                          <FiGlobe /> Ver mapa en Google Maps
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="suc-card-footer">
                <button
                  type="button"
                  className="suc-btn suc-btn--outline suc-btn--sm"
                  onClick={() => handleDuplicate(originalIndex)}
                  title="Duplicar sucursal"
                >
                  <FiCopy /> Duplicar
                </button>
                <button
                  type="button"
                  className="suc-btn suc-btn--wine suc-btn--sm"
                  onClick={() => handleOpenEdit(originalIndex)}
                  title="Editar datos de la sucursal"
                >
                  <FiEdit2 /> Editar
                </button>
                <button
                  type="button"
                  className="suc-btn suc-btn--danger-ghost suc-btn--sm"
                  onClick={() => handleDelete(originalIndex)}
                  title="Eliminar sucursal"
                  aria-label="Eliminar sucursal"
                >
                  <FiTrash2 />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* ── Modal de Creación / Edición ─────────────────────────────────── */}
      {modal.open && (
        <div className="suc-modal-backdrop" onClick={handleModalClose} role="dialog" aria-modal="true">
          <div className="suc-modal" onClick={(e) => e.stopPropagation()}>
            <div className="suc-modal-header">
              <h2>
                <FiMapPin />
                {modal.mode === 'create' ? 'Nueva Sucursal' : 'Editar Sucursal'}
              </h2>
              <button
                type="button"
                className="suc-modal-close"
                onClick={handleModalClose}
                aria-label="Cerrar ventana"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleModalSubmit}>
              <div className="suc-modal-body">
                <div className="suc-form-row">
                  <div className="suc-form-group">
                    <label htmlFor="form-provincia" className="suc-form-label">
                      Provincia <span className="req">*</span>
                    </label>
                    <input
                      id="form-provincia"
                      type="text"
                      className="suc-form-input"
                      list="provincias-datalist"
                      value={modal.formData.provincia || ''}
                      placeholder="Ej: Santiago del Estero"
                      onChange={(e) =>
                        setModal((prev) => ({
                          ...prev,
                          formData: { ...prev.formData, provincia: e.target.value },
                          errors: { ...prev.errors, provincia: undefined },
                        }))
                      }
                      required
                    />
                    <datalist id="provincias-datalist">
                      <option value="Santiago del Estero" />
                      <option value="Tucumán" />
                      <option value="Córdoba" />
                      <option value="Buenos Aires" />
                    </datalist>
                    {modal.errors.provincia && (
                      <span className="suc-form-help" style={{ color: '#b10002' }}>
                        {modal.errors.provincia}
                      </span>
                    )}
                  </div>

                  <div className="suc-form-group">
                    <label htmlFor="form-ciudad" className="suc-form-label">
                      Ciudad
                    </label>
                    <input
                      id="form-ciudad"
                      type="text"
                      className="suc-form-input"
                      value={modal.formData.ciudad || ''}
                      placeholder="Ej: Capital / La Banda"
                      onChange={(e) =>
                        setModal((prev) => ({
                          ...prev,
                          formData: { ...prev.formData, ciudad: e.target.value },
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="suc-form-group">
                  <label htmlFor="form-calle" className="suc-form-label">
                    Calle y Número <span className="req">*</span>
                  </label>
                  <input
                    id="form-calle"
                    type="text"
                    className="suc-form-input"
                    value={modal.formData.calle || ''}
                    placeholder="Ej: Absalón Rojas 55"
                    onChange={(e) =>
                      setModal((prev) => ({
                        ...prev,
                        formData: { ...prev.formData, calle: e.target.value },
                        errors: { ...prev.errors, calle: undefined },
                      }))
                    }
                    required
                  />
                  {modal.errors.calle && (
                    <span className="suc-form-help" style={{ color: '#b10002' }}>
                      {modal.errors.calle}
                    </span>
                  )}
                </div>

                <div className="suc-form-row">
                  <div className="suc-form-group">
                    <label htmlFor="form-celular" className="suc-form-label">
                      Celular / WhatsApp
                    </label>
                    <input
                      id="form-celular"
                      type="text"
                      className="suc-form-input"
                      value={modal.formData.numero_celular || ''}
                      placeholder="Ej: +54 9 3854 73-5731"
                      onChange={(e) =>
                        setModal((prev) => ({
                          ...prev,
                          formData: { ...prev.formData, numero_celular: e.target.value },
                        }))
                      }
                    />
                  </div>

                  <div className="suc-form-group">
                    <label htmlFor="form-fijo" className="suc-form-label">
                      Teléfono Fijo
                    </label>
                    <input
                      id="form-fijo"
                      type="text"
                      className="suc-form-input"
                      value={modal.formData.numero_fijo || ''}
                      placeholder="Ej: (0385) 4214890"
                      onChange={(e) =>
                        setModal((prev) => ({
                          ...prev,
                          formData: { ...prev.formData, numero_fijo: e.target.value },
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="suc-form-group">
                  <label htmlFor="form-mapa" className="suc-form-label">
                    Google Maps (Enlace o URL de Embed)
                  </label>
                  <input
                    id="form-mapa"
                    type="text"
                    className="suc-form-input"
                    value={modal.formData.embed_google_maps || ''}
                    placeholder="https://maps.app.goo.gl/..."
                    onChange={(e) =>
                      setModal((prev) => ({
                        ...prev,
                        formData: { ...prev.formData, embed_google_maps: e.target.value },
                      }))
                    }
                  />
                  <p className="suc-form-help">
                    Podés pegar el enlace para compartir de Google Maps o la URL del iframe embed.
                  </p>
                </div>
              </div>

              <div className="suc-modal-footer">
                <button type="button" className="suc-btn suc-btn--outline" onClick={handleModalClose}>
                  Cancelar
                </button>
                <button type="submit" className="suc-btn suc-btn--wine">
                  {modal.mode === 'create' ? 'Agregar local' : 'Guardar local'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Barra persistente inferior cuando hay cambios ──────────────── */}
      {isDirty && (
        <aside className="suc-sticky-bar" aria-label="Barra de guardado">
          <div className="suc-sticky-inner">
            <div className="suc-sticky-info">
              <span className="suc-sticky-dot" />
              <span>Hay cambios sin guardar en la configuración de sucursales.</span>
            </div>
            <div className="suc-sticky-actions">
              <button
                type="button"
                className="suc-btn suc-btn--outline-light"
                onClick={handleDiscard}
                disabled={saving}
              >
                <FiRotateCcw /> Descartar
              </button>
              <button
                type="button"
                className="suc-btn suc-btn--primary"
                onClick={handleSaveAll}
                disabled={saving}
              >
                {saving ? 'Guardando…' : <><FiSave /> Guardar cambios</>}
              </button>
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}
