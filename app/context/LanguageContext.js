'use client'

import { createContext, useContext, useState } from 'react'

// 1. إنشاء الصندوق
const LanguageContext = createContext()

// 2. كل النصوص باللغتين
export const translations = {
  ar: {
    bookNow: 'احجز الآن',
    checkIn: 'تاريخ الوصول',
    checkOut: 'تاريخ المغادرة',
    guests: 'الضيوف',
    search: 'ابحث عن توفر',
    open: 'التقديم مفتوح',
    propertiesTitle: 'الشقق والفلل',
    perNight: 'ريال/ليلة',
    smartCheckin: 'دخول ذكي',
    wifi: 'إنترنت مجاني',
    parking: 'موقف خاص',
    cleaning: 'نظافة يومية',
    bookYourStay: ' احجز اقامتك',
        happyGuests: 'ضيوف سعداء',
propertiesCount: 'شقة وفيلا',
rating: 'تقييم الضيوف',
clean: 'نظافة وتعقيم',
  },
  en: {
    bookNow: 'Book Now',
    checkIn: 'Check-in',
    checkOut: 'Check-out',
    guests: 'Guests',
    search: 'Check Availability',
    open: 'Bookings Open',
    propertiesTitle: 'Villas & Apartments',
    perNight: 'SAR/Night',
    smartCheckin: 'Smart Check-in',
    wifi: 'Free Wi-Fi',
    parking: 'Private Parking',
    cleaning: 'Daily Cleaning',
    bookYourStay: ' book Your Stay',
    happyGuests: 'Happy Guests',
propertiesCount: 'Villas & Apartments',
rating: 'Guest Rating',
clean: 'Clean & Sanitized',

  }
}

// 3. المزود — يغلف كل التطبيق
export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('ar')

  const toggle = () => setLang(prev => prev === 'ar' ? 'en' : 'ar')

  return (
    <LanguageContext.Provider value={{ lang, toggle, t: translations[lang] }}>
      <div dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        {children}
      </div>
    </LanguageContext.Provider>
  )
}

// 4. Hook مخصص للاستخدام في أي component
export const useLang = () => useContext(LanguageContext)