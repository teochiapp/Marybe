import { useState, useEffect } from 'react';

/**
 * Hook para obtener la Configuración General desde Strapi.
 * Devuelve los campos: whatsapp_numero, costo_envio, envio_gratis_desde, costo_uber_moto
 *
 * Strapi 5: Single Type devuelve { data: { id, whatsapp_numero, ... } } (sin capa "attributes")
 * Strapi 4: Single Type devuelve { data: { id, attributes: { ... } } }
 * El hook maneja ambos formatos.
 */
export function useConfiguracionGeneral() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const apiUrl = process.env.REACT_APP_STRAPI_URL || 'http://localhost:1337';
        const res  = await fetch(`${apiUrl}/api/configuracion-general`);
        const json = await res.json();

        // Strapi 5 devuelve los campos directamente en json.data
        // Strapi 4 los devuelve en json.data.attributes
        const raw = json?.data || {};
        const attrs = raw.attributes ? raw.attributes : raw;

        // Normalizar valores numéricos (biginteger llega como string en algunos casos)
        const config = {
          whatsapp_numero:    attrs.whatsapp_numero   || null,
          costo_envio:        attrs.costo_envio        != null ? Number(attrs.costo_envio)        : null,
          envio_gratis_desde: attrs.envio_gratis_desde != null ? Number(attrs.envio_gratis_desde) : null,
          costo_uber_moto:    attrs.costo_uber_moto    != null ? Number(attrs.costo_uber_moto)    : null,
        };

        setConfig(config);
      } catch (err) {
        console.error('Error al cargar configuración general:', err);
        setConfig(null);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  return { config, loading };
}
