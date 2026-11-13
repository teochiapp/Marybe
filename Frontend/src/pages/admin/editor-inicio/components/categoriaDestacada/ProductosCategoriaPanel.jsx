import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import ProductPickerItem, { ProductPickerList } from '../ProductPickerItem';
import { MAX_PRODUCTS } from './categoriaDestacadaModel';

const Counter = styled.p`
  margin: 0 0 10px;
  color: #7d6c72;
  font-size: 11px;
  font-weight: 600;
`;

const ModeBox = styled.div`
  margin-bottom: 14px;
  padding: 12px;
  border: 1px dashed #dccfcf;
  border-radius: var(--radius-md);
  background: #fcfafa;
  color: #6f6262;
  font-size: 11px;
  line-height: 1.5;

  strong {
    display: block;
    margin-bottom: 4px;
    color: var(--color-marron-cuarto);
  }

  button {
    margin-top: 10px;
    width: 100%;
  }
`;

const MoveButton = styled.button`
  padding: 6px 7px !important;
`;

export default function ProductosCategoriaPanel({ data, categoryName, productIndex, automatic, loadProducts, onChange, onMove }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const selected = data.productos.map(id => productIndex[id]).filter(Boolean);
  const manual = data.productos.length > 0;
  const full = data.productos.length >= MAX_PRODUCTS;

  useEffect(() => {
    if (!data.categoria) { setResults([]); setTotal(0); return undefined; }
    let active = true;
    const timer = setTimeout(() => {
      setSearching(true);
      setSearchError('');
      loadProducts(query.trim(), 1)
        .then(response => { if (active) { setResults(response.items); setTotal(response.total); setPage(1); } })
        .catch(() => { if (active) setSearchError('No se pudieron cargar los productos.'); })
        .finally(() => { if (active) setSearching(false); });
    }, 300);
    return () => { active = false; clearTimeout(timer); };
  }, [query, data.categoria, loadProducts]);

  async function loadMore() {
    setSearching(true);
    try {
      const response = await loadProducts(query.trim(), page + 1);
      setResults(previous => [...previous, ...response.items]);
      setPage(response.page);
      setTotal(response.total);
    } catch {
      setSearchError('No se pudieron cargar más productos.');
    } finally {
      setSearching(false);
    }
  }

  const toggle = product => onChange(next => {
    next.productos = next.productos.includes(product.documentId)
      ? next.productos.filter(id => id !== product.documentId)
      : [...next.productos, product.documentId];
  });

  if (!data.categoria) return <p className="ba-inspector-help">Primero elegí la categoría de la sección en «Categoría y título».</p>;

  return (
    <>
      <p className="ba-inspector-help">Elegí qué productos de «{categoryName}» se muestran y ordenalos arrastrando las tarjetas sobre la vista previa. Precios, imágenes y descuentos salen siempre de Strapi.</p>
      {!manual && (
        <ModeBox>
          <strong>Modo automático</strong>
          La sección muestra los primeros {MAX_PRODUCTS} productos publicados de la categoría, en el orden del catálogo ({automatic.length ? `${Math.min(automatic.length, MAX_PRODUCTS)} visibles` : 'sin productos publicados'}).
          {automatic.length > 0 && <button type="button" onClick={() => onChange(next => { next.productos = automatic.slice(0, MAX_PRODUCTS).map(product => product.documentId); })}>Elegir y ordenar estos productos</button>}
        </ModeBox>
      )}
      {manual && (
        <details open>
          <summary>Productos visibles</summary>
          <Counter role="status">{data.productos.length} de {MAX_PRODUCTS} productos, en este orden</Counter>
          {selected.length < data.productos.length && <small className="ba-hint">{data.productos.length - selected.length} producto(s) ya no están disponibles y no se muestran.</small>}
          <ProductPickerList aria-label="Productos visibles">
            {selected.map((product, index) => (
              <ProductPickerItem
                key={product.documentId}
                product={product}
                selected
                onToggle={toggle}
                actions={<>
                  <MoveButton type="button" disabled={index === 0} aria-label={`Subir ${product.nombre}`} onClick={() => onMove(product.documentId, index - 1)}>↑</MoveButton>
                  <MoveButton type="button" disabled={index === selected.length - 1} aria-label={`Bajar ${product.nombre}`} onClick={() => onMove(product.documentId, index + 1)}>↓</MoveButton>
                </>}
              />
            ))}
          </ProductPickerList>
          <button className="ba-reset-device" onClick={() => onChange(next => { next.productos = []; })}>Volver al modo automático</button>
        </details>
      )}
      <details open>
        <summary>Productos de la categoría</summary>
        <label htmlFor="cd-buscar-productos">Buscar en {categoryName}<input id="cd-buscar-productos" name="buscar_productos_categoria" type="search" value={query} placeholder="Nombre, marca o SKU" maxLength={80} onChange={event => setQuery(event.target.value)} /></label>
        {full && <small className="ba-hint">Llegaste al máximo de {MAX_PRODUCTS} productos.</small>}
        {searchError && <p className="ba-hint" role="alert">{searchError}</p>}
        {!searching && !searchError && !results.length && <p className="ba-hint">No hay productos publicados que coincidan.</p>}
        <ProductPickerList aria-label="Productos disponibles">
          {results.map(product => <ProductPickerItem key={product.documentId} product={product} selected={data.productos.includes(product.documentId)} disabled={full} onToggle={toggle} />)}
        </ProductPickerList>
        {searching && <p className="ba-hint" role="status">Cargando productos…</p>}
        {!searching && results.length < total && <button type="button" onClick={loadMore}>Cargar más ({total - results.length} restantes)</button>}
      </details>
    </>
  );
}
