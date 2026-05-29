import React from 'react';
import styled from 'styled-components';
import { motion, useScroll, useTransform, MotionConfig } from 'framer-motion';

const ScrollAnimatedIllustration = () => {
  const { scrollY } = useScroll();

  // Optimización: Transformaciones menos frecuentes y más suaves
  const mainProgress = useTransform(scrollY, [0, 500], [0, 1]);
  const lineProgress = useTransform(scrollY, [0, 1000], [0, 1]);

  // Transformaciones más suaves y menos intensas
  const y1 = useTransform(mainProgress, [0, 1], [0, -50]);
  const y2 = useTransform(mainProgress, [0, 1], [0, 50]);
  const y3 = useTransform(mainProgress, [0, 1], [0, -75]);
  const scale = useTransform(mainProgress, [0, 1], [1, 0.9]);
  const rotate = useTransform(mainProgress, [0, 1], [0, 180]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0.5]);

  // Líneas optimizadas con menor intensidad
  const lineHeight = useTransform(lineProgress, [0, 1], [0, 800]);
  const lineOpacity = useTransform(mainProgress, [0, 1], [0, 0.6]);
  const circleY = useTransform(lineProgress, [0, 1], [0, 600]);
  const circleOpacity = useTransform(scrollY, [0, 500], [0, 0.8]);

  return (
    <MotionConfig
      transition={{
        type: "tween",
        ease: "linear",
        duration: 0.05
      }}
    >
      {/* Versión animada para desktop */}
      <DesktopVersion
        style={{
          scale,
          opacity,
          willChange: 'transform, opacity'
        }}
      >
        <TechIllustration>
          <SunRays />
          <motion.div
            className="floating-circle circle-1"
            style={{
              y: y1,
              willChange: 'transform'
            }}
          ></motion.div>
          <motion.div
            className="floating-circle circle-2"
            style={{
              y: y2,
              willChange: 'transform'
            }}
          ></motion.div>
          <motion.div
            className="floating-circle circle-3"
            style={{
              y: y3,
              willChange: 'transform'
            }}
          ></motion.div>
          <motion.div
            className="connection-line line-1"
            style={{
              rotate,
              willChange: 'transform'
            }}
          ></motion.div>
          <motion.div
            className="connection-line line-2"
            style={{
              rotate: useTransform(rotate, [0, 360], [0, -180]),
              willChange: 'transform'
            }}
          ></motion.div>

          {/* Partículas optimizadas */}
          <motion.div
            className="scroll-particle particle-1"
            style={{
              opacity: useTransform(mainProgress, [0, 0.33], [0, 0.8]),
              scale: useTransform(mainProgress, [0, 0.33], [0, 1]),
              willChange: 'transform, opacity'
            }}
          ></motion.div>
          <motion.div
            className="scroll-particle particle-2"
            style={{
              opacity: useTransform(mainProgress, [0, 0.5], [0, 0.6]),
              scale: useTransform(mainProgress, [0, 0.5], [0, 1])
            }}
          ></motion.div>
          <motion.div
            className="scroll-particle particle-3"
            style={{
              opacity: useTransform(mainProgress, [0, 0.67], [0, 0.7]),
              scale: useTransform(mainProgress, [0, 0.67], [0, 1])
            }}
          ></motion.div>
        </TechIllustration>

        {/* Línea que sale del círculo hacia abajo */}
        <motion.div
          className="scroll-line"
          style={{
            height: lineHeight,
            opacity: lineOpacity
          }}
        />

        {/* Círculo final de la línea */}
        <motion.div
          className="line-end-circle"
          style={{
            y: circleY,
            opacity: circleOpacity
          }}
        />
      </DesktopVersion>

      {/* Versión estática para mobile */}
      <MobileVersion>
        <TechIllustration>
          <SunRays />
          <div className="floating-circle circle-1"></div>
          <div className="floating-circle circle-2"></div>
          <div className="floating-circle circle-3"></div>
          <div className="connection-line line-1"></div>
          <div className="connection-line line-2"></div>

          {/* Partículas estáticas */}
          <div className="scroll-particle particle-1 static"></div>
          <div className="scroll-particle particle-2 static"></div>
          <div className="scroll-particle particle-3 static"></div>
        </TechIllustration>
      </MobileVersion>
    </MotionConfig>
  );
};

export default ScrollAnimatedIllustration;

// Versión para desktop (768px+)
const DesktopVersion = styled(motion.div)`
  @media (max-width: 767px) {
    display: none;
  }
`;

// Versión para mobile (hasta 767px)
const MobileVersion = styled.div`
  @media (min-width: 768px) {
    display: none;
  }
`;

