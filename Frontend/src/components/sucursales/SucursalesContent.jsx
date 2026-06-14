import React from 'react';
import styled from 'styled-components';
import ArgentinaMap from './ArgentinaMap';
import SucursalCard from './SucursalCard';
import { sucursales } from './sucursalesData';

const Section = styled.section`
  background-color: #560203;
  padding: var(--spacing-xxl) var(--spacing-xl);
  min-height: 80vh;
`;

const Title = styled.h1`
  font-family: var(--font-family-primary);
  font-style: italic;
  font-weight: 500;
  font-size: 2.5rem;
  text-align: center;
  color: var(--color-blanco-pero-no-tan-blanco);
  margin: 0 0 var(--spacing-xxl);

  @media (max-width: 600px) {
    font-size: 1.9rem;
    margin-bottom: var(--spacing-xl);
  }
`;

const Layout = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-xxl);
  align-items: start;

  @media (max-width: 992px) {
    grid-template-columns: 1fr;
    gap: 0;
  }
`;

const MapColumn = styled.div`
  display: flex;
  justify-content: center;

  @media (max-width: 992px) {
    -webkit-mask-image: linear-gradient(to bottom, black 30%, transparent 52%);
    mask-image: linear-gradient(to bottom, black 30%, transparent 52%);
  }
`;

const BranchesColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);

  @media (max-width: 992px) {
    position: relative;
    z-index: 1;
    margin-top: -326px;
    background-color: #560203;
    border-radius: 20px 20px 0 0;
    padding-top: var(--spacing-xl);
  }
`;

const ProvinceGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
`;

const ProvinceTitle = styled.h2`
  font-family: var(--font-family-secondary);
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-size: 1rem;
  color: var(--color-blanco-pero-no-tan-blanco);
  margin: 0;
`;

const CardList = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
`;

export default function SucursalesContent() {
  return (
    <Section>
      <Title>Nuestras Sucursales</Title>
      <Layout>
        <MapColumn>
          <ArgentinaMap />
        </MapColumn>
        <BranchesColumn>
          {sucursales.map((provincia) => (
            <ProvinceGroup key={provincia.provincia}>
              <ProvinceTitle>{provincia.provincia}</ProvinceTitle>
              <CardList>
                {provincia.locales.map((local, index) => (
                  <SucursalCard
                    key={`${provincia.provincia}-${index}`}
                    direccion={local.direccion}
                    telefono={local.telefono}
                    telefonoFijo={local.telefonoFijo}
                    mapa={local.mapa}
                  />
                ))}
              </CardList>
            </ProvinceGroup>
          ))}
        </BranchesColumn>
      </Layout>
    </Section>
  );
}
