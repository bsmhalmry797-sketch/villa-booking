'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { useLang } from '../../context/LanguageContext'
import { useParams } from 'next/navigation'
import Link from 'next/link'

export default function PropertyPage() {
  const { id } = useParams()
  const { lang } = useLang()
  const [property, setProperty] = useState(null)
  const [images, setImages] = useState([])
  const [activeImg, setActiveImg] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('properties')
        .select('*, property_images(url)')
        .eq('id', id)
        .single()

      setProperty(data)

      const allImages = [
        data.image_url,
        ...(data.property_images?.map(img => img.url) || [])
      ].filter(Boolean)

      setImages(allImages)
      setLoading(false)
    }
    load()
  }, [id])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-400">جاري التحميل...</p>
    </div>
  )

  if (!property) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-400">العقار غير موجود</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Gallery */}
        <div className="rounded-2xl overflow-hidden mb-6">

          {/* الصورة الكبيرة */}
          <div className="relative">
            <img
              src={images[activeImg]}
              alt={property.title_en}
              className="w-full h-80 object-cover"
            />
            {images.length > 1 && (
              <span className="absolute bottom-3 left-3 bg-black/60 text-white text-xs px-2 py-1 rounded-lg">
                {activeImg + 1} / {images.length}
              </span>
            )}
          </div>

          {/* الصور المصغرة */}
          {images.length > 1 && (
            <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  onClick={() => setActiveImg(i)}
                  className={`w-20 h-14 rounded-lg object-cover cursor-pointer flex-shrink-0 transition ${
                    activeImg === i
                      ? 'ring-2 ring-yellow-500 opacity-100'
                      : 'opacity-60 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* المعلومات */}
          <div className="md:col-span-2">

            <div className="flex items-center gap-3 mb-2">
              <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded font-bold">
                {property.type === 'villa'
                  ? (lang === 'ar' ? 'فيلا' : 'Villa')
                  : (lang === 'ar' ? 'شقة' : 'Apartment')}
              </span>
            </div>

            <h1 className="text-2xl font-black text-gray-900 mb-1">
              {lang === 'ar' ? property.title_ar : property.title_en}
            </h1>

            <p className="text-gray-500 text-sm mb-6">📍 {property.location}</p>

            {/* التفاصيل */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                <div className="text-2xl mb-1">🛏</div>
                <div className="font-black text-gray-900">{property.bedrooms}</div>
                <div className="text-xs text-gray-400">{lang === 'ar' ? 'غرف' : 'Bedrooms'}</div>
              </div>
              <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                <div className="text-2xl mb-1">🚿</div>
                <div className="font-black text-gray-900">{property.bathrooms}</div>
                <div className="text-xs text-gray-400">{lang === 'ar' ? 'حمامات' : 'Bathrooms'}</div>
              </div>
              <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                <div className="text-2xl mb-1">👥</div>
                <div className="font-black text-gray-900">{property.max_guests}</div>
                <div className="text-xs text-gray-400">{lang === 'ar' ? 'ضيوف' : 'Guests'}</div>
              </div>
            </div>

          </div>

          {/* السعر والحجز */}
          <div>
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <div className="text-3xl font-black text-yellow-600 mb-1">
                {property.price_per_night}
              </div>
              <div className="text-gray-400 text-sm mb-6">
                {lang === 'ar' ? 'ريال / ليلة' : 'SAR / Night'}
              </div>

              <Link
                href={`/booking/${property.id}`}
                className="block w-full bg-yellow-600 hover:bg-yellow-500 text-white text-center font-black py-3 rounded-xl transition"
              >
                {lang === 'ar' ? 'احجز الآن' : 'Book Now'}
              </Link>

              <a
                href="https://wa.me/966590919995"
                target="_blank"
                className="block w-full mt-3 border border-green-500 text-green-600 text-center font-bold py-3 rounded-xl hover:bg-green-50 transition text-sm"
              >
                💬 {lang === 'ar' ? 'تواصل واتساب' : 'WhatsApp'}
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
