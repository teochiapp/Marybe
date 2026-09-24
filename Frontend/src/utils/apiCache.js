const cache = new Map();

export const fetchWithCache = async (url) => {
  if (cache.has(url)) {
    return cache.get(url);
  }

  const promise = fetch(url)
    .then(res => {
      if (!res.ok) throw new Error('Network response was not ok');
      return res.json();
    })
    .catch(err => {
      cache.delete(url); // Remove failed requests from cache
      throw err;
    });

  cache.set(url, promise);
  return promise;
};
