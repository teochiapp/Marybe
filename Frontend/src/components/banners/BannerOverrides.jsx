import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { VisualBanner } from './VisualBanners';
import {
  INICIO_CACHE_TTL_MS,
  INICIO_STORAGE_KEYS,
  INICIO_UPDATED_EVENT,
  fetchWithSWR,
  isCacheStale,
  readCachedEntry,
} from '../../utils/apiCache';
import { isRequestCanceled } from '../../utils/requestDedup';

const STRAPI_URL = process.env.REACT_APP_STRAPI_URL || 'http://localhost:1337';
const BANNERS_HOME_KEY = 'banners-home';
const BANNERS_HOME_URL = `${STRAPI_URL}/api/banners-home`;

const Context = createContext({});

/**
 * Proveedor de overrides de banners en Inicio con hidratación inmediata desde caché/localStorage
 * y revalidación suave en segundo plano cuando expira el TTL.
 */
export function BannerOverridesProvider({ children, disableStorage = false }) {
  const storageKey = disableStorage ? undefined : INICIO_STORAGE_KEYS.bannersHome;
  const [banners, setBanners] = useState(() => {
    const cached = readCachedEntry(BANNERS_HOME_KEY, {
      ttlMs: INICIO_CACHE_TTL_MS,
      storageKey,
    });
    return cached?.data?.data || {};
  });
  const abortRef = useRef(null);

  useEffect(() => {
    let active = true;

    const revalidate = (force = false) => {
      abortRef.current?.abort();
      const abort = new AbortController();
      abortRef.current = abort;

      fetchWithSWR(BANNERS_HOME_KEY, BANNERS_HOME_URL, {
        ttlMs: INICIO_CACHE_TTL_MS,
        storageKey,
        signal: abort.signal,
        force,
        passSignal: true,
        onData: (json) => {
          if (active && json?.data) {
            setBanners(json.data);
          }
        },
      }).catch((err) => {
        if (!isRequestCanceled(err)) {
          // Mantener banners cacheados o predeterminados si falla la revalidación.
        }
      });
    };

    const revalidateIfStale = () => {
      if (document.visibilityState === 'visible' && isCacheStale(BANNERS_HOME_KEY, INICIO_CACHE_TTL_MS)) {
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
      abortRef.current?.abort();
      window.removeEventListener('focus', revalidateIfStale);
      document.removeEventListener('visibilitychange', revalidateIfStale);
      window.removeEventListener(INICIO_UPDATED_EVENT, forceRefresh);
    };
  }, [storageKey]);

  return <Context.Provider value={banners}>{children}</Context.Provider>;
}

export default function BannerSlot({ name, children, side = false }) {
  const banners = useContext(Context);
  if (banners[name]?.activo === false) return null;
  return banners[name] ? <div className={side ? 'vb-slot vb-slot--side' : 'vb-slot'} onClick={event => event.stopPropagation()}><VisualBanner banner={banners[name]} /></div> : children;
}
