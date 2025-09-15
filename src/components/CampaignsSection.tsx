'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface Campaign {
  id: string
  title: string
  description: string
  imageUrl: string | null
  altText: string
  linkUrl: string
  status: 'active' | 'inactive'
  position: number
  clickCount: number
  viewCount: number
  startDate: string | null
  endDate: string | null
  createdAt: string
  updatedAt: string
}

export default function CampaignsSection() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCampaigns()
  }, [])

  const fetchCampaigns = async () => {
    try {
      console.log('Fetching campaigns...') // Debug
      
      const response = await fetch('/api/campaigns', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      })
      
      console.log('Response status:', response.status) // Debug
      
      if (response.ok) {
        const data = await response.json()
        console.log('API Response:', data) // Debug için
        
        if (data.success && data.data && Array.isArray(data.data)) {
          // Sadece aktif kampanyaları al ve pozisyona göre sırala
          const activeCampaigns = data.data
            .filter((campaign: Campaign) => campaign.status === 'active')
            .sort((a: Campaign, b: Campaign) => a.position - b.position)
            .slice(0, 4) // Maksimum 4 kampanya
          
          console.log('Active campaigns:', activeCampaigns) // Debug için
          setCampaigns(activeCampaigns)
        } else {
          console.log('No valid data received:', data)
        }
      } else {
        console.error('API response not ok:', response.status, response.statusText)
        const errorText = await response.text()
        console.error('Error response:', errorText)
      }
    } catch (error) {
      console.error('Kampanyalar yüklenirken hata:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCampaignClick = async (campaignId: string) => {
    try {
      // Tıklama sayısını artır
      await fetch(`/api/campaigns/${campaignId}/click`, {
        method: 'POST'
      })
    } catch (error) {
      console.error('Tıklama sayacı güncellenirken hata:', error)
    }
  }

  if (loading) {
    return (
      <div className="w-full sm:container sm:mx-auto px-0 sm:px-4 py-4 sm:py-10">
        <h2 className="hidden sm:block text-2xl font-semibold text-gray-800 mb-8">Kampanyalar</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-gray-200 rounded-lg h-64 animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  if (campaigns.length === 0) {
    return null // Kampanya yoksa bölümü gizle
  }

  return (
    <div className="w-full sm:container sm:mx-auto px-0 sm:px-4 py-4 sm:py-10">
      <h2 className="hidden sm:block text-2xl font-semibold text-gray-800 mb-8">Kampanyalar</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {campaigns.map((campaign) => (
          <div key={campaign.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            {campaign.linkUrl ? (
              <Link 
                href={campaign.linkUrl}
                onClick={() => handleCampaignClick(campaign.id)}
                className="block"
              >
                <div className="relative w-full h-48 cursor-pointer">
                  {campaign.imageUrl ? (
                    <Image
                      src={campaign.imageUrl.startsWith('data:') ? campaign.imageUrl : `https://www.grbt8.store${campaign.imageUrl}`}
                      alt={campaign.altText}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      quality={75}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <span className="text-white text-lg font-semibold">{campaign.title}</span>
                    </div>
                  )}
                </div>
              </Link>
            ) : (
              <div className="relative w-full h-48">
                {campaign.imageUrl ? (
                  <Image
                    src={campaign.imageUrl.startsWith('data:') ? campaign.imageUrl : `https://www.grbt8.store${campaign.imageUrl}`}
                    alt={campaign.altText}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    quality={75}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-white text-lg font-semibold">{campaign.title}</span>
                  </div>
                )}
              </div>
            )}
            <div className="p-4">
              <h3 className="text-gray-800 font-semibold text-lg mb-2 line-clamp-1">
                {campaign.title}
              </h3>
              <p className="text-gray-600 text-sm line-clamp-2">
                {campaign.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 