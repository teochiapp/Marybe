import { useEffect, useState } from 'react';
import { bloqueDescuentosKey } from '../utils/descuentosBloque';
import { useSeccionPrincipalData } from '../context/SeccionPrincipalContext';
import { INICIO_CACHE_TTL_MS, fetchWithSWR, readCachedEntry } from '../utils/apiCache';

const STRAPI_URL = process.env.REACT_APP_STRAPI_URL || 'http://localhost:1337';

/**
 * Configuración publicada del bloque de Descuentos (Editor de Inicio). Devuelve `config: null` mientras no
 * exista, y la sección conserva sus valores originales. En la vista previa del editor usa `previewData`.
 * `entidadActual` es la entidad elegida tal como está hoy en Strapi (o null si ya no existe/no está publicada).
 */
export default function useDescuentosBloque(seccion, previewData) {
  const key = bloqueDescuentosKey(seccion);
  const { attrs: mainAttrs, loading } = useSeccionPrincipalData(
    `${STRAPI_URL}/api/seccion-principal?fields[0]=diseno_secciones`,
    { skip: Boolean(previewData) }
  );
  const stored = previewData ? null : (mainAttrs?.diseno_secciones?.descuentos?.[key] || null);
  const config = previewData || stored;

  const categoriaId = !previewData && config?.entidad_tipo === 'categoria' ? config.entidad_id : null;
  const catCacheKey = categoriaId ? `categoria:doc:${categoriaId}` : '';
  const [categoria, setCategoria] = useState(() => {
    if (!catCacheKey) return { id: null, value: null };
    const cached = readCachedEntry(catCacheKey, { ttlMs: INICIO_CACHE_TTL_MS });
    if (!cached) return { id: null, value: null };
    const found = cached.data?.data?.[0];
    return {
      id: categoriaId,
      value: found ? { nombre: found.nombre || found.attributes?.nombre, seccion: found.seccion || found.attributes?.seccion || '' } : null,
    };
  });

  useEffect(() => {
    if (!categoriaId) return undefined;
    let active = true;
    const url = `${STRAPI_URL}/api/categorias?filters[documentId][$eq]=${encodeURIComponent(categoriaId)}&fields[0]=nombre&fields[1]=seccion`;
    fetchWithSWR(catCacheKey, url, {
      ttlMs: INICIO_CACHE_TTL_MS,
      onData: (json) => {
        const found = json?.data?.[0];
        if (active) {
          setCategoria({
            id: categoriaId,
            value: found ? { nombre: found.nombre || found.attributes?.nombre, seccion: found.seccion || found.attributes?.seccion || '' } : null,
          });
        }
      },
    }).catch(() => {
      if (active) setCategoria({ id: categoriaId, value: null });
    });
    return () => { active = false; };
  }, [categoriaId, catCacheKey]);

  let entidadActual = null;
  if (config?.entidad_tipo === 'categoria') {
    // Vista previa: la categoría ya viene resuelta por el editor. En la tienda se usa el nombre actual de Strapi
    // (mientras carga, el guardado al publicar); si la categoría ya no existe, el botón vuelve al enlace original.
    const snapshot = { nombre: config.entidad_nombre, seccion: config.entidad_seccion };
    entidadActual = previewData || categoria.id !== categoriaId ? snapshot : categoria.value;
  } else if (config?.entidad_tipo) {
    entidadActual = { nombre: config.entidad_id, seccion: '' };
  }
  return { config, entidadActual, loading };
}
