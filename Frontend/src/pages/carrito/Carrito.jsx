import React, { useContext, useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../../context/CartContext';
import { AuthContext } from '../../context/AuthContext';

// Styled Components
const PageContainer = styled.div`
  min-height: 80vh;
  background-color: var(--color-blanco);
  padding: 40px 60px;
  font-family: var(--font-family-secondary);

  @media (max-width: 1024px) {
    padding: 30px 20px;
  }
`;

const ContentWrapper = styled.div`
  max-width: 1400px;
  margin: 0 auto;
`;

const Breadcrumb = styled.div`
  font-size: 0.9rem;
  color: #777;
  margin-bottom: 40px;

  a {
    color: #777;
    text-decoration: none;
    &:hover { color: #333; }
  }
  span {
    margin: 0 8px;
  }
  .active {
    color: #333;
    font-weight: 600;
  }
`;

const ProgressContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 800px;
  margin: 0 auto 60px;
  position: relative;
`;

const ProgressStep = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  z-index: 1;

  .circle {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background-color: ${({ $active }) => ($active ? 'var(--color-bordo-secundario)' : '#d3d3d3')};
    color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: 600;
    font-size: 0.9rem;
  }

  .label {
    font-size: 0.9rem;
    font-weight: ${({ $active }) => ($active ? '700' : '500')};
    color: ${({ $active }) => ($active ? 'var(--color-bordo-secundario)' : '#a0a0a0')};
  }
`;

const ProgressLine = styled.div`
  position: absolute;
  top: 16px;
  left: 40px;
  right: 40px;
  height: 1px;
  background-color: #d3d3d3;
  z-index: 0;
`;

const LayoutGrid = styled.div`
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 60px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 40px;
  }
`;

const SectionTitle = styled.h2`
  font-family: var(--font-family-secondary);
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
`;

const ProductList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const ProductRow = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;

  @media (max-width: 600px) {
    display: grid;
    grid-template-columns: max-content 1fr;
    grid-template-areas:
      "image info"
      "price controls";
    align-items: center;
    gap: 15px 20px;
  }

  & > a {
    @media (max-width: 600px) {
      grid-area: image;
      display: flex;
    }
  }
`;

const ProductImage = styled.img`
  width: 80px;
  height: 80px;
  object-fit: contain;
  background-color: #fafafa;
  border-radius: 8px;
`;

const ProductInfo = styled.div`
  flex: 1;
  min-width: 0;

  @media (max-width: 600px) {
    grid-area: info;
  }

  .name {
    font-size: 1.1rem;
    font-weight: 600;
    color: #333;
    margin-bottom: 4px;
    display: flex;
    align-items: center;
    gap: 10px;

    @media (max-width: 600px) {
      font-size: 1rem;
    }
  }

  .product-link {
    text-decoration: none;
    color: inherit;
    white-space: pre-wrap;
    display: block;

    &:hover {
      text-decoration: underline;
    }
  }

  .link {
    font-size: 0.8rem;
    color: #777;
    text-decoration: underline;
    font-weight: 400;
  }

  .meta {
    font-size: 0.85rem;
    color: #555;
    display: flex;
    align-items: center;
    gap: 15px;
    margin-top: 8px;

    @media (max-width: 600px) {
      gap: 10px;
    }
  }

  .color-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    display: inline-block;
    border: 1px solid #ccc;
  }
`;

const Price = styled.div`
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  width: 120px;
  text-align: right;

  @media (max-width: 600px) {
    grid-area: price;
    text-align: left;
    width: auto;
    font-size: 1.1rem;
  }
`;

const ControlsGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  
  @media (max-width: 600px) {
    grid-area: controls;
    width: 100%;
    justify-content: flex-end;
  }
`;

const QuantityBox = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  height: 36px;
  padding: 0 5px;
  width: 90px;
  justify-content: space-between;

  button {
    background: none;
    border: none;
    font-size: 1.2rem;
    font-weight: 300;
    cursor: pointer;
    color: #555;
    width: 24px;
    height: 100%;
  }

  span {
    font-weight: 600;
    font-size: 0.95rem;
    color: #333;
  }
`;

const DeleteButton = styled.button`
  background: #F6F6F6;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  width: 36px;
  height: 36px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #777;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #fee;
    border-color: #fcc;
    color: #c0392b;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const OutOfStockBadge = styled.span`
  background-color: var(--color-bordo-secundario);
  color: white;
  font-size: 0.7rem;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: bold;
`;

// Order Summary Card
const SummaryCard = styled.div`
  background-color: #ffffff;
  border-radius: 24px;
  padding: 30px;
  box-shadow: 0px 8px 24px 0px rgba(0, 0, 0, 0.04);
