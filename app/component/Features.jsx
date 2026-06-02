'use client'

import { useLang } from '../context/LanguageContext'

export default function Features() {
  const { t } = useLang()

  const features = [
    { icon: '', text: t.smartCheckin },
    { icon: '', text: t.wifi },
    { icon: '', text: t.parking },
    { icon: '', text: t.cleaning },
  ]

  return (
    <section className="py-10 bg-gray-50">
      <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 px-4">
        {features.map((item, index) => (
          <div key={index} className="flex flex-col items-center text-center gap-2">
            <span className="text-4xl">{item.icon}</span>
            <span className="font-bold text-gray-800">{item.text}</span>
          </div>
        ))}
      </div>
    </section>
  )
}