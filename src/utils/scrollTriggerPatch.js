import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Patch para el error específico de _refresh100vh en ScrollTrigger
export const patchScrollTrigger = () => {
  // Interceptar el método _refresh100vh si existe
  if (ScrollTrigger && ScrollTrigger._refresh100vh) {
    const original_refresh100vh = ScrollTrigger._refresh100vh;
    
    ScrollTrigger._refresh100vh = function(...args) {
      try {
        return original_refresh100vh.apply(this, args);
      } catch (error) {
        if (error.message && error.message.includes('removeChild')) {
          console.warn('ScrollTrigger _refresh100vh error caught and handled:', error.message);
          
          // Intentar recuperación suave
          try {
            // Esperar un poco y luego refrescar de forma segura
            setTimeout(() => {
              try {
                ScrollTrigger.refresh(true);
              } catch (refreshError) {
                console.warn('ScrollTrigger refresh after patch failed:', refreshError.message);
              }
            }, 100);
          } catch (recoveryError) {
            console.warn('ScrollTrigger recovery failed:', recoveryError.message);
          }
          
          return null; // Retornar null en lugar de fallar
        } else {
          throw error; // Re-lanzar otros errores
        }
      }
    };
  }

  // Interceptar el método _refreshAll si existe
  if (ScrollTrigger && ScrollTrigger._refreshAll) {
    const original_refreshAll = ScrollTrigger._refreshAll;
    
    ScrollTrigger._refreshAll = function(...args) {
      try {
        return original_refreshAll.apply(this, args);
      } catch (error) {
        if (error.message && error.message.includes('removeChild')) {
          console.warn('ScrollTrigger _refreshAll error caught and handled:', error.message);
          return null;
        } else {
          throw error;
        }
      }
    };
  }

  // Interceptar el método refresh principal
  const originalRefresh = ScrollTrigger.refresh;
  ScrollTrigger.refresh = function(...args) {
    try {
      return originalRefresh.apply(this, args);
    } catch (error) {
      if (error.message && (
        error.message.includes('removeChild') ||
        error.message.includes('node to be removed is not a child')
      )) {
        console.warn('ScrollTrigger refresh error caught and handled:', error.message);
        
        // Intentar una recuperación más suave
        requestAnimationFrame(() => {
          try {
            // Forzar re-creación de elementos DOM si es necesario
            ScrollTrigger.killAll();
            ScrollTrigger.refresh(true);
          } catch (recoveryError) {
            console.warn('ScrollTrigger recovery refresh failed:', recoveryError.message);
          }
        });
        
        return null;
      } else {
        throw error;
      }
    }
  };

  console.log('ScrollTrigger patches applied successfully');
};

// Función para aplicar parches globales adicionales
export const applyGlobalPatches = () => {
  // Patch para Node.removeChild global
  if (typeof Node !== 'undefined' && Node.prototype.removeChild) {
    const originalRemoveChild = Node.prototype.removeChild;
    
    Node.prototype.removeChild = function(child) {
      try {
        // Verificar que el child realmente sea hijo de este nodo
        if (child && child.parentNode === this) {
          return originalRemoveChild.call(this, child);
        } else {
          console.warn('Attempted to remove child that is not a child of this node');
          return child;
        }
      } catch (error) {
        console.warn('removeChild error caught and handled:', error.message);
        return child;
      }
    };
  }

  // Patch para Element.remove si está disponible
  if (typeof Element !== 'undefined' && Element.prototype.remove) {
    const originalRemove = Element.prototype.remove;
    
    Element.prototype.remove = function() {
      try {
        if (this.parentNode) {
          return originalRemove.call(this);
        } else {
          console.warn('Attempted to remove element that has no parent');
        }
      } catch (error) {
        console.warn('Element.remove error caught and handled:', error.message);
      }
    };
  }

  console.log('Global DOM patches applied successfully');
};

// Exportar como objeto nombrado para evitar el error de anonymous default export
const scrollTriggerPatchUtils = { 
  patchScrollTrigger, 
  applyGlobalPatches 
};

export default scrollTriggerPatchUtils; 