import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// CORS whitelist - sadece izin verilen domain'ler
const allowedOrigins = new Set<string>([
  'https://www.grbt8.store',
  'https://grbt8.store',
  'https://anasite.grbt8.store',
  'http://localhost:3000',
  'http://localhost:4000',
]);

function cors(res: NextResponse, origin: string | null) {
  const isAllowedOrigin = origin && allowedOrigins.has(origin);
  
  if (isAllowedOrigin) {
    res.headers.set('Access-Control-Allow-Origin', origin);
  }
  
  res.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.headers.set('Access-Control-Allow-Credentials', 'true')
  return res
}

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin');
  return cors(new NextResponse(null, { status: 200 }), origin)
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin');
  
  try {
    // Authentication kontrolü - kampanyalar için session kontrolü esnek
    // Ana sitede session olmadan da çalışabilir
    const session = await getServerSession(authOptions);
    
    // Sadece admin domain'den geliyorsa session kontrolü yap
    const isAdminDomain = origin?.includes('www.grbt8.store');
    if (isAdminDomain && !session?.user) {
      return cors(
        NextResponse.json({ success: false, error: 'Yetkisiz erişim' }, { status: 401 }), 
        origin
      );
    }

    const data = await request.formData()
    const file: File | null = data.get('file') as unknown as File
    if (!file) {
      return cors(
        NextResponse.json({ success: false, error: 'Dosya bulunamadı' }, { status: 400 }), 
        origin
      )
    }

    // Dosya boyutu kontrolü
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return cors(
        NextResponse.json({ success: false, error: 'Maksimum dosya boyutu 5MB' }, { status: 413 }), 
        origin
      )
    }

    // Dosya tipi kontrolü - sadece resim
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return cors(
        NextResponse.json({ success: false, error: 'Sadece resim dosyaları yüklenebilir (JPEG, PNG, WEBP, GIF)' }, { status: 400 }), 
        origin
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')
    const dataUrl = `data:${file.type};base64,${base64}`

    return cors(
      NextResponse.json({ success: true, url: dataUrl, size: file.size, type: file.type }), 
      origin
    )
  } catch (e) {
    return cors(
      NextResponse.json({ success: false, error: 'Upload işlemi sırasında bir hata oluştu' }, { status: 500 }), 
      origin
    )
  }
}
