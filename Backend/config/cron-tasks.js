'use strict';

let running = false;
module.exports = {
  reconcileMercadoPago: {
    task: async () => {
      if (running || !process.env.MP_ACCESS_TOKEN) return;
      running = true;
      try { await require('../src/api/mercado-pago/services/mercado-pago')().reconciliarPendientes(); }
      finally { running = false; }
    },
    options: { rule: '*/5 * * * *' },
  },
};
