'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useLang } from '../context/LanguageContext'
import Link from 'next/link'

export default function Properties() {
  const { lang, t } = useLang()

  // بيانات من قاعدة البيانات
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProperties()
  }, [])

  async function fetchProperties() {
    const { data, error } = await supabase
      .from('properties')
      .select('*')

    if (error) {
      console.log('خطأ:', error)
    } else {
      setProperties(data)
    }

    setLoading(false)
  }

  return (
    <section className="py-14 px-4 bg-white">
      <div className="max-w-6xl mx-auto">

        {/* العنوان */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-gray-900">{t.propertiesTitle}</h2>
          <div className="w-16 h-1 bg-yellow-500 mx-auto mt-3 rounded"></div>
        </div>

        {/* لودينق */}
        {loading && (
          <div className="text-center text-gray-400 py-20">
            جاري التحميل...
          </div>
        )}

        {/* الكروت */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {properties.map((property) => (
              <div key={property.id} className="rounded-2xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-xl transition">

                {/* الصورة + Badge */}
                <div className="relative">
                  <img
                    src={property.image_url}
                    alt={property.title_en}
                    className="w-full h-48 object-cover"
                  />
                  <span className="absolute top-3 right-3 bg-yellow-500 text-white text-xs px-2 py-1 rounded font-bold">
                    {lang === 'ar' ? property.type === 'villa' ? 'فيلا' : 'شقة' : property.type}
                  </span>
                </div>

                {/* المعلومات */}
                <div className="p-4">
                  <h3 className="font-black text-gray-900 mb-1">
                    {lang === 'ar' ? property.title_ar : property.title_en}
                  </h3>

                  {/* التفاصيل */}
                  <div className="flex gap-3 text-gray-500 text-xs mb-4">
                    <span>🛏 {property.bedrooms}</span>
                    <span>🚿 {property.bathrooms}</span>
                    <span>👥 {property.max_guests}</span>
                  </div>

                  {/* السعر والزر */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-yellow-600 font-black text-lg">{property.price_per_night}</span>
                      <span className="text-gray-400 text-xs"> {t.perNight}</span>
                    </div>
                    <Link
                      href={`/property/${property.id}`}
                      className="bg-yellow-600 hover:bg-yellow-500 text-white text-xs px-3 py-2 rounded-lg font-bold transition"
                    >
                      {t.bookNow}
                    </Link>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  )
}