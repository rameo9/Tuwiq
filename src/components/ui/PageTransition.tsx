'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

interface PageTransitionProps {
  children: React.ReactNode;
}

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98,
  },
  enter: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94],
      when: 'beforeChildren',
      staggerChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 1.02,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

const overlayVariants = {
  initial: { scaleY: 1 },
  enter: { 
    scaleY: 0,
    transition: {
      duration: 0.8,
      ease: [0.76, 0, 0.24, 1],
    }
  },
  exit: { 
    scaleY: 1,
    transition: {
      duration: 0.8,
      ease: [0.76, 0, 0.24, 1],
    }
  },
};

export default function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div key={pathname}>
        {/* Page Transition Overlay */}
        <motion.div
          className="fixed inset-0 bg-gradient-to-b from-gold-500 to-gold-600 origin-top z-[9999] pointer-events-none"
          variants={overlayVariants}
          initial="initial"
          animate="enter"
          exit="exit"
        />
        <motion.div
          className="fixed inset-0 bg-dark-950 origin-bottom z-[9998] pointer-events-none"
          initial={{ scaleY: 1 }}
          animate={{ 
            scaleY: 0,
            transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1], delay: 0.1 }
          }}
          exit={{ 
            scaleY: 1,
            transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] }
          }}
        />
        
        {/* Page Content */}
        <motion.div
          variants={pageVariants}
          initial="initial"
          animate="enter"
          exit="exit"
        >
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export function SectionTransition({ 
  children, 
  className = '',
  delay = 0 
}: { 
  children: React.ReactNode; 
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 100, rotateX: -15 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{
        duration: 0.8,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      style={{ transformPerspective: 1000 }}
    >
      {children}
    </motion.div>
  );
}
