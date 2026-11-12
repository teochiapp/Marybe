import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { STRAPI_URL, SECTION_MAP, fetchCategoryTree } from '../data/megamenu';

const STATIC_CATEGORIES = new Set(['Ofertas', 'Lanzamientos']);

const MegaMenuCtx = createContext(null);

function orderMenuEntries(items, savedOrder) {
  const defaults = [
    { key: 'ofertas', nombre: 'Ofertas' },
    { key: 'lanzamientos', nombre: 'Lanzamientos' },
    ...items.filter(item => !STATIC_CATEGORIES.has(item.nombre)).map(item => ({
      key: item.documentId ? `categoria:${item.documentId}` : null,
      nombre: item.nombre,
      seccion: item.seccion,
      seccionMapped: item.seccionMapped,
    })),
  ];
  if (!Array.isArray(savedOrder)) return defaults;
  const known = new Map(defaults.filter(item => item.key).map(item => [item.key, item]));
  const ordered = [];
  const seen = new Set();
  savedOrder.forEach(key => {
    if (known.has(key) && !seen.has(key)) {
      ordered.push(known.get(key));
      seen.add(key);
    }
  });
  defaults.forEach(item => { if (!item.key || !seen.has(item.key)) ordered.push(item); });
  return ordered;
}

export function orderMenuItems(items, savedOrder) {
  return orderMenuEntries(items, savedOrder).map(item => item.nombre);
}

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
  const [sectionColumns, setSectionColumns] = useState(new Map());
  const [categorySectionMap, setCategorySectionMap] = useState(new Map());
  const [menuArrays, setMenuArrays] = useState({ PERFUMERIA: null, HOGAR: null, GENERAL: null });
  const [menuLanzOfertas, setMenuLanzOfertas] = useState({ ofertas: null, lanzamientos: null });
  const [menuStyles, setMenuStyles] = useState({});
  const [loading, setLoading] = useState(true);
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const refresh = () => setRevision(value => value + 1);
    const refreshVisible = () => { if (document.visibilityState === 'visible') refresh(); };
    window.addEventListener('marybe-menu-updated', refresh);
    window.addEventListener('focus', refreshVisible);
    document.addEventListener('visibilitychange', refreshVisible);
    const interval = window.setInterval(refreshVisible, 60000);
    return () => {
      window.removeEventListener('marybe-menu-updated', refresh);
      window.removeEventListener('focus', refreshVisible);
      document.removeEventListener('visibilitychange', refreshVisible);
      window.clearInterval(interval);
    };
  }, []);

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
        const resMenu = await fetch(urlMenu, { signal: controller.signal, cache: 'no-store' });
        if (!resMenu.ok) throw new Error(`HTTP ${resMenu.status}`);
        const jsonMenu = await resMenu.json();
        const menuData = jsonMenu?.data || {};
        setMenuStyles(menuData.ordenVisual?.estilos || {});

        const resolveCategoryItems = (catArray, targetContext = null) => {
          const arr = catArray?.data || catArray || [];
          const seen = new Set();
          const items = [];
          for (const c of arr) {
            const attrs = c.attributes || c;
            const nombre = attrs.nombre;
            if (!nombre) continue;

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
            const identity = `${seccionMapped || ''}\u0000${nombre}`;
            if (seen.has(identity)) continue;
            seen.add(identity);
            items.push({ nombre, seccion, seccionMapped, documentId: c.documentId || attrs.documentId });
          }
          return items;
        };

        const listPerfumeria = resolveCategoryItems(menuData.categoriasPerfumeria, 'PERFUMERIA');
        const listHogar = resolveCategoryItems(menuData.categoriasHogar, 'HOGAR');
        const listGeneral = resolveCategoryItems(menuData.categoriasGeneral, null);
        const baseColumns = new Map(colMap);

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

        const originalColumns = new Map(colMap);
        [['perfumeria', 'PERFUMERIA', listPerfumeria], ['hogar', 'HOGAR', listHogar]].forEach(([area, target, items]) => {
          const saved = menuData.ordenVisual?.categoriasAgregadas?.[area];
          const added = Array.isArray(saved) ? saved : [];
          items.forEach(({ documentId, nombre, seccionMapped }) => {
            if (!added.includes(documentId) || !seccionMapped) return;
            const source = `${seccionMapped}-${nombre}`;
            colMap.set(`${target}-${nombre}`, originalColumns.get(source) || []);
            secMap.set(`${target}-${nombre}`, seccionMapped);
          });
        });

        setMegaMap(colMap);
        setSectionColumns(baseColumns);
        setCategorySectionMap(secMap);

        setMenuArrays({
          PERFUMERIA: orderMenuEntries(listPerfumeria, menuData.ordenVisual?.perfumeria).filter(item => !(menuData.ordenVisual?.especialesOcultos?.perfumeria || []).includes(item.key)),
          HOGAR: orderMenuEntries(listHogar, menuData.ordenVisual?.hogar).filter(item => !(menuData.ordenVisual?.especialesOcultos?.hogar || []).includes(item.key)),
          GENERAL: orderMenuEntries(listGeneral, menuData.ordenVisual?.general),
        });

        try {
          const urlLanzOfertas = `${STRAPI_URL}/api/menu-lanzamientos-ofertas?populate[ofertas][populate][columnas_categorias][populate][0]=categorias&populate[ofertas][populate][productos_destacados]=true&populate[lanzamientos][populate][0]=categorias&populate[lanzamientos][populate][1]=productos_destacados`;
          const resLanzOfertas = await fetch(urlLanzOfertas, { signal: controller.signal, cache: 'no-store' });
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
  }, [revision]);

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
  const getColumnsInSection = useCallback((name, section) => sectionColumns.get(`${section}-${name}`) || [], [sectionColumns]);
  const getCategoriesForContext = useCallback(
    (context) => { const list = menuArrays[context]; if (!list) return ['Ofertas', 'Lanzamientos']; return list.map(item => item.nombre); },
    [menuArrays]
  );
  const getMenuItemsForContext = useCallback(
    context => menuArrays[context] ?? [{ key: 'ofertas', nombre: 'Ofertas' }, { key: 'lanzamientos', nombre: 'Lanzamientos' }],
    [menuArrays]
  );

  return (
    <MegaMenuCtx.Provider value={{ megaMap, categorySectionMap, menuArrays, loading, getColumnsForCategory, getColumnsInSection, getSectionForCategory, getCategoriesForContext, getMenuItemsForContext, menuLanzOfertas, menuStyles }}>
      {children}
    </MegaMenuCtx.Provider>
  );
}

export function useMegaMenu() {
  const ctx = useContext(MegaMenuCtx);
  if (!ctx) throw new Error('useMegaMenu debe usarse dentro de <MegaMenuProvider>');
  return ctx;
}
