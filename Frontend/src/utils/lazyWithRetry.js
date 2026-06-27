import { lazy } from 'react';

/**
 * lazyWithRetry: Wrapper para React.lazy que previene y gestiona el ChunkLoadError.
 * 
 * 1. Intenta realizar la carga del módulo de forma estándar.
 * 2. Si falla (por inestabilidad temporal de red o servidor), realiza hasta 2 intentos adicionales con pausa.
 * 3. Si persiste el error (ej: cambio de hash tras un despliegue en producción), fuerza la recarga de la página
 *    para obtener la nueva versión del index.html y sus assets actualizados.
 *
 * @param {Function} componentImport - Import dinámico, ej: () => import('./MiComponente')
 * @param {string} key - Identificador único opcional para el sessionStorage
 */
export function lazyWithRetry(componentImport, key = 'generic') {
  return lazy(async () => {
    const retryStorageKey = `lazy_retry_${key}`;

    try {
      const component = await componentImport();
      window.sessionStorage.removeItem(retryStorageKey);
      return component;
    } catch (error) {
      // Intento 2: Esperamos 1 segundo y reintentamos (previene fallos por microcortes de red)
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const component = await componentImport();
        window.sessionStorage.removeItem(retryStorageKey);
        return component;
      } catch (secondError) {
        // Intento 3: Esperamos 2 segundos y reintentamos
        try {
          await new Promise((resolve) => setTimeout(resolve, 2000));
          const component = await componentImport();
          window.sessionStorage.removeItem(retryStorageKey);
          return component;
        } catch (thirdError) {
          // Si fallan todos los intentos en memoria, verificamos si ya recargamos la página por este chunk
          const hasForceRefreshed = window.sessionStorage.getItem(retryStorageKey);

          if (!hasForceRefreshed) {
            window.sessionStorage.setItem(retryStorageKey, 'true');
            window.location.reload();
            // Retornamos una promesa sin resolver para que React Suspense espere la recarga tranquilamente
            return new Promise(() => {});
          }

          // Si ya habíamos recargado y sigue fallando, arrojamos el error final
          throw thirdError;
        }
      }
    }
  });
}
