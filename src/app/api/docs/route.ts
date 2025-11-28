import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const swaggerDocument = {
    openapi: '3.0.0',
    info: {
      title: 'GRBT8 Seyahat Sitesi API',
      version: '1.0.0',
      description: 'GRBT8 seyahat sitesi için geliştirilmiş API dokümantasyonu',
      contact: {
        name: 'GRBT8 Teknik Destek',
        email: 'destek@grbt8.com'
      }
    },
    servers: [
      {
        url: 'https://gurbetbiz.app',
        description: 'Production Server'
      },
      {
        url: 'http://localhost:3000',
        description: 'Development Server'
      }
    ],
    paths: {
      '/api/auth/login': {
        post: {
          tags: ['Authentication'],
          summary: 'Kullanıcı girişi',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    email: {
                      type: 'string',
                      format: 'email',
                      example: 'kullanici@example.com'
                    },
                    password: {
                      type: 'string',
                      minLength: 8,
                      example: 'SecurePass123!'
                    }
                  },
                  required: ['email', 'password']
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Başarılı giriş',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      user: {
                        type: 'object',
                        properties: {
                          id: { type: 'string' },
                          email: { type: 'string' },
                          name: { type: 'string' }
                        }
                      }
                    }
                  }
                }
              }
            },
            '401': {
              description: 'Geçersiz kimlik bilgileri'
            }
          }
        }
      },
      '/api/auth/register': {
        post: {
          tags: ['Authentication'],
          summary: 'Kullanıcı kaydı',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    email: {
                      type: 'string',
                      format: 'email',
                      example: 'kullanici@example.com'
                    },
                    password: {
                      type: 'string',
                      minLength: 8,
                      example: 'SecurePass123!'
                    },
                    name: {
                      type: 'string',
                      example: 'Ahmet Yılmaz'
                    }
                  },
                  required: ['email', 'password', 'name']
                }
              }
            }
          },
          responses: {
            '201': {
              description: 'Başarılı kayıt'
            },
            '400': {
              description: 'Geçersiz veri'
            }
          }
        }
      },
      '/api/flights/search': {
        post: {
          tags: ['Flights'],
          summary: 'Uçuş arama',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    departure: {
                      type: 'string',
                      example: 'IST'
                    },
                    arrival: {
                      type: 'string',
                      example: 'FRA'
                    },
                    departureDate: {
                      type: 'string',
                      format: 'date',
                      example: '2024-01-15'
                    },
                    returnDate: {
                      type: 'string',
                      format: 'date',
                      example: '2024-01-22'
                    },
                    passengers: {
                      type: 'object',
                      properties: {
                        adults: { type: 'integer', minimum: 1 },
                        children: { type: 'integer', minimum: 0 },
                        infants: { type: 'integer', minimum: 0 }
                      }
                    },
                    tripType: {
                      type: 'string',
                      enum: ['oneway', 'roundtrip'],
                      example: 'roundtrip'
                    }
                  },
                  required: ['departure', 'arrival', 'departureDate', 'passengers', 'tripType']
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Uçuş sonuçları',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      flights: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            id: { type: 'string' },
                            airline: { type: 'string' },
                            departure: { type: 'string' },
                            arrival: { type: 'string' },
                            price: { type: 'number' },
                            currency: { type: 'string' }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/payment/tokenize': {
        post: {
          tags: ['Payments'],
          summary: 'Kart tokenizasyonu',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    number: {
                      type: 'string',
                      pattern: '^[0-9]{13,19}$',
                      example: '4111111111111111'
                    },
                    expiryMonth: {
                      type: 'string',
                      pattern: '^(0[1-9]|1[0-2])$',
                      example: '12'
                    },
                    expiryYear: {
                      type: 'string',
                      pattern: '^20[0-9]{2}$',
                      example: '2025'
                    },
                    cvv: {
                      type: 'string',
                      pattern: '^[0-9]{3,4}$',
                      example: '123'
                    },
                    name: {
                      type: 'string',
                      minLength: 2,
                      example: 'AHMET YILMAZ'
                    }
                  },
                  required: ['number', 'expiryMonth', 'expiryYear', 'cvv', 'name']
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Başarılı tokenizasyon',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      token: { type: 'string' },
                      maskedCard: { type: 'string' },
                      expiry: { type: 'string' }
                    }
                  }
                }
              }
            },
            '400': {
              description: 'Geçersiz kart bilgileri'
            }
          }
        }
      },
      '/api/payment/process': {
        post: {
          tags: ['Payments'],
          summary: 'Ödeme işlemi',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    cardToken: {
                      type: 'string',
                      example: 'tok_1234567890abcdef'
                    },
                    amount: {
                      type: 'number',
                      minimum: 0.01,
                      example: 150.00
                    },
                    currency: {
                      type: 'string',
                      pattern: '^[A-Z]{3}$',
                      example: 'EUR'
                    },
                    description: {
                      type: 'string',
                      example: 'Uçuş rezervasyonu'
                    },
                    requires3D: {
                      type: 'boolean',
                      example: false
                    }
                  },
                  required: ['cardToken', 'amount', 'currency']
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Başarılı ödeme',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      transactionId: { type: 'string' },
                      status: { type: 'string' },
                      amount: { type: 'number' },
                      currency: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/monitoring/performance': {
        get: {
          tags: ['Monitoring'],
          summary: 'Performans metrikleri',
          parameters: [
            {
              name: 'timeframe',
              in: 'query',
              schema: {
                type: 'string',
                enum: ['1h', '24h', '7d'],
                default: '24h'
              },
              description: 'Zaman aralığı'
            },
            {
              name: 'page',
              in: 'query',
              schema: { type: 'string' },
              description: 'Sayfa filtresi'
            }
          ],
          responses: {
            '200': {
              description: 'Performans istatistikleri',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: {
                        type: 'object',
                        properties: {
                          timeframe: { type: 'string' },
                          stats: {
                            type: 'object',
                            properties: {
                              totalRequests: { type: 'number' },
                              averageLoadTime: { type: 'number' },
                              averageFCP: { type: 'number' },
                              averageLCP: { type: 'number' },
                              averageCLS: { type: 'number' }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        post: {
          tags: ['Monitoring'],
          summary: 'Performans metrikleri gönderme',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    timestamp: { type: 'string', format: 'date-time' },
                    page: { type: 'string' },
                    loadTime: { type: 'number' },
                    firstContentfulPaint: { type: 'number' },
                    largestContentfulPaint: { type: 'number' },
                    cumulativeLayoutShift: { type: 'number' }
                  }
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Metrikler başarıyla kaydedildi'
            }
          }
        }
      },
      '/api/monitoring/security': {
        get: {
          tags: ['Monitoring'],
          summary: 'Güvenlik olayları',
          parameters: [
            {
              name: 'timeframe',
              in: 'query',
              schema: {
                type: 'string',
                enum: ['1h', '24h', '7d'],
                default: '24h'
              }
            },
            {
              name: 'severity',
              in: 'query',
              schema: {
                type: 'string',
                enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
              }
            }
          ],
          responses: {
            '200': {
              description: 'Güvenlik istatistikleri'
            }
          }
        },
        post: {
          tags: ['Monitoring'],
          summary: 'Güvenlik olayı kaydetme',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    timestamp: { type: 'string', format: 'date-time' },
                    eventType: {
                      type: 'string',
                      enum: ['LOGIN_ATTEMPT', 'LOGIN_SUCCESS', 'LOGIN_FAILURE', 'BRUTE_FORCE', 'SUSPICIOUS_ACTIVITY']
                    },
                    ip: { type: 'string' },
                    userId: { type: 'string' },
                    severity: {
                      type: 'string',
                      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
                    }
                  }
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Olay başarıyla kaydedildi'
            }
          }
        }
      }
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string', example: 'Hata mesajı' }
          }
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string', format: 'email' },
            name: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Flight: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            airline: { type: 'string' },
            flightNumber: { type: 'string' },
            departure: {
              type: 'object',
              properties: {
                airport: { type: 'string' },
                city: { type: 'string' },
                time: { type: 'string', format: 'date-time' }
              }
            },
            arrival: {
              type: 'object',
              properties: {
                airport: { type: 'string' },
                city: { type: 'string' },
                time: { type: 'string', format: 'date-time' }
              }
            },
            price: { type: 'number' },
            currency: { type: 'string' }
          }
        }
      }
    },
    tags: [
      {
        name: 'Authentication',
        description: 'Kullanıcı kimlik doğrulama işlemleri'
      },
      {
        name: 'Flights',
        description: 'Uçuş arama ve rezervasyon işlemleri'
      },
      {
        name: 'Payments',
        description: 'Ödeme işlemleri ve güvenli kart işleme'
      },
      {
        name: 'Monitoring',
        description: 'Sistem izleme ve analitik verileri'
      }
    ]
  };

  return NextResponse.json(swaggerDocument);
}
