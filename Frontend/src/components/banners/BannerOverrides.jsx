import React, { createContext, useContext, useState, useEffect } from 'react';
import { VisualBanner } from './VisualBanners';
const Context = createContext({});
export function BannerOverridesProvider({ children }) {
  const [banners, setBanners] = useState({});
  useEffect(() => {
    const abort = new AbortController();
    fetch(`${process.env.REACT_APP_STRAPI_URL || 'http://localhost:1337'}/api/banners-home`, { signal: abort.signal })
      .then(response => response.ok ? response.json() : null).then(data => { if (data?.data) setBanners(data.data); }).catch(() => {});
    return () => abort.abort();
  }, []);
  return <Context.Provider value={banners}>{children}</Context.Provider>;
}
export default function BannerSlot({ name, children, side = false }) {
  const banners = useContext(Context);
  if (banners[name]?.activo === false) return null;
  return banners[name] ? <div className={side ? 'vb-slot vb-slot--side' : 'vb-slot'} onClick={event => event.stopPropagation()}><VisualBanner banner={banners[name]} /></div> : children;
}
