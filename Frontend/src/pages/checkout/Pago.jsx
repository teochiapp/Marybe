import React, { useContext, useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../../context/CartContext';
import { AuthContext } from '../../context/AuthContext';
import { paymentOptions, sucursalesRetiro, infoTransferencia } from '../../data/checkout/paymentMethods';

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
  font-size: 0.95rem;
  color: #333;
`;

// Formularios
const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;

  &.half {
    width: 48%;
  }

  label {
    font-size: 0.9rem;
    font-weight: 500;
    color: #333;
  }

  input {
    padding: 12px 15px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 0.95rem;
    color: black;
    font-family: var(--font-family-secondary, sans-serif);
    transition: border-color 0.2s;

    &::placeholder {
      color: #aaa;
    }

    &:focus {
      outline: none;
      border-color: #5C0A0A;
    }
  }
`;

const Row = styled.div`
  display: flex;
  justify-content: space-between;
`;

const FormActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
`;

const SslBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background-color: #f0fdf4;
  border: 1px solid #2ecc71;
  border-radius: 8px;
  color: #27ae60;
  font-size: 0.85rem;
  font-weight: 600;

  svg {
    width: 16px;
    height: 16px;
  }
`;

const SaveBtn = styled.button`
  background-color: #2b0b0a;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 30px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #4a1311;
  }
`;

// Summary cards
const SummaryCard = styled.div`
  background-color: #ffffff;
  border-radius: 24px;
  padding: 30px;
  box-shadow: 0px 8px 24px 0px rgba(0, 0, 0, 0.04);
  font-family: var(--font-family-secondary, sans-serif);
  margin-bottom: 30px;
`;

const SummaryTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 700;
  color: black;
  font-family: var(--font-family-secondary, sans-serif);
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
  background-color: #2b0b0a;
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

const InfoCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  font-size: 0.9rem;
  color: #555;
`;

const EnvioGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 20px;
`;

const SelectBranch = styled.select`
  width: 100%;
  padding: 14px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.95rem;
  color: #333;
  font-family: var(--font-family-secondary, sans-serif);
  margin-bottom: 20px;
  background-color: white;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #5C0A0A;
  }
  
  optgroup {
    font-weight: 600;
  }
`;

const PaymentTextInfo = styled.div`
  background-color: #f9f9f9;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 20px;
  font-size: 0.95rem;
  color: #000; /* Text en negro */
  line-height: 1.6;

  p {
    margin-bottom: 10px;
  }
  p:last-child {
    margin-bottom: 0;
  }
`;

const TransferCard = styled.div`
  background-color: #f6f6f6;
  border-radius: 16px;
  padding: 30px;
  margin-bottom: 20px;
`;

const TransferRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }

  .label {
    color: #535353;
    font-size: 0.95rem;
    font-weight: 500;
  }

  .value {
    color: #000;
    font-size: 0.95rem;
    font-weight: 500;
  }
`;

const InfoBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 16px;
  border: 1px solid var(--color-bordo-tercero);
  border-radius: 8px;
  background-color: #fcf8f8;
  color: var(--color-bordo-tercero);
  font-size: 0.95rem;
  font-weight: 600;
  margin-bottom: 20px;

  svg {
    width: 20px;
    height: 20px;
  }
`;

const formatPrice = (price) => {
  if (!price) return '$0.00';
  return '$ ' + Number(price).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};



const ProcessingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  font-family: var(--font-family-secondary, sans-serif);

  h3 {
    margin-top: 20px;
    color: #333;
    font-size: 1.2rem;
  }
`;

const Spinner = styled.div`
  border: 4px solid #f3f3f3;
  border-top: 4px solid #5C0A0A;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

