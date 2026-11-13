const inFlight = new Map();

export const getCurrentFetch = () => (typeof fetch === 'function' ? fetch : undefined);

/** Descarta referencias en vuelo acumuladas (útil entre tests que reemplazan global.fetch). */
export function clearInFlightRequests() {
  for (const entry of inFlight.values()) {
    entry.controller.abort();
  }
  inFlight.clear();
}

/**
 * Deduplica peticiones GET concurrentes (incluido el doble montaje de React.StrictMode)
 * y pospone el AbortController un microtask para cancelar solo si no se remonta de inmediato.
 */
export function acquireDedupedRequest(key, executor, { bypass = false } = {}) {
  if (bypass) {
    const controller = new AbortController();
    let promise;
    try {
      promise = Promise.resolve(executor(controller.signal));
    } catch (error) {
      promise = Promise.reject(error);
    }
    return {
      promise,
      release: () => controller.abort(),
    };
  }

  const currentFetch = getCurrentFetch();
  let entry = inFlight.get(key);
  if (entry && entry.fetchRef && entry.fetchRef !== currentFetch) {
    entry.controller.abort();
    inFlight.delete(key);
    entry = null;
  }
  if (!entry) {
    const controller = new AbortController();
    const currentEntry = {
      controller,
      fetchRef: currentFetch,
      subscribers: 0,
      settled: false,
      pendingAbort: false,
      promise: null,
    };
    let rawPromise;
    try {
      rawPromise = Promise.resolve(executor(controller.signal));
    } catch (error) {
      rawPromise = Promise.reject(error);
    }
    currentEntry.promise = rawPromise.finally(() => {
      currentEntry.settled = true;
      if (inFlight.get(key) === currentEntry) {
        inFlight.delete(key);
      }
    });
    inFlight.set(key, currentEntry);
    entry = currentEntry;
  }

  entry.pendingAbort = false;
  entry.subscribers += 1;

  let released = false;
  return {
    promise: entry.promise,
    release: () => {
      if (released) return;
      released = true;
      entry.subscribers = Math.max(0, entry.subscribers - 1);
      if (entry.subscribers === 0 && !entry.settled && !entry.pendingAbort) {
        entry.pendingAbort = true;
        queueMicrotask(() => {
          if (entry.pendingAbort && entry.subscribers === 0 && !entry.settled) {
            entry.controller.abort();
            if (inFlight.get(key) === entry) {
              inFlight.delete(key);
            }
          }
        });
      }
    },
  };
}

export function isRequestCanceled(error) {
  return (
    error?.code === 'ERR_CANCELED' ||
    error?.name === 'AbortError' ||
    error?.name === 'CanceledError'
  );
}
