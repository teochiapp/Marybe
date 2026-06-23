import React, { useState, useContext } from 'react';
import styled from 'styled-components';
import { CartContext } from '../../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FaWhatsapp, FaFacebookF, FaInstagram } from 'react-icons/fa';
import { FiLink2, FiCheck } from 'react-icons/fi';

const InfoWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const TopRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const Eyebrow = styled.span`
  font-family: var(--font-family-secondary);
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #535353;
`;

const IconActions = styled.div`
  display: flex;
  gap: 16px;
  color: var(--color-bordo-secundario);

  button {
    background: none;
    border: none;
    cursor: pointer;
    color: inherit;
    display: flex;
    transition: var(--transition-fast);
  }

  button:hover {
    opacity: 0.65;
  }
`;

const ShareWrapper = styled.div`
  position: relative;
  display: flex;
`;

const ShareBackdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 40;
`;

const ShareMenu = styled(motion.div)`
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  z-index: 50;
  background-color: var(--color-blanco);
  border-radius: 14px;
  box-shadow: 0 14px 34px rgba(0, 0, 0, 0.16);
  padding: 6px;
  min-width: 210px;
  display: flex;
  flex-direction: column;
`;

const ShareItem = styled.button`
  display: flex !important;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 11px 14px !important;
  border-radius: 10px;
  font-family: var(--font-family-secondary);
  font-size: 0.92rem;
  font-weight: 500;
  text-align: left;
  color: var(--color-marron-secundario) !important;
  background: none;
  border: none;
  cursor: pointer;
  transition: background-color 0.15s ease;

  &:hover {
    background-color: var(--color-giftcard-crema);
    opacity: 1 !important;
  }

  svg {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
    color: ${({ $color }) => $color || 'var(--color-bordo-secundario)'};
  }
`;

const Title = styled.h1`
  font-family: var(--font-family-primary);
  font-size: clamp(2.4rem, 4vw, 3.4rem);
  font-weight: 400;
  color: black;
  margin: 8px 0 24px 0;
`;

const FieldLabel = styled.label`
  font-family: var(--font-family-secondary);
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-marron-secundario);
  margin-bottom: 10px;
  display: block;
`;

const MontoInput = styled.input`
  width: 100%;
  padding: 14px 16px;
  border: 1px solid var(--color-giftcard-borde);
  border-radius: var(--radius-md);
  font-family: var(--font-family-secondary);
  font-size: 1rem;
  color: var(--color-marron-secundario);
  background-color: var(--color-blanco);
  transition: var(--transition-fast);

  &::placeholder {
    color: #b8b0a8;
  }

  &:focus {
    outline: none;
    border-color: var(--color-giftcard-oro);
    box-shadow: 0 0 0 3px rgba(194, 161, 92, 0.15);
  }
`;

const CantidadLabel = styled.span`
  font-family: var(--font-family-secondary);
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-marron-secundario);
  margin: 22px 0 10px 0;
  display: block;
`;

const ActionRow = styled.div`
  display: flex;
  gap: 16px;

  @media (max-width: 600px) {
    flex-direction: column;
  }
`;

const Stepper = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid var(--color-giftcard-borde);
  border-radius: var(--radius-md);
  overflow: hidden;

  button {
    width: 44px;
    height: 52px;
    background: none;
    border: none;
    font-size: 1.3rem;
    color: var(--color-marron-secundario);
    cursor: pointer;
    transition: var(--transition-fast);
  }

  button:hover {
    background-color: var(--color-giftcard-crema);
  }
`;

const Quantity = styled.span`
  min-width: 40px;
  text-align: center;
  font-family: var(--font-family-secondary);
  font-size: 1rem;
  color: var(--color-marron-secundario);
`;

const AddButton = styled(motion.button)`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background-color: ${({ $status }) => ($status === 'added' ? '#2e7d32' : '#280101')};
  color: var(--color-blanco);
  font-family: var(--font-family-secondary);
  font-size: 1rem;
  font-weight: 500;
  border: none;
  border-radius: var(--radius-md);
  padding: 0 28px;
  height: 52px;
  cursor: pointer;
  overflow: hidden;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: ${({ $status }) => ($status === 'added' ? '#2e7d32' : 'var(--color-bordo-tercero)')};
  }

  span.btn-content {
    display: flex;
    align-items: center;
    gap: 12px;
    white-space: nowrap;
  }
`;

const InfoList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin: 26px 0;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  font-family: var(--font-family-secondary);
  font-size: 0.9rem;
  color: var(--color-marron-secundario);

  svg {
    flex-shrink: 0;
    margin-top: 2px;
    color: #7e7e7e;
  }

  a {
    color: #9D4343;
    font-weight: 600;
    text-decoration: underline;
    text-decoration-color: #9D4343;
    text-underline-offset: 2px;
  }
`;

const GiftNote = styled.div`
  background-color: var(--color-giftcard-crema);
  border-radius: var(--radius-md);
  padding: 20px 24px;
  display: flex;
  gap: 18px;
  align-items: center;

  @media (max-width: 600px) {
    flex-direction: column;
    text-align: center;
  }
`;

const GiftNoteTitle = styled.span`
  font-family: var(--font-family-primary);
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-marron-principal);
  line-height: 1.2;
  flex-shrink: 0;
  max-width: 130px;
`;

const GiftNoteText = styled.p`
  font-family: var(--font-family-secondary);
  font-size: 0.9rem;
  color: var(--color-marron-secundario);
  margin: 0;
  line-height: 1.5;

  strong {
    font-weight: 600;
  }
