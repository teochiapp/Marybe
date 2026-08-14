// Re-exporta desde el Context Provider centralizado.
// Todos los componentes que importen useMegaMenu obtienen
// la MISMA instancia compartida — sin fetches duplicados ni acumulacion.
export { useMegaMenu } from '../context/MegaMenuContext';
