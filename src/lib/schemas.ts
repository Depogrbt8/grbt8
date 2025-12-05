export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Gurbetbiz",
  "url": "https://gurbetbiz.app",
  // Logo referansı kaldırıldı - Logo text olarak kullanılıyor, görsel logo dosyası yok
  // "logo": "https://gurbetbiz.app/images/logo.png",
  "description": "Avrupa'dan Türkiye'ye uçak bileti, otel rezervasyonu ve araç kiralama. En uygun fiyatlar, anında rezervasyon, güvenli ödeme, 7/24 destek.",
  "foundingDate": "2024",
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "DE", // Avrupa lokasyonu (Almanya)
    "addressLocality": "Berlin", // Avrupa şehri
    "addressRegion": "Berlin",
    "streetAddress": "[Şirket Adresi]" // Gerçek adres eklenecek
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+90-XXX-XXX-XXXX",
    "contactType": "customer service",
    "availableLanguage": ["Turkish", "German", "French", "Dutch"]
  },
  "sameAs": [
    "https://www.facebook.com/gurbetbiz",
    "https://www.twitter.com/gurbetbiz",
    "https://www.instagram.com/gurbetbiz"
  ]
}

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Gurbetbiz",
  "url": "https://gurbetbiz.app",
  "description": "Avrupa'dan Türkiye'ye uçak bileti, otel rezervasyonu ve araç kiralama. En uygun fiyatlar, anında rezervasyon, güvenli ödeme, 7/24 destek.",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://gurbetbiz.app/flights/search?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}

export const breadcrumbSchema = (items: Array<{name: string, url: string}>) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": items.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": item.name,
    "item": item.url
  }))
})

export const faqSchema = (faqs: Array<{question: string, answer: string}>) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map(faq => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer
    }
  }))
})

// Flight Service Schema - Uçuş bileti için Service tipi kullanılıyor
// Product yerine Service kullanıyoruz çünkü uçuş bileti fiziksel ürün değil, hizmettir
// Bu sayede Google Merchant Listings (image, shippingDetails, returnPolicy) hataları oluşmaz
export const flightServiceSchema = (flight: {
  name: string;
  description: string;
  price: number;
  currency: string;
  origin: string;
  destination: string;
  departureDate: string;
  arrivalDate?: string;
  airline?: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "Service",
  "serviceType": "Flight Booking",
  "name": flight.name,
  "description": flight.description,
  "provider": {
    "@type": "Organization",
    "name": "Gurbetbiz",
    "url": "https://gurbetbiz.app"
  },
  "offers": {
    "@type": "Offer",
    "price": flight.price,
    "priceCurrency": flight.currency,
    "availability": "https://schema.org/InStock",
    "url": `https://gurbetbiz.app/flights/search?origin=${flight.origin}&destination=${flight.destination}&departureDate=${flight.departureDate}`,
    "validFrom": flight.departureDate
  },
  "areaServed": [
    {
      "@type": "Place",
      "name": flight.origin
    },
    {
      "@type": "Place", 
      "name": flight.destination
    }
  ],
  "category": "Air Travel",
  ...(flight.airline && {
    "broker": {
      "@type": "Organization",
      "name": flight.airline
    }
  })
})

// Geriye dönük uyumluluk için productSchema'yı flightServiceSchema'ya yönlendir
// @deprecated - flightServiceSchema kullanın
export const productSchema = flightServiceSchema