`;

const SummaryTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 700;
  font-family: var(--font-family-secondary);
  font-weight: 600;
  color: black;
  margin-bottom: 25px;
`;

const CouponField = styled.div`
  margin-bottom: 30px;

  label {
    display: block;
    font-size: 0.9rem;
    color: #555;
    margin-bottom: 8px;
    font-weight: 500;

    svg {
      width: 16px;
      height: 16px;
      margin-left: 6px;
      vertical-align: -3px;
      color: var(--color-bordo-secundario);
    }
  }

  .input-group {
    display: flex;
    gap: 10px;
  }

  input {
    flex: 1;
    padding: 12px 15px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    background-color: white;
    font-size: 0.95rem;
    color: black;

    &::placeholder {
      color: #aaa;
    }
    
    &:focus {
      outline: none;
      border-color: #333;
    }

    &:disabled {
      background-color: #f5f5f5;
      color: black;
      -webkit-text-fill-color: black; /* override for Safari */
    }
  }

  button {
    background-color: #333;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 0 20px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
      background-color: #000;
    }
    
    &:disabled {
      background-color: #ccc;
      cursor: not-allowed;
    }
  }
`;

const Message = styled.div`
  font-size: 0.85rem;
  margin-top: 8px;
  color: ${(props) => (props.$error ? '#d9534f' : '#5cb85c')};
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  font-size: 0.95rem;
  color: #555;

  .val {
    font-weight: 600;
    color: #333;
  }
`;

const Divider = styled.div`
  height: 1px;
  background-color: #e0e0e0;
  margin: 20px 0;
`;

const TotalRow = styled(SummaryRow)`
  font-size: 1.2rem;
  color: #333;
  margin-bottom: 30px;
  font-weight: 700;

  .val {
    font-size: 1.3rem;
  }
`;

const PrimaryBtn = styled.button`
  width: 100%;
  background-color: var(--color-marron-principal);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 16px;
  font-size: 1.05rem;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 15px;
  transition: background-color 0.2s;

  &:hover {
    background-color: #7C0405;
  }
`;

const ContinueBtn = styled(Link)`
  display: block;
  width: 100%;
  text-align: center;
  color: black;
  text-decoration: underline;
  font-size: 0.9rem;
  font-weight: 500;
  
  &:hover {
    color: var(--color-bordo-secundario);
  }
`;

const EmptyCartWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  max-width: 520px;
  margin: 40px auto 80px;
  padding: 50px 40px;
  text-align: center;
`;

const EmptyCartIconContainer = styled.div`
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background-color: var(--color-blanco, #FFFFFF);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  box-shadow: 0 8px 24px rgba(106, 3, 4, 0.1);
  color: var(--color-bordo-cuarto);
  animation: float 3s ease-in-out infinite;

  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-8px); }
  }

  svg {
    width: 48px;
    height: 48px;
    stroke: currentColor;
  }
`;

const EmptyCartTitle = styled.h3`
  font-family: var(--font-family-primary);
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--color-bordo-cuarto);
  margin-bottom: 12px;
`;

const EmptyCartSubtitle = styled.p`
  font-size: 1rem;
  color: #666;
  margin-bottom: 32px;
  line-height: 1.5;
`;

const EmptyCartButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background-color: var(--color-bordo-cuarto);
  color: var(--color-blanco, #FFFFFF);
  padding: 16px 36px;
  border-radius: 12px;
  font-size: 1.05rem;
  font-weight: 600;
  text-decoration: none;
  box-shadow: 0 8px 20px rgba(106, 3, 4, 0.25);
  transition: all 0.2s ease;

  &:hover {
    background-color: var(--color-marron-principal);
    transform: scale(1.03);
    box-shadow: 0 12px 28px rgba(106, 3, 4, 0.35);
    color: var(--color-blanco, #FFFFFF);
  }

  svg {
    width: 20px;
    height: 20px;
    transition: transform 0.2s ease;
  }

  &:hover svg {
    transform: translateX(4px);
  }
`;

