'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase'
import {
  Loader2,
  ArrowLeft,
  Save,
  User,
  Heart,
  Stethoscope,
  Activity,
  AlertCircle,
  CheckCircle,
} from 'lucide-react'
import {
  DiabetesType,
  TreatmentType,
  AgeGroup,
  Gender,
  IllnessDuration,
  DeviceType,
  DIABETES_TYPE_LABELS,
  TREATMENT_TYPE_LABELS,
  AGE_GROUP_LABELS,
  GENDER_LABELS,
  ILLNESS_DURATION_LABELS,
  DEVICE_TYPE_LABELS,
} from '@/types/database'

interface ExtendedProfile {
  display_name: string
  bio: string
  diabetes_type: DiabetesType
  diagnosis_year: number | null
  age_group: AgeGroup | null
  gender: Gender | null
  illness_duration: IllnessDuration | null
  treatment_methods: TreatmentType[]
  device: DeviceType | null
  has_complications: boolean
  on_dialysis: boolean
  is_pregnant: boolean
}

export default function ProfileSettingsPage() {
  const { user, loading: authLoading, refreshProfile } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [error, setError] = useState('')

  const [profile, setProfile] = useState<ExtendedProfile>({
    display_name: '',
    bio: '',
    diabetes_type: null,
    diagnosis_year: null,
    age_group: null,
    gender: null,
    illness_duration: null,
    treatment_methods: [],
    device: null,
    has_complications: false,
    on_dialysis: false,
    is_pregnant: false,
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/mypage/profile')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      fetchProfile()
    }
  }, [user])

  async function fetchProfile() {
    if (!user) return
    setLoading(true)

    // First, fetch from users table
    const { data: userData } = await supabase
      .from('users')
      .select('display_name')
      .eq('id', user.id)
      .single()

    // Then, fetch extended profile if it exists
    const { data: extendedData } = await supabase
      .from('extended_user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    setProfile({
      display_name: userData?.display_name || '',
      bio: extendedData?.bio || '',
      diabetes_type: extendedData?.diabetes_type || null,
      diagnosis_year: extendedData?.diagnosis_year || null,
      age_group: extendedData?.age_group || null,
      gender: extendedData?.gender || null,
      illness_duration: extendedData?.illness_duration || null,
      treatment_methods: extendedData?.treatment_methods || [],
      device: extendedData?.device || null,
      has_complications: extendedData?.has_complications === 'yes',
      on_dialysis: extendedData?.on_dialysis === 'yes',
      is_pregnant: extendedData?.is_pregnant === 'yes',
    })

    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return

    setSaving(true)
    setError('')
    setSaveSuccess(false)

    try {
      // Update users table
      const { error: userError } = await supabase
        .from('users')
        .update({ display_name: profile.display_name })
        .eq('id', user.id)

      if (userError) throw userError

      // Check if extended profile exists
      const { data: existing } = await supabase
        .from('extended_user_profiles')
        .select('user_id')
        .eq('user_id', user.id)
        .single()

      const extendedProfileData = {
        user_id: user.id,
        bio: profile.bio || null,
        diabetes_type: profile.diabetes_type,
        diagnosis_year: profile.diagnosis_year,
        age_group: profile.age_group,
        gender: profile.gender,
        illness_duration: profile.illness_duration,
        treatment_methods: profile.treatment_methods.length > 0 ? profile.treatment_methods : null,
        device: profile.device,
        has_complications: profile.has_complications ? 'yes' : 'no',
        on_dialysis: profile.on_dialysis ? 'yes' : 'no',
        is_pregnant: profile.is_pregnant ? 'yes' : 'no',
      }

      if (existing) {
        // Update existing profile
        const { error: extError } = await supabase
          .from('extended_user_profiles')
          .update(extendedProfileData as never)
          .eq('user_id', user.id)

        if (extError) throw extError
      } else {
        // Insert new profile
        const { error: extError } = await supabase
          .from('extended_user_profiles')
          .insert(extendedProfileData as never)

        if (extError) throw extError
      }

      setSaveSuccess(true)
      await refreshProfile()
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      console.error('Error saving profile:', err)
      setError('プロフィールの保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  function toggleTreatment(treatment: TreatmentType) {
    setProfile(prev => ({
      ...prev,
      treatment_methods: prev.treatment_methods.includes(treatment)
        ? prev.treatment_methods.filter(t => t !== treatment)
        : [...prev.treatment_methods, treatment],
    }))
  }

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 size={32} className="animate-spin text-rose-500" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  const currentYear = new Date().getFullYear()
  const yearOptions = Array.from({ length: 80 }, (_, i) => currentYear - i)

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/mypage"
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">プロフィール設定</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <AlertCircle size={20} />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {saveSuccess && (
          <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            <CheckCircle size={20} />
            <span className="text-sm">プロフィールを保存しました</span>
          </div>
        )}

        {/* Basic Info */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <User size={20} className="text-rose-500" />
            <h2 className="text-lg font-bold text-gray-900">基本情報</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                表示名
              </label>
              <input
                type="text"
                value={profile.display_name}
                onChange={(e) => setProfile(prev => ({ ...prev, display_name: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
                placeholder="ニックネーム"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                自己紹介
              </label>
              <textarea
                value={profile.bio}
                onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none resize-none"
                placeholder="自己紹介文を入力..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  年代
                </label>
                <select
                  value={profile.age_group || ''}
                  onChange={(e) => setProfile(prev => ({ ...prev, age_group: e.target.value as AgeGroup || null }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
                >
                  <option value="">選択してください</option>
                  {Object.entries(AGE_GROUP_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  性別
                </label>
                <select
                  value={profile.gender || ''}
                  onChange={(e) => setProfile(prev => ({ ...prev, gender: e.target.value as Gender || null }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
                >
                  <option value="">選択してください</option>
                  {Object.entries(GENDER_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Diabetes Info */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Heart size={20} className="text-rose-500" />
            <h2 className="text-lg font-bold text-gray-900">糖尿病情報</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                糖尿病のタイプ
              </label>
              <select
                value={profile.diabetes_type || ''}
                onChange={(e) => setProfile(prev => ({ ...prev, diabetes_type: e.target.value as DiabetesType || null }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
              >
                <option value="">選択してください</option>
                {Object.entries(DIABETES_TYPE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  診断年
                </label>
                <select
                  value={profile.diagnosis_year || ''}
                  onChange={(e) => setProfile(prev => ({ ...prev, diagnosis_year: e.target.value ? parseInt(e.target.value) : null }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
                >
                  <option value="">選択してください</option>
                  {yearOptions.map(year => (
                    <option key={year} value={year}>{year}年</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  罹患期間
                </label>
                <select
                  value={profile.illness_duration || ''}
                  onChange={(e) => setProfile(prev => ({ ...prev, illness_duration: e.target.value as IllnessDuration || null }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
                >
                  <option value="">選択してください</option>
                  {Object.entries(ILLNESS_DURATION_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Treatment Info */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Stethoscope size={20} className="text-rose-500" />
            <h2 className="text-lg font-bold text-gray-900">治療情報</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                治療方法（複数選択可）
              </label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(TREATMENT_TYPE_LABELS).map(([key, label]) => (
                  <label
                    key={key}
                    className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                      profile.treatment_methods.includes(key as TreatmentType)
                        ? 'border-rose-500 bg-rose-50 text-rose-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={profile.treatment_methods.includes(key as TreatmentType)}
                      onChange={() => toggleTreatment(key as TreatmentType)}
                      className="sr-only"
                    />
                    <span className="text-sm">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                使用デバイス
              </label>
              <select
                value={profile.device || ''}
                onChange={(e) => setProfile(prev => ({ ...prev, device: e.target.value as DeviceType || null }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
              >
                <option value="">選択してください</option>
                {Object.entries(DEVICE_TYPE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Health Status */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={20} className="text-rose-500" />
            <h2 className="text-lg font-bold text-gray-900">健康状態</h2>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-gray-300 transition-colors">
              <input
                type="checkbox"
                checked={profile.has_complications}
                onChange={(e) => setProfile(prev => ({ ...prev, has_complications: e.target.checked }))}
                className="w-5 h-5 text-rose-500 border-gray-300 rounded focus:ring-rose-500"
              />
              <span className="text-gray-700">合併症あり</span>
            </label>

            <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-gray-300 transition-colors">
              <input
                type="checkbox"
                checked={profile.on_dialysis}
                onChange={(e) => setProfile(prev => ({ ...prev, on_dialysis: e.target.checked }))}
                className="w-5 h-5 text-rose-500 border-gray-300 rounded focus:ring-rose-500"
              />
              <span className="text-gray-700">透析中</span>
            </label>

            <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-gray-300 transition-colors">
              <input
                type="checkbox"
                checked={profile.is_pregnant}
                onChange={(e) => setProfile(prev => ({ ...prev, is_pregnant: e.target.checked }))}
                className="w-5 h-5 text-rose-500 border-gray-300 rounded focus:ring-rose-500"
              />
              <span className="text-gray-700">妊娠中</span>
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Link
            href="/mypage"
            className="px-6 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            キャンセル
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-rose-500 text-white font-semibold rounded-lg hover:bg-rose-600 disabled:bg-gray-300 transition-colors"
          >
            {saving ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Save size={20} />
            )}
            <span>{saving ? '保存中...' : '保存する'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}
