'use client'

import Link from 'next/link'
import { useLang } from '../context/LanguageContext'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function Navbar() {
 const { lang, toggle, t } = useLang()
 const router = useRouter()
 const [user, setUser] = useState(null)
 const [profile, setProfile] = useState(null)

useEffect(() => {
  async function init() {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)

    if (user) {
      const { data: p } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      setProfile(p)
      console.log('Profile:', p) // نشوف وش يرجع
    }
  }

  init()

  const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
    setUser(session?.user ?? null)
    if (session?.user) {
      const { data: p } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()
      setProfile(p)
      console.log('Profile onChange:', p) // نشوف وش يرجع
    } else {
      setProfile(null)
    }
  })

  return () => listener.subscription.unsubscribe()
}, [])

 async function handleLogout() {
   await supabase.auth.signOut()
   router.push('/')
 }

 return (
   <nav className="bg-black text-white px-6 py-3 flex items-center justify-between fixed top-0 w-full z-50">

     {/* اللوجو */}
     <div className="text-yellow-400 font-black text-lg">
       {lang === 'ar' ? 'فيلا و شقق الضيافة' : 'Hospitality Villas'}
     </div>

     {/* الروابط */}
     <ul className="hidden md:flex gap-6 text-sm list-none">
       <li className="hover:text-yellow-400 cursor-pointer">
         {lang === 'ar' ? 'الرئيسية' : 'Home'}
       </li>
       <li className="hover:text-yellow-400 cursor-pointer">
         {lang === 'ar' ? 'الشقق والفلل' : 'Properties'}
       </li>
       <li className="hover:text-yellow-400 cursor-pointer">
         {lang === 'ar' ? 'الموقع' : 'Location'}
       </li>
       <li className="hover:text-yellow-400 cursor-pointer">
         {lang === 'ar' ? 'تواصل معنا' : 'Contact'}
       </li>
     </ul>

     {/* اليمين */}
     <div className="flex items-center gap-3">
       <span className="text-sm hidden md:block">0590919995</span>

       {/* زر اللغة */}
       <button
         onClick={toggle}
         className="border border-gray-600 px-3 py-1 rounded text-xs hover:border-yellow-400 transition"
       >
         {lang === 'ar' ? 'EN' : 'عربي'}
       </button>

       {/* لو داخل */}
       {user ? (
         <div className="flex items-center gap-2">

           {/* رابط الأدمن */}
           {profile?.role === 'admin' && (
             <Link
               href="/admin"
               className="text-xs text-yellow-400 hover:text-yellow-300 font-bold"
             >
               🛠️ {lang === 'ar' ? 'الأدمن' : 'Admin'}
             </Link>
           )}

           <Link
             href="/profile"
             className="w-8 h-8 bg-yellow-600 rounded-full flex items-center justify-center text-black font-black text-sm hover:bg-yellow-500 transition"
           >
             {user.email[0].toUpperCase()}
           </Link>

           <button
             onClick={handleLogout}
             className="text-xs text-gray-400 hover:text-red-400 transition"
           >
             {lang === 'ar' ? 'خروج' : 'Logout'}
           </button>

         </div>
       ) : (
         <Link
           href="/auth"
           className="bg-yellow-600 hover:bg-yellow-500 px-4 py-2 rounded text-sm font-bold transition"
         >
           {t.bookNow}
         </Link>
       )}

     </div>
   </nav>
 )
}