const COLOR_MAP = {
  'Negro': '#1a1a1a', 'Negro Azulado': '#0d0d1a', 'Castaño Oscuro': '#3E2009', 'Castaño Natural': '#6B4226',
  'Castaño Claro': '#8B6347', 'Castaño Ceniza': '#6B5B52', 'Castaño Dorado': '#8B5E3C', 'Chocolate': '#3D1C02',
  'Caoba': '#722F37', 'Avellana': '#855E42', 'Rubio Oscuro': '#C8A96E', 'Rubio Natural': '#E8C98A',
  'Rubio Claro': '#F5DEB3', 'Rubio Dorado': '#DAA520', 'Rubio Ceniza': '#D4C5A9', 'Rubio Platinado': '#F0E6C8',
  'Miel': '#FFC30B', 'Rojo': '#CC0000', 'Rojo Intenso': '#8B0000', 'Bordo': '#5C0A0A', 'Bordo Oscuro': '#3E0102',
  'Cobre': '#B87333', 'Rojizo': '#9B2335', 'Rosa Claro': '#FFCDD2', 'Rosa': '#FFB6C1', 'Rosa Oscuro': '#C2185B',
  'Fucsia': '#FF0090', 'Coral': '#FF6B6B', 'Durazno': '#FFCBA4', 'Nude': '#D4A574', 'Beige': '#F5F5DC',
  'Arena': '#C2B280', 'Marfil': '#FFFFF0', 'Porcelana': '#F7E7CE', 'Blanco': '#FFFFFF', 'Blanco Perla': '#F8F8F0',
  'Dorado': '#FFD700', 'Plateado': '#C0C0C0', 'Bronce': '#CD7F32', 'Lavanda': '#E6E6FA', 'Lila': '#C8A2C8',
  'Violeta': '#8B00FF', 'Morado': '#6A0DAD', 'Azul': '#0055AA', 'Turquesa': '#40E0D0', 'Verde': '#228B22',
  'Verde Oliva': '#808000', 'Gris Claro': '#D3D3D3', 'Gris': '#808080', 'Gris Oscuro': '#404040',
  'Transparente': '#E8E8E8', 'Incoloro': '#F5F5F5',
};

