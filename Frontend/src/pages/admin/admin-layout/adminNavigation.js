export const ADMIN_GROUPS = [
  { title: 'Ventas', items: [
    { path: '/pedidos-admin', label: 'Pedidos', icon: 'orders' },
    { path: '/gift-cards-admin', label: 'Gift Cards', icon: 'gift' },
  ] },
  { title: 'Catálogo', items: [
    { path: '/editor-admin', label: 'Editor de Productos', icon: 'products' },
    { path: '/importacion-admin', label: 'Importación', icon: 'import' },
    { path: '/exportacion-admin', label: 'Exportaciones', icon: 'export' },
    { path: '/comparacion-admin', label: 'Comparación', icon: 'compare' },
    { path: '/exportacion-proveedores-admin', label: 'Exportación por Proveedores', icon: 'supplier' },
    { path: '/eliminar-productos-admin', label: 'Eliminar Productos', icon: 'products' },
  ] },
  { title: 'Diseño', items: [
    { path: '/editor-inicio-admin', label: 'Editor de Inicio', icon: 'home' },
    { path: '/editor-inicio-admin/menu-header', label: 'Header Menu', icon: 'menu' },
    { path: '/banners-admin', label: 'Banners', icon: 'image' },
    { path: '/sucursales-admin', label: 'Sucursales', icon: 'branches' },
    { path: '/historia-admin', label: 'Nuestra Historia', icon: 'history' },
  ] },
  { title: 'Configuración', items: [
    { path: '/configuracion-admin', label: 'General', icon: 'settings' },
  ] },
];
