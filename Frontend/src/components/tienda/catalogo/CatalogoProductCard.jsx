import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { generateProductUrl } from '../../../utils/productUrl';

// ─── SVG Icons ────────────────────────────────────────────────────────────────

const HeartOutline = () => (
  <svg viewBox="0 0 24 24">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
);

const CartIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 22C8.55228 22 9 21.5523 9 21C9 20.4477 8.55228 20 8 20C7.44772 20 7 20.4477 7 21C7 21.5523 7.44772 22 8 22Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M19 22C19.5523 22 20 21.5523 20 21C20 20.4477 19.5523 20 19 20C18.4477 20 18 20.4477 18 21C18 21.5523 18.4477 22 19 22Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2.05078 2.0498H4.05078L6.71078 14.4698C6.80836 14.9247 7.06145 15.3313 7.42649 15.6197C7.79153 15.908 8.24569 16.0602 8.71078 16.0498H18.4908C18.946 16.0491 19.3873 15.8931 19.7418 15.6076C20.0964 15.3222 20.3429 14.9243 20.4408 14.4798L22.0908 7.0498H5.12078" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatPrice = (price) => {
  if (!price) return '$0';
  return '$' + Number(price).toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

const getProductTag = (producto) => {
  const name = (producto.nombre || '').toLowerCase();
  const discount = producto.descuento || 0;
  if (name.includes('combo') || name.includes('sachet') || name.includes('kit')) {
    return { label: 'Combo', bg: '#E5A9A9', color: 'var(--color-bordo-tercero)' };
  }
  if (discount >= 30) {
    return { label: '2x1', bg: '#FAF0F0', color: 'var(--color-bordo-secundario)' };
  }
  return null;
};

// ─── Styled Components ────────────────────────────────────────────────────────

const ProductCard = styled.div`
  background-color: white;
  border-radius: 24px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  position: relative;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.02);
  border: 1px solid #ece9e4;

  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.07);
  }

  @media (max-width: 600px) {
    padding: 12px;
    border-radius: 16px;
  }
`;

const CardImageContainer = styled.div`
  width: 100%;
  height: 200px;
  background-color: #fff;
  border-radius: var(--radius-md);
  margin-bottom: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  position: relative;
  cursor: pointer;

  img.product-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    transition: transform 0.4s ease;
  }

  ${ProductCard}:hover img.product-img {
    transform: scale(1.05);
  }

  @media (max-width: 600px) {
    height: 160px;
    margin-bottom: 10px;
  }
`;


const LeftTopTag = styled.span`
  position: absolute;
  top: 10px;
  left: 10px;
  background-color: ${({ $bg }) => $bg || '#faf0f0'};
  color: ${({ $color }) => $color || 'var(--color-bordo-secundario)'};
  font-size: 0.7rem;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 6px;
  z-index: 2;
  text-transform: uppercase;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
`;

const DiscountBadgeAbsolute = styled.span`
  position: absolute;
  top: 15px;
  right: 15px;
  z-index: 2;
  background-color: var(--color-bordo-secundario);
  color: white;
  font-size: 0.65rem;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: bold;
`;

const DiscountBadgeImage = styled.img`
  position: absolute;
  top: 15px;
  right: 15px;
  z-index: 2;
  width: 54px;
  height: 54px;
  object-fit: contain;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.15));

  @media (max-width: 600px) {
    width: 38px;
    height: 38px;
  }
`;

const HeartContainer = styled.div`
  position: absolute;
  bottom: 15px;
  right: 15px;
  z-index: 2;
`;

const HeartIcon = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${({ $fav }) => ($fav ? 'var(--color-bordo-secundario)' : '#bdbdbd')};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: transform 0.2s ease;

  svg {
    width: 22px;
    height: 22px;
    fill: ${({ $fav }) => ($fav ? 'var(--color-bordo-secundario)' : 'none')};
    stroke: var(--color-bordo-secundario);;
    stroke-width: 2;

    @media (max-width: 600px) {
      width: 20px;
      height: 20px;
    }
  }

  &:hover {
    color: currentColor;
    transform: scale(1.1);
  }
`;

const ProductBrand = styled.div`
  font-size: 0.65rem;
  font-weight: 600;
  color: var(--color-marron-secundario);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  letter-spacing: 10%;
  margin-bottom: 15px;

  @media (max-width: 600px) {
    margin-bottom: 10px;
  }
`;

const ProductName = styled.h3`
  font-size: 16px;
  color: black;
  font-family: var(--font-family-secondary);
  font-weight: 400;
  margin-bottom: 4px;
  line-height: 1.2;
  letter-spacing: 0%;
  cursor: pointer;

  @media (max-width: 600px) {
    font-size: 14px;
  }
`;

const PriceRow = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  column-gap: 10px;
  row-gap: 4px;
  margin-bottom: 6px;

  @media (max-width: 1024px) {
    column-gap: 6px;
  }
`;

const OldPrice = styled.span`
  font-size: 0.85rem;
  color: #a0a0a0;
  text-decoration: line-through;
`;

