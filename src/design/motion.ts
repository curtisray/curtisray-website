/** Calm, deliberate motion. Durations are seconds; CSS variables derive from these values. */
export const motionTokens = {
  quick: 0.16,
  standard: 0.32,
  slow: 0.56,
  ease: [0.2, 0.7, 0.2, 1] as const,
};
export const motionStyle = [
  `--motion-quick:${motionTokens.quick}s`,
  `--motion-standard:${motionTokens.standard}s`,
  `--motion-slow:${motionTokens.slow}s`,
  `--ease-out:cubic-bezier(${motionTokens.ease.join(',')})`,
].join(';');
