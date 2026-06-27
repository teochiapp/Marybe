import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import PaymentModal from './PaymentModal';
import ShippingModal from './ShippingModal';
import AddToCartModal from '../../carrito/AddToCartModal';
import { CartContext } from '../../../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import FavoriteButton from '../../shared/FavoriteButton';

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

  @media (max-width: 768px) {
    display: none;
  }
`;

const PillsContainer = styled.div`
  display: flex;
  gap: 10px;
`;

const Pill = styled.span`
  background-color: #F2D4D4;
  color: var(--color-bordo-tercero);
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 0.9rem;
  text-transform: uppercase;
  font-weight: 600;
`;

const IconsContainer = styled.div`
  display: flex;
  gap: 15px;
  color: #000000;
  
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
  font-size: 1rem;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 10%;
  color: #535353;
  margin-bottom: 8px;
  font-family: var(--font-family-primary);
`;

const Title = styled.h1`
  font-family: var(--font-family-secondary);
  font-size: 2rem;
  font-weight: 400;
  line-height: 1.3;
  margin-bottom: 15px;
  letter-spacing: 0%;
  text-transform: uppercase;
  color: #000000;

  @media (max-width: 768px) {
    font-size: 1.8rem;
  }
`;

const SubBadges = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  font-size: 1rem;
  font-weight: 500;
  color: var(--color-marron-cuarto);
  margin-bottom: 20px;

  span:not(:last-child)::after {
    content: '|';
    margin-left: 10px;
    color: black;
    font-weight: 500;
  }
`;

const DescriptionExcerpt = styled.p`
  font-size: 0.95rem;
  line-height: 1.5;
  color: #555;
  margin-bottom: 15px;
`;

const PriceBlock = styled.div`
  margin-bottom: 15px;
`;

const OldPrice = styled.div`
  font-size: 1.7rem;
  color: #BDBDBD;
  text-decoration: line-through;
  font-weight: 400;
`;

const CurrentPriceRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 4px;
`;

const CurrentPrice = styled.span`
  font-size: 2.2rem;
  font-weight: 700;
  color: #750707;
`;

const DiscountBadge = styled.span`
  background-color: #750707;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 600;
`;

const PaymentLink = styled.button`
  background-color: #FAF9F7;
  border: none;
  color: var(--color-bordo-tercero);
  font-size: 0.85rem;
  font-weight: 500;
  border-radius: 4px;
  cursor: pointer;
  padding: 4px 8px;
  margin-bottom: 10px;
`;

const CfteaText = styled.div`
  font-size: 0.9rem;
  font-weight: 400;
  color: #B2B2B2;
  margin-bottom: 15px;
`;

const InstallmentsText = styled.div`
  font-size: 0.95rem;
  color: #535353;
  margin-bottom: 2px;
  font-weight: 500;

  span {
    font-weight: 700;
    color: #000;
  }
`;

const LegalText = styled.div`
  font-size: 0.85rem;
  color: #535353;
`;

const OptionLabel = styled.div`
  font-size: 0.9rem;
  font-weight: 700;
  margin-bottom: 6px;
  color: #28180B;
`;

const SizesContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
  flex-wrap: wrap;
`;

const SizeBtn = styled.button`
  border: 1px solid ${({ $active }) => ($active ? '#750707' : '#ccc')};
  background-color: ${({ $active }) => ($active ? '#750707' : '#fff')};
  color: ${({ $active }) => ($active ? '#fff' : '#28180B')};
  border-radius: 12px;
  padding: 4px 12px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #750707;
  }
`;

const ColorsContainer = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
`;

const ColorBtn = styled.button`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: none;
  background-color: ${({ $color }) => $color};
  cursor: pointer;
  padding: 0;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: -6px;
    left: -6px;
    right: -6px;
    bottom: -6px;
    border-radius: 8px;
    border: 1px solid ${({ $active }) => ($active ? '#750707' : '#d8d2ca')};
    transition: border-color 0.2s ease;
  }
`;

const StockInfo = styled.div`
  font-size: 0.85rem;
  color: #555;
  margin-bottom: 15px;