`;

const HeartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const ShareIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);

const PinIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const TruckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13" />
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
);

const GiftIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 12 20 22 4 22 4 12" />
    <rect x="2" y="7" width="20" height="5" />
    <line x1="12" y1="22" x2="12" y2="7" />
    <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
  </svg>
);

export default function GiftCardInfo() {
  const [cantidad, setCantidad] = useState(1);
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [monto, setMonto] = useState('');
  const [status, setStatus] = useState('idle');
  const { addToCart } = useContext(CartContext);

  const handleAgregar = () => {
    const montoNum = Number(monto.replace(/\D/g, '')) || 0;
    if (montoNum <= 0) {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 1600);
      return;
    }
    const giftProduct = {
      id: `gift-card-${montoNum}`,
      nombre: `Gift Card Marybe $${montoNum.toLocaleString('es-AR')}`,
      marca: 'Marybe',
      descuento: 0,
      precio: montoNum,
      portada: { url: '/inicio/giftcard.webp', local: true },
    };
    const variant = { volumen: 'Gift Card', precio: montoNum, stock: 99 };
    addToCart(giftProduct, cantidad, variant);
    setStatus('added');
    setTimeout(() => setStatus('idle'), 1800);
  };

  const handleMontoChange = (e) => {
    const digits = e.target.value.replace(/\D/g, '');
    if (!digits) {
      setMonto('');
      return;
    }
    setMonto('$' + Number(digits).toLocaleString('es-AR'));
  };

  const decrease = () => setCantidad((q) => Math.max(1, q - 1));
  const increase = () => setCantidad((q) => q + 1);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (e) {
      // noop
    }
  };

  const openShare = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
    setShareOpen(false);
  };

  const shareWhatsapp = () => openShare(`https://wa.me/?text=${encodeURIComponent(shareUrl)}`);
  const shareFacebook = () => openShare(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`);
  const shareInstagram = async () => {
    await copyLink();
    openShare('https://www.instagram.com/');
  };

  return (
    <InfoWrapper>
      <TopRow>
        <Eyebrow>Regalá Marybe</Eyebrow>
        <IconActions>
          <ShareWrapper>
            <button type="button" aria-label="Compartir" onClick={() => setShareOpen((v) => !v)}>
              <ShareIcon />
            </button>
            <AnimatePresence>
              {shareOpen && (
                <>
                  <ShareBackdrop onClick={() => setShareOpen(false)} />
                  <ShareMenu
                    initial={{ opacity: 0, scale: 0.92, y: -6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                  >
                    <ShareItem type="button" onClick={copyLink}>
                      {copied ? <FiCheck /> : <FiLink2 />}
                      <span>{copied ? '¡Enlace copiado!' : 'Copiar enlace'}</span>
                    </ShareItem>
                    <ShareItem type="button" $color="#25D366" onClick={shareWhatsapp}>
                      <FaWhatsapp />
                      <span>WhatsApp</span>
                    </ShareItem>
                    <ShareItem type="button" $color="#1877F2" onClick={shareFacebook}>
                      <FaFacebookF />
                      <span>Facebook</span>
                    </ShareItem>
                    <ShareItem type="button" $color="#E1306C" onClick={shareInstagram}>
                      <FaInstagram />
                      <span>Instagram</span>
                    </ShareItem>
                  </ShareMenu>
                </>
              )}
            </AnimatePresence>
          </ShareWrapper>
          <button type="button" aria-label="Agregar a favoritos"><HeartIcon /></button>
        </IconActions>
      </TopRow>

      <Title>Gift card</Title>

      <FieldLabel htmlFor="monto">Indicá el monto que querés regalar</FieldLabel>
      <MontoInput id="monto" type="text" inputMode="numeric" placeholder="$20.000" value={monto} onChange={handleMontoChange} />

      <CantidadLabel>Cantidad</CantidadLabel>
      <ActionRow>
        <Stepper>
          <button type="button" onClick={decrease} aria-label="Disminuir cantidad">−</button>
          <Quantity>{cantidad}</Quantity>
          <button type="button" onClick={increase} aria-label="Aumentar cantidad">+</button>
        </Stepper>
        <AddButton
          type="button"
          onClick={handleAgregar}
          $status={status}
          whileTap={{ scale: 0.96 }}
          animate={status === 'added' ? { scale: [1, 1.05, 1] } : { scale: 1 }}
          transition={{ duration: 0.35 }}
        >
          <AnimatePresence mode="wait" initial={false}>
            {status === 'added' ? (
              <motion.span
                key="added"
                className="btn-content"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
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
            ) : status === 'error' ? (
              <motion.span
                key="error"
                className="btn-content"
                initial={{ x: 0 }}
                animate={{ x: [0, -7, 7, -5, 5, 0] }}
                transition={{ duration: 0.4 }}
              >
                Ingresá un monto
              </motion.span>
            ) : (
              <motion.span
                key="idle"
                className="btn-content"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                Agregar
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
              </motion.span>
            )}
          </AnimatePresence>
        </AddButton>
      </ActionRow>

      <InfoList>
        <InfoItem>
          <PinIcon />
          <span>Retira gratis en nuestras sucursales&nbsp;<a href="/sucursales">Ver sucursales</a></span>
        </InfoItem>
        <InfoItem>
          <TruckIcon />
          <span>Calcula costo de envío&nbsp;<a href="/metodo-envio">Calcular costo</a></span>
        </InfoItem>
        <InfoItem>
          <GiftIcon />
          <span>Si es para regalo, en el carro de compras podrás dejar un mensaje personalizado para esa persona.</span>
        </InfoItem>
      </InfoList>

      <GiftNote>
        <GiftNoteTitle>¿Te regalaron una Gift Card?</GiftNoteTitle>
        <GiftNoteText>
          Agregá los productos que desees en el carrito y luego en el proceso de compra agregá el <strong>código de tu Gift Card.</strong>
        </GiftNoteText>
      </GiftNote>
    </InfoWrapper>
  );
}
