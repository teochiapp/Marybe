import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { generateProductUrl } from '../../../utils/productUrl';
import { getColorHex } from '../../../utils/colorMap';
import AddToCartModal from '../../carrito/AddToCartModal';
import VariantSelector from '../../shared/VariantSelector';
import { getVariantPrice, variantesReales, getMainVariant, sortSizes } from '../../../utils/productPrice';

// ─── SVG Icons ────────────────────────────────────────────────────────────────

import FavoriteButton from '../../shared/FavoriteButton';

const CartIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 22C8.55228 22 9 21.5523 9 21C9 20.4477 8.55228 20 8 20C7.44772 20 7 20.4477 7 21C7 21.5523 7.44772 22 8 22Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M19 22C19.5523 22 20 21.5523 20 21C20 20.4477 19.5523 20 19 20C18.4477 20 18 20.4477 18 21C18 21.5523 18.4477 22 19 22Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M2.05078 2.0498H4.05078L6.71078 14.4698C6.80836 14.9247 7.06145 15.3313 7.42649 15.6197C7.79153 15.908 8.24569 16.0602 8.71078 16.0498H18.4908C18.946 16.0491 19.3873 15.8931 19.7418 15.6076C20.0964 15.3222 20.3429 14.9243 20.4408 14.4798L22.0908 7.0498H5.12078" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatPrice = (price) => {
  if (!price) return '$0';
  return '$' + Number(price).toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

