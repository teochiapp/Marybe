import React, { useState, useEffect, useContext } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { getVariantPrice, variantesReales, getMainVariant, sortSizes } from '../../utils/productPrice';
import VariantSelector from '../shared/VariantSelector';

// Styled Components
const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: white;
  padding: 30px;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  position: relative;
  font-family: var(--font-family-secondary);
`;

const CloseButton = styled.button`
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #555;
`;

const Title = styled.h2`
  font-family: var(--font-family-primary);
  font-size: 1.5rem;
  color: var(--color-marron-principal);
  margin-bottom: 20px;
  text-align: center;
`;

const SuccessTitle = styled(Title)`
  color: #27ae60;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
`;

const ProductInfo = styled.div`
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  align-items: center;

  img {
    width: 80px;
    height: 80px;
    object-fit: contain;
    border-radius: 8px;
    border: 1px solid #eaeaea;
  }
`;

const ProductDetails = styled.div`
  flex: 1;

  h4 {
    margin: 0 0 5px 0;
    font-size: 1.1rem;
    color: #333;
  }

  p {
    margin: 0;
    color: #777;
    font-size: 0.9rem;
  }
`;

const OptionLabel = styled.div`
  font-size: 0.9rem;
  font-weight: 700;
  margin-bottom: 6px;
  color: #28180B;
`;



const ActionRow = styled.div`
  display: flex;
  gap: 15px;
  margin-top: 20px;
`;

const Button = styled.button`
  flex: 1;
  padding: 12px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
`;

const PrimaryButton = styled(Button)`
  background-color: var(--color-marron-principal);
  color: white;
  border: none;

  &:hover {
    background-color: var(--color-marron-cuarto);
  }
`;

const AddCartBtn = styled(motion.button)`
  flex: 1;
  height: 44px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  overflow: hidden;
  background-color: ${({ $added }) => ($added ? '#2e7d32' : 'var(--color-marron-principal)')};
  transition: background-color 0.3s ease;

  &:hover {
    background-color: ${({ $added }) => ($added ? '#2e7d32' : 'var(--color-marron-cuarto)')};
  }

  &:disabled {
    cursor: default;
  }
`;

const SecondaryButton = styled(Button)`
  background-color: white;
  color: var(--color-marron-principal);
  border: 1px solid var(--color-marron-principal);

  &:hover {
    background-color: var(--color-fondo-beneficio-tarjeta);
  }
