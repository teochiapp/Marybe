import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { STRAPI_URL, SECTION_MAP, fetchCategoryTree } from '../data/megamenu';

const STATIC_CATEGORIES = new Set(['Ofertas', 'Lanzamientos']);

const MegaMenuCtx = createContext(null);

function mergeColumns(existing, incoming) {
  const result = existing.map(column => ({ ...column, items: [...column.items] }));
  incoming.forEach(column => {
    const href = column.items.find(item => item.isVerTodo)?.href;
    const match = result.find(item => item.title === column.title && item.items.find(link => link.isVerTodo)?.href === href);
    if (!match) {
      result.push({ ...column, items: [...column.items] });
      return;
    }
    const links = [...match.items, ...column.items];
    const unique = links.filter((item, index) => links.findIndex(other => other.href === item.href && other.label === item.label) === index);
    match.items = [...unique.filter(item => !item.isVerTodo), ...unique.filter(item => item.isVerTodo)];
  });
  return result;
}

export function MegaMenuProvider({ children }) {
  const [megaMap, setMegaMap] = useState(new Map());
  const [categorySectionMap, setCategorySectionMap] = useState(new Map());
  const [menuArrays, setMenuArrays] = useState({ PERFUMERIA: [], HOGAR: [], GENERAL: [] });
  const [menuLanzOfertas, setMenuLanzOfertas] = useState({ ofertas: null, lanzamientos: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    async function fetchAll() {
      try {
        const categorias = await fetchCategoryTree(controller.signal);
        const colMap = new Map();
        const secMap = new Map();
        const ambiguousNames = new Set();
        categorias.forEach((entry) => {
          const attrs = entry.attributes || entry;
          const nombre = attrs.nombre;
          if (!nombre) return;
          const seccionMapped = attrs.seccion ? (SECTION_MAP[attrs.seccion] || 'GENERAL') : 'GENERAL';
          const key = `${seccionMapped}-${nombre}`;
          secMap.set(key, seccionMapped);
          if (secMap.has(nombre) && secMap.get(nombre) !== seccionMapped) ambiguousNames.add(nombre);
          else secMap.set(nombre, seccionMapped);
          
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
            colMap.set(key, mergeColumns(colMap.get(key) || [], columns));
            if (!colMap.has(nombre)) colMap.set(nombre, columns);
          }
        });

        ambiguousNames.forEach((name) => {
          secMap.delete(name);
          colMap.delete(name);
        });

        const urlMenu =
          `${STRAPI_URL}/api/ordenamiento-menu-header` +
          `?populate[categoriasPerfumeria][fields][0]=nombre` +
          `&populate[categoriasPerfumeria][fields][1]=seccion` +
          `&populate[categoriasHogar][fields][0]=nombre` +
          `&populate[categoriasHogar][fields][1]=seccion` +
          `&populate[categoriasGeneral][fields][0]=nombre` +
          `&populate[categoriasGeneral][fields][1]=seccion`;
        const resMenu = await fetch(urlMenu, { signal: controller.signal });
        if (!resMenu.ok) throw new Error(`HTTP ${resMenu.status}`);
        const jsonMenu = await resMenu.json();
        const menuData = jsonMenu?.data || {};

        const resolveCategoryItems = (catArray, targetContext = null) => {
          const arr = catArray?.data || catArray || [];
          const seen = new Set();
          const items = [];
          for (const c of arr) {
            const attrs = c.attributes || c;
            const nombre = attrs.nombre;
            if (!nombre || seen.has(nombre)) continue;
            seen.add(nombre);

            let seccion = attrs.seccion || null;
            if (!seccion) {
              const docId = c.documentId || attrs.documentId;
              const numId = c.id || attrs.id;
              const match = categorias.find(cat => {
                const cAttrs = cat.attributes || cat;
                return (docId && (cat.documentId === docId || cAttrs.documentId === docId)) ||
                       (numId && (cat.id === numId || cAttrs.id === numId));
              });
              if (match) seccion = (match.attributes || match).seccion;
            }

            const seccionMapped = seccion ? (SECTION_MAP[seccion] || null) : targetContext;
            items.push({ nombre, seccion, seccionMapped });
          }
          return items;
        };

        const listPerfumeria = resolveCategoryItems(menuData.categoriasPerfumeria, 'PERFUMERIA');
        const listHogar = resolveCategoryItems(menuData.categoriasHogar, 'HOGAR');
        const listGeneral = resolveCategoryItems(menuData.categoriasGeneral, null);

        // Para categoriasGeneral, tomar exactamente la categoría seleccionada en Strapi sin mezclar secciones
        listGeneral.forEach(({ nombre, seccionMapped }) => {
          let targetSection = seccionMapped;
          if (!targetSection) {
            targetSection = secMap.get(`HOGAR-${nombre}`) ? 'HOGAR' : secMap.get(`PERFUMERIA-${nombre}`) ? 'PERFUMERIA' : null;
          }
          let columns = [];
          if (targetSection) {
            columns = colMap.get(`${targetSection}-${nombre}`) || [];
            secMap.set(`GENERAL-${nombre}`, targetSection);
            secMap.set(nombre, targetSection);
          } else {
            columns = colMap.get(nombre) || [];
          }
          colMap.set(`GENERAL-${nombre}`, columns);
        });

        setMegaMap(colMap);
        setCategorySectionMap(secMap);

        const addStatics = (list) => {
          if (list.length === 0) return [];
          const filtered = list.filter((c) => c !== 'Ofertas' && c !== 'Lanzamientos');
          return ['Ofertas', 'Lanzamientos', ...filtered];
        };

        setMenuArrays({
          PERFUMERIA: addStatics(listPerfumeria.map(i => i.nombre)),
          HOGAR: addStatics(listHogar.map(i => i.nombre)),
          GENERAL: addStatics(listGeneral.map(i => i.nombre)),
        });

        try {
          const urlLanzOfertas = `${STRAPI_URL}/api/menu-lanzamientos-ofertas?populate[ofertas][populate][columnas_categorias][populate][0]=categorias&populate[ofertas][populate][productos_destacados]=true&populate[lanzamientos][populate][0]=categorias&populate[lanzamientos][populate][1]=productos_destacados`;
          const resLanzOfertas = await fetch(urlLanzOfertas, { signal: controller.signal });
          if (resLanzOfertas.ok) {
            const jsonLanzOfertas = await resLanzOfertas.json();
            const attrs = jsonLanzOfertas?.data?.attributes || jsonLanzOfertas?.data || {};
            setMenuLanzOfertas({
              ofertas: attrs.ofertas || null,
              lanzamientos: attrs.lanzamientos || null
            });
          }
        } catch (err) {
          if (err.name !== 'AbortError') console.warn('[MegaMenu] Error al cargar Lanzamientos/Ofertas:', err.message);
        }
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
        return megaMap.get(key) || (context === 'GENERAL' ? megaMap.get(catName) || [] : []);
      }
      return megaMap.get(catName) || [];
    },
    [megaMap]
  );
  const getSectionForCategory = useCallback(
    (catName, context) => {
      if (context) {
        const key = `${context}-${catName}`;
        if (categorySectionMap.has(key)) return categorySectionMap.get(key);
      }
      return categorySectionMap.get(catName) || null;
    },
    [categorySectionMap]
  );
  const getCategoriesForContext = useCallback(
    (context) => { const list = menuArrays[context]; if (!list || list.length === 0) return ['Ofertas', 'Lanzamientos']; return list; },
    [menuArrays]
  );

  return (
    <MegaMenuCtx.Provider value={{ megaMap, categorySectionMap, menuArrays, loading, getColumnsForCategory, getSectionForCategory, getCategoriesForContext, menuLanzOfertas }}>
      {children}
    </MegaMenuCtx.Provider>
  );
}

export function useMegaMenu() {
  const ctx = useContext(MegaMenuCtx);
  if (!ctx) throw new Error('useMegaMenu debe usarse dentro de <MegaMenuProvider>');
  return ctx;
}
