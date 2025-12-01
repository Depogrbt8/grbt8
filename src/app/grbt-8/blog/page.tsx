import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import BlogManagementClient from './BlogManagementClient';

export default async function BlogManagementPage() {
  // Güvenlik kontrolü - Admin yetkisi gerekli
  const session = await getServerSession(authOptions);
  const allow = (process.env.ADMIN_EMAILS || 'admin@grbt8.store,manager@grbt8.store')
    .split(',')
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);

  if (!session || !session.user?.email || !allow.includes(session.user.email.toLowerCase())) {
    redirect('/grbt-8/giris');
  }

  return <BlogManagementClient />;
}

