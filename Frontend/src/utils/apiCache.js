import { acquireDedupedRequest, clearInFlightRequests, getCurrentFetch, isRequestCanceled } from './requestDedup';

export const INICIO_CACHE_TTL_MS = 3 * 60 * 1000;
export const MEGA_MENU_CACHE_TTL_MS = 5 * 60 * 1000;
export const STORAGE_MAX_AGE_MS = 24 * 60 * 60 * 1000;
export const INICIO_UPDATED_EVENT = 'marybe-inicio-updated';

export const INICIO_STORAGE_KEYS = {
  seccionPrincipal: 'marybe_seccion_principal_v1',
  bannersHome: 'marybe_banners_home_v1',
};

const memoryCache = new Map();

function canUseStorage() {
  return typeof localStorage !== 'undefined';
}

function createAbortError() {
  if (typeof DOMException !== 'undefined') {
    return new DOMException('Aborted', 'AbortError');
  }
  const err = new Error('Aborted');
  err.name = 'AbortError';
  return err;
}

/** Limpia por completo el caché en memoria y peticiones en vuelo (útil en tests y al publicar cambios). */
export function clearApiCache() {
  memoryCache.clear();
  clearInFlightRequests();
}

/** Elimina entradas de caché por prefijo (o todas si no se indica prefijo) y limpia snapshots de Inicio si aplica. */
export function invalidateApiCache(prefix = '', { storageKeys = [] } = {}) {
  for (const key of Array.from(memoryCache.keys())) {
    if (!prefix || key.startsWith(prefix)) {
      const entry = memoryCache.get(key);
      if (entry?.storageKey && canUseStorage()) {
        try {
          localStorage.removeItem(entry.storageKey);
        } catch {
          // Ignorar errores de almacenamiento (modo privado / cuota).
        }
      }
      memoryCache.delete(key);
    }
  }

  if (canUseStorage() && storageKeys.length > 0) {
    storageKeys.forEach((storageKey) => {
      try {
        localStorage.removeItem(storageKey);
      } catch {
        // Ignorar errores de almacenamiento.
      }
    });
  }
}

/** Invalida cachés locales de Inicio/Menú tras publicar desde el panel de administración. */
export function invalidateInicioCache() {
  invalidateApiCache('', { storageKeys: Object.values(INICIO_STORAGE_KEYS) });
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    window.dispatchEvent(new Event(INICIO_UPDATED_EVENT));
    window.dispatchEvent(new Event('marybe-menu-updated'));
  }
}

/**
 * Lee un valor cacheado en memoria o en localStorage.
 * Los snapshots restaurados desde disco se marcan como stale para disparar revalidación suave en segundo plano.
 */
export function readCachedEntry(
  key,
  {
    ttlMs = INICIO_CACHE_TTL_MS,
    storageKey,
    maxStorageAgeMs = STORAGE_MAX_AGE_MS,
    staleAfterStorageLoad = true,
  } = {}
) {
  const entry = memoryCache.get(key);
  if (entry && (!entry.fetchRef || entry.fetchRef === getCurrentFetch())) {
    const isStale = Date.now() - entry.updatedAt >= ttlMs;
    return {
      data: entry.data,
      updatedAt: entry.updatedAt,
      fromStorage: false,
      isStale,
    };
  }

  if (!storageKey || !canUseStorage()) return null;

  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.data === undefined || !Number.isFinite(parsed.updatedAt)) {
      return null;
    }
    const age = Date.now() - parsed.updatedAt;
    if (age < 0 || age > maxStorageAgeMs) {
      localStorage.removeItem(storageKey);
      return null;
    }
    return {
      data: parsed.data,
      updatedAt: parsed.updatedAt,
      fromStorage: true,
      isStale: staleAfterStorageLoad || age >= ttlMs,
    };
  } catch {
    return null;
  }
}

export function writeCachedEntry(key, data, { storageKey } = {}) {
  const updatedAt = Date.now();
  memoryCache.set(key, {
    data,
    updatedAt,
    storageKey: storageKey || null,
    fetchRef: getCurrentFetch(),
  });

  if (storageKey && canUseStorage()) {
    try {
      localStorage.setItem(storageKey, JSON.stringify({ data, updatedAt }));
    } catch {
      // Continuar usando solo caché en memoria si localStorage falla.
    }
  }
  return updatedAt;
}

