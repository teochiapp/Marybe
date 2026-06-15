import React, { useState } from 'react';
import styled from 'styled-components';

const InfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  color: #28180B;
  font-family: var(--font-family-secondary);
`;

const TopRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const PillsContainer = styled.div`
  display: flex;
  gap: 10px;
`;

const Pill = styled.span`
  background-color: #EAC9C9;
  color: var(--color-titulo-marybe);
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
`;

const IconsContainer = styled.div`
  display: flex;
  gap: 15px;
  color: var(--color-titulo-marybe);
  
  svg {
    width: 24px;
    height: 24px;
    cursor: pointer;
    transition: transform 0.2s;
    
    &:hover {
      transform: scale(1.1);
    }
  }
`;

const Brand = styled.h4`
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: #555;
  margin-bottom: 8px;
  font-weight: 600;
`;

const Title = styled.h1`
  font-family: var(--font-family-secondary);
  font-size: 2.5rem;
  font-weight: 400;
  line-height: 1.1;
  margin-bottom: 15px;
  text-transform: uppercase;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const SubBadges = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #28180B;
  margin-bottom: 20px;

  span:not(:last-child)::after {
    content: '|';
    margin-left: 10px;
    color: #ccc;
    font-weight: 400;
  }
`;

const DescriptionExcerpt = styled.p`
  font-size: 0.95rem;
  line-height: 1.5;
  color: #555;
  margin-bottom: 25px;
`;

const PriceBlock = styled.div`
  margin-bottom: 30px;
`;

const OldPrice = styled.div`
  font-size: 1.2rem;
  color: #A0A0A0;
  text-decoration: line-through;
  margin-bottom: 5px;
`;

const CurrentPriceRow = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 10px;
`;

const CurrentPrice = styled.span`
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--color-titulo-marybe);
`;

const DiscountBadge = styled.span`
  background-color: var(--color-titulo-marybe);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: bold;
`;

const PaymentLink = styled.button`
  background: none;
  border: none;
  color: #8E8E8E;
  font-size: 0.85rem;
  text-decoration: underline;
  cursor: pointer;
  padding: 0;
  margin-bottom: 15px;
`;

const InstallmentsText = styled.div`
  font-size: 0.95rem;
  color: #555;
  margin-bottom: 5px;

  span {
    font-weight: 600;
    color: #28180B;
  }
`;

const LegalText = styled.div`
  font-size: 0.75rem;
  color: #A0A0A0;
`;

const OptionLabel = styled.div`
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 10px;
`;

const SizesContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 25px;
  flex-wrap: wrap;
`;

const SizeBtn = styled.button`
  border: 1px solid ${({ $active }) => ($active ? 'var(--color-titulo-marybe)' : '#ccc')};
  background-color: ${({ $active }) => ($active ? '#fffaf8' : '#fff')};
  color: ${({ $active }) => ($active ? 'var(--color-titulo-marybe)' : '#555')};
  border-radius: 20px;
  padding: 8px 16px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: var(--color-titulo-marybe);
  }
`;

const ColorsContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
`;

const ColorBtn = styled.button`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 2px solid ${({ $active }) => ($active ? '#28180B' : '#EAEAEA')};
  background-color: ${({ $color }) => $color};
  cursor: pointer;
  padding: 0;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: -4px;
    left: -4px;
    right: -4px;
    bottom: -4px;
    border-radius: 50%;
    border: 1px solid ${({ $active }) => ($active ? '#28180B' : 'transparent')};
  }
`;

const StockInfo = styled.div`
  font-size: 0.85rem;
  color: #555;
  margin-bottom: 25px;
`;

const ActionRow = styled.div`
  display: flex;
  gap: 15px;
  margin-bottom: 30px;

  @media (max-width: 600px) {
    flex-direction: column;
  }
`;

const QuantityBox = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid #ccc;
  border-radius: 8px;
  height: 48px;
  padding: 0 10px;
  width: 120px;
  justify-content: space-between;

  button {
    background: none;
    border: none;
    font-size: 1.2rem;
    cursor: pointer;
    color: #555;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 100%;
  }

  span {
    font-weight: 500;
  }
`;

const AddToCartBtn = styled.button`
  flex: 1;
  background-color: #280101;
  color: white;
  border: none;
  border-radius: 8px;
  height: 48px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  transition: background-color 0.2s;

  &:hover {
    background-color: var(--color-titulo-marybe);
  }

  svg {
    width: 20px;
    height: 20px;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.5;
  }
`;

const ShippingInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  border-top: 1px solid #EAEAEA;
  padding-top: 25px;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  font-size: 0.85rem;
  color: #555;

  svg {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
    color: #888;
  }

  a {
    color: var(--color-titulo-marybe);
    text-decoration: underline;
    cursor: pointer;
    font-weight: 500;
    margin-left: 5px;
  }
`;

