import React, { createContext, useState, useEffect } from 'react';

export const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState(() => {
    try {
      const item = window.localStorage.getItem('marybe_favorites');
      return item ? JSON.parse(item) : [];
    } catch (error) {
      console.warn("Error reading localStorage", error);
      return [];
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem('marybe_favorites', JSON.stringify(favorites));
    } catch (error) {
      console.warn("Error setting localStorage", error);
    }
  }, [favorites]);

  const addFavorite = (product, variant = null) => {
    setFavorites(prevFavs => {
      // Usar documentId si existe, sino id
      const id = product.documentId || product.id;
      if (prevFavs.some(item => item.id === id)) return prevFavs; // Ya existe

      // Extraer datos principales para mostrar en Mi Cuenta sin necesidad de fetch
      const nombre = product.nombre || product.attributes?.nombre;
      const precio = variant?.precio_oferta || variant?.precio || product.precio_oferta || product.precio || product.attributes?.precio || 0;
      
      let imgUrl = null;
      const portada = product.portada || product.attributes?.portada;
      if (portada?.data?.attributes?.url) {
        imgUrl = portada.data.attributes.url;
      } else if (portada?.url) {
        imgUrl = portada.url;
      }

      const newFav = {
        id,
        nombre,
        precio,
        imagen: imgUrl,
        fecha_agregado: new Date().toISOString()
      };

      return [...prevFavs, newFav];
    });
  };

  const removeFavorite = (productId) => {
    setFavorites(prevFavs => prevFavs.filter(item => item.id !== productId));
  };

  const toggleFavorite = (product, variant = null) => {
    const id = product.documentId || product.id;
    if (isFavorite(id)) {
      removeFavorite(id);
    } else {
      addFavorite(product, variant);
    }
  };

  const isFavorite = (productId) => {
    return favorites.some(item => item.id === productId);
  };

  const clearFavorites = () => {
    setFavorites([]);
  };

  return (
    <FavoritesContext.Provider value={{
      favorites,
      addFavorite,
      removeFavorite,
      toggleFavorite,
      isFavorite,
      clearFavorites
    }}>
      {children}
    </FavoritesContext.Provider>
  );
};
