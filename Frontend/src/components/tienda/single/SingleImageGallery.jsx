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

const ThumbnailsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 80px;

  @media (max-width: 768px) {
    position: absolute;
    left: 0px;
    top: 10px;
    width: 60px;
    gap: 8px;
    z-index: 10;
  }
`;

const Thumbnail = styled.button`
  box-sizing: border-box;
  width: 80px;
  height: 80px;
  border-radius: 12px;
  border: 1px solid ${({ $active }) => ($active ? '#28180B' : '#EAEAEA')};
  background-color: #fff;
  overflow: hidden;
  cursor: pointer;
  padding: 8px;
  transition: all 0.2s ease;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  &:hover {
    border-color: #28180B;
  }

  @media (max-width: 768px) {
    width: 60px;
    height: 60px;
    padding: 4px;
    border-radius: 8px;
    background-color: rgba(255, 255, 255, 0.9);
  }
`;

const MainImageContainer = styled.div`
  flex: 1;
  background-color: #fff;
  border-radius: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
  aspect-ratio: 1 / 1;
  max-height: 600px;
  overflow: hidden;
  position: relative;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    transition: transform 0.1s ease-out;
    cursor: zoom-in;
  }

  @media (max-width: 768px) {
    width: 100%;
    min-height: 350px;
    padding: 20px;
    box-sizing: border-box;
    
    img {
      max-height: 350px;
    }
  }
`;

export default function SingleImageGallery({ images, nombre, activeIndex, setActiveIndex }) {
  const [zoomStyle, setZoomStyle] = useState({ transformOrigin: 'center center' });
  const [isZooming, setIsZooming] = useState(false);

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

  return (
    <GalleryContainer>
      <ThumbnailsContainer>
        {validImages.map((img, idx) => (
          <Thumbnail
            key={idx}
            $active={activeIndex === idx}
            onClick={() => setActiveIndex(idx)}
          >
            <img src={img.url} alt={`${nombre} thumbnail ${idx + 1}`} />
          </Thumbnail>
        ))}
      </ThumbnailsContainer>

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
