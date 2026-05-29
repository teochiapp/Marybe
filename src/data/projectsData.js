import { FaReact, FaNodeJs, FaDatabase, FaWordpress, FaJs, FaCss3Alt, FaHtml5 } from 'react-icons/fa';
import { SiStrapi, SiJavascript } from "react-icons/si";

// Helper function to get translated project data
export const getProjectsData = (t) => [
  {
    title: t('projects.vinotipia.title', 'Vinotipia'),
    description: t('projects.vinotipia.description', 'E-commerce de vinos premium con catálogo dinámico, pasarela de pagos segura y panel de administración para gestión de productos y ventas. Diseño elegante y experiencia de usuario optimizada para amantes del vino.'),
    image: '/portfolio/vinotipia.png',
    url: 'https://vinotipia.com',
    techs: [
      { name: 'React.js', icon: <FaReact color="#61DBFB" /> },
      { name: 'WordPress', icon: <FaWordpress color="#21759B" /> },
    ],
  },
  {
    title: t('projects.marinochoa.title', 'Marin Ochoa'),
    description: t('projects.marinochoa.description', 'Web con muestra de propiedades para alquiler y venta de una reconocida inmobiliaria de las Sierras de Córdoba'),
    image: '/portfolio/marinochoa-preview.png',
    url: 'https://marinochoa.com.ar',
    techs: [
      { name: 'React.js', icon: <FaReact color="#61DBFB" /> },
      { name: 'Strapi', icon: <SiStrapi color="#8B5CF6" /> },
      { name: 'Node.js', icon: <FaNodeJs color="#3C873A" /> },
      { name: 'CSS3', icon: <FaCss3Alt color="#264de4" /> },
    ],
  },
  {
    title: t('projects.inmove.title', 'Inmove'),
    description: t('projects.inmove.description', 'Sitio web ecommerce para una entrenadora personal reconocida de la ciudad de Córdoba, con un diseño a medida y muy estético. Tiene la posibilidad de comprar planes de entrenamiento y la posibilidad de hacer pedidos de indumentaria deportiva.'),
    image: '/portfolio-teo/maquifit/hero.png',
    url: 'https://inmove.com.ar/maquifit',
    techs: [
      { name: 'React.js', icon: <FaReact color="#61DBFB" /> },
      { name: 'Strapi', icon: <SiStrapi color="#8B5CF6" /> },
      { name: 'Node.js', icon: <FaNodeJs color="#3C873A" /> },
      { name: 'JavaScript', icon: <SiJavascript color="#F7DF1E" /> },
    ],
  },
  {
    title: t('projects.comber.title', 'Comber'),
    description: t('projects.comber.description', 'Sitio web integral para empresa enfocada en soluciones de hormigón y servicios de construcción. La plataforma facilita la reserva de turnos para bombeo, venta de hormigón elaborado y la gestión de servicios especializados como impermeabilización, pintura y reparaciones.'),
    image: '/portfolio/comber-preview.png',
    url: 'https://comber.surcodes.com',
    techs: [
      { name: 'React.js', icon: <FaReact color="#61DBFB" /> },
      { name: 'Strapi', icon: <SiStrapi color="#8B5CF6" /> },
      { name: 'Node.js', icon: <FaNodeJs color="#3C873A" /> },
      { name: 'JavaScript', icon: <SiJavascript color="#F7DF1E" /> },
    ],
  },
  {
    title: t('projects.tresnoches.title', 'Tres Noches'),
    description: t('projects.tresnoches.description', 'Sitio web para Tres Noches, productora audiovisual que transforma narrativas en proyectos de impacto territorial. Destaca su enfoque en documentales que se convierten en infraestructura cultural, como corsódromos y barrios temáticos.'),
    image: '/portfolio/tresnoches-preview.png',
    url: 'https://tresnoches.com.ar',
    techs: [
      { name: 'React.js', icon: <FaReact color="#61DBFB" /> },
      { name: 'Strapi', icon: <SiStrapi color="#8B5CF6" /> },
      { name: 'Node.js', icon: <FaNodeJs color="#3C873A" /> },
      { name: 'JavaScript', icon: <SiJavascript color="#F7DF1E" /> },
    ],
  },
  {
    title: t('projects.joycof.title', 'Joycof Make-Up'),
    description: t('projects.joycof.description', 'Sitio web personalizado para una artista del maquillaje profesional, con diseño visual atractivo, enfoque en la identidad de marca, y secciones dinámicas para portfolio, servicios y contacto. Totalmente administrable desde WordPress.'),
    image: "/portfolio-teo/previewSites/joycof.png",
    url: 'https://joycofmakeup.com/',
    techs: [
      { name: 'WordPress', icon: <FaWordpress color="#21759B" /> },
      { name: 'CSS3', icon: <FaCss3Alt color="#264de4" /> },
    ],
  },
  {
    title: t('projects.nhestetica.title', 'NhEstetica'),
    description: t('projects.nhestetica.description', 'Sitio web profesional para centro de estética, con presentación de servicios, turnos online, galería de resultados y testimonios de clientes. Diseño moderno y enfoque en la confianza y el bienestar.'),
    image: '/portfolio/nh.png',
    url: 'http://nhestetica.com/',
    techs: [
      { name: 'React.js', icon: <FaReact color="#61DBFB" /> },
      { name: 'Node.js', icon: <FaNodeJs color="#3C873A" /> },
      { name: 'MySQL', icon: <FaDatabase color="#00758F" /> },
    ],
  },
  {
    title: t('projects.sada.title', 'Sistema Aéreo de Detección Argentino'),
    description: t('projects.sada.description', 'S.A.D.A. nació para optimizar la detección y gestión de avistamientos de aeronaves no autorizadas en el espacio aéreo argentino. Durante la fase de conceptualización, se definieron requerimientos y protocolos seguros, creando una solución robusta y escalable.'),
    image: '/portfolio/sada.png',
    techs: [
      { name: 'Node.js', icon: <FaNodeJs color="#3C873A" /> },
      { name: 'JavaScript', icon: <FaJs color="#F7DF1E" /> },
      { name: 'MySQL', icon: <FaDatabase color="#00758F" /> },
      { name: 'Express', icon: <FaDatabase color="#00758F" /> },
    ],
  },
  {
    title: t('projects.unavidamejor.title', 'Una Vida Mejor'),
    description: t('projects.unavidamejor.description', 'Sitio web institucional para una iglesia orientada a jóvenes, con un diseño moderno y atractivo. Su propósito es inspirar, motivar y promover el bienestar personal, el desarrollo humano y el crecimiento espiritual.'),
    image: '/portfolio/unavidamejorsurcode.jpg',
    url: 'http://unavidamejor.com.ar/',
    icon: '/portfolio/logounavidamejor.png',
    techs: [
      { name: 'HTML5', icon: <FaHtml5 color="#E34F26" /> },
      { name: 'CSS3', icon: <FaCss3Alt color="#264de4" /> },
      { name: 'WordPress', icon: <FaWordpress color="#21759B" /> },
    ],
  },
];

