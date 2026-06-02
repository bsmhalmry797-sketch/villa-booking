'use client'

import { useEffect, useState, Suspense } from 'react'
import { supabase } from '../../lib/supabase'
import { useLang } from '../context/LanguageContext'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function SearchContent() {
  const { lang } = useLang()
  const searchParams = useSearchParams()
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)

  const checkIn = searchParams.get('checkIn')
  const checkOut = searchParams.get('checkOut')
  const guests = searchParams.get('guests')

  useEffect(() => {
    fetchProperties()
  }, [])

  async function fetchProperties() {
    let query = supabase
      .from('properties')
      .select('*')
      .eq('is_available', true)

    if (guests) {
      query = query.gte('max_guests', guests)
    }

    const { data } = await query
    setProperties(data || [])
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 px-4 pb-12">
      <div className="max-w-6xl mx-auto">

        <div className="mb-6">
          <h1 className="text-2xl font-black text-gray-900">
            {lang === 'ar' ? 'نتائج البحث' : 'Search Results'}
          </h1>
          {checkIn && checkOut && (
            <p className="text-gray-500 text-sm mt-1">
              {checkIn} ← {checkOut} · {guests} {lang === 'ar' ? 'ضيوف' : 'guests'}
            </p>
          )}
        </div>

        {loading && (
          <div className="text-center py-20 text-gray-400">
            {lang === 'ar' ? 'جاري البحث...' : 'Searching...'}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {properties.map(property => (
            <div key={property.id} className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition">
              <div className="relative">
                <img src={property.image_url} className="w-full h-48 object-cover" />
                <span className="absolute top-3 right-3 bg-yellow-500 text-white text-xs px-2 py-1 rounded font-bold">
                  {property.type === 'villa' ? (lang === 'ar' ? 'فيلا' : 'Villa') : (lang === 'ar' ? 'شقة' : 'Apt')}
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-black text-gray-900 mb-1">
                  {lang === 'ar' ? property.title_ar : property.title_en}
                </h3>
                <p className="text-gray-400 text-xs mb-3">📍 {property.location}</p>
                <div className="flex gap-3 text-gray-500 text-xs mb-4">
                  <span>🛏 {property.bedrooms}</span>
                  <span>🚿 {property.bathrooms}</span>
                  <span>👥 {property.max_guests}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-yellow-600 font-black text-lg">{property.price_per_night}</span>
                    <span className="text-gray-400 text-xs"> {lang === 'ar' ? 'ريال/ليلة' : 'SAR/Night'}</span>
                  </div>
                  <Link href={`/property/${property.id}`}
                    className="bg-yellow-600 hover:bg-yellow-500 text-white text-xs px-3 py-2 rounded-lg font-bold transition">
                    {lang === 'ar' ? 'احجز' : 'Book'}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {!loading && properties.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-gray-400">{lang === 'ar' ? 'لا نتائج' : 'No results found'}</p>
          </div>
        )}

      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-400">جاري التحميل...</div>}>
      <SearchContent />
    </Suspense>
  )
}