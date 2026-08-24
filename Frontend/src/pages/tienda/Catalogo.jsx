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
  const [availablePriceRange, setAvailablePriceRange] = useState([0, 5000000]);


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
  const activeSeccion = searchParams.get('seccion') || '';
  const activeBanner = searchParams.get('banner') || '';

  const activeBrands = useMemo(
    () => (searchParams.get('marca') ? searchParams.get('marca').split(',') : []),
    [searchParams]
  );
  // Lectura separada por nivel jerárquico para filtrado correcto
  const activeCatParam      = searchParams.get('categoria')    || '';
  const activeSubcatParam   = searchParams.get('subcategoria') || '';
  const activeTipoParam     = searchParams.get('tipo')         || '';

  // activeCategories sigue siendo usado por Sidebar/Breadcrumb para UI (array combinado)
  const activeCategories = useMemo(() => {
    const cats   = activeCatParam    ? activeCatParam.split(',')    : [];
    const subcats = activeSubcatParam ? activeSubcatParam.split(',') : [];
    const tipos   = activeTipoParam   ? activeTipoParam.split(',')   : [];
    return Array.from(new Set([...cats, ...subcats, ...tipos]));
  }, [activeCatParam, activeSubcatParam, activeTipoParam]);
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

  // Título del banner: jerarquía Tipo > Subcategoría > Categoría
  if (!activeBanner) {
    const bannerLabel = activeTipoParam
      ? activeTipoParam.split(',')[0]
      : activeSubcatParam
        ? activeSubcatParam.split(',')[0]
        : activeCatParam
          ? activeCatParam.split(',')[0]
          : null;

    if (bannerLabel) {
      currentBanner = {
        ...currentBanner,
        title: bannerLabel,
        breadcrumbTitle: bannerLabel,
        subtitle: `Descubrí nuestra selección exclusiva de ${bannerLabel.toLowerCase()} con las mejores ofertas y lanzamientos.`,
        pills: ['Más relevantes', 'Novedades'],
        image: dynamicBannerImg || currentBanner.image,
      };
    }
  }

  // Fetch imagen de categoría dinámica
  useEffect(() => {
    if (activeCategories.length === 1) {
      const catName = activeCategories[0];
      let fetchUrl = `${STRAPI_URL}/api/categorias?filters[nombre][$eq]=${encodeURIComponent(catName)}&populate=portada`;
      if (activeSeccion) {
        fetchUrl += `&filters[seccion][$eq]=${encodeURIComponent(activeSeccion)}`;
      }
      
      fetch(fetchUrl)
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
  }, [activeCategories, activeSeccion]);

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

  // ── SEO: título dinámico según categoría/subcategoría/tipo activo ─────────
  useEffect(() => {
    // Determinar el nivel más específico activo para el título
    const activeLabel = activeTipoParam
      ? activeTipoParam.split(',')[0]
      : activeSubcatParam
        ? activeSubcatParam.split(',')[0]
        : activeCatParam
          ? activeCatParam.split(',')[0]
          : activeBusqueda
            ? activeBusqueda
            : null;

    document.title = activeLabel
      ? `Marybe - ${activeLabel}`
      : 'Marybe - Tienda Oficial & Catálogo';

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        'content',
        activeLabel
          ? `Explorá ${activeLabel.toLowerCase()} en Marybe. Descuentos exclusivos y cuotas sin interés.`
          : 'Explorá nuestro catálogo de perfumes, maquillaje, coloración y más. Descuentos exclusivos y cuotas sin interés en Marybe.'
      );
    }
  }, [activeCatParam, activeSubcatParam, activeTipoParam, activeBusqueda]);

  // Scroll top al cambiar sección o aplicar filtros
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [searchParams]);

  // ── Carga de metadatos de filtros ─────────────────────────────────────────
  useEffect(() => {
    async function fetchFilterMetadata() {
      try {
        const brands = new Set();
        const categories = new Set();
        const sizes = new Set();
        let globalMin = Infinity;
        let globalMax = -Infinity;

        let page = 1;
        let hasMore = true;

        while (hasMore) {
          const res = await fetch(`${STRAPI_URL}/api/productos?pagination[page]=${page}&pagination[pageSize]=100&populate=*`);
          if (!res.ok) throw new Error('Error al cargar metadatos de filtros');
          const json = await res.json();

          if (!json.data || json.data.length === 0) {
            hasMore = false;
            break;
          }

          for (const p of json.data) {
            const attrs = p.attributes || p;
            if (attrs.marca) brands.add(attrs.marca);
            if (attrs.categoria?.nombre) categories.add(attrs.categoria.nombre);
            if (attrs.variantes && attrs.variantes.length > 0) {
              for (const v of attrs.variantes) {
                if (v.volumen && /\d/.test(v.volumen)) sizes.add(v.volumen);
                if (v.precio) {
                  const effectivePrice = v.precio_oferta || v.precio;
                  if (Math.floor(effectivePrice) < globalMin) globalMin = Math.floor(effectivePrice);
                  if (Math.ceil(effectivePrice) > globalMax) globalMax = Math.ceil(effectivePrice);
                }
              }
            } else if (attrs.precio) {
              // Producto sin variantes: usar precio del producto
              const effectivePrice = attrs.precio_oferta || attrs.precio;
              if (Math.floor(effectivePrice) < globalMin) globalMin = Math.floor(effectivePrice);
              if (Math.ceil(effectivePrice) > globalMax) globalMax = Math.ceil(effectivePrice);
            }
          }

          const pageCount = json.meta?.pagination?.pageCount || 1;
          if (page >= pageCount) {
            hasMore = false;
          } else {
            page++;
          }
        }

        setAvailableBrands([...brands].sort());
        setAvailableCategories([...categories].sort());
        setAvailableSizes([...sizes].sort());
        if (globalMin !== Infinity && globalMax !== -Infinity) {
          setAvailablePriceRange([Math.floor(globalMin), Math.ceil(globalMax)]);
        }
      } catch (err) {
        console.error('Error fetching filters data:', err);
      }
    }
    fetchFilterMetadata();
  }, []);

  // -- Marcas reactivas al nivel activo (tipo > subcategora > categora > seccin) --
  useEffect(() => {
    async function fetchDynamicFilters() {
      try {
        const params = new URLSearchParams();
        params.set('pagination[pageSize]', '500');
        // Queremos marca del producto base y las variantes para obtener los volumenes
        params.set('populate', 'variantes');

        if (activeTipoParam) {
          activeTipoParam.split(',').forEach((t, i) =>
            params.set(`filters[$or][${i}][tipo][$eq]`, t));
        } else if (activeSubcatParam) {
          activeSubcatParam.split(',').forEach((s, i) =>
            params.set(`filters[$or][${i}][subcategoria][$eq]`, s));
        } else if (activeCatParam) {
          activeCatParam.split(',').forEach((c, i) =>
            params.set(`filters[$or][${i}][categoria][nombre][$eq]`, c));
        } else if (activeSeccion) {
          params.set('filters[seccion][$eq]', activeSeccion);
        }

        const res = await fetch(`${STRAPI_URL}/api/productos?${params.toString()}`);
        const json = await res.json();
        
        const brands = new Set();
        const sizes = new Set();
        
        (json.data || []).forEach(p => {
          const attrs = p.attributes || p;
          if (attrs.marca) brands.add(attrs.marca);
          if (attrs.variantes) {
            attrs.variantes.forEach(v => {
              // Filtrar solo tamaños reales (que contengan al menos un número), eliminando colores
              if (v.volumen && /\d/.test(v.volumen)) {
                sizes.add(v.volumen);
              }
            });
          }
        });

        setAvailableBrands([...brands].sort());
        setAvailableSizes([...sizes].sort());
      } catch (err) {
        console.warn('[Catalogo] Error fetching dynamic filters:', err.message);
      }
    }
    fetchDynamicFilters();
  }, [activeCatParam, activeSubcatParam, activeTipoParam, activeSeccion]);

  // ── Fetch productos ───────────────────────────────────────────────────────
  const fetchProductos = useCallback(async () => {
    if (activePage === 1) {
      setLoading(true);
      // Limpiar productos al cambiar filtros para no mostrar resultados anteriores
      setProductos([]);
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
        params.set('sort[0]', 'precio:asc');
      } else if (activeSort === 'precio:desc') {
        params.set('sort[0]', 'precio:desc');
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
          params.set('filters[descuento][$gt]', 0);
        } else {
          const maxDescuento = Math.max(...activeDescuentos.map(Number));
          params.set('filters[descuento][$gt]', 0);
          params.set('filters[descuento][$lte]', maxDescuento);
        }
      }

      activeBrands.forEach((brand, idx) => params.set(`filters[marca][$in][${idx}]`, brand));
      activeSizes.forEach((sz, idx) => params.set(`filters[variantes][volumen][$in][${idx}]`, sz));

      let andIndex = 0;

      // ── Filtro jerárquico por categoría / subcategoría / tipo ──────────────
      // Jerarquía: Categoría > Subcategoría > Tipo
      //
      // Si hay ?tipo=X        → filtrar SOLO productos con tipo = X
      // Si hay ?subcategoria=Y (sin tipo) → filtrar productos con subcategoria = Y
      //                                     O con tipo que pertenece a esa subcategoría
      //                                     (Strapi: campo tipo puede existir como sub-nivel)
      // Si hay ?categoria=Z (sin subcat ni tipo) → filtrar productos con categoría = Z
      //                                            (incluye todos sus niveles inferiores)
      //
      // El campo real en Strapi para productos puede ser:
      //   - categoria (relación o string)
      //   - subcategoria (string)
      //   - tipo (string)

      if (activeTipoParam) {
        const tipos = activeTipoParam.split(',');
        tipos.forEach((tipo, idx) => {
          params.set(`filters[$and][${andIndex}][$or][${idx}][tipo][$eq]`, tipo);
        });
        andIndex++;
      }
      if (activeSubcatParam) {
        const subcats = activeSubcatParam.split(',');
        subcats.forEach((subcat, idx) => {
          params.set(`filters[$and][${andIndex}][$or][${idx}][subcategoria][$eq]`, subcat);
        });
        andIndex++;
      }
      if (activeCatParam) {
        const cats = activeCatParam.split(',');
        cats.forEach((cat, idx) => {
          params.set(`filters[$and][${andIndex}][$or][${idx}][categoria][nombre][$eq]`, cat);
        });
        andIndex++;
      }

      if (activePriceParam) {
          // Filtro optimizado con denormalización de precios
          params.set(`filters[$and][${andIndex}][precio_minimo_calculado][$lte]`, activePrice[1]);
          params.set(`filters[$and][${andIndex}][precio_maximo_calculado][$gte]`, activePrice[0]);
          andIndex++;
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
  }, [activePage, activeSort, activeBusqueda, activeDescuentos, activeSeccion, activeBrands, activeSizes, activePrice, activePriceParam, activeCatParam, activeSubcatParam, activeTipoParam]);

  useEffect(() => {
    fetchProductos();
  }, [fetchProductos]);

  const totalPages = Math.ceil(total / PAGE_SIZE);


  // Handlers de drill-down de categorias
  const handleSelectCategory = (nombre) => updateUrlFilters({ categoria: nombre, subcategoria: null, tipo: null });
  const handleSelectSubcategory = (nombre) => updateUrlFilters({ subcategoria: nombre, tipo: null });
  const handleSelectTipo = (nombre) => updateUrlFilters({ tipo: nombre });
  const handleClearCategory = () => updateUrlFilters({ categoria: null, subcategoria: null, tipo: null });

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
            onGoToSeccion={() => updateUrlFilters({ banner: null, descuento: null, categoria: null, subcategoria: null, tipo: null, marca: null, tamano: null, precio: null })}

            onCategoryClick={(idx) => {
              const nextCats = activeCategories.slice(0, idx + 1);
              updateUrlFilters({ 
                categoria: nextCats.length > 0 ? nextCats.join(',') : null, 
                subcategoria: null, 
                tipo: null 
              });
            }}
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
            activeCatParam={activeCatParam}
            activeSubcatParam={activeSubcatParam}
            activeTipoParam={activeTipoParam}
            onSelectCategory={handleSelectCategory}
            onSelectSubcategory={handleSelectSubcategory}
            onSelectTipo={handleSelectTipo}
            onClearCategory={handleClearCategory}
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
