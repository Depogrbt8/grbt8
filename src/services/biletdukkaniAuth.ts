// BiletDukkani API - Token alma fonksiyonu (DEMO)
// Gerçek bilgiler girildiğinde hemen canlıya alınabilir

import axios from 'axios';

// .env üzerinden yönetilir (kod içine gizli bilgi koyma)
const API_URL = 'https://test-login.rooftickets.com/connect/token';
const CLIENT_ID = process.env.BILETDUKKANI_CLIENT_ID || '';
const CLIENT_SECRET = process.env.BILETDUKKANI_CLIENT_SECRET || '';
const USERNAME = process.env.BILETDUKKANI_USERNAME || '';
const PASSWORD = process.env.BILETDUKKANI_PASSWORD || '';
const SCOPE = 'openid profile email IdentityServerApi role ticket.api permission';

// Demo fonksiyon: Gerçek API çağrısı yerine sahte token döner
export async function getBiletDukkaniTokenDemo() {
  // Demo amaçlı token .env'den okunur; kod içinde sabit tutulmaz
  const demoToken = process.env.BILET_DUKKANI_DEMO_TOKEN || 'demo_token';
  return {
    access_token: demoToken,
    expires_in: 7200,
    token_type: 'Bearer',
    scope: SCOPE,
    demo: true
  };
}

// Gerçek fonksiyon (ileride aktif edilecek)
export async function getBiletDukkaniTokenReal() {
  if (!CLIENT_ID || !CLIENT_SECRET || !USERNAME || !PASSWORD) {
    throw new Error('BiletDukkani gerçek API bilgileri eksik. Lütfen .env değişkenlerini tanımlayın.');
  }
  const params = new URLSearchParams();
  params.append('grant_type', 'password');
  params.append('client_id', CLIENT_ID);
  params.append('client_secret', CLIENT_SECRET);
  params.append('username', USERNAME);
  params.append('password', PASSWORD);
  params.append('scope', SCOPE);

  const response = await axios.post(API_URL, params, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
  return response.data;
}

// Demo: Get User Info
export async function getBiletDukkaniUserInfoDemo(token: string) {
  // Demo amaçlı, sahte kullanıcı bilgisi döndürür
  return {
    sub: 'demo-user-id',
    name: 'Demo Kullanıcı',
    email: 'demo@demo.com',
    roles: ['user'],
    demo: true
  };
}

// Gerçek fonksiyon (ileride aktif edilecek)
export async function getBiletDukkaniUserInfoReal(token: string) {
  const API_URL = 'https://test-login.rooftickets.com/connect/userinfo';
  const response = await axios.get(API_URL, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
} 