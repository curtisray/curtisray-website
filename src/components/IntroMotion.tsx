import {motion} from 'motion/react';

export default function IntroMotion() {
  return (
    <motion.p
      className="eyebrow"
      initial={{opacity: 0, y: 12}}
      animate={{opacity: 1, y: 0}}
      transition={{duration: 0.55, ease: [0.22, 1, 0.36, 1]}}
    >
      Independent designer &amp; developer
    </motion.p>
  );
}
