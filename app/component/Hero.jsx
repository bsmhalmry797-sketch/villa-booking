'use client'

import { useLang } from '../context/LanguageContext'

export default function Hero() {
  const { lang, t } = useLang()

  return (
    <section
      className="min-h-screen flex items-center justify-center text-center text-white"
      style={{
        backgroundImage: 'linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920)',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="px-4">
        <h1 className="text-4xl font-black mb-2">
          {lang === 'ar' ? 'راحة تليق بك' : 'Comfort That Suits You'}
        </h1>
        <h2 className="text-4xl font-black text-yellow-400 mb-4">
          {lang === 'ar' ? '  الإيواء' : 'Hospitality Villas & Apartments'}
        </h2>
        <p className="text-lg text-gray-300 mb-1">
          {lang === 'ar' ? 'إقامة فاخرة • خصوصية تامة • موقع مميز  ' : 'Luxury stay • Full privacy • Prime location  '}
        </p>
      </div>
    </section>
  )
}