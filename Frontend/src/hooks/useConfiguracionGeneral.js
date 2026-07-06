import { useState, useEffect } from 'react';

/**
 * Hook para obtener la Configuración General desde Strapi.
 * Devuelve los campos: whatsapp_numero, costo_envio, envio_gratis_desde, costo_uber_moto
 */
export function useConfiguracionGeneral() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const apiUrl = process.env.REACT_APP_STRAPI_URL || 'http://localhost:1337';
        const res = await fetch(`${apiUrl}/api/configuracion-general`);
        const json = await res.json();
        // Strapi Single Type devuelve: { data: { attributes: { ... } } }
        const attrs = json?.data?.attributes || {};
        setConfig(attrs);
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
