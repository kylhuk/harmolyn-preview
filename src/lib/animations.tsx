
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import React from 'react';

// ── Shared transition presets ──────────────────────────────────────

export const spring = { type: 'spring' as const, stiffness: 300, damping: 30 };
export const easeOut = { duration: 0.25, ease: [0.16, 1, 0.3, 1] as const };

// ── Variant sets ───────────────────────────────────────────────────

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: easeOut },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92, y: 12 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { ...easeOut, duration: 0.3 } },
  exit: { opacity: 0, scale: 0.95, y: 8, transition: { duration: 0.18 } },
};

export const slideInRight: Variants = {
  hidden: { x: '100%', opacity: 0 },
  visible: { x: 0, opacity: 1, transition: spring },
  exit: { x: '100%', opacity: 0, transition: { duration: 0.2 } },
};

export const slideInLeft: Variants = {
  hidden: { x: '-100%', opacity: 0 },
  visible: { x: 0, opacity: 1, transition: spring },
  exit: { x: '-100%', opacity: 0, transition: { duration: 0.2 } },
};

export const slideInUp: Variants = {
  hidden: { y: '100%', opacity: 0 },
  visible: { y: 0, opacity: 1, transition: spring },
  exit: { y: '100%', opacity: 0, transition: { duration: 0.2 } },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04 } },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: easeOut },
};

// ── Wrapper components ─────────────────────────────────────────────

/** Full-screen overlay with backdrop blur + centered modal */
export const ModalOverlay: React.FC<{
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}> = ({ children, onClose, className = '' }) => (
  <motion.div
    className={`fixed inset-0 z-[110] bg-bg-0/90 backdrop-blur-xl flex items-center justify-center p-4 ${className}`}
    variants={fadeIn}
    initial="hidden"
    animate="visible"
    exit="exit"
    onClick={onClose}
  >
    <motion.div
      variants={scaleIn}
      initial="hidden"
      animate="visible"
      exit="exit"
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </motion.div>
  </motion.div>
);

/** Full-screen takeover (settings, server settings) */
export const FullScreenOverlay: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <motion.div
    className={`absolute inset-0 z-[100] ${className}`}
    initial={{ opacity: 0, scale: 0.97 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.97 }}
    transition={easeOut}
  >
    {children}
  </motion.div>
);

export { motion, AnimatePresence };
