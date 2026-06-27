import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { CartContext } from '../../context/CartContext';

// ─── Styled Components (sin cambios) ────────────────────────────────────────

const PageContainer = styled.div`
  min-height: 80vh;
  background-color: var(--color-blanco);
  padding: 40px 60px;
  font-family: var(--font-family-secondary, sans-serif);

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
    background-color: ${({ $active, $completed }) => ($active || $completed ? '#5C0A0A' : '#d3d3d3')};
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
    color: ${({ $active, $completed }) => ($active || $completed ? '#5C0A0A' : '#a0a0a0')};
  }
`;

const ProgressLine = styled.div`
  position: absolute;
  top: 16px;
  left: 40px;
  right: 40px;
  height: 2px;
  background-color: #5C0A0A;
  z-index: 0;
`;

const ConfirmationContainer = styled.div`
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const SuccessBanner = styled.div`
  background-color: var(--color-marron-principal, #3E0102);
  border-radius: 16px;
  padding: 40px;
  display: flex;
  align-items: center;
  gap: 24px;
  color: white;

  svg {
    width: 60px;
    height: 60px;
    flex-shrink: 0;
    color: #f2dc8f;
  }

  .text h2 {
    font-size: 1.8rem;
    font-weight: 700;
    font-family: var(--font-family-primary, serif);
    color: var(--color-titulo-marybe, #f2dc8f);
    margin-bottom: 8px;
  }

  .text p {
    font-size: 1rem;
    color: rgba(255, 255, 255, 0.8);
  }

  @media (max-width: 600px) {
    flex-direction: column;
    text-align: center;
    padding: 28px 20px;

    .text h2 { font-size: 1.4rem; }
  }
`;

const DetailCard = styled.div`
  background-color: #fafafa;
  border: 1px solid #eee;
  border-radius: 16px;
  padding: 28px 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;

  .row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.95rem;
  }
  .label { color: #777; }
  .value { color: #333; font-weight: 500; }

  .total-row {
    border-top: 1px solid #eee;
    padding-top: 16px;
    display: flex;
    justify-content: space-between;
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--color-marron-principal, #3E0102);
  }
`;

const ProductsCard = styled.div`
  background-color: #fafafa;
  border: 1px solid #eee;
  border-radius: 16px;
  padding: 28px 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;

  .product-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 16px;
    border-bottom: 1px solid #f0f0f0;

    &:last-child { border-bottom: none; padding-bottom: 0; }
  }

  .prod-info {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .img-wrapper {
    width: 64px;
    height: 64px;
    border-radius: 10px;
    overflow: hidden;
    background: #f0f0f0;
    flex-shrink: 0;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .details h4 {
    font-size: 0.95rem;
    font-weight: 600;
    color: #333;
    margin-bottom: 4px;
  }

  .details p {
    font-size: 0.82rem;
    color: #888;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .prod-price {
    font-size: 1rem;
    font-weight: 600;
    color: var(--color-marron-principal);
    text-align: right;
  }
`;

const OrdersBtn = styled(Link)`
  display: inline-block;
  background-color: var(--color-marron-principal, #3E0102);
  color: white;
  padding: 16px 32px;
  border-radius: 12px;
  text-decoration: none;
  font-size: 1rem;
  font-weight: 600;
  text-align: center;
  transition: background-color 0.2s;

  &:hover {
    background-color: #4a1311;
  }
`;

const LoadingBanner = styled.div`
  background-color: var(--color-marron-principal, #3E0102);
  border-radius: 16px;
  padding: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  color: white;
  text-align: center;

  .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(255,255,255,0.3);
    border-top: 3px solid #f2dc8f;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  h2 { font-size: 1.4rem; color: #f2dc8f; font-family: var(--font-family-primary, serif); }
  p { font-size: 0.95rem; color: rgba(255,255,255,0.8); }
`;

// ─── Helpers ────────────────────────────────────────────────────────────────

const formatPrice = (price) => {
  if (!price) return '$0.00';
  return '$ ' + Number(price).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const getProductImage = (product) => {
  if (!product) return '/placeholder.png';
  let imgUrl = '/placeholder.png';
  if (product?.portada?.data?.attributes?.url) {
    imgUrl = `${process.env.REACT_APP_STRAPI_URL || 'http://localhost:1337'}${product.portada.data.attributes.url}`;
  } else if (product?.portada?.url) {
    imgUrl = `${process.env.REACT_APP_STRAPI_URL || 'http://localhost:1337'}${product.portada.url}`;
  }
  return imgUrl;
};

// ─── Componente ─────────────────────────────────────────────────────────────

export default function OrderSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState(location.state || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const mpStatus = searchParams.get('status');
    const mpPaymentId = searchParams.get('payment_id');
    const mpExternalRef = searchParams.get('external_reference');

    // ── Flujo MP Checkout Pro: llegamos del redirect de Mercado Pago ──
    if (mpStatus && mpPaymentId) {
      const pending = JSON.parse(sessionStorage.getItem('mp_pending_order') || 'null');

      if (mpStatus === 'failure') {
        navigate('/order-error', { replace: true });
        return;
      }

      if (pending && mpStatus === 'approved') {
        const cacheKey = `mp_order_created_${mpPaymentId}`;
        const alreadyCreated = JSON.parse(sessionStorage.getItem(cacheKey) || 'null');

        if (alreadyCreated) {
          setOrderData(alreadyCreated);
          return;
        }

        setLoading(true);
        // Crear el pedido en Strapi
        const createOrder = async () => {
          let orderNumber = 'M-000000';
          try {
            const headers = { 'Content-Type': 'application/json' };
            if (pending.token) {
              headers.Authorization = `Bearer ${pending.token}`;
            }

            const response = await fetch(`${process.env.REACT_APP_STRAPI_URL || 'http://localhost:1337'}/api/mis-pedidos`, {
              method: 'POST',
              headers,
              body: JSON.stringify({
                productos: pending.cartItems,
                total: pending.cartTotal,
                metodo_pago: 'mercadopago',
                direccion_envio: pending.savedAddress || {},
                mp_payment_id: mpPaymentId,
                mp_external_reference: mpExternalRef,
              })
            });
            const json = await response.json();
            orderNumber = json.data?.numero_pedido || 'M-000000';
          } catch (err) {
            console.error('Error al registrar pedido MP en Strapi:', err);
          }

          const newOrderData = {
            paymentMethod: 'mercadopago',
            cartItems: pending.cartItems,
            cartTotal: pending.cartTotal,
            savedAddress: pending.savedAddress,
            email: pending.email,
            orderNumber,
          };

          sessionStorage.setItem(cacheKey, JSON.stringify(newOrderData));
          setOrderData(newOrderData);
          setLoading(false);
        };
        createOrder();
        return;
      } else if (mpStatus === 'pending') {
        const data = pending || {};
        setOrderData({
          paymentMethod: 'mercadopago',
          cartItems: data.cartItems || [],
          cartTotal: data.cartTotal || 0,
          savedAddress: data.savedAddress,
          email: data.email,
          orderNumber: 'Pendiente',
        });
        return;
      }
    }

    // ── Flujo normal (React Router state) ──
    if (location.state) {
      setOrderData(location.state);
    }
  }, [location, navigate]);

  // Redirigir si no hay datos ni params de MP
  if (!loading && !orderData) {
    const searchParams = new URLSearchParams(location.search);
    if (!searchParams.get('payment_id')) {
      return <Navigate to="/carrito" replace />;
    }
    return null; // Esperando procesamiento de MP
  }

  if (loading) {
    return (
      <PageContainer>
        <ContentWrapper>
          <ConfirmationContainer>
            <LoadingBanner>
              <div className="spinner" />
              <h2>Confirmando tu pago...</h2>
              <p>Estamos registrando tu pedido. Un momento por favor.</p>
            </LoadingBanner>
          </ConfirmationContainer>
        </ContentWrapper>
      </PageContainer>
    );
  }

  const { paymentMethod, cartItems = [], cartTotal, savedAddress, email, orderNumber, isOrderDetail } = orderData;

  const paymentLabel = paymentMethod === 'transferencia' ? 'Transferencia'
    : paymentMethod === 'efectivo' ? 'Efectivo'
    : paymentMethod === 'mercadopago' || paymentMethod === 'qr' ? 'Mercado Pago'
    : 'Débito/Crédito';

  return (
    <PageContainer>
      <ContentWrapper>
        {isOrderDetail ? (
          <Breadcrumb>
            <Link to="/">Inicio</Link> <span>/</span> <Link to="/mi-cuenta">Mi cuenta</Link> <span>/</span> <span className="active">Pedido {orderNumber}</span>
          </Breadcrumb>
        ) : (
          <Breadcrumb>
            <Link to="/">Inicio</Link> <span>/</span> <Link to="/carrito">Carrito</Link> <span>/</span> <Link to="/login">Identificación</Link> <span>/</span> <Link to="/envio">Envío</Link> <span>/</span> <span className="active">Pago</span>
          </Breadcrumb>
        )}

        {!isOrderDetail && (
          <ProgressContainer>
            <ProgressLine />
            <ProgressStep $active={false} $completed={true}>
              <div className="circle">1</div>
              <div className="label">Carrito</div>
            </ProgressStep>
            <ProgressStep $active={false} $completed={true}>
              <div className="circle">2</div>
              <div className="label">Identificación</div>
            </ProgressStep>
            <ProgressStep $active={false} $completed={true}>
              <div className="circle">3</div>
              <div className="label">Envío</div>
            </ProgressStep>
            <ProgressStep $active={true} $completed={true}>
              <div className="circle">4</div>
              <div className="label">Pago</div>
            </ProgressStep>
          </ProgressContainer>
        )}

        <ConfirmationContainer>
          <SuccessBanner>
            {isOrderDetail ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            )}
            <div className="text">
              <h2>{isOrderDetail ? `Detalle del pedido ${orderNumber || ''}` : `Pedido confirmado! ${orderNumber || 'N01-123-45'}`}</h2>
              {email && !isOrderDetail && <p>Confirmación enviada a {email}</p>}
              {isOrderDetail && <p>Consulta los artículos y detalles del envío de tu pedido.</p>}
            </div>
          </SuccessBanner>

          <DetailCard>
            <div className="row">
              <span className="label">Pago</span>
              <span className="value">{paymentLabel}</span>
            </div>
            <div className="row">
              <span className="label">Envío</span>
              <span className="value">Correo Argentino - 3 a 5 días hábiles</span>
            </div>
            <div className="row">
              <span className="label">Dirección</span>
              <span className="value">
                {savedAddress ? `${savedAddress.calle} ${savedAddress.numero}, ${savedAddress.ciudad}` : 'Av. Dirección 1234, Ciudad, Provincia, CP 0000'}
              </span>
            </div>

            <div className="total-row">
              <span>Total</span>
              <span>{formatPrice(cartTotal)}</span>
            </div>
          </DetailCard>

          <ProductsCard>
            {cartItems.map((item, idx) => {
              const imageSrc = item.imagen ? `${process.env.REACT_APP_STRAPI_URL || 'http://localhost:1337'}${item.imagen}` : getProductImage(item.product);

              return (
              <div className="product-item" key={item.cartId || item.id || idx}>
                <div className="prod-info">
                  <div className="img-wrapper">
                    <img src={imageSrc} alt={item.product?.nombre || item.producto} />
                  </div>
                  <div className="details">
                    <h4>{item.product?.nombre || item.producto}</h4>
                    <p>
                      <span>Tamaño/Variante: {item.size || item.variante || 'N/A'}</span>
                      {item.color && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          Color: 
                          {item.color.startsWith('#') || ['red','green','blue','black','white','yellow','gray','purple','pink','orange'].includes(item.color.toLowerCase()) ? (
                            <span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: item.color, border: '1px solid #ddd' }} title={item.color} />
                          ) : (
                            item.color
                          )}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="prod-price">
                  {formatPrice(item.price || item.precio_unitario || (item.product?.precio * item.cantidad) || 0)}
                  <div style={{ fontSize: '0.8rem', color: '#777', fontWeight: 400 }}>x {item.quantity || item.cantidad || 1}</div>
                </div>
              </div>
            )})}
          </ProductsCard>

          <OrdersBtn to="/mi-cuenta">Ir a mis pedidos</OrdersBtn>
        </ConfirmationContainer>
      </ContentWrapper>
    </PageContainer>
  );
}
