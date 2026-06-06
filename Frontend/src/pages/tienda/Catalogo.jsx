import React, { useState, useEffect, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { useSearchParams } from 'react-router-dom';

const STRAPI_URL = process.env.REACT_APP_STRAPI_URL || 'http://localhost:1337';
const PAGE_SIZE = 12;

// ─── Styled Components ───────────────────────────────────────────────────────

const PageContainer = styled.div`
  min-height: 100vh;
  background-color: #FAF9F7;
  color: #28180B;
  padding: 40px 60px;
  font-family: var(--font-family-secondary);

  @media (max-width: 1024px) {
    padding: 30px 20px;
  }
`;

/* Banner de Oferta Top */
const TopBanner = styled.div`
  width: 100%;
  max-width: 1400px;
  margin: 0 auto 40px auto;
  background: linear-gradient(135deg, #280101 0%, #160000 50%, #3e0102 100%);
  border-radius: 24px;
  padding: 40px 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  overflow: hidden;
  min-height: 240px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -20%;
    width: 60%;
    height: 200%;
    background: radial-gradient(circle, rgba(242, 220, 143, 0.08) 0%, transparent 70%);
    pointer-events: none;
  }

  @media (max-width: 900px) {
    flex-direction: column;
    text-align: center;
    padding: 30px 24px;
    gap: 30px;
  }
`;

const BannerTextContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: 2;
  max-width: 50%;

  @media (max-width: 900px) {
    max-width: 100%;
    align-items: center;
  }
`;

const BannerTitle = styled.h2`
  font-family: var(--font-family-primary);
  font-size: 3.5rem;
  font-weight: 700;
  color: var(--color-titulo-marybe);
  margin: 0;
  line-height: 1.1;
  font-style: italic;

  @media (max-width: 600px) {
    font-size: 2.5rem;
  }
`;

const BannerSubtitle = styled.p`
  font-size: 1.1rem;
  color: var(--color-rosa-tercero);
  margin: 0;
  font-weight: 400;
`;

const BannerActions = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 10px;
  z-index: 2;

  @media (max-width: 900px) {
    justify-content: center;
  }
`;

const BannerPill = styled.button`
  background-color: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 10px 24px;
  border-radius: var(--radius-full);
  font-weight: 500;
  font-size: 0.9rem;
  transition: all 0.2s ease;

  &:hover {
    background-color: var(--color-titulo-marybe);
    color: var(--color-marron-tercero);
    border-color: var(--color-titulo-marybe);
    transform: translateY(-2px);
  }
`;

const BannerImageWrapper = styled.div`
  width: 40%;
  height: 220px;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  z-index: 1;

  img {
    max-height: 120%;
    object-fit: contain;
    filter: drop-shadow(0 15px 20px rgba(0, 0, 0, 0.45));
    transform: translateY(15px);
  }

  @media (max-width: 900px) {
    width: 80%;
    height: 180px;
    img {
      transform: translateY(0);
    }
  }
`;

/* Layout principal */
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

/* Sidebar y Filtros */
const Sidebar = styled.aside`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const FilterCard = styled.div`
  background-color: white;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
  border: 1px solid #ECE9E4;
`;

const SidebarTitle = styled.h3`
  font-family: var(--font-family-secondary);
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-marron-principal);
  margin-bottom: 20px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ActiveFiltersWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
`;

const FilterTagsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const FilterTag = styled.span`
  background-color: #FAF4EE;
  color: var(--color-bordo-secundario);
  padding: 6px 12px;
  border-radius: var(--radius-full);
  font-size: 0.8rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1px solid rgba(124, 4, 5, 0.1);

  button {
    font-size: 0.9rem;
    font-weight: bold;
    color: var(--color-bordo-secundario);
    line-height: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;

    &:hover {
      color: var(--color-marron-principal);
    }
  }
`;

const ClearAllBtn = styled.button`
  align-self: flex-start;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-bordo-secundario);
  text-decoration: underline;
  transition: color 0.15s;

  &:hover {
    color: var(--color-marron-principal);
  }
