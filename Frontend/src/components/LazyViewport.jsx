import React, { useState, useEffect, useRef, Suspense } from 'react';

/**
 * LazyViewport: Componente contenedor para diferir la carga y evaluación de componentes
 * pesados hasta que el usuario se acerque a su posición de scroll (IntersectionObserver).
 * Elimina las "Long Tasks" y reduce drásticamente el TBT en la carga inicial (Lighthouse).
 */
export default function LazyViewport({ children, fallback, rootMargin = '300px 0px' }) {
  const [hasAppeared, setHasAppeared] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    if (window.IntersectionObserver) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setHasAppeared(true);
              observer.unobserve(element);
            }
          });
        },
        { rootMargin }
      );

      observer.observe(element);

      return () => {
        if (element) {
          observer.unobserve(element);
        }
      };
    } else {
      // Fallback para navegadores antiguos
      setHasAppeared(true);
    }
  }, [rootMargin]);

  return (
    <div ref={containerRef} style={{ width: '100%' }}>
      {hasAppeared ? (
        <Suspense fallback={fallback}>
          {children}
        </Suspense>
      ) : (
        fallback
      )}
    </div>
  );
}
