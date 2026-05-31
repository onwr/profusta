export const easeOut = [0.22, 1, 0.36, 1] as const;

export const defaultTransition = {
  duration: 0.5,
  ease: easeOut,
};

export const fastTransition = {
  duration: 0.4,
  ease: easeOut,
};

export const heroTransition = {
  duration: 0.55,
  ease: easeOut,
};

export const staggerTransition = {
  staggerChildren: 0.08,
  delayChildren: 0.06,
};

export const noMotionTransition = {
  duration: 0,
};
