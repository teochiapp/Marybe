const TARGETS = {
  'seccion-eventos': { block: 'proximos-eventos', fallback: '/contacto' },
  'seccion-gift-card': { block: 'gift-card', fallback: '/gift-card' },
  'seccion-destacados': { block: 'seccion-destacada', fallback: '/tienda?orden=createdAt%3Adesc' },
};

export function inicioTarget(anchor, area) {
  const base = anchor.replace(/-hogar$/, '');
  const config = TARGETS[base];
  if (!config) return null;
  return {
    ...config,
    anchor: area === 'hogar' ? `${base}-hogar` : base,
    fallback: base === 'seccion-destacados' ? `${config.fallback}&seccion=${area === 'hogar' ? 'Hogar' : 'Perfumer%C3%ADa'}` : config.fallback,
  };
}

export function navigateToInicioSection(anchor, context, navigate) {
  const area = context === 'HOGAR' ? 'hogar' : 'perfumeria';
  const target = inicioTarget(anchor, area);
  if (!target) return;
  const page = document.querySelector(`[data-inicio-area="${area}"][data-inicio-ready="true"]`);
  if (page) {
    const hidden = (page.dataset.inicioHidden || '').split(',');
    if (hidden.includes(target.block)) { navigate(target.fallback); return; }
    const element = document.getElementById(target.anchor);
    if (element) { element.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
  }
  navigate(`/inicio?seccion=${area}#${target.anchor}`);
}
