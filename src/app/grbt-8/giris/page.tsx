'use server';

import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function AdminGirisRedirect() {
  // Bu sayfa devre dışı: admin giriş akışı kaldırıldı
  redirect('/grbt-8/monitor');
}
