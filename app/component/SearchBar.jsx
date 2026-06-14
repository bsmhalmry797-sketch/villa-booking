'use client'

import { useState } from 'react'
import { useLang } from '../context/LanguageContext'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast' // 💡 اختياري: لتنبيه المستخدم إذا لم يختر التاريخ

export default function SearchBar() {
  const { t, lang } = useLang()
  const router = useRouter()

  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState(2)

  function handleSearch(e) {
    // ✅ منع أي سلوك افتراضي قد يعطل التنقل في بعض المتصفحات
    e.preventDefault()

    // 🔍 تحقق: التأكد من أن المستخدم اختار التواريخ قبل الانتقال
    if (!checkIn || !checkOut) {
      toast.error(
        lang === 'ar' 
          ? '⚠️ الرجاء اختيار تاريخ الوصول والمغادرة' 
          : '⚠️ Please select check-in and check-out dates'
      )
      return
    }

    // ✅ بناء الـ URL والتوجه فوراً لصفحة البحث
    router.push(`/search?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`)
  }

  return (
    <section className="relative -mt-16 z-20 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-6">

        <div className="flex items-center justify-between mb-4">
          <h3 className="font-black text-xl text-gray-800">{t.bookYourStay}</h3>
          <span className="text-green-600 text-sm font-bold">✅ {t.open}</span>
        </div>

        {/* ✅ تحويل الديف الخارجي إلى <form> ليدعم الـ Accessibility وضغط زر Enter في الكيبورد */}
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">

          <div>
            <label className="block text-xs text-gray-500 mb-1">{t.checkIn}</label>
            <input
              type="date"
              value={checkIn}
              min={new Date().toISOString().split('T')[0]}
              onChange={e => setCheckIn(e.target.value)}
              className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-yellow-500"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">{t.checkOut}</label>
            <input
              type="date"
              value={checkOut}
              min={checkIn || new Date().toISOString().split('T')[0]} // يمنع اختيار تاريخ مغادرة قبل تاريخ الوصول
              onChange={e => setCheckOut(e.target.value)}
              className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-yellow-500"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">{t.guests}</label>
            <input
              type="number"
              min="1"
              max="20"
              value={guests}
              onChange={e => setGuests(parseInt(e.target.value) || 1)} // التأكد من حفظها كرقم دائماً
              className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-yellow-500"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit" // ✅ تحديد النوع كـ submit ليعمل مع نموذج الـ form تلقائياً
              className="w-full bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded-lg transition"
            >
              {t.search}
            </button>
          </div>

        </form>
      </div>
    </section>
  )
}