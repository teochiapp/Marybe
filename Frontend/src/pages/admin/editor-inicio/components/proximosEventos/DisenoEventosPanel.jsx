import React from 'react';
import OptionTiles from '../OptionTiles';
import {
  EVENTOS_BORDES_OPTIONS,
  EVENTOS_BOTON_REDONDEO_OPTIONS,
  EVENTOS_CANTIDAD_OPTIONS,
  EVENTOS_ESPACIADO_OPTIONS,
  PROXIMOS_EVENTOS_DEFAULTS,
} from '../../../../../utils/proximosEventosSection';

const renderBordesSample = value => {
  const radius = value === 'cuadrado' ? 2 : value === 'muy-redondeado' ? 14 : 8;
  return (
    <span
      style={{
        display: 'inline-block',
        width: 40,
        height: 26,
        borderRadius: radius,
        border: '1.5px solid #7c0405',
        background: 'rgba(124, 4, 5, 0.1)',
      }}
    />
  );
};

const renderSpacingSample = value => {
  const gap = value === 'compacto' ? 3 : value === 'amplio' ? 9 : 6;
  return (
    <span style={{ display: 'inline-flex', gap, alignItems: 'center' }}>
      <span style={{ width: 12, height: 22, borderRadius: 3, background: '#7c0405' }} />
      <span style={{ width: 12, height: 22, borderRadius: 3, background: '#7c0405' }} />
      <span style={{ width: 12, height: 22, borderRadius: 3, background: '#7c0405' }} />
    </span>
  );
};

const renderCantidadSample = value => (
  <span style={{ fontSize: 15, fontWeight: 700, color: '#7c0405' }}>
    {value === 'todos' ? '∞' : value}
  </span>
);

const renderBtnSample = value => {
  const radius = value === 'cuadrado' ? 3 : value === 'pildora' ? 999 : 8;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 46,
        height: 20,
        borderRadius: radius,
        background: '#280201',
        color: '#fff',
        fontSize: 9,
        fontWeight: 600,
      }}
    >
      Botón
    </span>
  );
};

export default function DisenoEventosPanel({ data, published, onChange }) {
  if (!data) return null;

  const restoreDesign = () => {
    onChange(next => {
      next.bordes_tarjeta = published?.bordes_tarjeta || PROXIMOS_EVENTOS_DEFAULTS.bordes_tarjeta;
      next.espaciado_tarjetas =
        published?.espaciado_tarjetas || PROXIMOS_EVENTOS_DEFAULTS.espaciado_tarjetas;
      next.cantidad_visible =
        published?.cantidad_visible || PROXIMOS_EVENTOS_DEFAULTS.cantidad_visible;
      next.boton_redondeo = published?.boton_redondeo || PROXIMOS_EVENTOS_DEFAULTS.boton_redondeo;
    });
  };

  return (
    <>
      <p className="ba-inspector-help">
        Personalizá la apariencia de las tarjetas de eventos, su separación y cuántos eventos mostrar en la página de Inicio.
      </p>

      <details open>
        <summary>Tarjetas y grilla</summary>
        <p className="ba-hint" style={{ marginBottom: 6 }}>
          Bordes de las tarjetas
        </p>
        <OptionTiles
          label="Bordes de las tarjetas"
          options={EVENTOS_BORDES_OPTIONS}
          value={data.bordes_tarjeta || 'redondeado'}
          onChange={val => onChange(next => { next.bordes_tarjeta = val; })}
          renderSample={renderBordesSample}
          columns={3}
        />

        <p className="ba-hint" style={{ marginBottom: 6 }}>
          Espaciado entre tarjetas
        </p>
        <OptionTiles
          label="Espaciado entre tarjetas"
          options={EVENTOS_ESPACIADO_OPTIONS}
          value={data.espaciado_tarjetas || 'normal'}
          onChange={val => onChange(next => { next.espaciado_tarjetas = val; })}
          renderSample={renderSpacingSample}
          columns={3}
        />

        <p className="ba-hint" style={{ marginBottom: 6 }}>
          Cantidad de eventos visibles en Inicio
        </p>
        <OptionTiles
          label="Cantidad de eventos visibles"
          options={EVENTOS_CANTIDAD_OPTIONS}
          value={String(data.cantidad_visible || 'todos')}
          onChange={val => onChange(next => { next.cantidad_visible = val; })}
          renderSample={renderCantidadSample}
          columns={3}
        />
      </details>

      <details open>
        <summary>Botón de reserva</summary>
        <OptionTiles
          label="Redondeo del botón de reserva"
          options={EVENTOS_BOTON_REDONDEO_OPTIONS}
          value={data.boton_redondeo || 'redondeado'}
          onChange={val => onChange(next => { next.boton_redondeo = val; })}
          renderSample={renderBtnSample}
          columns={3}
        />
      </details>

      <button type="button" className="ba-reset-device" onClick={restoreDesign}>
        Volver al diseño publicado
      </button>
    </>
  );
}
