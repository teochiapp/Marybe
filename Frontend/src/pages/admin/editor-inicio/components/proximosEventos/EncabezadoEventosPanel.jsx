import React from 'react';
import OptionTiles from '../OptionTiles';
import {
  EVENTOS_ALINEACION_OPTIONS,
  EVENTOS_ESTILO_OPTIONS,
  EVENTOS_FUENTE_OPTIONS,
  EVENTOS_ICONO_OPTIONS,
  EVENTOS_PESO_OPTIONS,
  EVENTOS_TAMANO_OPTIONS,
  PROXIMOS_EVENTOS_DEFAULTS,
} from '../../../../../utils/proximosEventosSection';

function renderIconSample(value) {
  if (value === 'ninguno') {
    return <span style={{ fontSize: 13, color: '#8a7d81', fontWeight: 600 }}>Sin</span>;
  }
  if (value === 'original') {
    return <span style={{ fontSize: 18, color: '#7c0405' }}>📅</span>;
  }
  const entry = EVENTOS_ICONO_OPTIONS.find(item => item.value === value);
  if (!entry?.Icon) return null;
  const IconComp = entry.Icon;
  return <IconComp style={{ width: 22, height: 22, color: '#7c0405' }} />;
}

const renderFontSample = value => (
  <span
    style={{
      fontFamily:
        value === 'secundaria' ? 'var(--font-family-secondary)' : 'var(--font-family-primary)',
      fontStyle: 'italic',
      fontWeight: 600,
      fontSize: 18,
      color: '#280101',
    }}
  >
    Aa
  </span>
);

const renderSizeSample = value => {
  const px = value === 'chico' ? 14 : value === 'mediano' ? 17 : value === 'muy-grande' ? 23 : 20;
  return <span style={{ fontSize: px, fontWeight: 600, color: '#280101' }}>Aa</span>;
};

const renderWeightSample = value => {
  const fw = value === 'normal' ? 400 : value === 'bold' ? 700 : 600;
  return <span style={{ fontSize: 18, fontWeight: fw, color: '#280101' }}>Aa</span>;
};

const renderStyleSample = value => (
  <span
    style={{
      fontSize: 18,
      fontStyle: value === 'normal' ? 'normal' : 'italic',
      fontWeight: 600,
      color: '#280101',
    }}
  >
     Eventos
  </span>
);

const renderAlignSample = value => {
  const justify =
    value === 'centro' ? 'center' : value === 'derecha' ? 'flex-end' : 'flex-start';
  return (
    <span
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        gap: 3,
        alignItems: justify,
        width: 38,
      }}
    >
      <span style={{ width: 28, height: 3, background: '#7c0405', borderRadius: 2 }} />
      <span style={{ width: 18, height: 3, background: '#a08c93', borderRadius: 2 }} />
    </span>
  );
};

export default function EncabezadoEventosPanel({ data, published, onChange }) {
  if (!data) return null;

  const restoreHeader = () => {
    onChange(next => {
      next.titulo = published?.titulo || PROXIMOS_EVENTOS_DEFAULTS.titulo;
      next.icono = published?.icono || PROXIMOS_EVENTOS_DEFAULTS.icono;
      next.fuente = published?.fuente || PROXIMOS_EVENTOS_DEFAULTS.fuente;
      next.tamano = published?.tamano || PROXIMOS_EVENTOS_DEFAULTS.tamano;
      next.peso = published?.peso || PROXIMOS_EVENTOS_DEFAULTS.peso;
      next.estilo = published?.estilo || PROXIMOS_EVENTOS_DEFAULTS.estilo;
      next.alineacion = published?.alineacion || PROXIMOS_EVENTOS_DEFAULTS.alineacion;
    });
  };

  return (
    <>
      <p className="ba-inspector-help">
        Personalizá el título, el ícono superior y el estilo tipográfico del encabezado de Próximos Eventos.
      </p>

      <details open>
        <summary>Título e ícono</summary>
        <label htmlFor="eventos-titulo">
          Título de la sección
          <input
            id="eventos-titulo"
            type="text"
            maxLength={100}
            value={data.titulo || ''}
            placeholder={PROXIMOS_EVENTOS_DEFAULTS.titulo}
            onChange={e => onChange(next => { next.titulo = e.target.value; })}
          />
        </label>

        <p className="ba-hint" style={{ marginTop: 10, marginBottom: 6 }}>
          Ícono del encabezado
        </p>
        <OptionTiles
          label="Ícono del encabezado"
          options={EVENTOS_ICONO_OPTIONS}
          value={data.icono || 'original'}
          onChange={val => onChange(next => { next.icono = val; })}
          renderSample={renderIconSample}
          columns={3}
        />
      </details>

      <details open>
        <summary>Tipografía y alineación</summary>
        <p className="ba-hint" style={{ marginBottom: 6 }}>
          Familia tipográfica
        </p>
        <OptionTiles
          label="Familia tipográfica"
          options={EVENTOS_FUENTE_OPTIONS}
          value={data.fuente || 'principal'}
          onChange={val => onChange(next => { next.fuente = val; })}
          renderSample={renderFontSample}
          columns={2}
        />

        <p className="ba-hint" style={{ marginBottom: 6 }}>
          Tamaño del título
        </p>
        <OptionTiles
          label="Tamaño del título"
          options={EVENTOS_TAMANO_OPTIONS}
          value={data.tamano || 'grande'}
          onChange={val => onChange(next => { next.tamano = val; })}
          renderSample={renderSizeSample}
          columns={2}
        />

        <p className="ba-hint" style={{ marginBottom: 6 }}>
          Peso de fuente
        </p>
        <OptionTiles
          label="Peso de fuente"
          options={EVENTOS_PESO_OPTIONS}
          value={data.peso || 'semibold'}
          onChange={val => onChange(next => { next.peso = val; })}
          renderSample={renderWeightSample}
          columns={3}
        />

        <p className="ba-hint" style={{ marginBottom: 6 }}>
          Estilo del texto
        </p>
        <OptionTiles
          label="Estilo del texto"
          options={EVENTOS_ESTILO_OPTIONS}
          value={data.estilo || 'cursiva'}
          onChange={val => onChange(next => { next.estilo = val; })}
          renderSample={renderStyleSample}
          columns={2}
        />

        <p className="ba-hint" style={{ marginBottom: 6 }}>
          Alineación del encabezado
        </p>
        <OptionTiles
          label="Alineación del encabezado"
          options={EVENTOS_ALINEACION_OPTIONS}
          value={data.alineacion || 'izquierda'}
          onChange={val => onChange(next => { next.alineacion = val; })}
          renderSample={renderAlignSample}
          columns={3}
        />
      </details>

      <button type="button" className="ba-reset-device" onClick={restoreHeader}>
        Volver al encabezado publicado
      </button>
    </>
  );
}
