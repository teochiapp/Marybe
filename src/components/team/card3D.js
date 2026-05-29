import "../../index.css";
import { FaCode, FaPalette, FaLaptopCode } from "react-icons/fa";
import React, { useRef, useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";

const Card3D = ({ name, description, image, onClick, role }) => {
  const cardreft = useRef(null);
  const [showHorizontal, setShowHorizontal] = useState(true);

  // Alternar animación cada 2 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setShowHorizontal((prev) => !prev);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const getRoleIcon = (role) => {
    switch (role?.toLowerCase()) {
      case 'frontend':
        return <FaCode />;
      case 'fullstack':
        return <FaLaptopCode />;
      case 'ux/ui':
      case 'designer':
        return <FaPalette />;
      default:
        return <FaCode />;
    }
  };

  return (
    <CardContainer ref={cardreft} onClick={onClick}>
      {showHorizontal ? <><TopBorder /><BottomBorder /></> : <><LeftBorder /><RightBorder /></>}
      <CardHeader>
        <Cardimage src={image} alt={name} className="cardimage" />
      </CardHeader>
      <CardContent>
        <CardTitle>{name}</CardTitle>
        <RoleBadge>
          {getRoleIcon(role)}
          <span>{role || description}</span>
        </RoleBadge>
      </CardContent>
    </CardContainer>
  );
};

export default Card3D;

// Animaciones de lombriz para los bordes
const topBorderAnimation = keyframes`
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
`;

const bottomBorderAnimation = keyframes`
  0% {
    transform: translateX(100%);
  }
  100% {
    transform: translateX(-100%);
  }
`;

const leftBorderAnimation = keyframes`
  0% {
    transform: translateY(100%);
  }
  100% {
    transform: translateY(-100%);
  }
`;

const rightBorderAnimation = keyframes`
  0% {
    transform: translateY(-100%);
  }
  100% {
    transform: translateY(100%);
  }
`;

const TopBorder = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--primary-cyan), transparent);
  animation: ${topBorderAnimation} 1s linear infinite;
  z-index: 10;
`;

const BottomBorder = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--primary-cyan), transparent);
  animation: ${bottomBorderAnimation} 1s linear infinite;
  z-index: 10;
`;

const LeftBorder = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 2px;
  background: linear-gradient(180deg, transparent, var(--primary-cyan), transparent);
  animation: ${leftBorderAnimation} 1s linear infinite;
  z-index: 10;
`;

const RightBorder = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  width: 2px;
  background: linear-gradient(180deg, transparent, var(--primary-cyan), transparent);
  animation: ${rightBorderAnimation} 1s linear infinite;
  z-index: 10;
`;

const CardContainer = styled.div`
  width: 370px;
  height: 170px;
  background: rgba(18, 26, 46, 0.3);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  /* animation: shadowRotate 0.4s linear infinite; */
  padding: 1.2rem 1.5rem;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  cursor: pointer;
  overflow: hidden;
  will-change: transform;
  position: relative;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  gap: 1.3rem;

  &:hover {
    box-shadow: 0 0 80px 20px var(--medium-blue);
    transform: translateY(-5px);
  }

  @media (max-width: 1500px) {
    width: 310px;
  }

@media (max-width: 1300px) {
    width: 245px;
  }
  @media (max-width: 1024px) and (min-width: 601px) {
    width: 40vw;
    max-width: 420px;
    min-width: 260px;
    padding: 1.2rem 1rem;
    height: 170px;
    flex-direction: row;
    align-items: center;
    justify-content: center;
  }
  @media (max-width: 600px) {
    width: 98vw;
    min-width: 0;
    height: auto;
    padding: 1.2rem 0.5rem;
    gap: 0.7rem;
    justify-content: center;
    flex-direction: column;
    align-items: center;
  }

  /* @keyframes shadowRotate {
    0% { box-shadow: 0 -1px 7px 2px var(--medium-blue); }
    25% { box-shadow: 1px 0 7px 2px var(--medium-blue); }
    50% { box-shadow: 0 1px 7px 2px var(--medium-blue); }
    75% { box-shadow: -1px 0 7px 2px var(--medium-blue); }
    100% { box-shadow: 0 -1px 7px 2px var(--medium-blue); }
  } */
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;

  @media (max-width: 600px) {
    width: 100%;
    justify-content: center;
    align-items: center;
    margin-bottom: 0.7rem;
  }
`;

const Cardimage = styled.img`
  border-radius: 15px;
  filter: brightness(0.93) contrast(1.05) saturate(1.1);
  width: 110px;
  height: 110px;
  object-fit: cover;
  transition: transform 0.3s ease;
  margin-right: 0.2rem;

  ${CardContainer}:hover & {
    transform: scale(1.07);
  }

  @media (max-width: 600px) {
    width: 120px;
    height: 120px;
    margin: 0 auto;
    display: block;
  }
`;

const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  flex: 1;
  justify-content: center;
  gap: 1rem;
  width: 100%;

  @media (max-width: 600px) {
    align-items: center;
    text-align: center;
  }
`;

const CardTitle = styled.h2`
  margin: 0;
  font-size: 1.3rem;
  font-family: var(--heading-font);
  font-weight: 700;
  background: var(--gradient-primary);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  letter-spacing: 0.5px;
`;

const RoleBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(13, 211, 250, 0.15);
  color: var(--secondary-color);
  padding: 0.5rem 1rem;
  border-radius: 25px;
  font-size: 0.85rem;
  font-weight: 600;
  font-family: var(--text-font);
  backdrop-filter: blur(10px);
  transition: all 0.2s ease;

  svg {
    font-size: 0.9rem;
  }

  ${CardContainer}:hover & {
    background: rgba(13, 211, 250, 0.25);
    transform: scale(1.05);
  }
`;
