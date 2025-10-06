// Jest setup file
import '@testing-library/jest-dom'

// Mock environment variables
process.env.NEXTAUTH_SECRET = 'test-secret-key-for-jest-testing'
process.env.NEXTAUTH_URL = 'http://localhost:4000'
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test'
process.env.ADMIN_EMAILS = 'admin@grbt8.store,test@grbt8.store'
process.env.ADMIN_PIN = 'SecurePin123!'
process.env.FLIGHT_API_KEY = 'test-flight-api-key'

// Mock fetch globally
global.fetch = jest.fn()

// Mock Next.js NextResponse
jest.mock('next/server', () => {
  const actualModule = jest.requireActual('next/server')
  
  return {
    ...actualModule,
    NextResponse: {
      json: (data, init) => {
        const response = new Response(JSON.stringify(data), {
          status: init?.status || 200,
          headers: {
            'Content-Type': 'application/json',
            ...(init?.headers || {})
          }
        })
        // Add json method to instance
        response.json = async () => data
        return response
      },
      next: () => {
        return new Response(null, { status: 200 })
      },
      redirect: (url, status) => {
        return new Response(null, { 
          status: status || 307,
          headers: { Location: url }
        })
      }
    },
    NextRequest: class NextRequest extends Request {
      constructor(input, init) {
        super(input, init)
        this.nextUrl = new URL(input)
        this.cookies = {
          get: (name) => ({ name, value: '' }),
          getAll: () => [],
          set: () => {},
          delete: () => {}
        }
      }
    }
  }
})

// Mock Next.js server web globals
if (typeof Response === 'undefined') {
  global.Response = class Response {
    constructor(body, init) {
      this.body = body
      this.init = init || {}
      this.status = this.init.status || 200
      this.headers = new Map(Object.entries(this.init.headers || {}))
    }
    
    json() {
      if (typeof this.body === 'string') {
        return Promise.resolve(JSON.parse(this.body))
      }
      return Promise.resolve(this.body)
    }
    
    // Static method for Response.json()
    static json(data, init) {
      const response = new Response(JSON.stringify(data), {
        ...init,
        headers: {
          'Content-Type': 'application/json',
          ...(init?.headers || {})
        }
      })
      return response
    }
  }
}

if (typeof Request === 'undefined') {
  global.Request = class Request {
    constructor(input, init) {
      this.url = typeof input === 'string' ? input : input.url
      this.init = init || {}
      this.method = this.init.method || 'GET'
      this.headers = new Map(Object.entries(this.init.headers || {}))
      this.body = this.init.body
    }
    
    async json() {
      if (this.body) {
        return JSON.parse(this.body)
      }
      return {}
    }
    
    async text() {
      return this.body || ''
    }
  }
}

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Suppress console errors in tests (optional)
const originalError = console.error
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render')
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})

