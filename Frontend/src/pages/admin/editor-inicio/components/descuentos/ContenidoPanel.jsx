import React, { useMemo, useState } from 'react';
import { TIPOS_ENTIDAD } from '../../../../../utils/descuentosBloque';
import { MAX_RESULTS, autoUrl, entityKey, entityOptions, entityStatus, findEntity, tipoInfo } from './descuentosModel';

const PLURAL_LABEL = { categoria: 'Categorías', marca: 'Marcas', proveedor: 'Proveedores' };

export default function ContenidoPanel({ data, entities, entitiesError, onChange, onUseCover }) {
  const [query, setQuery] = useState('');
  const tipo = data.entidad_tipo;
  const status = entityStatus(data, entities);
  const found = findEntity(data, entities);
  const options = useMemo(() => (tipo ? entityOptions(entities, tipo, query) : []), [entities, tipo, query]);
  const shown = options.slice(0, MAX_RESULTS);
  const url = tipo && entities ? autoUrl(data, entities) : '';

  function changeTipo(next) {
    if (next === tipo) return;
    setQuery('');
    onChange(draft => {
      draft.entidad_tipo = next;
      draft.entidad_id = '';
      draft.entidad_nombre = '';
      draft.entidad_seccion = '';
    });
  }

  function choose(id) {
    const entity = (entities[tipo] || []).find(item => entityKey(tipo, item) === id);
    if (!entity) return;
    onChange(draft => {
      draft.entidad_id = id;
      draft.entidad_nombre = entity.nombre;
      draft.entidad_seccion = tipo === 'categoria' ? entity.seccion || '' : '';
    });
  }

  return (
    <>
      <p className="ba-inspector-help">Elegí qué promociona este bloque. Los textos, la imagen y el botón son independientes: elegir una entidad no cambia el título ni modifica la entidad en la tienda.</p>
      <details open>
        <summary>Tipo de contenido</summary>
        <label htmlFor="desc-entidad-tipo">¿Qué querés promocionar?
          <select id="desc-entidad-tipo" name="entidad_tipo" value={tipo} onChange={event => changeTipo(event.target.value)}>
            <option value="">Nada en particular (descuentos generales)</option>
            {TIPOS_ENTIDAD.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </label>
        {!tipo && <small className="ba-hint">Sin contenido elegido, el botón lleva a todos los productos con descuento.</small>}
      </details>
      {tipo && (
        <details open>
          <summary>{tipoInfo(tipo).label} elegida</summary>
          {entitiesError && <small className="ba-hint" role="alert">{entitiesError}</small>}
          {!entities && !entitiesError && <small className="ba-hint">Cargando {tipoInfo(tipo).plural}…</small>}
          {entities && (
            <>
              <label htmlFor="desc-buscar-entidad">Buscar {tipoInfo(tipo).label.toLowerCase()}
                <input id="desc-buscar-entidad" name="buscar_entidad" type="search" value={query} placeholder={`Escribí para filtrar ${tipoInfo(tipo).plural}…`} onChange={event => setQuery(event.target.value)} />
              </label>
              <label htmlFor="desc-entidad-id">{PLURAL_LABEL[tipo]} disponibles ({options.length})
                <select id="desc-entidad-id" name="entidad_id" size={7} value={data.entidad_id} aria-label={`${PLURAL_LABEL[tipo]} disponibles`} onChange={event => choose(event.target.value)}>
                  {data.entidad_id && !shown.some(item => entityKey(tipo, item) === data.entidad_id) && <option value={data.entidad_id}>{data.entidad_nombre || data.entidad_id}{found ? '' : ' (no disponible)'}</option>}
                  {shown.map(item => (
                    <option key={entityKey(tipo, item)} value={entityKey(tipo, item)}>
                      {item.nombre}{item.seccion ? ` · ${item.seccion}` : ''} ({item.productos} {item.productos === 1 ? 'producto' : 'productos'})
                    </option>
                  ))}
                </select>
              </label>
              {options.length > shown.length && <small className="ba-hint">Se muestran las primeras {MAX_RESULTS}. Escribí para acotar la búsqueda.</small>}
              {!options.length && <small className="ba-hint">No hay {tipoInfo(tipo).plural} que coincidan.</small>}
            </>
          )}
          {status === 'inexistente' && <small className="ba-hint" role="alert">{data.entidad_nombre || 'La entidad guardada'} ya no está disponible (se eliminó, no está publicada o no tiene productos publicados). Elegí otra: mientras tanto el botón usa su enlace original.</small>}
          {status === 'sin-productos' && <small className="ba-hint" role="alert">Esta {tipoInfo(tipo).label.toLowerCase()} no tiene productos publicados: su página quedaría vacía.</small>}
          {status === 'ok' && url && <small className="ba-hint">Página pública: <code>{url}</code></small>}
          {status === 'ok' && !url && <small className="ba-hint">Los proveedores no tienen página pública: configurá el enlace del botón manualmente en la parte «Botón».</small>}
          {tipo === 'categoria' && found?.portada && (
            <button type="button" className="ba-library-button" onClick={() => onUseCover(found.portada)}>Usar la portada de la categoría como imagen del bloque</button>
          )}
          {tipo === 'categoria' && found && !found.portada && <small className="ba-hint">Esta categoría no tiene portada en Strapi. Podés elegir una imagen propia en «Imagen promocional».</small>}
        </details>
      )}
    </>
  );
}
