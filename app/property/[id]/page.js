'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { useLang } from '../../context/LanguageContext'
import { useParams, useSearchParams } from 'next/navigation' // ✅ أضفنا useSearchParams
import Link from 'next/link'
import Image from 'next/image' // ✅ استيراد Image لمنع مشاكل الـ Linting

export default function PropertyPage() {
  const { id } = useParams()
  const { lang } = useLang()
  const searchParams = useSearchParams() // ✅ لقراءة التواريخ والضيوف من الرابط
  
  const [property, setProperty] = useState(null)
  const [images, setImages] = useState([])
  const [activeImg, setActiveImg] = useState(0)
  const [loading, setLoading] = useState(true)

  // قراءة القيم القادمة من شريط البحث
  const checkIn = searchParams.get('checkIn')
  const checkOut = searchParams.get('checkOut')
  const guestsCount = parseInt(searchParams.get('guests')) || 2 // افتراضي شخصين إذا لم يحدد

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('properties')
        .select('*, property_images(url)')
        .eq('id', id)
        .single()

      setProperty(data)

      const allImages = [
        data?.image_url,
        ...(data?.property_images?.map(img => img.url) || [])
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

  // 🧮 --- منطق حساب السعر المتطور (شبه بوكينق) ---
  
  // 1. حساب عدد الليالي
  let nights = 0
  if (checkIn && checkOut) {
    const diffTime = Math.abs(new Date(checkOut) - new Date(checkIn))
    nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1
  } else {
    nights = 1 // افتراضي ليلة واحدة إذا تصفح بدون تحديد تاريخ
  }

  // 2. حساب السعر بناءً على الأشخاص (السعر الأساسي يشمل شخصين، وكل شخص زيادة بـ 50 ريال)
  const basePricePerNight = property.price_per_night
  const extraGuestFee = 50 // 💡 يمكنك تعديل قيمة الزيادة للشخص الواحد هنا
  const baseGuestsLimit = 2

  let finalPricePerNight = basePricePerNight
  if (guestsCount > baseGuestsLimit) {
    const extraGuests = guestsCount - baseGuestsLimit
    finalPricePerNight += extraGuests * extraGuestFee
  }

  // 3. الحسبة الإجمالية النهائية
  const totalAmount = finalPricePerNight * nights

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Gallery */}
        <div className="rounded-2xl overflow-hidden mb-6">
          {/* الصورة الكبيرة */}
          <div className="relative h-80 w-full">
            <Image
              src={images[activeImg]}
              alt={property.title_en}
              fill
              priority
              className="object-cover"
            />
            {images.length > 1 && (
              <span className="absolute bottom-3 left-3 bg-black/60 text-white text-xs px-2 py-1 rounded-lg z-10">
                {activeImg + 1} / {images.length}
              </span>
            )}
          </div>

          {/* الصور المصغرة */}
          {images.length > 1 && (
            <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <div 
                  key={i} 
                  onClick={() => setActiveImg(i)}
                  className={`relative w-20 h-14 rounded-lg overflow-hidden cursor-pointer shrink-0 transition ${
                    activeImg === i ? 'ring-2 ring-yellow-500 opacity-100' : 'opacity-60 hover:opacity-100'
                  }`}
                >
                  <Image
                    src={img}
                    alt={`thumbnail ${i}`}
                    fill
                    className="object-cover"
                  />
                </div>
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

          {/* شباك الحجز الديناميكي شبه بوكينق */}
          <div>
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24 border border-gray-100">
              
              {/* عرض تفاصيل الحسبة */}
              <div className="border-b pb-4 mb-4">
                <div className="text-xs text-gray-400 mb-1">{lang === 'ar' ? 'السعر لليلة (حسب الضيوف):' : 'Price per night (based on guests):'}</div>
                <div className="text-2xl font-black text-yellow-600">
                  {finalPricePerNight} <span className="text-xs text-gray-400 font-normal">{lang === 'ar' ? 'ريال / ليلة' : 'SAR / Night'}</span>
                </div>
                {guestsCount > baseGuestsLimit && (
                  <p className="text-[10px] text-green-600 mt-1">
                    *{lang === 'ar' ? `شامل زيادة ضيوف إضافيين عدد (${guestsCount - baseGuestsLimit})` : `*Includes extra guest fees for (${guestsCount - baseGuestsLimit}) guests`}
                  </p>
                )}
              </div>

              {/* ملخص الحسبة الكاملة */}
              <div className="flex flex-col gap-2 mb-6 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>{lang === 'ar' ? 'عدد الضيوف:' : 'Guests:'}</span>
                  <span className="font-bold text-gray-800">{guestsCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>{lang === 'ar' ? 'عدد الليالي:' : 'Nights:'}</span>
                  <span className="font-bold text-gray-800">{nights} {lang === 'ar' ? 'ليالي' : 'Nights'}</span>
                </div>
                <div className="flex justify-between border-t pt-2 mt-2 text-base">
                  <span className="font-black text-gray-900">{lang === 'ar' ? 'المجموع الإجمالي:' : 'Total Amount:'}</span>
                  <span className="font-black text-yellow-600 text-xl">{totalAmount} {lang === 'ar' ? 'ريال' : 'SAR'}</span>
                </div>
              </div>

              {/* تمرير الحسبة والبيانات الكاملة لصفحة تثبيت الحجز والدفع النهائي */}
              <Link
                href={`/booking/${property.id}?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guestsCount}&totalPrice=${totalAmount}`}
                className="block w-full bg-yellow-600 hover:bg-yellow-500 text-white text-center font-black py-3 rounded-xl transition"
              >
                {lang === 'ar' ? 'احجز الآن' : 'Book Now'}
              </Link>

              <a
                href="https://wa.me/966500721012"
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