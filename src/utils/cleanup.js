import { ScrollTrigger } from 'gsap/ScrollTrigger';

let isCleanupRunning = false;

export const setupGlobalCleanup = () => {
  // Limpiar ScrollTriggers cuando la página se va a descargar
  const handleBeforeUnload = () => {
    if (isCleanupRunning) return;
    isCleanupRunning = true;
    
    try {
      // Usar un timeout corto para evitar bloquear el unload
      setTimeout(() => {
        ScrollTrigger.killAll(true);
      }, 0);
    } catch (error) {
      console.error('Error cleaning up ScrollTriggers:', error);
    }
  };

  // Limpiar cuando el componente se desmonta o la página se recarga
  const handleUnload = () => {
    if (isCleanupRunning) return;
    isCleanupRunning = true;
    
    try {
      ScrollTrigger.killAll(true);
    } catch (error) {
      console.error('Error cleaning up ScrollTriggers on unload:', error);
    }
  };

  // Manejar errores de DOM no capturados relacionados con removeChild
  const handleError = (event) => {
    const error = event.error;
    if (error && (
      error.message.includes('removeChild') ||
      error.message.includes('Failed to execute \'removeChild\'') ||
      error.message.includes('node to be removed is not a child')
    )) {
      console.warn('DOM removeChild error caught and handled:', error.message);
      event.preventDefault();
      
      // Intentar limpiar ScrollTriggers que puedan estar causando el problema
      try {
        if (!isCleanupRunning) {
          isCleanupRunning = true;
          setTimeout(() => {
            ScrollTrigger.refresh();
            isCleanupRunning = false;
          }, 100);
        }
      } catch (cleanupError) {
        console.error('Error during cleanup after removeChild error:', cleanupError);
        isCleanupRunning = false;
      }
      
      return false;
    }
  };

  // Manejar violaciones de rendimiento
  const handlePerformanceViolation = (event) => {
    const { detail } = event;
    if (detail && detail.duration > 200) {
      console.warn('Performance violation detected:', detail);
      
      // Si es un problema relacionado con ScrollTrigger, intentar optimizar
      if (detail.name && detail.name.includes('message')) {
        requestIdleCallback(() => {
          try {
            ScrollTrigger.refresh();
          } catch (error) {
            console.error('Error refreshing ScrollTriggers after performance violation:', error);
          }
        });
      }
    }
  };

  // Throttle para el manejo de errores de ScrollTrigger
  let scrollTriggerErrorThrottle = false;
  const handleScrollTriggerError = () => {
    if (scrollTriggerErrorThrottle) return;
    scrollTriggerErrorThrottle = true;
    
    setTimeout(() => {
      try {
        ScrollTrigger.refresh();
        scrollTriggerErrorThrottle = false;
      } catch (error) {
        console.error('Error in ScrollTrigger error handler:', error);
        scrollTriggerErrorThrottle = false;
      }
    }, 500);
  };

  // Agregar event listeners
  window.addEventListener('beforeunload', handleBeforeUnload, { passive: true });
  window.addEventListener('unload', handleUnload, { passive: true });
  window.addEventListener('error', handleError);
  
  // Listener para violaciones de rendimiento si está disponible
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 200) {
            handlePerformanceViolation({ detail: entry });
          }
        }
      });
      observer.observe({ entryTypes: ['measure', 'longtask'] });
    } catch (error) {
      console.warn('PerformanceObserver not supported or failed to initialize');
    }
  }

  // Interceptar errores específicos de ScrollTrigger
  const originalConsoleError = console.error;
  console.error = (...args) => {
    const message = args.join(' ');
    if (message.includes('ScrollTrigger') || message.includes('removeChild')) {
      handleScrollTriggerError();
    }
    originalConsoleError.apply(console, args);
  };

  // Retornar función de cleanup
  return () => {
    window.removeEventListener('beforeunload', handleBeforeUnload);
    window.removeEventListener('unload', handleUnload);
    window.removeEventListener('error', handleError);
    console.error = originalConsoleError;
    isCleanupRunning = false;
  };
};

export const forceCleanup = () => {
  if (isCleanupRunning) return;
  isCleanupRunning = true;
  
  try {
    // Limpiar todos los ScrollTriggers con force=true
    ScrollTrigger.killAll(true);
    
    // Esperar un poco antes de refrescar
    setTimeout(() => {
      try {
        ScrollTrigger.refresh();
        console.log('Forced cleanup completed');
      } catch (error) {
        console.error('Error during forced cleanup refresh:', error);
      } finally {
        isCleanupRunning = false;
      }
    }, 100);
    
  } catch (error) {
    console.error('Error during forced cleanup:', error);
    isCleanupRunning = false;
  }
};

// Función para limpiar cuando hay problemas de rendimiento
export const optimizePerformance = () => {
  if (isCleanupRunning) return;
  
  requestIdleCallback(() => {
    try {
      // Refrescar ScrollTriggers en tiempo idle
      ScrollTrigger.refresh();
      
      // Limpiar posibles memory leaks
      if (window.gc && typeof window.gc === 'function') {
        window.gc();
      }
    } catch (error) {
      console.error('Error during performance optimization:', error);
    }
  }, { timeout: 1000 });
}; 