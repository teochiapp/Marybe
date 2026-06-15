import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

import SingleBreadcrumb from '../../components/tienda/single/SingleBreadcrumb';
import SingleImageGallery from '../../components/tienda/single/SingleImageGallery';
import SingleProductInfo from '../../components/tienda/single/SingleProductInfo';
import SingleAccordion from '../../components/tienda/single/SingleAccordion';
import SingleSimilares from '../../components/tienda/single/SingleSimilares';

const PageContainer = styled.div`
  min-height: 100vh;
  background-color: var(--color-blanco);
  padding: 40px 60px;

  @media (max-width: 1024px) {
    padding: 30px 20px;
  }
`;

const ContentWrapper = styled.div`
  max-width: 1400px;
  margin: 0 auto;
`;

const MainLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;

  @media (max-width: 1024px) {
    gap: 40px;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50vh;
  font-size: 1.2rem;
  color: #555;
`;

const STRAPI_URL = process.env.REACT_APP_STRAPI_URL || 'http://localhost:1337';

export default function ProductoSingle() {
  const { id } = useParams(); // Puede ser id numérico o documentId
  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Asumimos que el ID pasado es el documentId o id numérico
    // Primero intentamos buscarlo directo si la ruta /api/productos/:id funciona
    // Pero en Strapi v4 a veces es mejor buscar por array con filtros si no estamos seguros
    fetch(`${STRAPI_URL}/api/productos?filters[id][$eq]=${id}&populate=*`)
      .then(res => res.json())
      .then(data => {
        if (data && data.data && data.data.length > 0) {
          const prodData = data.data[0];
          setProducto({
            id: prodData.id || prodData.documentId,
            ...(prodData.attributes || prodData)
          });
        } else {
          // Fallback por documentId si id no match
          return fetch(`${STRAPI_URL}/api/productos?filters[documentId][$eq]=${id}&populate=*`)
            .then(res2 => res2.json())
            .then(data2 => {
              if (data2 && data2.data && data2.data.length > 0) {
                const prodData2 = data2.data[0];
                setProducto({
                  id: prodData2.id || prodData2.documentId,
                  ...(prodData2.attributes || prodData2)
                });
              } else {
                setError('Producto no encontrado');
              }
            });
        }
      })
      .catch(err => {
        console.error(err);
        setError('Error al cargar el producto');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <PageContainer>
        <LoadingContainer>Cargando producto...</LoadingContainer>
      </PageContainer>
    );
  }

  if (error || !producto) {
    return (
      <PageContainer>
        <LoadingContainer>{error || 'Producto no encontrado'}</LoadingContainer>
      </PageContainer>
    );
  }

  // Preparamos las imágenes para la galería
  let images = [];
  if (producto.portada?.data?.attributes?.url) {
    images.push(`${STRAPI_URL}${producto.portada.data.attributes.url}`);
  } else if (producto.portada?.url) {
    images.push(`${STRAPI_URL}${producto.portada.url}`);
  }
  
  if (producto.galeria?.data) {
    producto.galeria.data.forEach(img => {
      images.push(`${STRAPI_URL}${img.attributes.url}`);
    });
  } else if (producto.galeria?.length > 0) {
    producto.galeria.forEach(img => {
      images.push(`${STRAPI_URL}${img.url}`);
    });
  }

  // Si no hay imágenes, ponemos una de placeholder
  if (images.length === 0) {
    images.push('/placeholder.png');
  }

  return (
    <PageContainer>
      <ContentWrapper>
        <SingleBreadcrumb 
          seccion={producto.seccion} 
          categoria={producto.categoria?.data?.attributes?.nombre || producto.categoria?.nombre} 
          nombre={producto.nombre} 
        />

        <MainLayout>
          {/* Lado izquierdo: Galería */}
          <SingleImageGallery 
            images={images} 
            nombre={producto.nombre} 
          />

          {/* Lado derecho: Info, precio, opciones, carrito */}
          <div>
            <SingleProductInfo producto={producto} />
            
            {/* Acordeones inferiores */}
            <SingleAccordion 
              descripcion={producto.descripcion}
              especificaciones={null} // Si tuviéramos un campo en strapi se pasaría acá
              politicas={null} // Idem
            />
          </div>
        </MainLayout>

        <SingleSimilares />
      </ContentWrapper>
    </PageContainer>
  );
}
