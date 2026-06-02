'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { useLang } from '../../context/LanguageContext'
import { useParams, useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
export default function BookingPage() {
  const { id } = useParams()
  const { lang } = useLang()
  const router = useRouter()

  const [property, setProperty] = useState(null)
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState(1)
  const [discount, setDiscount] = useState('')
  const [discountAmount, setDiscountAmount] = useState(0)
  const [loading, setLoading] = useState(false)
const { error: bookError } = await supabase
  .from('bookings')
  .insert({
    property_id: id,
    user_id: user.id,
    check_in: checkIn,
    check_out: checkOut,
    guests,
    total_price: totalPrice,
    status: 'confirmed' // ← تأكيد تلقائي
  })

if (bookError) {
  toast.error(lang === 'ar' ? 'حدث خطأ، حاولي مرة ثانية' : 'Error, please try again')
} else {
  toast.success(lang === 'ar' ? '✅ تم تأكيد حجزك!' : '✅ Booking confirmed!')
  setSuccess(true)
}  const [success, setSuccess] = useState(false)

  // جيبي بيانات العقار
  useEffect(() => {
    supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data }) => setProperty(data))
  }, [id])

  // حساب عدد الليالي
  const nights = checkIn && checkOut
    ? Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24))
    : 0

  // حساب السعر
  const originalPrice = nights * (property?.price_per_night || 0)
  const totalPrice = originalPrice - discountAmount

  // التحقق من كود الخصم
  function applyDiscount() {
    if (discount === 'VILLA10') {
      setDiscountAmount(originalPrice * 0.10)
      setError('')
    } else if (discount === 'VILLA20') {
      setDiscountAmount(originalPrice * 0.20)
      setError('')
    } else {
      setDiscountAmount(0)
      setError(lang === 'ar' ? 'كود الخصم غير صحيح' : 'Invalid discount code')
    }
  }

  async function handleBooking() {
    // تحقق من البيانات
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

    // تحقق من المستخدم
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth')
      return
    }

    // تحقق من تعارض التواريخ
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

    // إنشاء الحجز
    const { error: bookError } = await supabase
      .from('bookings')
      .insert({
        property_id: id,
        user_id: user.id,
        check_in: checkIn,
        check_out: checkOut,
        guests,
        total_price: totalPrice,
        status: 'pending'
      })

    if (bookError) {
      setError(bookError.message)
    } else {
      setSuccess(true)
    }

    setLoading(false)
  }

  // صفحة النجاح
  if (success) return (
    <div className="min-h-screen bg-black flex items-center justify-center text-center p-4">
      <div>
        <div className="text-7xl mb-6">✅</div>
        <h2 className="text-2xl font-black text-yellow-400 mb-2">
          {lang === 'ar' ? 'ياهلا بك تم الحجز بنجاح!' : 'Booking Confirmed!'}
        </h2>
        <p className="text-gray-400 mb-6">
          {lang === 'ar' ? 'سيتواصل معك الفريق قريباً' : 'Our team will contact you soon'}
        </p>
        <a
          href="/"
          className="bg-yellow-600 text-black font-black px-8 py-3 rounded-xl"
        >
          {lang === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}
        </a>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4">
      <div className="max-w-lg mx-auto">

        {/* العنوان */}
        <h1 className="text-2xl font-black text-gray-900 mb-6">
          {lang === 'ar' ? 'إتمام الحجز' : 'Complete Booking'}
        </h1>

        {/* معلومات العقار */}
        {property && (<div className="bg-white rounded-2xl p-4 mb-4 flex gap-4 items-center shadow-sm">
            <img
              src={property.image_url}
              className="w-20 h-16 rounded-xl object-cover"
            />
            <div>
              <h3 className="font-black text-gray-900">
                {lang === 'ar' ? property.title_ar : property.title_en}
              </h3>
              <p className="text-yellow-600 font-bold text-sm">
                {property.price_per_night} {lang === 'ar' ? 'ريال/ليلة' : 'SAR/Night'}
              </p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm p-6 mb-4">

          {/* التواريخ */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                {lang === 'ar' ? 'تاريخ الدخول' : 'Check-in'}
              </label>
              <input
                type="date"
                value={checkIn}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => setCheckIn(e.target.value)}
                className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-yellow-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                {lang === 'ar' ? 'تاريخ الخروج' : 'Check-out'}
              </label>
              <input
                type="date"
                value={checkOut}
                min={checkIn}
                onChange={e => setCheckOut(e.target.value)}
                className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-yellow-500"
              />
            </div>
          </div>

          {/* عدد الضيوف */}
          <div className="mb-4">
            <label className="block text-xs text-gray-500 mb-1">
              {lang === 'ar' ? 'عدد الضيوف' : 'Guests'}
            </label>
            <input
              type="number"
              min="1"
              max={property?.max_guests}
              value={guests}
              onChange={e => setGuests(e.target.value)}
              className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-yellow-500"
            />
          </div>

          {/* كود الخصم */}
          <div className="mb-4">
            <label className="block text-xs text-gray-500 mb-1">
              {lang === 'ar' ? 'كود الخصم (اختياري)' : 'Discount Code (optional)'}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={discount}
                onChange={e => setDiscount(e.target.value.toUpperCase())}
                placeholder="VILLA10"
                className="flex-1 border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-yellow-500"
              />
              <button
                onClick={applyDiscount}
                className="bg-gray-100 hover:bg-gray-200 px-4 rounded-lg text-sm font-bold transition"
              >
                {lang === 'ar' ? 'تطبيق' : 'Apply'}
              </button>
            </div>
          </div>

          {/* الخطأ */}
          {error && (
            <div className="bg-red-50 text-red-500 text-sm p-3 rounded-lg mb-4">
              {error}
            </div>
          )}

        </div>

        {/* ملخص السعر */}
        {nights > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-4">
            <h3 className="font-black mb-4">
              {lang === 'ar' ? 'ملخص السعر' : 'Price Summary'}
            </h3>

            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500">
                {property?.price_per_night} × {nights} {lang === 'ar' ? 'ليلة' : 'nights'}
              </span>
              <span>{originalPrice} {lang === 'ar' ? 'ريال' : 'SAR'}</span>
            </div>

            {discountAmount > 0 && (<div className="flex justify-between text-sm mb-2 text-green-600">
                <span>{lang === 'ar' ? 'خصم' : 'Discount'}</span>
                <span>- {discountAmount} {lang === 'ar' ? 'ريال' : 'SAR'}</span>
              </div>
            )}

            <div className="border-t pt-3 mt-3 flex justify-between font-black text-lg">
              <span>{lang === 'ar' ? 'الإجمالي' : 'Total'}</span>
              <span className="text-yellow-600">
                {totalPrice} {lang === 'ar' ? 'ريال' : 'SAR'}
              </span>
            </div>
          </div>
        )}

        {/* زر الحجز */}
        <button
          onClick={handleBooking}
          disabled={loading}
          className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-black py-4 rounded-2xl text-lg transition"
        >
          {loading ? '...' : lang === 'ar' ? 'تأكيد الحجز' : 'Confirm Booking'}
        </button>

      </div>
    </div>
  )
}