'use client';

import React from 'react';
import { motion } from 'framer-motion';

export function FloatingOrbs() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Large Orb 1 */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(212,175,55,0.15) 0%, transparent 70%)',
          top: '10%',
          left: '-10%',
        }}
        animate={{
          x: [0, 100, 0],
          y: [0, 50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Large Orb 2 */}
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(212,175,55,0.1) 0%, transparent 70%)',
          bottom: '10%',
          right: '-10%',
        }}
        animate={{
          x: [0, -80, 0],
          y: [0, -60, 0],
          scale: [1.2, 1, 1.2],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Small Floating Shapes */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            width: 20 + i * 10,
            height: 20 + i * 10,
            borderRadius: i % 2 === 0 ? '50%' : '30%',
            border: '1px solid rgba(212,175,55,0.2)',
            top: `${15 + i * 15}%`,
            left: `${10 + i * 15}%`,
          }}
          animate={{
            y: [0, -30, 0],
            rotate: [0, 180, 360],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 5 + i * 2,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.5,
          }}
        />
      ))}
    </div>
  );
}

export function GridBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 opacity-30">
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(212,175,55,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(212,175,55,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px',
        }}
      />
      {/* Animated Scan Line */}
      <motion.div
        className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/30 to-transparent"
        animate={{ y: ['0vh', '100vh'] }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </div>
  );
}

export function NoiseOverlay() {
  return (
    <div 
      className="fixed inset-0 pointer-events-none z-[1] opacity-[0.03]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
      }}
    />
  );
}

export function GlowingBorder({ className = '' }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <motion.div
        className="absolute inset-0 rounded-3xl"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.5), transparent)',
          backgroundSize: '200% 100%',
        }}
        animate={{
          backgroundPosition: ['200% 0', '-200% 0'],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </div>
  );
}

export function SpotlightEffect() {
  return (
    <motion.div
      className="fixed inset-0 pointer-events-none z-0"
      style={{
        background: 'radial-gradient(circle at 50% 50%, transparent 0%, rgba(0,0,0,0.5) 100%)',
      }}
      animate={{
        background: [
          'radial-gradient(circle at 30% 30%, transparent 0%, rgba(0,0,0,0.4) 100%)',
          'radial-gradient(circle at 70% 70%, transparent 0%, rgba(0,0,0,0.4) 100%)',
          'radial-gradient(circle at 30% 70%, transparent 0%, rgba(0,0,0,0.4) 100%)',
          'radial-gradient(circle at 70% 30%, transparent 0%, rgba(0,0,0,0.4) 100%)',
          'radial-gradient(circle at 30% 30%, transparent 0%, rgba(0,0,0,0.4) 100%)',
        ],
      }}
      transition={{
        duration: 20,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
}
