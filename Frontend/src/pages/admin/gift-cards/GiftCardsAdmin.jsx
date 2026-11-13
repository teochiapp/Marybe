import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useOutletContext } from 'react-router-dom';
import { acquireDedupedRequest, isRequestCanceled } from '../../../utils/requestDedup';
import {
  FiCheck,
  FiCopy,
  FiEdit2,
  FiGift,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiX,
} from 'react-icons/fi';
import './GiftCardsAdmin.css';

const API_BASE = process.env.REACT_APP_STRAPI_URL || process.env.REACT_APP_API_URL || 'http://localhost:1337';

const STATUS_OPTIONS = [
  { value: 'todos', label: 'Todas' },
  { value: 'activa', label: 'Activas' },
  { value: 'usada', label: 'Usadas' },
  { value: 'expirada', label: 'Expiradas' },
  { value: 'inactiva', label: 'Inactivas' },
];

const STATUS_LABELS = {
  activa: 'Activa',
  usada: 'Usada',
  expirada: 'Expirada',
  inactiva: 'Inactiva',
};

function formatCurrency(value) {
  return `$ ${Number(value || 0).toLocaleString('es-AR')}`;
}

function formatDate(dateString) {
  if (!dateString) return 'Sin vencimiento';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function toInputDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

export default function GiftCardsAdmin() {
  const context = useOutletContext() || {};
  const token = context.token || localStorage.getItem('admin_jwt') || '';

  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    activas: 0,
    usadas: 0,
    expiradas: 0,
    inactivas: 0,
    saldo_activo_total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [copiedCode, setCopiedCode] = useState('');

  // Modal de creación
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    codigo: '',
    monto: '',
    fecha_expiracion: '',
  });

  // Modal de edición / detalle
  const [selectedCard, setSelectedCard] = useState(null);
  const [editForm, setEditForm] = useState({
    monto: '',
    fecha_expiracion: '',
    activa: true,
  });

  const loadGiftCardsRequest = useCallback(
    (bypass = false) =>
      acquireDedupedRequest(
        `gift-cards-admin:${token}`,
        (signal) =>
          axios.get(`${API_BASE}/api/gift-cards-admin`, {
            headers: { Authorization: `Bearer ${token}` },
            signal,
          }),
        { bypass }
      ),
    [token]
  );

  const fetchGiftCards = useCallback(
    async (bypass = true) => {
      if (!token) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError('');
      try {
        const res = await loadGiftCardsRequest(bypass).promise;
        setItems(Array.isArray(res.data?.data) ? res.data.data : []);
        if (res.data?.meta?.stats) {
          setStats(res.data.meta.stats);
        }
      } catch (err) {
        if (!isRequestCanceled(err)) {
          setError(err.response?.data?.error?.message || 'No se pudieron cargar las Gift Cards.');
        }
      } finally {
        setLoading(false);
      }
    },
    [token, loadGiftCardsRequest]
  );

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return undefined;
    }
    let active = true;
    setLoading(true);
    setError('');
    const request = loadGiftCardsRequest(false);
    request.promise
      .then((res) => {
        if (!active) return;
        setItems(Array.isArray(res.data?.data) ? res.data.data : []);
        if (res.data?.meta?.stats) {
          setStats(res.data.meta.stats);
        }
      })
      .catch((err) => {
        if (active && !isRequestCanceled(err)) {
          setError(err.response?.data?.error?.message || 'No se pudieron cargar las Gift Cards.');
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
      request.release();
    };
  }, [token, loadGiftCardsRequest]);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    return items.filter((item) => {
      if (statusFilter !== 'todos' && item.estado_actual !== statusFilter) {
        return false;
      }
      if (!query) return true;
      const haystack = [
        item.codigo,
        item.pedido_origen?.numero_pedido,
        item.pedido_origen?.cliente_email,
        ...(Array.isArray(item.usos) ? item.usos.map((u) => `${u.numero_pedido} ${u.cliente_email}`) : []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [items, search, statusFilter]);

  const handleCopyCode = async (code) => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(code);
      }
      setCopiedCode(code);
      window.setTimeout(() => setCopiedCode(''), 1800);
    } catch {
      setCopiedCode(code);
    }
  };

  const openEditModal = (card) => {
    setSelectedCard(card);
    setEditForm({
      monto: String(card.monto ?? 0),
      fecha_expiracion: toInputDate(card.fecha_expiracion),
      activa: Boolean(card.activa),
    });
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await axios.post(
        `${API_BASE}/api/gift-cards-admin`,
        {
          codigo: createForm.codigo.trim() || undefined,
          monto: Number(createForm.monto),
          fecha_expiracion: createForm.fecha_expiracion || undefined,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowCreateModal(false);
      setCreateForm({ codigo: '', monto: '', fecha_expiracion: '' });
      setSuccess('Gift Card creada correctamente.');
      await fetchGiftCards();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'No se pudo crear la Gift Card.');
    } finally {
      setSaving(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCard) return;
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const targetId = selectedCard.id || selectedCard.documentId;
      await axios.patch(
        `${API_BASE}/api/gift-cards-admin/${targetId}`,
        {
          monto: Number(editForm.monto),
          activa: Boolean(editForm.activa),
          fecha_expiracion: editForm.fecha_expiracion || null,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSelectedCard(null);
      setSuccess('Gift Card actualizada correctamente.');
      await fetchGiftCards();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'No se pudo actualizar la Gift Card.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (card) => {
    if (card.estado_actual === 'expirada') return;
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const targetId = card.id || card.documentId;
      await axios.patch(
        `${API_BASE}/api/gift-cards-admin/${targetId}`,
        { activa: !card.activa },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess(`Gift Card ${card.codigo} ${card.activa ? 'desactivada' : 'activada'}.`);
      await fetchGiftCards();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'No se pudo cambiar el estado.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="gca-page">
      <header className="gca-header">
        <div className="gca-title-group">
          <div className="gca-icon-badge" aria-hidden="true">
            <FiGift />
          </div>
          <div>
            <h1 className="gca-title">Gift Cards</h1>
            <p className="gca-subtitle">Códigos comprados, saldos disponibles y estado de uso</p>
          </div>
        </div>
        <div className="gca-header-actions">
          <button
            type="button"
            className="gca-btn gca-btn--secondary"
            onClick={() => fetchGiftCards(true)}
            disabled={loading || saving}
          >
            <FiRefreshCw /> Actualizar
          </button>
          <button
            type="button"
            className="gca-btn gca-btn--primary"
            onClick={() => setShowCreateModal(true)}
            disabled={saving}
          >
            <FiPlus /> Nueva Gift Card
          </button>
        </div>
      </header>

      <section className="gca-stats" aria-label="Resumen de Gift Cards">
        <div className="gca-stat-card">
          <span className="gca-stat-label">Total emitidas</span>
          <strong className="gca-stat-value">{stats.total}</strong>
        </div>
        <div className="gca-stat-card">
          <span className="gca-stat-label">Activas</span>
          <strong className="gca-stat-value">{stats.activas}</strong>
        </div>
        <div className="gca-stat-card">
          <span className="gca-stat-label">Usadas</span>
          <strong className="gca-stat-value">{stats.usadas}</strong>
        </div>
        <div className="gca-stat-card">
          <span className="gca-stat-label">Expiradas / Inactivas</span>
          <strong className="gca-stat-value">{Number(stats.expiradas || 0) + Number(stats.inactivas || 0)}</strong>
        </div>
        <div className="gca-stat-card">
          <span className="gca-stat-label">Saldo activo total</span>
          <strong className="gca-stat-value gca-stat-value--accent">
            {formatCurrency(stats.saldo_activo_total)}
          </strong>
        </div>
      </section>

      {error && <div className="gca-alert gca-alert--error" role="alert">{error}</div>}
      {success && <div className="gca-alert gca-alert--success" role="status">{success}</div>}

      <section className="gca-toolbar">
        <div className="gca-search-wrap">
          <FiSearch className="gca-search-icon" aria-hidden="true" />
          <input
            id="gca-search"
            name="buscar"
            type="search"
            className="gca-search-input"
            placeholder="Buscar por código, pedido o email..."
            aria-label="Buscar Gift Cards"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="gca-filters" role="group" aria-label="Filtrar por estado">
          {STATUS_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`gca-filter-pill ${statusFilter === option.value ? 'gca-filter-pill--active' : ''}`}
              onClick={() => setStatusFilter(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </section>

      <section className="gca-table-card">
        {loading ? (
          <div className="gca-empty">Cargando Gift Cards...</div>
        ) : filteredItems.length === 0 ? (
          <div className="gca-empty">No se encontraron Gift Cards con los filtros seleccionados.</div>
        ) : (
          <div className="gca-table-wrap">
            <table className="gca-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Estado</th>
                  <th>Saldo</th>
                  <th>Pedido origen</th>
                  <th>Canjes</th>
                  <th>Emisión</th>
                  <th>Vencimiento</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((card) => (
                  <tr key={card.id || card.codigo}>
                    <td data-label="Código">
                      <div className="gca-code-cell">
                        <code className="gca-code">{card.codigo}</code>
                        <button
                          type="button"
                          className="gca-copy-btn"
                          onClick={() => handleCopyCode(card.codigo)}
                          aria-label={`Copiar código ${card.codigo}`}
                          title="Copiar código"
                        >
                          {copiedCode === card.codigo ? <FiCheck /> : <FiCopy />}
                        </button>
                      </div>
                    </td>
                    <td data-label="Estado">
                      <span className={`gca-badge gca-badge--${card.estado_actual}`}>
                        {STATUS_LABELS[card.estado_actual] || card.estado_actual}
                      </span>
                    </td>
                    <td data-label="Saldo" className="gca-amount">
                      {formatCurrency(card.monto)}
                    </td>
                    <td data-label="Pedido origen">
                      {card.pedido_origen ? (
                        <>
                          <span className="gca-origin-main">{card.pedido_origen.numero_pedido}</span>
                          <span className="gca-origin-sub">{card.pedido_origen.cliente_email || 'Sin email'}</span>
                        </>
                      ) : (
                        <span className="gca-origin-sub">Emisión manual</span>
                      )}
                    </td>
                    <td data-label="Canjes">
                      {Array.isArray(card.usos) && card.usos.length > 0 ? (
                        card.usos.map((uso, index) => (
                          <span key={`${uso.numero_pedido}-${index}`} className="gca-origin-sub">
                            {uso.numero_pedido} ({formatCurrency(uso.monto_usado)})
                          </span>
                        ))
                      ) : (
                        <span className="gca-origin-sub">Sin canjes</span>
                      )}
                    </td>
                    <td data-label="Emisión">{formatDate(card.createdAt)}</td>
                    <td data-label="Vencimiento">{formatDate(card.fecha_expiracion)}</td>
                    <td data-label="Acciones">
                      <div className="gca-actions">
                        <button
                          type="button"
                          className="gca-btn gca-btn--secondary gca-btn--sm"
                          onClick={() => openEditModal(card)}
                          aria-label={`Editar ${card.codigo}`}
                        >
                          <FiEdit2 /> Gestionar
                        </button>
                        <button
                          type="button"
                          className="gca-btn gca-btn--secondary gca-btn--sm"
                          onClick={() => handleToggleActive(card)}
                          disabled={saving || card.estado_actual === 'expirada'}
                          title={card.estado_actual === 'expirada' ? 'Tarjeta expirada. Editá el vencimiento desde Gestionar.' : undefined}
                        >
                          {card.activa ? 'Desactivar' : 'Activar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {showCreateModal && (
        <div className="gca-modal-backdrop" role="dialog" aria-modal="true" aria-label="Nueva Gift Card">
          <form className="gca-modal" onSubmit={handleCreateSubmit}>
            <div className="gca-modal-header">
              <h2>Nueva Gift Card</h2>
              <button
                type="button"
                className="gca-modal-close"
                onClick={() => setShowCreateModal(false)}
                aria-label="Cerrar modal"
              >
                <FiX />
              </button>
            </div>
            <div className="gca-modal-body">
              <div className="gca-field">
                <label htmlFor="gca-create-code">Código (opcional, se genera automático si queda vacío)</label>
                <input
                  id="gca-create-code"
                  type="text"
                  placeholder="Ej: GC-PROMO2026"
                  value={createForm.codigo}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, codigo: e.target.value }))}
                />
              </div>
              <div className="gca-field">
                <label htmlFor="gca-create-monto">Monto / Saldo ($)</label>
                <input
                  id="gca-create-monto"
                  type="number"
                  min="1"
                  required
                  placeholder="25000"
                  value={createForm.monto}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, monto: e.target.value }))}
                />
              </div>
              <div className="gca-field">
                <label htmlFor="gca-create-exp">Fecha de vencimiento (opcional, 1 año por defecto)</label>
                <input
                  id="gca-create-exp"
                  type="date"
                  value={createForm.fecha_expiracion}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, fecha_expiracion: e.target.value }))}
                />
              </div>
            </div>
            <div className="gca-modal-footer">
              <button
                type="button"
                className="gca-btn gca-btn--secondary"
                onClick={() => setShowCreateModal(false)}
              >
                Cancelar
              </button>
              <button type="submit" className="gca-btn gca-btn--primary" disabled={saving}>
                {saving ? 'Creando...' : 'Crear Gift Card'}
              </button>
            </div>
          </form>
        </div>
      )}

      {selectedCard && (
        <div className="gca-modal-backdrop" role="dialog" aria-modal="true" aria-label={`Gestionar ${selectedCard.codigo}`}>
          <form className="gca-modal" onSubmit={handleEditSubmit}>
            <div className="gca-modal-header">
              <h2>Gift Card {selectedCard.codigo}</h2>
              <button
                type="button"
                className="gca-modal-close"
                onClick={() => setSelectedCard(null)}
                aria-label="Cerrar modal"
              >
                <FiX />
              </button>
            </div>
            <div className="gca-modal-body">
              <div className="gca-detail-box">
                <div><strong>Estado actual:</strong> {STATUS_LABELS[selectedCard.estado_actual] || selectedCard.estado_actual}</div>
                <div>
                  <strong>Pedido origen:</strong>{' '}
                  {selectedCard.pedido_origen
                    ? `${selectedCard.pedido_origen.numero_pedido} (${selectedCard.pedido_origen.cliente_email || 'Sin email'})`
                    : 'Emisión manual'}
                </div>
                <div>
                  <strong>Historial de canjes:</strong>{' '}
                  {Array.isArray(selectedCard.usos) && selectedCard.usos.length > 0
                    ? selectedCard.usos.map((u) => `${u.numero_pedido}: ${formatCurrency(u.monto_usado)}`).join(', ')
                    : 'Sin canjes registrados'}
                </div>
              </div>
              <div className="gca-field">
                <label htmlFor="gca-edit-monto">Saldo disponible ($)</label>
                <input
                  id="gca-edit-monto"
                  type="number"
                  min="0"
                  required
                  value={editForm.monto}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, monto: e.target.value }))}
                />
              </div>
              <div className="gca-field">
                <label htmlFor="gca-edit-exp">Fecha de vencimiento</label>
                <input
                  id="gca-edit-exp"
                  type="date"
                  value={editForm.fecha_expiracion}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, fecha_expiracion: e.target.value }))}
                />
              </div>
              <label htmlFor="gca-edit-activa" className="gca-checkbox-row">
                <input
                  id="gca-edit-activa"
                  name="activa"
                  type="checkbox"
                  checked={editForm.activa}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, activa: e.target.checked }))}
                />
                Gift Card activa para canje
              </label>
            </div>
            <div className="gca-modal-footer">
              <button
                type="button"
                className="gca-btn gca-btn--secondary"
                onClick={() => setSelectedCard(null)}
              >
                Cancelar
              </button>
              <button type="submit" className="gca-btn gca-btn--primary" disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