const CurrentPrice = styled.span`
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--color-bordo-secundario);

  @media (max-width: 600px) {
    font-size: 1.1rem;
  }
`;

const DiscountBadge = styled.span`
  background-color: var(--color-b);
  color: white;
  font-size: 0.7rem;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: bold;
`;

const Installments = styled.div`
  font-size: 0.85rem;
  color: #535353;
  margin-bottom: 6px;
  font-weight: 600;

  @media (max-width: 600px) {
    font-size: 0.75rem;
  }
`;

const LegalText = styled.div`
  font-size: 0.7rem;
  color: #b0b0b0;
  margin-bottom: 20px;
  font-weight: 400;

  @media (max-width: 600px) {
    margin-bottom: 12px;
    font-size: 0.65rem;
  }
`;

const AddButton = styled.button`
  background-color: var(--color-marron-cuarto);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 16px 24px;
  font-weight: 500;
  font-size: 1rem;
  letter-spacing: 2%;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  transition: background-color 0.2s;
  margin-top: auto;
  width: 100%;

  @media (max-width: 600px) {
    padding: 12px 16px;
    font-size: 0.9rem;
    border-radius: 10px;
  }

  &:hover {
    background-color: var(--color-marron-principal);
  }
  
  svg {
    width: 20px;
    height: 20px;
    fill: none;
    stroke: currentColor;

    @media (max-width: 600px) {
      width: 18px;
      height: 18px;
    }
  }
`;

// ─── Componente ───────────────────────────────────────────────────────────────

export default function CatalogoProductCard({ product, isFav, onToggleFav, strapiUrl }) {
  const navigate = useNavigate();
  const id = product.id || product.documentId;
  const attrs = product.attributes || product;

  const nombre = attrs.nombre;
  const marca = attrs.marca;
  const descuento = attrs.descuento || 0;

  // Variante principal con stock
  const variantes = attrs.variantes || [];
  const mainVariant = variantes.find((v) => v.publicado !== false && v.stock > 0) || variantes[0] || {};
  const price = mainVariant.precio || 0;
  const offerPrice = mainVariant.precio_oferta || null;

  const tieneOferta = offerPrice && offerPrice > 0 && offerPrice < price;
  const currentPriceVal = tieneOferta ? offerPrice : price;
  const calcDescuento = tieneOferta ? Math.round((1 - offerPrice / price) * 100) : descuento;

  // Imagen de portada
  let imgUrl = null;
  if (attrs.portada?.data?.attributes?.url) {
    imgUrl = `${strapiUrl}${attrs.portada.data.attributes.url}`;
  } else if (attrs.portada?.url) {
    imgUrl = `${strapiUrl}${attrs.portada.url}`;
  }

  const visualTag = getProductTag(attrs);
  const availableBadges = [20, 30, 35, 40, 50];
  const hasImageBadge = availableBadges.includes(calcDescuento);

  const handleNavigate = () => {
    navigate(generateProductUrl(id, nombre));
  };

  return (
    <ProductCard>
      <CardImageContainer onClick={handleNavigate}>
        {visualTag && (
          <LeftTopTag $bg={visualTag.bg} $color={visualTag.color}>
            {visualTag.label}
          </LeftTopTag>
        )}

        {calcDescuento > 0 && hasImageBadge && (
          <DiscountBadgeImage src={`/ofertas/${calcDescuento}.png`} alt={`-${calcDescuento}% OFF`} />
        )}

        {calcDescuento > 0 && !hasImageBadge && (
          <DiscountBadgeAbsolute>-{calcDescuento}%</DiscountBadgeAbsolute>
        )}

        <HeartContainer>
          <HeartIcon
            $fav={isFav}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFav(id);
            }}
            aria-label={isFav ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          >
            <HeartOutline />
          </HeartIcon>
        </HeartContainer>

        {imgUrl ? (
          <img className="product-img" src={imgUrl} alt={nombre} />
        ) : (
          <svg viewBox="0 0 24 24" fill="#EAE7E0" style={{ width: '80px', height: '80px', opacity: 0.7 }}>
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
          </svg>
        )}
      </CardImageContainer>

      <ProductName title={nombre} onClick={handleNavigate}>{nombre}</ProductName>
      <ProductBrand>{marca || 'Marybe'}</ProductBrand>

      <PriceRow>
        {tieneOferta && <OldPrice>{formatPrice(price)}</OldPrice>}
        <CurrentPrice>{formatPrice(currentPriceVal)}</CurrentPrice>
        {calcDescuento > 0 && !tieneOferta && (
          <DiscountBadge>{calcDescuento}% OFF</DiscountBadge>
        )}
      </PriceRow>

      <Installments>
        3 cuotas sin interés de {formatPrice(Math.round(currentPriceVal / 3))}
      </Installments>
      <LegalText>
        Precio sin impuestos nacionales {formatPrice(Math.round(currentPriceVal * 0.79))}
      </LegalText>

      <AddButton id={`add-btn-${id}`}>
        Agregar <CartIcon />
      </AddButton>
    </ProductCard>
  );
}
