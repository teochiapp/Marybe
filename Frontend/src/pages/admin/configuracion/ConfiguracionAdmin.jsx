import React, { useEffect, useState, useTransition } from 'react';
import axios from 'axios';
import { useOutletContext } from 'react-router-dom';
import {
  FiCheck,
  FiCreditCard,
  FiDollarSign,
  FiHelpCircle,
  FiMessageCircle,
  FiSave,
  FiSettings,
  FiShoppingBag,
  FiTruck,
} from 'react-icons/fi';
import './ConfiguracionAdmin.css';

const API_BASE = process.env.REACT_APP_STRAPI_URL || process.env.REACT_APP_API_URL || 'http://localhost:1337';

const INITIAL_FORM = {
  // Cuotas
  cuotas_activas: true,
  cuotas_texto_previo: '',
  cuotas_cantidad: 3,

  // WhatsApp
  whatsapp_numero: '',

  // Envíos
  costo_envio: '',
  envio_gratis_desde: '',
  costo_uber_moto: '',

  // Mercado Pago
  mp_habilitado: true,
  mp_titulo: 'Mercado Pago',
  mp_subtitulo: '',
  mp_etiqueta: '',
  mp_descripcion: '',

  // Transferencia
  transf_habilitado: true,
  transf_titulo: 'Transferencia Bancaria',
  transf_subtitulo: '',
  transf_etiqueta: '',
  transf_banco: '',
  transf_titular: '',
  transf_cuit: '',
  transf_cbu: '',
  transf_alias: '',
  transf_mensaje_wp: '',

  // Efectivo
  ef_habilitado: true,
  ef_titulo: 'Efectivo al retirar',
  ef_subtitulo: '',
  ef_etiqueta: '',
  ef_horario: '',

  // A convenir
  ac_habilitado: true,
  ac_titulo: 'A convenir',
  ac_subtitulo: '',
  ac_etiqueta: '',
  ac_descripcion: '',
  ac_respuesta: '',
};

