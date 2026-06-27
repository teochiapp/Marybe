import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FaWhatsapp, FaFacebookF, FaInstagram } from 'react-icons/fa';
import { FiLink2, FiCheck } from 'react-icons/fi';

const GalleryWrapper = styled.div`
  display: flex;
  gap: 20px;

  @media (max-width: 768px) {
    flex-direction: column-reverse;
    align-items: center;
  }
`;

const ThumbList = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 12px;

  @media (max-width: 768px) {
    flex-direction: row;
  }
`;

const Thumb = styled.button`
  width: 64px;
  height: 64px;
  border-radius: var(--radius-md);
  border: 1.5px solid var(--color-giftcard-borde);
  background-color: var(--color-giftcard-crema);
  padding: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition-fast);

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  &:hover {
    border-color: var(--color-giftcard-oro);
  }
`;

const MainImageBox = styled.div`
  position: relative;
  flex: 1;
  background-color: var(--color-blanco);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  min-height: 600px;
  overflow: visible;

  img {
    width: 100%;
    max-width: none;
    height: auto;
    object-fit: contain;
    transform: scale(1.2);
    transform-origin: center;
    filter: drop-shadow(rgba(0, 0, 0, 0.12) 0px 16px 28px);
  }

  @media (max-width: 768px) {
    min-height: 360px;
    padding: 8px;
  }
`;

/* Iconos arriba a la derecha de la imagen: solo en mobile */
const IconOverlay = styled.div`
  display: none;

  @media (max-width: 768px) {
    position: absolute;
    top: 16px;
    right: 16px;
    display: flex;
    align-items: center;
    gap: 16px;
    z-index: 5;
    color: var(--color-bordo-secundario);

    > button {
      background: none;
      border: none;
      cursor: pointer;
      color: inherit;
      display: flex;
      padding: 0;
      transition: var(--transition-fast);
    }

    > button:hover {
      opacity: 0.65;
    }
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

const ShareIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);

const HeartIcon = ({ filled }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

export default function GiftCardGallery() {
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [fav, setFav] = useState(false);

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
    <GalleryWrapper>
      <ThumbList>
        <Thumb type="button" aria-label="Vista gift card Marybe">
          <img src="/inicio/giftcard.webp" alt="Miniatura gift card Marybe" />
        </Thumb>
      </ThumbList>

      <MainImageBox>
        <IconOverlay>
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
          <button type="button" aria-label="Agregar a favoritos" onClick={() => setFav((v) => !v)}>
            <HeartIcon filled={fav} />
          </button>
        </IconOverlay>

        <img src="/inicio/giftcard.webp" alt="Gift card Marybe" />
      </MainImageBox>
    </GalleryWrapper>
  );
}
