'use client';

import React from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import Navbar from '@/components/ui/Navbar';
import CursorGlow from '@/components/ui/CursorGlow';
import ParticleBackground from '@/components/ui/ParticleBackground';
import { FloatingOrbs, GridBackground, NoiseOverlay } from '@/components/ui/FloatingElements';
import HeroSection from '@/components/sections/HeroSection';
import AboutSection from '@/components/sections/AboutSection';
import ProjectsSection from '@/components/sections/ProjectsSection';
import GallerySection from '@/components/sections/GallerySection';
import ServicesSection from '@/components/sections/ServicesSection';
import ContactSection from '@/components/sections/ContactSection';
import Footer from '@/components/sections/Footer';
import type { LandingPayload, SitePayload } from '@/lib/cms-read';

export type HomeClientProps = {
  projects: Array<{
    id: number;
    titleAr: string;
    titleEn: string;
    locationAr: string;
    locationEn: string;
    area: string;
    units: string;
    categoryAr: string;
    categoryEn: string;
    mainImageUrl: string;
  }>;
  gallery: Array<{
    id: number;
    src: string;
    titleAr: string;
    titleEn: string;
    category: string;
    size: string;
  }>;
  services: Array<{
    id: number;
    slug: string;
    iconId: string;
    titleAr: string;
    titleEn: string;
    descriptionAr: string;
    descriptionEn: string;
    imageUrl: string;
  }>;
  socialLinks: Array<{ platform: string; url: string }>;
  landing: LandingPayload;
  site: SitePayload;
};

export default function HomeClient(props: HomeClientProps) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const wa = String(props.site.whatsappNumber || '966551234567').replace(/\D/g, '');

  return (
    <main className="relative min-h-screen overflow-hidden animated-gradient">
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600 origin-left z-[100]"
        style={{ scaleX }}
      />

      <ParticleBackground />
      <CursorGlow />
      <FloatingOrbs />
      <GridBackground />
      <NoiseOverlay />

      <Navbar siteName={props.site.siteName} logo={props.site.logo} />

      <HeroSection hero={props.landing.hero} />

      <motion.div
        className="relative h-32 overflow-hidden"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <div className="w-px h-full bg-gradient-to-b from-transparent via-gold-500 to-transparent" />
        </motion.div>
      </motion.div>

      <AboutSection about={props.landing.about} />

      <div className="relative py-20 overflow-hidden">
        <motion.div
          className="absolute left-0 right-0 h-px top-1/2"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.5), transparent)',
          }}
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5 }}
        />
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-gold-500"
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
        />
      </div>

      <ProjectsSection cmsProjects={props.projects} />
      <GallerySection cmsGallery={props.gallery} />
      <ServicesSection cmsServices={props.services} />
      <ContactSection site={props.site} socialLinks={props.socialLinks} />
      <Footer
        site={props.site}
        footer={props.landing.footer}
        socialLinks={props.socialLinks}
        showNewsletter={props.landing.footer.showNewsletter !== false}
      />

      <motion.a
        href={`https://wa.me/${wa}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-8 left-8 z-50 p-4 bg-green-500 rounded-full shadow-lg shadow-green-500/30"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 2, type: 'spring' }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <motion.svg
          className="w-7 h-7 text-white"
          fill="currentColor"
          viewBox="0 0 24 24"
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
        </motion.svg>

        <motion.div
          className="absolute inset-0 rounded-full bg-green-500"
          animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </motion.a>
    </main>
  );
}
