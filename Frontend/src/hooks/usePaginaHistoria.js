import { useState, useEffect } from 'react';

/** Resuelve URLs de media de Strapi 4/5 sin recurrir a imágenes locales. */
function extractImageUrl(mediaField) {
  if (!mediaField) return '';
  const raw = mediaField.data ? mediaField.data : mediaField;
  const attrs = raw.attributes ? raw.attributes : raw;
  const url = attrs?.url;
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const apiUrl = process.env.REACT_APP_STRAPI_URL || 'http://localhost:1337';
  return `${apiUrl}${url}`;
}

const OBJECT_POSITIONS = {
  centro: 'center',
  arriba: 'center top',
  abajo: 'center bottom',
  izquierda: 'left center',
  derecha: 'right center',
};

function extractObjectPosition(value) {
  return OBJECT_POSITIONS[value] || OBJECT_POSITIONS.centro;
}

const DEFAULT_HISTORIA = {
  titulo: 'Nuestra Historia',
  imagen_inicio: '',
  encuadre_imagen_inicio: 'center',
  texto_banner_1: `<p><strong>MARYBE Perfumerías es una empresa familiar fundada en Santiago del Estero en 1969.</strong> Desde sus inicios, creció gracias al trabajo, la tenacidad, la pasión y el compromiso de quienes formaron parte de su camino.</p><p>A lo largo de los años, supo renovarse, adaptarse a los cambios y evolucionar junto a las necesidades de sus clientes, sin perder nunca de vista aquello que la define: el respeto, la cercanía y su vocación por brindar una atención de calidad.</p>`,
  texto_intermedio: `<p>Hoy, MARYBE continúa en <strong>plena expansión</strong>, impulsada por nuevas generaciones de la familia que mantienen vivo el espíritu de sus fundadores, incorporando nuevas formas de pensar, emprender y responder a un mercado cada vez más dinámico, competitivo y exigente.</p><p>Trabajamos día a día para ofrecer una experiencia de compra cercana, confiable y especial, en espacios pensados para que cada persona se vea y se sienta mejor. Esta esencia se refleja en cada una de nuestras sucursales, ubicadas en <strong>Santiago del Estero, La Banda y San Miguel de Tucumán</strong>.</p>`,
  texto_banner_2: `<p><strong>Con más de 50 años de trayectoria</strong>, somos representantes oficiales de reconocidas marcas nacionales e internacionales, reafirmando nuestro compromiso con la excelencia en el servicio y la calidad de cada producto.</p>`,
  imagen_secundaria: '',
  encuadre_imagen_secundaria: 'center',
  imagen_final_desktop: '',
  encuadre_imagen_final_desktop: 'center',
  imagen_final_mobile: '',
  encuadre_imagen_final_mobile: 'center',
};

/**
 * Hook para obtener el contenido dinámico de la Página de Nuestra Historia desde Strapi.
 * Endpoint Strapi: GET /api/pagina-historia?populate=*
 */
export function usePaginaHistoria() {
  const [data, setData] = useState(DEFAULT_HISTORIA);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistoria = async () => {
      try {
        const apiUrl = process.env.REACT_APP_STRAPI_URL || 'http://localhost:1337';
        const res = await fetch(`${apiUrl}/api/pagina-historia?populate=*`);
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        const json = await res.json();

        const raw = json?.data || {};
        const attrs = raw.attributes ? raw.attributes : raw;

        if (attrs && Object.keys(attrs).length > 0) {
          setData({
            titulo: attrs.titulo || DEFAULT_HISTORIA.titulo,
            imagen_inicio: extractImageUrl(attrs.imagen_inicio),
            encuadre_imagen_inicio: extractObjectPosition(attrs.encuadre_imagen_inicio),
            texto_banner_1: attrs.texto_banner_1 || DEFAULT_HISTORIA.texto_banner_1,
            texto_intermedio: attrs.texto_intermedio || DEFAULT_HISTORIA.texto_intermedio,
            texto_banner_2: attrs.texto_banner_2 || DEFAULT_HISTORIA.texto_banner_2,
            imagen_secundaria: extractImageUrl(attrs.imagen_secundaria),
            encuadre_imagen_secundaria: extractObjectPosition(attrs.encuadre_imagen_secundaria),
            imagen_final_desktop: extractImageUrl(attrs.imagen_final_desktop),
            encuadre_imagen_final_desktop: extractObjectPosition(attrs.encuadre_imagen_final_desktop),
            imagen_final_mobile: extractImageUrl(attrs.imagen_final_mobile),
            encuadre_imagen_final_mobile: extractObjectPosition(attrs.encuadre_imagen_final_mobile),
          });
        }
      } catch (err) {
        console.warn('Error cargando el contenido de la Página de Nuestra Historia desde Strapi:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistoria();
  }, []);

  return { ...data, loading };
}
