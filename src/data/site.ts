import hydrogenLogo from '../assets/logos/hydrogen.png';
import lenisLogo from '../assets/logos/lenis.png';
import motionLogo from '../assets/logos/motion.png';

export const contact = {
  email: 'curtisraymaloney@gmail.com',
  formEndpoint: 'https://formspree.io/f/xwlvpkjn',
  phone: '+17079928080',
  phoneLabel: '+1 (707) 992-8080',
};

export const developerLinks = [
  { title: 'Tech stack', href: '/tech-stack' },
  { title: 'Agent skills', href: '/agent-skills' },
  { title: 'Artificial intelligence', href: '/artificial-intelligence' },
  { title: 'Open source code', href: '/open-source-code' },
];
export const technologies = {
  astro: { label: 'Astro 7', logo: 'astro.svg' },
  tailwind: { label: 'Tailwind', logo: 'tailwindcss.svg' },
  lenis: { label: 'Lenis', logo: lenisLogo },
  motion: { label: 'Motion', logo: motionLogo },
  shopify: { label: 'Shopify', logo: 'shopify.svg' },
  hydrogen: { label: 'Hydrogen', logo: hydrogenLogo },
  next: { label: 'Next.js', logo: 'nextdotjs.svg' },
  three: { label: 'Three.js', logo: 'threedotjs.svg' },
  vite: { label: 'Vite', logo: 'vite.svg' },
  gsap: { label: 'GSAP', logo: 'gsap.svg' },
  reactRouter: { label: 'React Router', logo: 'reactrouter.svg' },
  vercel: { label: 'Vercel', logo: 'vercel.svg' },
};
export type Technology = keyof typeof technologies;
export const stacks: {
  title: string;
  description: string;
  technologies: Technology[];
}[] = [
  {
    title: 'Ecommerce',
    description:
      'Built for speed and native Shopify integration. A headless Hydrogen storefront deployed on Oxygen, with refined scroll and motion.',
    technologies: ['shopify', 'hydrogen', 'lenis', 'motion'],
  },
  {
    title: 'Portfolio',
    description:
      "Optimized for load time and image quality. Astro's island architecture ships minimal JavaScript, paired with smooth scrolling and lightweight animation.",
    technologies: ['astro', 'tailwind', 'lenis', 'motion'],
  },
  {
    title: 'Experience',
    description:
      'Designed for immersive, interactive work. Real-time 3D and precisely sequenced animation on a performant Next.js foundation.',
    technologies: ['next', 'three', 'gsap'],
  },
];
export const repositories: {
  title: string;
  description: string;
  repo: string;
  liveUrl?: string;
  technologies: Technology[];
}[] = [
  {
    title: 'Hopscotch website',
    description: 'Website for Hopscotch.',
    repo: 'hopscotch-website',
    liveUrl: 'https://hopscotch.servicelab.agency',
    technologies: ['astro', 'vercel'],
  },
  {
    title: 'Curtis Ray website',
    description: 'Source for this portfolio.',
    repo: 'curtisray-website',
    liveUrl: '/open-source-code',
    technologies: ['astro', 'tailwind', 'lenis', 'motion', 'vercel'],
  },
  {
    title: 'Pep Coffee',
    description: 'Shopify storefront built on Hydrogen and hosted on Vercel.',
    repo: 'pep-coffee',
    liveUrl: 'https://pep-coffee.vercel.app',
    technologies: [
      'shopify',
      'hydrogen',
      'reactRouter',
      'tailwind',
      'lenis',
      'vercel',
    ],
  },
  {
    title: 'TensorView',
    description: 'Interactive tool for learning and visualizing tensors.',
    repo: 'tensorview',
    liveUrl: 'https://tensorview.curtisray.me',
    technologies: ['three', 'vite'],
  },
];
