import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import RaporlarClient from './RaporlarClient';
import { isAdminEmail } from '@/lib/adminAuth';

export default async function OpsAdminRaporlarPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !isAdminEmail(session.user.email)) {
    redirect('/grbt-8/giris');
  }

  return <RaporlarClient />;
}


