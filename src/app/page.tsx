import HomeClient from './HomeClient';
import { getPublicHomeBundle } from '@/lib/cms-read';

/** Always read CMS from DB; otherwise Next caches the homepage for a long time after build. */
export const dynamic = 'force-dynamic';

export default async function Home() {
  const data = await getPublicHomeBundle();
  return <HomeClient {...data} />;
}
