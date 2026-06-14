'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { useLang } from '../../context/LanguageContext'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import toast from 'react-hot-toast'
import Link from 'next/link'
import Image from 'next/image'

export default function BookingPage() {
  const { id } = useParams()
  const { lang } = useLang()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [property, setProperty] = useState(null)
  
  const [checkIn, setCheckIn] = useState(searchParams.get('checkIn') || '')
  const [checkOut, setCheckOut] = useState(searchParams.get('checkOut') || '')
  const [guests, setGuests] = useState(parseInt(searchParams.get('guests')) || 2)
  
  const [discount, setDiscount] = useState('')
  const [discountAmount, setDiscountAmount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    supabase.from('properties').select('*').eq('id', id).single()
      .then(({ data }) => setProperty(data))
  }, [id])

  // 1. حساب عدد الليالي بشكل آمن ديناميكي
  const nights = checkIn && checkOut
    ? Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24))
    : 0

  // 🧮 2. معادلة حساب السعر المتطور لليلة الواحدة
  const basePricePerNight = property?.price_per_night || 0
  const extraGuestFee = 50 
  const baseGuestsLimit = 2

  let currentPricePerNight = basePricePerNight
  if (guests > baseGuestsLimit) {
    const extraGuestsCount = guests - baseGuestsLimit
    currentPricePerNight += extraGuestsCount * extraGuestFee
  }

  // 3. الحسبة الإجمالية النهائية والخصم
  const originalPrice = nights * currentPricePerNight
  const totalPrice = Math.max(0, originalPrice - discountAmount)

  // دالة مساعدة لتصفير كود الخصم فوراً عند تعديل أي مدخلات لمنع مشاكل الحسبة
  const resetDiscount = () => {
    setDiscountAmount(0)
    setDiscount('')
  }

  function applyDiscount() {
    if (discount === 'VILLA10') {
      setDiscountAmount(originalPrice * 0.10)
      setError('')
      toast.success('✅ خصم 10% تم تطبيقه!')
    } else if (discount === 'VILLA20') {
      setDiscountAmount(originalPrice * 0.20)
      setError('')
      toast.success('✅ خصم 20% تم تطبيقه!')
    } else {
      setDiscountAmount(0)
      setError(lang === 'ar' ? 'كود الخصم غير صحيح' : 'Invalid discount code')
    }
  }

  async function handleBooking() {
    if (!checkIn || !checkOut) {
      setError(lang === 'ar' ? 'اختار التواريخ' : 'Select dates')
      return
    }
    if (nights <= 0) {
      setError(lang === 'ar' ? 'تاريخ الخروج يجب أن يكون بعد الدخول' : 'Check-out must be after check-in')
      return
    }

    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth')
      return
    }

    const { data: conflicts } = await supabase
      .from('bookings')
      .select('id')
      .eq('property_id', id)
      .neq('status', 'cancelled')
      .lt('check_in', checkOut)
      .gt('check_out', checkIn)

    if (conflicts && conflicts.length > 0) {
      setError(lang === 'ar' ? '❌ هذه التواريخ محجوزة، اختار تواريخ أخرى' : '❌ These dates are unavailable')
      setLoading(false)
      return
    }

    const { error: bookError } = await supabase.from('bookings').insert({
      property_id: id,
      user_id: user.id,
      check_in: checkIn,
      check_out: checkOut,
      guests: guests,
      total_price: totalPrice,
      status: 'confirmed'
    })

    if (bookError) {
      toast.error(lang === 'ar' ? 'حدث خطأ، حاول مرة ثانية' : 'Error, please try again')
    } else {
      const message = `🏠 حجز جديد !\nالعقار: ${lang === 'ar' ? property?.title_ar : property?.title_en}\nمن: ${checkIn}\nإلى: ${checkOut}\nالضيوف: ${guests}\nعدد الليالي: ${nights}\nالسعر لليلة: ${currentPricePerNight} ريال\nالإجمالي النهائي: ${totalPrice} ريال`

      await fetch('/api/send-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      })

      toast.success(lang === 'ar' ? '✅ تم تأكيد حجزك!' : '✅ Booking confirmed!')
      setSuccess(true)
    }

    setLoading(false)
  }

  if (success) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 pt-20">
      <div className="bg-white rounded-3xl shadow-xl max-w-md w-full p-6 border border-gray-100 relative overflow-hidden">
        
        <div className="absolute top-0 inset-x-0 h-2 bg-yellow-600"></div>

        <div className="text-center my-4">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-2">
            <span className="text-3xl text-green-500">✓</span>
          </div>
          <h2 className="text-xl font-black text-gray-900">
            {lang === 'ar' ? 'تم الحجز بنجاح!' : 'Booking Confirmed!'}
          </h2>
          <p className="text-gray-400 text-xs mt-1">
            {lang === 'ar' ? 'شكراً لثقتك بنا، إليك تفاصيل فاتورتك:' : 'Thank you, here are your invoice details:'}
          </p>
        </div>

        <div className="bg-gray-50 rounded-2xl p-4 my-6 border border-dashed border-gray-200 flex flex-col gap-3 text-sm">
          
          <div className="flex justify-between items-start border-b border-gray-200/60 pb-2">
            <span className="text-gray-400 text-xs">{lang === 'ar' ? 'العقار' : 'Property'}</span>
            <span className="font-black text-gray-800 text-right max-w-[200px] truncate">
              {lang === 'ar' ? property?.title_ar : property?.title_en}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-400 text-xs">{lang === 'ar' ? 'تاريخ الدخول' : 'Check-in'}</span>
            <span className="font-bold text-gray-700">{checkIn}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-400 text-xs">{lang === 'ar' ? 'تاريخ الخروج' : 'Check-out'}</span>
            <span className="font-bold text-gray-700">{checkOut}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-400 text-xs">{lang === 'ar' ? 'عدد الليالي' : 'Nights'}</span>
            <span className="font-bold text-gray-700">{nights} {lang === 'ar' ? 'ليالي' : 'Nights'}</span>
          </div>

          <div className="flex justify-between border-b border-gray-200/60 pb-2">
            <span className="text-gray-400 text-xs">{lang === 'ar' ? 'عدد الضيوف' : 'Guests'}</span>
            <span className="font-bold text-gray-700">{guests}</span>
          </div>

          <div className="flex justify-between text-xs text-gray-500">
            <span>{lang === 'ar' ? 'السعر الأساسي لليلة:' : 'Base price:'}</span>
            <span>{currentPricePerNight} {lang === 'ar' ? 'ريال' : 'SAR'}</span>
          </div>

          {discountAmount > 0 && (
            <div className="flex justify-between text-xs text-green-600 font-bold">
              <span>{lang === 'ar' ? 'الخصم المطبق:' : 'Applied Discount:'}</span>
              <span>- {discountAmount} {lang === 'ar' ? 'ريال' : 'SAR'}</span>
            </div>
          )}

          <div className="flex justify-between items-center border-t border-gray-200 pt-3 mt-1">
            <span className="font-black text-gray-900 text-base">{lang === 'ar' ? 'المبلغ الإجمالي' : 'Total Amount'}</span>
            <span className="font-black text-yellow-600 text-xl">{totalPrice} {lang === 'ar' ? 'ريال' : 'SAR'}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <button 
            onClick={() => window.print()}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 rounded-xl transition text-sm flex items-center justify-center gap-2"
          >
            🖨 {lang === 'ar' ? 'طباعة الفاتورة / حفظ PDF' : 'Print Invoice / Save PDF'}
          </button>

          <Link 
            href="/" 
            className="w-full bg-yellow-600 hover:bg-yellow-500 text-white text-center font-black py-3 rounded-xl transition text-sm block"
          >
            {lang === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}
          </Link>
        </div>

        <p className="text-center text-[10px] text-gray-400 mt-4">
          {lang === 'ar' ? 'تلقائياً، سيتواصل معك فريق الدعم لتأكيد آلية الدفع' : 'Support team will contact you shortly to arrange payment'}
        </p>

      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4">
      <div className="max-w-lg mx-auto">

        <h1 className="text-2xl font-black text-gray-900 mb-6">
          {lang === 'ar' ? 'إتمام الحجز' : 'Complete Booking'}
        </h1>

        {property && (
          <div className="bg-white rounded-2xl p-4 mb-4 flex gap-4 items-center shadow-sm">
            <div className="relative w-20 h-16 rounded-xl overflow-hidden shrink-0">
              <Image 
                src={property.image_url} 
                alt={property.title_en}
                fill 
                className="object-cover"
              />
            </div>
            <div>
              <h3 className="font-black text-gray-900">
                {lang === 'ar' ? property.title_ar : property.title_en}
              </h3>
              <p className="text-yellow-600 font-bold text-sm">
                {property.price_per_night} {lang === 'ar' ? 'ريال/ليلة' : 'SAR/Night (Base)'}
              </p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm p-6 mb-4">

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                {lang === 'ar' ? 'تاريخ الدخول' : 'Check-in'}
              </label>
              <input type="date" value={checkIn}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => { setCheckIn(e.target.value); resetDiscount(); }} // ✅ تصفير الخصم مباشرة عند تغيير التاريخ
                className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-yellow-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                {lang === 'ar' ? 'تاريخ الخروج' : 'Check-out'}
              </label>
              <input type="date" value={checkOut} min={checkIn}
                onChange={e => { setCheckOut(e.target.value); resetDiscount(); }} // ✅ تصفير الخصم مباشرة عند تغيير التاريخ
                className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-yellow-500"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs text-gray-500 mb-1">
              {lang === 'ar' ? 'عدد الضيوف' : 'Guests'}
            </label>
            <input 
              type="number" 
              min="1" 
              max={property?.max_guests || 20} 
              value={guests}
              onChange={e => { setGuests(parseInt(e.target.value) || 1); resetDiscount(); }} // ✅ تصفير الخصم مباشرة عند تغيير الضيوف
              className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-yellow-500"
            />
          </div>

          <div className="mb-4">
            <label className="block text-xs text-gray-500 mb-1">
              {lang === 'ar' ? 'كود الخصم (اختياري)' : 'Discount Code (optional)'}
            </label>
            <div className="flex gap-2">
              <input type="text" value={discount} placeholder="VILLA10"
                onChange={e => setDiscount(e.target.value.toUpperCase())}
                className="flex-1 border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-yellow-500"
              />
              <button onClick={applyDiscount}
                className="bg-gray-100 hover:bg-gray-200 px-4 rounded-lg text-sm font-bold transition">
                {lang === 'ar' ? 'تطبيق' : 'Apply'}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-500 text-sm p-3 rounded-lg mb-4">{error}</div>
          )}

        </div>

        {nights > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-4">
            <h3 className="font-black mb-4">{lang === 'ar' ? 'ملخص السعر' : 'Advanced Price Summary'}</h3>
            
            <div className="flex justify-between text-sm mb-2 text-gray-600">
              <span>
                {lang === 'ar' ? `سعر الليلة لـ (${guests}) ضيوف:` : `Price per night for (${guests}) guests:`}
              </span>
              <span className="font-bold text-gray-800">{currentPricePerNight} {lang === 'ar' ? 'ريال' : 'SAR'}</span>
            </div>

            <div className="flex justify-between text-sm mb-2 text-gray-500">
              <span>
                {currentPricePerNight} × {nights} {lang === 'ar' ? 'ليلة' : 'nights'}
              </span>
              <span>{originalPrice} {lang === 'ar' ? 'ريال' : 'SAR'}</span>
            </div>

            {guests > baseGuestsLimit && (
              <p className="text-[11px] text-green-600 mb-2">
                *{lang === 'ar' ? `تمت إضافة رسوم الضيوف الإضافيين (+${(guests - baseGuestsLimit) * extraGuestFee} ريال/ليلة)` : `*Extra guest charges included (+${(guests - baseGuestsLimit) * extraGuestFee} SAR/Night)`}
              </p>
            )}

            {discountAmount > 0 && (
              <div className="flex justify-between text-sm mb-2 text-green-600 border-t pt-2">
                <span>{lang === 'ar' ? 'خصم الكود' : 'Coupon Discount'}</span>
                <span>- {discountAmount} {lang === 'ar' ? 'ريال' : 'SAR'}</span>
              </div>
            )}

            <div className="border-t pt-3 mt-3 flex justify-between font-black text-lg">
              <span>{lang === 'ar' ? 'الإجمالي النهائي' : 'Final Total'}</span>
              <span className="text-yellow-600">{totalPrice} {lang === 'ar' ? 'ريال' : 'SAR'}</span>
            </div>
          </div>
        )}

        <button onClick={handleBooking} disabled={loading}
          className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-black py-4 rounded-2xl text-lg transition">
          {loading ? '...' : lang === 'ar' ? 'تأكيد الحجز' : 'Confirm Booking'}
        </button>

      </div>
    </div>
  )
}