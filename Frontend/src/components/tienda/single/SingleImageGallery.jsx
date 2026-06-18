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
  
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
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

export default function SingleImageGallery({ images, nombre }) {
  const [activeIndex, setActiveIndex] = useState(0);

  // Mapeamos o filtramos por si no vienen imágenes
  const validImages = images && images.length > 0 ? images : ['/placeholder.png'];
  const mainImage = validImages[activeIndex];

  return (
    <GalleryContainer>
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

      <MainImageContainer>
        <img src={mainImage} alt={nombre} />
      </MainImageContainer>
    </GalleryContainer>
  );
}
