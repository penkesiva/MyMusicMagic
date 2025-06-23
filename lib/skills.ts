import {
  FaReact, FaNodeJs, FaPython, FaDocker, FaGitAlt, FaFigma, FaJava, FaSwift,
  FaHtml5, FaCss3Alt, FaJsSquare, FaSass, FaBootstrap, FaWordpress, FaVuejs, FaAngular, FaMicrosoft, FaApple, FaLinux, FaAndroid, FaPhp, FaRust
} from 'react-icons/fa';
import {
  SiTypescript, SiPostgresql, SiMongodb, SiRedis, SiGraphql, SiApollographql,
  SiNextdotjs, SiTailwindcss, SiJest, SiCypress, SiStorybook, SiKubernetes, SiTerraform,
  SiAmazon, SiGooglecloud, SiFirebase, SiSupabase, SiVercel, SiNetlify, SiHeroku, SiDigitalocean,
  SiWebpack, SiVite, SiRedux, SiReactquery, SiExpress, SiDjango, SiFlask, SiRubyonrails, SiLaravel,
  SiKotlin, SiGo, SiCplusplus, SiDotnet, SiSpring, SiQt, SiUnrealengine, SiUnity, SiRuby, SiSharp
} from 'react-icons/si';
import { VscTerminalCmd } from 'react-icons/vsc';

export const SKILLS_LIST = [
  // Frontend
  { name: 'React', icon: FaReact, color: '#61DAFB' },
  { name: 'JavaScript', icon: FaJsSquare, color: '#F7DF1E' },
  { name: 'TypeScript', icon: SiTypescript, color: '#3178C6' },
  { name: 'HTML5', icon: FaHtml5, color: '#E34F26' },
  { name: 'CSS3', icon: FaCss3Alt, color: '#1572B6' },
  { name: 'Next.js', icon: SiNextdotjs, color: '#000000' },
  { name: 'Tailwind CSS', icon: SiTailwindcss, color: '#06B6D4' },
  { name: 'Sass', icon: FaSass, color: '#CC6699' },
  { name: 'Vue.js', icon: FaVuejs, color: '#4FC08D' },
  { name: 'Angular', icon: FaAngular, color: '#DD0031' },
  { name: 'Bootstrap', icon: FaBootstrap, color: '#7952B3' },
  { name: 'Redux', icon: SiRedux, color: '#764ABC' },
  { name: 'React Query', icon: SiReactquery, color: '#FF4154' },
  { name: 'Webpack', icon: SiWebpack, color: '#8DD6F9' },
  { name: 'Vite', icon: SiVite, color: '#646CFF' },

  // Backend
  { name: 'Node.js', icon: FaNodeJs, color: '#339933' },
  { name: 'Python', icon: FaPython, color: '#3776AB' },
  { name: 'Java', icon: FaJava, color: '#007396' },
  { name: 'PHP', icon: FaPhp, color: '#777BB4' },
  { name: 'Ruby', icon: SiRuby, color: '#CC342D' },
  { name: 'Go', icon: SiGo, color: '#00ADD8' },
  { name: 'Rust', icon: FaRust, color: '#000000' },
  { name: 'C++', icon: SiCplusplus, color: '#00599C' },
  { name: 'C#', icon: SiSharp, color: '#239120' },
  { name: '.NET', icon: SiDotnet, color: '#512BD4' },
  { name: 'Express.js', icon: SiExpress, color: '#000000' },
  { name: 'Django', icon: SiDjango, color: '#092E20' },
  { name: 'Flask', icon: SiFlask, color: '#000000' },
  { name: 'Ruby on Rails', icon: SiRubyonrails, color: '#CC0000' },
  { name: 'Laravel', icon: SiLaravel, color: '#FF2D20' },
  { name: 'Spring', icon: SiSpring, color: '#6DB33F' },
  
  // Database
  { name: 'PostgreSQL', icon: SiPostgresql, color: '#4169E1' },
  { name: 'MongoDB', icon: SiMongodb, color: '#47A248' },
  { name: 'Redis', icon: SiRedis, color: '#DC382D' },
  { name: 'GraphQL', icon: SiGraphql, color: '#E10098' },
  { name: 'Apollo', icon: SiApollographql, color: '#311C87' },
  { name: 'Firebase', icon: SiFirebase, color: '#FFCA28' },
  { name: 'Supabase', icon: SiSupabase, color: '#3ECF8E' },

  // Mobile
  { name: 'Swift', icon: FaSwift, color: '#FA7343' },
  { name: 'React Native', icon: FaReact, color: '#61DAFB' },

  // Testing
  { name: 'Jest', icon: SiJest, color: '#C21325' },
  { name: 'Cypress', icon: SiCypress, color: '#17202C' },
  
  // DevOps & Tooling
  { name: 'Git', icon: FaGitAlt, color: '#F05032' },
  { name: 'Docker', icon: FaDocker, color: '#2496ED' },
  { name: 'Kubernetes', icon: SiKubernetes, color: '#326CE5' },
  { name: 'Terraform', icon: SiTerraform, color: '#7B42BC' },
  { name: 'AWS', icon: SiAmazon, color: '#232F3E' },
  { name: 'Google Cloud', icon: SiGooglecloud, color: '#4285F4' },
  { name: 'Azure', icon: FaMicrosoft, color: '#0078D4' },
  { name: 'Vercel', icon: SiVercel, color: '#000000' },
  { name: 'Netlify', icon: SiNetlify, color: '#00C7B7' },
  { name: 'Heroku', icon: SiHeroku, color: '#430098' },
  { name: 'DigitalOcean', icon: SiDigitalocean, color: '#0080FF' },
  { name: 'CLI', icon: VscTerminalCmd, color: '#FFFFFF' },
  
  // Design & Game Dev
  { name: 'Figma', icon: FaFigma, color: '#F24E1E' },
  { name: 'Storybook', icon: SiStorybook, color: '#FF4785' },
  { name: 'WordPress', icon: FaWordpress, color: '#21759B' },
  { name: 'Qt', icon: SiQt, color: '#41CD52' },
  { name: 'Unreal Engine', icon: SiUnrealengine, color: '#313131' },
  { name: 'Unity', icon: SiUnity, color: '#FFFFFF' },

  // OS
  { name: 'Linux', icon: FaLinux, color: '#FCC624' },
  { name: 'macOS', icon: FaApple, color: '#000000' },
  { name: 'Windows', icon: FaMicrosoft, color: '#0078D4' }
]; 