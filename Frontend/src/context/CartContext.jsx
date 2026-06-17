import React, { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const item = window.localStorage.getItem('marybe_cart');
      return item ? JSON.parse(item) : [];
    } catch (error) {
      console.warn("Error reading localStorage", error);
      return [];
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem('marybe_cart', JSON.stringify(cartItems));
    } catch (error) {
      console.warn("Error setting localStorage", error);
    }
  }, [cartItems]);

  const addToCart = (product, quantity = 1, variant = null) => {
    setCartItems(prevItems => {
      // Create a unique key for the cart item based on product id, size and color
      const sizeStr = variant?.volumen || 'Único';
      const colorStr = variant?.color_nombre || 'Único';
      const uniqueId = `${product.id || product.documentId}-${sizeStr}-${colorStr}`;

      const existingItemIndex = prevItems.findIndex(item => item.cartId === uniqueId);

      if (existingItemIndex >= 0) {
        // Item exists, update quantity
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += quantity;
        
        // Ensure we don't exceed stock if available
        const maxStock = variant?.stock ?? 99;
        if (updatedItems[existingItemIndex].quantity > maxStock) {
           updatedItems[existingItemIndex].quantity = maxStock;
        }
        return updatedItems;
      } else {
        // Add new item
        const newItem = {
          cartId: uniqueId,
          product: {
            id: product.id || product.documentId,
            nombre: product.nombre || product.attributes?.nombre,
            marca: product.marca || product.attributes?.marca,
            descuento: product.descuento || product.attributes?.descuento || 0,
            portada: product.portada || product.attributes?.portada,
          },
          variant: variant || {},
          quantity: quantity,
          price: variant?.precio_oferta || variant?.precio || product.precio_oferta || product.precio || 0,
        };
        return [...prevItems, newItem];
      }
    });
  };

  const removeFromCart = (cartId) => {
    setCartItems(prevItems => prevItems.filter(item => item.cartId !== cartId));
  };

  const updateQuantity = (cartId, quantity) => {
    setCartItems(prevItems => prevItems.map(item => {
      if (item.cartId === cartId) {
        return { ...item, quantity: Math.max(1, quantity) }; // Minimum 1
      }
      return item;
    }));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartTotal: getCartTotal(),
      itemCount: getCartCount(),
    }}>
      {children}
    </CartContext.Provider>
  );
};
