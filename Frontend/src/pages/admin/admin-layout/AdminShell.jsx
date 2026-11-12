import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { FiBarChart2, FiBox, FiDownload, FiExternalLink, FiFileText, FiGrid, FiHome, FiImage, FiMenu, FiRepeat, FiTruck, FiUpload, FiX } from 'react-icons/fi';
import useAdminSession from '../../../hooks/useAdminSession';
import AdminLoginCard from '../editor-inicio/components/AdminLoginCard';
import { ADMIN_GROUPS } from './adminNavigation';
import './AdminLayout.css';

const ICONS = { orders: FiFileText, products: FiBox, import: FiUpload, export: FiDownload, compare: FiRepeat, supplier: FiTruck, home: FiHome, menu: FiMenu, image: FiImage };

export default function AdminShell() {
  const { token, signIn, signOut, sync } = useAdminSession();
  const { pathname } = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => { sync(); setMobileOpen(false); }, [pathname, sync]);
  useEffect(() => {
    const timer = window.setInterval(sync, 2000);
    window.addEventListener('focus', sync);
    return () => { window.clearInterval(timer); window.removeEventListener('focus', sync); };
  }, [sync]);

  const hasLeaveApproval = () => {
    const leave = new Event('beforeunload', { cancelable: true });
    return window.dispatchEvent(leave) || window.confirm('Hay cambios sin guardar. ¿Salir de este módulo?');
  };
  const navigateSafely = event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    if (!hasLeaveApproval()) event.preventDefault();
  };

  if (!token) return <AdminLoginCard subtitle="Administración" onAuthenticated={signIn} />;

  return <div className={`admin-shell${collapsed ? ' admin-shell--collapsed' : ''}`}>
    <button className="admin-mobile-toggle" type="button" onClick={() => setMobileOpen(true)} aria-label="Abrir menú administrativo"><FiMenu /></button>
    {mobileOpen && <button className="admin-mobile-backdrop" type="button" onClick={() => setMobileOpen(false)} aria-label="Cerrar menú administrativo" />}
    <aside className={`admin-sidebar${mobileOpen ? ' admin-sidebar--open' : ''}`} aria-label="Administración">
      <div className="admin-sidebar-brand"><span className="admin-brand-mark"><img src="/logo-marybe.png" alt="Marybe" /></span><span className="admin-sidebar-label"><small>Panel de Usuario</small></span><button className="admin-close-mobile" onClick={() => setMobileOpen(false)} aria-label="Cerrar menú"><FiX /></button></div>
      <nav aria-label="Módulos administrativos">
        <NavLink to="/admin" end onClickCapture={navigateSafely} title="Inicio" className={({ isActive }) => `admin-nav-link${isActive ? ' is-active' : ''}`}><FiBarChart2 /><span className="admin-sidebar-label">Inicio</span></NavLink>
        {ADMIN_GROUPS.map(group => <div className="admin-nav-group" key={group.title}><p className="admin-sidebar-label">{group.title}</p>{group.items.map(item => { const Icon = ICONS[item.icon] || FiGrid; return <NavLink key={item.path} to={item.path} end={item.path === '/editor-inicio-admin'} onClickCapture={navigateSafely} title={item.label} className={({ isActive }) => `admin-nav-link${isActive ? ' is-active' : ''}`}><Icon /><span className="admin-sidebar-label">{item.label}</span></NavLink>; })}</div>)}
      </nav>
      <div className="admin-sidebar-bottom"><a href="/inicio" target="_blank" rel="noopener noreferrer" title="Ver tienda"><FiExternalLink /><span className="admin-sidebar-label">Ver tienda</span></a><button type="button" onClick={() => { if (hasLeaveApproval()) signOut(); }} title="Cerrar sesión"><FiX /><span className="admin-sidebar-label">Cerrar sesión</span></button><button className="admin-collapse" type="button" onClick={() => setCollapsed(value => !value)} aria-label={collapsed ? 'Expandir menú' : 'Contraer menú'}>{collapsed ? '»' : '«'}</button></div>
    </aside>
    <main className="admin-main"><Outlet context={{ token }} /></main>
  </div>;
}