`;

const ActionRow = styled.div`
  display: flex;
  gap: 15px;
  margin-bottom: 30px;
`;

const DesktopActionRow = styled.div`
  display: block;
  @media (max-width: 768px) {
    display: none;
  }
`;

const MobileActionRow = styled.div`
  display: none;
  @media (max-width: 768px) {
    display: block;
    margin-bottom: 10px;
  }
`;

const QuantityBox = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid #ccc;
  border-radius: 8px;
  height: 48px;
  padding: 0 5px;
  width: 110px;
  justify-content: space-between;

  button {
    background: none;
    border: none;
    font-size: 1.4rem;
    font-weight: 300;
    cursor: pointer;
    color: #555;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 100%;
  }

  span {
    font-weight: 600;
    font-size: 1rem;
    color: #000;
  }
`;

const QtyNumber = styled.div`
  position: relative;
  width: 30px;
  height: 26px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;

  span {
    position: absolute;
    font-weight: 500;
    color: #000000;
  }
`;


const AddToCartBtn = styled(motion.button)`
  flex: 1;
  background-color: ${({ $added }) => ($added ? '#2e7d32' : '#7C0405')};
  color: white;
  border: none;
  border-radius: 8px;
  height: 48px;
  padding: 8px 16px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  overflow: hidden;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: ${({ $added }) => ($added ? '#2e7d32' : '#3f0303')};
  }

  &:active {
    transform: translateY(0);
    box-shadow: none;
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
  margin-top: 15px;
  border-top: none;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  font-size: 0.85rem;
  color: #555;

  svg {
    width: 22px;
    height: 22px;
    flex-shrink: 0;
    color: #555;
    stroke-width: 1.5;
  }

  div {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    line-height: 1.4;
  }

  a {
    color: #000000;
    text-decoration: underline;
    cursor: pointer;
    font-weight: 500;
  }
`;

const formatPrice = (price) => {
  if (!price) return '$0';
  return '$' + Number(price).toLocaleString('es-AR', { minimumFractionDigits: 0 });
};

// Mapa de nombre de color → hex. Sincronizado con la hoja "🎨 Colores" del Excel.
const COLOR_MAP = {
  // Negros
  'Negro': '#1a1a1a',
  'Negro Azulado': '#0d0d1a',
  // Castaños
  'Castaño Oscuro': '#3E2009',
  'Castaño Natural': '#6B4226',
  'Castaño Claro': '#8B6347',
  'Castaño Ceniza': '#6B5B52',
  'Castaño Dorado': '#8B5E3C',
  'Chocolate': '#3D1C02',
  'Caoba': '#722F37',
  'Avellana': '#855E42',
  // Rubios
  'Rubio Oscuro': '#C8A96E',
  'Rubio Natural': '#E8C98A',
  'Rubio Claro': '#F5DEB3',
  'Rubio Dorado': '#DAA520',
  'Rubio Ceniza': '#D4C5A9',
  'Rubio Platinado': '#F0E6C8',
  'Miel': '#FFC30B',
  // Rojos y cobres
  'Rojo': '#CC0000',
  'Rojo Intenso': '#8B0000',
  'Bordo': '#5C0A0A',
  'Bordo Oscuro': '#3E0102',
  'Cobre': '#B87333',
  'Rojizo': '#9B2335',
  // Rosas
  'Rosa Claro': '#FFCDD2',
  'Rosa': '#FFB6C1',
  'Rosa Oscuro': '#C2185B',
  'Fucsia': '#FF0090',
  'Coral': '#FF6B6B',
  'Durazno': '#FFCBA4',
  // Nude / Beige
  'Nude': '#D4A574',
  'Beige': '#F5F5DC',
  'Arena': '#C2B280',
  'Marfil': '#FFFFF0',
  'Porcelana': '#F7E7CE',
  // Blancos
  'Blanco': '#FFFFFF',
  'Blanco Perla': '#F8F8F0',
  // Dorados / Plateados
  'Dorado': '#FFD700',
  'Plateado': '#C0C0C0',
  'Bronce': '#CD7F32',
  // Lilas / Violetas
  'Lavanda': '#E6E6FA',
  'Lila': '#C8A2C8',
  'Violeta': '#8B00FF',
  'Morado': '#6A0DAD',
  // Azules / Verdes
  'Azul': '#0055AA',
  'Turquesa': '#40E0D0',
  'Verde': '#228B22',
  'Verde Oliva': '#808000',
  // Grises
  'Gris Claro': '#D3D3D3',
  'Gris': '#808080',
  'Gris Oscuro': '#404040',
  // Transparentes
  'Transparente': '#E8E8E8',
  'Incoloro': '#F5F5F5',
};

