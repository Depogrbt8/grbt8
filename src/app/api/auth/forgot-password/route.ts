import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import { logger } from '@/lib/logger'
import { rateLimit } from '@/lib/redis'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({
        success: false,
        error: 'Email adresi gereklidir'
      }, { status: 400 })
    }

    // Email formatını kontrol et
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({
        success: false,
        error: 'Geçerli bir email adresi giriniz'
      }, { status: 400 })
    }

    // Rate limiting: IP bazlı (3 istek / 15 dakika)
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    const ipRateLimitKey = `forgot-password:ip:${ip}`
    const ipRateLimit = await rateLimit.check(ipRateLimitKey, 3, 15 * 60 * 1000)
    
    if (!ipRateLimit.allowed) {
      logger.security('Forgot password rate limit exceeded (IP)', { ip })
      return NextResponse.json({
        success: false,
        error: 'Çok fazla istek. Lütfen 15 dakika sonra tekrar deneyin.'
      }, { status: 429 })
    }

    // Rate limiting: Email bazlı (5 istek / saat)
    const emailRateLimitKey = `forgot-password:email:${email.toLowerCase()}`
    const emailRateLimit = await rateLimit.check(emailRateLimitKey, 5, 60 * 60 * 1000)
    
    if (!emailRateLimit.allowed) {
      logger.security('Forgot password rate limit exceeded (Email)', { email: email.toLowerCase() })
      return NextResponse.json({
        success: false,
        error: 'Bu email adresi için çok fazla istek yapıldı. Lütfen 1 saat sonra tekrar deneyin.'
      }, { status: 429 })
    }

    // Kullanıcıyı bul
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    // Güvenlik için her zaman başarılı mesaj döndür (kullanıcı var mı yok mu belli etme)
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'Eğer bu email adresi kayıtlı ise, şifre sıfırlama linki gönderilecektir.'
      })
    }

    // Yeni token oluştur
    const resetToken = crypto.randomUUID()
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 saat geçerli

    logger.security('Şifre sıfırlama token oluşturuldu', {
      email: user.email,
      token: resetToken,
      expiry: resetTokenExpiry
    })

    // Token'ı veritabanına kaydet
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry
      }
    })

    // Admin panel'den email gönder - DOĞRU DOMAIN İLE
    const emailResponse = await fetch('https://www.grbt8.store/api/email/templates/password-reset', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: user.email,
        name: user.firstName || user.email.split('@')[0],
        resetToken: resetToken,
        baseUrl: 'https://gurbetbiz.app', // ANA SİTE DOMAIN'İ
        resetUrl: `https://gurbetbiz.app/sifre-sifirla?token=${resetToken}`
      })
    })

    let emailSuccess = false
    try {
      const emailData = await emailResponse.json()
      emailSuccess = emailData.success
      
      if (!emailSuccess) {
        logger.error('Email gönderme hatası', { error: emailData.error })
      }
    } catch (error) {
      logger.error('Email API yanıt hatası', { error })
    }

    // Email gönderilmese bile başarılı mesaj döndür (güvenlik)
    return NextResponse.json({
      success: true,
      message: 'Şifre sıfırlama linki email adresinize gönderildi.'
    })

  } catch (error: any) {
    logger.error('Forgot password error', { error })
    return NextResponse.json({
      success: false,
      error: 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin.'
    }, { status: 500 })
  }
}
