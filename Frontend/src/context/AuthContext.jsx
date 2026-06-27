import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authRedirect, setAuthRedirect] = useState(null);

  useEffect(() => {
    // Verificar si hay un token en local storage al iniciar
    const storedToken = localStorage.getItem('jwt');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = (jwt, userData) => {
    setToken(jwt);
    setUser(userData);
    localStorage.setItem('jwt', jwt);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('jwt');
    localStorage.removeItem('user');
  };

  const openAuthModal = (redirectTo = null) => {
    if (typeof redirectTo === 'string') {
      setAuthRedirect(redirectTo);
      sessionStorage.setItem('authRedirect', redirectTo);
    } else {
      setAuthRedirect(null);
      sessionStorage.removeItem('authRedirect');
    }
    setIsAuthModalOpen(true);
  };
  const closeAuthModal = () => setIsAuthModalOpen(false);
  const clearAuthRedirect = () => {
    setAuthRedirect(null);
    sessionStorage.removeItem('authRedirect');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        logout,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        authRedirect,
        clearAuthRedirect
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
