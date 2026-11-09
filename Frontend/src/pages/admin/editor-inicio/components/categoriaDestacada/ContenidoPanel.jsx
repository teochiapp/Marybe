import React from 'react';
import OptionTiles from '../OptionTiles';
import TipografiaSample from '../ofertas/TipografiaSample';
import { CATEGORIA_DESTACADA_ICONOS } from '../../../../../utils/categoriaDestacadaIconos';
import { ALINEACION_OPTIONS, AREA_COLORS, TAMANO_OPTIONS } from './categoriaDestacadaModel';

const SECTION_ORDER = ['Perfumería', 'Hogar', ''];

function renderIconSample(value) {
  const option = CATEGORIA_DESTACADA_ICONOS.find(item => item.value === value);
  if (!option || !option.Icon) return <span style={{ color: '#9a8c90', fontSize: 13, fontWeight: 600 }}>Aa</span>;
  const { Icon } = option;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--color-bordo-secundario)', fontSize: 14, fontWeight: 700 }}>
      <span>Aa</span>
      <Icon size={20} strokeWidth={2.1} />
    </span>
  );
}

export default function ContenidoPanel({ data, categories, defaultTitle, areaColor = AREA_COLORS.perfumeria, onChange, onCategoryChange }) {
  const current = categories.find(category => category.documentId === data.categoria);
  const groups = SECTION_ORDER.map(seccion => ({ seccion, items: categories.filter(category => (category.seccion || '') === seccion) })).filter(group => group.items.length);
  const activeIcon = data.icono || '';
  const tamano = data.tamano || 'grande';
  const alineacion = data.alineacion || 'izquierda';

  return (
    <>
      <p className="ba-inspector-help">Elegí qué categoría de la tienda se muestra en esta sección, el título que la acompaña y, si querés, un ícono al final del título.</p>
      <details open>
        <summary>Categoría</summary>
        <label>Categoría de la tienda
          <select value={data.categoria || ''} onChange={event => onCategoryChange(event.target.value || null)}>
            <option value="">Elegí una categoría…</option>
            {groups.map(group => (
              <optgroup key={group.seccion || 'otras'} label={group.seccion || 'Sin área'}>
                {group.items.map(category => <option key={category.documentId} value={category.documentId}>{category.nombre} ({category.productos} {category.productos === 1 ? 'producto' : 'productos'})</option>)}
              </optgroup>
            ))}
          </select>
        </label>
        {data.categoria && !current && <small className="ba-hint" role="alert">La categoría guardada ya no existe o no está publicada. Elegí otra.</small>}
        {current && current.productos === 0 && <small className="ba-hint" role="alert">Esta categoría no tiene productos publicados: la sección no se muestra en la tienda.</small>}
        {!current && !data.categoria && <small className="ba-hint">Sin categoría, la sección no se muestra en la tienda.</small>}
      </details>
      <details open>
        <summary>Título principal</summary>
        <label>Título<input id="cd-titulo" value={data.titulo} maxLength={120} placeholder={defaultTitle} onChange={event => onChange(next => { next.titulo = event.target.value; })} /></label>
        <small className="ba-hint">Se muestra con la tipografía y el estilo actuales de la sección.</small>
      </details>
      <details open>
        <summary>Ícono al final del título</summary>
        <label>
          <input
            type="checkbox"
            checked={Boolean(activeIcon)}
            onChange={event => onChange(next => { next.icono = event.target.checked ? (activeIcon || 'estrella') : ''; })}
          />{' '}
          Mostrar ícono al final del título
        </label>
        <OptionTiles
          label="Ícono del título"
          options={CATEGORIA_DESTACADA_ICONOS}
          value={activeIcon}
          onChange={value => onChange(next => { next.icono = value; })}
          renderSample={renderIconSample}
          columns={2}
        />
        <small className="ba-hint">El ícono es opcional y aparece al final del texto heredando el color y el tamaño del título.</small>
      </details>
      <details open>
        <summary>Tamaño y alineación del título</summary>
        <OptionTiles
          label="Tamaño del título"
          options={TAMANO_OPTIONS}
          value={tamano}
          columns={2}
          onChange={value => onChange(next => { next.tamano = value; })}
          renderSample={value => <TipografiaSample kind="tamano" value={value} diseno={data} areaColor={areaColor} />}
        />
        <OptionTiles
          label="Alineación del título"
          options={ALINEACION_OPTIONS}
          value={alineacion}
          columns={3}
          onChange={value => onChange(next => { next.alineacion = value; })}
          renderSample={value => <TipografiaSample kind="alineacion" value={value} diseno={data} areaColor={areaColor} />}
        />
      </details>
    </>
  );
}
