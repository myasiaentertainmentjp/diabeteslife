import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Send, Loader2, AlertCircle, Mail } from 'lucide-react'

const inquiryTypes = [
  { value: '', label: '選択してください' },
  { value: 'question', label: 'サービスに関するご質問' },
  { value: 'bug', label: '不具合・エラーの報告' },
  { value: 'report', label: '不適切な投稿の報告' },
  { value: 'withdrawal', label: '退会について' },
  { value: 'feedback', label: 'ご意見・ご要望' },
  { value: 'other', label: 'その他' },
]

export function Contact() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    inquiryType: '',
    message: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    // TODO: Implement actual email sending via Resend Edge Function
    // For now, just simulate a delay and show success
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setSubmitting(false)
    navigate('/contact/complete')
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail size={32} className="text-rose-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">お問い合わせ</h1>
        <p className="text-gray-600 text-sm">ご質問・ご要望をお聞かせください</p>
      </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              お名前 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-colors"
              placeholder="ニックネームでも可"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              メールアドレス <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-colors"
              placeholder="example@email.com"
            />
          </div>

          <div>
            <label htmlFor="inquiryType" className="block text-sm font-medium text-gray-700 mb-1">
              お問い合わせ種別 <span className="text-red-500">*</span>
            </label>
            <select
              id="inquiryType"
              name="inquiryType"
              value={formData.inquiryType}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-colors bg-white"
            >
              {inquiryTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
              お問い合わせ内容 <span className="text-red-500">*</span>
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-colors resize-none"
              placeholder="お問い合わせ内容をご記入ください"
            />
          </div>

          <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm text-gray-600">
            <p>• 通常3営業日以内に返信いたします</p>
            <p>• 医療に関するご相談には対応できません</p>
            <p>• 緊急の体調不良の場合は医療機関を受診してください</p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-rose-500 text-white font-medium rounded-lg hover:bg-rose-600 transition-colors disabled:bg-rose-400 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                <span>送信中...</span>
              </>
            ) : (
              <>
                <Send size={20} />
                <span>送信する</span>
              </>
            )}
            </button>
          </form>
        </div>

      <div className="mt-6 text-center">
        <Link to="/" className="text-rose-500 hover:underline text-sm">
          トップページに戻る
        </Link>
      </div>
    </div>
  )
}
