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
  ],
};

