import { useState, useEffect } from 'react';
import {
  paymentOptions as defaultPaymentOptions,
  infoTransferencia as defaultTransferencia,
} from '../data/checkout/paymentMethods';
import { INICIO_CACHE_TTL_MS, fetchWithSWR, readCachedEntry } from '../utils/apiCache';

const CONFIG_GENERAL_CACHE_KEY = 'configuracion-general';

function parseConfiguracionGeneral(json) {
  const raw = json?.data || {};
  const attrs = raw.attributes ? raw.attributes : raw;

  const config = {
    cuotas_activas: attrs.cuotas_activas !== false,
    cuotas_texto_previo: attrs.cuotas_texto_previo || '',
    cuotas_cantidad: attrs.cuotas_cantidad != null ? Number(attrs.cuotas_cantidad) : 3,

    whatsapp_numero: attrs.whatsapp_numero || null,
    costo_envio: attrs.costo_envio != null ? Number(attrs.costo_envio) : null,
    envio_gratis_desde: attrs.envio_gratis_desde != null ? Number(attrs.envio_gratis_desde) : null,
    costo_uber_moto: attrs.costo_uber_moto != null ? Number(attrs.costo_uber_moto) : null,

    mp_habilitado: attrs.mp_habilitado !== false,
    mp_titulo: attrs.mp_titulo || null,
    mp_subtitulo: attrs.mp_subtitulo || null,
    mp_etiqueta: attrs.mp_etiqueta || null,
    mp_descripcion: attrs.mp_descripcion || null,

    transf_habilitado: attrs.transf_habilitado !== false,
    transf_titulo: attrs.transf_titulo || null,
    transf_subtitulo: attrs.transf_subtitulo || null,
    transf_etiqueta: attrs.transf_etiqueta || null,
    transf_banco: attrs.transf_banco || null,
    transf_titular: attrs.transf_titular || null,
    transf_cuit: attrs.transf_cuit || null,
    transf_cbu: attrs.transf_cbu || null,
    transf_alias: attrs.transf_alias || null,
    transf_mensaje_wp: attrs.transf_mensaje_wp || null,

    ef_habilitado: attrs.ef_habilitado !== false,
    ef_titulo: attrs.ef_titulo || null,
    ef_subtitulo: attrs.ef_subtitulo || null,
    ef_etiqueta: attrs.ef_etiqueta || null,
    ef_horario: attrs.ef_horario || null,

    ac_habilitado: attrs.ac_habilitado !== false,
    ac_titulo: attrs.ac_titulo || null,
    ac_subtitulo: attrs.ac_subtitulo || null,
    ac_etiqueta: attrs.ac_etiqueta || null,
    ac_descripcion: attrs.ac_descripcion || null,
    ac_respuesta: attrs.ac_respuesta || null,
  };

  const metodoDefaults = Object.fromEntries(
    defaultPaymentOptions.map(o => [o.id, o])
  );

  config.metodosPago = [
    {
      id: 'mercadopago',
      habilitado: config.mp_habilitado,
      title: config.mp_titulo || metodoDefaults.mercadopago?.title || 'Mercado Pago',
      subtitle: config.mp_subtitulo || metodoDefaults.mercadopago?.subtitle || '',
      right: config.mp_etiqueta || metodoDefaults.mercadopago?.right || 'Sin recargo',
    },
    {
      id: 'transferencia',
      habilitado: config.transf_habilitado,
      title: config.transf_titulo || metodoDefaults.transferencia?.title || 'Transferencia bancaria',
      subtitle: config.transf_subtitulo || metodoDefaults.transferencia?.subtitle || '',
      right: config.transf_etiqueta || metodoDefaults.transferencia?.right || 'Sin recargo',
    },
    {
      id: 'efectivo',
      habilitado: config.ef_habilitado,
      title: config.ef_titulo || metodoDefaults.efectivo?.title || 'Efectivo',
      subtitle: config.ef_subtitulo || metodoDefaults.efectivo?.subtitle || '',
      right: config.ef_etiqueta || metodoDefaults.efectivo?.right || 'Sin recargo',
    },
    {
      id: 'aconvenir',
      habilitado: config.ac_habilitado,
      title: config.ac_titulo || metodoDefaults.aconvenir?.title || 'A Convenir',
      subtitle: config.ac_subtitulo || metodoDefaults.aconvenir?.subtitle || '',
      right: config.ac_etiqueta || metodoDefaults.aconvenir?.right || 'Flexible',
    },
  ].filter(m => m.habilitado);

  config.infoTransferencia = {
    banco: config.transf_banco || defaultTransferencia.banco,
    titular: config.transf_titular || defaultTransferencia.titular,
    cuit: config.transf_cuit || defaultTransferencia.cuit,
    cbu: config.transf_cbu || defaultTransferencia.cbu,
    alias: config.transf_alias || defaultTransferencia.alias,
    mensajeWhatsapp: config.transf_mensaje_wp || defaultTransferencia.mensajeWhatsapp,
  };

  return config;
}

/**
 * Hook para obtener la Configuración General desde Strapi (deduplicada y cacheada en memoria con TTL).
 */
export function useConfiguracionGeneral() {
  const [config, setConfig] = useState(() => {
    const cached = readCachedEntry(CONFIG_GENERAL_CACHE_KEY, { ttlMs: INICIO_CACHE_TTL_MS });
    return cached ? parseConfiguracionGeneral(cached.data) : null;
  });
  const [loading, setLoading] = useState(() => !config);

  useEffect(() => {
    let active = true;
    const apiUrl = process.env.REACT_APP_STRAPI_URL || 'http://localhost:1337';

    fetchWithSWR(CONFIG_GENERAL_CACHE_KEY, `${apiUrl}/api/configuracion-general`, {
      ttlMs: INICIO_CACHE_TTL_MS,
      onData: (json) => {
        if (active) setConfig(parseConfiguracionGeneral(json));
      },
    })
      .catch((err) => {
        if (active) {
          console.error('Error al cargar configuración general:', err);
          setConfig(null);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, []);

  return { config, loading };
}
