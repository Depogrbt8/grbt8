'use client';

import { useState, useEffect } from 'react';
import AdminSidebar from '@/components/AdminSidebar';

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  content: string;
  category: string;
  author: string;
  coverImage?: string;
  tags?: string;
  status: string;
  viewCount: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export default function BlogManagementClient() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingPost, setEditingPost] = useState<Partial<BlogPost> | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/blog/posts?status=all');
      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      }
    } catch (error) {
      console.error('Error loading posts:', error);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!editingPost || !editingPost.title || !editingPost.content || !editingPost.slug) {
      alert('Lütfen tüm zorunlu alanları doldurun');
      return;
    }

    setLoading(true);
    try {
      const method = editingPost.id ? 'PUT' : 'POST';
      const response = await fetch('/api/blog/posts', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingPost),
      });

      if (response.ok) {
        alert(editingPost.id ? 'Blog güncellendi!' : 'Blog oluşturuldu!');
        setShowForm(false);
        setEditingPost(null);
        loadPosts();
      } else {
        const error = await response.json();
        alert(`Hata: ${error.error || 'Bilinmeyen hata'}`);
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Kaydetme hatası!');
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu blog yazısını silmek istediğinizden emin misiniz?')) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/blog/posts?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Blog silindi!');
        loadPosts();
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Silme hatası!');
    }
    setLoading(false);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ğ/g, 'g')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  return (
    <div className="min-h-screen flex">
      <AdminSidebar />
      <main className="flex-1 p-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Blog Yönetimi</h1>
            <button
              onClick={() => {
                setEditingPost({
                  title: '',
                  slug: '',
                  excerpt: '',
                  content: '',
                  category: 'Seyahat Rehberi',
                  author: 'Gurbetbiz Ekibi',
                  status: 'draft',
                });
                setShowForm(true);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              + Yeni Blog Ekle
            </button>
          </div>

          {/* Form */}
          {showForm && editingPost && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">
                {editingPost.id ? 'Blog Düzenle' : 'Yeni Blog Ekle'}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Başlık *
                  </label>
                  <input
                    type="text"
                    value={editingPost.title || ''}
                    onChange={(e) => {
                      const title = e.target.value;
                      setEditingPost({
                        ...editingPost,
                        title,
                        slug: editingPost.id ? editingPost.slug : generateSlug(title),
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Örn: Gurbetçiler İçin 2026 Yaz İzni Rehberi"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Slug * (URL)
                  </label>
                  <input
                    type="text"
                    value={editingPost.slug || ''}
                    onChange={(e) => setEditingPost({...editingPost, slug: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="gurbetciler-icin-2026-yaz-izni-rehberi"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kategori *
                  </label>
                  <select
                    value={editingPost.category || 'Seyahat Rehberi'}
                    onChange={(e) => setEditingPost({...editingPost, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="Uçuş Rehberi">Uçuş Rehberi</option>
                    <option value="Tatil Rehberi">Tatil Rehberi</option>
                    <option value="Otel Rehberi">Otel Rehberi</option>
                    <option value="Villa Rehberi">Villa Rehberi</option>
                    <option value="Araç Kiralama">Araç Kiralama</option>
                    <option value="Seyahat Rehberi">Seyahat Rehberi</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Özet (Excerpt)
                  </label>
                  <textarea
                    value={editingPost.excerpt || ''}
                    onChange={(e) => setEditingPost({...editingPost, excerpt: e.target.value})}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Kısa açıklama (2-3 cümle)"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    İçerik * (HTML destekler)
                  </label>
                  <textarea
                    value={editingPost.content || ''}
                    onChange={(e) => setEditingPost({...editingPost, content: e.target.value})}
                    rows={15}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm"
                    placeholder="Blog içeriğini buraya yazın..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kapak Görseli URL
                  </label>
                  <input
                    type="url"
                    value={editingPost.coverImage || ''}
                    onChange={(e) => setEditingPost({...editingPost, coverImage: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="/images/blog/my-image.jpg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Durum
                  </label>
                  <select
                    value={editingPost.status || 'draft'}
                    onChange={(e) => setEditingPost({...editingPost, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="draft">Taslak</option>
                    <option value="published">Yayınlandı</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingPost(null);
                  }}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400 transition-colors"
                >
                  İptal
                </button>
              </div>
            </div>
          )}

          {/* Blog Listesi */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Başlık
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Kategori
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Durum
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Görüntülenme
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {posts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      Henüz blog yazısı eklenmemiş
                    </td>
                  </tr>
                ) : (
                  posts.map((post) => (
                    <tr key={post.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div className="text-sm font-medium text-gray-900">{post.title}</div>
                        <div className="text-xs text-gray-500">/blog/{post.slug}</div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">{post.category}</td>
                      <td className="px-4 py-4">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            post.status === 'published'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {post.status === 'published' ? 'Yayınlandı' : 'Taslak'}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">{post.viewCount}</td>
                      <td className="px-4 py-4 text-sm font-medium">
                        <button
                          onClick={() => {
                            setEditingPost(post);
                            setShowForm(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          Düzenle
                        </button>
                        <button
                          onClick={() => handleDelete(post.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Sil
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

