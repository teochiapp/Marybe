import { useEffect, useRef, useCallback } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export const useScrollTrigger = () => {
  const triggersRef = useRef([]);
  const isCleanedUpRef = useRef(false);

  const createScrollTrigger = useCallback((config) => {
    // Si ya se limpiaron los triggers, no crear nuevos
    if (isCleanedUpRef.current) {
      return null;
    }

    try {
      // Validar que el elemento trigger existe y está conectado al DOM
      if (!config.trigger) {
        console.warn('ScrollTrigger: no trigger element provided');
        return null;
      }

      // Esperar un frame para asegurar que el elemento esté completamente montado
      return new Promise((resolve) => {
        requestAnimationFrame(() => {
          try {
            // Verificar nuevamente después del frame
            if (!config.trigger || !config.trigger.isConnected) {
              console.warn('ScrollTrigger: trigger element is not connected to DOM');
              resolve(null);
              return;
            }

            // Si ya se limpiaron los triggers durante la espera, cancelar
            if (isCleanedUpRef.current) {
              resolve(null);
              return;
            }

            const trigger = ScrollTrigger.create(config);
            
            if (trigger && !isCleanedUpRef.current) {
              triggersRef.current.push(trigger);
              resolve(trigger);
            } else {
              resolve(null);
            }
          } catch (error) {
            console.error('Error creating ScrollTrigger (delayed):', error);
            resolve(null);
          }
        });
      });
    } catch (error) {
      console.error('Error creating ScrollTrigger:', error);
      return Promise.resolve(null);
    }
  }, []);

  const killTrigger = useCallback((trigger) => {
    if (trigger) {
      try {
        trigger.kill();
        // Remover de la lista de triggers
        triggersRef.current = triggersRef.current.filter(t => t !== trigger);
      } catch (error) {
        console.error('Error killing ScrollTrigger:', error);
      }
    }
  }, []);

  const killAllTriggers = useCallback(() => {
    isCleanedUpRef.current = true;
    
    triggersRef.current.forEach(trigger => {
      try {
        if (trigger && typeof trigger.kill === 'function') {
          trigger.kill();
        }
      } catch (error) {
        console.error('Error killing ScrollTrigger:', error);
      }
    });
    triggersRef.current = [];
  }, []);

  const refreshTriggers = useCallback(() => {
    if (isCleanedUpRef.current) return;
    
    try {
      // Usar setTimeout para evitar problemas de timing
      setTimeout(() => {
        if (!isCleanedUpRef.current) {
          ScrollTrigger.refresh();
        }
      }, 100);
    } catch (error) {
      console.error('Error refreshing ScrollTriggers:', error);
    }
  }, []);

  // Cleanup cuando el componente se desmonte
  useEffect(() => {
    isCleanedUpRef.current = false;
    
    return () => {
      killAllTriggers();
    };
  }, [killAllTriggers]);

  return {
    createScrollTrigger,
    killTrigger,
    killAllTriggers,
    refreshTriggers
  };
};

export default useScrollTrigger; 