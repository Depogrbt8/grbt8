 
import { redirect } from 'next/navigation';

export default function AdminGirisRedirect() {
  // Bu sayfa devre dışı: admin giriş akışı kaldırıldı
  redirect('/grbt-8/monitor');
}