export default function ConfiguracionAdmin() {
  const context = useOutletContext() || {};
  const token = context.token || localStorage.getItem('admin_jwt');

  const [form, setForm] = useState(INITIAL_FORM);
  const [initialSnapshot, setInitialSnapshot] = useState(JSON.stringify(INITIAL_FORM));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('todos');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [, startTransition] = useTransition();

  const isDirty = JSON.stringify(form) !== initialSnapshot;

  // Carga inicial de datos
  useEffect(() => {
    let unmounted = false;
    const fetchConfig = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await axios.get(`${API_BASE}/api/configuracion-general-admin`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = response.data?.data || {};
        const merged = {
          ...INITIAL_FORM,
          ...data,
          // Normalizar números a string para los inputs controlados
          costo_envio: data.costo_envio != null ? String(data.costo_envio) : '',
          envio_gratis_desde: data.envio_gratis_desde != null ? String(data.envio_gratis_desde) : '',
          costo_uber_moto: data.costo_uber_moto != null ? String(data.costo_uber_moto) : '',
          cuotas_cantidad: data.cuotas_cantidad != null ? Number(data.cuotas_cantidad) : 3,
        };
        if (!unmounted) {
          setForm(merged);
          setInitialSnapshot(JSON.stringify(merged));
        }
      } catch (err) {
        if (!unmounted) {
          setError(err.response?.data?.error?.message || 'No se pudo cargar la configuración general.');
        }
      } finally {
        if (!unmounted) setLoading(false);
      }
    };

    fetchConfig();
    return () => { unmounted = true; };
  }, [token]);

  // Alerta de cambios sin guardar al salir
  useEffect(() => {
    const handleBeforeUnload = event => {
      if (isDirty) {
        event.preventDefault();
        event.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const handleChange = (key, value) => {
    startTransition(() => {
      setForm(prev => ({ ...prev, [key]: value }));
    });
    setSuccess('');
    setError('');
  };

  const handleSave = async event => {
    if (event) event.preventDefault();
    if (!isDirty || saving) return;

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        ...form,
        costo_envio: form.costo_envio !== '' ? Number(form.costo_envio) : null,
        envio_gratis_desde: form.envio_gratis_desde !== '' ? Number(form.envio_gratis_desde) : null,
        costo_uber_moto: form.costo_uber_moto !== '' ? Number(form.costo_uber_moto) : null,
        cuotas_cantidad: Number(form.cuotas_cantidad) || 3,
      };

      const response = await axios.put(
        `${API_BASE}/api/configuracion-general-admin`,
        { data: payload },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );

      const savedData = response.data?.data || payload;
      const normalizedSaved = {
        ...INITIAL_FORM,
        ...savedData,
        costo_envio: savedData.costo_envio != null ? String(savedData.costo_envio) : '',
        envio_gratis_desde: savedData.envio_gratis_desde != null ? String(savedData.envio_gratis_desde) : '',
        costo_uber_moto: savedData.costo_uber_moto != null ? String(savedData.costo_uber_moto) : '',
      };

      setForm(normalizedSaved);
      setInitialSnapshot(JSON.stringify(normalizedSaved));
      setSuccess('Configuración guardada correctamente.');
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Error al guardar la configuración.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="cfg-page">
        <div className="cfg-loading">
          <div className="cfg-spinner" />
          <p>Cargando configuración general…</p>
        </div>
      </div>
    );
  }

  const shouldShow = sectionKey => activeTab === 'todos' || activeTab === sectionKey;

  return (
    <div className="cfg-page">
      <header className="cfg-header">
        <div className="cfg-header-copy">
          <p className="cfg-eyebrow">Configuración / General</p>
          <h1>Configuración General</h1>
          <p className="cfg-intro">
            Administrá envíos, cuotas, WhatsApp y métodos de pago de la tienda. Los cambios se aplicarán directamente en el catálogo y checkout.
          </p>
        </div>
        <div className="cfg-header-actions">
          <span className={`cfg-status-pill ${isDirty ? 'is-dirty' : 'is-saved'}`}>
            {isDirty ? '● Cambios sin guardar' : '✔ Todo guardado'}
          </span>
          <button
            type="button"
            className="cfg-btn-primary"
            onClick={handleSave}
            disabled={!isDirty || saving}
          >
            <FiSave />
            <span>{saving ? 'Guardando…' : 'Guardar cambios'}</span>
          </button>
        </div>
      </header>

      {error && <div className="cfg-alert cfg-alert--error" role="alert">{error}</div>}
      {success && <div className="cfg-alert cfg-alert--success" role="status"><FiCheck /> {success}</div>}

      <nav className="cfg-nav-tabs" aria-label="Filtro de secciones">
        {[
          { id: 'todos', label: 'Ver todo', icon: FiSettings },
          { id: 'envios', label: 'Envíos y Logística', icon: FiTruck },
          { id: 'cuotas', label: 'Cuotas y Financiación', icon: FiCreditCard },
          { id: 'contacto', label: 'WhatsApp y Contacto', icon: FiMessageCircle },
          { id: 'pagos', label: 'Métodos de Pago', icon: FiDollarSign },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              className={`cfg-nav-tab ${activeTab === tab.id ? 'is-active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      <form onSubmit={handleSave} className="cfg-grid">
        {/* 1. ENVÍOS Y LOGÍSTICA */}
        {shouldShow('envios') && (
          <section className="cfg-card" aria-labelledby="cfg-sec-envios">
            <header className="cfg-card-header">
              <div className="cfg-card-title-group">
                <div className="cfg-card-icon"><FiTruck /></div>
                <div>
                  <h2 id="cfg-sec-envios">Envíos y Logística</h2>
                  <p>Tarifas de envío a domicilio y umbral de gratuidad</p>
                </div>
              </div>
            </header>

            <div className="cfg-form-grid">
              <div className="cfg-field">
                <label htmlFor="cfg-costo-envio">Costo de envío estándar <span className="cfg-optional">(ARS)</span></label>
                <div className="cfg-input-wrap">
                  <span className="cfg-input-prefix">$</span>
                  <input
                    id="cfg-costo-envio"
                    className="cfg-input--with-prefix"
                    type="number"
                    min="0"
                    step="1"
                    placeholder="Ej: 6000"
                    value={form.costo_envio}
                    onChange={e => handleChange('costo_envio', e.target.value)}
                  />
                </div>
                <small className="cfg-field-hint">Aplica cuando la compra no alcanza el mínimo para envío gratis.</small>
              </div>

              <div className="cfg-field">
                <label htmlFor="cfg-envio-gratis">Envío gratis a partir de <span className="cfg-optional">(ARS)</span></label>
                <div className="cfg-input-wrap">
                  <span className="cfg-input-prefix">$</span>
                  <input
                    id="cfg-envio-gratis"
                    className="cfg-input--with-prefix"
                    type="number"
                    min="0"
                    step="1"
                    placeholder="Ej: 50000"
                    value={form.envio_gratis_desde}
                    onChange={e => handleChange('envio_gratis_desde', e.target.value)}
                  />
                </div>
                <small className="cfg-field-hint">Compras iguales o superiores a este monto tienen envío bonificado.</small>
              </div>

              <div className="cfg-field cfg-field--full">
                <label htmlFor="cfg-uber-moto">Costo de envío Uber / Moto <span className="cfg-optional">(ARS)</span></label>
                <div className="cfg-input-wrap">
                  <span className="cfg-input-prefix">$</span>
                  <input
                    id="cfg-uber-moto"
                    className="cfg-input--with-prefix"
                    type="number"
                    min="0"
                    step="1"
                    placeholder="Ej: 3500"
                    value={form.costo_uber_moto}
                    onChange={e => handleChange('costo_uber_moto', e.target.value)}
                  />
                </div>
                <small className="cfg-field-hint">Tarifa para entregas rápidas coordinadas en moto.</small>
              </div>
            </div>
          </section>
        )}

        {/* 2. CUOTAS Y FINANCIACIÓN */}
        {shouldShow('cuotas') && (
          <section className="cfg-card" aria-labelledby="cfg-sec-cuotas">
            <header className="cfg-card-header">
              <div className="cfg-card-title-group">
                <div className="cfg-card-icon"><FiCreditCard /></div>
                <div>
                  <h2 id="cfg-sec-cuotas">Cuotas y Financiación</h2>
                  <p>Muestra los planes de cuotas en fichas de producto y catálogo</p>
                </div>
              </div>
              <label className="cfg-switch">
                <input
                  type="checkbox"
                  checked={form.cuotas_activas}
                  onChange={e => handleChange('cuotas_activas', e.target.checked)}
                />
                <span className="cfg-switch-slider" />
                <span>{form.cuotas_activas ? 'Activo' : 'Pausado'}</span>
              </label>
            </header>

            <div className="cfg-form-grid">
              <div className="cfg-field">
                <label htmlFor="cfg-cuotas-cant">Cantidad de cuotas</label>
                <select
                  id="cfg-cuotas-cant"
                  value={form.cuotas_cantidad}
                  onChange={e => handleChange('cuotas_cantidad', Number(e.target.value))}
                >
                  <option value={1}>1 cuota</option>
                  <option value={2}>2 cuotas</option>
                  <option value={3}>3 cuotas</option>
                  <option value={6}>6 cuotas</option>
                  <option value={9}>9 cuotas</option>
                  <option value={12}>12 cuotas</option>
                  <option value={18}>18 cuotas</option>
                </select>
                <small className="cfg-field-hint">Número de cuotas que calcula el sistema.</small>
              </div>

              <div className="cfg-field">
                <label htmlFor="cfg-cuotas-texto">Texto previo a las cuotas</label>
                <input
                  id="cfg-cuotas-texto"
                  type="text"
                  placeholder="Ej: Hasta, En, O en"
                  value={form.cuotas_texto_previo}
                  onChange={e => handleChange('cuotas_texto_previo', e.target.value)}
                />
                <small className="cfg-field-hint">Acompaña la leyenda, ej: «Hasta 3 cuotas sin interés».</small>
              </div>
            </div>
          </section>
        )}

        {/* 3. WHATSAPP Y ATENCIÓN */}
        {shouldShow('contacto') && (
          <section className="cfg-card" aria-labelledby="cfg-sec-whatsapp">
            <header className="cfg-card-header">
              <div className="cfg-card-title-group">
                <div className="cfg-card-icon"><FiMessageCircle /></div>
                <div>
                  <h2 id="cfg-sec-whatsapp">WhatsApp y Contacto</h2>
                  <p>Línea para consultas directas y botón flotante de WhatsApp</p>
                </div>
              </div>
            </header>

            <div className="cfg-field cfg-field--full">
              <label htmlFor="cfg-whatsapp">Número de WhatsApp</label>
              <input
                id="cfg-whatsapp"
                type="text"
                placeholder="Ej: 5491112345678"
                value={form.whatsapp_numero}
                onChange={e => handleChange('whatsapp_numero', e.target.value)}
              />
              <small className="cfg-field-hint">Ingresá el número con código de país (54) y código de área sin el 15 ni símbolos (ej: 5491112345678).</small>
            </div>
          </section>
        )}

        {/* 4. MERCADO PAGO */}
        {shouldShow('pagos') && (
          <section className="cfg-card" aria-labelledby="cfg-sec-mp">
            <header className="cfg-card-header">
              <div className="cfg-card-title-group">
                <div className="cfg-card-icon"><FiShoppingBag /></div>
                <div>
                  <h2 id="cfg-sec-mp">Mercado Pago</h2>
                  <p>Pagos con tarjetas de crédito, débito y dinero en cuenta</p>
                </div>
              </div>
              <label className="cfg-switch">
                <input
                  type="checkbox"
                  checked={form.mp_habilitado}
                  onChange={e => handleChange('mp_habilitado', e.target.checked)}
                />
                <span className="cfg-switch-slider" />
                <span>{form.mp_habilitado ? 'Habilitado' : 'Deshabilitado'}</span>
              </label>
            </header>

            <div className="cfg-form-grid">
              <div className="cfg-field">
                <label htmlFor="cfg-mp-titulo">Título visible</label>
                <input
                  id="cfg-mp-titulo"
                  type="text"
                  value={form.mp_titulo}
                  onChange={e => handleChange('mp_titulo', e.target.value)}
                />
              </div>

              <div className="cfg-field">
                <label htmlFor="cfg-mp-etiqueta">Etiqueta destacada <span className="cfg-optional">(Badge)</span></label>
                <input
                  id="cfg-mp-etiqueta"
                  type="text"
                  placeholder="Ej: Recomendado"
                  value={form.mp_etiqueta}
                  onChange={e => handleChange('mp_etiqueta', e.target.value)}
                />
              </div>

              <div className="cfg-field cfg-field--full">
                <label htmlFor="cfg-mp-subtitulo">Subtítulo explicativo</label>
                <input
                  id="cfg-mp-subtitulo"
                  type="text"
                  placeholder="Ej: Tarjetas de crédito, débito o dinero en cuenta"
                  value={form.mp_subtitulo}
                  onChange={e => handleChange('mp_subtitulo', e.target.value)}
                />
              </div>

              <div className="cfg-field cfg-field--full">
                <label htmlFor="cfg-mp-desc">Instrucciones o descripción adicional</label>
                <textarea
                  id="cfg-mp-desc"
                  placeholder="Información extra que se muestra en el paso de pago"
                  value={form.mp_descripcion}
                  onChange={e => handleChange('mp_descripcion', e.target.value)}
                />
              </div>
            </div>
          </section>
        )}

        {/* 5. TRANSFERENCIA BANCARIA */}
        {shouldShow('pagos') && (
          <section className="cfg-card cfg-card--full" aria-labelledby="cfg-sec-transf">
            <header className="cfg-card-header">
              <div className="cfg-card-title-group">
                <div className="cfg-card-icon"><FiDollarSign /></div>
                <div>
                  <h2 id="cfg-sec-transf">Transferencia Bancaria</h2>
                  <p>Datos bancarios para recibir pagos por transferencia o depósito</p>
                </div>
              </div>
              <label className="cfg-switch">
                <input
                  type="checkbox"
                  checked={form.transf_habilitado}
                  onChange={e => handleChange('transf_habilitado', e.target.checked)}
                />
                <span className="cfg-switch-slider" />
                <span>{form.transf_habilitado ? 'Habilitado' : 'Deshabilitado'}</span>
              </label>
            </header>

            <div className="cfg-form-grid">
              <div className="cfg-field">
                <label htmlFor="cfg-transf-titulo">Título visible</label>
                <input
                  id="cfg-transf-titulo"
                  type="text"
                  value={form.transf_titulo}
                  onChange={e => handleChange('transf_titulo', e.target.value)}
                />
              </div>

              <div className="cfg-field">
                <label htmlFor="cfg-transf-etiqueta">Etiqueta destacada <span className="cfg-optional">(Badge)</span></label>
                <input
                  id="cfg-transf-etiqueta"
                  type="text"
                  placeholder="Ej: 10% OFF"
                  value={form.transf_etiqueta}
                  onChange={e => handleChange('transf_etiqueta', e.target.value)}
                />
              </div>

              <div className="cfg-field cfg-field--full">
                <label htmlFor="cfg-transf-subtitulo">Subtítulo explicativo</label>
                <input
                  id="cfg-transf-subtitulo"
                  type="text"
                  placeholder="Ej: Descuento abonando por transferencia"
                  value={form.transf_subtitulo}
                  onChange={e => handleChange('transf_subtitulo', e.target.value)}
                />
              </div>

              <div className="cfg-field">
                <label htmlFor="cfg-transf-banco">Banco</label>
                <input
                  id="cfg-transf-banco"
                  type="text"
                  placeholder="Ej: Banco Galicia / Santander"
                  value={form.transf_banco}
                  onChange={e => handleChange('transf_banco', e.target.value)}
                />
              </div>

              <div className="cfg-field">
                <label htmlFor="cfg-transf-titular">Titular de la cuenta</label>
                <input
                  id="cfg-transf-titular"
                  type="text"
                  placeholder="Nombre y apellido o razón social"
                  value={form.transf_titular}
                  onChange={e => handleChange('transf_titular', e.target.value)}
                />
              </div>

              <div className="cfg-field">
                <label htmlFor="cfg-transf-cuit">CUIT / CUIL</label>
                <input
                  id="cfg-transf-cuit"
                  type="text"
                  placeholder="Ej: 30-12345678-9"
                  value={form.transf_cuit}
                  onChange={e => handleChange('transf_cuit', e.target.value)}
                />
              </div>

              <div className="cfg-field">
                <label htmlFor="cfg-transf-cbu">CBU / CVU</label>
                <input
                  id="cfg-transf-cbu"
                  type="text"
                  placeholder="22 dígitos"
                  value={form.transf_cbu}
                  onChange={e => handleChange('transf_cbu', e.target.value)}
                />
              </div>

              <div className="cfg-field">
                <label htmlFor="cfg-transf-alias">Alias bancario</label>
                <input
                  id="cfg-transf-alias"
                  type="text"
                  placeholder="Ej: MARYBE.TIENDA"
                  value={form.transf_alias}
                  onChange={e => handleChange('transf_alias', e.target.value)}
                />
              </div>

              <div className="cfg-field cfg-field--full">
                <label htmlFor="cfg-transf-msg">Mensaje de instrucciones para comprobante de WhatsApp</label>
                <input
                  id="cfg-transf-msg"
                  type="text"
                  placeholder="Ej: Enviá el comprobante indicando tu número de pedido"
                  value={form.transf_mensaje_wp}
                  onChange={e => handleChange('transf_mensaje_wp', e.target.value)}
                />
              </div>
            </div>
          </section>
        )}

        {/* 6. EFECTIVO AL RETIRAR */}
        {shouldShow('pagos') && (
          <section className="cfg-card" aria-labelledby="cfg-sec-ef">
            <header className="cfg-card-header">
              <div className="cfg-card-title-group">
                <div className="cfg-card-icon"><FiDollarSign /></div>
                <div>
                  <h2 id="cfg-sec-ef">Efectivo en Sucursal</h2>
                  <p>Pago presencial en el local al retirar el pedido</p>
                </div>
              </div>
              <label className="cfg-switch">
                <input
                  type="checkbox"
                  checked={form.ef_habilitado}
                  onChange={e => handleChange('ef_habilitado', e.target.checked)}
                />
                <span className="cfg-switch-slider" />
                <span>{form.ef_habilitado ? 'Habilitado' : 'Deshabilitado'}</span>
              </label>
            </header>

            <div className="cfg-form-grid">
              <div className="cfg-field">
                <label htmlFor="cfg-ef-titulo">Título visible</label>
                <input
                  id="cfg-ef-titulo"
                  type="text"
                  value={form.ef_titulo}
                  onChange={e => handleChange('ef_titulo', e.target.value)}
                />
              </div>

              <div className="cfg-field">
                <label htmlFor="cfg-ef-etiqueta">Etiqueta destacada <span className="cfg-optional">(Badge)</span></label>
                <input
                  id="cfg-ef-etiqueta"
                  type="text"
                  placeholder="Ej: En sucursal"
                  value={form.ef_etiqueta}
                  onChange={e => handleChange('ef_etiqueta', e.target.value)}
                />
              </div>

              <div className="cfg-field cfg-field--full">
                <label htmlFor="cfg-ef-subtitulo">Subtítulo explicativo</label>
                <input
                  id="cfg-ef-subtitulo"
                  type="text"
                  placeholder="Ej: Pagá en el local al retirar tu compra"
                  value={form.ef_subtitulo}
                  onChange={e => handleChange('ef_subtitulo', e.target.value)}
                />
              </div>

              <div className="cfg-field cfg-field--full">
                <label htmlFor="cfg-ef-horario">Horarios de atención para retiro</label>
                <input
                  id="cfg-ef-horario"
                  type="text"
                  placeholder="Ej: Lunes a Sábados de 9 a 20 hs"
                  value={form.ef_horario}
                  onChange={e => handleChange('ef_horario', e.target.value)}
                />
              </div>
            </div>
          </section>
        )}

        {/* 7. A CONVENIR */}
        {shouldShow('pagos') && (
          <section className="cfg-card" aria-labelledby="cfg-sec-ac">
            <header className="cfg-card-header">
              <div className="cfg-card-title-group">
                <div className="cfg-card-icon"><FiHelpCircle /></div>
                <div>
                  <h2 id="cfg-sec-ac">A Convenir</h2>
                  <p>Coordinación personalizada de pago y entrega</p>
                </div>
              </div>
              <label className="cfg-switch">
                <input
                  type="checkbox"
                  checked={form.ac_habilitado}
                  onChange={e => handleChange('ac_habilitado', e.target.checked)}
                />
                <span className="cfg-switch-slider" />
                <span>{form.ac_habilitado ? 'Habilitado' : 'Deshabilitado'}</span>
              </label>
            </header>

            <div className="cfg-form-grid">
              <div className="cfg-field">
                <label htmlFor="cfg-ac-titulo">Título visible</label>
                <input
                  id="cfg-ac-titulo"
                  type="text"
                  value={form.ac_titulo}
                  onChange={e => handleChange('ac_titulo', e.target.value)}
                />
              </div>

              <div className="cfg-field">
                <label htmlFor="cfg-ac-etiqueta">Etiqueta destacada <span className="cfg-optional">(Badge)</span></label>
                <input
                  id="cfg-ac-etiqueta"
                  type="text"
                  placeholder="Ej: A coordinar"
                  value={form.ac_etiqueta}
                  onChange={e => handleChange('ac_etiqueta', e.target.value)}
                />
              </div>

              <div className="cfg-field cfg-field--full">
                <label htmlFor="cfg-ac-subtitulo">Subtítulo explicativo</label>
                <input
                  id="cfg-ac-subtitulo"
                  type="text"
                  placeholder="Ej: Nos comunicaremos para coordinar el pago"
                  value={form.ac_subtitulo}
                  onChange={e => handleChange('ac_subtitulo', e.target.value)}
                />
              </div>

              <div className="cfg-field cfg-field--full">
                <label htmlFor="cfg-ac-desc">Descripción</label>
                <textarea
                  id="cfg-ac-desc"
                  placeholder="Detalles sobre este método"
                  value={form.ac_descripcion}
                  onChange={e => handleChange('ac_descripcion', e.target.value)}
                />
              </div>

              <div className="cfg-field cfg-field--full">
                <label htmlFor="cfg-ac-resp">Mensaje de confirmación en la compra</label>
                <input
                  id="cfg-ac-resp"
                  type="text"
                  placeholder="Ej: Te contactaremos en breve para finalizar tu pedido"
                  value={form.ac_respuesta}
                  onChange={e => handleChange('ac_respuesta', e.target.value)}
                />
              </div>
            </div>
          </section>
        )}
      </form>

      {/* Barra sticky inferior de guardado */}
      <div className="cfg-sticky-bottom">
        <span className={`cfg-sticky-status ${isDirty ? 'is-dirty' : ''}`}>
          {isDirty ? '● Hay cambios sin guardar en la configuración' : '✔ La configuración está sincronizada con la tienda'}
        </span>
        <button
          type="button"
          className="cfg-btn-primary"
          onClick={handleSave}
          disabled={!isDirty || saving}
        >
          <FiSave />
          <span>{saving ? 'Guardando…' : 'Guardar cambios'}</span>
        </button>
      </div>
    </div>
  );
}
