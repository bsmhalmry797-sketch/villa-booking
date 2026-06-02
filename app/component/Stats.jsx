'use client'

import { useLang } from '../context/LanguageContext'

export default function Stats() {
  const { t } = useLang()

  const stats = [
    { number: '+500', label: t.happyGuests },
    { number: '+50', label: t.propertiesCount },
    { number: '4.8 ⭐', label: t.rating },
    { number: '100%', label: t.clean },
  ]

  return (
    <section className="bg-gray-900 text-white py-14 px-4">
      <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        {stats.map((item, index) => (
          <div key={index}>
            <h3 className="text-4xl font-black text-yellow-400 mb-2">{item.number}</h3>
            <p className="text-white font-bold text-sm">{item.label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}