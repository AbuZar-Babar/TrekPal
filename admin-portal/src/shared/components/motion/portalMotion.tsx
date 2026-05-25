import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface PortalTransitionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

const buildTransition = (
  reducedMotion: boolean,
  delay: number,
  y: number,
  scale = 1,
) => {
  if (reducedMotion) {
    return {
      initial: false,
      animate: { opacity: 1, y: 0, scale: 1 },
      exit: { opacity: 1, y: 0, scale: 1 },
      transition: { duration: 0, delay: 0 },
    };
  }

  return {
    initial: { opacity: 0, y, scale },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: Math.min(0, y * -0.45), scale },
    transition: {
      duration: 0.28,
      delay,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  };
};

export const PortalPageTransition = ({
  children,
  className,
  delay = 0,
}: PortalTransitionProps) => {
  const reducedMotion = useReducedMotion() ?? false;
  const transition = buildTransition(reducedMotion, delay, 14, 1);

  return (
    <motion.div
      className={className}
      initial={transition.initial}
      animate={transition.animate}
      exit={transition.exit}
      transition={transition.transition}
    >
      {children}
    </motion.div>
  );
};

export const PortalModalTransition = ({
  children,
  className,
  delay = 0,
}: PortalTransitionProps) => {
  const reducedMotion = useReducedMotion() ?? false;
  const transition = buildTransition(reducedMotion, delay, 18, 0.98);

  return (
    <motion.div
      className={className}
      initial={transition.initial}
      animate={transition.animate}
      exit={transition.exit}
      transition={transition.transition}
    >
      {children}
    </motion.div>
  );
};

export const PortalListItemTransition = ({
  children,
  className,
  delay = 0,
}: PortalTransitionProps) => {
  const reducedMotion = useReducedMotion() ?? false;
  const transition = buildTransition(reducedMotion, delay, 10, 1);

  return (
    <motion.div
      className={className}
      initial={transition.initial}
      animate={transition.animate}
      exit={transition.exit}
      transition={transition.transition}
    >
      {children}
    </motion.div>
  );
};
