import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { LogIn, Mail, Lock, AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const { signIn, signInWithGoogle } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Get redirect path from state or default to home
  const from = location.state?.from || '/'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await signIn(email, password)

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        setError('メールアドレスまたはパスワードが正しくありません')
      } else if (error.message.includes('Email not confirmed')) {
        setError('メールアドレスの確認が完了していません。確認メールをご確認ください')
      } else {
        setError(error.message)
      }
      setLoading(false)
    } else {
      // Redirect to the page user was viewing before login
      navigate(from, { replace: true })
    }
  }

  async function handleGoogleLogin() {
    setError('')
    setGoogleLoading(true)
    const { error } = await signInWithGoogle()
    if (error) {
      setError('Googleログインに失敗しました')
      setGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogIn size={32} className="text-rose-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">ログイン</h1>
          <p className="text-gray-600">
            Dライフへようこそ
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          {/* Googleログインボタン */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleLoading || loading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            {googleLoading ? (
              <Loader2 size={20} className="animate-spin text-gray-500" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            <span className="font-medium text-gray-700">
              {googleLoading ? 'ログイン中...' : 'Googleでログイン'}
            </span>
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">または</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                <AlertCircle size={20} />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                メールアドレス
              </label>
              <div className="relative">
                <Mail size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-colors"
                  placeholder="example@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                パスワード
              </label>
              <div className="relative">
                <Lock size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-colors"
                  placeholder="パスワードを入力"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showPassword ? 'パスワードを隠す' : 'パスワードを表示'}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-rose-500 border-gray-300 rounded focus:ring-rose-500"
                />
                <span className="ml-2 text-sm text-gray-600">ログイン状態を保持</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-rose-500 hover:underline"
              >
                パスワードを忘れた方
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-rose-500 text-white font-semibold rounded-lg hover:bg-rose-600 transition-colors disabled:bg-rose-400 disabled:cursor-not-allowed"
            >
              {loading ? 'ログイン中...' : 'ログイン'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              アカウントをお持ちでないですか？{' '}
              <Link to="/register" className="text-rose-500 hover:underline font-medium">
                新規登録
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
