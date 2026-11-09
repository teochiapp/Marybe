import React from 'react';
import { safeBannerLink } from '../../../../../utils/bannerDesign';
import { descuentosDefaultUrl } from '../../../../../utils/descuentosBloque';
import { BLOQUE_INFO, autoUrl, entityStatus, tipoInfo } from './descuentosModel';

export default function BotonPanel({ areaKey, data, entities, defaults, destino, onChange }) {
  const custom = data.boton_modo === 'personalizado';
  const status = entityStatus(data, entities);
  const auto = autoUrl(data, entities);
  const invalid = custom && data.boton_enlace && !safeBannerLink(data.boton_enlace);
  const defaultUrl = descuentosDefaultUrl(BLOQUE_INFO[areaKey].seccion);
  return (
    <>
      <p className="ba-inspector-help">Elegí el texto del botón y adónde lleva. El enlace automático usa la página pública de la entidad elegida; también podés escribir otro destino.</p>
      <details open>
        <summary>Texto</summary>
        <label>Texto del botón<input id="dc-boton-texto" value={data.boton_texto} maxLength={60} placeholder={defaults.boton_texto} onChange={event => onChange(draft => { draft.boton_texto = event.target.value; })} /></label>
        <small className="ba-hint">Si lo dejás vacío se muestra «{defaults.boton_texto}».</small>
      </details>
      <details open>
        <summary>Destino</summary>
        <label><input type="radio" name="dc-boton-modo" checked={!custom} onChange={() => onChange(draft => { draft.boton_modo = 'auto'; })} /> Enlace automático</label>
        <label><input type="radio" name="dc-boton-modo" checked={custom} onChange={() => onChange(draft => { draft.boton_modo = 'personalizado'; })} /> Enlace personalizado</label>
        {!custom && (
          <small className="ba-hint">
            {data.entidad_tipo && auto && status !== 'inexistente' && <>Lleva a la página de {tipoInfo(data.entidad_tipo).label.toLowerCase()} <code>{auto}</code></>}
            {data.entidad_tipo === 'proveedor' && <>Los proveedores no tienen página pública, así que se usa el enlace original: <code>{defaultUrl}</code>. Usá un enlace personalizado para otro destino.</>}
            {data.entidad_tipo && data.entidad_tipo !== 'proveedor' && (!auto || status === 'inexistente') && <>La entidad elegida no está disponible: se usa el enlace original <code>{defaultUrl}</code>.</>}
            {!data.entidad_tipo && <>Sin contenido elegido lleva a los productos con descuento: <code>{defaultUrl}</code></>}
          </small>
        )}
        {custom && (
          <>
            <label>Enlace del botón<input id="dc-boton-enlace" value={data.boton_enlace} maxLength={2048} placeholder="/tienda?marca=… o https://…" onChange={event => onChange(draft => { draft.boton_enlace = event.target.value; })} /></label>
            {invalid && <small className="ba-hint" role="alert">Usá una URL https://… o una ruta interna que empiece con /.</small>}
            {!data.boton_enlace && <small className="ba-hint">Mientras esté vacío el botón usa el enlace automático.</small>}
            {auto && <button type="button" onClick={() => onChange(draft => { draft.boton_enlace = auto; })}>Copiar el enlace automático</button>}
          </>
        )}
        <small className="ba-hint">Destino actual del botón: <code>{destino}</code></small>
      </details>
    </>
  );
}
