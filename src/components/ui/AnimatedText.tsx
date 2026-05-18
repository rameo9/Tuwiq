'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedTextProps {
  text: string;
  className?: string;
  delay?: number;
  type?: 'words' | 'chars' | 'lines';
}

export default function AnimatedText({ 
  text, 
  className = '', 
  delay = 0,
  type = 'words' 
}: AnimatedTextProps) {
  const splitText = () => {
    if (type === 'chars') {
      return text.split('');
    } else if (type === 'lines') {
      return text.split('\n');
    }
    return text.split(' ');
  };

  const items = splitText();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: type === 'chars' ? 0.02 : 0.08,
        delayChildren: delay,
      },
    },
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 50,
      rotateX: -90,
    },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        type: 'spring',
        damping: 12,
        stiffness: 100,
      },
    },
  };

  return (
    <motion.div
      className={`overflow-hidden ${className}`}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      style={{ perspective: '1000px' }}
    >
      {items.map((item, index) => (
        <motion.span
          key={index}
          variants={itemVariants}
          className="inline-block"
          style={{ transformOrigin: 'center bottom' }}
        >
          {item}
          {type === 'words' && index < items.length - 1 ? '\u00A0' : ''}
        </motion.span>
      ))}
    </motion.div>
  );
}

export function RevealText({ 
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
      className={`overflow-hidden ${className}`}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay }}
    >
      <motion.div
        initial={{ y: '100%' }}
        whileInView={{ y: 0 }}
        viewport={{ once: true }}
        transition={{ 
          delay,
          duration: 0.8, 
          ease: [0.16, 1, 0.3, 1] 
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

export function FadeInUp({ 
  children, 
  className = '', 
  delay = 0,
  duration = 0.6 
}: { 
  children: React.ReactNode; 
  className?: string;
  delay?: number;
  duration?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ 
        delay,
        duration,
        ease: [0.16, 1, 0.3, 1]
      }}
    >
      {children}
    </motion.div>
  );
}

export function ScaleIn({ 
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
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ 
        delay,
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1]
      }}
    >
      {children}
    </motion.div>
  );
}

export function SlideIn({ 
  children, 
  className = '', 
  delay = 0,
  direction = 'left'
}: { 
  children: React.ReactNode; 
  className?: string;
  delay?: number;
  direction?: 'left' | 'right' | 'up' | 'down';
}) {
  const directionOffset = {
    left: { x: -100, y: 0 },
    right: { x: 100, y: 0 },
    up: { x: 0, y: -100 },
    down: { x: 0, y: 100 },
  };

  return (
    <motion.div
      className={className}
      initial={{ 
        opacity: 0, 
        x: directionOffset[direction].x,
        y: directionOffset[direction].y 
      }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ 
        delay,
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1]
      }}
    >
      {children}
    </motion.div>
  );
}
