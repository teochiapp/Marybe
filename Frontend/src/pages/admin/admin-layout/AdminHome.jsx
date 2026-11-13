import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useOutletContext } from 'react-router-dom';
import { ADMIN_GROUPS } from './adminNavigation';
import { acquireDedupedRequest, isRequestCanceled } from '../../../utils/requestDedup';

const API = process.env.REACT_APP_STRAPI_URL || process.env.REACT_APP_API_URL || 'http://localhost:1337';
const money = amount => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(amount);

export default function AdminHome() {
  const { token } = useOutletContext();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!token) return undefined;
    let active = true;
    const request = acquireDedupedRequest(
      `admin-dashboard:${token}`,
      signal => axios.get(`${API}/api/admin-dashboard`, { headers: { Authorization: `Bearer ${token}` }, signal })
    );
    request.promise
      .then(response => { if (active) setStats(response.data.data); })
      .catch(requestError => {
        if (active && !isRequestCanceled(requestError)) {
          setError(requestError.response?.data?.error?.message || 'No se pudieron cargar las estadísticas.');
        }
      });
    return () => {
      active = false;
      request.release();
    };
  }, [token]);
  return <div className="admin-home">
    <header><p className="admin-eyebrow">Administración / Inicio</p><h1>Panel general</h1><p>Resumen de la tienda y acceso a las herramientas.</p></header>
    {error && <p role="alert" className="admin-home-error">{error}</p>}
    <section aria-label="Estadísticas" className="admin-stats">
      <article><span>Ventas totales</span><strong>{stats ? money(stats.ventasTotales) : '—'}</strong><small>Pedidos registrados como venta</small></article>
      <article><span>Pedidos del mes</span><strong>{stats?.pedidosMes ?? '—'}</strong><small>Sin cancelados ni abortados</small></article>
      <article><span>Pendientes de pago</span><strong>{stats?.pedidosPendientes ?? '—'}</strong><small>Pedidos por revisar</small></article>
    </section>
    <section aria-labelledby="admin-tools-title"><h2 id="admin-tools-title">Accesos rápidos</h2><div className="admin-quick-links">{ADMIN_GROUPS.flatMap(group => group.items).filter(item => ['/pedidos-admin', '/editor-admin', '/importacion-admin', '/editor-inicio-admin', '/banners-admin'].includes(item.path)).map(item => <Link key={item.path} to={item.path}><strong>{item.label}</strong><span>Abrir módulo →</span></Link>)}</div></section>
  </div>;
}
