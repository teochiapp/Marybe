import { useEffect, useState } from 'react';
import { bloqueDescuentosKey } from '../utils/descuentosBloque';

const STRAPI_URL = process.env.REACT_APP_STRAPI_URL || 'http://localhost:1337';

/**
 * Configuración publicada del bloque de Descuentos (Editor de Inicio). Devuelve `config: null` mientras no
 * exista, y la sección conserva sus valores originales. En la vista previa del editor usa `previewData`.
 * `entidadActual` es la entidad elegida tal como está hoy en Strapi (o null si ya no existe/no está publicada).
 */
export default function useDescuentosBloque(seccion, previewData) {
  const key = bloqueDescuentosKey(seccion);
  const [stored, setStored] = useState(null);
  const [loading, setLoading] = useState(!previewData);
  const [categoria, setCategoria] = useState({ id: null, value: null });
  const config = previewData || stored;

  useEffect(() => {
    if (previewData) {
      setLoading(false);
      return undefined;
    }
    let active = true;
    setStored(null);
    setLoading(true);
    fetch(`${STRAPI_URL}/api/seccion-principal?fields[0]=diseno_secciones`)
      .then(res => (res.ok ? res.json() : null))
      .then(json => {
        if (!active) return;
        const attrs = json?.data?.attributes || json?.data;
        setStored(attrs?.diseno_secciones?.descuentos?.[key] || null);
      })
      .catch(() => { if (active) setStored(null); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [key, previewData]);

  const categoriaId = !previewData && config?.entidad_tipo === 'categoria' ? config.entidad_id : null;
  useEffect(() => {
    if (!categoriaId) return undefined;
    let active = true;
    fetch(`${STRAPI_URL}/api/categorias?filters[documentId][$eq]=${encodeURIComponent(categoriaId)}&fields[0]=nombre&fields[1]=seccion`)
      .then(res => (res.ok ? res.json() : null))
      .then(json => {
        const found = json?.data?.[0];
        if (active) setCategoria({ id: categoriaId, value: found ? { nombre: found.nombre || found.attributes?.nombre, seccion: found.seccion || found.attributes?.seccion || '' } : null });
      })
      .catch(() => { if (active) setCategoria({ id: categoriaId, value: null }); });
    return () => { active = false; };
  }, [categoriaId]);

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
