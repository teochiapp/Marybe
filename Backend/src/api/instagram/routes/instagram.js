module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/instagram/feed',
      handler: 'instagram.getFeed',
      config: {
        auth: false, // Make it publicly accessible
      },
    },
  ],
};
