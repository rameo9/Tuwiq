'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { href: '/admin/marketing', label: 'المسوقين' },
  { href: '/admin/marketing/landings', label: 'صفحات الهبوط' },
];

export default function MarketingTabs() {
  const pathname = usePathname();

  return (
    <div className="flex gap-2 p-1 rounded-xl bg-dark-900 border border-dark-800 w-fit">
      {tabs.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
              active
                ? 'bg-gold-500 text-dark-900'
                : 'text-dark-400 hover:text-white hover:bg-dark-800'
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
