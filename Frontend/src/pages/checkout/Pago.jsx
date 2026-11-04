import React, { useContext, useState, useEffect, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../../context/CartContext';
import { AuthContext } from '../../context/AuthContext';
import { readDelivery, validDelivery, shippingCost } from '../../utils/checkoutDelivery';
import { readGuest, validGuest } from '../../utils/guestCheckout';
import { useConfiguracionGeneral } from '../../hooks/useConfiguracionGeneral';
import { readPendingCheckout, syncCheckout } from '../../utils/mercadoPagoCheckout';

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

const MiniProduct = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 15px;

  .img-wrapper {
    width: 45px;
    height: 45px;
    border-radius: 8px;
    background-color: #f9f9f9;
    border: 1px solid #eee;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    flex-shrink: 0;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }

  .details {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
    
    .name {
      font-size: 0.9rem;
      font-weight: 500;
      color: #333;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    
    .meta {
      font-size: 0.8rem;
      color: #777;
    }
  }

  .price {
    font-size: 0.95rem;
    font-weight: 600;
    color: #333;
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

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
  padding: 20px;
  backdrop-filter: blur(4px);
`;

const ModalCard = styled.div`
  background-color: #ffffff;
  border-radius: 24px;
  padding: 40px;
  max-width: 600px;
  width: 100%;
  box-shadow: 0px 20px 40px rgba(0, 0, 0, 0.15);
  font-family: var(--font-family-secondary, sans-serif);
  animation: modalScale 0.25s ease-out;

  @keyframes modalScale {
    from { transform: scale(0.95); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }
`;

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-marron-cuarto, #2b0b0a);
  margin-bottom: 25px;
  border-bottom: 1px solid #eee;
  padding-bottom: 15px;
`;

const ModalButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 30px;
`;

const SecondaryBtn = styled.button`
  background-color: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 14px 24px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: var(--font-family-secondary, sans-serif);

  &:hover {
    background-color: #ebebeb;
  }
`;

const ConfirmBtn = styled.button`
  background-color: #2b0b0a;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 14px 28px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  font-family: var(--font-family-secondary, sans-serif);

  &:hover {
    background-color: #4a1311;
  }
`;

export default function Pago() {
  const { cartItems, cartTotal, appliedGiftCard, setAppliedGiftCard, clearCart } = useContext(CartContext);
  const { token, user, isLoading: authLoading } = useContext(AuthContext);
  const { config: siteConfig } = useConfiguracionGeneral();

  // Métodos de pago dinámicos desde Strapi (con fallback al archivo estático)
  const metodosPago = useMemo(() => siteConfig?.metodosPago ?? [], [siteConfig]);
  const infoTransf  = useMemo(() => siteConfig?.infoTransferencia ?? {}, [siteConfig]);

  const navigate = useNavigate();
  const [guest] = useState(readGuest);
  const customerEmail = token ? user?.email : guest?.email;
  const orderEndpoint = token ? '/api/mis-pedidos' : '/api/pedidos-invitado';
  const [paymentMethod, setPaymentMethod] = useState('mercadopago');
  const [savedAddress] = useState(readDelivery);
  const esSucursal = savedAddress?.metodo_envio === 'sucursal';
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkingPrevious, setCheckingPrevious] = useState(() => Boolean(readPendingCheckout()));
  const [previousPaymentError, setPreviousPaymentError] = useState('');
  useEffect(() => {
    let active = true;
    const pending = readPendingCheckout();
    if (!pending) return undefined;
    syncCheckout(pending, true).then(result => {
      if (!active) return;
      if (result.pagado || result.estado === 'Pendiente de pago') {
        navigate(`/order-success?reference=${encodeURIComponent(pending.externalReference)}`, { replace: true });
      } else {
        sessionStorage.removeItem('mp_pending_order');
        setCheckingPrevious(false);
      }
    }).catch(error => { if (active) { setPreviousPaymentError(error.message); setCheckingPrevious(false); } });
    return () => { active = false; };
  }, [navigate]);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferFinalTotal, setTransferFinalTotal] = useState(0);

  // Si el método activo fue deshabilitado en Strapi, seleccionar el primero disponible
  useEffect(() => {
    if (metodosPago.length > 0 && !metodosPago.find(m => m.id === paymentMethod)) {
      setPaymentMethod(metodosPago[0].id);
    }
  }, [metodosPago, paymentMethod]);

  // Lógica de costo de envío dinámico desde Strapi
  const costoEnvio = siteConfig?.costo_envio ?? null;
  const envioGratisDesde = siteConfig?.envio_gratis_desde ?? null;

  // Calculamos el total de productos físicos (ignorando Gift Cards) para la lógica de envío
  const totalFisico = cartItems.reduce((acc, item) => {
    const esGiftCard = item.product?.id?.toString().startsWith('gift-card-') || 
                       item.product?.nombre?.toLowerCase().includes('gift card');
    return esGiftCard ? acc : acc + ((item.price || item.product?.precio || 0) * (item.quantity || 1));
  }, 0);

  // Delivery determines shipping fees independently of the payment method.
  // El envío es gratis si es retiro, si solo se compraron Gift Cards (totalFisico === 0), o si superan el mínimo
  const costoEnvioFinal = shippingCost(savedAddress?.metodo_envio, totalFisico, siteConfig);
  const envioEsGratis = costoEnvioFinal === 0;

  const buttonText = paymentMethod === 'mercadopago' || paymentMethod === 'credito' || paymentMethod === 'debito'
    ? 'Pagar'
    : paymentMethod === 'aconvenir'
    ? 'Contactar por WhatsApp'
    : 'Hacer pedido';

  const handlePayment = async () => {
    if (checkingPrevious || previousPaymentError) return;
    if (authLoading) return;
    if (!token && !validGuest(guest)) { navigate('/login'); return; }
    if (!validDelivery(savedAddress)) { navigate('/envio'); return; }
    if (isProcessing) return;
    if (!siteConfig || !metodosPago.some(method => method.id === paymentMethod)) return;
    if (['credito', 'debito'].includes(paymentMethod)) {
      alert('Elegí Mercado Pago para pagar con tarjeta.');
      return;
    }
    let finalTotal = Number(cartTotal) + Number(costoEnvioFinal);
    if (appliedGiftCard) {
      finalTotal = Math.max(0, finalTotal - Number(appliedGiftCard.monto));
    }

    if (paymentMethod === 'aconvenir') {
      const numero = siteConfig?.whatsapp_numero || '5493510000000';
      const lineasProductos = cartItems
        .map((item) => `• ${item.product.nombre} (x${item.quantity}) - ${formatPrice(item.price * item.quantity)}`)
        .join('%0A');
      const totalTexto = formatPrice(finalTotal);
      const mensaje =
        `Hola!%20Me%20interesa%20realizar%20el%20siguiente%20pedido:%0A%0A` +
        `🛍 *Productos:*%0A${lineasProductos}%0A%0A` +
        `💰 *Total:%20${totalTexto}*%0A%0A` +
        `%C2%BFPodemos%20coordinar%20el%20pago?`;
      const popup = window.open('', '_blank');
      const orderNumber = await confirmOrder(finalTotal);
      if (!orderNumber) { popup?.close(); return; }
      const url = `https://wa.me/${numero}?text=${mensaje}%0A%0APedido:%20${encodeURIComponent(orderNumber)}`;
      if (popup) { popup.opener = null; popup.location.href = url; }
      else window.location.href = url;
      return;
    }

    if (paymentMethod === 'transferencia') {
      setTransferFinalTotal(finalTotal); // Guardar el total ya calculado (con envío + GC)
      setShowTransferModal(true);
      return;
    }

    setIsProcessing(true);

    if (paymentMethod === 'mercadopago') {
      if (finalTotal === 0) {
        await confirmOrder(finalTotal);
        return;
      }

      try {
        // Primero registramos un intento pendiente; el servidor confirma el pago.
        // Captura del carrito antes de limpiarlo
        let orderNumber = 'M-000000';

        const responseOrder = await fetch(`${process.env.REACT_APP_STRAPI_URL || 'http://localhost:1337'}${orderEndpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            productos: cartItems,
            ...(!token ? { cliente: guest } : {}),
            total: finalTotal,
            metodo_pago: paymentMethod,
            direccion_envio: savedAddress || {},
            envio: costoEnvioFinal,
            metodo_envio: savedAddress.metodo_envio,
            descuento_gift_card: appliedGiftCard ? appliedGiftCard.monto : 0,
            codigo_gift_card: appliedGiftCard ? appliedGiftCard.codigo : null
          })
        });
        
        if (!responseOrder.ok) {
          throw new Error('No se pudo generar el pedido en la tienda.');
        }

        const json = await responseOrder.json();
        orderNumber = json.data?.numero_pedido || 'M-000000';
        if (!json.checkoutToken) throw new Error('No se pudo iniciar la sesión de pago.');
        // Save before requesting MP: a network failure must not lose the order reference.
        sessionStorage.setItem('mp_pending_order', JSON.stringify({ cartItems, cartTotal: finalTotal, paymentMethod: 'mercadopago', savedAddress, email: customerEmail || '', isGuest: !token, externalReference: orderNumber, checkoutToken: json.checkoutToken }));

        // 2. Ahora sí generamos la preferencia de Mercado Pago usando el número de pedido como externalReference
        const apiUrl = process.env.REACT_APP_STRAPI_URL || 'http://localhost:1337';
        const res = await fetch(`${apiUrl}/api/mercado-pago/crear-preferencia`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            externalReference: orderNumber,
            checkoutToken: json.checkoutToken,
          }),
        });

        const data = await res.json();

        if (res.ok && data.success && (data.init_point || data.sandbox_init_point)) {
          // ── Guardar datos del carrito en sessionStorage por si vuelve atrás ──
          sessionStorage.setItem('mp_pending_order', JSON.stringify({
            cartItems,
            cartTotal: finalTotal,
            paymentMethod: 'mercadopago',
            savedAddress: savedAddress || null,
            email: customerEmail || '',
            isGuest: !token,
            externalReference: orderNumber,
            checkoutToken: json.checkoutToken,
            appliedGiftCard: appliedGiftCard || null,
            costoEnvioFinal
          }));

          // ── Redirigir a Checkout Pro sin limpiar el carrito (por si vuelve atrás) ──
          const checkoutUrl = data.init_point || data.sandbox_init_point;
          window.location.href = checkoutUrl;
          return;
        } else {
          throw new Error('No se pudo generar el link de Mercado Pago');
        }
      } catch (error) {
        console.error('Error al generar pedido o preferencia MP:', error);
        const pending = readPendingCheckout();
        if (pending) {
          try {
            const result = await syncCheckout(pending, true);
            if (result.pagado || result.estado === 'Pendiente de pago') {
              navigate(`/order-success?reference=${encodeURIComponent(pending.externalReference)}`, { replace: true });
            } else sessionStorage.removeItem('mp_pending_order');
          } catch (verifyError) { setPreviousPaymentError(verifyError.message); }
        }
        setIsProcessing(false);
        alert('Hubo un error al conectar con Mercado Pago. Intenta nuevamente.');
        return;
      }
    }

    await confirmOrder(finalTotal);
  };

  const confirmOrder = useCallback(async (overrideTotal) => {
    if (authLoading) return;
    if (!token && !validGuest(guest)) { navigate('/login'); return; }
    if (!validDelivery(savedAddress)) { navigate('/envio'); return; }
    setIsProcessing(true);
    
    let finalTotal = overrideTotal !== undefined ? Number(overrideTotal) : Number(cartTotal) + Number(costoEnvioFinal);
    if (overrideTotal === undefined && appliedGiftCard) {
      finalTotal = Math.max(0, finalTotal - Number(appliedGiftCard.monto));
    }

    // Captura del carrito antes de limpiarlo
    const itemsSnapshot = [...cartItems];
    let orderNumber = 'M-000000';

    try {
      // 1. Crear el pedido en Strapi
      const response = await fetch(`${process.env.REACT_APP_STRAPI_URL || 'http://localhost:1337'}${orderEndpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          productos: cartItems,
          ...(!token ? { cliente: guest } : {}),
          total: finalTotal,
          metodo_pago: paymentMethod,
          direccion_envio: savedAddress || {},
          envio: costoEnvioFinal,
          metodo_envio: savedAddress.metodo_envio,
          descuento_gift_card: appliedGiftCard ? appliedGiftCard.monto : 0,
          codigo_gift_card: appliedGiftCard ? appliedGiftCard.codigo : null
        })
      });

      if (!response.ok) throw new Error('No se pudo registrar el pedido. Intentá nuevamente.');
      const json = await response.json();
      orderNumber = json.data?.numero_pedido || 'M-000000';
      // 2 y 3: La generación y consumo de Gift Cards ahora ocurre internamente en el backend al crear el pedido.
      if (appliedGiftCard) {
        setAppliedGiftCard(null);
      }
    } catch (err) {
      console.error('Error al registrar el pedido en Strapi (el pago ya fue procesado):', err);
      setIsProcessing(false);
      alert(err.message || 'No se pudo registrar el pedido.');
      return;
    }

    // Limpiar carrito y navegar siempre al éxito
    clearCart();
    navigate('/order-success', { 
      state: { 
        paymentMethod, 
        cartItems: itemsSnapshot, 
        cartTotal: finalTotal, 
        savedAddress, 
        email: customerEmail,
        isGuest: !token,
        orderNumber 
      } 
    });
    return orderNumber;
  }, [cartItems, cartTotal, paymentMethod, savedAddress, appliedGiftCard, token, customerEmail, guest, orderEndpoint, clearCart, navigate, setAppliedGiftCard, costoEnvioFinal, authLoading]);

  useEffect(() => {
    if (authLoading) return;
    if (!token && !validGuest(guest)) { navigate('/login', { replace: true }); return; }
    if (!validDelivery(savedAddress)) navigate('/envio', { replace: true });
  }, [savedAddress, navigate, token, guest, authLoading]);

  const getProductImage = (product) => {
    let imgUrl = '/placeholder.png';
    if (product.portada?.local) {
      imgUrl = product.portada.url;
    } else if (product.portada?.data?.attributes?.url) {
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

      {showTransferModal && (
        <ModalOverlay onClick={() => setShowTransferModal(false)}>
          <ModalCard onClick={(e) => e.stopPropagation()}>
            <ModalTitle>Datos para Transferencia Bancaria</ModalTitle>
            <TransferCard>
              <TransferRow><span className="label">Banco</span> <span className="value">{infoTransf.banco || 'Banco Galicia'}</span></TransferRow>
              <TransferRow><span className="label">Titular</span> <span className="value">{infoTransf.titular || 'Marybe SRL'}</span></TransferRow>
              <TransferRow><span className="label">CUIT</span> <span className="value">{infoTransf.cuit || '30-71234567-9'}</span></TransferRow>
              <TransferRow><span className="label">CBU</span> <span className="value">{infoTransf.cbu || '—'}</span></TransferRow>
              <TransferRow><span className="label">Alias</span> <span className="value">{infoTransf.alias || '—'}</span></TransferRow>
            </TransferCard>
            <InfoBox>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19.0498 4.91005C18.1329 3.98416 17.0408 3.25002 15.8373 2.75042C14.6338 2.25081 13.3429 1.99574 12.0398 2.00005C6.5798 2.00005 2.1298 6.45005 2.1298 11.9101C2.1298 13.6601 2.5898 15.3601 3.4498 16.8601L2.0498 22.0001L7.2998 20.6201C8.7498 21.4101 10.3798 21.8301 12.0398 21.8301C17.4998 21.8301 21.9498 17.3801 21.9498 11.9201C21.9498 9.27005 20.9198 6.78005 19.0498 4.91005ZM12.0398 20.1501C10.5598 20.1501 9.1098 19.7501 7.8398 19.0001L7.5398 18.8201L4.4198 19.6401L5.2498 16.6001L5.0498 16.2901C4.22735 14.9771 3.79073 13.4593 3.7898 11.9101C3.7898 7.37005 7.4898 3.67005 12.0298 3.67005C14.2298 3.67005 16.2998 4.53005 17.8498 6.09005C18.6174 6.85392 19.2257 7.7626 19.6394 8.76338C20.0531 9.76417 20.264 10.8371 20.2598 11.9201C20.2798 16.4601 16.5798 20.1501 12.0398 20.1501ZM16.5598 13.9901C16.3098 13.8701 15.0898 13.2701 14.8698 13.1801C14.6398 13.1001 14.4798 13.0601 14.3098 13.3001C14.1398 13.5501 13.6698 14.1101 13.5298 14.2701C13.3898 14.4401 13.2398 14.4601 12.9898 14.3301C12.7398 14.2101 11.9398 13.9401 10.9998 13.1001C10.2598 12.4401 9.7698 11.6301 9.6198 11.3801C9.4798 11.1301 9.5998 11.0001 9.7298 10.8701C9.8398 10.7601 9.9798 10.5801 10.0998 10.4401C10.2198 10.3001 10.2698 10.1901 10.3498 10.0301C10.4298 9.86005 10.3898 9.72005 10.3298 9.60005C10.2698 9.48005 9.7698 8.26005 9.5698 7.76005C9.3698 7.28005 9.1598 7.34005 9.0098 7.33005H8.5298C8.3598 7.33005 8.0998 7.39005 7.8698 7.64005C7.6498 7.89005 7.0098 8.49005 7.0098 9.71005C7.0098 10.9301 7.89981 12.1101 8.0198 12.2701C8.1398 12.4401 9.7698 14.9401 12.2498 16.0101C12.8398 16.2701 13.2998 16.4201 13.6598 16.5301C14.2498 16.7201 14.7898 16.6901 15.2198 16.6301C15.6998 16.5601 16.6898 16.0301 16.8898 15.4501C17.0998 14.8701 17.0998 14.3801 17.0298 14.2701C16.9598 14.1601 16.8098 14.1101 16.5598 13.9901Z" fill="#560203" />
              </svg>
              {infoTransf.mensajeWhatsapp || 'Enviá el comprobante por WhatsApp'}
            </InfoBox>
            <ModalButtonGroup>
              <SecondaryBtn onClick={() => setShowTransferModal(false)}>Cancelar</SecondaryBtn>
              <ConfirmBtn onClick={() => { setShowTransferModal(false); confirmOrder(transferFinalTotal); }}>Ya transferí, confirmar pedido</ConfirmBtn>
            </ModalButtonGroup>
          </ModalCard>
        </ModalOverlay>
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

            {metodosPago.map((opt) => (
              <OptionCard key={opt.id} $selected={paymentMethod === opt.id} onClick={() => setPaymentMethod(opt.id)}>
                <OptionInfo>
                  <input type="radio" checked={paymentMethod === opt.id} readOnly />
                  <div className="details">
                    <span className="title">{opt.title}</span>
                    <span className="subtitle">{opt.id === 'efectivo' ? (esSucursal ? 'Pagás al retirar en la sucursal elegida' : 'Pagás al recibir en tu domicilio') : opt.subtitle}</span>
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
                <SectionTitle>{siteConfig?.transf_titulo || 'Datos para Transferencia Bancaria'}</SectionTitle>
                <TransferCard>
                  <TransferRow><span className="label">Banco</span> <span className="value">{infoTransf.banco || 'Banco Galicia'}</span></TransferRow>
                  <TransferRow><span className="label">Titular</span> <span className="value">{infoTransf.titular || 'Marybe SRL'}</span></TransferRow>
                  <TransferRow><span className="label">CUIT</span> <span className="value">{infoTransf.cuit || '—'}</span></TransferRow>
                  <TransferRow><span className="label">CBU</span> <span className="value">{infoTransf.cbu || '—'}</span></TransferRow>
                  <TransferRow><span className="label">Alias</span> <span className="value">{infoTransf.alias || '—'}</span></TransferRow>
                </TransferCard>
                <InfoBox>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19.0498 4.91005C18.1329 3.98416 17.0408 3.25002 15.8373 2.75042C14.6338 2.25081 13.3429 1.99574 12.0398 2.00005C6.5798 2.00005 2.1298 6.45005 2.1298 11.9101C2.1298 13.6601 2.5898 15.3601 3.4498 16.8601L2.0498 22.0001L7.2998 20.6201C8.7498 21.4101 10.3798 21.8301 12.0398 21.8301C17.4998 21.8301 21.9498 17.3801 21.9498 11.9201C21.9498 9.27005 20.9198 6.78005 19.0498 4.91005ZM12.0398 20.1501C10.5598 20.1501 9.1098 19.7501 7.8398 19.0001L7.5398 18.8201L4.4198 19.6401L5.2498 16.6001L5.0498 16.2901C4.22735 14.9771 3.79073 13.4593 3.7898 11.9101C3.7898 7.37005 7.4898 3.67005 12.0298 3.67005C14.2298 3.67005 16.2998 4.53005 17.8498 6.09005C18.6174 6.85392 19.2257 7.7626 19.6394 8.76338C20.0531 9.76417 20.264 10.8371 20.2598 11.9201C20.2798 16.4601 16.5798 20.1501 12.0398 20.1501ZM16.5598 13.9901C16.3098 13.8701 15.0898 13.2701 14.8698 13.1801C14.6398 13.1001 14.4798 13.0601 14.3098 13.3001C14.1398 13.5501 13.6698 14.1101 13.5298 14.2701C13.3898 14.4401 13.2398 14.4601 12.9898 14.3301C12.7398 14.2101 11.9398 13.9401 10.9998 13.1001C10.2598 12.4401 9.7698 11.6301 9.6198 11.3801C9.4798 11.1301 9.5998 11.0001 9.7298 10.8701C9.8398 10.7601 9.9798 10.5801 10.0998 10.4401C10.2198 10.3001 10.2698 10.1901 10.3498 10.0301C10.4298 9.86005 10.3898 9.72005 10.3298 9.60005C10.2698 9.48005 9.7698 8.26005 9.5698 7.76005C9.3698 7.28005 9.1598 7.34005 9.0098 7.33005H8.5298C8.3598 7.33005 8.0998 7.39005 7.8698 7.64005C7.6498 7.89005 7.0098 8.49005 7.0098 9.71005C7.0098 10.9301 7.89981 12.1101 8.0198 12.2701C8.1398 12.4401 9.7698 14.9401 12.2498 16.0101C12.8398 16.2701 13.2998 16.4201 13.6598 16.5301C14.2498 16.7201 14.7898 16.6901 15.2198 16.6301C15.6998 16.5601 16.6898 16.0301 16.8898 15.4501C17.0998 14.8701 17.0998 14.3801 17.0298 14.2701C16.9598 14.1601 16.8098 14.1101 16.5598 13.9901Z" fill="#560203" />
                  </svg>
                  {infoTransf.mensajeWhatsapp || 'Enviá el comprobante por WhatsApp'}
                </InfoBox>
              </>
            ) : paymentMethod === 'mercadopago' ? (
              <>
                <SectionTitle>{siteConfig?.mp_titulo || 'Pago con Mercado Pago'}</SectionTitle>
                <PaymentTextInfo>
                  <p>{siteConfig?.mp_descripcion || 'Al hacer clic en "Pagar", serás redirigido de forma segura a Mercado Pago para completar tu compra con tarjetas de débito, crédito o dinero en cuenta.'}</p>
                </PaymentTextInfo>
              </>
            ) : paymentMethod === 'aconvenir' ? (
              <>
                <SectionTitle>{siteConfig?.ac_titulo || 'Pago a Convenir por WhatsApp'}</SectionTitle>
                <PaymentTextInfo>
                  <p>{siteConfig?.ac_descripcion || (<>Al hacer clic en <strong>"Contactar por WhatsApp"</strong>, te redirigiremos a una conversación de WhatsApp con los datos de tu pedido para que coordines el pago directamente con nosotros.</>)}</p>
                  {siteConfig?.whatsapp_numero && (
                    <p>📱 <strong>WhatsApp:</strong> +{siteConfig.whatsapp_numero}</p>
                  )}
                </PaymentTextInfo>
                <InfoBox>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19.0498 4.91005C18.1329 3.98416 17.0408 3.25002 15.8373 2.75042C14.6338 2.25081 13.3429 1.99574 12.0398 2.00005C6.5798 2.00005 2.1298 6.45005 2.1298 11.9101C2.1298 13.6601 2.5898 15.3601 3.4498 16.8601L2.0498 22.0001L7.2998 20.6201C8.7498 21.4101 10.3798 21.8301 12.0398 21.8301C17.4998 21.8301 21.9498 17.3801 21.9498 11.9201C21.9498 9.27005 20.9198 6.78005 19.0498 4.91005ZM12.0398 20.1501C10.5598 20.1501 9.1098 19.7501 7.8398 19.0001L7.5398 18.8201L4.4198 19.6401L5.2498 16.6001L5.0498 16.2901C4.22735 14.9771 3.79073 13.4593 3.7898 11.9101C3.7898 7.37005 7.4898 3.67005 12.0298 3.67005C14.2298 3.67005 16.2998 4.53005 17.8498 6.09005C18.6174 6.85392 19.2257 7.7626 19.6394 8.76338C20.0531 9.76417 20.264 10.8371 20.2598 11.9201C20.2798 16.4601 16.5798 20.1501 12.0398 20.1501ZM16.5598 13.9901C16.3098 13.8701 15.0898 13.2701 14.8698 13.1801C14.6398 13.1001 14.4798 13.0601 14.3098 13.3001C14.1398 13.5501 13.6698 14.1101 13.5298 14.2701C13.3898 14.4401 13.2398 14.4601 12.9898 14.3301C12.7398 14.2101 11.9398 13.9401 10.9998 13.1001C10.2598 12.4401 9.7698 11.6301 9.6198 11.3801C9.4798 11.1301 9.5998 11.0001 9.7298 10.8701C9.8398 10.7601 9.9798 10.5801 10.0998 10.4401C10.2198 10.3001 10.2698 10.1901 10.3498 10.0301C10.4298 9.86005 10.3898 9.72005 10.3298 9.60005C10.2698 9.48005 9.7698 8.26005 9.5698 7.76005C9.3698 7.28005 9.1598 7.34005 9.0098 7.33005H8.5298C8.3598 7.33005 8.0998 7.39005 7.8698 7.64005C7.6498 7.89005 7.0098 8.49005 7.0098 9.71005C7.0098 10.9301 7.89981 12.1101 8.0198 12.2701C8.1398 12.4401 9.7698 14.9401 12.2498 16.0101C12.8398 16.2701 13.2998 16.4201 13.6598 16.5301C14.2498 16.7201 14.7898 16.6901 15.2198 16.6301C15.6998 16.5601 16.6898 16.0301 16.8898 15.4501C17.0998 14.8701 17.0998 14.3801 17.0298 14.2701C16.9598 14.1601 16.8098 14.1101 16.5598 13.9901Z" fill="#560203" />
                  </svg>
                  {siteConfig?.ac_respuesta || 'Te responderemos a la brevedad para coordinar el pago'}
                </InfoBox>
              </>
            ) : (
              <>
                <SectionTitle>Datos para Efectivo</SectionTitle>

                <InfoBox>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  <span>
                    {esSucursal ? <><strong>{savedAddress.sucursal}, {savedAddress.provincia}</strong> - Pagás al retirar tu pedido.</> : 'Pagás al recibir el pedido en el domicilio elegido. Se mantiene el costo de envío correspondiente.'}
                  </span>
                </InfoBox>
              </>
            )}
          </div>

          <div>
            <SummaryCard>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <SummaryTitle style={{ marginBottom: 0 }}>Tu pedido</SummaryTitle>
                <EditCartBtn to="/carrito">Editar Carrito</EditCartBtn>
              </div>

              <div style={{ marginBottom: '25px' }}>
                {cartItems.map((item) => (
                  <MiniProduct key={item.cartId}>
                    <div className="img-wrapper">
                      <img src={getProductImage(item.product)} alt={item.product.nombre} />
                    </div>
                    <div className="details">
                      <span className="name">{item.product.nombre}</span>
                      <span className="meta">Cant: {item.quantity}</span>
                    </div>
                    <div className="price">{formatPrice(item.price * item.quantity)}</div>
                  </MiniProduct>
                ))}
              </div>

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

              {appliedGiftCard && (
                <SummaryRow>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    Gift Card:
                    <button 
                      onClick={() => setAppliedGiftCard(null)} 
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: '#e74c3c' }}
                      title="Quitar Gift Card"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="15" y1="9" x2="9" y2="15"></line>
                        <line x1="9" y1="9" x2="15" y2="15"></line>
                      </svg>
                    </button>
                  </span>
                  <span className="val" style={{ color: '#27ae60' }}>
                    - {formatPrice(appliedGiftCard.monto)}
                  </span>
                </SummaryRow>
              )}

              <Divider />

              <TotalRow>
                <span>Total</span>
                <span className="val">{formatPrice(Math.max(0, Number(cartTotal) + Number(costoEnvioFinal) - Number(appliedGiftCard ? appliedGiftCard.monto : 0)))}</span>
              </TotalRow>

              {previousPaymentError && <p role="alert">{previousPaymentError} <Link to="/order-error">Consultar el intento anterior</Link></p>}
              {checkingPrevious && <p role="status">Verificando el intento de pago anterior…</p>}
              <PrimaryBtn onClick={handlePayment} disabled={checkingPrevious || Boolean(previousPaymentError) || authLoading || isProcessing || !validDelivery(savedAddress) || !metodosPago.some(m => m.id === paymentMethod) || cartItems.length === 0}>
                {isProcessing ? 'Procesando...' : buttonText}
              </PrimaryBtn>
            </SummaryCard>

            <SummaryCard>
              <SummaryTitle>Envío</SummaryTitle>
              <EnvioGrid>
                <InfoCol>
                  <span>{esSucursal ? 'Retiro en sucursal' : 'Domicilio'}</span>
                </InfoCol>
                <InfoCol>
                  {esSucursal ? <span>{savedAddress.sucursal}, {savedAddress.provincia}</span> : savedAddress ? (
                    <span>{savedAddress.calle} {savedAddress.numero}, {savedAddress.ciudad}, {savedAddress.provincia}, CP {savedAddress.cp}</span>
                  ) : (
                    <span>Av. Dirección 1234, Ciudad, Provincia, CP 0000</span>
                  )}
                </InfoCol>
              </EnvioGrid>
              <Link to="/envio">Modificar método de entrega</Link>
            </SummaryCard>
          </div>
        </LayoutGrid>

      </ContentWrapper>
    </PageContainer>
  );
}
