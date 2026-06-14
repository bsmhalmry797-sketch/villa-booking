'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useLang } from '../context/LanguageContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function AdminPage() {
  const { lang } = useLang()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [bookings, setBookings] = useState([])
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [titleAr, setTitleAr] = useState('')
  const [titleEn, setTitleEn] = useState('')
  const [type, setType] = useState('apartment')
  const [price, setPrice] = useState('')
  const [location, setLocation] = useState('')
  const [bedrooms, setBedrooms] = useState('')
  const [bathrooms, setBathrooms] = useState('')
  const [maxGuests, setMaxGuests] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [addSuccess, setAddSuccess] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [extraImages, setExtraImages] = useState([])
  const [extraPreviews, setExtraPreviews] = useState([])

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth'); return }

    const { data: profile } = await supabase
      .from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') { router.push('/'); return }

    const { data: bookingsData } = await supabase
      .from('bookings')
      .select('*, properties(title_ar, title_en, image_url), profiles(name, phone)')
      .order('created_at', { ascending: false })
    setBookings(bookingsData || [])

    const { data: propertiesData } = await supabase
      .from('properties').select('*').order('created_at', { ascending: false })
    setProperties(propertiesData || [])

    setLoading(false)
  }

  async function updateBookingStatus(bookingId, newStatus) {
    await supabase.from('bookings').update({ status: newStatus }).eq('id', bookingId)
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b))
    if (newStatus === 'confirmed') {
      toast.success('✅ تم تأكيد الحجز')
    } else {
      toast.error('❌ تم رفض الحجز')
    }
  }

  async function deleteProperty(propertyId) {
    await supabase.from('properties').delete().eq('id', propertyId)
    setProperties(prev => prev.filter(p => p.id !== propertyId))
    setConfirmDelete(null)
    toast.success('🗑️ تم حذف العقار')
  }

  function handleImageChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  function handleExtraImages(e) {
    const files = Array.from(e.target.files)
    setExtraImages(files)
    setExtraPreviews(files.map(f => URL.createObjectURL(f)))
  }

  async function addProperty() {
    if (!titleAr || !titleEn || !price) return
    setUploading(true)

    let imageUrl = ''

    // رفع الصورة الرئيسية
    if (imageFile) {
      const fileName = `${Date.now()}-${imageFile.name}`
      const { data: uploadData } = await supabase.storage
        .from('property-images')
        .upload(fileName, imageFile)

      if (uploadData) {
        const { data: urlData } = supabase.storage
          .from('property-images')
          .getPublicUrl(fileName)
        imageUrl = urlData.publicUrl
      }
    }

    // إضافة العقار
    const { error, data: newProperty } = await supabase
      .from('properties')
      .insert({
        title_ar: titleAr,
        title_en: titleEn,
        type,
        price_per_night: Number(price),
        location,
        bedrooms: Number(bedrooms),
        bathrooms: Number(bathrooms),
        max_guests: Number(maxGuests),
        image_url: imageUrl,
        is_available: true
      })
      .select()
      .single()

    if (!error && newProperty) {
      // رفع الصور الإضافية
      for (const file of extraImages) {
        const fileName = `${Date.now()}-${file.name}`
        const { data: uploadData } = await supabase.storage
          .from('property-images')
          .upload(fileName, file)

        if (uploadData) {
          const { data: urlData } = supabase.storage
            .from('property-images')
            .getPublicUrl(fileName)

          await supabase.from('property_images').insert({
            property_id: newProperty.id,
            url: urlData.publicUrl
          })
        }
      }

      toast.success('🏠 تم إضافة العقار والصور!')
      setAddSuccess(true)
      setTimeout(() => setAddSuccess(false), 3000)
      setTitleAr(''); setTitleEn(''); setPrice('')
      setLocation(''); setBedrooms(''); setBathrooms('')
      setMaxGuests(''); setImageFile(null); setImagePreview(null)
      setExtraImages([]); setExtraPreviews([])
      loadData()
    } else {
      toast.error('حدث خطأ، حاولي مرة ثانية')
    }

    setUploading(false)
  }

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700'
  }

  const statusLabel = {
    pending: { ar: 'انتظار', en: 'Pending' },
    confirmed: { ar: 'مؤكد', en: 'Confirmed' },
    cancelled: { ar: 'ملغي', en: 'Cancelled' }
  }

  const totalRevenue = bookings
    .filter(b => b.status === 'confirmed')
    .reduce((sum, b) => sum + (b.total_price || 0), 0)

  const tips = [
    { icon: '📸', text: lang === 'ar' ? 'أضف صور احترافية لعقاراتك لزيادة الحجوزات 3x' : 'Add professional photos to increase bookings 3x' },
    { icon: '💰', text: lang === 'ar' ? 'العروض الموسمية تزيد الإشغال 40%' : 'Seasonal offers increase occupancy by 40%' },
    { icon: '⭐', text: lang === 'ar' ? 'رد على الضيوف خلال ساعة يرفع تقييمك' : 'Replying within 1 hour improves your rating' },
    { icon: '📱', text: lang === 'ar' ? 'شارك عقاراتك على سناب وانستقرام' : 'Share on Snapchat & Instagram' },
  ]

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-yellow-400 text-xl font-black animate-pulse">جاري التحميل...</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      <div className="bg-black border-b border-gray-800 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div>
          <h1 className="text-xl font-black text-yellow-400">🛠️ {lang === 'ar' ? 'لوحة التحكم' : 'Admin Panel'}</h1>
          <p className="text-gray-500 text-xs">{lang === 'ar' ? 'إدارة العقارات والحجوزات' : 'Manage properties & bookings'}</p>
        </div>
        <Link href="/" className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-xl text-sm font-bold transition">
          ← {lang === 'ar' ? 'الرئيسية' : 'Home'}
        </Link>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">

        <div className="flex gap-2 mb-8 overflow-x-auto">
          {[
            { key: 'dashboard', ar: '📊 الإحصائيات', en: '📊 Dashboard' },
            { key: 'bookings', ar: '📅 الحجوزات', en: '📅 Bookings' },
            { key: 'properties', ar: '🏠 العقارات', en: '🏠 Properties' },
            { key: 'add', ar: '➕ إضافة عقار', en: '➕ Add Property' },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition ${
                activeTab === tab.key ? 'bg-yellow-600 text-black' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {lang === 'ar' ? tab.ar : tab.en}
            </button>
          ))}
        </div>

        {/* داشبورد */}
        {activeTab === 'dashboard' && (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { num: bookings.length, label: lang === 'ar' ? 'إجمالي الحجوزات' : 'Total Bookings', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
                { num: bookings.filter(b => b.status === 'pending').length, label: lang === 'ar' ? 'قيد الانتظار' : 'Pending', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
                { num: bookings.filter(b => b.status === 'confirmed').length, label: lang === 'ar' ? 'مؤكدة' : 'Confirmed', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
                { num: properties.length, label: lang === 'ar' ? 'العقارات' : 'Properties', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
              ].map((stat, i) => (
                <div key={i} className={`border rounded-2xl p-5 ${stat.bg}`}>
                  <div className={`text-3xl font-black ${stat.color}`}>{stat.num}</div>
                  <div className="text-gray-400 text-xs mt-1">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="bg-linear-to-r from-yellow-600/20 to-yellow-400/10 border border-yellow-500/30 rounded-2xl p-6 mb-8">
              <p className="text-gray-400 text-sm mb-1">{lang === 'ar' ? 'إجمالي الإيرادات المؤكدة' : 'Total Confirmed Revenue'}</p>
              <div className="text-4xl font-black text-yellow-400">
                {totalRevenue.toLocaleString()} {lang === 'ar' ? 'ريال' : 'SAR'}
              </div>
            </div>

            <h3 className="font-black text-lg text-white mb-4">💡 {lang === 'ar' ? 'نصائح لزيادة الحجوزات' : 'Tips to Boost Bookings'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {tips.map((tip, i) => (
                <div key={i} className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 flex items-start gap-3">
                  <span className="text-2xl">{tip.icon}</span>
                  <p className="text-gray-300 text-sm leading-relaxed">{tip.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* الحجوزات */}
        {activeTab === 'bookings' && (
          <div className="flex flex-col gap-3">
            {bookings.length === 0 ? (
              <div className="text-center py-20 text-gray-500">{lang === 'ar' ? 'ما في حجوزات بعد' : 'No bookings yet'}</div>
            ) : bookings.map(booking => (
              <div key={booking.id} className="bg-gray-800/50 border border-gray-700 rounded-2xl p-4">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex gap-3">
                    <img src={booking.properties?.image_url} className="w-16 h-14 rounded-xl object-cover shrink-0" />
                    <div>
                      <h3 className="font-black text-white">
                        {lang === 'ar' ? booking.properties?.title_ar : booking.properties?.title_en}
                      </h3>
                      <p className="text-gray-400 text-xs mt-0.5">
                        {booking.profiles?.name || '-'} · {booking.profiles?.phone || '-'}
                      </p>
                      <p className="text-gray-400 text-xs">
                        {booking.check_in} ← {booking.check_out} · {booking.guests}
                      </p>
                      <p className="text-yellow-400 font-black text-sm mt-1">
                        {booking.total_price} {lang === 'ar' ? 'ريال' : 'SAR'}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`text-xs px-3 py-1 rounded-full font-bold ${statusColors[booking.status]}`}>
                      {lang === 'ar' ? statusLabel[booking.status].ar : statusLabel[booking.status].en}
                    </span>
                    {booking.status === 'pending' && (
                      <div className="flex gap-2">
                        <button onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                          className="bg-green-600 hover:bg-green-500 text-white text-xs px-3 py-1.5 rounded-lg font-bold transition">
                          ✓ {lang === 'ar' ? 'قبول' : 'Confirm'}
                        </button>
                        <button onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                          className="bg-red-600 hover:bg-red-500 text-white text-xs px-3 py-1.5 rounded-lg font-bold transition">
                          ✕ {lang === 'ar' ? 'رفض' : 'Reject'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* العقارات */}
        {activeTab === 'properties' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {properties.map(property => (
              <div key={property.id} className="bg-gray-800/50 border border-gray-700 rounded-2xl overflow-hidden">
                <div className="relative">
                  <img src={property.image_url} className="w-full h-44 object-cover" />
                  <span className="absolute top-3 right-3 bg-yellow-500 text-black text-xs px-2 py-1 rounded-lg font-black">
                    {property.type === 'villa' ? (lang === 'ar' ? 'فيلا' : 'Villa') : (lang === 'ar' ? 'شقة' : 'Apt')}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-black text-white">{lang === 'ar' ? property.title_ar : property.title_en}</h3>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-yellow-400 font-black">{property.price_per_night} {lang === 'ar' ? 'ريال/ليلة' : 'SAR/Night'}</span>
                    <button onClick={() => setConfirmDelete(property.id)}
                      className="bg-red-500/20 hover:bg-red-500/40 text-red-400 text-xs px-3 py-1.5 rounded-lg font-bold transition">
                      🗑️ {lang === 'ar' ? 'حذف' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* إضافة عقار */}
        {activeTab === 'add' && (
          <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
            {addSuccess && (
              <div className="bg-green-500/20 border border-green-500/30 text-green-400 p-4 rounded-xl mb-6 text-center font-black">
                ✅ {lang === 'ar' ? 'تم إضافة العقار بنجاح!' : 'Property added successfully!'}
              </div>
            )}

            {/* الصورة الرئيسية */}
            <div className="mb-6">
              <label className="block text-sm text-gray-400 mb-2 font-bold">
                📸 {lang === 'ar' ? 'الصورة الرئيسية' : 'Main Image'}
              </label>
              <div onClick={() => document.getElementById('imageInput').click()}
                className="border-2 border-dashed border-gray-600 hover:border-yellow-500 rounded-2xl h-48 flex items-center justify-center cursor-pointer transition overflow-hidden">
                {imagePreview ? (
                  <img src={imagePreview} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center">
                    <div className="text-4xl mb-2">📷</div>
                    <p className="text-gray-500 text-sm">{lang === 'ar' ? 'اضغط لرفع صورة' : 'Click to upload'}</p>
                  </div>
                )}
              </div>
              <input id="imageInput" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </div>

            {/* صور إضافية */}
            <div className="mb-6">
              <label className="block text-sm text-gray-400 mb-2 font-bold">
                🖼️ {lang === 'ar' ? 'صور إضافية (اختياري)' : 'Extra Images (optional)'}
              </label>
              <input type="file" accept="image/*" multiple onChange={handleExtraImages}
                className="w-full bg-gray-900 border border-gray-600 rounded-xl p-3 text-gray-400 text-sm"
              />
              {extraPreviews.length > 0 && (
                <div className="flex gap-2 mt-3 flex-wrap">
                  {extraPreviews.map((src, i) => (
                    <img key={i} src={src} className="w-20 h-16 rounded-lg object-cover" />
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'الاسم بالعربي', placeholder: 'شقة غرفة وصالة', value: titleAr, set: setTitleAr },
                { label: 'Name in English', placeholder: 'One Bedroom Apartment', value: titleEn, set: setTitleEn },
                { label: 'السعر/ليلة', placeholder: '180', value: price, set: setPrice, type: 'number' },
                { label: 'الموقع', placeholder: 'الدمام', value: location, set: setLocation },
                { label: 'عدد الغرف', placeholder: '2', value: bedrooms, set: setBedrooms, type: 'number' },
                { label: 'عدد الحمامات', placeholder: '2', value: bathrooms, set: setBathrooms, type: 'number' },
                { label: 'أقصى ضيوف', placeholder: '4', value: maxGuests, set: setMaxGuests, type: 'number' },
              ].map((field, i) => (
                <div key={i}>
                  <label className="block text-xs text-gray-400 mb-1">{field.label}</label>
                  <input type={field.type || 'text'} placeholder={field.placeholder} value={field.value}
                    onChange={e => field.set(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-600 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-yellow-500"
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs text-gray-400 mb-1">النوع</label>
                <select value={type} onChange={e => setType(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-600 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-yellow-500">
                  <option value="apartment">شقة</option>
                  <option value="villa">فيلا</option>
                </select>
              </div>
            </div>

            <button onClick={addProperty} disabled={uploading}
              className="w-full mt-6 bg-yellow-600 hover:bg-yellow-500 text-black font-black py-4 rounded-xl transition text-lg disabled:opacity-50">
              {uploading ? (lang === 'ar' ? 'جاري الرفع...' : 'Uploading...') : (lang === 'ar' ? '➕ إضافة العقار' : '➕ Add Property')}
            </button>
          </div>
        )}

      </div>

      {/* تأكيد الحذف */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 max-w-sm w-full text-center">
            <div className="text-5xl mb-4">🗑️</div>
            <h3 className="font-black text-xl text-white mb-2">{lang === 'ar' ? 'تأكيد الحذف' : 'Confirm Delete'}</h3>
            <p className="text-gray-400 text-sm mb-6">{lang === 'ar' ? 'هل أنت متأكد؟ لا يمكن التراجع!' : 'Are you sure? Cannot be undone!'}</p>
            <div className="flex gap-3">
              <button onClick={() => deleteProperty(confirmDelete)}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white font-black py-3 rounded-xl transition">
                {lang === 'ar' ? 'نعم، احذف' : 'Yes, Delete'}
              </button>
              <button onClick={() => setConfirmDelete(null)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-black py-3 rounded-xl transition">
                {lang === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
