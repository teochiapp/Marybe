import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
import {
  INICIO_CACHE_TTL_MS,
  INICIO_STORAGE_KEYS,
  INICIO_UPDATED_EVENT,
  fetchWithSWR,
  isCacheStale,
  readCachedEntry,
} from '../utils/apiCache';
import { isRequestCanceled } from '../utils/requestDedup';

const STRAPI_URL = process.env.REACT_APP_STRAPI_URL || process.env.REACT_APP_API_URL || 'http://localhost:1337';

export const SECCION_PRINCIPAL_KEY = 'seccion-principal:unified';
export const SECCION_PRINCIPAL_UNIFIED_URL =
  `${STRAPI_URL}/api/seccion-principal` +
  `?populate[secciones][populate]=*` +
  `&populate[categorias_destacadas][populate]=*` +
  `&populate[descuento_perfumeria][populate]=*` +
  `&populate[descuento_hogar][populate]=*` +
  `&populate[destacada_perfumeria][populate]=*` +
  `&populate[destacada_hogar][populate]=*` +
  `&populate[categoria_especifica_perfumeria][populate]=*` +
  `&populate[categoria_especifica_hogar][populate]=*`;

const SeccionPrincipalContext = createContext(null);

export function extractSeccionPrincipalAttrs(payload) {
  const data = payload?.data;
  if (!data) return null;
  return data.attributes || data;
}

/**
 * Proveedor único de `/api/seccion-principal` para Inicio:
 * consolida en una sola petición la composición y la configuración de todas las secciones,
 * hidrata inmediatamente desde memoria/localStorage (SWR) y revalida solo si venció el TTL.
 */
export function SeccionPrincipalProvider({ children, disableStorage = false }) {
  const storageKey = disableStorage ? undefined : INICIO_STORAGE_KEYS.seccionPrincipal;
  const [state, setState] = useState(() => {
    const cached = readCachedEntry(SECCION_PRINCIPAL_KEY, {
      ttlMs: INICIO_CACHE_TTL_MS,
      storageKey,
    });
    return {
      payload: cached?.data ?? null,
      ready: Boolean(cached?.data),
      loading: !cached?.data,
    };
  });

  const controllerRef = useRef(null);

  useEffect(() => {
    let active = true;

    const revalidate = (force = false) => {
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;

      fetchWithSWR(SECCION_PRINCIPAL_KEY, SECCION_PRINCIPAL_UNIFIED_URL, {
        ttlMs: INICIO_CACHE_TTL_MS,
        storageKey,
        signal: controller.signal,
        force,
        passSignal: true,
        onData: (json) => {
          if (!active) return;
          setState({ payload: json, ready: true, loading: false });
        },
      })
        .catch((err) => {
          if (active && !isRequestCanceled(err)) {
            console.error('Error fetching seccion-principal:', err);
          }
        })
        .finally(() => {
          if (active) {
            setState((prev) => (prev.ready && !prev.loading ? prev : { ...prev, ready: true, loading: false }));
          }
        });
    };

    const revalidateIfStale = () => {
      if (document.visibilityState === 'visible' && isCacheStale(SECCION_PRINCIPAL_KEY, INICIO_CACHE_TTL_MS)) {
        revalidate(false);
      }
    };

    const forceRefresh = () => revalidate(true);

    revalidate(false);

    window.addEventListener('focus', revalidateIfStale);
    document.addEventListener('visibilitychange', revalidateIfStale);
    window.addEventListener(INICIO_UPDATED_EVENT, forceRefresh);

    return () => {
      active = false;
      controllerRef.current?.abort();
      window.removeEventListener('focus', revalidateIfStale);
      document.removeEventListener('visibilitychange', revalidateIfStale);
      window.removeEventListener(INICIO_UPDATED_EVENT, forceRefresh);
    };
  }, [storageKey]);

  const value = useMemo(
    () => ({
      data: state.payload?.data || null,
      attrs: extractSeccionPrincipalAttrs(state.payload),
      ready: state.ready,
      loading: state.loading,
    }),
    [state]
  );

  return <SeccionPrincipalContext.Provider value={value}>{children}</SeccionPrincipalContext.Provider>;
}

export function useSeccionPrincipal() {
  return useContext(SeccionPrincipalContext);
}

/**
 * Lee `/api/seccion-principal` desde el contexto compartido de Inicio cuando está presente;
 * en renders aislados (otras rutas o tests unitarios) consulta `fallbackUrl` usando SWR en memoria.
 */
export function useSeccionPrincipalData(fallbackUrl, { skip = false, passSignal = false } = {}) {
  const ctx = useSeccionPrincipal();
  const hasProvider = ctx !== null;
  const cacheKey = fallbackUrl ? `seccion-principal:${fallbackUrl}` : '';

  const [standalone, setStandalone] = useState(() => {
    if (hasProvider || skip || !cacheKey) {
      return { key: null, attrs: null, loading: false };
    }
    const cached = readCachedEntry(cacheKey, { ttlMs: INICIO_CACHE_TTL_MS });
    return {
      key: cached ? cacheKey : null,
      attrs: cached ? extractSeccionPrincipalAttrs(cached.data) : null,
      loading: !cached,
    };
  });

  useEffect(() => {
    if (hasProvider || skip || !fallbackUrl) {
      if (!hasProvider) {
        setStandalone({ key: null, attrs: null, loading: false });
      }
      return undefined;
    }

    let active = true;
    const controller = new AbortController();
    const cached = readCachedEntry(cacheKey, { ttlMs: INICIO_CACHE_TTL_MS });

    if (cached) {
      setStandalone({ key: cacheKey, attrs: extractSeccionPrincipalAttrs(cached.data), loading: false });
    } else {
      setStandalone({ key: cacheKey, attrs: null, loading: true });
    }

    fetchWithSWR(cacheKey, fallbackUrl, {
      ttlMs: INICIO_CACHE_TTL_MS,
      signal: controller.signal,
      passSignal,
      fallbackToStaleOnError: true,
      onData: (json) => {
        if (!active) return;
        setStandalone({ key: cacheKey, attrs: extractSeccionPrincipalAttrs(json), loading: false });
      },
    })
      .catch((err) => {
        if (active && !isRequestCanceled(err)) {
          setStandalone((prev) => ({ key: cacheKey, attrs: prev.key === cacheKey ? prev.attrs : null, loading: false }));
        }
      })
      .finally(() => {
        if (active) {
          setStandalone((prev) =>
            prev.key === cacheKey && !prev.loading ? prev : { key: cacheKey, attrs: prev.key === cacheKey ? prev.attrs : null, loading: false }
          );
        }
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [hasProvider, skip, fallbackUrl, cacheKey, passSignal]);

  if (hasProvider) {
    return {
      attrs: skip ? null : ctx.attrs,
      loading: skip ? false : ctx.loading,
      fromProvider: true,
    };
  }

  if (skip || !cacheKey) {
    return {
      attrs: null,
      loading: false,
      fromProvider: false,
    };
  }

  if (standalone.key !== cacheKey) {
    const cached = readCachedEntry(cacheKey, { ttlMs: INICIO_CACHE_TTL_MS });
    return {
      attrs: cached ? extractSeccionPrincipalAttrs(cached.data) : null,
      loading: !cached,
      fromProvider: false,
    };
  }

  return {
    attrs: standalone.attrs,
    loading: standalone.loading,
    fromProvider: false,
  };
}
