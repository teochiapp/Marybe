import React from 'react';
import { motion } from 'framer-motion';

// Animación de Fade In simple al scrollear
export const FadeIn = ({ children, delay = 0, duration = 0.5, className = '' }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Animación que aparece desde la izquierda con un leve escalado
export const FadeInLeft = ({ children, delay = 0, duration = 0.6, className = '' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -50, scale: 0.95 }}
      whileInView={{ opacity: 1, x: 0, scale: 1 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Animación que aparece desde abajo con un fade
export const FadeInUp = ({ children, delay = 0, duration = 0.5, className = '' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const staggerContainerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0,
    },
  },
};

export const staggerItemLeftVariants = {
  hidden: { opacity: 0, x: -50, scale: 0.95 },
  show: { 
    opacity: 1, 
    x: 0, 
    scale: 1,
    transition: {
      duration: 0.5,
      ease: 'easeOut'
    }
  },
};

export const staggerItemFadeVariants = {
  hidden: { opacity: 0 },
  show: { 
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: 'easeOut'
    }
  },
};

// Contenedor para orquestar animaciones en cascada (stagger)
export const StaggerContainer = ({ children, staggerDelay = 0.1, delayChildren = 0, className = '' }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: delayChildren,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-50px' }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Elemento individual para usar dentro de StaggerContainer
// Aparece desde la izquierda con escalado
export const StaggerItemLeft = ({ children, className = '' }) => {
  const itemVariants = {
    hidden: { opacity: 0, x: -50, scale: 0.95 },
    show: { 
      opacity: 1, 
      x: 0, 
      scale: 1,
      transition: {
        duration: 0.5,
        ease: 'easeOut'
      }
    },
  };

  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  );
};

// Elemento individual Fade In para usar dentro de StaggerContainer
export const StaggerItemFade = ({ children, className = '' }) => {
  const itemVariants = {
    hidden: { opacity: 0 },
    show: { 
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: 'easeOut'
      }
    },
  };

  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  );
};