const formatPrice = (price) => {
  if (!price) return '$0';
  return '$' + Number(price).toLocaleString('es-AR', { minimumFractionDigits: 0 });
};

export default function SingleProductInfo({ producto }) {
  const [qty, setQty] = useState(1);
  const [selectedSize, setSelectedSize] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);

  if (!producto) return null;

  const { nombre, marca, descripcion, descuento } = producto;
  const variantes = producto.variantes || [];
  
  // Determinamos los tamaños disponibles
  const sizes = variantes.map(v => v.volumen || 'Único');
  
  // Usamos el precio de la variante seleccionada
  const activeVariant = variantes[selectedSize] || {};
  const price = activeVariant.precio || 0;
  const offerPrice = activeVariant.precio_oferta || null;

  // Calculo del precio con impuestos (solo informativo como en el diseño)
  const priceWithoutTaxes = Math.round((offerPrice || price) * 0.79);
  const installmentValue = Math.round((offerPrice || price) / 3);

  // Colores mock para el diseño (se pueden mapear desde Strapi si existen)
  const mockColors = ['#EAEAEA', '#3E0102', '#0055FF', '#FFB800'];

  return (
    <InfoContainer>
      <TopRow>
        <PillsContainer>
          {descuento > 0 && <Pill>Super oferta</Pill>}
        </PillsContainer>
        <IconsContainer>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" y1="2" x2="12" y2="15" />
          </svg>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </IconsContainer>
      </TopRow>

      <Brand>{marca}</Brand>
      <Title>{nombre}</Title>

      <SubBadges>
        {marca && <span>{marca}</span>}
        <span>Edición limitada</span>
      </SubBadges>

      {descripcion && <DescriptionExcerpt>{descripcion}</DescriptionExcerpt>}

      <PriceBlock>
        {offerPrice && <OldPrice>{formatPrice(price)}</OldPrice>}
        <CurrentPriceRow>
          <CurrentPrice>{formatPrice(offerPrice || price)}</CurrentPrice>
          {descuento > 0 && <DiscountBadge>- {descuento}%</DiscountBadge>}
        </CurrentPriceRow>
        
        <PaymentLink>Ver medios de pago</PaymentLink>
        
        <InstallmentsText>
          3 cuotas sin interés de <span>{formatPrice(installmentValue)}</span>
        </InstallmentsText>
        <LegalText>Precio sin impuestos nacionales {formatPrice(priceWithoutTaxes)}</LegalText>
      </PriceBlock>

      {sizes.length > 0 && sizes[0] !== 'Único' && (
        <>
          <OptionLabel>Tamaño</OptionLabel>
          <SizesContainer>
            {sizes.map((size, idx) => (
              <SizeBtn 
                key={idx} 
                $active={selectedSize === idx}
                onClick={() => setSelectedSize(idx)}
              >
                {size}
              </SizeBtn>
            ))}
          </SizesContainer>
        </>
      )}

      {/* Renderizado condicional para colores, estático por ahora */}
      <OptionLabel>Color</OptionLabel>
      <ColorsContainer>
        {mockColors.map((color, idx) => (
          <ColorBtn 
            key={idx} 
            $color={color} 
            $active={selectedColor === idx}
            onClick={() => setSelectedColor(idx)}
          />
        ))}
      </ColorsContainer>

      <StockInfo>Stock Disponible (+25 disponibles)</StockInfo>

      <OptionLabel>Cantidad</OptionLabel>
      <ActionRow>
        <QuantityBox>
          <button onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
          <span>{qty}</span>
          <button onClick={() => setQty(qty + 1)}>+</button>
        </QuantityBox>
        <AddToCartBtn>
          Agregar 
          <svg viewBox="0 0 24 24">
            <path d="M9 20a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm7 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm-8.8-4h9.6l2.4-12H5.6L4.2 1H1v2h2.2l3.4 17h11v-2H7.6l-.4-2zM6.4 6h12.6l-1.6 8H7.2L6.4 6z" />
          </svg>
        </AddToCartBtn>
      </ActionRow>

      <ShippingInfo>
        <InfoItem>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <div>
            Retira gratis en nuestras sucursales
            <a>Ver sucursales</a>
          </div>
        </InfoItem>
        <InfoItem>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="1" y="3" width="15" height="13" />
            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
            <circle cx="5.5" cy="18.5" r="2.5" />
            <circle cx="18.5" cy="18.5" r="2.5" />
          </svg>
          <div>
            Calculá costo de envío
            <a>Calcular costo</a>
          </div>
        </InfoItem>
        <InfoItem>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 12 20 22 4 22 4 12" />
            <rect x="2" y="7" width="20" height="5" />
            <line x1="12" y1="22" x2="12" y2="7" />
            <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
            <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
          </svg>
          <div>
            Si es para regalo, en el carrito de compras podrás dejar un mensaje personalizado para esa persona.
          </div>
        </InfoItem>
      </ShippingInfo>
    </InfoContainer>
  );
}
