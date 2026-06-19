module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/gift-cards/apply',
      handler: 'custom-gift-card.apply',
      config: {
        auth: false,
      },
    },
    {
      method: 'POST',
      path: '/gift-cards/consume',
      handler: 'custom-gift-card.consume',
      config: {
        auth: false,
      },
    },
  ],
};
