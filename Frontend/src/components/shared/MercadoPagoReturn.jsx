import React, { useContext, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CartContext } from '../../context/CartContext';
import { readPendingCheckout, syncCheckout } from '../../utils/mercadoPagoCheckout';

export default function MercadoPagoReturn({ renderApproved }) {
  const location = useLocation();
  const { clearCart, setAppliedGiftCard } = useContext(CartContext);
  const [pending] = useState(readPendingCheckout);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    let timer;
    const query = new URLSearchParams(location.search);
    const reference = query.get('reference') || query.get('external_reference');
    const verify = async () => {
      try {
        if (reference && reference !== pending?.externalReference) throw new Error('La referencia de retorno no coincide con tu sesión. Consultá el pedido con Marybe.');
        const data = await syncCheckout(pending, location.pathname === '/order-error');
        if (!active) return;
        setError(''); setResult(data);
        if (data.pagado) {
          const key = `mp_confirmed_${data.reference}`;
          if (!sessionStorage.getItem(key)) {
            clearCart(); setAppliedGiftCard(null); sessionStorage.setItem(key, 'true');
          }
        } else if (data.estado === 'Pendiente de pago') {
          timer = setTimeout(verify, 5000);
        }
      } catch (err) { if (active) setError(err.message); }
    };
    verify();
    return () => { active = false; clearTimeout(timer); };
  }, [pending, location.pathname, location.search, attempt, clearCart, setAppliedGiftCard]);

  if (result?.pagado && renderApproved) return renderApproved({ ...pending, orderNumber: result.reference });
  const aborted = result?.estado === 'Abortado';
  const review = ['refunded', 'charged_back'].includes(result?.status);
  return <main style={{ maxWidth: 760, margin: '60px auto', padding: '32px 24px', background: '#fffaf7', borderRadius: 16 }}>
    <h1 style={{ color: '#560203', fontSize: 'clamp(1.6rem, 5vw, 2.4rem)', marginBottom: 16 }}>{error ? 'No pudimos verificar el pago' : !result ? 'Verificando pago con Mercado Pago…' : result.pagado ? 'Pago confirmado' : review ? 'Pago en revisión' : aborted ? 'Pago abortado' : 'Pago pendiente de confirmación'}</h1>
    {pending?.externalReference && <p>Pedido: <strong>{pending.externalReference}</strong></p>}
    <p role={error ? 'alert' : 'status'}>{error || (!result ? 'Esperá mientras consultamos el resultado.' : result.pagado ? 'Mercado Pago confirmó la acreditación de tu pago.' : aborted ? 'El intento de pago no se completó. Tu carrito está disponible para volver a intentarlo.' : 'Todavía no hay un pago aprobado. Estamos consultando su estado; evitá iniciar otro pago para este pedido.')}</p>
    {review && <p role="alert">Este pago tiene un reembolso o contracargo. Contactá a Marybe con el número de pedido para revisar su situación.</p>}
    {error && <button onClick={() => { setError(''); setAttempt(value => value + 1); }}>Volver a consultar</button>}
    <p>{aborted ? <Link to="/pago">Reintentar el pago</Link> : result?.pagado ? <Link to="/">Seguir comprando</Link> : <Link to="/carrito">Volver al carrito</Link>}</p>
  </main>;
}
