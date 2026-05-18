'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MorphingTextProps {
  texts: string[];
  className?: string;
  interval?: number;
}

export default function MorphingText({ texts, className = '', interval = 3000 }: MorphingTextProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % texts.length);
    }, interval);

    return () => clearInterval(timer);
  }, [texts.length, interval]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <AnimatePresence mode="wait">
        <motion.span
          key={currentIndex}
          initial={{ y: 50, opacity: 0, rotateX: -90 }}
          animate={{ y: 0, opacity: 1, rotateX: 0 }}
          exit={{ y: -50, opacity: 0, rotateX: 90 }}
          transition={{ 
            duration: 0.5, 
            ease: [0.25, 0.46, 0.45, 0.94] 
          }}
          className="inline-block"
          style={{ transformOrigin: 'center bottom' }}
        >
          {texts[currentIndex]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

export function TypewriterText({ 
  text, 
  className = '',
  speed = 50,
  delay = 0 
}: { 
  text: string; 
  className?: string;
  speed?: number;
  delay?: number;
}) {
  const [displayText, setDisplayText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      let index = 0;
      const timer = setInterval(() => {
        if (index < text.length) {
          setDisplayText(text.slice(0, index + 1));
          index++;
        } else {
          setIsComplete(true);
          clearInterval(timer);
        }
      }, speed);

      return () => clearInterval(timer);
    }, delay);

    return () => clearTimeout(timeout);
  }, [text, speed, delay]);

  return (
    <span className={className}>
      {displayText}
      {!isComplete && (
        <motion.span
          className="inline-block w-0.5 h-[1em] bg-gold-400 ml-1"
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        />
      )}
    </span>
  );
}

export function GlitchText({ text, className = '' }: { text: string; className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <span className="relative z-10">{text}</span>
      <motion.span
        className="absolute inset-0 text-red-500 opacity-70"
        animate={{
          x: [-2, 2, -2],
          opacity: [0.7, 0.3, 0.7],
        }}
        transition={{ duration: 0.2, repeat: Infinity }}
        style={{ clipPath: 'inset(0 0 50% 0)' }}
      >
        {text}
      </motion.span>
      <motion.span
        className="absolute inset-0 text-cyan-500 opacity-70"
        animate={{
          x: [2, -2, 2],
          opacity: [0.7, 0.3, 0.7],
        }}
        transition={{ duration: 0.2, repeat: Infinity, delay: 0.1 }}
        style={{ clipPath: 'inset(50% 0 0 0)' }}
      >
        {text}
      </motion.span>
    </div>
  );
}

export function WaveText({ text, className = '' }: { text: string; className?: string }) {
  return (
    <span className={className}>
      {text.split('').map((char, index) => (
        <motion.span
          key={index}
          className="inline-block"
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: index * 0.05,
            ease: 'easeInOut',
          }}
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </span>
  );
}
