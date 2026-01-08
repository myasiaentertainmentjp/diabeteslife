import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import {
  Profile,
  DiabetesType,
  TreatmentType,
  DIABETES_TYPE_LABELS,
  TREATMENT_TYPE_LABELS,
} from '../../types/database'
import { Loader2, Save, Check } from 'lucide-react'

const DIABETES_TYPES: NonNullable<DiabetesType>[] = [
  'type1',
  'type2',
  'gestational',
  'prediabetes',
  'family',
]

const TREATMENT_TYPES: TreatmentType[] = [
  'insulin',
  'oral_medication',
  'diet_only',
  'pump',
  'cgm',
]

const currentYear = new Date().getFullYear()
const DIAGNOSIS_YEARS = Array.from({ length: 50 }, (_, i) => currentYear - i)

export function ProfileSettings() {
  const { user, profile: authProfile, refreshProfile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [displayName, setDisplayName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [diabetesType, setDiabetesType] = useState<DiabetesType>(null)
  const [treatments, setTreatments] = useState<TreatmentType[]>([])
  const [diagnosisYear, setDiagnosisYear] = useState<number | null>(null)
  const [isPregnant, setIsPregnant] = useState(false)
  const [isOnDialysis, setIsOnDialysis] = useState(false)
  const [hasComplications, setHasComplications] = useState(false)
  const [isTagsPublic, setIsTagsPublic] = useState(false)

  useEffect(() => {
    if (authProfile) {
      setDisplayName(authProfile.display_name || '')
      setAvatarUrl(authProfile.avatar_url || '')
      setDiabetesType(authProfile.diabetes_type)
      setTreatments(authProfile.treatments || [])
      setDiagnosisYear(authProfile.diagnosis_year)
      setIsPregnant(authProfile.is_pregnant)
      setIsOnDialysis(authProfile.is_on_dialysis)
      setHasComplications(authProfile.has_complications)
      setIsTagsPublic(authProfile.is_tags_public)
      setLoading(false)
    }
  }, [authProfile])

  function handleTreatmentChange(treatment: TreatmentType) {
    setTreatments((prev) =>
      prev.includes(treatment)
        ? prev.filter((t) => t !== treatment)
        : [...prev, treatment]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return

    setSaving(true)
    setError(null)
    setSaved(false)

    const updateData: Partial<Profile> = {
      display_name: displayName || null,
      avatar_url: avatarUrl || null,
      diabetes_type: diabetesType,
      treatments: treatments.length > 0 ? treatments : null,
      diagnosis_year: diagnosisYear,
      is_pregnant: isPregnant,
      is_on_dialysis: isOnDialysis,
      has_complications: hasComplications,
      is_tags_public: isTagsPublic,
      updated_at: new Date().toISOString(),
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update(updateData as never)
      .eq('id', user.id)

    if (updateError) {
      console.error('Error updating profile:', updateError)
      setError('プロフィールの更新に失敗しました')
    } else {
      setSaved(true)
      refreshProfile()
      setTimeout(() => setSaved(false), 3000)
    }

    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 size={24} className="animate-spin text-green-600" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Display Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          表示名
        </label>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="表示名を入力"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      {/* Avatar URL */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          アバターURL
        </label>
        <input
          type="url"
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
          placeholder="https://example.com/avatar.jpg"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
        {avatarUrl && (
          <div className="mt-2">
            <img
              src={avatarUrl}
              alt="アバタープレビュー"
              className="w-16 h-16 rounded-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          </div>
        )}
      </div>

      {/* Diabetes Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          糖尿病タイプ
        </label>
        <div className="space-y-2">
          {DIABETES_TYPES.map((type) => (
            <label key={type} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="diabetesType"
                checked={diabetesType === type}
                onChange={() => setDiabetesType(type)}
                className="w-4 h-4 text-green-600 focus:ring-green-500"
              />
              <span className="text-gray-700">{DIABETES_TYPE_LABELS[type]}</span>
            </label>
          ))}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="diabetesType"
              checked={diabetesType === null}
              onChange={() => setDiabetesType(null)}
              className="w-4 h-4 text-green-600 focus:ring-green-500"
            />
            <span className="text-gray-500">未設定</span>
          </label>
        </div>
      </div>

      {/* Treatments */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          治療方法（複数選択可）
        </label>
        <div className="space-y-2">
          {TREATMENT_TYPES.map((treatment) => (
            <label
              key={treatment}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={treatments.includes(treatment)}
                onChange={() => handleTreatmentChange(treatment)}
                className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
              />
              <span className="text-gray-700">
                {TREATMENT_TYPE_LABELS[treatment]}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Diagnosis Year */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          診断年
        </label>
        <select
          value={diagnosisYear || ''}
          onChange={(e) =>
            setDiagnosisYear(e.target.value ? Number(e.target.value) : null)
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="">未設定</option>
          {DIAGNOSIS_YEARS.map((year) => (
            <option key={year} value={year}>
              {year}年
            </option>
          ))}
        </select>
      </div>

      {/* Status Flags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          状態
        </label>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isPregnant}
              onChange={(e) => setIsPregnant(e.target.checked)}
              className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
            />
            <span className="text-gray-700">妊娠中</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isOnDialysis}
              onChange={(e) => setIsOnDialysis(e.target.checked)}
              className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
            />
            <span className="text-gray-700">透析中</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={hasComplications}
              onChange={(e) => setHasComplications(e.target.checked)}
              className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
            />
            <span className="text-gray-700">合併症あり</span>
          </label>
        </div>
      </div>

      {/* Tag Visibility */}
      <div className="border-t pt-6">
        <label className="flex items-center justify-between cursor-pointer">
          <div>
            <span className="text-sm font-medium text-gray-700">
              タグを公開する
            </span>
            <p className="text-xs text-gray-500 mt-1">
              糖尿病タイプや治療方法を投稿時に表示します
            </p>
          </div>
          <div className="relative">
            <input
              type="checkbox"
              checked={isTagsPublic}
              onChange={(e) => setIsTagsPublic(e.target.checked)}
              className="sr-only"
            />
            <div
              className={`w-11 h-6 rounded-full transition-colors ${
                isTagsPublic ? 'bg-green-600' : 'bg-gray-300'
              }`}
              onClick={() => setIsTagsPublic(!isTagsPublic)}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                  isTagsPublic ? 'translate-x-5' : 'translate-x-0.5'
                } mt-0.5`}
              />
            </div>
          </div>
        </label>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
        >
          {saving ? (
            <Loader2 size={18} className="animate-spin" />
          ) : saved ? (
            <Check size={18} />
          ) : (
            <Save size={18} />
          )}
          <span>{saved ? '保存しました' : '保存する'}</span>
        </button>
      </div>
    </form>
  )
}
