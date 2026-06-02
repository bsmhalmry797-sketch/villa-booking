'use client'

import { useLang } from '../context/LanguageContext'

export default function Footer() {
  const { lang, t } = useLang()

  return (
    <footer className="bg-black text-white py-12 px-4">
      <div className="max-w-6xl mx-auto">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">

          {/* اللوجو */}
          <div>
            <h3 className="text-yellow-400 font-black text-xl mb-2">
              {lang === 'ar' ? 'فيلا و شقق الضيافة' : 'Hospitality Villas'}
            </h3>
            <p className="text-gray-500 text-xs mt-2">
              {lang === 'ar' ? 'الدمام، المملكة العربية السعودية' : 'Dammam, Saudi Arabia'}
            </p>
          </div>

          {/* روابط */}
          <div>
            <h4 className="font-bold mb-3 text-gray-300">
              {lang === 'ar' ? 'روابط سريعة' : 'Quick Links'}
            </h4>
            <div className="flex flex-col gap-2">
              <a href="#" className="text-gray-400 text-sm hover:text-yellow-400 transition">
                {lang === 'ar' ? 'الرئيسية' : 'Home'}
              </a>
              <a href="#" className="text-gray-400 text-sm hover:text-yellow-400 transition">
                {lang === 'ar' ? 'الشقق والفلل' : 'Properties'}
              </a>
            </div>
          </div>

          {/* تواصل */}
          <div>
            <h4 className="font-bold mb-3 text-gray-300">
              {lang === 'ar' ? 'تواصل معنا' : 'Contact Us'}
            </h4>
            <div className="flex flex-col gap-2">
              <a href="tel:0590919995" className="text-gray-400 text-sm hover:text-yellow-400 transition">
                📞 0590919995
              </a>
              <a href="https://wa.me/966590919995" className="text-gray-400 text-sm hover:text-yellow-400 transition">
                💬 {lang === 'ar' ? 'واتساب' : 'WhatsApp'}
              </a>
            </div>
          </div>

        </div>

        {/* الكوبيرايت */}
        <div className="border-t border-gray-800 pt-6 text-center">
          <p className="text-gray-500 text-xs">
            © 2026 Hospitality Villas & Apartments
          </p>
        </div>

      </div>
    </footer>
  )
}