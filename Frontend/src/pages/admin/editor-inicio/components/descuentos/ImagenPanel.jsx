import React from 'react';
import { imageUrl } from '../../../../../utils/bannerDesign';
import { AJUSTES_IMAGEN_OPTIONS, POSICIONES_IMAGEN_OPTIONS } from '../../../../../utils/descuentosBloque';
import OptionTiles from '../OptionTiles';
import ScaleField from '../destacada/ScaleField';
import { BLOQUE_INFO } from './descuentosModel';

function renderAjusteSample(value) {
  return (
    <span style={{ display: 'inline-grid', placeItems: 'center', width: 48, height: 32, border: '1px dashed #c8b8bc', borderRadius: 6, overflow: 'hidden', background: '#faf5f5' }}>
      <span style={{ width: value === 'cubrir' ? 48 : 34, height: value === 'cubrir' ? 32 : 22, borderRadius: 4, background: 'var(--color-bordo-secundario)', opacity: 0.85 }} />
    </span>
  );
}

const POS_DOT = {
  centro: { justifyContent: 'center', alignItems: 'center' },
  arriba: { justifyContent: 'center', alignItems: 'flex-start' },
  abajo: { justifyContent: 'center', alignItems: 'flex-end' },
  izquierda: { justifyContent: 'flex-start', alignItems: 'center' },
  derecha: { justifyContent: 'flex-end', alignItems: 'center' },
};

function renderPosicionSample(value) {
  return (
    <span style={{ display: 'inline-flex', width: 44, height: 32, padding: 4, border: '1px solid #d9cccf', borderRadius: 6, background: '#faf5f5', ...(POS_DOT[value] || POS_DOT.centro) }}>
      <span style={{ width: 12, height: 12, borderRadius: 3, background: 'var(--color-bordo-secundario)' }} />
    </span>
  );
}

export default function ImagenPanel({ areaKey, data, device, onChooseImage, onChange, onShowDevice }) {
  const url = imageUrl(data.imagen);
  const mobileUrl = imageUrl(data.imagen_mobile);
  const original = BLOQUE_INFO[areaKey].imagenOriginal;
  const ajuste = data.imagen_ajuste || 'contener';
  const posicion = data.imagen_posicion || 'centro';
  const sombra = data.imagen_sombra !== false;

  return (
    <>
      <p className="ba-inspector-help">La imagen acompaña al título en la parte superior del bloque. Cambiarla o ajustar su diseño solo afecta a este bloque: no modifica imágenes de categorías, marcas ni de la biblioteca.</p>
      <details open>
        <summary>Computadora y tablet{device !== 'mobile' ? ' · vista actual' : ''}</summary>
        <div className="ba-image-current"><img src={url || original} alt={url ? 'Imagen promocional del bloque' : 'Imagen original del bloque'} /></div>
        <button className="ba-library-button" type="button" onClick={() => onChooseImage('imagen')}>Elegir imagen de la biblioteca</button>
        {data.imagen && <button type="button" onClick={() => onChange(draft => { draft.imagen = null; })}>Volver a la imagen original</button>}
        <small className="ba-hint">{data.imagen ? 'Imagen propia de este bloque.' : 'Se usa la imagen original del bloque.'} Funciona mejor una imagen horizontal con fondo transparente (PNG o WebP).</small>
        <ScaleField
          label="Tamaño en computadora y tablet"
          value={data.escala_imagen_desktop}
          onChange={value => {
            onShowDevice?.('desktop');
            onChange(draft => { draft.escala_imagen_desktop = value; });
          }}
        />
      </details>

      <details open>
        <summary>Celular (opcional){device === 'mobile' ? ' · vista actual' : ''}</summary>
        <div className="ba-image-current">{mobileUrl ? <img src={mobileUrl} alt="Imagen para celular del bloque" /> : <span>Usa la imagen de computadora</span>}</div>
        <button className="ba-library-button" type="button" onClick={() => onChooseImage('imagen_mobile')}>Elegir imagen · Celular</button>
        {data.imagen_mobile && <button type="button" onClick={() => onChange(draft => { draft.imagen_mobile = null; })}>Quitar imagen de celular</button>}
        <small className="ba-hint">Opcional. Si la dejás vacía, en celulares se muestra la imagen de computadora.</small>
        <ScaleField
          label="Tamaño en celular"
          value={data.escala_imagen_mobile}
          onChange={value => {
            onShowDevice?.('mobile');
            onChange(draft => { draft.escala_imagen_mobile = value; });
          }}
        />
      </details>

      <details open>
        <summary>Encuadre, ajuste y sombra</summary>
        <OptionTiles
          label="Ajuste de la imagen"
          options={AJUSTES_IMAGEN_OPTIONS}
          value={ajuste}
          onChange={value => onChange(draft => { draft.imagen_ajuste = value; })}
          renderSample={renderAjusteSample}
          columns={2}
        />
        <OptionTiles
          label="Posición de la imagen"
          options={POSICIONES_IMAGEN_OPTIONS}
          value={posicion}
          onChange={value => onChange(draft => { draft.imagen_posicion = value; })}
          renderSample={renderPosicionSample}
          columns={3}
        />
        <label htmlFor="desc-imagen-sombra">
          <input
            id="desc-imagen-sombra"
            name="imagen_sombra"
            type="checkbox"
            checked={sombra}
            onChange={event => onChange(draft => { draft.imagen_sombra = event.target.checked; })}
          />{' '}
          Sombra proyectada detrás de la imagen
        </label>
        <small className="ba-hint">La sombra resalta productos recortados sin fondo; podés desactivarla si usás una foto rectangular con fondo propio.</small>
      </details>
    </>
  );
}
