import { useReducedMotionPreference } from '../design/useReducedMotionPreference';
import { useRef } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from 'motion/react';

function Line({
  index,
  progress,
}: {
  index: number;
  progress: MotionValue<number>;
}) {
  const y = useTransform(
    progress,
    (value) => `${index * 7.5 * Math.pow(1 - value, 1.6)}vh`,
  );
  return <motion.span style={{ y }} />;
}

export default function FooterLines() {
  const target = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotionPreference();
  const { scrollYProgress } = useScroll({
    target,
    offset: ['start end', 'start start'],
  });
  return (
    <div ref={target} className="footer-lines" aria-hidden="true">
      {!reducedMotion &&
        Array.from({ length: 12 }, (_, index) => (
          <Line key={index} index={index} progress={scrollYProgress} />
        ))}
    </div>
  );
}
