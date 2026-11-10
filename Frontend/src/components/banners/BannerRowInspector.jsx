import React from 'react';
import { CAROUSEL_DEFAULTS, designOrigin, deviceDesign, ROW_TYPES } from '../../utils/bannerDesign';

const TYPE_COLUMNS = { 'layout.fila-1-columna': 1, 'layout.fila-2-columnas': 2, 'layout.fila-4-columnas': 4, 'layout.fila-mixta': 1 };

export default function BannerRowInspector({ draft, row, rows, selected, device, deviceName, values, busy, change, selectElement, addBanner, addDistribution, updateDesign, number, color, origin, NumberControl }) {
  function moveBanner(index, direction) {
    const destination = index + direction;
    if (destination < 0 || destination >= row.banners.length) return;
    change(copy => {
      const banners = copy.Filas[selected.row].banners;
      [banners[index], banners[destination]] = [banners[destination], banners[index]];
    });
    if (selected.banner === index) selectElement(selected.row, destination, 'row');
    else if (selected.banner === destination) selectElement(selected.row, index, 'row');
  }
  const carousel = { ...CAROUSEL_DEFAULTS, ...row.config_carrusel };
  const updateCarousel = values => change(copy => { const target = copy.Filas[selected.row]; target.config_carrusel = { ...CAROUSEL_DEFAULTS, ...target.config_carrusel, ...values }; });

  return <>
    <label>Tipo de presentación<select value={row.es_carrusel ? 'carousel' : 'grid'} onChange={event => change(copy => { copy.Filas[selected.row].es_carrusel = event.target.value === 'carousel'; })}><option value="grid">Grilla</option><option value="carousel">Carrusel</option></select></label>
    {row.es_carrusel && <details open><summary>Opciones del carrusel</summary>
      <label className="ba-check"><input type="checkbox" checked={carousel.autoplay} onChange={event => updateCarousel({ autoplay: event.target.checked })} />Avance automático</label>
      <label>Intervalo en segundos<input type="number" min="1" max="60" value={carousel.intervalo} onChange={event => { if (event.target.value !== '') updateCarousel({ intervalo: Math.max(1, Math.min(60, Math.round(Number(event.target.value)))) }); }} /></label>
      <label>Indicador<select value={carousel.indicador} onChange={event => updateCarousel({ indicador: event.target.value })}><option value="ninguno">Sin indicador</option><option value="puntos">Puntos</option><option value="contador">Contador</option></select></label>
      <label className="ba-check"><input type="checkbox" checked={carousel.vistaParcial} onChange={event => updateCarousel({ vistaParcial: event.target.checked })} />Mostrar parte del próximo banner</label>
      <small className="ba-hint">Estas opciones se comparten entre dispositivos.</small>
    </details>}
    <label>Plantilla de distribución<select value={row.__component} onChange={event => {
      const type = event.target.value;
      change(copy => {
        const target = copy.Filas[selected.row];
        target.__component = type;
        if (type !== 'layout.fila-mixta') target.diseno = { ...target.diseno, [device]: { ...target.diseno?.[device], columns: TYPE_COLUMNS[type] } };
      });
    }}>{Object.entries(ROW_TYPES).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
    <label>Nombre de la sección<input id="ba-section-name" value={draft.titulo} maxLength={200} onChange={event => change(copy => { copy.titulo = event.target.value; })} /></label>
    {rows.length > 1 && <label>Distribución activa<select value={selected.row} onChange={event => selectElement(Number(event.target.value), 0, 'row')}>{rows.map((item, index) => <option key={index} value={index}>Distribución {index + 1}</option>)}</select></label>}
    <details open><summary>Ajustes principales · {deviceName}</summary>
      {number('columns', 'Columnas', 1, 4, '')}
      <NumberControl label="Alto de los banners" value={deviceDesign(row.banners[0]?.diseno, device).height} min={0} max={1600} origin={{ ...designOrigin(row.banners[0]?.diseno, device, 'height'), own: row.banners.some(item => designOrigin(item.diseno, device, 'height').own) }} onReset={() => change(copy => { copy.Filas[selected.row].banners.forEach(item => { if (item.diseno?.[device]) delete item.diseno[device].height; }); })} onChange={height => change(copy => { copy.Filas[selected.row].banners.forEach(item => { item.diseno = { ...item.diseno, [device]: { ...item.diseno?.[device], height } }; }); })} />
      <small className="ba-hint">El alto se aplica a todos los banners en {deviceName.toLowerCase()}. Usá 0 para alto automático.</small>
      {number('gap', 'Espacio entre banners', 0, 100)}
    </details>
    <details><summary>Ajustes avanzados · {deviceName}</summary>
      {number('width', 'Ancho de distribución', 10, 100, '%')}{number('maxWidth', 'Ancho máximo', 320, 2560)}{color('background', 'Fondo de distribución')}{number('margin', 'Margen vertical', 0, 200)}{number('padding', 'Espacio interior', 0, 160)}
      <label className="ba-check ba-device-hidden"><input type="checkbox" checked={values.hidden || false} onChange={event => updateDesign({ hidden: event.target.checked })} />Ocultar en {deviceName.toLowerCase()}</label>
      {origin('hidden', `Ocultar en ${deviceName.toLowerCase()}`)}
    </details>
    <details open><summary>Banners de esta distribución</summary>
      {row.banners.map((banner, index) => <div key={banner.id || `new-${index}`} className="ba-row-banner-controls">
        <strong>{banner.titulo || `Banner ${index + 1}`}</strong>
        {row.__component === 'layout.fila-mixta' && <NumberControl label={`Porcentaje de ${banner.titulo || `Banner ${index + 1}`}`} suffix="%" min={1} max={100} value={banner.ancho_porcentaje || 100} onChange={value => change(copy => { copy.Filas[selected.row].banners[index].ancho_porcentaje = value; })} />}
        <div><button type="button" disabled={busy || index === 0} aria-label={`Mover ${banner.titulo || `Banner ${index + 1}`} antes`} onClick={() => moveBanner(index, -1)}>←</button><button type="button" disabled={busy || index === row.banners.length - 1} aria-label={`Mover ${banner.titulo || `Banner ${index + 1}`} después`} onClick={() => moveBanner(index, 1)}>→</button><button type="button" onClick={() => selectElement(selected.row, index, 'banner')}>Editar banner</button></div>
      </div>)}
      {row.__component === 'layout.fila-mixta' && <small className="ba-hint">El porcentaje de cada banner es compartido. En celular se usa el ancho de la pantalla.</small>}
      <button type="button" className="ba-add-inline" disabled={busy} onClick={() => addBanner(selected.row)}>＋ Agregar banner</button>
    </details>
    <button className="ba-add-row" onClick={addDistribution} disabled={busy}>＋ Agregar distribución</button>
  </>;
}
