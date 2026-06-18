import React from 'react';
import styled from 'styled-components';

const GalleryWrapper = styled.div`
  display: flex;
  gap: 20px;

  @media (max-width: 768px) {
    flex-direction: column-reverse;
    align-items: center;
  }
`;

const ThumbList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;

  @media (max-width: 768px) {
    flex-direction: row;
  }
`;

const Thumb = styled.button`
  width: 64px;
  height: 64px;
  border-radius: var(--radius-md);
  border: 1.5px solid var(--color-giftcard-borde);
  background-color: var(--color-giftcard-crema);
  padding: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition-fast);

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  &:hover {
    border-color: var(--color-giftcard-oro);
  }
`;

const MainImageBox = styled.div`
  flex: 1;
  background-color: var(--color-blanco);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  min-height: 600px;
  overflow: visible;

  img {
    width: 100%;
    max-width: none;
    height: auto;
    object-fit: contain;
    transform: scale(1.2);
    transform-origin: center;
    filter: drop-shadow(rgba(0, 0, 0, 0.12) 0px 16px 28px);
  }

  @media (max-width: 768px) {
    min-height: 360px;
    padding: 8px;
  }
`;

export default function GiftCardGallery() {
  return (
    <GalleryWrapper>
      <ThumbList>
        <Thumb type="button" aria-label="Vista gift card Marybe">
          <img src="/inicio/giftcard.png" alt="Miniatura gift card Marybe" />
        </Thumb>
      </ThumbList>

      <MainImageBox>
        <img src="/inicio/giftcard.png" alt="Gift card Marybe" />
      </MainImageBox>
    </GalleryWrapper>
  );
}