const TechIllustration = styled.div`
  position: relative;
  width: 400px;
  height: 400px;
  will-change: transform;
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 300px;
    height: 300px;
    /* Color secundario predominante */
    background: linear-gradient(45deg, var(--secondary-color), var(--primary-color));
    border-radius: 50%;
    opacity: 0.15;
    animation: pulse 4s ease-in-out infinite;
    filter: blur(1px);
    will-change: transform, opacity;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 200px;
    height: 200px;
    background: linear-gradient(45deg, var(--secondary-color), var(--primary-color));
    border-radius: 50%;
    opacity: 0.2;
    animation: pulseSecondary 4s ease-in-out infinite 2s;
    filter: blur(0.5px);
    will-change: transform, opacity;
  }
  
  @keyframes pulse {
    0%, 100% {
      transform: translate(-50%, -50%) scale(1);
      opacity: 0.1;
    }
    50% {
      transform: translate(-50%, -50%) scale(1.05);
      opacity: 0.25;
    }
  }

  @keyframes pulseSecondary {
    0%, 100% {
      transform: translate(-50%, -50%) scale(1);
      opacity: 0.2;
    }
    50% {
      transform: translate(-50%, -50%) scale(1.05);
      opacity: 0.4;
    }
  }
  
  /* Círculos flotantes optimizados */
  .floating-circle {
    position: absolute;
    border-radius: 50%;
    background: var(--secondary-color);
    opacity: 0.6;
    animation: float 8s ease-in-out infinite;
    box-shadow: 0 0 15px rgba(255, 210, 111, 0.3);
    transition: transform 0.3s ease;
    will-change: transform;
  }
  
  .floating-circle:hover {
    transform: scale(1.1);
    box-shadow: 0 0 25px rgba(255, 210, 111, 0.5);
  }
  
  .circle-1 {
    width: 20px;
    height: 20px;
    top: 20%;
    left: 20%;
    animation-delay: 0s;
  }
  
  .circle-2 {
    width: 15px;
    height: 15px;
    top: 70%;
    right: 20%;
    animation-delay: 2.67s;
  }
  
  .circle-3 {
    width: 25px;
    height: 25px;
    bottom: 20%;
    left: 30%;
    animation-delay: 5.33s;
  }
  
  @keyframes float {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-15px);
    }
  }
  
  /* Líneas de conexión optimizadas */
  .connection-line {
    position: absolute;
    background: linear-gradient(90deg, transparent, var(--primary-color), transparent);
    height: 2px;
    opacity: 0.3;
    animation: flow 5s linear infinite;
    box-shadow: 0 0 8px rgba(30, 221, 142, 0.4);
    border-radius: 1px;
    will-change: opacity;
  }
  
  .line-1 {
    width: 100px;
    top: 30%;
    left: 10%;
    transform: rotate(45deg);
  }
  
  .line-2 {
    width: 80px;
    top: 60%;
    right: 15%;
    transform: rotate(-30deg);
  }
  
  @keyframes flow {
    0% {
      opacity: 0.1;
    }
    50% {
      opacity: 0.5;
    }
    100% {
      opacity: 0.1;
    }
  }
  
  /* Partículas optimizadas */
  .scroll-particle {
    position: absolute;
    border-radius: 50%;
    background: var(--secondary-color);
    box-shadow: 0 0 12px rgba(255, 210, 111, 0.5);
    animation: sparkle 3s ease-in-out infinite;
    will-change: transform, opacity;
  }

  /* Partículas estáticas para mobile */
  .scroll-particle.static {
    opacity: 0.7;
    animation: sparkle 4s ease-in-out infinite;
    box-shadow: 0 0 8px rgba(255, 210, 111, 0.4);
  }
  
  .particle-1 {
    width: 8px;
    height: 8px;
    top: 15%;
    right: 25%;
    animation-delay: 0s;
  }
  
  .particle-2 {
    width: 6px;
    height: 6px;
    top: 75%;
    left: 15%;
    animation-delay: 1s;
  }
  
  .particle-3 {
    width: 10px;
    height: 10px;
    bottom: 30%;
    right: 10%;
    animation-delay: 2s;
  }
  
  @keyframes sparkle {
    0%, 100% {
      transform: scale(1);
      opacity: 0.8;
    }
    50% {
      transform: scale(1.2);
      opacity: 1;
    }
  }
  
  /* Línea que sale del círculo hacia abajo - solo desktop */
  .scroll-line {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(to bottom, 
      var(--primary-color) 0%, 
      var(--primary-color) 20%, 
      var(--accent-color) 40%, 
      var(--secondary-color) 60%, 
      rgba(83, 192, 210, 0.3) 80%, 
      transparent 100%
    );
    width: 6px;
    border-radius: 3px;
    box-shadow: 
      0 0 20px rgba(30, 221, 142, 0.8),
      0 0 12px rgba(83, 192, 210, 0.5),
      0 0 6px rgba(30, 221, 142, 0.3);
    transform-origin: top;
    transition: all 0.1s ease;
    filter: blur(0.3px);
    z-index: 10;
    will-change: height, opacity;
  }
  
  /* Círculo final de la línea - solo desktop */
  .line-end-circle {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translateX(-50%);
    width: 10px;
    height: 10px;
    background: var(--primary-color);
    border-radius: 50%;
    box-shadow: 
      0 0 15px rgba(30, 221, 142, 0.7),
      0 0 8px rgba(83, 192, 210, 0.5);
    z-index: 11;
    will-change: transform, opacity;
  }

  /* Tablet */
  @media (min-width: 768px) and (max-width: 1023px) {
    width: 350px;
    height: 350px;
    
    &::before {
      width: 250px;
      height: 250px;
    }
    
    &::after {
      width: 170px;
      height: 170px;
    }

    .circle-1, .circle-2, .circle-3 {
      animation: float 10s ease-in-out infinite;
    }

    .circle-1 {
      width: 18px;
      height: 18px;
    }
    
    .circle-2 {
      width: 13px;
      height: 13px;
    }
    
    .circle-3 {
      width: 22px;
      height: 22px;
    }

    .line-1 {
      width: 90px;
    }
    
    .line-2 {
      width: 70px;
    }

    .particle-1 {
      width: 7px;
      height: 7px;
    }
    
    .particle-2 {
      width: 5px;
      height: 5px;
    }
    
    .particle-3 {
      width: 8px;
      height: 8px;
    }
  }

  /* Mobile optimizado para rendimiento */
  @media (max-width: 767px) {
    width: 280px;
    height: 280px;
    
    &::before {
      width: 180px;
      height: 180px;
    }
    
    &::after {
      width: 130px;
      height: 130px;
    }

    /* Simplificar animaciones en mobile para mejor rendimiento */
    &::before, &::after {
      animation: pulse 6s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% {
        transform: translate(-50%, -50%) scale(1);
        opacity: 0.08;
      }
      50% {
        transform: translate(-50%, -50%) scale(1.03);
        opacity: 0.15;
      }
    }

    .floating-circle {
      animation: float 12s ease-in-out infinite;
      box-shadow: 0 0 10px rgba(30, 221, 142, 0.25);
    }

    .floating-circle:hover {
      transform: scale(1.05);
      box-shadow: 0 0 15px rgba(30, 221, 142, 0.4);
    }

    @keyframes float {
      0%, 100% {
        transform: translateY(0px);
      }
      50% {
        transform: translateY(-8px);
      }
    }

    .connection-line {
      animation: none;
      opacity: 0.2;
      box-shadow: none;
    }

    .scroll-particle.static {
      @keyframes sparkle {
        0%, 100% {
          transform: scale(1);
          opacity: 0.6;
        }
        50% {
          transform: scale(1.08);
          opacity: 0.8;
        }
      }
    }

    /* Reducir tamaños para mobile */
    .circle-1 {
      width: 16px;
      height: 16px;
    }
    
    .circle-2 {
      width: 12px;
      height: 12px;
    }
    
    .circle-3 {
      width: 18px;
      height: 18px;
    }

    .particle-1 {
      width: 6px;
      height: 6px;
    }
    
    .particle-2 {
      width: 4px;
      height: 4px;
    }
    
    .particle-3 {
      width: 7px;
      height: 7px;
    }
  }
`;

