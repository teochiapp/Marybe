import React, { useState, useEffect, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { useSearchParams } from 'react-router-dom';

// ─── Componentes del Catálogo ─────────────────────────────────────────────────
import CatalogoBreadcrumb from '../../components/tienda/catalogo/CatalogoBreadcrumb';
import CatalogoBanner from '../../components/tienda/catalogo/CatalogoBanner';
import CatalogoSidebar from '../../components/tienda/catalogo/CatalogoSidebar';
import CatalogoControlsBar from '../../components/tienda/catalogo/CatalogoControlsBar';
import CatalogoProductGrid from '../../components/tienda/catalogo/CatalogoProductGrid';
import { FadeIn, FadeInLeft } from '../../components/animations/ScrollAnimations';

// ─── Constantes ───────────────────────────────────────────────────────────────

const STRAPI_URL = process.env.REACT_APP_STRAPI_URL || 'http://localhost:1337';
const PAGE_SIZE = 12;

const BANNER_CONFIG = {
  elixir: {
    title: <>El poder del<br />elixir</>,
    breadcrumbTitle: 'El poder del elixir',
    subtitle: 'Descubrí fragancias cautivadoras y sofisticadas con hasta 40% de descuento',
    pills: ['Olympea Elixir', 'Invictus Elixir'],
    image: '/inicio/elixir.webp',
    imageAlt: 'Elixir Perfumes',
  },
  azzaro: {
    title: 'Toda la línea de Azzaro',
    subtitle: 'Elegancia y modernidad en cada fragancia. Descubrí la colección completa.',
    pills: ['Chrome', 'Wanted'],
    image: '/inicio/azzaro.webp',
    imageAlt: 'Línea Azzaro',
  },
  hogar: {
    title: 'Tu espacio, tu hogar',
    subtitle: 'Calidez, diseño y aromas para ambientar cada rincón de tu hogar.',
    pills: ['Aromatizantes', 'Velas'],
    image: '/inicio/discountedSectionHogar.webp',
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
  background-color: var(--color-blanco);
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

const SearchResultHeader = styled.div`
  max-width: 1400px;
  margin: 0 auto 8px;

  h1 {
    font-family: var(--font-family-primary);
    font-size: 2rem;
    color: var(--color-marron-tercero);
    font-weight: 600;
    display: flex;
    align-items: baseline;
    gap: 12px;
    flex-wrap: wrap;

    @media (max-width: 600px) {
      font-size: 1.4rem;
    }
  }

  .result-count {
    font-family: var(--font-family-secondary);
    font-size: 0.9rem;
    color: #9A8F87;
    font-weight: 400;
  }
`;

// ─── Componente Principal ────────────────────────────────────────────────────

export default function Catalogo() {
  const [searchParams, setSearchParams] = useSearchParams();

  // ── Estado ────────────────────────────────────────────────────────────────
  const [productos, setProductos] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  const [availableBrands, setAvailableBrands] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [availableSizes, setAvailableSizes] = useState([]);
  const [availablePriceRange, setAvailablePriceRange] = useState([0, 200000]);


  const [accordions, setAccordions] = useState({
    marca: false,
    tamano: false,
    categoria: false,
    ofertas: false,
    precio: false,
  });

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [dynamicBannerImg, setDynamicBannerImg] = useState(null);

  // ── Lectura de URL params ─────────────────────────────────────────────────
  const [activePage, setActivePage] = useState(1);
  const activeSort = searchParams.get('orden') || 'nombre:asc';
  const activeBusqueda = searchParams.get('busqueda') || '';
  const activeDescuentos = useMemo(
    () => (searchParams.get('descuento') ? searchParams.get('descuento').split(',') : []),
    [searchParams]
  );
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

  let currentBanner = { ...BANNER_CONFIG[bannerKey] };

  if (activeSeccion === 'Hogar') {
    currentBanner.bgColor = 'var(--color-hogar)';
  }

  if (!activeBanner && activeCategories.length === 1) {
    const catName = activeCategories[0];
    currentBanner = {
      ...currentBanner,
      title: catName,
      subtitle: `Descubrí nuestra selección exclusiva de ${catName.toLowerCase()} con las mejores ofertas y lanzamientos.`,
      pills: ['Más relevantes', 'Novedades'],
      image: dynamicBannerImg || currentBanner.image,
    };
  }

  // Fetch imagen de categoría dinámica
  useEffect(() => {
    if (activeCategories.length === 1) {
      const catName = activeCategories[0];
      fetch(`${STRAPI_URL}/api/categorias?filters[nombre][$eq]=${encodeURIComponent(catName)}&populate=portada`)
        .then(res => res.json())
        .then(data => {
          if (data?.data?.[0]) {
            const attrs = data.data[0].attributes || data.data[0];
            let imgUrl = null;
            if (attrs.portada?.data?.attributes?.url) {
              imgUrl = `${STRAPI_URL}${attrs.portada.data.attributes.url}`;
            } else if (attrs.portada?.url) {
              imgUrl = `${STRAPI_URL}${attrs.portada.url}`;
            }
            setDynamicBannerImg(imgUrl);
          } else {
            setDynamicBannerImg(null);
          }
        })
        .catch(console.error);
    } else {
      setDynamicBannerImg(null);
    }
  }, [activeCategories]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const toggleAccordion = (field) =>
    setAccordions((prev) => ({ ...prev, [field]: !prev[field] }));


  const updateUrlFilters = (newFilters) => {
    const nextParams = new URLSearchParams(searchParams);
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
    setActivePage(1);
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

  const clearAllFilters = () => {
    setSearchParams({ seccion: activeSeccion });
    setActivePage(1);
  };

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

  // Scroll top al cambiar sección o aplicar filtros
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [searchParams]);

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
          if (attrs.variantes && attrs.variantes.length > 0) {
            attrs.variantes.forEach((v) => {
              if (v.volumen) sizes.add(v.volumen);
              if (v.precio) {
                const effectivePrice = v.precio_oferta || v.precio;
                if (effectivePrice < globalMin) globalMin = effectivePrice;
                if (effectivePrice > globalMax) globalMax = effectivePrice;
              }
            });
          } else if (attrs.precio) {
            // Producto sin variantes: usar precio del producto
            const effectivePrice = attrs.precio_oferta || attrs.precio;
            if (effectivePrice < globalMin) globalMin = effectivePrice;
            if (effectivePrice > globalMax) globalMax = effectivePrice;
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
    if (activePage === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
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

      if (activeBusqueda) {
        params.set('filters[nombre][$containsi]', activeBusqueda);
      } else if (activeSeccion) {
        params.set('filters[seccion][$eq]', activeSeccion);
      }

      if (activeDescuentos.length > 0) {
        if (activeDescuentos.includes('todas')) {
          // Cualquier producto con descuento mayor a 0
          params.set('filters[descuento][$gt]', 0);
        } else {
          // Tomamos el valor más alto seleccionado como tope máximo.
          // Así "Hasta 20%" devuelve productos con descuento ≤ 20
          // (incluye 10%, 15%, 18%, 20%, etc.)
          const maxDescuento = Math.max(...activeDescuentos.map(Number));
          params.set('filters[descuento][$gt]', 0);          // solo con algún descuento
          params.set('filters[descuento][$lte]', maxDescuento); // hasta el tope elegido
        }
      }

      activeBrands.forEach((brand, idx) => params.set(`filters[marca][$in][${idx}]`, brand));
      activeCategories.forEach((cat, idx) => params.set(`filters[categoria][nombre][$in][${idx}]`, cat));
      activeSizes.forEach((sz, idx) => params.set(`filters[variantes][volumen][$in][${idx}]`, sz));

      if (activePriceParam) {
        // Filtrar donde: (precio_oferta está en rango) O (precio_oferta es nulo Y precio normal está en rango)
        params.set('filters[$or][0][variantes][precio_oferta][$gte]', activePrice[0]);
        params.set('filters[$or][0][variantes][precio_oferta][$lte]', activePrice[1]);
        
        params.set('filters[$or][1][$and][0][variantes][precio_oferta][$null]', true);
        params.set('filters[$or][1][$and][1][variantes][precio][$gte]', activePrice[0]);
        params.set('filters[$or][1][$and][2][variantes][precio][$lte]', activePrice[1]);
      }

      const res = await fetch(`${STRAPI_URL}/api/productos?${params.toString()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);

      const json = await res.json();

      if (activePage === 1) {
        setProductos(json.data || []);
      } else {
        setProductos(prev => {
          const newItems = json.data || [];
          const prevIds = new Set(prev.map(p => p.id || p.documentId));
          const filteredNew = newItems.filter(p => !prevIds.has(p.id || p.documentId));
          return [...prev, ...filteredNew];
        });
      }
      setTotal(json.meta?.pagination?.total || 0);
    } catch (err) {
      console.error('[Catalogo] Error fetching products:', err);
      setError('No se pudieron obtener los productos de la tienda. Asegurate de que el backend esté encendido.');
      if (activePage === 1) setProductos([]);
      if (activePage === 1) setTotal(0);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [activePage, activeSort, activeBusqueda, activeDescuentos, activeSeccion, activeBrands, activeCategories, activeSizes, activePrice, activePriceParam]);

  useEffect(() => {
    fetchProductos();
  }, [fetchProductos]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <PageContainer>
      {/* Título resultado de búsqueda */}
      {activeBusqueda && !loading && total > 0 && (
        <SearchResultHeader>
          <h1>
            {activeBusqueda}
            <span className="result-count">{total} resultado{total !== 1 ? 's' : ''} encontrado{total !== 1 ? 's' : ''}</span>
          </h1>
        </SearchResultHeader>
      )}

      {/* Breadcrumb — ocultar en búsqueda */}
      {!activeBusqueda && (
        <FadeIn>
          <CatalogoBreadcrumb
            activeSeccion={activeSeccion}
            activeBanner={activeBanner}
            activeDescuento={activeDescuentos}
            currentBannerTitle={currentBanner?.breadcrumbTitle || currentBanner?.title}
            onGoToSeccion={() => updateUrlFilters({ banner: null })}
          />
        </FadeIn>
      )}

      {/* Banner dinámico — ocultar en búsqueda */}
      {!activeBusqueda && (
        <FadeIn delay={0.1}>
          <CatalogoBanner
            currentBanner={currentBanner}
            onPillClick={() => updateUrlFilters({ seccion: activeSeccion })}
          />
        </FadeIn>
      )}

      {/* Layout principal */}
      <MainContent>
        {/* Sidebar de filtros */}
        <FadeInLeft delay={0.2}>
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
            activeDescuento={activeDescuentos}
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
        </FadeInLeft>

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
            loadingMore={loadingMore}
            error={error}
            pageSize={PAGE_SIZE}
            strapiUrl={STRAPI_URL}
            onClearAll={clearAllFilters}
            onRetry={fetchProductos}
            activePage={activePage}
            totalPages={totalPages}
            onLoadMore={() => setActivePage(prev => prev + 1)}
            activeBusqueda={activeBusqueda}
          />
        </MainGridArea>
      </MainContent>
    </PageContainer>
  );
}
