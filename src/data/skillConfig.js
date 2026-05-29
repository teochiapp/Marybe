import { FaReact, FaNodeJs, FaDocker, FaWordpress, FaFigma, FaUsers, FaHashtag } from 'react-icons/fa';
import { SiMysql, SiAdobeillustrator, SiAdobephotoshop, SiJavascript, SiCss3, SiMiro, SiAdobexd, SiPhp, SiDotnet } from 'react-icons/si';

export const SKILL_CONFIG = {
  'react': {
    icon: FaReact,
    color: '#61DAFB',
    label: 'React'
  },
  'node.js': {
    icon: FaNodeJs,
    color: '#339933',
    label: 'Node.js'
  },
  'docker': {
    icon: FaDocker,
    color: '#2496ED',
    label: 'Docker'
  },
  'mysql': {
    icon: SiMysql,
    color: '#4479A1',
    label: 'MySQL'
  },
  'wordpress': {
    icon: FaWordpress,
    color: '#21759B',
    label: 'WordPress'
  },
  'figma': {
    icon: FaFigma,
    color: '#F24E1E',
    label: 'Figma'
  },
  'illustrator': {
    icon: SiAdobeillustrator,
    color: '#FF9A00',
    label: 'Illustrator'
  },
  'photoshop': {
    icon: SiAdobephotoshop,
    color: '#31A8FF',
    label: 'Photoshop'
  },
  'javascript': {
    icon: SiJavascript,
    color: '#F7DF1E',
    label: 'JavaScript'
  },
  'js': {
    icon: SiJavascript,
    color: '#F7DF1E',
    label: 'JavaScript'
  },
  'css': {
    icon: SiCss3,
    color: '#1572B6',
    label: 'CSS'
  },
  'css3': {
    icon: SiCss3,
    color: '#1572B6',
    label: 'CSS'
  },
  'prototyping': {
    icon: FaFigma,
    color: '#F24E1E',
    label: 'Prototyping'
  },
  'user research': {
    icon: FaUsers,
    color: '#4A90E2',
    label: 'User Research'
  },
  'miro': {
    icon: SiMiro,
    color: '#FFD02F',
    label: 'Miro'
  },
  'adobe xd': {
    icon: SiAdobexd,
    color: '#FF61F6',
    label: 'Adobe XD'
  },
  'xd': {
    icon: SiAdobexd,
    color: '#FF61F6',
    label: 'Adobe XD'
  },
  'php': {
    icon: SiPhp,
    color: '#777BB4',
    label: 'PHP'
  },
  'c#': {
    icon: FaHashtag,
    color: '#239120',
    label: 'C#'
  },
  'csharp': {
    icon: FaHashtag,
    color: '#239120',
    label: 'C#'
  }
};

export const getSkillConfig = (skill) => {
  const skillKey = skill.toLowerCase();
  return SKILL_CONFIG[skillKey] || null;
}; 