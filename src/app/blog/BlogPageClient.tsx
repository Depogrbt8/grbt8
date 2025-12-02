'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import Image from 'next/image';
import { CalendarDays, Clock, User, ArrowRight } from 'lucide-react';
import Script from 'next/script';
import { breadcrumbSchema } from '@/lib/schemas';
import { useEffect, useState } from 'react';

interface ManualBlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  category: string;
  author: string;
  coverImage?: string;
  publishedAt: string;
}

export default function BlogPageClient() {
  const [posts, setPosts] = useState<ManualBlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Sadece manuel blogları yükle
    fetch('/api/blog/posts')
      .then(res => res.json())
      .then(data => {
        setPosts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching blog posts:', err);
        setLoading(false);
      });
  }, []);

  // Blog kartları için formatla
  const blogCards = posts.map(post => ({
    id: post.slug,
    title: post.title,
    excerpt: post.excerpt || '',
    author: post.author,
    date: new Date(post.publishedAt).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' }),
    readTime: '10 dk',
    category: post.category,
    image: post.coverImage || '/images/blog/cheap-flights.jpg',
    slug: post.slug,
  }));

  const breadcrumbItems = [
    { name: 'Ana Sayfa', url: 'https://gurbetbiz.app' },
    { name: 'Blog', url: 'https://gurbetbiz.app/blog' }
  ];

  return (
    <>
      <Script
        id="breadcrumb-schema-blog"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema(breadcrumbItems))
        }}
      />
      <Header />
      <main className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-green-600 to-green-700 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold mb-4">Gurbetbiz Blog</h1>
            <p className="text-xl text-green-100 max-w-2xl mx-auto">
              Gurbetçilerin vatan yolculuğunda yanındayız! Uygun uçak bileti, otel ve araç kiralama fırsatları
            </p>
          </div>
        </section>

        {/* Blog Posts */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                <p className="mt-4 text-gray-600">Blog yazıları yükleniyor...</p>
              </div>
            ) : blogCards.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">Henüz blog yazısı bulunmamaktadır.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {blogCards.map((post) => (
                <article key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <div className="h-48 relative overflow-hidden">
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                      <div className="text-white text-center">
                        <h3 className="text-lg font-semibold mb-2">{post.category}</h3>
                        <p className="text-sm opacity-90">Gurbetçi Blog</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                        {post.category}
                      </span>
                    </div>
                    
                    <h2 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2">
                      {post.title}
                    </h2>
                    
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-1" />
                          {post.author}
                        </div>
                        <div className="flex items-center">
                          <CalendarDays className="w-4 h-4 mr-1" />
                          {post.date}
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {post.readTime}
                        </div>
                      </div>
                    </div>
                    
                    <Link 
                      href={`/blog/${post.slug || post.id}`}
                      className="inline-flex items-center text-green-600 hover:text-green-700 font-medium transition-colors duration-200"
                    >
                      Devamını Oku
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>
                </article>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="bg-white py-12 border-t">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Gurbetçi Fırsatlarını Kaçırmayın!
            </h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              En uygun fiyatlı uçak biletleri, otel rezervasyonları ve araç kiralama fırsatlarından haberdar olun.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="E-posta adresiniz"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <button className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium">
                Abone Ol
              </button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