`;

const AccordionItem = styled.div`
  border-top: 1px solid #ECE9E4;
  padding: 20px 0;

  &:last-child {
    padding-bottom: 0;
  }
`;

const AccordionHeader = styled.button`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.95rem;
  font-weight: 600;
  color: #28180B;
  text-align: left;
  cursor: pointer;
`;

const AccordionChevron = styled.span`
  font-size: 0.8rem;
  transition: transform 0.2s;
  transform: ${({ $open }) => ($open ? 'rotate(180deg)' : 'rotate(0deg)')};
  opacity: 0.6;
`;

const AccordionContent = styled.div`
  margin-top: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: ${({ $open }) => ($open ? '250px' : '0')};
  overflow-y: auto;
  transition: max-height 0.3s ease, margin-top 0.3s ease;

  &::-webkit-scrollbar {
    width: 4px;
  }
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.9rem;
  font-weight: 400;
  color: #535353;
  cursor: pointer;
  user-select: none;

  input {
    appearance: none;
    width: 18px;
    height: 18px;
    border: 1px solid #C4C4C4;
    border-radius: 4px;
    outline: none;
    cursor: pointer;
    position: relative;
    background-color: white;
    transition: all 0.2s ease;

    &:checked {
      background-color: var(--color-bordo-secundario);
      border-color: var(--color-bordo-secundario);

      &::after {
        content: '✓';
        position: absolute;
        color: white;
        font-size: 0.75rem;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-weight: bold;
      }
    }

    &:hover {
      border-color: var(--color-bordo-secundario);
    }
  }

  &:hover {
    color: black;
  }
`;

const SidebarSubmitBtn = styled.button`
  width: 100%;
  background-color: var(--color-marron-principal);
  color: white;
  border-radius: 12px;
  padding: 14px;
  font-weight: 600;
  font-size: 0.95rem;
  margin-top: 10px;
  transition: background-color 0.2s;
  text-align: center;
  box-shadow: 0 4px 12px rgba(62, 1, 2, 0.1);

  &:hover {
    background-color: var(--color-bordo-secundario);
  }
`;

/* Grilla y Controles */
const MainGridArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const ControlsBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;

  h1 {
    font-size: 1.8rem;
    color: var(--color-marron-principal);
    margin: 0;
    font-weight: 700;
  }

  p {
    font-size: 0.9rem;
    color: #7A7A7A;
    margin: 0;
  }
`;

const SortDropdown = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;

  label {
    font-size: 0.9rem;
    font-weight: 600;
    color: #535353;
  }

  select {
    background-color: white;
    border: 1px solid #ECE9E4;
    border-radius: 10px;
    padding: 8px 16px;
    font-size: 0.9rem;
    font-weight: 500;
    color: #28180B;
    cursor: pointer;
    outline: none;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.01);

    &:focus {
      border-color: var(--color-bordo-secundario);
    }
  }
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 30px;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
`;

/* Card de Producto */
const ProductCard = styled.div`
  background-color: white;
  border-radius: 24px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  position: relative;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.02);
  border: 1px solid #ECE9E4;

  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.07);
  }
`;

const CardImageContainer = styled.div`
  width: 100%;
  height: 230px;
  background-color: #fff;
  border-radius: var(--radius-md);
  margin-bottom: 15px;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  position: relative;

  img.product-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    transition: transform 0.4s ease;
  }

  ${ProductCard}:hover img.product-img {
    transform: scale(1.05);
  }
`;

const StampOverlay = styled.img`
  position: absolute;
  top: 10px;
  left: 10px;
  width: 44px;
  height: 44px;
  object-fit: contain;
  z-index: 2;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.12));
`;

const LeftTopTag = styled.span`
  position: absolute;
  top: 10px;
  left: 10px;
  background-color: ${({ $bg }) => $bg || '#FAF0F0'};
  color: ${({ $color }) => $color || 'var(--color-bordo-secundario)'};
  font-size: 0.7rem;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 6px;
  z-index: 2;
  text-transform: uppercase;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