const getProductTag = (producto) => {
  if (producto.caracteristicas) {
    return { label: producto.caracteristicas.split('|')[0].trim(), bg: '#FAF0F0', color: 'var(--color-bordo-secundario)' };
  }
  const name = (producto.nombre || '').toLowerCase();
  if (name.includes('combo') || name.includes('sachet') || name.includes('kit')) {
    return { label: 'Combo', bg: '#E5A9A9', color: 'var(--color-bordo-tercero)' };
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
  height: 100%;
  min-height: 480px;

  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.07);
  }

  @media (max-width: 600px) {
    padding: 12px;
    border-radius: 16px;
    min-height: 430px;
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

const ProductBrand = styled.div`
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-marron-secundario);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  letter-spacing: 10%;
  margin-bottom: 4px;
  height: 1.2em;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;

  @media (max-width: 600px) {
    margin-bottom: 4px;
  }
`;

const ProductName = styled.h3`
  font-size: 16px;
  color: black;
  font-family: var(--font-family-secondary);
  font-weight: 400;
  margin-bottom: 10px;
  line-height: 1.2;
  letter-spacing: 0%;
  cursor: pointer;

  /* Siempre reserva espacio para exactamente 2 líneas */
  height: calc(2 * 1.2em);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;

  @media (max-width: 600px) {
    font-size: 14px;
    height: calc(2 * 1.2em);
  }
`;

const VariantArea = styled.div`
  min-height: ${({ $hasVariants }) => ($hasVariants ? '58px' : '0px')};
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  margin-bottom: ${({ $hasVariants }) => ($hasVariants ? '8px' : '10px')};

  @media (max-width: 600px) {
    min-height: ${({ $hasVariants }) => ($hasVariants ? '52px' : '0px')};
  }
`;

const PriceRow = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  column-gap: 10px;
  row-gap: 4px;
  margin-bottom: 6px;
  min-height: 28px;

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
  margin-bottom: 4px;
  font-weight: 600;
  min-height: 1.2em;
  display: flex;
  align-items: center;

  @media (max-width: 600px) {
    font-size: 0.75rem;
    min-height: 1.2em;
  }
`;

const LegalText = styled.div`
  font-size: 0.7rem;
  color: #b0b0b0;
  margin-bottom: 16px;
  font-weight: 400;
  min-height: 1.2em;

  @media (max-width: 600px) {
    margin-bottom: 10px;
    font-size: 0.65rem;
  }
`;

const AddButton = styled.button`
  background-color: var(--color-marron-principal);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 14px 24px;
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
    background-color: var(--color-bordo-secundario);
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

export default function CatalogoProductCard({ product, strapiUrl }) {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const id = product.id || product.documentId;
  const attrs = product.attributes || product;

  const nombre = attrs.nombre;
  const marca = attrs.marca;
  const descuento = attrs.descuento || 0;

  const variantes = attrs.variantes || [];

  // Extraer colores
  const variantesConColor = variantes.filter(v => v.color_nombre);
  const colorMap = new Map();
  variantesConColor.forEach(v => {
    if (!colorMap.has(v.color_nombre)) colorMap.set(v.color_nombre, v);
  });
  const coloresUnicos = [...colorMap.entries()];
  const tieneColores = coloresUnicos.length > 0;

  // Extraer talles
  const sizes = sortSizes([...new Set(variantes.map(v => v.volumen || 'Único'))]);
  const tieneVariantesTam = sizes.length > 0 && (sizes.length > 1 || sizes[0] !== 'Único');
  const tieneVariantes = tieneColores || tieneVariantesTam;

  // Inicializar seleccionado con la variante principal real
  const mainV = getMainVariant(attrs);
  const initialColor = mainV?.color_nombre || (coloresUnicos[0]?.[0] || null);
  const initialSizeVal = mainV?.volumen || sizes[0];
  const initialSizeIdx = sizes.indexOf(initialSizeVal) !== -1 ? sizes.indexOf(initialSizeVal) : 0;

  const [selectedColor, setSelectedColor] = useState(initialColor);
  const [selectedSize, setSelectedSize] = useState(initialSizeIdx);

  // Determinar variante activa
  const currentSize = sizes[selectedSize] || sizes[0];
  let activeVariant = variantes.find(v => {
    const matchSize = tieneVariantesTam ? (v.volumen || 'Único') === currentSize : true;
    const matchColor = tieneColores ? v.color_nombre === selectedColor : true;
    return matchSize && matchColor;
  });

  if (!activeVariant) {
    if (tieneColores && selectedColor) {
      activeVariant = colorMap.get(selectedColor) || variantesReales(variantes)[0] || variantes[0] || {};
    } else {
      activeVariant = variantes.find(v => (v.volumen || 'Único') === currentSize) || variantesReales(variantes)[0] || variantes[0] || {};
    }
  }

  // Precios
  const variantPriceInfo = getVariantPrice(activeVariant, attrs);
  const price = variantPriceInfo.price;
  const offerPrice = variantPriceInfo.offerPrice;
  const tieneOferta = variantPriceInfo.tieneOferta;
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

  const getStampValue = (descuento) => {
    if (descuento <= 10) return 10;
    if (descuento <= 15) return 15;
    if (descuento <= 20) return 20;
    if (descuento <= 25) return 25;
    if (descuento <= 30) return 30;
    if (descuento <= 35) return 35;
    if (descuento <= 40) return 40;
    if (descuento <= 50) return 50;
    return 60;
  };

  const stampVal = calcDescuento > 0 ? getStampValue(calcDescuento) : null;

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

        {stampVal && (
          <DiscountBadgeImage src={`/ofertas/${stampVal}.png`} alt={`Hasta ${stampVal}% OFF`} />
        )}

        <HeartContainer>
          <FavoriteButton product={product} />
        </HeartContainer>

        {imgUrl ? (
          <img className="product-img" src={imgUrl} alt={nombre} />
        ) : (
          <svg viewBox="0 0 24 24" fill="#EAE7E0" style={{ width: '80px', height: '80px', opacity: 0.7 }}>
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
          </svg>
        )}
      </CardImageContainer>

      <ProductBrand>{marca || 'Marybe'}</ProductBrand>
      <ProductName title={nombre} onClick={handleNavigate}>{nombre}</ProductName>

      <VariantArea $hasVariants={tieneVariantes} onClick={(e) => e.stopPropagation()}>
        <VariantSelector
          compact={true}
          coloresUnicos={coloresUnicos}
          selectedColor={selectedColor}
          onColorSelect={setSelectedColor}
          sizes={sizes}
          selectedSize={selectedSize}
          onSizeSelect={setSelectedSize}
          tieneColores={tieneColores}
          tieneVariantesTam={tieneVariantesTam}
          variantes={variantes}
        />
      </VariantArea>

      <PriceRow>
        {tieneOferta && <OldPrice>{formatPrice(price)}</OldPrice>}
        <CurrentPrice>{formatPrice(currentPriceVal)}</CurrentPrice>
        {calcDescuento > 0 && !tieneOferta && (
          <DiscountBadge>{calcDescuento}% OFF</DiscountBadge>
        )}
      </PriceRow>

      {attrs.especificaciones && (
        <Installments>{attrs.especificaciones}</Installments>
      )}
      <LegalText>
        Precio sin impuestos nacionales {formatPrice(Math.round(currentPriceVal * 0.79))}
      </LegalText>

      <AddButton id={`add-btn-${id}`} onClick={(e) => { e.stopPropagation(); setIsModalOpen(true); }}>
        Agregar <CartIcon />
      </AddButton>

      <AddToCartModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={product}
        initialMode="select"
        addedVariant={activeVariant}
      />
    </ProductCard>
  );
}
