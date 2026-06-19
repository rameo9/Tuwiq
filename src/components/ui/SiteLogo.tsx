import Link from 'next/link';

const DEFAULT_LOGO = '/logo-tuwaiq.png';

type SiteLogoProps = {
  logo?: string;
  siteName?: { ar: string; en: string };
  language?: 'ar' | 'en';
  className?: string;
  imageClassName?: string;
};

export default function SiteLogo({
  logo,
  siteName,
  language = 'ar',
  className = '',
  imageClassName = 'h-10 sm:h-11 w-auto object-contain',
}: SiteLogoProps) {
  const src = logo?.trim() || DEFAULT_LOGO;
  const alt = siteName?.[language] || 'TUWAIQ';

  return (
    <Link href="/" className={`inline-flex items-center ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className={imageClassName} />
    </Link>
  );
}
