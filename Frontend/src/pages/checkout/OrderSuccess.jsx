import React from 'react';
import styled from 'styled-components';
import { Link, useLocation, Navigate } from 'react-router-dom';

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
  height: 1px;
  background-color: #d3d3d3;
  z-index: 0;
`;

const ConfirmationContainer = styled.div`
  max-width: 900px;
  margin: 0 auto;
  font-family: var(--font-family-secondary, sans-serif);
`;

const SuccessBanner = styled.div`
  background-color: #e6fcf0;
  border: 1px solid #2ecc71;
  border-radius: 12px;
  padding: 30px;
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;

  svg {
    width: 45px;
    height: 45px;
    color: #27ae60;
  }
  
  .text {
    h2 {
      font-size: 1.8rem;
      color: #27ae60;
      font-family: var(--font-family-secondary, sans-serif);
      margin: 0 0 10px 0;
      font-weight: 700;
    }
    p {
      margin: 0;
      color: #333;
      font-size: 1rem;
    }
  }
`;

const DetailCard = styled.div`
  background-color: #f9f9f9;
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 30px;

  .row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
    font-size: 0.95rem;

    .label {
      color: #555;
    }
    .value {
      font-weight: 500;
      color: #333;
      text-align: right;
    }
  }

  .total-row {
    display: flex;
    justify-content: space-between;
    margin-top: 30px;
    padding-top: 20px;
    border-top: 1px solid #ddd;
    font-size: 1.3rem;
    font-weight: 700;
    color: #333;
  }
`;

const ProductsCard = styled.div`
  background-color: #ffffff;
  border: 1px solid #eee;
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 30px;

  .product-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 20px;
    border-bottom: 1px solid #eee;

    &:last-child {
      border-bottom: none;
      margin-bottom: 0;
      padding-bottom: 0;
    }

    .prod-info {
      display: flex;
      gap: 15px;
      align-items: center;
      
      .img-wrapper {
        width: 60px;
        height: 60px;
        background-color: #f5f5f5;
        border-radius: 8px;
        display: flex;
        justify-content: center;
        align-items: center;
        overflow: hidden;

        img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
      }

      .details {
        h4 {
          margin: 0 0 5px 0;
          font-size: 1rem;
          color: #333;
          font-weight: 600;
        }
        p {
          margin: 0;
          font-size: 0.85rem;
          color: #777;
          display: flex;
          align-items: center;
          gap: 6px;
        }
      }
    }

    .prod-price {
      font-weight: 600;
      font-size: 1rem;
      color: #333;
    }

    @media (max-width: 768px) {
      flex-direction: column;
      text-align: center;
      gap: 15px;
      
      .prod-info {
        flex-direction: column;
        justify-content: center;
        gap: 15px;

        .img-wrapper {
          width: 80px;
          height: 80px;
        }

        .details {
          h4 {
            font-size: 1.1rem;
            margin-bottom: 8px;
          }
          p {
            justify-content: center;
          }
        }
      }

      .prod-price {
        font-size: 1.1rem;
      }
    }
  }
`;

const OrdersBtn = styled(Link)`
  display: block;
  width: 250px;
  margin: 0 auto;
  background-color: #2b0b0a;
  color: white;
  text-align: center;
  padding: 15px 0;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  font-size: 1rem;
  transition: background-color 0.2s;

  &:hover {
    background-color: #4a1311;
  }
`;

const formatPrice = (price) => {
  if (!price) return '$0.00';
  return '$ ' + Number(price).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const getProductImage = (product) => {
  let imgUrl = '/placeholder.png';
  if (product?.portada?.data?.attributes?.url) {
    imgUrl = `${process.env.REACT_APP_STRAPI_URL || 'http://localhost:1337'}${product.portada.data.attributes.url}`;
  } else if (product?.portada?.url) {
    imgUrl = `${process.env.REACT_APP_STRAPI_URL || 'http://localhost:1337'}${product.portada.url}`;
  }
  return imgUrl;
};

export default function OrderSuccess() {
  const location = useLocation();
  
  if (!location.state) {
    return <Navigate to="/carrito" replace />;
  }

  const { paymentMethod, cartItems, cartTotal, savedAddress, email } = location.state;

  return (
    <PageContainer>
      <ContentWrapper>
        <Breadcrumb>
          <Link to="/">Inicio</Link> <span>/</span> <Link to="/carrito">Carrito</Link> <span>/</span> <Link to="/login">Identificación</Link> <span>/</span> <Link to="/envio">Envío</Link> <span>/</span> <span className="active">Pago</span>
        </Breadcrumb>

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

        <ConfirmationContainer>
          <SuccessBanner>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <div className="text">
              <h2>Pedido confirmado! N01-123-45</h2>
              <p>Confirmación enviada a {email || 'tu email'}</p>
            </div>
          </SuccessBanner>

          <DetailCard>
            <div className="row">
              <span className="label">Pago</span>
              <span className="value">{paymentMethod === 'transferencia' ? 'Transferencia' : paymentMethod === 'efectivo' ? 'Efectivo' : 'Débito/Crédito'}</span>
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
            {cartItems.map(item => (
              <div className="product-item" key={item.cartId || item.id}>
                <div className="prod-info">
                  <div className="img-wrapper">
                    <img src={getProductImage(item.product)} alt={item.product?.nombre} />
                  </div>
                  <div className="details">
                    <h4>{item.product?.nombre}</h4>
                    <p>
                      <span>Tamaño: {item.size || 'N/A'}</span>
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
                  {formatPrice(item.price || (item.product?.precio * item.cantidad))}
                </div>
              </div>
            ))}
          </ProductsCard>

          <OrdersBtn to="/mi-cuenta">Ir a mis pedidos</OrdersBtn>
        </ConfirmationContainer>
      </ContentWrapper>
    </PageContainer>
  );
}
