import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import PaymentModal from './PaymentModal';
import ShippingModal from './ShippingModal';
import AddToCartModal from '../../carrito/AddToCartModal';
import { CartContext } from '../../../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import FavoriteButton from '../../shared/FavoriteButton';
import { variantesReales } from '../../../utils/productPrice';

const InfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  color: #28180B;
  font-family: var(--font-family-secondary);
`;

const TopRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    display: none;
  }
`;

const PillsContainer = styled.div`
  display: flex;
  gap: 10px;
`;

const Pill = styled.span`
  background-color: #F2D4D4;
  color: var(--color-bordo-tercero);
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 0.9rem;
  text-transform: uppercase;
  font-weight: 600;
`;

const IconsContainer = styled.div`
  display: flex;
  gap: 15px;
  color: #000000;
  
  svg {
    width: 24px;
    height: 24px;
    cursor: pointer;
    transition: transform 0.2s;
    
    &:hover {
      transform: scale(1.1);
    }
  }
`;

const Brand = styled.h4`
  font-size: 1rem;
  text-transform: uppercase;
  font-weight: 500;
  letter-spacing: 10%;
  color: #535353;
  margin-bottom: 8px;
  font-family: var(--font-family-secondary);
`;

const Title = styled.h1`
  font-family: var(--font-family-secondary);
  font-size: 2rem;
  font-weight: 400;
  line-height: 1.3;
  margin-bottom: 15px;
  letter-spacing: 0%;
  text-transform: uppercase;
  color: #000000;

  @media (max-width: 768px) {
    font-size: 1.8rem;
  }
`;

const SubBadges = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  font-size: 1rem;
  font-weight: 500;
  color: var(--color-marron-cuarto);
  margin-bottom: 20px;

  span:not(:last-child)::after {
    content: '|';
    margin-left: 10px;
    color: black;
    font-weight: 500;
  }
`;

const DescriptionExcerpt = styled.p`
  font-size: 0.95rem;
  line-height: 1.5;
  color: #555;
  margin-bottom: 15px;
`;

const PriceBlock = styled.div`
  margin-bottom: 15px;
`;

const OldPrice = styled.div`
  font-size: 1.7rem;
  color: #BDBDBD;
  text-decoration: line-through;
  font-weight: 400;
`;

const CurrentPriceRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 4px;
`;

const CurrentPrice = styled.span`
  font-size: 2.2rem;
  font-weight: 700;
  color: #750707;
`;

const DiscountBadge = styled.span`
  background-color: #750707;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 600;
`;

const PaymentLink = styled.button`
  background-color: #FAF9F7;
  border: none;
  color: var(--color-bordo-tercero);
  font-size: 0.85rem;
  font-weight: 500;
  border-radius: 4px;
  cursor: pointer;
  padding: 4px 8px;
  margin-bottom: 10px;
`;

const CfteaText = styled.div`
  font-size: 0.9rem;
  font-weight: 400;
  color: #B2B2B2;
  margin-bottom: 15px;
`;

const InstallmentsText = styled.div`
  font-size: 0.95rem;
  color: #535353;
  margin-bottom: 2px;
  font-weight: 500;

  span {
    font-weight: 700;
    color: #000;
  }
`;

const LegalText = styled.div`
  font-size: 0.85rem;
  color: #535353;
`;

const OptionLabel = styled.div`
  font-size: 0.9rem;
  font-weight: 700;
  margin-bottom: 6px;
  color: #28180B;
`;

const SizesContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
  flex-wrap: wrap;
`;

const SizeBtn = styled.button`
  border: 1px solid ${({ $active }) => ($active ? '#750707' : '#ccc')};
  background-color: ${({ $active }) => ($active ? '#750707' : '#fff')};
  color: ${({ $active }) => ($active ? '#fff' : '#28180B')};
  border-radius: 12px;
  padding: 4px 12px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #750707;
  }
`;

const ColorsContainer = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
  flex-wrap: wrap;
`;

const ColorBtn = styled.button`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: none;
  background-color: ${({ $color }) => $color};
  cursor: pointer;
  padding: 0;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: -6px;
    left: -6px;
    right: -6px;
    bottom: -6px;
    border-radius: 8px;
    border: 1px solid ${({ $active }) => ($active ? '#750707' : '#d8d2ca')};
    transition: border-color 0.2s ease;
  }
`;

const StockInfo = styled.div`
  font-size: 0.85rem;
  color: #555;
  margin-bottom: 15px;
`;

const ActionRow = styled.div`
  display: flex;
  gap: 15px;
  margin-bottom: 30px;
`;

const DesktopActionRow = styled.div`
  display: block;
  @media (max-width: 768px) {
    display: none;
  }
`;

const MobileActionRow = styled.div`
  display: none;
  @media (max-width: 768px) {
    display: block;
    margin-bottom: 10px;
  }
`;