`;

const HeartContainer = styled.div`
  position: absolute;
  top: 15px;
  right: 15px;
  z-index: 2;
`;

const HeartIcon = styled.button`
  background-color: white;
  border: 1px solid #ECE9E4;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  cursor: pointer;
  color: ${({ $fav }) => ($fav ? 'var(--color-bordo-secundario)' : '#BDBDBD')};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.03);

  svg {
    width: 18px;
    height: 18px;
    fill: ${({ $fav }) => ($fav ? 'var(--color-bordo-secundario)' : 'none')};
    stroke: currentColor;
    stroke-width: 2;
    transition: transform 0.2s ease;
  }

  &:hover {
    transform: scale(1.08);
    color: var(--color-bordo-secundario);
    border-color: var(--color-bordo-secundario);
    svg {
      transform: scale(1.1);
    }
  }
`;

const ProductBrand = styled.div`
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--color-marron-secundario);
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin-bottom: 8px;
`;

const ProductName = styled.h4`
  font-size: 0.95rem;
  color: black;
  font-family: var(--font-family-secondary);
  font-weight: 500;
  margin: 0 0 10px 0;
  line-height: 1.3;
  height: 2.6em;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const PriceRow = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  column-gap: 8px;
  row-gap: 2px;
  margin-bottom: 4px;
`;

const OldPrice = styled.span`
  font-size: 0.85rem;
  color: #a0a0a0;
  text-decoration: line-through;
`;

const CurrentPrice = styled.span`
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-bordo-secundario);
`;

const LocalDiscountBadge = styled.span`
  background-color: var(--color-bordo-secundario);
  color: white;
  font-size: 0.65rem;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: bold;
`;

const Installments = styled.div`
  font-size: 0.8rem;
  color: #535353;
  margin-bottom: 6px;
  font-weight: 600;
`;

const LegalText = styled.div`
  font-size: 0.65rem;
  color: #b0b0b0;
  margin-bottom: 20px;
  font-weight: 400;
`;

const AddButton = styled.button`
  width: 100%;
  background-color: var(--color-marron-cuarto);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 12px 20px;
  font-weight: 500;
  font-size: 0.9rem;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  transition: background-color 0.2s;
  margin-top: auto;

  &:hover {
    background-color: var(--color-marron-principal);
  }

  svg {
    width: 16px;
    height: 16px;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.8;
  }
`;

/* Skeleton Card */
const SkeletonCard = styled.div`
  background-color: white;
  border-radius: 24px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  border: 1px solid #ECE9E4;
`;

const SkeletonBox = styled.div`
  background: linear-gradient(90deg, #f2f0eb 25%, #eae7e0 50%, #f2f0eb 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: ${({ $radius }) => $radius || '4px'};
  width: ${({ $width }) => $width || '100%'};
  height: ${({ $height }) => $height || '20px'};

  @keyframes loading {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
`;

/* Paginacion */
const PaginationRow = styled.nav`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 40px;
  flex-wrap: wrap;
`;

const PageBtn = styled.button`
  background-color: ${({ $active }) => ($active ? 'var(--color-bordo-secundario)' : 'white')};
  color: ${({ $active }) => ($active ? 'white' : '#28180B')};
  border: 1px solid #ECE9E4;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    border-color: var(--color-bordo-secundario);
    background-color: ${({ $active }) => ($active ? 'var(--color-bordo-secundario)' : '#FAF4EE')};
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

const PageArrowBtn = styled(PageBtn)`
  width: auto;
  padding: 0 16px;
`;

const PageInfo = styled.span`
  font-size: 0.9rem;
  color: #7a7a7a;
  margin-left: 12px;
`;

const EmptyState = styled.div`
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
  background-color: white;
  border-radius: 24px;
  border: 1px dashed #ECE9E4;
  color: #7A7A7A;

  h3 {
    font-size: 1.4rem;
    color: var(--color-marron-principal);
    margin-bottom: 8px;
  }

  p {
    margin-bottom: 20px;
  }
`;

// ─── SVG Icons ──────────────────────────────────────────────────────────────

const HeartOutline = () => (
  <svg viewBox="0 0 24 24">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
);

const CartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 22C8.55228 22 9 21.5523 9 21C9 20.4477 8.55228 20 8 20C7.44772 20 7 20.4477 7 21C7 21.5523 7.44772 22 8 22Z" stroke="currentColor" />
    <path d="M19 22C19.5523 22 20 21.5523 20 21C20 20.4477 19.5523 20 19 20C18.4477 20 18 20.4477 18 21C18 21.5523 18.4477 22 19 22Z" stroke="currentColor" />
    <path d="M2.0498 2.05005H4.0498L6.7098 14.47C6.80738 14.9249 7.06048 15.3315 7.42552 15.6199C7.79056 15.9083 8.24471 16.0604 8.7098 16.05H18.4898C18.945 16.0493 19.3863 15.8933 19.7408 15.6079C20.0954 15.3224 20.3419 14.9246 20.4398 14.48L22.0898 7.05005H5.1198" stroke="currentColor" />
  </svg>
);

const ChevronIcon = () => (
  <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'inline-block' }}>
    <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ─── Componente Principal ────────────────────────────────────────────────────

