import { useState, useEffect } from 'react';
import { sucursales as defaultSucursales } from '../components/sucursales/sucursalesData';

/**
 * Hook para obtener los datos dinámicos de la Página de Sucursales desde Strapi.
 *
 * Endpoint Strapi 4/5: /api/pagina-sucursales?populate[sucursales]=*
 *
 * Agrupa la lista repetible de sucursales por la propiedad `provincia`.
 * Si Strapi no devuelve datos o falla la red, realiza un fallback transparente a `sucursalesData.js`.
 */
export function usePaginaSucursales() {
  const [data, setData] = useState({
    titulo: 'Nuestras Sucursales',
    sucursales: defaultSucursales,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSucursales = async () => {
      try {
        const apiUrl = process.env.REACT_APP_STRAPI_URL || 'http://localhost:1337';
        const res = await fetch(`${apiUrl}/api/pagina-sucursales?populate[sucursales]=*`);
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        const json = await res.json();

        const raw = json?.data || {};
        const attrs = raw.attributes ? raw.attributes : raw;

        const titulo = attrs.titulo || 'Nuestras Sucursales';
        const rawSucursales = attrs.sucursales || [];

        if (Array.isArray(rawSucursales) && rawSucursales.length > 0) {
          const groupedMap = new Map();
          rawSucursales.forEach((item) => {
            const prov = (item.provincia || 'Santiago del Estero').trim();
            if (!groupedMap.has(prov)) groupedMap.set(prov, []);
            groupedMap.get(prov).push({
              direccion: item.calle || item.direccion || '',
              telefono: item.numero_celular || item.telefono || '',
              telefonoFijo: item.numero_fijo || item.telefonoFijo || '',
              mapa: item.embed_google_maps || item.mapa || '',
            });
          });

          const sucursalesGrouped = [...groupedMap.entries()].map(([provincia, locales]) => ({
            provincia,
            locales,
          }));

          setData({
            titulo,
            sucursales: sucursalesGrouped,
          });
        }
      } catch (err) {
        console.warn('Error cargando sucursales dinámicas de Strapi, usando fallback local:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSucursales();
  }, []);

  return { ...data, loading };
}
