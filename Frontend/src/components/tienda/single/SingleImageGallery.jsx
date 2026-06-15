import React, { useState } from 'react';
import styled from 'styled-components';

const GalleryContainer = styled.div`
  display: flex;
  gap: 20px;
  
  @media (max-width: 768px) {
    flex-direction: column-reverse;
  }
`;

const ThumbnailsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 80px;

  @media (max-width: 768px) {
    flex-direction: row;
    width: 100%;
    overflow-x: auto;
    padding-bottom: 10px;
    
    &::-webkit-scrollbar {
      display: none;
    }
  }
`;

const Thumbnail = styled.button`
  width: 80px;
  height: 80px;
  border-radius: 12px;
  border: 1px solid ${({ $active }) => ($active ? 'var(--color-titulo-marybe)' : '#EAEAEA')};
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
    border-color: var(--color-titulo-marybe);
  }
`;

const MainImageContainer = styled.div`
  flex: 1;
  background-color: #fff;
  border-radius: 20px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 40px;
  min-height: 500px;
  
  img {
    width: 100%;
    max-height: 500px;
    object-fit: contain;
  }

  @media (max-width: 768px) {
    min-height: 350px;
    padding: 20px;
    
    img {
      max-height: 350px;
    }
  }
`;

export default function SingleImageGallery({ images, nombre }) {
  const [activeIndex, setActiveIndex] = useState(0);

  // Mapeamos o filtramos por si no vienen imágenes
  const validImages = images && images.length > 0 ? images : ['/placeholder.png'];
  const mainImage = validImages[activeIndex];

  return (
    <GalleryContainer>
      {validImages.length > 1 && (
        <ThumbnailsContainer>
          {validImages.map((img, idx) => (
            <Thumbnail
              key={idx}
              $active={activeIndex === idx}
              onClick={() => setActiveIndex(idx)}
            >
              <img src={img} alt={`${nombre} thumbnail ${idx + 1}`} />
            </Thumbnail>
          ))}
        </ThumbnailsContainer>
      )}

      <MainImageContainer>
        <img src={mainImage} alt={nombre} />
      </MainImageContainer>
    </GalleryContainer>
  );
}
