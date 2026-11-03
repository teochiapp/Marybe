module.exports = { routes: [
  { method: 'GET', path: '/banners-admin', handler: 'banners-admin.list', config: { auth: false } },
  { method: 'PUT', path: '/banners-admin/promociones/:id', handler: 'banners-admin.save', config: { auth: false } },
  { method: 'DELETE', path: '/banners-admin/promociones/:id', handler: 'banners-admin.remove', config: { auth: false } },
  { method: 'PUT', path: '/banners-admin/piezas', handler: 'banners-admin.slots', config: { auth: false } },
  { method: 'GET', path: '/banners-admin/media', handler: 'banners-admin.media', config: { auth: false } },
  { method: 'POST', path: '/banners-admin/upload', handler: 'banners-admin.upload', config: { auth: false } },
  { method: 'GET', path: '/banners-home', handler: 'banners-admin.publicSlots', config: { auth: false } },
] };
