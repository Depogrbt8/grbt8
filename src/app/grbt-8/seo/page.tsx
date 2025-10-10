import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import SeoClient from './SeoClient';

export default async function SeoPage() {
  // Güvenlik kontrolü - Admin yetkisi gerekli
  const session = await getServerSession(authOptions);
  const allow = (process.env.ADMIN_EMAILS || 'admin@grbt8.store,manager@grbt8.store')
    .split(',')
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);

  if (!session || !session.user?.email || !allow.includes(session.user.email.toLowerCase())) {
    redirect('/grbt-8/giris');
  }

  return <SeoClient />;
}
