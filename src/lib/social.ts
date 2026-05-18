import type { LucideIcon } from 'lucide-react';
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  MessageCircle,
  Globe,
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  facebook: Facebook,
  twitter: Twitter,
  instagram: Instagram,
  linkedin: Linkedin,
  youtube: Youtube,
  whatsapp: MessageCircle,
  website: Globe,
};

export function getSocialIcon(platform: string): LucideIcon {
  return iconMap[platform] ?? Globe;
}

export function getSocialHref(platform: string, url: string): string {
  const u = url.trim();
  if (!u) return '#';
  if (platform === 'whatsapp') {
    const n = u.replace(/\D/g, '');
    return n ? `https://wa.me/${n}` : '#';
  }
  if (u.startsWith('http://') || u.startsWith('https://')) return u;
  return `https://${u}`;
}
