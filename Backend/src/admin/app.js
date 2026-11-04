import marybeLogo from './extensions/logo-marybe.png';
import './extensions/branding.css';

const config = {
  auth: { logo: marybeLogo },
  locales: [
    'es',
  ],
};

export default {
  config,
  register(app) {
    app.customFields.register({
      name: 'paleta-color',
      type: 'string',
      intlLabel: { id: 'marybe.palette.label', defaultMessage: 'Paleta de colores' },
      intlDescription: { id: 'marybe.palette.description', defaultMessage: 'Elegí un color visualmente, sin escribir códigos.' },
      components: { Input: () => import('./components/ColorPaletteInput') },
    });
  },
};
