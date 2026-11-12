'use strict';

module.exports = {
  routes: [{ method: 'GET', path: '/admin-dashboard', handler: 'admin-dashboard.index', config: { auth: false } }],
};
