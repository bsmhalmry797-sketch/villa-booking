'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import { useLang } from '../context/LanguageContext'
import toast from 'react-hot-toast'

export default function AuthPage() {
  const router = useRouter()
  const { lang } = useLang()
  const [isLogin, setIsLogin] = useState(true)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    setLoading(true)

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        toast.error(lang === 'ar' ? 'بيانات غير صحيحة' : 'Invalid credentials')
      } else {
        toast.success(lang === 'ar' ? '👋 أهلاً بك!' : '👋 Welcome back!')
        router.push('/')
      }
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) {
        toast.error(error.message)
      } else if (data.user) {
        await supabase.from('profiles').insert({
          id: data.user.id, name, phone, role: 'user'
        })
        toast.success(lang === 'ar' ? '🎉 تم إنشاء حسابك!' : '🎉 Account created!')
        router.push('/')
      } else {
        toast.error(lang === 'ar' ? 'حاول مرة ثانية' : 'Please try again')
      }
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="bg-[#111] border border-[#222] rounded-2xl p-8 w-full max-w-md">

        <h1 className="text-2xl font-black text-yellow-400 text-center mb-2">
          فيلا و شقق الضيافة
        </h1>
        <p className="text-gray-500 text-center text-sm mb-8">
          {isLogin ? 'أهلاً بعودتك' : 'إنشاء حساب جديد'}
        </p>

        {!isLogin && (
          <div className="mb-4">
            <label className="block text-xs text-gray-500 mb-1">الاسم الكامل</label>
            <input type="text" placeholder="الاسم" value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-black border border-[#333] rounded-lg p-3 text-white text-sm focus:outline-none focus:border-yellow-500"
            />
          </div>
        )}

        <div className="mb-4">
          <label className="block text-xs text-gray-500 mb-1">البريد الإلكتروني</label>
          <input type="email" placeholder="email@gmail.com" value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full bg-black border border-[#333] rounded-lg p-3 text-white text-sm focus:outline-none focus:border-yellow-500"
          />
        </div>

        {!isLogin && (
          <div className="mb-4">
            <label className="block text-xs text-gray-500 mb-1">رقم الجوال</label>
            <input type="tel" placeholder="05xxxxxxxx" value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full bg-black border border-[#333] rounded-lg p-3 text-white text-sm focus:outline-none focus:border-yellow-500"
            />
          </div>
        )}

        <div className="mb-6">
          <label className="block text-xs text-gray-500 mb-1">كلمة المرور</label>
          <input type="password" placeholder="••••••••" value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full bg-black border border-[#333] rounded-lg p-3 text-white text-sm focus:outline-none focus:border-yellow-500"
          />
        </div>

        <button onClick={handleSubmit} disabled={loading}
          className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-black py-3 rounded-lg transition"
        >
          {loading ? '...' : isLogin ? 'دخول' : 'إنشاء حساب'}
        </button>

        <p className="text-center text-gray-500 text-sm mt-6">
          {isLogin ? 'ما عندك حساب؟' : 'عندك حساب؟'}
          <button onClick={() => setIsLogin(!isLogin)}className="text-yellow-400 font-bold mr-1 hover:text-yellow-300"
          >
            {isLogin ? 'سجل الآن' : 'ادخل'}
          </button>
        </p>

      </div>
    </div>
  )
}