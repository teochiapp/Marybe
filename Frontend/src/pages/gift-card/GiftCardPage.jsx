import React, { useEffect } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

import GiftCardGallery from '../../components/gift-card/GiftCardGallery';
import GiftCardInfo from '../../components/gift-card/GiftCardInfo';
import GiftCardAccordion from '../../components/gift-card/GiftCardAccordion';
import GiftCardDestacados from '../../components/gift-card/GiftCardDestacados';

const PageContainer = styled.div`
  min-height: 100vh;
  background-color: var(--color-blanco);
  padding: 28px 60px 80px;

  @media (max-width: 1024px) {
    padding: 24px 20px 60px;
  }
`;

const ContentWrapper = styled.div`
  max-width: 1300px;
  margin: 0 auto;
`;

const Breadcrumbs = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-family-secondary);
  font-size: 0.85rem;
  color: var(--color-rosa-tercero);
  margin-bottom: 28px;

  a {
    color: var(--color-marron-secundario);
    opacity: 0.7;
    text-decoration: none;
    transition: var(--transition-fast);

    &:hover {
      opacity: 1;
      color: var(--color-bordo-secundario);
    }
  }

  span {
    user-select: none;
  }
`;

const MainLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: start;

  @media (max-width: 1024px) {
    gap: 40px;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const RightColumn = styled.div`
  display: flex;
  flex-direction: column;
`;

export default function GiftCardPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <PageContainer>
      <ContentWrapper>
        <Breadcrumbs>
          <Link to="/inicio">Inicio</Link>
          <span>/</span>
          <span>Gift card</span>
        </Breadcrumbs>

        <MainLayout>
          <GiftCardGallery />

          <RightColumn>
            <GiftCardInfo />
            <GiftCardAccordion />
          </RightColumn>
        </MainLayout>

        <GiftCardDestacados />
      </ContentWrapper>
    </PageContainer>
  );
}