const QuantityBox = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid #ccc;
  border-radius: 8px;
  height: 48px;
  padding: 0 5px;
  width: 110px;
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

const QtyNumber = styled.div`
  position: relative;
  width: 30px;
  height: 26px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;

  span {
    position: absolute;
    font-weight: 500;
    color: #000000;
  }
`;


const AddToCartBtn = styled(motion.button)`
  flex: 1;
  background-color: ${({ $added }) => ($added ? '#2e7d32' : '#280201')};
  color: white;
  border: none;
  border-radius: 8px;
  height: 48px;
  padding: 8px 16px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  overflow: hidden;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: ${({ $added }) => ($added ? '#2e7d32' : '#3f0303')};
  }

  &:active {
    transform: translateY(0);
    box-shadow: none;
  }

  svg {
    width: 20px;
    height: 20px;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.5;
  }
`;

const ShippingInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 15px;
  border-top: none;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  font-size: 0.85rem;
  color: #555;

  svg {
    width: 22px;
    height: 22px;
    flex-shrink: 0;
    color: #555;
    stroke-width: 1.5;
  }

  div {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    line-height: 1.4;
  }

  a {
    color: #000000;
    text-decoration: underline;
    cursor: pointer;
    font-weight: 500;
  }
`;

const formatPrice = (price) => {
  if (!price) return '$0';
  return '$' + Number(price).toLocaleString('es-AR', { minimumFractionDigits: 0 });
};

const COLOR_MAP = {
  "ACLARANTE": "#C9A84C",
  "ACLARANTE CENIZA PLATINO": "#A0A0A0",
  "ACLARANTE DORADO": "#DAA520",
  "ACLARANTE MALVA": "#5D2D91",
  "ACLARANTE MALVA CENIZA": "#5D2D91",
  "ACLARANTE PLATA": "#A0A0A0",
  "Almendra": "#EFDECD",
  "Almendra Rubio Ceniza": "#B0A080",
  "Ambar": "#FFBF00",
  "Ambar Castaño Claro Dorado Caoba": "#4A1C14",
  "Arandano": "#5D2D91",
  "Arena": "#C2B280",
  "Avellana": "#855E42",
  "Avena Rubio Claro Ceniza": "#E8D5A3",
  "Azahar": "#F0E5CE",
  "Azahar Rubio Extra Claro Ceniza": "#F5E6C8",
  "Azul": "#0055AA",
  "BORGOÑA CLARO": "#800020",
  "Beige": "#F5F5DC",
  "Blanco": "#FFFFFF",
  "Blanco Perla": "#F8F8F0",
  "Bordo": "#5C0A0A",
  "Bordo Oscuro": "#3E0102",
  "Borgonya": "#800020",
  "Borgoña": "#800020",
  "Borgoña Castaño Rojizo": "#800020",
  "Bronce": "#CD7F32",
  "CAOBA": "#4A1C14",
  "CASTAÑO": "#4A2A0A",
  "CASTAÑO CAFÉ": "#2C1503",
  "CASTAÑO CENIZA": "#4A2A0A",
  "CASTAÑO CHOCOLATE": "#3D1C02",
  "CASTAÑO CIRUELA": "#5D2D91",
  "CASTAÑO CLAO CAOBA": "#4A1C14",
  "CASTAÑO CLARO": "#6B3A1F",
  "CASTAÑO CLARO CAOBA": "#4A1C14",
  "CASTAÑO CLARO CAOBA ROJIZO": "#4A1C14",
  "CASTAÑO CLARO CENIZA": "#6B3A1F",
  "CASTAÑO CLARO CENIZA IRISADO": "#5D2D91",
  "CASTAÑO CLARO CHOCOLATE": "#3D1C02",
  "CASTAÑO CLARO CIRUELA": "#5D2D91",
  "CASTAÑO CLARO COBRIZO": "#B85D19",
  "CASTAÑO CLARO DORADO": "#6B3A1F",
  "CASTAÑO CLARO ROJIZO": "#9B2335",
  "CASTAÑO CLARO ROJIZO CAOBA": "#4A1C14",
  "CASTAÑO CLARO ROJIZO INTENSO": "#9B2335",
  "CASTAÑO COBRIZO DORADO": "#B85D19",
  "CASTAÑO MEDIO": "#4A2A0A",
  "CASTAÑO NATURAL": "#4A2A0A",
  "CASTAÑO NOGAL": "#4A2A0A",
  "CASTAÑO OSCURO": "#3B1E08",
  "CASTAÑO ROBLE": "#4A2A0A",
  "CASTAÑO ROJIZO VIOLA": "#9B2335",
  "CENIZA CLARO INTENSO": "#CCCCCC",
  "CENIZA INTENSO": "#CCCCCC",
  "CENIZA MUY CLARO INTENSO": "#CCCCCC",
  "CENIZA OSCURO INTENSO": "#CCCCCC",
  "CEREZA EXOTICO": "#8B0000",
  "CHOCHOLATE": "#CCCCCC",
  "CHOCOLATE": "#3D1C02",
  "CHOCOLATE CLARO": "#3D1C02",
  "CHOCOLATE CLARO DORADO": "#3D1C02",
  "CHOCOLATE DORADO": "#3D1C02",
  "CHOCOLATE OSCURO": "#3D1C02",
  "Cafe": "#4A2F1C",
  "Café Amaretto Castaño Claro Dorado": "#2C1503",
  "Café Castaño": "#2C1503",
  "Caoba": "#722F37",
  "Capuccino": "#6F4E37",
  "Capuccino Rubio Oscuro": "#C8A96E",
  "Caramelo": "#C68642",
  "Caramelo Rubio Oscuro Dorado": "#C8A96E",
  "Castano": "#4A2A0A",
  "Castano Ceniza Caoba": "#5A3525",
  "Castano Claro": "#6B3A1F",
  "Castano Claro Dorado": "#8B5E3C",
  "Castano Oscuro": "#3B1E08",
  "Castano Rojizo": "#7B3B2A",
  "Castaña Cataño Claro": "#6B3A1F",
  "Castaño": "#4A2A0A",
  "Castaño Ceniza": "#6B5B52",
  "Castaño Ceniza Caoba": "#4A1C14",
  "Castaño Claro": "#8B6347",
  "Castaño Claro Dorado": "#6B3A1F",
  "Castaño Dorado": "#8B5E3C",
  "Castaño Natural": "#6B4226",
  "Castaño Oscuro": "#3E2009",
  "Castaño Oscuro Profundo": "#3B1E08",
  "Castaño Rojizo": "#9B2335",
  "Ceniza": "#A0A0A0",
  "Centeno": "#8B7355",
  "Centeno Rubio Oscuro Ceniza": "#C8A96E",
  "Champana": "#F7E7CE",
  "Champaña Rubio": "#C9A84C",
  "Chocholate Caoba": "#4A1C14",
  "Chocolate": "#3D1C02",
  "Chocolate Caoba": "#4A2416",
  "Chocolate Puro": "#3D1C02",
  "Chocolate Puro Rubio Oscuro Dorado Irisado": "#5D2D91",
  "Chocolate Rubio Oscuro Dorado Cobrizo": "#B85D19",
  "Chocolatisimo": "#CCCCCC",
  "Cobre": "#B87333",
  "Cobrizo": "#CB6D3A",
  "Cobrizo Rubi": "#9B2335",
  "Coral": "#FF6B6B",
  "Dorado": "#FFD700",
  "Dorado Cobrizo": "#B8860B",
  "Durazno": "#FFCBA4",
  "Ebano": "#1C1C1C",
  "Ebano Negro": "#0A0A0A",
  "Espresso": "#2C1503",
  "Espresso Castaño Oscuro": "#2C1503",
  "Fucsia": "#FF0090",
  "GRIS ACERO": "#A0A0A0",
  "GRIS HUMO": "#A0A0A0",
  "GRIS OSCURO": "#A0A0A0",
  "GRIS PLATA": "#A0A0A0",
  "Gris": "#808080",
  "Gris Claro": "#D3D3D3",
  "Gris Oscuro": "#404040",
  "Grosella": "#8B0040",
  "Grosella Negra": "#5D2D91",
  "Incoloro": "#F5F5F5",
  "Jazmin": "#F5F0E8",
  "Jazmin Rubio Muy Claro Ceniza": "#F5E6C8",
  "Lavanda": "#E6E6FA",
  "Lila": "#C8A2C8",
  "MARRON ESPAÑOL": "#4A2A0A",
  "MARRON MEDIO": "#4A2A0A",
  "MARRON MORISCO": "#4A2A0A",
  "MARRON OSCURO": "#3B1E08",
  "MORENO": "#0A0A0A",
  "MORENO INTENSO": "#0A0A0A",
  "Manzana Rubio Oscuro Rojizo Profundo": "#9B2335",
  "Maracuya": "#F5C518",
  "Maracuya Rubio Ultra Claro Ceniza Dorado": "#F5E6C8",
  "Marfil": "#FFFFF0",
  "Margarita": "#FFFACD",
  "Margarita Rubio Muy Claro Dorado": "#F5E6C8",
  "Miel": "#FFC30B",
  "Miel Rubio Dorado": "#DAA520",
  "Morado": "#6A0DAD",
  "NEGRO": "#0A0A0A",
  "NEGRO AZULADO": "#0A0A0A",
  "Nectar": "#FFBE00",
  "Nectar Rubio Claro": "#E8D5A3",
  "Negro": "#1a1a1a",
  "Negro Azulado": "#0d0d1a",
  "Negro Intenso": "#000000",
  "Negro Profundo": "#0A0A0A",
  "Nude": "#D4A574",
  "PLATINO": "#A0A0A0",
  "Plateado": "#C0C0C0",
  "Porcelana": "#F7E7CE",
  "ROJO BRILLANTE": "#8B0000",
  "ROJO CARMIN": "#8B0000",
  "ROJO CIRUELA": "#8B0000",
  "ROJO CLARO PERLADO": "#8B0000",
  "ROJO EXTREMO": "#8B0000",
  "ROJO GRANATE": "#8B0000",
  "ROJO INTENSO": "#8B0000",
  "ROJO INTENSO NACARADO": "#8B0000",
  "ROJO PROFUNDO": "#8B0000",
  "RUBIO": "#C9A84C",
  "RUBIO CENIC NACARADO": "#5D2D91",
  "RUBIO CENIZA": "#B0A080",
  "RUBIO CENIZA BEIGE CLARO": "#E8D5A3",
  "RUBIO CENIZA COBRIZO": "#B85D19",
  "RUBIO CENIZA DORADO": "#B0A080",
  "RUBIO CENIZA IRISADO": "#5D2D91",
  "RUBIO CENIZA MALVA": "#5D2D91",
  "RUBIO CENIZA PROFUNDO": "#B0A080",
  "RUBIO CHOCHOLATE": "#C9A84C",
  "RUBIO CHOCOLATE": "#3D1C02",
  "RUBIO CHOCOLATE CENIZA": "#3D1C02",
  "RUBIO CHOCOLATE DORADO": "#3D1C02",
  "RUBIO CLARISIMO": "#F5E6C8",
  "RUBIO CLARO": "#E8D5A3",
  "RUBIO CLARO BEIGE": "#E8D5A3",
  "RUBIO CLARO BEIGE CALIDO": "#E8D5A3",
  "RUBIO CLARO BEIGE MIEL": "#E8D5A3",
  "RUBIO CLARO CENIZA": "#E8D5A3",
  "RUBIO CLARO CENIZA DORADO": "#E8D5A3",
  "RUBIO CLARO CENIZA IRISADO": "#5D2D91",
  "RUBIO CLARO CENIZA MALVA": "#5D2D91",
  "RUBIO CLARO CENIZA NACARADO": "#5D2D91",
  "RUBIO CLARO CHOCOLATE": "#3D1C02",
  "RUBIO CLARO CHOCOLATE CENIZA": "#3D1C02",
  "RUBIO CLARO CHOCOLATE DORADO": "#3D1C02",
  "RUBIO CLARO CLARO CENIZA": "#E8D5A3",
  "RUBIO CLARO CLARO CENIZA IRISADO": "#5D2D91",
  "RUBIO CLARO DORADO": "#E8D5A3",
  "RUBIO CLARO DORADO MENTA": "#E8D5A3",
  "RUBIO CLARO DORADO PROFUNDO": "#E8D5A3",
  "RUBIO CLARO GLACE": "#E8D5A3",
  "RUBIO CLARO IRISADO": "#5D2D91",
  "RUBIO CLARO MALVA": "#5D2D91",
  "RUBIO CLARO MALVA CENIZA": "#5D2D91",
  "RUBIO CLARO MARRON DORADO": "#6B3A1F",
  "RUBIO CLARO NATURAL": "#E8D5A3",
  "RUBIO CLARO ORO": "#E8D5A3",
  "RUBIO CLARO ORO COBRIZO": "#B85D19",
  "RUBIO CLARO ROJIZO COBRIZO": "#B85D19",
  "RUBIO CLAROCL CENIZA": "#E8D5A3",
  "RUBIO COBRE ROJIZO": "#B85D19",
  "RUBIO COBRECO ZANAHORIA": "#B85D19",
  "RUBIO COBRIZO": "#B85D19",
  "RUBIO DORAD COBRIZO": "#B85D19",
  "RUBIO DORADO": "#DAA520",
  "RUBIO DORADO AVELLANA": "#DAA520",
  "RUBIO DORADO COBRIZO": "#B85D19",
  "RUBIO DORADO MIEL": "#DAA520",
  "RUBIO DORADO NACARADO": "#5D2D91",
  "RUBIO DORDADO NACARADO": "#5D2D91",
  "RUBIO EXTRA BLOND": "#F5E6C8",
  "RUBIO EXTRA BLOND GREY": "#F5E6C8",
  "RUBIO EXTRA CLARO": "#F5E6C8",
  "RUBIO EXTRA CLARO BEIGE ACLARANTE": "#F5E6C8",
  "RUBIO EXTRA CLARO CENIZA": "#F5E6C8",
  "RUBIO GLACE": "#C9A84C",
  "RUBIO MALVA CENIZA": "#5D2D91",
  "RUBIO MEDIO": "#C9A84C",
  "RUBIO MEDIO BEIGE": "#C9A84C",
  "RUBIO MEDIO BEIGE CALIDO": "#C9A84C",
  "RUBIO MEDIO BEIGE MIEL": "#DAA520",
  "RUBIO MEDIO CENIZA": "#B0A080",
  "RUBIO MEDIO DORADO": "#DAA520",
  "RUBIO MEDIO IRISADO": "#5D2D91",
  "RUBIO MEDIO MALVA": "#5D2D91",
  "RUBIO MEDIO MAROON DORADO": "#DAA520",
  "RUBIO MEDIO ROJIZO INTENSO": "#9B2335",
  "RUBIO MUY CLARO": "#F5E6C8",
  "RUBIO MUY CLARO BEIGE": "#F5E6C8",
  "RUBIO MUY CLARO BEIGE CALIDO": "#F5E6C8",
  "RUBIO MUY CLARO CENIZA": "#F5E6C8",
  "RUBIO MUY CLARO CENIZA DORADO": "#F5E6C8",
  "RUBIO MUY CLARO CENIZA IRISADO": "#5D2D91",
  "RUBIO MUY CLARO CENIZA MALVA": "#5D2D91",
  "RUBIO MUY CLARO CENIZA NACARADO": "#5D2D91",
  "RUBIO MUY CLARO DORADO": "#F5E6C8",
  "RUBIO MUY CLARO DORADO COBRIZO": "#B85D19",
  "RUBIO MUY CLARO DORADO MENTA": "#F5E6C8",
  "RUBIO MUY CLARO DORADO PROFUNDO": "#F5E6C8",
  "RUBIO MUY CLARO DORADO SALVAJE": "#F5E6C8",
  "RUBIO MUY CLARO GLACE": "#F5E6C8",
  "RUBIO MUY CLARO IRISADO": "#5D2D91",
  "RUBIO MUY CLARO MALVA": "#5D2D91",
  "RUBIO MUY CLARO MALVA CENIZA": "#5D2D91",
  "RUBIO MUY CLARO ORO": "#F5E6C8",
  "RUBIO NATURAL": "#C9A84C",
  "RUBIO ORO MUY CLARO": "#F5E6C8",
  "RUBIO OSCURO": "#C8A96E",
  "RUBIO OSCURO BEIGE MIEL": "#C8A96E",
  "RUBIO OSCURO CAOBA": "#4A1C14",
  "RUBIO OSCURO CAOBA ROJIZO": "#4A1C14",
  "RUBIO OSCURO CENIZA": "#C8A96E",
  "RUBIO OSCURO CENIZA COBRIZO": "#B85D19",
  "RUBIO OSCURO CENIZA DORADO": "#C8A96E",
  "RUBIO OSCURO CENIZA IRISADO": "#5D2D91",
  "RUBIO OSCURO CHOCOLATE": "#3D1C02",
  "RUBIO OSCURO CHOCOLATE CENIZA": "#3D1C02",
  "RUBIO OSCURO CHOCOLATE DORADO": "#3D1C02",
  "RUBIO OSCURO COBRE ROJIZO BRILLANTE": "#B85D19",
  "RUBIO OSCURO COBRIZO": "#B85D19",
  "RUBIO OSCURO COBRIZO CAOBA": "#4A1C14",
  "RUBIO OSCURO COBRIZO DORADO": "#B85D19",
  "RUBIO OSCURO DORADO": "#C8A96E",
  "RUBIO OSCURO DORADO PERLADO": "#C8A96E",
  "RUBIO OSCURO GLACE": "#C8A96E",
  "RUBIO OSCURO ROJIZO": "#9B2335",
  "RUBIO OSCURO ROJIZO INTENSO": "#9B2335",
  "RUBIO OSCURO ROJIZO PROFUNDO": "#9B2335",
  "RUBIO OSCUROS CENIZA": "#C8A96E",
  "RUBIO ROJIZO COBRIZO": "#B85D19",
  "RUBIO SUPER CLARO CENIZA": "#E8D5A3",
  "RUBIO SUPER CLARO DORADO": "#E8D5A3",
  "RUBIO SUPER CLARO MALVA": "#5D2D91",
  "RUBIO SUPER CLARO MALVA CENIZA": "#5D2D91",
  "RUBIO SUPER CLARO NATURAL": "#E8D5A3",
  "RUBIOO CHOCOLATE DORADO": "#3D1C02",
  "RUBIOO CLARO CENIZA": "#E8D5A3",
  "RUBIOO COBRE ZANAHORIA": "#B85D19",
  "RUBIOO MUY CLARO": "#F5E6C8",
  "RUBIOOSCURO IRISADO": "#5D2D91",
  "Rojizo": "#9B2335",
  "Rojo": "#CC0000",
  "Rojo Cobrizo": "#CB6D3A",
  "Rojo Intenso": "#8B0000",
  "Rosa": "#FFB6C1",
  "Rosa Claro": "#FFCDD2",
  "Rosa Oscuro": "#C2185B",
  "Rubio": "#C9A84C",
  "Rubio Ceniza": "#D4C5A9",
  "Rubio Cenizo": "#B0A080",
  "Rubio Cenizo Nacarado": "#5D2D91",
  "Rubio Claro": "#F5DEB3",
  "Rubio Claro Cenizo": "#C8BFA0",
  "Rubio Claro Dorado": "#D4AF37",
  "Rubio Dorado": "#DAA520",
  "Rubio Muy Claro": "#E8D5A3",
  "Rubio Muy Claro Ceniza Dorado": "#F5E6C8",
  "Rubio Muy Claro Cenizo": "#F5E6C8",
  "Rubio Natural": "#E8C98A",
  "Rubio Oscuro": "#C8A96E",
  "Rubio Oscuro Cenizo": "#C8A96E",
  "Rubio Oscuro Chocolate": "#3D1C02",
  "Rubio Osuro": "#C9A84C",
  "Rubio Platinado": "#F0E6C8",
  "Rubio Profundo": "#C9A84C",
  "Rubio Rojizo": "#A0522D",
  "Rubio Rojizo Profundo": "#9B2335",
  "Rubio Ultra Claro": "#F5E6C8",
  "Rubio Ultra Claro Ceniza": "#F5E6C8",
  "Rubio Ultra Claro Dorado": "#F5E6C8",
  "SUPER ACLARANTE CENIZA": "#B0A080",
  "SUPER ACLARANTE MALVA": "#5D2D91",
  "SUPER ACLARANTE NATURAL": "#C9A84C",
  "TABACO CLARO": "#2C1503",
  "TABACO MEDIANO": "#2C1503",
  "TABACO OSCURO": "#2C1503",
  "TOSTADO NATURAL": "#2C1503",
  "Tamarindo": "#6B3226",
  "Transparente": "#E8E8E8",
  "Trigo": "#F5DEB3",
  "Trigo Rubio Muy Claro": "#F5E6C8",
  "Turquesa": "#40E0D0",
  "Verde": "#228B22",
  "Verde Oliva": "#808000",
  "Violeta": "#8B00FF"
};




export default function SingleProductInfo({ producto, onVariantSelect }) {
  const { addToCart } = useContext(CartContext);
  const [qty, setQty] = useState(1);
  const [qtyDir, setQtyDir] = useState(1);
  const [selectedSize, setSelectedSize] = useState(0);
  const [selectedColor, setSelectedColor] = useState(null); // null = ninguno seleccionado
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isShippingModalOpen, setShippingModalOpen] = useState(false);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [addingCart, setAddingCart] = useState(false);

  const { nombre, marca, descripcion, descuento, caracteristicas } = producto || {};
  const variantes = producto?.variantes || [];

  // ── Colores: extraer variantes únicas que tienen color_nombre ──
  const variantesConColor = variantes.filter(v => v.color_nombre);
  // Mapa: color_nombre → primera variante con ese color (para no repetir pills)
  const colorMap = new Map();
  variantesConColor.forEach(v => {
    if (!colorMap.has(v.color_nombre)) colorMap.set(v.color_nombre, v);
  });
  const coloresUnicos = [...colorMap.entries()]; // [[nombre, variante], ...]
  const tieneColores = coloresUnicos.length > 0;

  const sizes = [...new Set(variantes.map(v => v.volumen || 'Único'))].sort((a, b) => {
    if (a === 'Único') return 1;
    if (b === 'Único') return -1;
    
    const numA = parseFloat(a);
    const numB = parseFloat(b);
    
    if (!isNaN(numA) && !isNaN(numB)) {
      return numA - numB;
    }
    return String(a).localeCompare(String(b));
  });
  const tieneVariantesTam = sizes.length > 0 && (sizes.length > 1 || sizes[0] !== 'Único');

  // ── Si hay colores y se seleccionó uno, o si hay tamaños, buscar la variante exacta ──
  const currentSize = sizes[selectedSize] || sizes[0];
  let activeVariant = variantes.find(v => {
    const matchSize = tieneVariantesTam ? (v.volumen || 'Único') === currentSize : true;
    const matchColor = tieneColores ? v.color_nombre === selectedColor : true;
    return matchSize && matchColor;
  });

  // Fallback si no hay coincidencia exacta
  if (!activeVariant) {
    if (tieneColores && selectedColor) {
      activeVariant = colorMap.get(selectedColor) || variantesReales(variantes)[0] || variantes[0] || {};
    } else {
      activeVariant = variantes.find(v => (v.volumen || 'Único') === currentSize) || variantesReales(variantes)[0] || variantes[0] || {};
    }
  }

  const price = activeVariant.precio ?? producto.precio ?? 0;
  let offerPrice = activeVariant.precio_oferta ?? producto.precio_oferta ?? null;
  const stock = activeVariant.stock ?? producto.stock ?? 0;

  // Notificamos a ProductoSingle cuando cambia la variante seleccionada
  useEffect(() => {
    if (activeVariant && activeVariant.id && onVariantSelect) {
      onVariantSelect(activeVariant.id);
    }
  }, [activeVariant?.id, onVariantSelect]);

  if (!producto) return null;

  // Si no hay precio de oferta pero hay un descuento global, lo calculamos
  if (!offerPrice && descuento > 0 && price > 0) {
    offerPrice = price - (price * (descuento / 100));
  }

  const calcDescuento = offerPrice && offerPrice < price ? Math.round((1 - offerPrice / price) * 100) : (descuento || 0);

  const handleShare = async () => {
    const shareData = {
      title: `${nombre} - ${marca} | Marybe`,
      text: descripcion || `Mirá este producto en Marybe: ${nombre}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        alert('Enlace copiado al portapapeles');
      }
    } catch (err) {
      console.error('Error al compartir', err);
    }
  };

  // Calculo del precio con impuestos (solo informativo como en el diseño)
  const priceWithoutTaxes = Math.round((offerPrice || price) * 0.79);
  const installmentValue = Math.round((offerPrice || price) / 3);

  const renderAddToCart = () => (
    <>
      <OptionLabel>Cantidad</OptionLabel>
      <ActionRow>
        <QuantityBox>
          <button
            disabled={qty <= 1}
            onClick={() => { setQtyDir(-1); setQty(Math.max(1, qty - 1)); }}
          >
            −
          </button>
          <QtyNumber>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={qty}
                initial={{ y: qtyDir * 18, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: qtyDir * -18, opacity: 0 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
              >
                {qty}
              </motion.span>
            </AnimatePresence>
          </QtyNumber>
          <button
            disabled={qty >= stock}
            onClick={() => { setQtyDir(1); setQty(Math.min(stock, qty + 1)); }}
          >
            +
          </button>
        </QuantityBox>
        <AddToCartBtn
          disabled={stock === 0}
          $added={addingCart}
          whileTap={{ scale: 0.97 }}
          animate={addingCart ? { scale: [1, 1.03, 1] } : { scale: 1 }}
          transition={{ duration: 0.3 }}
          style={{ opacity: stock === 0 ? 0.6 : 1, cursor: stock === 0 ? 'not-allowed' : 'pointer' }}
          onClick={() => {
            if (stock > 0 && !addingCart) {
              setAddingCart(true);
              setTimeout(() => {
                addToCart(producto, qty, activeVariant);
                setIsCartModalOpen(true);
                setAddingCart(false);
              }, 850);
            }
          }}
        >
          <AnimatePresence mode="wait" initial={false}>
            {addingCart ? (
              <motion.span
                key="added"
                style={{ display: 'flex', alignItems: 'center', gap: 10 }}
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
                style={{ display: 'flex', alignItems: 'center', gap: 10 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                {stock === 0 ? 'Agotado' : 'Agregar'}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
              </motion.span>
            )}
          </AnimatePresence>
        </AddToCartBtn>
      </ActionRow>
    </>
  );

  return (
    <InfoContainer>
      <TopRow>
        <PillsContainer>
          {calcDescuento > 30 && <Pill>Super oferta</Pill>}
          {calcDescuento > 0 && calcDescuento <= 30 && <Pill>Promoción</Pill>}
        </PillsContainer>
        <IconsContainer>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            onClick={handleShare}
            style={{ cursor: 'pointer' }}
            title="Compartir"
          >
            <path d="M9 12C9 12.663 8.73661 13.2989 8.26777 13.7678C7.79893 14.2366 7.16304 14.5 6.5 14.5C5.83696 14.5 5.20107 14.2366 4.73223 13.7678C4.26339 13.2989 4 12.663 4 12C4 11.337 4.26339 10.7011 4.73223 10.2322C5.20107 9.76339 5.83696 9.5 6.5 9.5C7.16304 9.5 7.79893 9.76339 8.26777 10.2322C8.73661 10.7011 9 11.337 9 12Z" stroke="#7C0405" strokeWidth="1.5" />
            <path d="M14 6.5L9 10M14 17.5L9 14" stroke="#7C0405" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M19 18.5C19 19.163 18.7366 19.7989 18.2678 20.2678C17.7989 20.7366 17.163 21 16.5 21C15.837 21 15.2011 20.7366 14.7322 20.2678C14.2634 19.7989 14 19.163 14 18.5C14 17.837 14.2634 17.2011 14.7322 16.7322C15.2011 16.2634 15.837 16 16.5 16C17.163 16 17.7989 16.2634 18.2678 16.7322C18.7366 17.2011 19 17.837 19 18.5ZM19 5.5C19 6.16304 18.7366 6.79893 18.2678 7.26777C17.7989 7.73661 17.163 8 16.5 8C15.837 8 15.2011 7.73661 14.7322 7.26777C14.2634 6.79893 14 6.16304 14 5.5C14 4.83696 14.2634 4.20107 14.7322 3.73223C15.2011 3.26339 15.837 3 16.5 3C17.163 3 17.7989 3.26339 18.2678 3.73223C18.7366 4.20107 19 4.83696 19 5.5Z" stroke="#7C0405" strokeWidth="1.5" />
          </svg>

          <FavoriteButton product={producto} size="24px" />

        </IconsContainer>
      </TopRow>

      <Brand>{marca}</Brand>
      <Title>{nombre}</Title>

      {caracteristicas && (
        <SubBadges>
          {caracteristicas.split('|').map((c, i) => <span key={i}>{c.trim()}</span>)}
        </SubBadges>
      )}

      {descripcion && <DescriptionExcerpt>{descripcion}</DescriptionExcerpt>}

      <MobileActionRow>
        {renderAddToCart()}
      </MobileActionRow>

      <PriceBlock>
        {offerPrice && <OldPrice>{formatPrice(price)}</OldPrice>}
        <CurrentPriceRow>
          <CurrentPrice>{formatPrice(offerPrice || price)}</CurrentPrice>
          {descuento > 0 && <DiscountBadge>- {descuento}%</DiscountBadge>}
        </CurrentPriceRow>

        <PaymentLink onClick={() => setIsPaymentModalOpen(true)}>Ver medios de pago</PaymentLink>
        <CfteaText>CFTEA 0%</CfteaText>

        {producto.especificaciones && (
          <InstallmentsText>
            {producto.especificaciones}
          </InstallmentsText>
        )}
        <LegalText>Precio sin impuestos nacionales {formatPrice(priceWithoutTaxes)}</LegalText>
      </PriceBlock>

      {tieneVariantesTam && (
        <>
          <OptionLabel>Tamaño</OptionLabel>
          <SizesContainer>
            {sizes.map((size, idx) => (
              <SizeBtn
                key={idx}
                $active={selectedSize === idx}
                onClick={() => setSelectedSize(idx)}
              >
                {size}
              </SizeBtn>
            ))}
          </SizesContainer>
        </>
      )}

      {/* Selección de color — solo si las variantes tienen color_nombre en Strapi */}
      {tieneColores && (
        <>
          <OptionLabel>
            Color
            {selectedColor && (
              <span style={{ fontWeight: 400, color: '#555', marginLeft: 8 }}>— {selectedColor}</span>
            )}
          </OptionLabel>
          <ColorsContainer>
            {coloresUnicos.map(([nombre, variante]) => {
              const hex = COLOR_MAP[nombre] || '#CCCCCC';
              return (
                <ColorBtn
                  key={nombre}
                  $color={hex}
                  $active={selectedColor === nombre}
                  onClick={() => setSelectedColor(nombre)}
                  title={nombre}
                />
              );
            })}
          </ColorsContainer>
        </>
      )}

      <StockInfo>
        {stock > 0
          ? `Stock Disponible (+${stock} disponibles)`
          : <span style={{ color: '#d32f2f' }}>Sin stock disponible</span>}
      </StockInfo>

      <DesktopActionRow>
        {renderAddToCart()}
      </DesktopActionRow>

      <ShippingInfo>
        <InfoItem>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <div>
            Retira gratis en nuestras sucursales
            <Link to="/sucursales/">Ver sucursales</Link>
          </div>
        </InfoItem>
        <InfoItem>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="3" width="15" height="13" />
            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
            <circle cx="5.5" cy="18.5" r="2.5" />
            <circle cx="18.5" cy="18.5" r="2.5" />
          </svg>
          <div>
            Calculá costo de envío
            <button onClick={() => setShippingModalOpen(true)} style={{ cursor: 'pointer', background: 'none', border: 'none', padding: 0, color: '#000000', textDecoration: 'underline', fontWeight: 500, fontFamily: 'inherit', fontSize: 'inherit' }}>Calcular costo</button>
          </div>
        </InfoItem>
        <InfoItem>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 12 20 22 4 22 4 12" />
            <rect x="2" y="7" width="20" height="5" />
            <line x1="12" y1="22" x2="12" y2="7" />
            <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
            <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
          </svg>
          <div>
            Si es para regalo, en el carrito de compras podrás dejar un mensaje personalizado para esa persona.
          </div>
        </InfoItem>
      </ShippingInfo>

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
      />

      <ShippingModal
        isOpen={isShippingModalOpen}
        onClose={() => setShippingModalOpen(false)}
      />

      <AddToCartModal
        isOpen={isCartModalOpen}
        onClose={() => setIsCartModalOpen(false)}
        product={producto}
        initialMode="success"
        addedQty={qty}
        addedVariant={activeVariant}
      />
    </InfoContainer>
  );
}
