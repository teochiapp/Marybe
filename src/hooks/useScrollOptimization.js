import { useEffect, useCallback, useRef, useMemo } from 'react';
import { useInView } from 'framer-motion';

// Función throttle optimizada sin warnings
const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => { inThrottle = false; }, limit);
    }
  };
};

export const useScrollOptimization = () => {
  const scrollTimerRef = useRef(null);
  const tickingRef = useRef(false);

  const handleScrollStart = useCallback(() => {
    document.body.classList.add('scrolling');
    // Pausar animaciones complejas durante scroll activo
    document.body.style.setProperty('--scroll-active', '1');
  }, []);

  const handleScrollEnd = useCallback(() => {
    document.body.classList.remove('scrolling');
    // Reactivar animaciones cuando termine el scroll
    document.body.style.setProperty('--scroll-active', '0');
  }, []);

  // Usar useMemo para crear la función throttled una sola vez
  const throttledScrollEnd = useMemo(
    () => throttle(handleScrollEnd, 100),
    [handleScrollEnd]
  );

  useEffect(() => {
    const handleScroll = () => {
      if (!tickingRef.current) {
        requestAnimationFrame(() => {
          handleScrollStart();
          
          clearTimeout(scrollTimerRef.current);
          scrollTimerRef.current = setTimeout(() => {
            throttledScrollEnd();
          }, 100);
          
          tickingRef.current = false;
        });
        tickingRef.current = true;
      }
    };

    // Usar scroll optimizado con passive listener
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimerRef.current);
    };
  }, [handleScrollStart, throttledScrollEnd]);
};

// Hook para optimizar useInView
export const useOptimizedInView = (ref, options = {}) => {
  const defaultOptions = useMemo(() => ({
    once: true,
    margin: "-100px",
    amount: 0.1, // Reducir el threshold para activar antes
    ...options
  }), [options]);

  return useInView(ref, defaultOptions);
}; 