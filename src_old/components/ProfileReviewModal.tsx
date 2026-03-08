import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Stethoscope, Settings } from 'lucide-react'
import { DIABETES_TYPE_LABELS, TREATMENT_TYPE_LABELS, DiabetesType, TreatmentType } from '../types/database'

interface ProfileSummary {
  diabetesType: DiabetesType
  treatments: TreatmentType[]
  latestHba1c: { value: number; month: string } | null
  latestWeight: { value: number; month: string } | null
  medications: string[]
  lastReviewedAt: string | null
}

export function ProfileReviewModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [summary, setSummary] = useState<ProfileSummary | null>(null)
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (loading || !user) return

    checkAndShowModal()
  }, [user, loading])

  async function checkAndShowModal() {
    if (!user) return

    try {
      // Fetch user profile
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('diabetes_type, treatment_methods, medications, last_profile_reviewed_at')
        .eq('user_id', user.id)
        .maybeSingle()

      if (!profileData) return

      const lastReviewed = profileData.last_profile_reviewed_at
      const now = new Date()

      // Check if we should show the modal
      let shouldShow = false
      if (!lastReviewed) {
        // Never reviewed
        shouldShow = true
      } else {
        const lastReviewedDate = new Date(lastReviewed)
        const daysSinceReview = (now.getTime() - lastReviewedDate.getTime()) / (1000 * 60 * 60 * 24)
        if (daysSinceReview >= 30) {
          shouldShow = true
        }
      }

      if (!shouldShow) return

      // Fetch latest HbA1c
      const { data: hba1cData } = await supabase
        .from('hba1c_records')
        .select('value, recorded_at')
        .eq('user_id', user.id)
        .order('recorded_at', { ascending: false })
        .limit(1)

      // Fetch latest weight
      const { data: weightData } = await supabase
        .from('weight_records')
        .select('value, recorded_at')
        .eq('user_id', user.id)
        .order('recorded_at', { ascending: false })
        .limit(1)

      setSummary({
        diabetesType: profileData.diabetes_type,
        treatments: profileData.treatment_methods || [],
        latestHba1c: hba1cData?.[0]
          ? { value: hba1cData[0].value, month: formatMonth(hba1cData[0].recorded_at) }
          : null,
        latestWeight: weightData?.[0]
          ? { value: weightData[0].value, month: formatMonth(weightData[0].recorded_at) }
          : null,
        medications: profileData.medications || [],
        lastReviewedAt: lastReviewed,
      })

      setIsOpen(true)
    } catch (error) {
      console.error('Error checking profile review:', error)
    }
  }

  function formatMonth(dateStr: string): string {
    const [year, month] = dateStr.split('-')
    return `${year}年${parseInt(month)}月`
  }

  async function updateLastReviewed() {
    if (!user) return

    try {
      await supabase
        .from('user_profiles')
        .update({ last_profile_reviewed_at: new Date().toISOString() })
        .eq('user_id', user.id)
    } catch (error) {
      console.error('Error updating last_profile_reviewed_at:', error)
    }
  }

  async function handleNoChange() {
    await updateLastReviewed()
    setIsOpen(false)
  }

  async function handleGoToSettings() {
    await updateLastReviewed()
    setIsOpen(false)
    navigate('/mypage/profile')
  }

  if (!isOpen || !summary) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop - clicking outside also dismisses */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleNoChange}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
        {/* Content */}
        <div className="text-center">
          {/* Icon */}
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Stethoscope size={32} className="text-blue-500" />
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            プロフィール確認のお願い
          </h2>

          {/* Description */}
          <p className="text-gray-600 mb-4 text-sm">
            最新の情報に更新することで、<br />
            同じ状況のユーザーとつながりやすくなります。
          </p>

          {/* Current Info Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <p className="text-xs text-gray-500 mb-2">現在の登録情報</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">糖尿病タイプ</span>
                <span className="font-medium text-gray-900">
                  {summary.diabetesType ? DIABETES_TYPE_LABELS[summary.diabetesType] : '未設定'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">治療方法</span>
                <span className="font-medium text-gray-900">
                  {summary.treatments.length > 0
                    ? summary.treatments.map(t => TREATMENT_TYPE_LABELS[t]).join('、')
                    : '未設定'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">最新HbA1c</span>
                <span className="font-medium text-gray-900">
                  {summary.latestHba1c
                    ? `${summary.latestHba1c.value}%（${summary.latestHba1c.month}）`
                    : '未記録'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">最新体重</span>
                <span className="font-medium text-gray-900">
                  {summary.latestWeight
                    ? `${summary.latestWeight.value}kg（${summary.latestWeight.month}）`
                    : '未記録'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">服用薬</span>
                <span className={`font-medium ${summary.medications.length === 0 ? 'text-rose-500' : 'text-gray-900'}`}>
                  {summary.medications.length > 0
                    ? summary.medications.slice(0, 2).join('、') + (summary.medications.length > 2 ? '...' : '')
                    : '未登録'}
                </span>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleNoChange}
              className="flex-1 px-4 py-3 text-gray-600 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              変更なし
            </button>
            <button
              onClick={handleGoToSettings}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-rose-500 text-white font-medium rounded-lg hover:bg-rose-600 transition-colors"
            >
              <Settings size={18} />
              更新する
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