export default function Pago() {
  const { cartItems, cartTotal, appliedGiftCard, setAppliedGiftCard, clearCart } = useContext(CartContext);
  const { token, user } = useContext(AuthContext);

  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('transferencia');
  const [savedAddress, setSavedAddress] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState('Peatonal Tucuman 20, Santiago del Estero');
  const [isProcessing, setIsProcessing] = useState(false);

  const buttonText = paymentMethod === 'mercadopago' || paymentMethod === 'credito' || paymentMethod === 'debito' ? 'Pagar' : 'Hacer pedido';

  const handlePayment = async () => {
    setIsProcessing(true);

    let finalTotal = cartTotal;
    if (appliedGiftCard) {
      finalTotal = Math.max(0, finalTotal - appliedGiftCard.monto);
    }

    if (paymentMethod === 'mercadopago') {
      try {
        const generatedRef = `MARYBE-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const apiUrl = process.env.REACT_APP_STRAPI_URL || 'http://localhost:1337';
        const res = await fetch(`${apiUrl}/api/mercado-pago/crear-preferencia`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productos: cartItems,
            total: finalTotal,
            userEmail: user?.email,
            externalReference: generatedRef,
            frontendUrl: window.location.origin,
          }),
        });

        const data = await res.json();

        if (data.success && (data.init_point || data.sandbox_init_point)) {
          // ── Guardar datos del carrito en sessionStorage antes de salir ──
          sessionStorage.setItem('mp_pending_order', JSON.stringify({
            cartItems,
            cartTotal: finalTotal,
            paymentMethod: 'mercadopago',
            savedAddress: savedAddress || null,
            email: user?.email || '',
            token: token || '',
            externalReference: generatedRef,
          }));

          // ── Limpiar carrito y redirigir a Checkout Pro (igual que Maquifit) ──
          clearCart();
          const checkoutUrl = data.init_point || data.sandbox_init_point;
          window.location.href = checkoutUrl;
          return;
        } else {
          throw new Error('No se pudo generar el link de Mercado Pago');
        }
      } catch (error) {
        console.error('Error al generar preferencia MP:', error);
        setIsProcessing(false);
        alert('Hubo un error al conectar con Mercado Pago. Intenta nuevamente.');
        return;
      }
    }

    await confirmOrder(finalTotal);
  };

  const confirmOrder = useCallback(async (overrideTotal) => {
    setIsProcessing(true);
    
    let finalTotal = overrideTotal !== undefined ? overrideTotal : cartTotal;
    if (overrideTotal === undefined && appliedGiftCard) {
      finalTotal = Math.max(0, finalTotal - appliedGiftCard.monto);
    }

    // Captura del carrito antes de limpiarlo
    const itemsSnapshot = [...cartItems];
    let orderNumber = 'M-000000';

    try {
      // 1. Crear el pedido en Strapi
      const response = await fetch(`${process.env.REACT_APP_STRAPI_URL || 'http://localhost:1337'}/api/mis-pedidos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          productos: cartItems,
          total: finalTotal,
          metodo_pago: paymentMethod,
          direccion_envio: savedAddress || {}
        })
      });

      const json = await response.json();
      orderNumber = json.data?.numero_pedido || 'M-000000';
      
      // 2. Si se usó una gift card, consumirla
      if (appliedGiftCard) {
        await fetch(`${process.env.REACT_APP_STRAPI_URL || 'http://localhost:1337'}/api/gift-cards/consume`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ codigo: appliedGiftCard.codigo })
        });
        setAppliedGiftCard(null);
      }
    } catch (err) {
      console.error('Error al registrar el pedido en Strapi (el pago ya fue procesado):', err);
      // No bloqueamos la navegación — el pago de Mercado Pago ya se completó
    }

    // Limpiar carrito y navegar siempre al éxito
    clearCart();
    navigate('/order-success', { 
      state: { 
        paymentMethod, 
        cartItems: itemsSnapshot, 
        cartTotal: finalTotal, 
        savedAddress, 
        email: user?.email,
        orderNumber 
      } 
    });
  }, [cartItems, cartTotal, paymentMethod, savedAddress, appliedGiftCard, token, user, clearCart, navigate, setAppliedGiftCard]);

  useEffect(() => {
    if (token) {
      const fetchProfile = async () => {
        try {
          const apiUrl = process.env.REACT_APP_STRAPI_URL || 'http://localhost:1337';
          const res = await fetch(`${apiUrl}/api/mi-perfil`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const json = await res.json();
          if (json && json.data && json.data.direcciones && json.data.direcciones.length > 0) {
            setSavedAddress(json.data.direcciones[0]);
          }
        } catch (err) {
          console.error("Error al cargar perfil", err);
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



  return (
    <PageContainer>
      {isProcessing && (
        <ProcessingOverlay>
          <Spinner />
          <h3>Procesando pago...</h3>
        </ProcessingOverlay>
      )}
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
          <ProgressStep $active={true} $completed={false}>
            <div className="circle">4</div>
            <div className="label">Pago</div>
          </ProgressStep>
        </ProgressContainer>

        <LayoutGrid>
          <div>
            <SectionTitle>Método de pago</SectionTitle>

            {paymentOptions.map((opt) => (
              <OptionCard key={opt.id} $selected={paymentMethod === opt.id} onClick={() => setPaymentMethod(opt.id)}>
                <OptionInfo>
                  <input type="radio" checked={paymentMethod === opt.id} readOnly />
                  <div className="details">
                    <span className="title">{opt.title}</span>
                    <span className="subtitle">{opt.subtitle}</span>
                  </div>
                </OptionInfo>
                <OptionPrice>{opt.right}</OptionPrice>
              </OptionCard>
            ))}

            {paymentMethod === 'debito' || paymentMethod === 'credito' ? (
              <>
                <SectionTitle>Datos para Tarjeta de {paymentMethod === 'credito' ? 'Crédito' : 'Débito'}</SectionTitle>

                <form onSubmit={(e) => { e.preventDefault(); alert('Funcionalidad de pago no implementada'); }}>
                  <FormGroup>
                    <label>Número de tarjeta</label>
                    <input type="text" placeholder="0000 0000 0000 0000" />
                  </FormGroup>

                  <FormGroup>
                    <label>Nombre del titular (como aparece en la tarjeta)</label>
                    <input type="text" placeholder="APELLIDO NOMBRE" />
                  </FormGroup>

                  <Row>
                    <FormGroup className="half">
                      <label>Vencimiento</label>
                      <input type="text" placeholder="mm/aa" />
                    </FormGroup>
                    <FormGroup className="half">
                      <label>CVV</label>
                      <input type="text" placeholder="000" />
                    </FormGroup>
                  </Row>

                  <FormActions>
                    <SslBadge>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                        <polyline points="9 12 11 14 15 10"></polyline>
                      </svg>
                      Pago cifrado con SSL 256 bits
                    </SslBadge>
                    <SaveBtn type="button">Guardar</SaveBtn>
                  </FormActions>
                </form>
              </>
            ) : paymentMethod === 'transferencia' ? (
              <>
                <SectionTitle>Datos para Transferencia Bancaria</SectionTitle>
                <TransferCard>
                  <TransferRow><span className="label">Banco</span> <span className="value">{infoTransferencia.banco}</span></TransferRow>
                  <TransferRow><span className="label">Titular</span> <span className="value">{infoTransferencia.titular}</span></TransferRow>
                  <TransferRow><span className="label">CUIT</span> <span className="value">{infoTransferencia.cuit}</span></TransferRow>
                  <TransferRow><span className="label">CBU</span> <span className="value">{infoTransferencia.cbu}</span></TransferRow>
                  <TransferRow><span className="label">Alias</span> <span className="value">{infoTransferencia.alias}</span></TransferRow>
                </TransferCard>
                <InfoBox>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19.0498 4.91005C18.1329 3.98416 17.0408 3.25002 15.8373 2.75042C14.6338 2.25081 13.3429 1.99574 12.0398 2.00005C6.5798 2.00005 2.1298 6.45005 2.1298 11.9101C2.1298 13.6601 2.5898 15.3601 3.4498 16.8601L2.0498 22.0001L7.2998 20.6201C8.7498 21.4101 10.3798 21.8301 12.0398 21.8301C17.4998 21.8301 21.9498 17.3801 21.9498 11.9201C21.9498 9.27005 20.9198 6.78005 19.0498 4.91005ZM12.0398 20.1501C10.5598 20.1501 9.1098 19.7501 7.8398 19.0001L7.5398 18.8201L4.4198 19.6401L5.2498 16.6001L5.0498 16.2901C4.22735 14.9771 3.79073 13.4593 3.7898 11.9101C3.7898 7.37005 7.4898 3.67005 12.0298 3.67005C14.2298 3.67005 16.2998 4.53005 17.8498 6.09005C18.6174 6.85392 19.2257 7.7626 19.6394 8.76338C20.0531 9.76417 20.264 10.8371 20.2598 11.9201C20.2798 16.4601 16.5798 20.1501 12.0398 20.1501ZM16.5598 13.9901C16.3098 13.8701 15.0898 13.2701 14.8698 13.1801C14.6398 13.1001 14.4798 13.0601 14.3098 13.3001C14.1398 13.5501 13.6698 14.1101 13.5298 14.2701C13.3898 14.4401 13.2398 14.4601 12.9898 14.3301C12.7398 14.2101 11.9398 13.9401 10.9998 13.1001C10.2598 12.4401 9.7698 11.6301 9.6198 11.3801C9.4798 11.1301 9.5998 11.0001 9.7298 10.8701C9.8398 10.7601 9.9798 10.5801 10.0998 10.4401C10.2198 10.3001 10.2698 10.1901 10.3498 10.0301C10.4298 9.86005 10.3898 9.72005 10.3298 9.60005C10.2698 9.48005 9.7698 8.26005 9.5698 7.76005C9.3698 7.28005 9.1598 7.34005 9.0098 7.33005H8.5298C8.3598 7.33005 8.0998 7.39005 7.8698 7.64005C7.6498 7.89005 7.0098 8.49005 7.0098 9.71005C7.0098 10.9301 7.89981 12.1101 8.0198 12.2701C8.1398 12.4401 9.7698 14.9401 12.2498 16.0101C12.8398 16.2701 13.2998 16.4201 13.6598 16.5301C14.2498 16.7201 14.7898 16.6901 15.2198 16.6301C15.6998 16.5601 16.6898 16.0301 16.8898 15.4501C17.0998 14.8701 17.0998 14.3801 17.0298 14.2701C16.9598 14.1601 16.8098 14.1101 16.5598 13.9901Z" fill="#560203" />
                  </svg>
                  {infoTransferencia.mensajeWhatsapp}
                </InfoBox>
              </>
            ) : paymentMethod === 'mercadopago' ? (
              <>
                <SectionTitle>Pago con Mercado Pago</SectionTitle>
                <PaymentTextInfo>
                  <p>Al hacer clic en "Pagar", serás redirigido de forma segura a Mercado Pago para completar tu compra con tarjetas de débito, crédito o dinero en cuenta.</p>
                </PaymentTextInfo>
              </>
            ) : (
              <>
                <SectionTitle>Datos para Efectivo</SectionTitle>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#535353', fontWeight: '500' }}>
                    Selecciona la sucursal de retiro:
                  </label>
                  <SelectBranch value={selectedBranch} onChange={(e) => setSelectedBranch(e.target.value)}>
                    {sucursalesRetiro.map((grupo) => (
                      <optgroup key={grupo.provincia} label={grupo.provincia}>
                        {grupo.opciones.map((opt) => (
                          <option key={opt.id} value={opt.id}>{opt.label}</option>
                        ))}
                      </optgroup>
                    ))}
                  </SelectBranch>
                </div>

                <InfoBox>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  <span>
                    <strong>{selectedBranch}</strong> - Lun a vie de 09:00 a 20:00. Pagás al retirar.
                  </span>
                </InfoBox>
              </>
            )}
          </div>

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
                <span className="val">Free</span>
              </SummaryRow>

              <Divider />

              <TotalRow>
                <span>Total</span>
                <span className="val">{formatPrice(cartTotal)}</span>
              </TotalRow>

              <PrimaryBtn onClick={handlePayment} disabled={isProcessing}>
                {isProcessing ? 'Procesando...' : buttonText}
              </PrimaryBtn>
            </SummaryCard>

            <SummaryCard>
              <SummaryTitle>Envío</SummaryTitle>
              <EnvioGrid>
                <InfoCol>
                  <span>Domicilio</span>
                </InfoCol>
                <InfoCol>
                  {savedAddress ? (
                    <span>{savedAddress.calle} {savedAddress.numero}, {savedAddress.ciudad}, {savedAddress.provincia}, CP {savedAddress.cp}</span>
                  ) : (
                    <span>Av. Dirección 1234, Ciudad, Provincia, CP 0000</span>
                  )}
                </InfoCol>
              </EnvioGrid>
            </SummaryCard>
          </div>
        </LayoutGrid>

      </ContentWrapper>
    </PageContainer>
  );
}
