import { useState, useEffect } from 'react';
import { STRAPI_URL, MEGA_COLUMNS } from '../data/megamenu';

// Categorías que siempre usan datos estáticos (nunca se buscan en Strapi)
const STATIC_CATEGORIES = new Set(['Ofertas', 'Lanzamientos']);

/**
 * useMegaMenu — carga las columnas del mega menú desde Strapi.
 *
 * Retorna:
 *   getColumnsForCategory(catName) → Column[]
 *   loading  → boolean
 *
 * Formato de Column:
 *   { title: string, items: Array<string | { label: string, href: string }> }
 *
 * Si Strapi no responde o la categoría no tiene datos, se devuelve
 * el fallback estático (MEGA_COLUMNS).
 *
 * API utilizada:
 *   GET /api/categorias?populate[subcategorias][populate][tipos]=*&publicationState=live
 */
export function useMegaMenu() {
  // Map<categoriaNombre, Column[]>
  const [megaMap, setMegaMap] = useState(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchMenu() {
      try {
        const url =
          `${STRAPI_URL}/api/categorias` +
          `?populate[subcategorias][populate][tipos]=*` +
          `&pagination[pageSize]=100` +
          `&publicationState=live`;

        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json = await res.json();
        const categorias = json?.data || [];

        const map = new Map();

        categorias.forEach((entry) => {
          // Compatible con Strapi v4 (attributes) y v5 (flat)
          const attrs = entry.attributes || entry;
          const nombre = attrs.nombre;
          if (!nombre || STATIC_CATEGORIES.has(nombre)) return;

          const subcats = attrs.subcategorias || [];

          // Cada subcategoría se convierte en una columna del megamenú
          const columns = subcats
            .map((sub) => {
              const subNombre = sub.nombre || sub.attributes?.nombre;
              if (!subNombre) return null;

              const tipos = sub.tipos || sub.attributes?.tipos || [];

              // Si hay tipos → cada uno es un ítem con href
              // Si no hay tipos → columna vacía (el menú la omitirá)
              const items = tipos.map((t) => {
                const tipoNombre = t.nombre || t.attributes?.nombre;
                return {
                  label: tipoNombre,
                  href: `/tienda?categoria=${encodeURIComponent(nombre)}&subcategoria=${encodeURIComponent(subNombre)}&tipo=${encodeURIComponent(tipoNombre)}`,
                };
              });

              return { title: subNombre, items };
            })
            .filter(Boolean)
            // Excluir columnas sin ítems para no mostrar columnas vacías
            .filter((col) => col.items.length > 0);

          if (columns.length > 0) {
            map.set(nombre, columns);
          }
        });

        setMegaMap(map);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.warn('[useMegaMenu] Usando fallback estático:', err.message);
        }
        // En caso de error, el mapa queda vacío → CategoryNav usará MEGA_COLUMNS
      } finally {
        setLoading(false);
      }
    }

    fetchMenu();
    return () => controller.abort();
  }, []);

  /**
   * Devuelve las columnas para una categoría dada.
   * Si no hay datos dinámicos, devuelve MEGA_COLUMNS como fallback.
   */
  function getColumnsForCategory(catName) {
    if (STATIC_CATEGORIES.has(catName)) return null; // las estáticas las maneja CategoryNav
    return megaMap.get(catName) || MEGA_COLUMNS;
  }

  return { getColumnsForCategory, loading };
}
