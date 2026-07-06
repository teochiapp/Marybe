import React, { useContext, useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../../context/CartContext';
import { AuthContext } from '../../context/AuthContext';
import { useConfiguracionGeneral } from '../../hooks/useConfiguracionGeneral';

// Styled Components
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

// Progress Bar
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
  font-family: var(--font-family-secondary, sans-serif);
  font-size: 1.4rem;
  font-weight: 600;
  color: var(--color-marron-cuarto);
  margin-top: 30px;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
  
  &:first-child {
    margin-top: 0;
  }
`;

const OptionCard = styled.label`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border: 1px solid ${({ $selected }) => ($selected ? '#5C0A0A' : '#ddd')};
  border-radius: 8px;
  margin-bottom: 15px;
  cursor: pointer;
  transition: all 0.2s;
  background-color: ${({ $selected }) => ($selected ? '#fffafb' : '#fff')};

  &:hover {
    border-color: #5C0A0A;
  }
`;

const OptionInfo = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 15px;

  input[type="radio"] {
    margin-top: 5px;
    accent-color: #5C0A0A;
    width: 16px;
    height: 16px;
  }

  .details {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .title {
    font-size: 1rem;
    font-weight: 500;
    color: #333;
  }

  .subtitle {
    font-size: 0.85rem;
    color: #777;
  }
`;

const OptionPrice = styled.div`
  font-weight: 600;
  font-size: 1rem;
  color: ${({ $isFree }) => ($isFree ? '#27ae60' : '#333')};
`;

const AddAddressBtn = styled.button`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 20px 0;
  background: none;
  border: none;
  border-top: 1px solid #eee;
  font-size: 1rem;
  font-weight: 500;
  color: #333;
  cursor: pointer;
  font-family: var(--font-family-secondary, sans-serif);

  &:hover {
    color: #5C0A0A;
  }
`;

// Order Summary
const SummaryCard = styled.div`
  background-color: #ffffff;
  border-radius: 24px;
  padding: 30px;
  box-shadow: 0px 8px 24px 0px rgba(0, 0, 0, 0.04);
  font-family: var(--font-family-secondary, sans-serif);
`;

const SummaryTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 700;
  color: black;
  margin-bottom: 25px;
`;

const ProductsPreview = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
`;

const ProductImagesRow = styled.div`
  display: flex;
  gap: 10px;

  .img-wrapper {
    width: 45px;
    height: 45px;
    border-radius: 50%;
    background-color: #f9f9f9;
    border: 1px solid #eee;
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
`;

const EditCartBtn = styled(Link)`
  font-size: 0.85rem;
  color: #555;
  text-decoration: none;
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    background-color: #f5f5f5;
    color: #333;
  }
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
  background-color: #2b0b0a; /* Dark maroon color from the image */
  color: white;
  border: none;
  border-radius: 8px;
  padding: 16px;
  font-size: 1.05rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  font-family: var(--font-family-secondary, sans-serif);

  &:hover {
    background-color: #4a1311;
  }
`;

const formatPrice = (price) => {
  if (!price) return '$0.00';
  return '$ ' + Number(price).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export default function Envio() {
  const { cartItems, cartTotal } = useContext(CartContext);
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [shippingMethod, setShippingMethod] = useState('domicilio');
  const [address, setAddress] = useState('guardada');
  const [savedAddress, setSavedAddress] = useState(null);

  useEffect(() => {
    if (token) {
      const fetchProfile = async () => {
        try {
          const apiUrl = process.env.REACT_APP_STRAPI_URL || 'http://localhost:1337';
          const res = await fetch(`${apiUrl}/api/mi-perfil`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const json = await res.json();
          if (json && json.data) {
            const profile = json.data;
            if (profile.direcciones && profile.direcciones.length > 0) {
              setSavedAddress(profile.direcciones[0]);
            }
          }
        } catch (err) {
          console.error("Error al cargar perfil para envío", err);
        }
      };
      fetchProfile();
    }
  }, [token]);

  const getProductImage = (product) => {
    let imgUrl = '/placeholder.png';
    if (product.portada?.data?.attributes?.url) {
      imgUrl = `${process.env.REACT_APP_STRAPI_URL || 'http://localhost:1337'}${product.portada.data.attributes.url}`;
    } else if (product.portada?.url) {
      imgUrl = `${process.env.REACT_APP_STRAPI_URL || 'http://localhost:1337'}${product.portada.url}`;
    }
    return imgUrl;
  };

  const { config: siteConfig } = useConfiguracionGeneral();

  // Lógica de costo de envío dinámico desde Strapi
  const costoEnvio = siteConfig?.costo_envio ?? null;
  const envioGratisDesde = siteConfig?.envio_gratis_desde ?? null;
  
  const esSucursal = shippingMethod === 'sucursal';
  const envioEsGratis = esSucursal || (envioGratisDesde !== null && cartTotal >= envioGratisDesde);
  const shippingCost = envioEsGratis ? 0 : (costoEnvio ?? 0);
  
  const finalTotal = cartTotal + shippingCost;

  return (
    <PageContainer>
      <ContentWrapper>

        <Breadcrumb>
          <Link to="/">Inicio</Link> <span>/</span> <Link to="/carrito">Carrito</Link> <span>/</span> <Link to="/login">Identificación</Link> <span>/</span> <span className="active">Envío</span>
        </Breadcrumb>

        {/* Progress Bar */}
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
          <ProgressStep $active={true} $completed={false}>
            <div className="circle">3</div>
            <div className="label">Envío</div>
          </ProgressStep>
          <ProgressStep $active={false} $completed={false}>
            <div className="circle">4</div>
            <div className="label">Pago</div>
          </ProgressStep>
        </ProgressContainer>

        <LayoutGrid>
          {/* Opciones de Envío y Dirección */}
          <div>
            <SectionTitle>Método de envío</SectionTitle>

            <OptionCard $selected={shippingMethod === 'domicilio'} onClick={() => setShippingMethod('domicilio')}>
              <OptionInfo>
                <input type="radio" checked={shippingMethod === 'domicilio'} readOnly />
                <div className="details">
                  <span className="title">Envío a domicilio</span>
                  <span className="subtitle">3 a 4 días hábiles - Envío por correo Argentino.</span>
                </div>
              </OptionInfo>
              <OptionPrice>
                {costoEnvio === null 
                  ? 'Calculando...' 
                  : (envioGratisDesde !== null && cartTotal >= envioGratisDesde) 
                  ? 'Gratis' 
                  : formatPrice(costoEnvio)}
              </OptionPrice>
            </OptionCard>

            <OptionCard $selected={shippingMethod === 'sucursal'} onClick={() => setShippingMethod('sucursal')}>
              <OptionInfo>
                <input type="radio" checked={shippingMethod === 'sucursal'} readOnly />
                <div className="details">
                  <span className="title">Retiro por sucursal</span>
                </div>
              </OptionInfo>
              <OptionPrice $isFree>Gratis</OptionPrice>
            </OptionCard>

            <SectionTitle>Dirección</SectionTitle>

            <OptionCard $selected={address === 'guardada'} onClick={() => setAddress('guardada')}>
              <OptionInfo>
                <input type="radio" checked={address === 'guardada'} readOnly />
                <div className="details">
                  <span className="title">Dirección Guardada</span>
                  <span className="subtitle">
                    {savedAddress
                      ? `${savedAddress.calle} ${savedAddress.numero}, ${savedAddress.ciudad}, ${savedAddress.provincia}, CP ${savedAddress.cp}`
                      : 'Cargando...'}
                  </span>
                </div>
              </OptionInfo>
            </OptionCard>

            <AddAddressBtn type="button" onClick={() => navigate('/login?edit=true')}>
              Modificar mi dirección <span>&gt;</span>
            </AddAddressBtn>

          </div>

          {/* Resumen de Pedido */}
          <div>
            <SummaryCard>
              <SummaryTitle>Tu pedido</SummaryTitle>

              <ProductsPreview>
                <ProductImagesRow>
                  {cartItems.slice(0, 4).map((item) => (
                    <div className="img-wrapper" key={item.cartId}>
                      <img src={getProductImage(item.product)} alt={item.product.nombre} />
                    </div>
                  ))}
                  {cartItems.length > 4 && (
                    <div className="img-wrapper" style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#555' }}>
                      +{cartItems.length - 4}
                    </div>
                  )}
                </ProductImagesRow>
                <EditCartBtn to="/carrito">Editar Carrito</EditCartBtn>
              </ProductsPreview>

              <SummaryRow>
                <span>Subtotal</span>
                <span className="val">{formatPrice(cartTotal)}</span>
              </SummaryRow>

              <SummaryRow>
                <span>Envío:</span>
                <span className="val" style={{ color: envioEsGratis ? '#27ae60' : '#333' }}>
                  {costoEnvio === null && !esSucursal
                    ? 'Calculando...'
                    : esSucursal
                    ? 'Gratis (retiro)'
                    : envioEsGratis
                    ? 'Gratis'
                    : formatPrice(costoEnvio)}
                </span>
              </SummaryRow>
              {!envioEsGratis && envioGratisDesde !== null && costoEnvio !== null && (
                <SummaryRow style={{ fontSize: '0.8rem', color: '#888', marginTop: '-8px' }}>
                  <span style={{ fontStyle: 'italic' }}>Envío gratis desde {formatPrice(envioGratisDesde)}</span>
                  <span />
                </SummaryRow>
              )}

              <Divider />

              <TotalRow>
                <span>Total</span>
                <span className="val">{formatPrice(finalTotal)}</span>
              </TotalRow>

              <PrimaryBtn onClick={() => navigate('/pago')}>Ir a pagar</PrimaryBtn>

            </SummaryCard>
          </div>
        </LayoutGrid>

      </ContentWrapper>
    </PageContainer>
  );
}
