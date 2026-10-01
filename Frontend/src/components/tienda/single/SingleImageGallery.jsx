import React, { useState } from 'react';
import styled from 'styled-components';

const GalleryContainer = styled.div`
  display: flex;
  gap: 20px;
  
  @media (max-width: 768px) {
    position: relative;
    gap: 0;
    display: block;
  }
`;

const ThumbnailsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  
  @media (max-width: 768px) {
    position: absolute;
    left: 5px;
    top: 5px;
    z-index: 10;
  }
`;

const ThumbnailsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 80px;

  @media (max-width: 768px) {
    width: 60px;
    gap: 8px;
  }
`;

const NavButton = styled.button`
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #EAEAEA;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #28180B;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  
  &:hover:not(:disabled) {
    background: #fff;
    border-color: #28180B;
    transform: scale(1.05);
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
    box-shadow: none;
  }
`;

const Thumbnail = styled.button`
  box-sizing: border-box;
  width: 80px;
  height: 80px;
  border-radius: 12px;
  border: 1.5px solid ${({ $active }) => ($active ? '#7C0405' : '#EAEAEA')};
  background-color: #fff;
  overflow: hidden;
  cursor: pointer;
  padding: 8px;
  transition: all 0.2s ease;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &:hover {
    border-color: #7C0405;
  }

  @media (max-width: 768px) {
    width: 54px;
    height: 54px;
    padding: 4px;
    border-radius: 10px;
    background-color: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1.5px solid ${({ $active }) => ($active ? '#7C0405' : 'rgba(255, 255, 255, 0.6)')};
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  }
`;

const MainImageContainer = styled.div`
  flex: 1;
  background-color: transparent;
  border-radius: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  aspect-ratio: 1 / 1;
  max-height: 600px;
  overflow: hidden;
  position: relative;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.1s ease-out;
    cursor: zoom-in;
  }

  @media (max-width: 768px) {
    width: 100%;
    min-height: 350px;
    box-sizing: border-box;
    
    img {
      max-height: 350px;
    }
  }
`;

export default function SingleImageGallery({ images, nombre, activeIndex, setActiveIndex }) {
  const [zoomStyle, setZoomStyle] = useState({ transformOrigin: 'center center' });
  const [isZooming, setIsZooming] = useState(false);
  const [page, setPage] = useState(0);

  const VISIBLE_THUMBS = 4;

  // Sincronizar la página de thumbnails sólo cuando cambia la imagen activa (por ej, desde las variantes)
  React.useEffect(() => {
    setPage((prevPage) => {
      if (activeIndex < prevPage) {
        return activeIndex;
      } else if (activeIndex >= prevPage + VISIBLE_THUMBS) {
        return activeIndex - VISIBLE_THUMBS + 1;
      }
      return prevPage;
    });
  }, [activeIndex]); // No dependemos de 'page' para que el scroll manual funcione

  const handleMouseMove = (e) => {
    // Only zoom on desktop devices, disable for touch since it can interfere with scrolling
    if (window.innerWidth <= 768) return;

    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({ transformOrigin: `${x}% ${y}%` });
  };

  const handleMouseEnter = () => {
    if (window.innerWidth > 768) {
      setIsZooming(true);
    }
  };

  const handleMouseLeave = () => {
    setIsZooming(false);
    setZoomStyle({ transformOrigin: 'center center' });
  };

  // Mapeamos o filtramos por si no vienen imágenes
  const validImages = images && images.length > 0 ? images : [{ url: '/placeholder.png' }];
  const mainImage = validImages[activeIndex] || validImages[0];

  const maxPage = Math.max(0, validImages.length - VISIBLE_THUMBS);

  return (
    <GalleryContainer>
      <ThumbnailsWrapper>
        {validImages.length > VISIBLE_THUMBS && (
          <NavButton onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
          </NavButton>
        )}

        <ThumbnailsContainer>
          {validImages.slice(page, page + VISIBLE_THUMBS).map((img, idx) => {
            const absoluteIndex = page + idx;
            return (
              <Thumbnail
                key={absoluteIndex}
                $active={activeIndex === absoluteIndex}
                onClick={() => setActiveIndex(absoluteIndex)}
              >
                <img src={img.url} alt={`${nombre} thumbnail ${absoluteIndex + 1}`} />
              </Thumbnail>
            );
          })}
        </ThumbnailsContainer>

        {validImages.length > VISIBLE_THUMBS && (
          <NavButton onClick={() => setPage(p => Math.min(maxPage, p + 1))} disabled={page >= maxPage}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </NavButton>
        )}
      </ThumbnailsWrapper>

      <MainImageContainer
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <img
          src={mainImage.url}
          alt={nombre}
          style={isZooming ? { transform: 'scale(2.5)', ...zoomStyle } : zoomStyle}
        />
      </MainImageContainer>
    </GalleryContainer>
  );
}
