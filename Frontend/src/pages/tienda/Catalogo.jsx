import React, { useState, useEffect, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { useSearchParams } from 'react-router-dom';

// ─── Componentes del Catálogo ─────────────────────────────────────────────────
import CatalogoBreadcrumb from '../../components/tienda/catalogo/CatalogoBreadcrumb';
import CatalogoBanner from '../../components/tienda/catalogo/CatalogoBanner';
import CatalogoSidebar from '../../components/tienda/catalogo/CatalogoSidebar';
import CatalogoControlsBar from '../../components/tienda/catalogo/CatalogoControlsBar';
import CatalogoProductGrid from '../../components/tienda/catalogo/CatalogoProductGrid';

// ─── Constantes ───────────────────────────────────────────────────────────────

const STRAPI_URL = process.env.REACT_APP_STRAPI_URL || 'http://localhost:1337';
const PAGE_SIZE = 12;

const BANNER_CONFIG = {
  elixir: {
    title: <>El poder del<br />elixir</>,
    breadcrumbTitle: 'El poder del elixir',
    subtitle: 'Descubrí fragancias cautivadoras y sofisticadas con hasta 40% de descuento',
    pills: ['Olympea Elixir', 'Invictus Elixir'],
    image: '/inicio/elixir.png',
    imageAlt: 'Elixir Perfumes',
  },
  azzaro: {
    title: 'Toda la línea de Azzaro',
    subtitle: 'Elegancia y modernidad en cada fragancia. Descubrí la colección completa.',
    pills: ['Chrome', 'Wanted', 'Most Wanted'],
    image: '/inicio/azzaro.png',
    imageAlt: 'Línea Azzaro',
  },
  hogar: {
    title: 'Tu espacio, tu hogar',
    subtitle: 'Calidez, diseño y aromas para ambientar cada rincón de tu hogar.',
    pills: ['Aromatizantes', 'Velas', 'Difusores'],
    image: '/inicio/hogar-featured.png',
    imageAlt: 'Productos Hogar',
  },
  default: {
    title: 'Perfumería',
    subtitle: 'Explorá las mejores fragancias con descuentos exclusivos y cuotas sin interés.',
    pills: ['Novedades', 'Ofertas'],
    image: '/inicio/featured.img',
    imageAlt: 'Perfumería Marybe',
  },
};

// ─── Styled Components (layout raíz) ─────────────────────────────────────────

const PageContainer = styled.div`
  min-height: 100vh;
  background-color: #faf9f7;
  color: #28180b;
  padding: 40px 60px;
  font-family: var(--font-family-secondary);

  @media (max-width: 1024px) {
    padding: 30px 20px;
  }
`;

const MainContent = styled.div`
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 40px;
  max-width: 1400px;
  margin: 0 auto;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 30px;
  }
`;

const MainGridArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

// ─── Componente Principal ────────────────────────────────────────────────────

export default function Catalogo() {
  const [searchParams, setSearchParams] = useSearchParams();

  // ── Estado ────────────────────────────────────────────────────────────────
  const [productos, setProductos] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [availableBrands, setAvailableBrands] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [availableSizes, setAvailableSizes] = useState([]);
  const [availablePriceRange, setAvailablePriceRange] = useState([0, 200000]);

  const [favorites, setFavorites] = useState({});

  const [accordions, setAccordions] = useState({
    marca: false,
    tamano: false,
    categoria: false,
    ofertas: false,
    precio: false,
  });

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // ── Lectura de URL params ─────────────────────────────────────────────────
  const activePage = Number(searchParams.get('page')) || 1;
  const activeSort = searchParams.get('orden') || 'nombre:asc';
  const activeDescuento = searchParams.get('descuento') || '';
  const activeSeccion = searchParams.get('seccion') || 'Perfumería';
  const activeBanner = searchParams.get('banner') || '';

  const activeBrands = useMemo(
    () => (searchParams.get('marca') ? searchParams.get('marca').split(',') : []),
    [searchParams]
  );
  const activeCategories = useMemo(
    () => (searchParams.get('categoria') ? searchParams.get('categoria').split(',') : []),
    [searchParams]
  );
  const activeSizes = useMemo(
    () => (searchParams.get('tamano') ? searchParams.get('tamano').split(',') : []),
    [searchParams]
  );
  const activePriceParam = searchParams.get('precio');
  const activePrice = useMemo(() => {
    if (activePriceParam) {
      const [min, max] = activePriceParam.split('-').map(Number);
      return [min, max];
    }
    return availablePriceRange;
  }, [activePriceParam, availablePriceRange]);

  // ── Banner dinámico ───────────────────────────────────────────────────────
  const bannerKey =
    activeBanner && BANNER_CONFIG[activeBanner]
      ? activeBanner
      : activeSeccion === 'Hogar'
        ? 'hogar'
        : 'default';
  const currentBanner = BANNER_CONFIG[bannerKey];

  // ── Handlers ─────────────────────────────────────────────────────────────
  const toggleAccordion = (field) =>
    setAccordions((prev) => ({ ...prev, [field]: !prev[field] }));

  const toggleFavorite = (id) =>
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));

  const updateUrlFilters = (newFilters) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('page', '1');
    Object.keys(newFilters).forEach((key) => {
      const val = newFilters[key];
      if (val === null || val === undefined || val === '' || (Array.isArray(val) && val.length === 0)) {
        nextParams.delete(key);
      } else if (Array.isArray(val)) {
        nextParams.set(key, val.join(','));
      } else {
        nextParams.set(key, String(val));
      }
    });
    setSearchParams(nextParams);
  };

  const handleCheckboxToggle = (list, item, urlKey) => {
    const nextList = list.includes(item)
      ? list.filter((x) => x !== item)
      : [...list, item];
    updateUrlFilters({ [urlKey]: nextList });
  };

  const removeFilterTag = (urlKey, item) => {
    if (urlKey === 'descuento' || urlKey === 'seccion' || urlKey === 'precio') {
      updateUrlFilters({ [urlKey]: null });
    } else {
      const current = searchParams.get(urlKey) ? searchParams.get(urlKey).split(',') : [];
      updateUrlFilters({ [urlKey]: current.filter((x) => x !== item) });
    }
  };

  const clearAllFilters = () => setSearchParams({ seccion: activeSeccion });

  // ── SEO ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    document.title = 'Marybe - Tienda Oficial & Catálogo';
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        'content',
        'Explorá nuestro catálogo de perfumes, maquillaje, coloración y más. Descuentos exclusivos y cuotas sin interés en Marybe.'
      );
    }
  }, []);

  // Scroll top al cambiar página o sección
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activePage, activeSeccion]);

  // ── Carga de metadatos de filtros ─────────────────────────────────────────
  useEffect(() => {
    async function fetchFilterMetadata() {
      try {
        const res = await fetch(`${STRAPI_URL}/api/productos?pagination[pageSize]=100&populate=*`);
        if (!res.ok) throw new Error('Error al cargar metadatos de filtros');
        const json = await res.json();

        const brands = new Set();
        const categories = new Set();
        const sizes = new Set();
        let globalMin = Infinity;
        let globalMax = -Infinity;

        json.data.forEach((p) => {
          const attrs = p.attributes || p;
          if (attrs.marca) brands.add(attrs.marca);
          if (attrs.categoria?.nombre) categories.add(attrs.categoria.nombre);
          if (attrs.variantes) {
            attrs.variantes.forEach((v) => { 
              if (v.volumen) sizes.add(v.volumen); 
              if (v.precio) {
                if (v.precio < globalMin) globalMin = v.precio;
                if (v.precio > globalMax) globalMax = v.precio;
              }
            });
          }
        });

        setAvailableBrands([...brands].sort());
        setAvailableCategories([...categories].sort());
        setAvailableSizes([...sizes].sort());
        if (globalMin !== Infinity && globalMax !== -Infinity) {
          setAvailablePriceRange([globalMin, globalMax]);
        }
      } catch (err) {
        console.error('Error fetching filters data:', err);
      }
    }
    fetchFilterMetadata();
  }, []);

  // ── Fetch productos ───────────────────────────────────────────────────────
  const fetchProductos = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set('pagination[page]', activePage);
      params.set('pagination[pageSize]', PAGE_SIZE);
      params.set('populate', '*');

      if (activeSort === 'precio:asc') {
        params.set('sort[0]', 'variantes.precio:asc');
      } else if (activeSort === 'precio:desc') {
        params.set('sort[0]', 'variantes.precio:desc');
      } else {
        const [field, dir] = activeSort.split(':');
        params.set('sort[0]', `${field}:${dir}`);
      }

      if (activeSeccion) params.set('filters[seccion][$eq]', activeSeccion);

      if (activeDescuento) {
        if (activeDescuento === 'todas') {
          params.set('filters[descuento][$gt]', 0);
        } else {
          params.set('filters[descuento][$lte]', Number(activeDescuento));
          params.set('filters[descuento][$gt]', 0);
        }
      }

      activeBrands.forEach((brand, idx) => params.set(`filters[marca][$in][${idx}]`, brand));
      activeCategories.forEach((cat, idx) => params.set(`filters[categoria][nombre][$in][${idx}]`, cat));
      activeSizes.forEach((sz, idx) => params.set(`filters[variantes][volumen][$in][${idx}]`, sz));

      if (activePriceParam) {
        params.set('filters[variantes][precio][$gte]', activePrice[0]);
        params.set('filters[variantes][precio][$lte]', activePrice[1]);
      }

      const res = await fetch(`${STRAPI_URL}/api/productos?${params.toString()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);

      const json = await res.json();
      setProductos(json.data || []);
      setTotal(json.meta?.pagination?.total || 0);
    } catch (err) {
      console.error('[Catalogo] Error fetching products:', err);
      setError('No se pudieron obtener los productos de la tienda. Asegurate de que el backend esté encendido.');
      setProductos([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [activePage, activeSort, activeDescuento, activeSeccion, activeBrands, activeCategories, activeSizes]);

  useEffect(() => {
    fetchProductos();
  }, [fetchProductos]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <PageContainer>
      {/* Breadcrumb */}
      <CatalogoBreadcrumb
        activeSeccion={activeSeccion}
        activeBanner={activeBanner}
        activeDescuento={activeDescuento}
        currentBannerTitle={currentBanner?.breadcrumbTitle || currentBanner?.title}
        onGoToSeccion={() => updateUrlFilters({ banner: null })}
      />

      {/* Banner dinámico */}
      <CatalogoBanner
        currentBanner={currentBanner}
        onPillClick={() => updateUrlFilters({ seccion: activeSeccion })}
      />

      {/* Layout principal */}
      <MainContent>
        {/* Sidebar de filtros */}
        <CatalogoSidebar
          mobileOpen={mobileFiltersOpen}
          onCloseMobile={() => setMobileFiltersOpen(false)}
          availableCategories={availableCategories}
          availableBrands={availableBrands}
          availableSizes={availableSizes}
          availablePriceRange={availablePriceRange}
          activeCategories={activeCategories}
          activeBrands={activeBrands}
          activeSizes={activeSizes}
          activePrice={activePrice}
          activePriceParam={activePriceParam}
          activeSeccion={activeSeccion}
          activeDescuento={activeDescuento}
          accordions={accordions}
          onToggleAccordion={toggleAccordion}
          onCheckboxToggle={handleCheckboxToggle}
          onDescuentoChange={(val) => updateUrlFilters({ descuento: val, page: 1 })}
          onPriceChange={(val) => updateUrlFilters({ precio: `${val[0]}-${val[1]}`, page: 1 })}
          onRemoveTag={removeFilterTag}
          onClearAll={clearAllFilters}
          onSubmit={fetchProductos}
          total={total}
        />

        {/* Área principal */}
        <MainGridArea>
          <CatalogoControlsBar
            activeSeccion={activeSeccion}
            loading={loading}
            total={total}
            activeSort={activeSort}
            onSortChange={(val) => updateUrlFilters({ orden: val })}
            onToggleMobileFilters={() => setMobileFiltersOpen(true)}
          />

          <CatalogoProductGrid
            productos={productos}
            loading={loading}
            error={error}
            pageSize={PAGE_SIZE}
            strapiUrl={STRAPI_URL}
            favorites={favorites}
            onToggleFav={toggleFavorite}
            onClearAll={clearAllFilters}
            onRetry={fetchProductos}
            activePage={activePage}
            totalPages={totalPages}
            onChangePage={(p) => updateUrlFilters({ page: p })}
          />
        </MainGridArea>
      </MainContent>
    </PageContainer>
  );
}
