import HomeClient from './HomeClient';
import { getPublicHomeBundle } from '@/lib/cms-read';

export default async function Home() {
  const data = await getPublicHomeBundle();
  return <HomeClient {...data} />;
}
