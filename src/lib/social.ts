import { Globe } from 'lucide-react';
import { socialIconMap, type SocialIconComponent } from './social-icons';

export type { SocialIconComponent };

export const SOCIAL_PLATFORM_LABELS: Record<string, { ar: string; en: string }> = {
  facebook: { ar: 'فيسبوك', en: 'Facebook' },
  twitter: { ar: 'تويتر', en: 'Twitter' },
  instagram: { ar: 'انستغرام', en: 'Instagram' },
  linkedin: { ar: 'لينكد إن', en: 'LinkedIn' },
  youtube: { ar: 'يوتيوب', en: 'YouTube' },
  whatsapp: { ar: 'واتساب', en: 'WhatsApp' },
  snapchat: { ar: 'سناب شات', en: 'Snapchat' },
  tiktok: { ar: 'تيك توك', en: 'TikTok' },
  website: { ar: 'الموقع', en: 'Website' },
};

export { socialIconMap };

export function getSocialIcon(platform: string): SocialIconComponent {
  return socialIconMap[platform] ?? Globe;
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
