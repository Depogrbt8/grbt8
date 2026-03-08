import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import BlogManagementClient from './BlogManagementClient';
import { isAdminEmail } from '@/lib/adminAuth';

export default async function BlogManagementPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !isAdminEmail(session.user.email)) {
    redirect('/grbt-8/giris');
  }

  return <BlogManagementClient />;
}