`;

const QuantityBox = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid #ccc;
  border-radius: 8px;
  height: 44px;
  padding: 0 5px;
  width: 120px;
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



const formatPrice = (price) => {
  if (!price) return '$0';
  return '$' + Number(price).toLocaleString('es-AR', { minimumFractionDigits: 0 });
};

export default function AddToCartModal({ isOpen, onClose, product, initialMode = 'select', addedQty = null, addedVariant = null }) {
  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();
  const [mode, setMode] = useState(initialMode); // 'select' or 'success'
  const [adding, setAdding] = useState(false);
  
  // States for selection
  const [selectedSize, setSelectedSize] = useState(0);
  const [selectedColor, setSelectedColor] = useState(null);
  const [qty, setQty] = useState(addedQty || 1);

  // When modal opens, reset state
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setQty(addedQty || 1);
      setSelectedSize(0);
      setSelectedColor(null);
    }
  }, [isOpen, initialMode, product, addedQty]);

  if (!isOpen || !product) return null;

  // Derive variants info
  const attrs = product.attributes || product;
  const variantes = attrs.variantes || [];
  
  const variantesConColor = variantes.filter(v => v.color_nombre);
  const colorMap = new Map();
  variantesConColor.forEach(v => {
    if (!colorMap.has(v.color_nombre)) colorMap.set(v.color_nombre, v);
  });
  const coloresUnicos = [...colorMap.entries()];
  const tieneColores = coloresUnicos.length > 0;

  const sizes = sortSizes([...new Set(variantes.map(v => v.volumen || 'Único'))]);
  const tieneVariantesTam = sizes.length > 0 && (sizes.length > 1 || sizes[0] !== 'Único');

  // Find active variant if not provided externally
  let activeVariant = addedVariant;
  if (!activeVariant) {
    const currentSize = sizes[selectedSize] || sizes[0];
    activeVariant = variantes.find(v => {
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
  }

  const stock = activeVariant?.stock ?? attrs?.stock ?? 0;
  const variantPriceInfo = getVariantPrice(activeVariant, attrs);
  const price = variantPriceInfo.tieneOferta ? variantPriceInfo.offerPrice : variantPriceInfo.price;

  // Get image URL
  let imgUrl = '/placeholder.png';
  if (attrs.portada?.data?.attributes?.url) {
    imgUrl = `${process.env.REACT_APP_STRAPI_URL || 'http://localhost:1337'}${attrs.portada.data.attributes.url}`;
  } else if (attrs.portada?.url) {
    imgUrl = `${process.env.REACT_APP_STRAPI_URL || 'http://localhost:1337'}${attrs.portada.url}`;
  }

  const handleAddToCart = () => {
    if (stock <= 0 || adding) return;
    setAdding(true);
    setTimeout(() => {
      addToCart(product, qty, activeVariant);
      setMode('success');
      setAdding(false);
    }, 850);
  };

  const handleGoToCart = () => {
    onClose();
    window.scrollTo(0, 0);
    navigate('/carrito');
  };

  if (mode === 'success') {
    return createPortal(
      <Overlay onClick={onClose}>
        <ModalContent onClick={e => e.stopPropagation()}>
          <CloseButton onClick={onClose}>&times;</CloseButton>
          <SuccessTitle>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            ¡Agregado al carrito!
          </SuccessTitle>
          
          <ProductInfo>
            <img src={imgUrl} alt={attrs.nombre} />
            <ProductDetails>
              <h4>{attrs.nombre}</h4>
              <p>{attrs.marca}</p>
              <p style={{ marginTop: '5px', fontWeight: 600 }}>
                {qty} x {formatPrice(price)}
              </p>
            </ProductDetails>
          </ProductInfo>

          <ActionRow>
            <SecondaryButton onClick={onClose}>Seguir comprando</SecondaryButton>
            <PrimaryButton onClick={handleGoToCart}>Ir al carrito</PrimaryButton>
          </ActionRow>
        </ModalContent>
      </Overlay>,
      document.body
    );
  }

  // Mode: select
  return createPortal(
    <Overlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <CloseButton onClick={onClose}>&times;</CloseButton>
        <Title>Agregar al carrito</Title>

        <ProductInfo>
          <img src={imgUrl} alt={attrs.nombre} />
          <ProductDetails>
            <h4>{attrs.nombre}</h4>
            <p>{attrs.marca}</p>
            <p style={{ marginTop: '5px', fontWeight: 600, color: 'var(--color-bordo-secundario)' }}>
              {formatPrice(price)}
            </p>
          </ProductDetails>
        </ProductInfo>

        <VariantSelector
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

        <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-end', marginTop: '20px' }}>
          <div>
            <OptionLabel>Cantidad</OptionLabel>
            <QuantityBox>
              <button disabled={qty <= 1} onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
              <span>{qty}</span>
              <button disabled={qty >= stock} onClick={() => setQty(q => Math.min(stock, q + 1))}>+</button>
            </QuantityBox>
          </div>
          <AddCartBtn
            type="button"
            onClick={handleAddToCart}
            disabled={stock <= 0}
            $added={adding}
            whileTap={{ scale: 0.96 }}
            animate={adding ? { scale: [1, 1.04, 1] } : { scale: 1 }}
            transition={{ duration: 0.3 }}
            style={{ opacity: stock <= 0 ? 0.6 : 1 }}
          >
            <AnimatePresence mode="wait" initial={false}>
              {adding ? (
                <motion.span
                  key="added"
                  style={{ display: 'flex', alignItems: 'center', gap: 8 }}
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
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  {stock <= 0 ? 'Sin stock' : 'Agregar al carrito'}
                </motion.span>
              )}
            </AnimatePresence>
          </AddCartBtn>
        </div>

      </ModalContent>
    </Overlay>,
    document.body
  );
}
