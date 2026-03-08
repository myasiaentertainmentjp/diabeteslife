'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { Lock, Eye, EyeOff, Loader2, CheckCircle, AlertCircle, KeyRound } from 'lucide-react'

function ResetPasswordForm() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [validSession, setValidSession] = useState(false)
  const [checking, setChecking] = useState(true)

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Check if user came from email link
    async function checkSession() {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setValidSession(true)
      }
      setChecking(false)
    }
    checkSession()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('パスワードは6文字以上で入力してください')
      return
    }

    if (password !== confirmPassword) {
      setError('パスワードが一致しません')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.updateUser({
      password: password
    })

    if (error) {
      setError('パスワードの更新に失敗しました。もう一度お試しください。')
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    }
  }

  if (checking) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-rose-500" />
      </div>
    )
  }

  if (!validSession) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} className="text-amber-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">無効なリンク</h1>
          <p className="text-gray-600 mb-6">
            このパスワードリセットリンクは無効か、期限が切れています。
            もう一度パスワードリセットをお試しください。
          </p>
          <Link
            href="/forgot-password"
            className="inline-block px-6 py-3 bg-rose-500 text-white font-semibold rounded-lg hover:bg-rose-600 transition-colors"
          >
            パスワードリセットページへ
          </Link>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">パスワードを更新しました</h1>
          <p className="text-gray-600 mb-6">
            新しいパスワードでログインできます。<br />
            自動的にログインページに移動します...
          </p>
          <Link
            href="/login"
            className="inline-block px-6 py-3 bg-rose-500 text-white font-semibold rounded-lg hover:bg-rose-600 transition-colors"
          >
            ログインページへ
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <KeyRound size={32} className="text-rose-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">新しいパスワードを設定</h1>
          <p className="text-gray-600">
            新しいパスワードを入力してください
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                <AlertCircle size={20} />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                新しいパスワード
              </label>
              <div className="relative">
                <Lock size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-colors"
                  placeholder="6文字以上"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                パスワード確認
              </label>
              <div className="relative">
                <Lock size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-colors"
                  placeholder="もう一度入力"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-rose-500 text-white font-semibold rounded-lg hover:bg-rose-600 transition-colors disabled:bg-rose-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  更新中...
                </>
              ) : (
                'パスワードを更新'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[80vh] flex items-center justify-center">
          <Loader2 size={32} className="animate-spin text-rose-500" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  )
}
