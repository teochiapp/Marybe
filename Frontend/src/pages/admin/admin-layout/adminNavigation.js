export const ADMIN_GROUPS = [
  { title: 'Ventas', items: [{ path: '/pedidos-admin', label: 'Pedidos', icon: 'orders' }] },
  { title: 'Catálogo', items: [
    { path: '/editor-admin', label: 'Editor de Productos', icon: 'products' },
    { path: '/importacion-admin', label: 'Importación', icon: 'import' },
    { path: '/exportacion-admin', label: 'Exportaciones', icon: 'export' },
    { path: '/comparacion-admin', label: 'Comparación', icon: 'compare' },
    { path: '/exportacion-proveedores-admin', label: 'Exportación por Proveedores', icon: 'supplier' },
  ] },
  { title: 'Diseño', items: [
    { path: '/editor-inicio-admin', label: 'Editor de Inicio', icon: 'home' },
    { path: '/editor-inicio-admin/menu-header', label: 'Header Menu', icon: 'menu' },
    { path: '/banners-admin', label: 'Banners', icon: 'image' },
  ] },
];