// Default export for backward compatibility (uses Spanish)
const cardsPortfolio = [
  {
    title: 'Vinotipia',
    description: 'E-commerce de vinos premium con catálogo dinámico, pasarela de pagos segura y panel de administración para gestión de productos y ventas. Diseño elegante y experiencia de usuario optimizada para amantes del vino.',
    image: '/portfolio/vinotipia.png',
    url: 'https://vinotipia.com',
    techs: [
      { name: 'React.js', icon: <FaReact color="#61DBFB" /> },
      { name: 'WordPress', icon: <FaWordpress color="#21759B" /> },
    ],
  },
  {
    title: 'Comber',
    description: 'Sitio web integral para COMBER, empresa líder en soluciones de hormigón y servicios de construcción. La plataforma facilita la reserva de turnos para bombeo, venta de hormigón elaborado y la gestión de servicios especializados como impermeabilización, pintura y reparaciones.',
    image: '/portfolio/comber-preview.png',
    url: 'https://comber.surcodes.com.ar',
    techs: [
      { name: 'React.js', icon: <FaReact color="#61DBFB" /> },
      { name: 'Strapi', icon: <SiStrapi color="#8B5CF6" /> },
      { name: 'Node.js', icon: <FaNodeJs color="#3C873A" /> },
      { name: 'JavaScript', icon: <SiJavascript color="#F7DF1E" /> },
    ],
  },
  {
    title: 'Tres Noches',
    description: 'Sitio web para Tres Noches, productora audiovisual que transforma narrativas en proyectos de impacto territorial. Destaca su enfoque en documentales que se convierten en infraestructura cultural, como corsódromos y barrios temáticos.',
    image: '/portfolio/tresnoches-preview.png',
    url: 'https://tresnoches.com.ar',
    techs: [
      { name: 'React.js', icon: <FaReact color="#61DBFB" /> },
      { name: 'Strapi', icon: <SiStrapi color="#8B5CF6" /> },
      { name: 'Node.js', icon: <FaNodeJs color="#3C873A" /> },
      { name: 'JavaScript', icon: <SiJavascript color="#F7DF1E" /> },
    ],
  },
  {
    title: 'Inmove',
    description: 'Sitio web ecommerce para una entrenadora personal reconocida de la ciudad de Córdoba, con un diseño a medida y muy estético. Tiene la posibilidad de comprar planes de entrenamiento y la posibilidad de hacer pedidos de indumentaria deportiva.',
    image: '/portfolio-teo/maquifit/hero.png',
    url: 'https://inmove.com.ar/',
    techs: [
      { name: 'React.js', icon: <FaReact color="#61DBFB" /> },
      { name: 'Strapi', icon: <SiStrapi color="#8B5CF6" /> },
      { name: 'Node.js', icon: <FaNodeJs color="#3C873A" /> },
      { name: 'JavaScript', icon: <SiJavascript color="#F7DF1E" /> },
    ],
  },
  {
    title: 'Joycof Make-Up',
    description: 'Sitio web personalizado para una artista del maquillaje profesional, con diseño visual atractivo, enfoque en la identidad de marca, y secciones dinámicas para portfolio, servicios y contacto. Totalmente administrable desde WordPress.',
    image: "/portfolio-teo/previewSites/joycof.png",
    url: 'https://joycofmakeup.com/',
    techs: [
      { name: 'WordPress', icon: <FaWordpress color="#21759B" /> },
      { name: 'CSS3', icon: <FaCss3Alt color="#264de4" /> },
    ],
  },
  {
    title: 'NhEstetica',
    description: 'Sitio web profesional para centro de estética, con presentación de servicios, turnos online, galería de resultados y testimonios de clientes. Diseño moderno y enfoque en la confianza y el bienestar.',
    image: '/portfolio/nh.png',
    url: 'http://ugks4ckw4gcoc4g8g000sgcw.31.97.83.15.sslip.io/',
    techs: [
      { name: 'React.js', icon: <FaReact color="#61DBFB" /> },
      { name: 'Node.js', icon: <FaNodeJs color="#3C873A" /> },
      { name: 'MySQL', icon: <FaDatabase color="#00758F" /> },
    ],
  },
  {
    title: 'Sistema Aéreo de Detección Argentino',
    description: 'S.A.D.A. nació para optimizar la detección y gestión de avistamientos de aeronaves no autorizadas en el espacio aéreo argentino. Durante la fase de conceptualización, se definieron requerimientos y protocolos seguros, creando una solución robusta y escalable.',
    image: '/portfolio/sada.png',
    techs: [
      { name: 'Node.js', icon: <FaNodeJs color="#3C873A" /> },
      { name: 'JavaScript', icon: <FaJs color="#F7DF1E" /> },
      { name: 'MySQL', icon: <FaDatabase color="#00758F" /> },
      { name: 'Express', icon: <FaDatabase color="#00758F" /> },
    ],
  },
  {
    title: 'Una Vida Mejor',
    description: 'Sitio web institucional para una iglesia orientada a jóvenes, con un diseño moderno y atractivo. Su propósito es inspirar, motivar y promover el bienestar personal, el desarrollo humano y el crecimiento espiritual.',
    image: '/portfolio/unavidamejorsurcode.jpg',
    url: 'http://unavidamejor.com.ar/',
    icon: '/portfolio/logounavidamejor.png',
    techs: [
      { name: 'HTML5', icon: <FaHtml5 color="#E34F26" /> },
      { name: 'CSS3', icon: <FaCss3Alt color="#264de4" /> },
      { name: 'WordPress', icon: <FaWordpress color="#21759B" /> },
    ],
  },
];

export default cardsPortfolio;