const SunRays = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 500px;
  height: 500px;
  /* Estilo Tech/Digital: Rayos finos pero sutiles */
  background: repeating-conic-gradient(
    from 0deg,
    transparent 0deg,
    transparent 4.5deg,
    var(--secondary-color) 4.5deg,
    var(--secondary-color) 5deg,
    transparent 5deg,
    transparent 10deg
  );
  opacity: 0.25; /* Opacidad media */
  border-radius: 50%;
  z-index: -1;
  pointer-events: none;
  
  /* Máscara suave */
  mask-image: radial-gradient(circle, transparent 30%, black 40%, black 55%, transparent 65%);
  -webkit-mask-image: radial-gradient(circle, transparent 30%, black 40%, black 55%, transparent 65%);
  
  animation: techRotate 60s linear infinite;
  will-change: transform;

  /* Segunda capa HUD */
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: repeating-conic-gradient(
      from 15deg,
      transparent 0deg,
      transparent 9.5deg,
      var(--secondary-color) 9.5deg,
      var(--secondary-color) 10deg,
      transparent 10deg,
      transparent 20deg
    );
    opacity: 0.4;
    mask-image: radial-gradient(circle, transparent 40%, black 45%, black 60%, transparent 70%);
    -webkit-mask-image: radial-gradient(circle, transparent 40%, black 45%, black 60%, transparent 70%);
    animation: techRotateReverse 45s linear infinite;
  }

  /* Parpadeo moderado */
  animation: techPulse 4s ease-in-out infinite, techRotate 80s linear infinite;

  @keyframes techRotate {
    from { transform: translate(-50%, -50%) rotate(0deg); }
    to { transform: translate(-50%, -50%) rotate(360deg); }
  }

  @keyframes techRotateReverse {
    from { transform: rotate(360deg); }
    to { transform: rotate(0deg); }
  }

  @keyframes techPulse {
    0%, 100% { opacity: 0.2; }
    50% { opacity: 0.4; }
  }

  @media (max-width: 767px) {
    width: 350px;
    height: 350px;
  }
`; 