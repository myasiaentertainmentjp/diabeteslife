import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Mail, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react'

export function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://diabeteslife.jp/reset-password',
      })

      if (error) {
        setError('メールの送信に失敗しました。メールアドレスを確認してください。')
      } else {
        setSuccess(true)
      }
    } catch {
      setError('エラーが発生しました。もう一度お試しください。')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-green-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">メールを送信しました</h1>
            <p className="text-gray-600 mb-2">
              パスワードリセット用のメールを送信しました。
            </p>
            <p className="text-gray-600 mb-6">
              メール内のリンクをクリックして、新しいパスワードを設定してください。
            </p>
            <p className="text-sm text-gray-500 mb-8">
              ※メールが届かない場合は、迷惑メールフォルダをご確認ください。
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-rose-500 hover:underline"
            >
              <ArrowLeft size={16} />
              ログインページに戻る
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail size={32} className="text-rose-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">パスワードをお忘れの方</h1>
          <p className="text-gray-600">
            登録したメールアドレスを入力してください
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-rose-500 text-white font-semibold rounded-lg hover:bg-rose-600 transition-colors disabled:bg-rose-400 disabled:cursor-not-allowed"
            >
              {loading ? '送信中...' : 'リセットメールを送信'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/login" className="inline-flex items-center gap-2 text-rose-500 hover:underline text-sm">
              <ArrowLeft size={16} />
              ログインページに戻る
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