export default function SingleProductInfo({ producto }) {
  const { addToCart } = useContext(CartContext);
  const [qty, setQty] = useState(1);
  const [qtyDir, setQtyDir] = useState(1);
  const [selectedSize, setSelectedSize] = useState(0);
  const [selectedColor, setSelectedColor] = useState(null); // null = ninguno seleccionado
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isShippingModalOpen, setShippingModalOpen] = useState(false);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [addingCart, setAddingCart] = useState(false);

  if (!producto) return null;

  console.log('📦 Datos del producto desde el Excel/Strapi:', producto);

  const { nombre, marca, descripcion_corta, descuento, caracteristicas } = producto;
  const variantes = producto.variantes || [];

  // ── Colores: extraer variantes únicas que tienen color_nombre ──
  const variantesConColor = variantes.filter(v => v.color_nombre);
  // Mapa: color_nombre → primera variante con ese color (para no repetir pills)
  const colorMap = new Map();
  variantesConColor.forEach(v => {
    if (!colorMap.has(v.color_nombre)) colorMap.set(v.color_nombre, v);
  });
  const coloresUnicos = [...colorMap.entries()]; // [[nombre, variante], ...]
  const tieneColores = coloresUnicos.length > 0;

  const sizes = [...new Set(variantes.map(v => v.volumen || 'Único'))];
  const tieneVariantesTam = sizes.length > 0 && (sizes.length > 1 || sizes[0] !== 'Único');

  // ── Si hay colores y se seleccionó uno, o si hay tamaños, buscar la variante exacta ──
  const currentSize = sizes[selectedSize] || sizes[0];
  let activeVariant = variantes.find(v => {
    const matchSize = tieneVariantesTam ? (v.volumen || 'Único') === currentSize : true;
    const matchColor = tieneColores ? v.color_nombre === selectedColor : true;
    return matchSize && matchColor;
  });

  // Fallback si no hay coincidencia exacta
  if (!activeVariant) {
    if (tieneColores && selectedColor) {
      activeVariant = colorMap.get(selectedColor) || variantes[0] || {};
    } else {
      activeVariant = variantes.find(v => (v.volumen || 'Único') === currentSize) || variantes[0] || {};
    }
  }

  const price = activeVariant.precio || producto.precio || 0;
  let offerPrice = activeVariant.precio_oferta || producto.precio_oferta || null;
  const stock = activeVariant.stock || 0;

  // Si no hay precio de oferta pero hay un descuento global, lo calculamos
  if (!offerPrice && descuento > 0 && price > 0) {
    offerPrice = price - (price * (descuento / 100));
  }

  const calcDescuento = offerPrice && offerPrice < price ? Math.round((1 - offerPrice / price) * 100) : (descuento || 0);

  const handleShare = async () => {
    const shareData = {
      title: `${nombre} - ${marca} | Marybe`,
      text: descripcion_corta || `Mirá este producto en Marybe: ${nombre}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        alert('Enlace copiado al portapapeles');
      }
    } catch (err) {
      console.error('Error al compartir', err);
    }
  };

  // Calculo del precio con impuestos (solo informativo como en el diseño)
  const priceWithoutTaxes = Math.round((offerPrice || price) * 0.79);
  const installmentValue = Math.round((offerPrice || price) / 3);

  const renderAddToCart = () => (
    <>
      <OptionLabel>Cantidad</OptionLabel>
      <ActionRow>
        <QuantityBox>
          <button
            disabled={qty <= 1}
            onClick={() => { setQtyDir(-1); setQty(Math.max(1, qty - 1)); }}
          >
            −
          </button>
          <QtyNumber>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={qty}
                initial={{ y: qtyDir * 18, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: qtyDir * -18, opacity: 0 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
              >
                {qty}
              </motion.span>
            </AnimatePresence>
          </QtyNumber>
          <button
            disabled={qty >= stock}
            onClick={() => { setQtyDir(1); setQty(Math.min(stock, qty + 1)); }}
          >
            +
          </button>
        </QuantityBox>
        <AddToCartBtn
          disabled={stock === 0}
          $added={addingCart}
          whileTap={{ scale: 0.97 }}
          animate={addingCart ? { scale: [1, 1.03, 1] } : { scale: 1 }}
          transition={{ duration: 0.3 }}
          style={{ opacity: stock === 0 ? 0.6 : 1, cursor: stock === 0 ? 'not-allowed' : 'pointer' }}
          onClick={() => {
            if (stock > 0 && !addingCart) {
              setAddingCart(true);
              setTimeout(() => {
                addToCart(producto, qty, activeVariant);
                setIsCartModalOpen(true);
                setAddingCart(false);
              }, 850);
            }
          }}
        >
          <AnimatePresence mode="wait" initial={false}>
            {addingCart ? (
              <motion.span
                key="added"
                style={{ display: 'flex', alignItems: 'center', gap: 10 }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <motion.svg
                  width="20" height="20" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                  initial={{ scale: 0, rotate: -40 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 420, damping: 13 }}
                >
                  <polyline points="20 6 9 17 4 12" />
                </motion.svg>
                ¡Agregado!
              </motion.span>
            ) : (
              <motion.span
                key="idle"
                style={{ display: 'flex', alignItems: 'center', gap: 10 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                {stock === 0 ? 'Agotado' : 'Agregar'}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
              </motion.span>
            )}
          </AnimatePresence>
        </AddToCartBtn>
      </ActionRow>
    </>
  );

  return (
    <InfoContainer>
      <TopRow>
        <PillsContainer>
          {calcDescuento > 30 && <Pill>Super oferta</Pill>}
          {calcDescuento > 0 && calcDescuento <= 30 && <Pill>Promoción</Pill>}
        </PillsContainer>
        <IconsContainer>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            onClick={handleShare}
            style={{ cursor: 'pointer' }}
            title="Compartir"
          >
            <path d="M9 12C9 12.663 8.73661 13.2989 8.26777 13.7678C7.79893 14.2366 7.16304 14.5 6.5 14.5C5.83696 14.5 5.20107 14.2366 4.73223 13.7678C4.26339 13.2989 4 12.663 4 12C4 11.337 4.26339 10.7011 4.73223 10.2322C5.20107 9.76339 5.83696 9.5 6.5 9.5C7.16304 9.5 7.79893 9.76339 8.26777 10.2322C8.73661 10.7011 9 11.337 9 12Z" stroke="#7C0405" strokeWidth="1.5" />
            <path d="M14 6.5L9 10M14 17.5L9 14" stroke="#7C0405" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M19 18.5C19 19.163 18.7366 19.7989 18.2678 20.2678C17.7989 20.7366 17.163 21 16.5 21C15.837 21 15.2011 20.7366 14.7322 20.2678C14.2634 19.7989 14 19.163 14 18.5C14 17.837 14.2634 17.2011 14.7322 16.7322C15.2011 16.2634 15.837 16 16.5 16C17.163 16 17.7989 16.2634 18.2678 16.7322C18.7366 17.2011 19 17.837 19 18.5ZM19 5.5C19 6.16304 18.7366 6.79893 18.2678 7.26777C17.7989 7.73661 17.163 8 16.5 8C15.837 8 15.2011 7.73661 14.7322 7.26777C14.2634 6.79893 14 6.16304 14 5.5C14 4.83696 14.2634 4.20107 14.7322 3.73223C15.2011 3.26339 15.837 3 16.5 3C17.163 3 17.7989 3.26339 18.2678 3.73223C18.7366 4.20107 19 4.83696 19 5.5Z" stroke="#7C0405" strokeWidth="1.5" />
          </svg>

          <FavoriteButton product={producto} size="24px" />

        </IconsContainer>
      </TopRow>

      <Brand>{marca}</Brand>
      <Title>{nombre}</Title>

      <SubBadges>
        {caracteristicas
          ? caracteristicas.split('|').map((c, i) => <span key={i}>{c.trim()}</span>)
          : <span>Edición limitada</span>
        }
      </SubBadges>

      {descripcion_corta && <DescriptionExcerpt>{descripcion_corta}</DescriptionExcerpt>}

      <MobileActionRow>
        {renderAddToCart()}
      </MobileActionRow>

      <PriceBlock>
        {offerPrice && <OldPrice>{formatPrice(price)}</OldPrice>}
        <CurrentPriceRow>
          <CurrentPrice>{formatPrice(offerPrice || price)}</CurrentPrice>
          {descuento > 0 && <DiscountBadge>- {descuento}%</DiscountBadge>}
        </CurrentPriceRow>

        <PaymentLink onClick={() => setIsPaymentModalOpen(true)}>Ver medios de pago</PaymentLink>
        <CfteaText>CFTEA 0%</CfteaText>

        <InstallmentsText>
          3 cuotas sin interés de <span>{formatPrice(installmentValue)}</span>
        </InstallmentsText>
        <LegalText>Precio sin impuestos nacionales {formatPrice(priceWithoutTaxes)}</LegalText>
      </PriceBlock>

      {tieneVariantesTam && (
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

      {/* Selección de color — solo si las variantes tienen color_nombre en Strapi */}
      {tieneColores && (
        <>
          <OptionLabel>
            Color
            {selectedColor && (
              <span style={{ fontWeight: 400, color: '#555', marginLeft: 8 }}>— {selectedColor}</span>
            )}
          </OptionLabel>
          <ColorsContainer>
            {coloresUnicos.map(([nombre, variante]) => {
              const hex = COLOR_MAP[nombre] || '#CCCCCC';
              return (
                <ColorBtn
                  key={nombre}
                  $color={hex}
                  $active={selectedColor === nombre}
                  onClick={() => setSelectedColor(nombre)}
                  title={nombre}
                />
              );
            })}
          </ColorsContainer>
        </>
      )}

      <StockInfo>
        {stock > 0
          ? `Stock Disponible (+${stock} disponibles)`
          : <span style={{ color: '#d32f2f' }}>Sin stock disponible</span>}
      </StockInfo>

      <DesktopActionRow>
        {renderAddToCart()}
      </DesktopActionRow>

      <ShippingInfo>
        <InfoItem>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <div>
            Retira gratis en nuestras sucursales
            <Link to="/sucursales/">Ver sucursales</Link>
          </div>
        </InfoItem>
        <InfoItem>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="3" width="15" height="13" />
            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
            <circle cx="5.5" cy="18.5" r="2.5" />
            <circle cx="18.5" cy="18.5" r="2.5" />
          </svg>
          <div>
            Calculá costo de envío
            <button onClick={() => setShippingModalOpen(true)} style={{ cursor: 'pointer', background: 'none', border: 'none', padding: 0, color: '#000000', textDecoration: 'underline', fontWeight: 500, fontFamily: 'inherit', fontSize: 'inherit' }}>Calcular costo</button>
          </div>
        </InfoItem>
        <InfoItem>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
      />

      <ShippingModal
        isOpen={isShippingModalOpen}
        onClose={() => setShippingModalOpen(false)}
      />

      <AddToCartModal
        isOpen={isCartModalOpen}
        onClose={() => setIsCartModalOpen(false)}
        product={producto}
        initialMode="success"
        addedQty={qty}
        addedVariant={activeVariant}
      />
    </InfoContainer>
  );
}
