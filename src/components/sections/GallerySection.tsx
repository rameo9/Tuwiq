'use client';

import React, { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { X, ZoomIn, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

type CmsGalleryRow = {
  id: number;
  src: string;
  titleAr: string;
  titleEn: string;
  category: string;
  size: string;
};

export default function GallerySection({
  cmsGallery,
}: {
  cmsGallery: CmsGalleryRow[];
}) {
  const { t, language, direction } = useLanguage();
  const { colors } = useTheme();
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [hoveredImage, setHoveredImage] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  const galleryImages = useMemo(
    () =>
      cmsGallery.map((g) => ({
        id: g.id,
        src: g.src,
        title: { ar: g.titleAr, en: g.titleEn },
        size: g.size || 'medium',
      })),
    [cmsGallery],
  );

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.5, 1, 1, 0.5]);

  const currentImageIndex = selectedImage !== null 
    ? galleryImages.findIndex(img => img.id === selectedImage)
    : -1;

  const navigateImage = (dir: 'prev' | 'next') => {
    if (currentImageIndex === -1) return;
    
    let newIndex;
    if (dir === 'prev') {
      newIndex = currentImageIndex === 0 ? galleryImages.length - 1 : currentImageIndex - 1;
    } else {
      newIndex = currentImageIndex === galleryImages.length - 1 ? 0 : currentImageIndex + 1;
    }
    setSelectedImage(galleryImages[newIndex].id);
  };

  return (
    <section ref={sectionRef} id="gallery" className="relative py-32 overflow-hidden">
      {/* Animated Background */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-b from-slate-100 via-slate-200 to-slate-100 dark:from-dark-950 dark:via-dark-900 dark:to-dark-950"
        style={{ y: backgroundY }}
      />

      {/* Animated Gradient Orbs */}
      <motion.div
        className="absolute top-1/4 left-0 w-[600px] h-[600px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 70%)',
          opacity,
        }}
        animate={{
          x: [0, 50, 0],
          y: [0, -30, 0],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-1/4 right-0 w-[500px] h-[500px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(212,175,55,0.06) 0%, transparent 70%)',
          opacity,
        }}
        animate={{
          x: [0, -50, 0],
          y: [0, 30, 0],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="container mx-auto px-6 relative z-10">
        {/* Header with Epic Animation */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <motion.span 
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-gold-500/20 to-gold-600/10 text-gold-400 text-sm font-semibold mb-6 border border-gold-500/20"
              whileHover={{ scale: 1.05 }}
              animate={{
                boxShadow: [
                  '0 0 20px rgba(212,175,55,0)',
                  '0 0 40px rgba(212,175,55,0.3)',
                  '0 0 20px rgba(212,175,55,0)',
                ],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Sparkles className="w-4 h-4" />
              {t('gallery.subtitle')}
            </motion.span>
          </motion.div>
          
          <motion.h2 
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {t('gallery.title')}
          </motion.h2>
        </div>

        {/* Masonry Grid with Advanced Animations */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {galleryImages.map((image, index) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, y: 100, rotateX: -30 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ 
                delay: index * 0.1, 
                duration: 0.8,
                type: 'spring',
                stiffness: 100,
              }}
              className={`relative rounded-3xl overflow-hidden cursor-pointer group ${
                image.size === 'large' 
                  ? 'col-span-2 row-span-2' 
                  : image.size === 'medium' 
                    ? 'col-span-2' 
                    : ''
              }`}
              onClick={() => setSelectedImage(image.id)}
              onMouseEnter={() => setHoveredImage(image.id)}
              onMouseLeave={() => setHoveredImage(null)}
              style={{ transformPerspective: 1000 }}
            >
              <motion.div 
                className={`relative ${
                  image.size === 'large' 
                    ? 'aspect-square' 
                    : image.size === 'medium' 
                      ? 'aspect-video' 
                      : 'aspect-square'
                }`}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                {/* Image with Advanced Hover Effect */}
                <motion.img
                  src={image.src}
                  alt={image.title[language]}
                  className="w-full h-full object-cover"
                  animate={{
                    scale: hoveredImage === image.id ? 1.15 : 1,
                    filter: hoveredImage === image.id ? 'brightness(0.7)' : 'brightness(1)',
                  }}
                  transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                />
                
                {/* Gradient Overlay */}
                <motion.div 
                  className="absolute inset-0"
                  animate={{
                    background: hoveredImage === image.id 
                      ? 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(212,175,55,0.3) 100%)'
                      : 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.3) 100%)',
                  }}
                  transition={{ duration: 0.4 }}
                />
                
                {/* Content with Staggered Animation */}
                <motion.div
                  className="absolute inset-0 flex flex-col items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ 
                    opacity: hoveredImage === image.id ? 1 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Animated Zoom Icon */}
                  <motion.div
                    className="w-16 h-16 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center mb-4 shadow-lg shadow-gold-500/30"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ 
                      scale: hoveredImage === image.id ? 1 : 0,
                      rotate: hoveredImage === image.id ? 0 : -180,
                    }}
                    transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
                    whileHover={{ scale: 1.2 }}
                  >
                    <ZoomIn className="w-7 h-7 text-dark-900" />
                  </motion.div>
                  
                  {/* Title with Slide Animation */}
                  <motion.p 
                    className="text-white font-bold text-xl text-center px-4"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ 
                      y: hoveredImage === image.id ? 0 : 20,
                      opacity: hoveredImage === image.id ? 1 : 0,
                    }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                  >
                    {image.title[language]}
                  </motion.p>

                  {/* Subtitle */}
                  <motion.p 
                    className="text-gold-400 text-sm mt-2"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ 
                      y: hoveredImage === image.id ? 0 : 20,
                      opacity: hoveredImage === image.id ? 1 : 0,
                    }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                  >
                    {language === 'ar' ? 'انقر للعرض' : 'Click to view'}
                  </motion.p>
                </motion.div>

                {/* Animated Border */}
                <motion.div
                  className="absolute inset-0 rounded-3xl"
                  animate={{
                    boxShadow: hoveredImage === image.id 
                      ? 'inset 0 0 0 3px rgba(212,175,55,0.8)'
                      : 'inset 0 0 0 0px rgba(212,175,55,0)',
                  }}
                  transition={{ duration: 0.3 }}
                />

                {/* Corner Decorations */}
                <motion.div
                  className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-gold-500 rounded-tl-lg"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: hoveredImage === image.id ? 1 : 0,
                    opacity: hoveredImage === image.id ? 1 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                />
                <motion.div
                  className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-gold-500 rounded-tr-lg"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: hoveredImage === image.id ? 1 : 0,
                    opacity: hoveredImage === image.id ? 1 : 0,
                  }}
                  transition={{ duration: 0.3, delay: 0.05 }}
                />
                <motion.div
                  className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-gold-500 rounded-bl-lg"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: hoveredImage === image.id ? 1 : 0,
                    opacity: hoveredImage === image.id ? 1 : 0,
                  }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                />
                <motion.div
                  className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-gold-500 rounded-br-lg"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: hoveredImage === image.id ? 1 : 0,
                    opacity: hoveredImage === image.id ? 1 : 0,
                  }}
                  transition={{ duration: 0.3, delay: 0.15 }}
                />
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-xl dark:bg-dark-950/95"
            onClick={() => setSelectedImage(null)}
          >
            {/* Close Button */}
            <motion.button
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="absolute top-6 right-6 p-3 rounded-full glass hover:bg-white/10 transition-colors z-10"
              onClick={() => setSelectedImage(null)}
            >
              <X className="w-6 h-6 text-white" />
            </motion.button>

            {/* Navigation Buttons */}
            <motion.button
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="absolute left-6 top-1/2 -translate-y-1/2 p-4 rounded-full glass hover:bg-white/10 transition-colors z-10"
              onClick={(e) => {
                e.stopPropagation();
                navigateImage('prev');
              }}
            >
              <ChevronLeft className="w-8 h-8 text-white" />
            </motion.button>

            <motion.button
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className="absolute right-6 top-1/2 -translate-y-1/2 p-4 rounded-full glass hover:bg-white/10 transition-colors z-10"
              onClick={(e) => {
                e.stopPropagation();
                navigateImage('next');
              }}
            >
              <ChevronRight className="w-8 h-8 text-white" />
            </motion.button>

            {/* Image */}
            <motion.div
              key={selectedImage}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: 'spring', damping: 25 }}
              className="relative max-w-5xl max-h-[80vh] mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={galleryImages.find(img => img.id === selectedImage)?.src}
                alt=""
                className="max-w-full max-h-[80vh] object-contain rounded-2xl"
              />
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="absolute bottom-4 left-4 right-4 glass rounded-xl p-4"
              >
                <p className="text-white font-medium text-center">
                  {galleryImages.find(img => img.id === selectedImage)?.title[language]}
                </p>
              </motion.div>
            </motion.div>

            {/* Thumbnails */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto max-w-full px-4"
            >
              {galleryImages.map((image) => (
                <motion.button
                  key={image.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImage(image.id);
                  }}
                  className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 transition-all duration-300 ${
                    selectedImage === image.id
                      ? 'ring-2 ring-gold-500 scale-110'
                      : 'opacity-50 hover:opacity-100'
                  }`}
                  whileHover={{ scale: 1.1 }}
                >
                  <img
                    src={image.src}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </motion.button>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
