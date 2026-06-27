import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

import SingleBreadcrumb from '../../components/tienda/single/SingleBreadcrumb';
import SingleImageGallery from '../../components/tienda/single/SingleImageGallery';
import SingleProductInfo from '../../components/tienda/single/SingleProductInfo';
import SingleAccordion from '../../components/tienda/single/SingleAccordion';
import SingleSimilares from '../../components/tienda/single/SingleSimilares';
import GiftCard from '../../components/inicio/shared/GiftCard';
import FavoriteButton from '../../components/shared/FavoriteButton';

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
  grid-template-columns: 5fr 5fr;
  gap: 60px;
  align-items: start;

  & > * {
    min-width: 0;
  }

  @media (max-width: 1024px) {
    gap: 40px;
    grid-template-columns: 1fr 1fr;
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

const DesktopOnly = styled.div`
  @media (max-width: 768px) {
    display: none;
  }
`;

const MobileTopRow = styled.div`
  display: none;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    display: flex;
  }
`;

const Pill = styled.span`
  background-color: #F2D4D4;
  color: var(--color-bordo-tercero);
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 600;
`;

const IconsContainer = styled.div`
  display: flex;
  gap: 15px;
  color: #000000;
  
  svg {
    width: 24px;
    height: 24px;
    cursor: pointer;
  }
`;

const STRAPI_URL = process.env.REACT_APP_STRAPI_URL || 'http://localhost:1337';

const GiftCardSection = styled.div`
  background-color: var(--color-blanco);
`;

export default function ProductoSingle() {
  const { id } = useParams(); // Puede ser id numérico o documentId + slug (ej: 11138-shampoo)
  const actualId = id ? id.split('-')[0] : null;

  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);

    // Asumimos que el ID pasado es el documentId o id numérico
    // Primero intentamos buscarlo directo si la ruta /api/productos/:id funciona
    // Pero en Strapi v4 a veces es mejor buscar por array con filtros si no estamos seguros
    if (!actualId) return;

    fetch(`${STRAPI_URL}/api/productos?filters[id][$eq]=${actualId}&populate=*`)
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
          return fetch(`${STRAPI_URL}/api/productos?filters[documentId][$eq]=${actualId}&populate=*`)
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
  }, [actualId]);

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

  const handleShare = async () => {
    if (!producto) return;
    const shareData = {
      title: `${producto.nombre} - ${producto.marca || ''} | Marybe`,
      text: producto.descripcion_corta || `Mirá este producto en Marybe: ${producto.nombre}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        alert('Enlace copiado al portapapeles');
      }
    } catch (err) {
      console.error('Error al compartir', err);
    }
  };

  return (
    <>
      <PageContainer>
        <ContentWrapper>
          <DesktopOnly>
            <SingleBreadcrumb
              seccion={producto.seccion}
              categoria={producto.categoria?.data?.attributes?.nombre || producto.categoria?.nombre}
              nombre={producto.nombre}
            />
          </DesktopOnly>

          <MobileTopRow>
            <div>
              {producto.descuento > 0 && <Pill>Super oferta</Pill>}
            </div>
            <IconsContainer>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                onClick={handleShare}
                title="Compartir"
              >
                <path d="M9 12C9 12.663 8.73661 13.2989 8.26777 13.7678C7.79893 14.2366 7.16304 14.5 6.5 14.5C5.83696 14.5 5.20107 14.2366 4.73223 13.7678C4.26339 13.2989 4 12.663 4 12C4 11.337 4.26339 10.7011 4.73223 10.2322C5.20107 9.76339 5.83696 9.5 6.5 9.5C7.16304 9.5 7.79893 9.76339 8.26777 10.2322C8.73661 10.7011 9 11.337 9 12Z" stroke="#7C0405" strokeWidth="1.5" />
                <path d="M14 6.5L9 10M14 17.5L9 14" stroke="#7C0405" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M19 18.5C19 19.163 18.7366 19.7989 18.2678 20.2678C17.7989 20.7366 17.163 21 16.5 21C15.837 21 15.2011 20.7366 14.7322 20.2678C14.2634 19.7989 14 19.163 14 18.5C14 17.837 14.2634 17.2011 14.7322 16.7322C15.2011 16.2634 15.837 16 16.5 16C17.163 16 17.7989 16.2634 18.2678 16.7322C18.7366 17.2011 19 17.837 19 18.5ZM19 5.5C19 6.16304 18.7366 6.79893 18.2678 7.26777C17.7989 7.73661 17.163 8 16.5 8C15.837 8 15.2011 7.73661 14.7322 7.26777C14.2634 6.79893 14 6.16304 14 5.5C14 4.83696 14.2634 4.20107 14.7322 3.73223C15.2011 3.26339 15.837 3 16.5 3C17.163 3 17.7989 3.26339 18.2678 3.73223C18.7366 4.20107 19 4.83696 19 5.5Z" stroke="#7C0405" strokeWidth="1.5" />
              </svg>
              <FavoriteButton product={producto} size="24px" />
            </IconsContainer>
          </MobileTopRow>

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
                descripcion={producto.descripcion_completa}
                especificaciones={producto.especificaciones}
                politicas={null} // Idem
              />
            </div>
          </MainLayout>

          <SingleSimilares producto={producto} />
        </ContentWrapper>
      </PageContainer>
      <GiftCardSection>
        <GiftCard />
      </GiftCardSection>
    </>
  );
}
