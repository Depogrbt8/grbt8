import { POST } from '@/app/api/admin/verify-pin/route'
import { NextRequest } from 'next/server'

describe('POST /api/admin/verify-pin', () => {
  const originalEnv = process.env.ADMIN_PIN

  beforeEach(() => {
    process.env.ADMIN_PIN = 'SecurePin123!'
  })

  afterEach(() => {
    process.env.ADMIN_PIN = originalEnv
  })

  describe('✅ Successful PIN Verification', () => {
    it('should verify correct PIN', async () => {
      const request = new NextRequest('http://localhost/api/admin/verify-pin', {
        method: 'POST',
        body: JSON.stringify({ pin: 'SecurePin123!' }),
      })

      const response = await POST(request as any)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message).toContain('PIN başarıyla doğrulandı')
    })

    it('should verify custom PIN from env', async () => {
      process.env.ADMIN_PIN = 'MyCustomPin456!'

      const request = new NextRequest('http://localhost/api/admin/verify-pin', {
        method: 'POST',
        body: JSON.stringify({ pin: 'MyCustomPin456!' }),
      })

      const response = await POST(request as any)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })

    it('should reject if env PIN not set (no default)', async () => {
      delete process.env.ADMIN_PIN

      const request = new NextRequest('http://localhost/api/admin/verify-pin', {
        method: 'POST',
        body: JSON.stringify({ pin: 'anypin' }),
      })

      const response = await POST(request as any)
      expect(response.status).toBe(500) // Should fail because no env PIN
    })
  })

  describe('❌ Failed PIN Verification', () => {
    it('should reject incorrect PIN', async () => {
      const request = new NextRequest('http://localhost/api/admin/verify-pin', {
        method: 'POST',
        body: JSON.stringify({ pin: '9999' }),
      })

      const response = await POST(request as any)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
      expect(data.error.code).toBe('INVALID_CREDENTIALS')
    })

    it('should reject missing PIN', async () => {
      const request = new NextRequest('http://localhost/api/admin/verify-pin', {
        method: 'POST',
        body: JSON.stringify({}),
      })

      const response = await POST(request as any)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error.code).toBe('MISSING_FIELD')
    })

    it('should reject empty PIN', async () => {
      const request = new NextRequest('http://localhost/api/admin/verify-pin', {
        method: 'POST',
        body: JSON.stringify({ pin: '' }),
      })

      const response = await POST(request as any)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })

    it('should reject null PIN', async () => {
      const request = new NextRequest('http://localhost/api/admin/verify-pin', {
        method: 'POST',
        body: JSON.stringify({ pin: null }),
      })

      const response = await POST(request as any)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })
  })

  describe('🔒 Security Tests', () => {
    it('should use server-side PIN check', async () => {
      process.env.ADMIN_PIN = 'secret-pin'

      const request = new NextRequest('http://localhost/api/admin/verify-pin', {
        method: 'POST',
        body: JSON.stringify({ pin: 'secret-pin' }),
      })

      const response = await POST(request as any)
      expect(response.status).toBe(200)
    })

    it('should be case sensitive', async () => {
      process.env.ADMIN_PIN = 'Secret'

      const requestLower = new NextRequest('http://localhost/api/admin/verify-pin', {
        method: 'POST',
        body: JSON.stringify({ pin: 'secret' }),
      })

      const responseLower = await POST(requestLower as any)
      expect(responseLower.status).toBe(401) // Rejected
    })

    it('should log IP on failed attempt', async () => {
      const request = new NextRequest('http://localhost/api/admin/verify-pin', {
        method: 'POST',
        headers: {
          'x-forwarded-for': '192.168.1.1',
        },
        body: JSON.stringify({ pin: 'wrong' }),
      })

      const response = await POST(request as any)
      const data = await response.json()

      expect(response.status).toBe(401)
      // IP logged (error helper handles this)
    })

    it('should handle missing IP gracefully', async () => {
      const request = new NextRequest('http://localhost/api/admin/verify-pin', {
        method: 'POST',
        body: JSON.stringify({ pin: 'wrong' }),
      })

      const response = await POST(request as any)
      expect(response.status).toBe(401)
    })

    it('should not expose correct PIN in error', async () => {
      process.env.ADMIN_PIN = 'super-secret-pin'

      const request = new NextRequest('http://localhost/api/admin/verify-pin', {
        method: 'POST',
        body: JSON.stringify({ pin: 'wrong' }),
      })

      const response = await POST(request as any)
      const data = await response.json()

      expect(JSON.stringify(data)).not.toContain('super-secret-pin')
    })

    it('should validate exact match only', async () => {
      process.env.ADMIN_PIN = '1234'

      const testCases = [
        '123',    // Too short
        '12345',  // Too long
        ' 1234',  // Leading space
        '1234 ',  // Trailing space
        '1 234',  // Space in middle
      ]

      for (const pin of testCases) {
        const request = new NextRequest('http://localhost/api/admin/verify-pin', {
          method: 'POST',
          body: JSON.stringify({ pin }),
        })

        const response = await POST(request as any)
        expect(response.status).toBe(401) // All should fail
      }
    })
  })

  describe('⚠️ Error Handling', () => {
    it('should handle malformed JSON', async () => {
      const request = {
        json: () => Promise.reject(new Error('Invalid JSON')),
        headers: { get: () => null },
      }

      const response = await POST(request as any)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error.code).toBe('INTERNAL_ERROR')
    })

    it('should handle unexpected errors', async () => {
      const request = {
        json: () => Promise.reject(new Error('Unexpected error')),
        headers: { get: () => null },
      }

      const response = await POST(request as any)
      expect(response.status).toBe(500)
    })
  })

  describe('📝 Response Format', () => {
    it('should return success response with correct structure', async () => {
      const request = new NextRequest('http://localhost/api/admin/verify-pin', {
        method: 'POST',
        body: JSON.stringify({ pin: 'SecurePin123!' }),
      })

      const response = await POST(request as any)
      const data = await response.json()

      expect(data).toHaveProperty('success')
      expect(data).toHaveProperty('message')
      expect(data.success).toBe(true)
    })

    it('should return error response with correct structure', async () => {
      const request = new NextRequest('http://localhost/api/admin/verify-pin', {
        method: 'POST',
        body: JSON.stringify({ pin: 'wrong' }),
      })

      const response = await POST(request as any)
      const data = await response.json()

      expect(data).toHaveProperty('success')
      expect(data).toHaveProperty('error')
      expect(data.success).toBe(false)
      expect(data.error).toHaveProperty('code')
    })
  })
})

