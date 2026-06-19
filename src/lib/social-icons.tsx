import type { LucideIcon } from 'lucide-react';
import type React from 'react';
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  MessageCircle,
  Globe,
} from 'lucide-react';

export type SocialIconComponent = LucideIcon | React.FC<{ className?: string }>;

export function SnapchatIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.3 5.7c-.2-.9-1.1-1.6-2-1.7-1.4-.2-3-.4-6.3-.4s-4.9.2-6.3.4c-.9.1-1.8.8-2 1.7-.4 1.9-.4 4.3-.4 6.3s0 4.4.4 6.3c.2.9 1.1 1.6 2 1.7 1.2.2 3.2.4 5.4.4.4 0 .9 1.1.9 2.1 0 1-.5 2.2-2.7 2.4-.6.1-1.1.5-1 1.1.1.4.5.8 1.3.8 1.7 0 4.2-1 5.5-2.9 1.3 1.9 3.8 2.9 5.5 2.9.8 0 1.2-.4 1.3-.8.1-.6-.4-1-1-1.1-2.2-.2-2.7-1.4-2.7-2.4 0-1 .5-2.1.9-2.1 2.2 0 4.2-.2 5.4-.4.9-.1 1.8-.8 2-1.7.4-1.9.4-4.3.4-6.3s0-4.4-.4-6.3z" />
    </svg>
  );
}

export function TiktokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3 15.22a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.16 8.16 0 0 0 4.92 1.62V6.86a4.85 4.85 0 0 1-1-.17z" />
    </svg>
  );
}

export const socialIconMap: Record<string, SocialIconComponent> = {
  facebook: Facebook,
  twitter: Twitter,
  instagram: Instagram,
  linkedin: Linkedin,
  youtube: Youtube,
  whatsapp: MessageCircle,
  snapchat: SnapchatIcon,
  tiktok: TiktokIcon,
  website: Globe,
};
