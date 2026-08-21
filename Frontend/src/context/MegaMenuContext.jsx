import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { STRAPI_URL, MEGA_COLUMNS, SECTION_MAP } from '../data/megamenu';

const STATIC_CATEGORIES = new Set(['Ofertas', 'Lanzamientos']);

const MegaMenuCtx = createContext(null);

export function MegaMenuProvider({ children }) {
  const [megaMap, setMegaMap] = useState(new Map());
  const [categorySectionMap, setCategorySectionMap] = useState(new Map());
  const [menuArrays, setMenuArrays] = useState({ PERFUMERIA: [], HOGAR: [], GENERAL: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    async function fetchAll() {
      try {
        const urlCats =
          `${STRAPI_URL}/api/categorias` +
          `?populate[subcategorias][populate][tipos]=*` +
          `&filters[productos][id][$notNull]=true` +
          `&pagination[pageSize]=100` +
          `&publicationState=live`;
        const resCats = await fetch(urlCats, { signal: controller.signal });
        if (!resCats.ok) throw new Error(`HTTP ${resCats.status}`);
        const jsonCats = await resCats.json();
        const categorias = jsonCats?.data || [];
        const colMap = new Map();
        const secMap = new Map();
        categorias.forEach((entry) => {
          const attrs = entry.attributes || entry;
          const nombre = attrs.nombre;
          if (!nombre) return;
          const seccionMapped = attrs.seccion ? (SECTION_MAP[attrs.seccion] || 'GENERAL') : 'GENERAL';
          const key = `${seccionMapped}-${nombre}`;
          secMap.set(key, seccionMapped);
          secMap.set(nombre, seccionMapped); // Fallback
          
          if (STATIC_CATEGORIES.has(nombre)) return;
          const subcats = attrs.subcategorias || [];
          if (subcats.length === 0) return;
          const seccionParam = attrs.seccion ? ('&seccion=' + encodeURIComponent(attrs.seccion)) : '';
          const columns = subcats.map((sub) => {
            const subNombre = sub.nombre || sub.attributes?.nombre;
            if (!subNombre) return null;
            const tipos = sub.tipos || sub.attributes?.tipos || [];
            const hrefSubcat = '/tienda?categoria=' + encodeURIComponent(nombre) + '&subcategoria=' + encodeURIComponent(subNombre) + seccionParam;
            let items;
            if (tipos.length > 0) {
              items = [
                ...tipos.map((t) => {
                  const tipoNombre = t.nombre || t.attributes?.nombre;
                  return { label: tipoNombre, href: `${hrefSubcat}&tipo=${encodeURIComponent(tipoNombre)}` };
                }),
                { label: 'Ver todos', href: hrefSubcat, isVerTodo: true },
              ];
            } else {
              items = [{ label: 'Ver todos', href: hrefSubcat, isVerTodo: true }];
            }
            return { title: subNombre, items };
          }).filter(Boolean);
          if (columns.length > 0) {
            colMap.set(key, columns);
            colMap.set(nombre, columns); // Fallback
          }
        });
        setMegaMap(colMap);
        setCategorySectionMap(secMap);

        const urlMenu =
          `${STRAPI_URL}/api/ordenamiento-menu-header` +
          `?populate[categoriasPerfumeria][fields][0]=nombre` +
          `&populate[categoriasHogar][fields][0]=nombre` +
          `&populate[categoriasGeneral][fields][0]=nombre`;
        const resMenu = await fetch(urlMenu, { signal: controller.signal });
        if (!resMenu.ok) throw new Error(`HTTP ${resMenu.status}`);
        const jsonMenu = await resMenu.json();
        const menuData = jsonMenu?.data || {};

        const extractNames = (catArray) => {
          const arr = catArray?.data || catArray || [];
          const seen = new Set();
          return arr.map((c) => (c.attributes || c).nombre).filter((n) => {
            if (!n || seen.has(n)) return false;
            seen.add(n);
            return true;
          });
        };
        const addStatics = (list) => {
          if (list.length === 0) return [];
          const filtered = list.filter((c) => c !== 'Ofertas' && c !== 'Lanzamientos');
          return ['Ofertas', 'Lanzamientos', ...filtered];
        };

        setMenuArrays({
          PERFUMERIA: addStatics(extractNames(menuData.categoriasPerfumeria)),
          HOGAR: addStatics(extractNames(menuData.categoriasHogar)),
          GENERAL: addStatics(extractNames(menuData.categoriasGeneral)),
        });
      } catch (err) {
        if (err.name !== 'AbortError') console.warn('[MegaMenu] Error al cargar desde Strapi:', err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
    return () => controller.abort();
  }, []);

  const getColumnsForCategory = useCallback(
    (catName, context) => { 
      if (STATIC_CATEGORIES.has(catName)) return null; 
      if (context) {
        const key = `${context}-${catName}`;
        if (megaMap.has(key)) return megaMap.get(key);
      }
      return megaMap.get(catName) || []; 
    },
    [megaMap]
  );
  const getSectionForCategory = useCallback(
    (catName) => categorySectionMap.get(catName) || null,
    [categorySectionMap]
  );
  const getCategoriesForContext = useCallback(
    (context) => { const list = menuArrays[context]; if (!list || list.length === 0) return ['Ofertas', 'Lanzamientos']; return list; },
    [menuArrays]
  );

  return (
    <MegaMenuCtx.Provider value={{ megaMap, categorySectionMap, menuArrays, loading, getColumnsForCategory, getSectionForCategory, getCategoriesForContext }}>
      {children}
    </MegaMenuCtx.Provider>
  );
}

export function useMegaMenu() {
  const ctx = useContext(MegaMenuCtx);
  if (!ctx) throw new Error('useMegaMenu debe usarse dentro de <MegaMenuProvider>');
  return ctx;
}
