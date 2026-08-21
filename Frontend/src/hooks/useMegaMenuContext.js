import { useState, useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { SECTION_GENERAL_PATHS, SECTION_MAP } from '../data/megamenu';
import { useMegaMenu } from './useMegaMenu';

/**
 * Determina el contexto actual para el Mega Menu:
 * 'PERFUMERIA', 'HOGAR' o 'GENERAL'
 */
export function useMegaMenuContext() {
  const [context, setContext] = useState('PERFUMERIA'); // Default
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { getSectionForCategory, getCategoriesForContext, loading: menuLoading } = useMegaMenu();

  useEffect(() => {
    // Si estamos cargando el menu, esperamos
    if (menuLoading) return;

    const path = location.pathname;
    
    // 1. Si es una ruta general
    if (SECTION_GENERAL_PATHS.has(path)) {
      setContext('GENERAL');
      return;
    }

    // 2. Si hay parametro explícito `seccion`
    const seccionParam = searchParams.get('seccion');
    if (seccionParam && SECTION_MAP[seccionParam]) {
      setContext(SECTION_MAP[seccionParam]);
      return;
    }

    // 3. Si la ruta especifica la categoría, subcategoría o tipo
    const categoria = searchParams.get('categoria');
    const subcategoria = searchParams.get('subcategoria');
    const tipo = searchParams.get('tipo');

    const searchCat = categoria || subcategoria || tipo; 
    
    if (searchCat) {
      // Tomamos el primero si hay múltiples (separados por coma)
      const firstCat = searchCat.split(',')[0];
      const section = getSectionForCategory(firstCat);
      if (section) {
        setContext(section);
        return;
      }
    }

    // 4. Fallbacks por path
    if (path === '/inicio' || path === '/') {
      setContext('PERFUMERIA');
      return;
    }

    // Default
    setContext('GENERAL');

  }, [location.pathname, searchParams, menuLoading, getSectionForCategory]);

  return { context, loading: menuLoading, getCategoriesForContext };
}
