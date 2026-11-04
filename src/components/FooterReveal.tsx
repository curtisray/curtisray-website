import { useReducedMotionPreference } from '../design/useReducedMotionPreference';
import { useEffect, useRef } from 'react';
import { footerEntranceProgress } from '../design/motion';
import { useScroll } from 'motion/react';

export default function FooterReveal() {
  const target = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotionPreference();
  const { scrollYProgress } = useScroll({
    target,
    offset: ['start end', 'start start'],
  });
  useEffect(() => {
    const footer = target.current?.closest<HTMLElement>('.site-footer-full');
    if (!footer) return;
    const update = (progress: number) => {
      footer.style.setProperty(
        '--footer-expansion',
        String(reducedMotion ? 1 : footerEntranceProgress(progress)),
      );
    };
    update(scrollYProgress.get());
    const unsubscribe = reducedMotion
      ? () => {}
      : scrollYProgress.on('change', update);
    return () => {
      unsubscribe();
      footer.style.removeProperty('--footer-expansion');
    };
  }, [scrollYProgress, reducedMotion]);
  return <div ref={target} className="footer-reveal" aria-hidden="true" />;
}
