import { useState } from 'react'
import { Flag, X, Loader2, AlertTriangle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { ReportReason, ReportTargetType, REPORT_REASON_LABELS } from '../types/database'

interface ReportButtonProps {
  targetType: ReportTargetType
  targetId: string
  className?: string
}

const REPORT_REASONS: ReportReason[] = ['spam', 'harassment', 'medical_misinformation', 'other']

export function ReportButton({ targetType, targetId, className = '' }: ReportButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [reason, setReason] = useState<ReportReason | ''>('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const { user } = useAuth()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !reason) return

    setError('')
    setSubmitting(true)

    try {
      const { error: insertError } = await supabase
        .from('reports')
        .insert({
          reporter_id: user.id,
          target_type: targetType,
          target_id: targetId,
          reason,
          description: description.trim() || null,
        })

      if (insertError) {
        console.error('Error submitting report:', insertError)
        setError('通報の送信に失敗しました')
      } else {
        setSubmitted(true)
        setTimeout(() => {
          setIsOpen(false)
          setSubmitted(false)
          setReason('')
          setDescription('')
        }, 2000)
      }
    } catch (err) {
      setError('予期しないエラーが発生しました')
    } finally {
      setSubmitting(false)
    }
  }

  if (!user) return null

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`text-gray-400 hover:text-red-500 transition-colors ${className}`}
        title="通報する"
      >
        <Flag size={16} />
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            {submitted ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle size={32} className="text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  通報を受け付けました
                </h3>
                <p className="text-gray-600 text-sm">
                  ご報告ありがとうございます。運営が確認いたします。
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">
                    コンテンツを通報
                  </h3>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                      {error}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      通報理由 <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-2">
                      {REPORT_REASONS.map((r) => (
                        <label
                          key={r}
                          className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                            reason === r
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="reason"
                            value={r}
                            checked={reason === r}
                            onChange={(e) => setReason(e.target.value as ReportReason)}
                            className="text-green-600 focus:ring-green-500"
                          />
                          <span className="text-sm text-gray-700">
                            {REPORT_REASON_LABELS[r]}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      詳細（任意）
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-none"
                      rows={3}
                      placeholder="詳しい状況を教えてください..."
                      maxLength={500}
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      キャンセル
                    </button>
                    <button
                      type="submit"
                      disabled={!reason || submitting}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          <span>送信中...</span>
                        </>
                      ) : (
                        <span>通報する</span>
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
