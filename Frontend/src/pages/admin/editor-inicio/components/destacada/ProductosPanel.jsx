import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import ProductPickerItem, { ProductPickerList } from '../ProductPickerItem';
import { MAX_PRODUCTS } from './destacadaModel';

const Counter = styled.p`
  margin: 0 0 10px;
  color: #7d6c72;
  font-size: 11px;
  font-weight: 600;
`;

export default function ProductosPanel({ areaLabel, data, productIndex, searchProducts, onChange }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const selected = data.productos.map(id => productIndex[id]).filter(Boolean).sort((a, b) => a.id - b.id);
  const missing = data.productos.length - selected.length;
  const full = data.productos.length >= MAX_PRODUCTS;

  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => {
      setSearching(true);
      setSearchError('');
      searchProducts(query.trim())
        .then(list => { if (active) setResults(list); })
        .catch(() => { if (active) setSearchError('No se pudo buscar productos.'); })
        .finally(() => { if (active) setSearching(false); });
    }, 300);
    return () => { active = false; clearTimeout(timer); };
  }, [query, searchProducts]);

  const toggle = product => onChange(draft => {
    draft.productos = draft.productos.includes(product.documentId)
      ? draft.productos.filter(id => id !== product.documentId)
      : [...draft.productos, product.documentId];
  });

  return (
    <>
      <p className="ba-inspector-help">Estos productos aparecen en el carrusel de la sección. En la tienda se ordenan según el catálogo.</p>
      <p className="ba-hint">Es el mismo dato que la columna <strong>Destacado</strong> del Excel de productos: lo que marques con TRUE en la planilla aparece acá, y lo que publiques desde acá sale en la próxima exportación.</p>
      <details open>
        <summary>Seleccionados</summary>
        <Counter role="status">{data.productos.length} de {MAX_PRODUCTS} productos</Counter>
        {!data.productos.length && <small className="ba-hint">Sin productos, el carrusel de la tienda queda vacío.</small>}
        {data.productos.length > MAX_PRODUCTS && <small className="ba-hint" role="alert">Hay {data.productos.length} productos destacados y la tienda muestra solo {MAX_PRODUCTS}. Quitá {data.productos.length - MAX_PRODUCTS} antes de publicar.</small>}
        {missing > 0 && <small className="ba-hint">{missing} producto(s) seleccionados ya no están disponibles. Quitalos antes de publicar.</small>}
        <ProductPickerList aria-label="Productos seleccionados">
          {selected.map(product => <ProductPickerItem key={product.documentId} product={product} selected onToggle={toggle} />)}
        </ProductPickerList>
        {missing > 0 && <button type="button" onClick={() => onChange(draft => { draft.productos = draft.productos.filter(id => productIndex[id]); })}>Quitar productos no disponibles</button>}
      </details>
      <details open>
        <summary>Agregar productos</summary>
        <label htmlFor="dd-buscar-productos">Buscar en {areaLabel}<input id="dd-buscar-productos" name="buscar_destacada" type="search" value={query} placeholder="Nombre, marca o SKU" maxLength={80} onChange={event => setQuery(event.target.value)} /></label>
        {full && <small className="ba-hint">Llegaste al máximo de {MAX_PRODUCTS} productos.</small>}
        {searching && <p className="ba-hint" role="status">Buscando…</p>}
        {searchError && <p className="ba-hint" role="alert">{searchError}</p>}
        {!searching && !searchError && !results.length && <p className="ba-hint">No se encontraron productos publicados.</p>}
        <ProductPickerList aria-label="Resultados de búsqueda">
          {results.map(product => <ProductPickerItem key={product.documentId} product={product} selected={data.productos.includes(product.documentId)} disabled={full} onToggle={toggle} />)}
        </ProductPickerList>
      </details>
    </>
  );
}
