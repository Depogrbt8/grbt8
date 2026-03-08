import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import SeoClient from './SeoClient';
import { isAdminEmail } from '@/lib/adminAuth';

export default async function SeoPage() {
  // Güvenlik kontrolü - Admin yetkisi gerekli
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !isAdminEmail(session.user.email)) {
    redirect('/grbt-8/giris');
  }

  return <SeoClient />;
}
