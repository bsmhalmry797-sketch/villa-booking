'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useLang } from '../context/LanguageContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
export default function ProfilePage() {
  const { lang } = useLang()
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('current')
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [confirmCancel, setConfirmCancel] = useState(null)
  const [cancelSuccess, setCancelSuccess] = useState(false)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth'); return }
    setUser(user)

    const { data: profileData } = await supabase
      .from('profiles').select('*').eq('id', user.id).single()
    setProfile(profileData)
    setName(profileData?.name || '')
    setPhone(profileData?.phone || '')

    const { data: bookingsData } = await supabase
      .from('bookings')
      .select('*, properties(title_ar, title_en, image_url, price_per_night)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setBookings(bookingsData || [])
    setLoading(false)
  }

  async function saveProfile() {
  await supabase.from('profiles').update({ name, phone }).eq('id', user.id)
  setProfile(prev => ({ ...prev, name, phone }))
  setEditing(false)
  toast.success(lang === 'ar' ? '✅ تم حفظ التغييرات' : '✅ Changes saved')
}

async function cancelBooking(bookingId) {
  await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', bookingId)
  setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b))
  setConfirmCancel(null)
  toast.success(lang === 'ar' ? '✅ تم إلغاء الحجز' : '✅ Booking cancelled')
}

  // تصفية الحجوزات حسب التاب
  const today = new Date().toISOString().split('T')[0]
  const currentBookings = bookings.filter(b => b.status !== 'cancelled' && b.check_out >= today)
  const pastBookings = bookings.filter(b => b.status !== 'cancelled' && b.check_out < today)
  const cancelledBookings = bookings.filter(b => b.status === 'cancelled')

  const tabs = [
    { key: 'current', ar: 'الحالية', en: 'Current', count: currentBookings.length },
    { key: 'past', ar: 'السابقة', en: 'Past', count: pastBookings.length },
    { key: 'cancelled', ar: 'الملغية', en: 'Cancelled', count: cancelledBookings.length },
  ]

  const activeBookings =
    activeTab === 'current' ? currentBookings :
    activeTab === 'past' ? pastBookings : cancelledBookings

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700'
  }
  const statusLabel = {
    pending: { ar: 'قيد الانتظار', en: 'Pending' },
    confirmed: { ar: 'مؤكد', en: 'Confirmed' },
    cancelled: { ar: 'ملغي', en: 'Cancelled' }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-400">جاري التحميل...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4">
      <div className="max-w-3xl mx-auto">

        {/* رسالة إلغاء ناجح */}
        {cancelSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-2xl mb-4 text-center font-bold">
            ✅ {lang === 'ar' ? 'تم إلغاء حجزك بنجاح' : 'Booking cancelled successfully'}
          </div>
        )}
<Link
  href="/"
  className="flex items-center gap-2 text-gray-500 hover:text-yellow-600 transition mb-4 text-sm font-bold"
>
  → {lang === 'ar' ? 'الرئيسية' : 'Home'}
</Link>
        {/* بيانات المستخدم */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4"><div className="w-16 h-16 bg-yellow-600 rounded-full flex items-center justify-center text-black font-black text-2xl">
                {user?.email[0].toUpperCase()}
              </div>
              <div>
                <h1 className="text-xl font-black text-gray-900">{profile?.name || user?.email}</h1>
                <p className="text-gray-400 text-sm">{user?.email}</p>
                {profile?.phone && <p className="text-gray-400 text-sm">📞 {profile.phone}</p>}
              </div>
            </div>
            <button
              onClick={() => setEditing(!editing)}
              className="text-yellow-600 font-bold text-sm hover:text-yellow-500"
            >
              {editing
                ? (lang === 'ar' ? 'إلغاء' : 'Cancel')
                : (lang === 'ar' ? 'تعديل' : 'Edit')}
            </button>
          </div>

          {/* فورم التعديل */}
          {editing && (
            <div className="border-t pt-4 flex flex-col gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  {lang === 'ar' ? 'الاسم' : 'Name'}
                </label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-yellow-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  {lang === 'ar' ? 'رقم الجوال' : 'Phone'}
                </label>
                <input
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-yellow-500"
                />
              </div>
              <button
                onClick={saveProfile}
                className="bg-yellow-600 hover:bg-yellow-500 text-black font-black py-2 rounded-lg transition"
              >
                {lang === 'ar' ? 'حفظ التغييرات' : 'Save Changes'}
              </button>
            </div>
          )}
          
        </div>

        {/* التابات */}
        <div className="flex gap-2 mb-4">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2 rounded-xl font-bold text-sm transition ${
                activeTab === tab.key
                  ? 'bg-yellow-600 text-white'
                  : 'bg-white text-gray-500 hover:bg-gray-100'
              }`}
            >
              {lang === 'ar' ? tab.ar : tab.en}
              {tab.count > 0 && (
                <span className={`mr-1 text-xs ${activeTab === tab.key ? 'text-yellow-200' : 'text-gray-400'}`}>
                  ({tab.count})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* الحجوزات */}
        {activeBookings.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-gray-400">
              {lang === 'ar' ? 'لا توجد حجوزات' : 'No bookings'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {activeBookings.map(booking => (
              <div key={booking.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="flex gap-4 p-4">
                  <img
                    src={booking.properties?.image_url}
                    className="w-24 h-20 rounded-xl object-cover shrink-0"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <h3 className="font-black text-gray-900">
                        {lang === 'ar' ? booking.properties?.title_ar : booking.properties?.title_en}
                      </h3><span className={`text-xs px-2 py-1 rounded-full font-bold ${statusColors[booking.status]}`}>
                        {lang === 'ar' ? statusLabel[booking.status].ar : statusLabel[booking.status].en}
                      </span>
                    </div>
                    <p className="text-gray-500 text-xs mt-1">
                      📅 {booking.check_in} → {booking.check_out}
                    </p>
                    <p className="text-yellow-600 font-black text-sm mt-1">
                      {booking.total_price} {lang === 'ar' ? 'ريال' : 'SAR'}
                    </p>
                  </div>
                </div>

                {/* زر الإلغاء */}
                {booking.status === 'pending' && activeTab === 'current' && (
                  <div className="border-t px-4 py-3">
                    <button
                      onClick={() => setConfirmCancel(booking.id)}
                      className="text-red-500 text-sm font-bold hover:text-red-700"
                    >
                      {lang === 'ar' ? 'إلغاء الحجز' : 'Cancel Booking'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* نافذة تأكيد الإلغاء */}
        {confirmCancel && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center">
              <div className="text-4xl mb-3">⚠️</div>
              <h3 className="font-black text-lg mb-2">
                {lang === 'ar' ? 'تأكيد الإلغاء' : 'Confirm Cancellation'}
              </h3>
              <p className="text-gray-500 text-sm mb-6">
                {lang === 'ar' ? 'هل أنت متأكد من إلغاء هذا الحجز؟' : 'Are you sure you want to cancel?'}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => cancelBooking(confirmCancel)}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-black py-2 rounded-xl transition"
                >
                  {lang === 'ar' ? 'نعم، إلغاء' : 'Yes, Cancel'}
                </button>
                <button
                  onClick={() => setConfirmCancel(null)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-black py-2 rounded-xl transition"
                >
                  {lang === 'ar' ? 'لا، رجوع' : 'No, Back'}
                </button>
              </div>
              
            </div>
          </div>
        )}

      </div>
    </div>
  )
}