export function isCacheStale(key, ttlMs = INICIO_CACHE_TTL_MS) {
  const entry = memoryCache.get(key);
  if (!entry || (entry.fetchRef && entry.fetchRef !== getCurrentFetch())) {
    return true;
  }
  return Date.now() - entry.updatedAt >= ttlMs;
}

/**
 * Ejecuta un loader con estrategia Stale-While-Revalidate (SWR), deduplicación en vuelo y TTL configurable.
 */
export async function runWithSWR(
  key,
  fetcher,
  {
    ttlMs = INICIO_CACHE_TTL_MS,
    storageKey,
    maxStorageAgeMs = STORAGE_MAX_AGE_MS,
    staleAfterStorageLoad = true,
    signal,
    force = false,
    passSignal = true,
    fallbackToStaleOnError = true,
    onData,
  } = {}
) {
  if (signal?.aborted) {
    throw createAbortError();
  }

  const cached = !force
    ? readCachedEntry(key, { ttlMs, storageKey, maxStorageAgeMs, staleAfterStorageLoad })
    : null;

  if (cached) {
    onData?.(cached.data, { fromCache: true, stale: cached.isStale });
    if (!cached.isStale) {
      return cached.data;
    }
  }

  const dedupKey = force ? `swr:force:${key}:${Date.now()}:${Math.random()}` : `swr:${key}`;
  const { promise, release } = acquireDedupedRequest(
    dedupKey,
    async (reqSignal) => {
      const fresh = await fetcher(passSignal ? reqSignal : undefined);
      writeCachedEntry(key, fresh, { storageKey });
      return fresh;
    },
    { bypass: force }
  );

  let cleanupAbort = null;
  const racePromise = signal
    ? new Promise((resolve, reject) => {
        const onAbort = () => {
          release();
          reject(createAbortError());
        };
        signal.addEventListener('abort', onAbort, { once: true });
        cleanupAbort = () => signal.removeEventListener('abort', onAbort);
        promise.then(resolve, reject);
      })
    : promise;

  try {
    const fresh = await racePromise;
    if (signal?.aborted) {
      throw createAbortError();
    }
    onData?.(fresh, { fromCache: false, stale: false });
    return fresh;
  } catch (err) {
    if (!isRequestCanceled(err) && cached && fallbackToStaleOnError) {
      return cached.data;
    }
    throw err;
  } finally {
    cleanupAbort?.();
    if (!signal?.aborted) {
      release();
    }
  }
}

/**
 * Envuelve una petición GET JSON usando fetch con soporte SWR, TTL y compatibilidad con mocks simples.
 */
export function fetchWithSWR(
  key,
  url,
  {
    ttlMs = INICIO_CACHE_TTL_MS,
    storageKey,
    maxStorageAgeMs = STORAGE_MAX_AGE_MS,
    staleAfterStorageLoad = true,
    signal,
    force = false,
    passSignal = Boolean(signal),
    fallbackToStaleOnError = true,
    fetchOptions,
    onData,
  } = {}
) {
  return runWithSWR(
    key,
    async (reqSignal) => {
      const opts = { ...(fetchOptions || {}) };
      if (passSignal && reqSignal) {
        opts.signal = reqSignal;
      }
      if (force && opts.cache === undefined) {
        opts.cache = 'no-store';
      }
      const res = Object.keys(opts).length > 0 ? await fetch(url, opts) : await fetch(url);
      if (res?.ok === false) {
        const error = new Error(`HTTP ${res.status}`);
        error.status = res.status;
        throw error;
      }
      return res.json();
    },
    {
      ttlMs,
      storageKey,
      maxStorageAgeMs,
      staleAfterStorageLoad,
      signal,
      force,
      passSignal,
      fallbackToStaleOnError,
      onData,
    }
  );
}

export const fetchWithCache = (url, options = {}) =>
  fetchWithSWR(`url:${url}`, url, options);