export default function Catalogo() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Estados de carga e informacion
  const [productos, setProductos] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para opciones de filtros dinamicos (obtenidos del backend)
  const [availableBrands, setAvailableBrands] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [availableSizes, setAvailableSizes] = useState([]);

  // Favoritos local
  const [favorites, setFavorites] = useState({});

  // Accordions abiertos en sidebar
  const [accordions, setAccordions] = useState({
    marca: true,
    tamano: true,
    categoria: true,
  });

  // 1. Parsear filtros de URL Search Params
  const activePage = Number(searchParams.get('page')) || 1;
  const activeSort = searchParams.get('orden') || 'nombre:asc';
  const activeDescuento = searchParams.get('descuento') || '';
  const activeSeccion = searchParams.get('seccion') || 'Perfumería'; // Default a Perfumeria segun mock

  const activeBrands = useMemo(() => searchParams.get('marca') ? searchParams.get('marca').split(',') : [], [searchParams]);
  const activeCategories = useMemo(() => searchParams.get('categoria') ? searchParams.get('categoria').split(',') : [], [searchParams]);
  const activeSizes = useMemo(() => searchParams.get('tamano') ? searchParams.get('tamano').split(',') : [], [searchParams]);

  // Toggle Accordion
  const toggleAccordion = (field) => {
    setAccordions((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  // Toggle Favorito
  const toggleFavorite = (id) => {
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // SEO: Titulo de pagina
  useEffect(() => {
    document.title = 'Marybe - Tienda Oficial & Catálogo';
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'Explorá nuestro catálogo de perfumes, maquillaje, coloración y más. Descuentos exclusivos y cuotas sin interés en Marybe.');
    }
  }, []);

  // Scroll al inicio de la web al montar o cambiar de página/sección
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activePage, activeSeccion]);

  // 2. Cargar opciones dinamicas de filtros al montar (ej: consultar 100 productos para extraer marcas/tamanos reales)
  useEffect(() => {
    async function fetchFilterMetadata() {
      try {
        const res = await fetch(`${STRAPI_URL}/api/productos?pagination[pageSize]=100&populate=*`);
        if (!res.ok) throw new Error('Error al cargar metadatos de filtros');
        const json = await res.json();

        const brands = new Set();
        const categories = new Set();
        const sizes = new Set();

        json.data.forEach((p) => {
          const attrs = p.attributes || p;
          if (attrs.marca) brands.add(attrs.marca);
          if (attrs.categoria && attrs.categoria.nombre) {
            categories.add(attrs.categoria.nombre);
          }
          if (attrs.variantes) {
            attrs.variantes.forEach((v) => {
              if (v.volumen) sizes.add(v.volumen);
            });
          }
        });

        setAvailableBrands([...brands].sort());
        setAvailableCategories([...categories].sort());
        setAvailableSizes([...sizes].sort());
      } catch (err) {
        console.error('Error fetching filters data:', err);
      }
    }
    fetchFilterMetadata();
  }, []);

  // 3. Consultar productos de la pagina activa con filtros aplicados
  const fetchProductos = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set('pagination[page]', activePage);
      params.set('pagination[pageSize]', PAGE_SIZE);
      params.set('populate', '*');

      // Ordenar
      if (activeSort === 'precio:asc') {
        params.set('sort[0]', 'variantes.precio:asc');
      } else if (activeSort === 'precio:desc') {
        params.set('sort[0]', 'variantes.precio:desc');
      } else {
        const [field, dir] = activeSort.split(':');
        params.set('sort[0]', `${field}:${dir}`);
      }

      // Seccion
      if (activeSeccion) {
        params.set('filters[seccion][$eq]', activeSeccion);
      }

      // Descuento / Ofertas
      if (activeDescuento) {
        if (activeDescuento === 'todas') {
          params.set('filters[descuento][$gt]', 0);
        } else {
          // Hasta X% OFF incluye descuentos <= X y > 0
          params.set('filters[descuento][$lte]', Number(activeDescuento));
          params.set('filters[descuento][$gt]', 0);
        }
      }

      // Marcas
      activeBrands.forEach((brand, idx) => {
        params.set(`filters[marca][$in][${idx}]`, brand);
      });

      // Categorias
      activeCategories.forEach((cat, idx) => {
        params.set(`filters[categoria][nombre][$in][${idx}]`, cat);
      });

      // Tamaños / Volúmenes
      activeSizes.forEach((sz, idx) => {
        params.set(`filters[variantes][volumen][$in][${idx}]`, sz);
      });

      const url = `${STRAPI_URL}/api/productos?${params.toString()}`;
      const res = await fetch(url);
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

  // 4. Actualizar filtros en URL
  const updateUrlFilters = (newFilters) => {
    const nextParams = new URLSearchParams(searchParams);

    // Al filtrar, volvemos a la pagina 1
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

  // Manejo de clicks en checkbox
  const handleCheckboxToggle = (list, setList, item, urlKey) => {
    let nextList;
    if (list.includes(item)) {
      nextList = list.filter((x) => x !== item);
    } else {
      nextList = [...list, item];
    }
    updateUrlFilters({ [urlKey]: nextList });
  };

  const removeFilterTag = (urlKey, item) => {
    if (urlKey === 'descuento') {
      updateUrlFilters({ descuento: null });
    } else if (urlKey === 'seccion') {
      updateUrlFilters({ seccion: null });
    } else {
      const currentList = searchParams.get(urlKey) ? searchParams.get(urlKey).split(',') : [];
      const nextList = currentList.filter((x) => x !== item);
      updateUrlFilters({ [urlKey]: nextList });
    }
  };

  const clearAllFilters = () => {
    setSearchParams({ seccion: activeSeccion }); // Preserva seccion actual por defecto
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  // Formato de precios
  const formatPrice = (price) => {
    if (!price) return '$0';
    return '$' + Number(price).toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  // Helper para asignar tag visual de oferta (2x1, Combo, Sale)
  const getProductTag = (producto) => {
    const name = (producto.nombre || '').toLowerCase();
    const discount = producto.descuento || 0;
    if (name.includes('combo') || name.includes('sachet') || name.includes('kit')) {
      return { label: 'Combo', bg: '#EAF5EA', color: '#1B5E20' };
    }
    if (discount >= 30) {
      return { label: '2x1', bg: '#FAF0F0', color: 'var(--color-bordo-secundario)' };
    }
    return { label: 'Oferta', bg: '#FFFDE7', color: '#F57F17' };
  };

  return (
    <PageContainer>
      {/* Banner Top (Efecto Olympea/Invictus Elixir) */}
      <TopBanner>
        <BannerTextContainer>
          <BannerTitle>El poder del elixir</BannerTitle>
          <BannerSubtitle>Descubrí fragancias cautivadoras y sofisticadas con hasta 40% de descuento</BannerSubtitle>
          <BannerActions>
            <BannerPill id="banner-btn-olympea" onClick={() => updateUrlFilters({ seccion: 'Perfumería' })}>Olympea Elixir</BannerPill>
            <BannerPill id="banner-btn-invictus" onClick={() => updateUrlFilters({ seccion: 'Perfumería' })}>Invictus Elixir</BannerPill>
          </BannerActions>
        </BannerTextContainer>
        <BannerImageWrapper>
          <img src="/inicio/elixir.png" alt="Elixir Perfumes" />
        </BannerImageWrapper>
      </TopBanner>

      {/* Seccion Principal */}
      <MainContent>
        {/* Filtros Lateral */}
        <Sidebar>
          <FilterCard>
            <SidebarTitle>Filtros aplicados</SidebarTitle>

            {/* Tags Activos */}
            <ActiveFiltersWrapper>
              <FilterTagsList>
                {activeSeccion && (
                  <FilterTag>
                    {activeSeccion}
                    <button onClick={() => removeFilterTag('seccion', activeSeccion)} aria-label="Quitar filtro de sección">×</button>
                  </FilterTag>
                )}
                {activeDescuento && (
                  <FilterTag>
                    {activeDescuento === 'todas' ? 'Ofertas' : `Hasta ${activeDescuento}% OFF`}
                    <button onClick={() => removeFilterTag('descuento', activeDescuento)} aria-label="Quitar filtro de descuento">×</button>
                  </FilterTag>
                )}
                {activeBrands.map((b) => (
                  <FilterTag key={b}>
                    {b}
                    <button onClick={() => removeFilterTag('marca', b)} aria-label={`Quitar filtro de marca ${b}`}>×</button>
                  </FilterTag>
                ))}
                {activeCategories.map((c) => (
                  <FilterTag key={c}>
                    {c}
                    <button onClick={() => removeFilterTag('categoria', c)} aria-label={`Quitar filtro de categoría ${c}`}>×</button>
                  </FilterTag>
                ))}
                {activeSizes.map((sz) => (
                  <FilterTag key={sz}>
                    {sz}
                    <button onClick={() => removeFilterTag('tamano', sz)} aria-label={`Quitar filtro de tamaño ${sz}`}>×</button>
                  </FilterTag>
                ))}
              </FilterTagsList>

              {(activeDescuento || activeBrands.length > 0 || activeCategories.length > 0 || activeSizes.length > 0) && (
                <ClearAllBtn id="btn-limpiar-filtros" onClick={clearAllFilters}>Limpiar filtros</ClearAllBtn>
              )}
            </ActiveFiltersWrapper>

            {/* Categorías */}
            {availableCategories.length > 0 && (
              <AccordionItem>
                <AccordionHeader onClick={() => toggleAccordion('categoria')} $open={accordions.categoria}>
                  Categorías
                  <AccordionChevron $open={accordions.categoria}><ChevronIcon /></AccordionChevron>
                </AccordionHeader>
                <AccordionContent $open={accordions.categoria}>
                  {availableCategories.map((cat) => (
                    <CheckboxLabel key={cat}>
                      <input
                        type="checkbox"
                        checked={activeCategories.includes(cat)}
                        onChange={() => handleCheckboxToggle(activeCategories, null, cat, 'categoria')}
                      />
                      {cat}
                    </CheckboxLabel>
                  ))}
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Marcas */}
            {availableBrands.length > 0 && (
              <AccordionItem>
                <AccordionHeader onClick={() => toggleAccordion('marca')} $open={accordions.marca}>
                  Marca
                  <AccordionChevron $open={accordions.marca}><ChevronIcon /></AccordionChevron>
                </AccordionHeader>
                <AccordionContent $open={accordions.marca}>
                  {availableBrands.map((brand) => (
                    <CheckboxLabel key={brand}>
                      <input
                        type="checkbox"
                        checked={activeBrands.includes(brand)}
                        onChange={() => handleCheckboxToggle(activeBrands, null, brand, 'marca')}
                      />
                      {brand}
                    </CheckboxLabel>
                  ))}
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Tamaños / Volumenes */}
            {availableSizes.length > 0 && (
              <AccordionItem>
                <AccordionHeader onClick={() => toggleAccordion('tamano')} $open={accordions.tamano}>
                  Tamaño
                  <AccordionChevron $open={accordions.tamano}><ChevronIcon /></AccordionChevron>
                </AccordionHeader>
                <AccordionContent $open={accordions.tamano}>
                  {availableSizes.map((sz) => (
                    <CheckboxLabel key={sz}>
                      <input
                        type="checkbox"
                        checked={activeSizes.includes(sz)}
                        onChange={() => handleCheckboxToggle(activeSizes, null, sz, 'tamano')}
                      />
                      {sz}
                    </CheckboxLabel>
                  ))}
                </AccordionContent>
              </AccordionItem>
            )}

            <SidebarSubmitBtn id="sidebar-submit" onClick={() => fetchProductos()}>
              Mostrar resultados ({total})
            </SidebarSubmitBtn>
          </FilterCard>
        </Sidebar>

        {/* Listado de Productos */}
        <MainGridArea>
          {/* Header de controles */}
          <ControlsBar>
            <div>
              <h1>{activeSeccion || 'Tienda'}</h1>
              <p>
                {loading ? 'Cargando catálogo...' : `${total.toLocaleString('es-AR')} resultados`}
              </p>
            </div>

            {/* Ordenamiento */}
            <SortDropdown>
              <label htmlFor="select-orden">Ordenar por:</label>
              <select
                id="select-orden"
                value={activeSort}
                onChange={(e) => updateUrlFilters({ orden: e.target.value })}
              >
                <option value="nombre:asc">Nombre A→Z</option>
                <option value="nombre:desc">Nombre Z→A</option>
                <option value="precio:asc">Precio: Menor a Mayor</option>
                <option value="precio:desc">Precio: Mayor a Menor</option>
                <option value="createdAt:desc">Lanzamientos</option>
              </select>
            </SortDropdown>
          </ControlsBar>

          {/* Grilla de productos o Loading / Error */}
          {error && (
            <EmptyState>
              <h3>Ocurrió un inconveniente</h3>
              <p>{error}</p>
              <BannerPill style={{ backgroundColor: 'var(--color-bordo-secundario)' }} onClick={fetchProductos}>Reintentar</BannerPill>
            </EmptyState>
          )}

          {!error && (
            <ProductsGrid>
              {loading ? (
                Array.from({ length: PAGE_SIZE }).map((_, i) => (
                  <SkeletonCard key={i}>
                    <SkeletonBox $height="220px" $radius="16px" />
                    <SkeletonBox $width="40%" $height="14px" />
                    <SkeletonBox $width="80%" $height="18px" />
                    <SkeletonBox $width="60%" $height="20px" />
                    <SkeletonBox $width="100%" $height="40px" $radius="12px" />
                  </SkeletonCard>
                ))
              ) : productos.length === 0 ? (
                <EmptyState>
                  <h3>No se encontraron productos</h3>
                  <p>Intentá removiendo algunos de los filtros seleccionados.</p>
                  <BannerPill style={{ backgroundColor: 'var(--color-marron-principal)' }} onClick={clearAllFilters}>Limpiar Filtros</BannerPill>
                </EmptyState>
              ) : (
                productos.map((p) => {
                  const id = p.id || p.documentId;
                  const attrs = p.attributes || p;

                  const nombre = attrs.nombre;
                  const marca = attrs.marca;
                  const descuento = attrs.descuento || 0;

                  // Extraer variante principal (publicada y preferiblemente con stock)
                  const variantes = attrs.variantes || [];
                  const mainVariant = variantes.find(v => v.publicado !== false && v.stock > 0) || variantes[0] || {};
                  const price = mainVariant.precio || 0;
                  const offerPrice = mainVariant.precio_oferta || null;

                  const tieneOferta = offerPrice && offerPrice > 0 && offerPrice < price;
                  const currentPriceVal = tieneOferta ? offerPrice : price;

                  // Badge visual del descuento en circulo
                  const calcDescuento = tieneOferta ? Math.round((1 - offerPrice / price) * 100) : descuento;

                  // Estructura de portada
                  let imgUrl = null;
                  if (attrs.portada?.data?.attributes?.url) {
                    imgUrl = `${STRAPI_URL}${attrs.portada.data.attributes.url}`;
                  } else if (attrs.portada?.url) {
                    imgUrl = `${STRAPI_URL}${attrs.portada.url}`;
                  }

                  const isFav = !!favorites[id];
                  const visualTag = getProductTag(attrs);

                  return (
                    <ProductCard key={id}>
                      <CardImageContainer>
                        {/* Tag en la esquina superior izquierda */}
                        <LeftTopTag $bg={visualTag.bg} $color={visualTag.color}>
                          {visualTag.label}
                        </LeftTopTag>

                        {/* Circulo de descuento a la derecha */}
                        {calcDescuento > 0 && (
                          <div style={{ position: 'absolute', top: '10px', right: '55px', zIndex: 2 }}>
                            <LocalDiscountBadge>-{calcDescuento}%</LocalDiscountBadge>
                          </div>
                        )}

                        {/* Favorito */}
                        <HeartContainer>
                          <HeartIcon
                            $fav={isFav}
                            onClick={() => toggleFavorite(id)}
                            aria-label={isFav ? "Quitar de favoritos" : "Agregar a favoritos"}
                          >
                            <HeartOutline />
                          </HeartIcon>
                        </HeartContainer>

                        {imgUrl ? (
                          <img className="product-img" src={imgUrl} alt={nombre} />
                        ) : (
                          <svg viewBox="0 0 24 24" fill="#EAE7E0" style={{ width: '80px', height: '80px', opacity: 0.7 }}>
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                          </svg>
                        )}
                      </CardImageContainer>

                      <ProductBrand>{marca || 'Marybe'}</ProductBrand>
                      <ProductName title={nombre}>{nombre}</ProductName>

                      <PriceRow>
                        {tieneOferta && <OldPrice>{formatPrice(price)}</OldPrice>}
                        <CurrentPrice>{formatPrice(currentPriceVal)}</CurrentPrice>
                        {calcDescuento > 0 && !tieneOferta && (
                          <LocalDiscountBadge>{calcDescuento}% OFF</LocalDiscountBadge>
                        )}
                      </PriceRow>

                      <Installments>
                        3 cuotas sin interés de {formatPrice(Math.round(currentPriceVal / 3))}
                      </Installments>
                      <LegalText>
                        Precio sin impuestos nacionales {formatPrice(Math.round(currentPriceVal * 0.79))}
                      </LegalText>

                      <AddButton id={`add-btn-${id}`}>
                        Agregar <CartIcon />
                      </AddButton>
                    </ProductCard>
                  );
                })
              )}
            </ProductsGrid>
          )}

          {/* Paginación */}
          {!loading && !error && totalPages > 1 && (
            <PaginationRow aria-label="Navegación de páginas">
              <PageArrowBtn
                id="btn-pag-prev"
                disabled={activePage === 1}
                onClick={() => updateUrlFilters({ page: activePage - 1 })}
              >
                ← Anterior
              </PageArrowBtn>

              {Array.from({ length: totalPages }).map((_, idx) => {
                const p = idx + 1;
                return (
                  <PageBtn
                    key={p}
                    $active={activePage === p}
                    onClick={() => updateUrlFilters({ page: p })}
                  >
                    {p}
                  </PageBtn>
                );
              })}

              <PageArrowBtn
                id="btn-pag-next"
                disabled={activePage === totalPages}
                onClick={() => updateUrlFilters({ page: activePage + 1 })}
              >
                Siguiente →
              </PageArrowBtn>

              <PageInfo>Página {activePage} de {totalPages}</PageInfo>
            </PaginationRow>
          )}
        </MainGridArea>
      </MainContent>
    </PageContainer>
  );
}
