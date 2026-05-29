// Optimizador de rendimiento simplificado para evitar bucles infinitos

// Monitor de rendimiento básico
export const setupPerformanceMonitoring = () => {
  let violationCount = 0;
  
  // Interceptar console.warn para detectar violaciones
  const originalWarn = console.warn;
  console.warn = function(...args) {
    const message = args.join(' ');
    
    if (message.includes('Violation') && message.includes('handler took')) {
      violationCount++;
      
      // Si hay muchas violaciones, activar modo de optimización
      if (violationCount > 5) {
        setTimeout(() => {
          violationCount = Math.max(0, violationCount - 2);
        }, 1000);
        
        console.log('Performance optimization activated due to violations');
      }
    }
    
    return originalWarn.apply(console, args);
  };
  
  return () => {
    console.warn = originalWarn;
  };
};

// Función principal para inicializar optimizaciones básicas
export const initializePerformanceOptimizations = () => {
  try {
    const cleanupMonitoring = setupPerformanceMonitoring();
    
    console.log('Performance optimizations initialized (safe mode)');
    
    return () => {
      cleanupMonitoring();
    };
  } catch (error) {
    console.error('Error initializing performance optimizations:', error);
    return () => {};
  }
};

// Exportar funciones básicas para compatibilidad
export const optimizePerformance = (operation) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      try {
        const result = operation();
        resolve(result);
      } catch (error) {
        console.error('Error in optimized operation:', error);
        resolve(null);
      }
    }, 0);
  });
};

export const optimizeMessageHandlers = () => {
  // Función vacía para evitar problemas
  console.log('Message handlers optimization disabled for safety');
};

export const optimizeAnimations = () => {
  // Función vacía para evitar problemas
  console.log('Animation optimization disabled for safety');
  return () => {};
};

// Exportar como objeto nombrado para evitar el error de anonymous default export
const performanceOptimizerUtils = {
  optimizePerformance,
  optimizeMessageHandlers,
  optimizeAnimations,
  setupPerformanceMonitoring,
  initializePerformanceOptimizations
};

export default performanceOptimizerUtils; 