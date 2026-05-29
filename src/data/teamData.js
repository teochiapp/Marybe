// Datos de las personas del equipo
export const people = [
  {
    name: "Teo Chiappero",
    surname: "Teo",
    description: "Frontend Developer",
    role: "Backend",
    image: "team/Teo.png",
    fullImage: "team/TeoFull.jpg",
    skills: ["React", "JavaScript", "CSS", "Wordpress"],
    social: {
      github: "https://github.com/teochiapp",
      linkedin: "https://www.linkedin.com/in/teo-chiappero/",
      instagram: "https://www.instagram.com/teochiappero/"
    },
    bio: "Perfil versátil y mentalidad resolutiva. Me especializo en interfaces modernas con React, con experiencia en backends Node.js, MySQL y WordPress. Valoro el código limpio, la usabilidad y el diseño funcional. Siempre busco aprender y optimizar cada proyecto.",
    stats: {
      experience: "3+",
      projects: "20+"
    }
  },
  {
    name: "Tomás Cejas",
    surname: "Toto",
    description: "Fullstack Developer",
    role: "Frontend",
    image: "team/tomas-ia-nobg.png",
    fullImage: "team/tomas-ia.jpeg",
    skills: ["Node.js", "Docker", "MySQL", "React"],
    social: {
      github: "https://github.com/toto-rcv",
      linkedin: "https://www.linkedin.com/in/tomas-cejas/",
      instagram: "https://www.instagram.com/toto_rcv/"
    },
    bio: "Profesional del desarrollo con experiencia en tecnologías actuales, comprometido con la construcción de productos digitales intuitivos y funcionales.",
    stats: {
      experience: "2+",
      projects: "15+"
    }
  }
];

// Skills para el marquee
export const skills = [
  "React", "Node.js", "Docker", "MySQL",
  "Wordpress", "Figma", "Illustrator", "Photoshop"
];

// Configuración de roles y sus iconos
export const roleConfig = {
  frontend: {
    icon: "FaCode",
    level: "Mid",
    color: "var(--secondary-color)"
  },
  fullstack: {
    icon: "FaLaptopCode",
    level: "Senior",
    color: "var(--primary-cyan)"
  },
  "ux/ui": {
    icon: "FaPalette",
    level: "Expert",
    color: "var(--accent-color)"
  },
  designer: {
    icon: "FaPalette",
    level: "Expert",
    color: "var(--accent-color)"
  }
};

// Helper function to get translated team data
export const getTeamData = (t) => [
  {
    name: "Teo Chiappero",
    surname: "Teo",
    description: t('team.members.teo.description', "Frontend Developer"),
    role: "Frontend",
    image: "team/Teo.png",
    fullImage: "team/TeoFull.jpg",
    skills: ["React", "JavaScript", "CSS", "Wordpress"],
    social: {
      github: "https://github.com/teochiapp",
      linkedin: "https://www.linkedin.com/in/teo-chiappero/",
      instagram: "https://www.instagram.com/teochiappero/"
    },
    bio: t('team.members.teo.bio', "Perfil versátil y mentalidad resolutiva. Me especializo en interfaces modernas con React, con experiencia en backends Node.js, MySQL y WordPress. Valoro el código limpio, la usabilidad y el diseño funcional. Siempre busco aprender y optimizar cada proyecto."),
    stats: {
      experience: "3+",
      projects: "20+"
    }
  },
  {
    name: "Tomás Cejas",
    surname: "Toto",
    description: t('team.members.tomas.description', "Fullstack Developer"),
    role: "Fullstack",
    image: "team/tomas-ia-nobg.png",
    fullImage: "team/tomas-ia.jpeg",
    skills: ["Node.js", "Docker", "MySQL", "React"],
    social: {
      github: "https://github.com/toto-rcv",
      linkedin: "https://www.linkedin.com/in/tomas-cejas/",
      instagram: "https://www.instagram.com/toto_rcv/"
    },
    bio: t('team.members.tomas.bio', "Profesional del desarrollo con experiencia en tecnologías actuales, comprometido con la construcción de productos digitales intuitivos y funcionales."),
    stats: {
      experience: "2+",
      projects: "15+"
    }
  }
];

// Configuración de estadísticas (con traducción)
export const getStatsConfig = (t) => ({
  experience: {
    label: t('team.stats.experience', "Años de Experiencia"),
    icon: "FaClock"
  },
  projects: {
    label: t('team.stats.projects', "Proyectos Completados"),
    icon: "FaProjectDiagram"
  },
  satisfaction: {
    label: t('team.stats.satisfaction', "Satisfacción del Cliente"),
    icon: "FaHeart"
  }
});

// Configuración de estadísticas (original para compatibilidad)
export const statsConfig = {
  experience: {
    label: "Años de Experiencia",
    icon: "FaClock"
  },
  projects: {
    label: "Proyectos Completados",
    icon: "FaProjectDiagram"
  },
  satisfaction: {
    label: "Satisfacción del Cliente",
    icon: "FaHeart"
  }
};

// Configuración de colores para gradientes
export const gradientColors = [
  "var(--text-color)",
  "var(--primary-color)",
  "var(--primary-cyan)",
  "var(--accent-color)",
  "var(--text-color)"
];

// Configuración de animación
export const animationConfig = {
  speed: 4,
  showBorder: false
};

// Funciones helper
export const getRoleConfig = (role) => {
  const normalizedRole = role?.toLowerCase();
  return roleConfig[normalizedRole] || roleConfig.frontend;
};

export const getPersonByIndex = (index) => {
  return people[index] || null;
};

export const getTotalPeople = () => {
  return people.length;
};

export const getPersonStats = (person) => {
  return person.stats || {
    experience: "3+",
    projects: "50+",
    satisfaction: "100%"
  };
};

export const getPersonBio = (person) => {
  return person.bio || "Desarrollador apasionado por crear experiencias digitales excepcionales. Especializado en tecnologías modernas y diseño centrado en el usuario.";
};

export const getPersonSkills = (person) => {
  return person.skills || [];
};

export const getPersonSocial = (person) => {
  return person.social || {};
};