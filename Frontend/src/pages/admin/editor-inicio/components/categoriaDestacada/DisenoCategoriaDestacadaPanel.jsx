import React from 'react';
import OptionTiles from '../OptionTiles';
import DisenoOfertasPanel from '../ofertas/DisenoOfertasPanel';
import {
  AREA_COLORS,
  CATEGORIA_DESTACADA_DISENO_ORIGINAL,
  DENSIDAD_DISPOSITIVO_OPTIONS,
  DENSIDAD_OPTIONS,
  DEVICE_OVERRIDES,
  ENCUADRE_DISPOSITIVO_OPTIONS,
  ENCUADRE_OPTIONS,
  labelOf,
} from './categoriaDestacadaModel';

function renderDensidadSample(value) {
  const mode = value === 'heredar' ? 'original' : value;
  const count = mode === 'compacta' ? 4 : mode === 'amplia' ? 2 : 3;
  const width = mode === 'compacta' ? 11 : mode === 'amplia' ? 22 : 15;
  const gap = mode === 'compacta' ? 3 : mode === 'amplia' ? 7 : 5;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap, opacity: value === 'heredar' ? 0.6 : 1 }}>
      {Array.from({ length: count }, (_, idx) => (
        <span
          key={idx}
          style={{
            width,
            height: 22,
            borderRadius: 4,
            background: 'var(--color-bordo-secundario)',
            opacity: 0.85,
          }}
        />
      ))}
    </span>
  );
}

function renderEncuadreSample(value) {
  const mode = value === 'heredar' ? 'original' : value;
  const fill = mode === 'cubrir';
  return (
    <span
      style={{
        display: 'inline-grid',
        placeItems: 'center',
        width: 46,
        height: 28,
        border: '1px dashed #c8b8bc',
        borderRadius: 6,
        overflow: 'hidden',
        background: '#faf5f5',
        opacity: value === 'heredar' ? 0.6 : 1,
      }}
    >
      <span
        style={{
          width: fill ? 46 : 30,
          height: fill ? 28 : 20,
          borderRadius: 4,
          background: 'var(--color-bordo-secundario)',
          opacity: 0.85,
        }}
      />
    </span>
  );
}

export default function DisenoCategoriaDestacadaPanel({
  data,
  device,
  areaColor = AREA_COLORS.perfumeria,
  onChange,
  onShowDevice,
}) {
  const disenoData = {
    ...data,
    fondo: data.fondo || CATEGORIA_DESTACADA_DISENO_ORIGINAL.fondo,
    espaciado: data.espaciado || CATEGORIA_DESTACADA_DISENO_ORIGINAL.espaciado,
  };
  const generalDensidad = data.densidad || CATEGORIA_DESTACADA_DISENO_ORIGINAL.densidad;
  const generalEncuadre = data.encuadre || CATEGORIA_DESTACADA_DISENO_ORIGINAL.encuadre;

  const isOriginal = Object.entries(CATEGORIA_DESTACADA_DISENO_ORIGINAL).every(
    ([key, def]) => (data[key] || def) === def
  );

  return (
    <>
      <DisenoOfertasPanel
        part="fondo"
        data={disenoData}
        areaColor={areaColor}
        onChange={onChange}
      />

      <details open>
        <summary>Tarjetas del carrusel (ajuste general)</summary>
        <p className="ba-inspector-help">
          Definí la densidad y el encuadre general de las tarjetas de producto. Cada dispositivo hereda este valor salvo que elijas uno propio más abajo.
        </p>
        <OptionTiles
          label="Densidad de las tarjetas"
          options={DENSIDAD_OPTIONS}
          value={generalDensidad}
          columns={3}
          onChange={value => onChange(next => { next.densidad = value; })}
          renderSample={renderDensidadSample}
        />
        <OptionTiles
          label="Encuadre de las imágenes"
          options={ENCUADRE_OPTIONS}
          value={generalEncuadre}
          columns={2}
          onChange={value => onChange(next => { next.encuadre = value; })}
          renderSample={renderEncuadreSample}
        />
      </details>

      <details open>
        <summary>Ajuste por dispositivo (herencia del general)</summary>
        <p className="ba-inspector-help">
          En «Heredar» el dispositivo usa automáticamente el ajuste general ({labelOf(DENSIDAD_OPTIONS, generalDensidad)} · {labelOf(ENCUADRE_OPTIONS, generalEncuadre)}).
        </p>
        {DEVICE_OVERRIDES.map(slot => {
          const dVal = data[slot.densidadKey] || 'heredar';
          const eVal = data[slot.encuadreKey] || 'heredar';
          const effD = dVal !== 'heredar' ? dVal : generalDensidad;
          const effE = eVal !== 'heredar' ? eVal : generalEncuadre;
          const isCurrent = device === slot.key;

          return (
            <details open key={slot.key}>
              <summary>
                {slot.label}
                {isCurrent ? ' · vista actual' : ''}
              </summary>
              <small className="ba-hint" data-device-inheritance={slot.key}>
                Densidad efectiva: <strong>{labelOf(DENSIDAD_OPTIONS, effD)}</strong> ({dVal === 'heredar' ? 'heredada' : 'propia'}) · Encuadre efectivo: <strong>{labelOf(ENCUADRE_OPTIONS, effE)}</strong> ({eVal === 'heredar' ? 'heredado' : 'propio'})
              </small>
              <OptionTiles
                label={`Densidad en ${slot.label.toLowerCase()}`}
                options={DENSIDAD_DISPOSITIVO_OPTIONS}
                value={dVal}
                columns={4}
                onChange={value => {
                  onShowDevice?.(slot.key);
                  onChange(next => { next[slot.densidadKey] = value; });
                }}
                renderSample={renderDensidadSample}
              />
              <OptionTiles
                label={`Encuadre en ${slot.label.toLowerCase()}`}
                options={ENCUADRE_DISPOSITIVO_OPTIONS}
                value={eVal}
                columns={3}
                onChange={value => {
                  onShowDevice?.(slot.key);
                  onChange(next => { next[slot.encuadreKey] = value; });
                }}
                renderSample={renderEncuadreSample}
              />
            </details>
          );
        })}
      </details>

      {!isOriginal && (
        <button
          type="button"
          className="ba-reset-device"
          onClick={() => onChange(next => { Object.assign(next, CATEGORIA_DESTACADA_DISENO_ORIGINAL); })}
        >
          Restablecer diseño original
        </button>
      )}
    </>
  );
}