const formatPrice = (price) => {
  if (!price) return '$0';
  return '$ ' + Number(price).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export default function Carrito() {
  const { cartItems, updateQuantity, removeFromCart, cartTotal, appliedGiftCard, setAppliedGiftCard } = useContext(CartContext);
  const { isAuthenticated, openAuthModal } = useContext(AuthContext);
  const navigate = useNavigate();

  const [waitingForAuth, setWaitingForAuth] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponMessage, setCouponMessage] = useState({ text: '', isError: false });
  const [isLoadingCoupon, setIsLoadingCoupon] = useState(false);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsLoadingCoupon(true);
    setCouponMessage({ text: '', isError: false });

    try {
      const response = await fetch(`${process.env.REACT_APP_STRAPI_URL || 'http://localhost:1337'}/api/gift-cards/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ codigo: couponCode })
      });
      const data = await response.json();

      if (response.ok && data.data) {
        setAppliedGiftCard(data.data);
        setCouponMessage({ text: `Descuento aplicado: ${formatPrice(data.data.monto)}`, isError: false });
      } else {
        setCouponMessage({ text: data.error?.message || 'Código no válido o inactivo.', isError: true });
        setAppliedGiftCard(null);
      }
    } catch (error) {
      console.error('Error validando cupón:', error);
      setCouponMessage({ text: 'Hubo un error al validar el cupón.', isError: true });
    } finally {
      setIsLoadingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedGiftCard(null);
    setCouponCode('');
    setCouponMessage({ text: '', isError: false });
  };

  const discountAmount = appliedGiftCard ? appliedGiftCard.monto : 0;
  const finalTotal = Math.max(0, cartTotal - discountAmount);

  // Auto-redirigir al checkout si el usuario se acaba de loguear desde este botón
  useEffect(() => {
    if (isAuthenticated && waitingForAuth) {
      navigate('/login');
    }
  }, [isAuthenticated, waitingForAuth, navigate]);

  const handleContinuar = () => {
    if (isAuthenticated) {
      navigate('/login');
    } else {
      setWaitingForAuth(true);
      openAuthModal();
    }
  };

  return (
    <PageContainer>
      <ContentWrapper>
        <Breadcrumb>
          <Link to="/">Inicio</Link> <span>/</span> <span className="active">Carrito</span>
        </Breadcrumb>

        <ProgressContainer>
          <ProgressLine />
          <ProgressStep $active={true}>
            <div className="circle">1</div>
            <div className="label">Carrito</div>
          </ProgressStep>
          <ProgressStep $active={false}>
            <div className="circle">2</div>
            <div className="label">Identificación</div>
          </ProgressStep>
          <ProgressStep $active={false}>
            <div className="circle">3</div>
            <div className="label">Envío</div>
          </ProgressStep>
          <ProgressStep $active={false}>
            <div className="circle">4</div>
            <div className="label">Pago</div>
          </ProgressStep>
        </ProgressContainer>

        {cartItems.length === 0 ? (
          <EmptyCartWrapper>
            <EmptyCartIconContainer>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
            </EmptyCartIconContainer>
            <EmptyCartTitle>Tu carrito está vacío</EmptyCartTitle>
            <EmptyCartSubtitle>Explora nuestro catálogo para encontrar los mejores productos de farmacia y perfumería.</EmptyCartSubtitle>
            <EmptyCartButton to="/tienda">
              Ir a la tienda
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </EmptyCartButton>
          </EmptyCartWrapper>
        ) : (
          <LayoutGrid>
            {/* Lista de productos */}
            <div>
              <SectionTitle>Productos</SectionTitle>
              <ProductList>
                {cartItems.map(item => {
                  const { product, variant } = item;
                  let imgUrl = '/placeholder.png';
                  if (product.portada?.local) {
                    imgUrl = product.portada.url;
                  } else if (product.portada?.data?.attributes?.url) {
                    imgUrl = `${process.env.REACT_APP_STRAPI_URL || 'http://localhost:1337'}${product.portada.data.attributes.url}`;
                  } else if (product.portada?.url) {
                    imgUrl = `${process.env.REACT_APP_STRAPI_URL || 'http://localhost:1337'}${product.portada.url}`;
                  }

                  const isOutOfStock = (variant?.stock === 0);

                  return (
                    <ProductRow key={item.cartId}>
                      <Link to={`/producto/${product.id}`}>
                        <ProductImage src={imgUrl} alt={product.nombre} />
                      </Link>
                      <ProductInfo>
                        <div className="name">
                          {isOutOfStock && <OutOfStockBadge>Fuera de Stock</OutOfStockBadge>}
                          <Link to={`/producto/${product.id}`} className="product-link">
                            {product.nombre}
                          </Link>
                        </div>
                        <div className="meta">
                          {variant?.volumen && variant.volumen !== 'Único' && (
                            <span>Tamaño: {variant.volumen}</span>
                          )}
                          {variant?.color_nombre && variant.color_nombre !== 'Único' && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                              Color: <span className="color-dot" style={{ backgroundColor: COLOR_MAP[variant.color_nombre] || '#ccc' }}></span>
                            </span>
                          )}
                        </div>
                      </ProductInfo>

                      <Price>{formatPrice(item.price)}</Price>

                      <ControlsGroup>
                        <QuantityBox>
                          <button onClick={() => updateQuantity(item.cartId, item.quantity - 1)}>−</button>
                          <span>{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.cartId, item.quantity + 1)}>+</button>
                        </QuantityBox>

                        <DeleteButton onClick={() => removeFromCart(item.cartId)} aria-label="Eliminar producto">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                          </svg>
                        </DeleteButton>
                      </ControlsGroup>

                    </ProductRow>
                  );
                })}
              </ProductList>
            </div>

            {/* Resumen */}
            <div>
              <SummaryCard>
                <SummaryTitle>Resumen de pedido</SummaryTitle>

                <CouponField>
                  <label>
                    Cupón de descuento o Giftcard
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polyline points="20 12 20 22 4 22 4 12" />
                      <rect x="2" y="7" width="20" height="5" />
                      <line x1="12" y1="22" x2="12" y2="7" />
                      <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
                      <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
                    </svg>
                  </label>
                  <div className="input-group">
                    <input
                      type="text"
                      placeholder="Ej: 12345ABC"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      disabled={!!appliedGiftCard}
                    />
                    {appliedGiftCard ? (
                      <button onClick={handleRemoveCoupon}>Quitar</button>
                    ) : (
                      <button onClick={handleApplyCoupon} disabled={isLoadingCoupon || !couponCode.trim()}>
                        {isLoadingCoupon ? '...' : 'Aplicar'}
                      </button>
                    )}
                  </div>
                  {couponMessage.text && (
                    <Message $error={couponMessage.isError}>{couponMessage.text}</Message>
                  )}
                </CouponField>

                <SummaryRow>
                  <span>Subtotal</span>
                  <span className="val">{formatPrice(cartTotal)}</span>
                </SummaryRow>

                {appliedGiftCard && (
                  <SummaryRow style={{ color: 'black', fontWeight: 600 }}>
                    <span>Descuento (Gift Card)</span>
                    <span className="val" style={{ color: 'black' }}>-{formatPrice(discountAmount)}</span>
                  </SummaryRow>
                )}

                <SummaryRow>
                  <span>Envío:</span>
                  <span className="val">Gratis</span>
                </SummaryRow>

                <Divider />

                <TotalRow>
                  <span>Total</span>
                  <span className="val">{formatPrice(finalTotal)}</span>
                </TotalRow>

                <PrimaryBtn onClick={handleContinuar}>Continuar</PrimaryBtn>
                <ContinueBtn to="/tienda">Continuar comprando</ContinueBtn>

              </SummaryCard>
            </div>
          </LayoutGrid>
        )}
      </ContentWrapper>
    </PageContainer>
  );
}
