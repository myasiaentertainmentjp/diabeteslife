import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import {
  DiabetesType,
  TreatmentType,
  AgeGroup,
  Gender,
  IllnessDuration,
  DeviceType,
  YesNoPrivate,
  DIABETES_TYPE_LABELS,
  TREATMENT_TYPE_LABELS,
  AGE_GROUP_LABELS,
  GENDER_LABELS,
  ILLNESS_DURATION_LABELS,
  DEVICE_TYPE_LABELS,
  YES_NO_PRIVATE_LABELS,
  PREFECTURES,
  ExternalLink,
} from '../../types/database'
import { Loader2, Save, Check, Plus, Trash2, Link as LinkIcon, Eye, EyeOff } from 'lucide-react'

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

const AGE_GROUPS: AgeGroup[] = ['10s', '20s', '30s', '40s', '50s', '60s', '70s_plus', 'private']
const GENDERS: Gender[] = ['male', 'female', 'other', 'private']
const ILLNESS_DURATIONS: IllnessDuration[] = ['less_than_1', '1_to_3', '3_to_5', '5_to_10', '10_plus']
const DEVICE_TYPES: DeviceType[] = ['libre', 'libre2', 'dexcom', 'pump', 'cgm', 'none']
const YES_NO_PRIVATES: YesNoPrivate[] = ['yes', 'no', 'private']

const currentYear = new Date().getFullYear()
const DIAGNOSIS_YEARS = Array.from({ length: 50 }, (_, i) => currentYear - i)

export function ProfileSettings() {
  const { user, profile: authProfile, refreshProfile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Basic profile fields
  const [displayName, setDisplayName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [bio, setBio] = useState('')
  const [diabetesType, setDiabetesType] = useState<DiabetesType>(null)
  const [treatments, setTreatments] = useState<TreatmentType[]>([])
  const [diagnosisYear, setDiagnosisYear] = useState<number | null>(null)

  // New Phase 1 fields
  const [ageGroup, setAgeGroup] = useState<AgeGroup | null>(null)
  const [gender, setGender] = useState<Gender | null>(null)
  const [prefecture, setPrefecture] = useState<string | null>(null)
  const [illnessDuration, setIllnessDuration] = useState<IllnessDuration | null>(null)
  const [devices, setDevices] = useState<DeviceType[]>([])
  const [hasComplications, setHasComplications] = useState<YesNoPrivate>('private')
  const [onDialysis, setOnDialysis] = useState<YesNoPrivate>('private')
  const [isPregnant, setIsPregnant] = useState<YesNoPrivate>('private')
  const [externalLinks, setExternalLinks] = useState<ExternalLink[]>([])

  // Privacy toggles
  const [isTagsPublic, setIsTagsPublic] = useState(false)
  const [isAgePublic, setIsAgePublic] = useState(false)
  const [isGenderPublic, setIsGenderPublic] = useState(false)
  const [isPrefecturePublic, setIsPrefecturePublic] = useState(false)
  const [isIllnessDurationPublic, setIsIllnessDurationPublic] = useState(false)
  const [isDevicesPublic, setIsDevicesPublic] = useState(false)
  const [isHba1cPublic, setIsHba1cPublic] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [user])

  async function fetchProfile() {
    if (!user) {
      setLoading(false)
      return
    }

    setLoading(true)

    try {
      // Try user_profiles table first (new schema)
      const { data: userProfileData } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (userProfileData) {
        setDisplayName(userProfileData.display_name || '')
        setBio(userProfileData.bio || '')
        setDiabetesType(userProfileData.diabetes_type)
        setDiagnosisYear(userProfileData.diagnosis_year)
        setAgeGroup(userProfileData.age_group)
        setGender(userProfileData.gender)
        setPrefecture(userProfileData.prefecture)
        setIllnessDuration(userProfileData.illness_duration)
        setDevices(userProfileData.devices || [])
        setHasComplications(userProfileData.has_complications || 'private')
        setOnDialysis(userProfileData.on_dialysis || 'private')
        setIsPregnant(userProfileData.is_pregnant || 'private')
        setExternalLinks(userProfileData.external_links || [])
        setIsAgePublic(userProfileData.is_age_public || false)
        setIsGenderPublic(userProfileData.is_gender_public || false)
        setIsPrefecturePublic(userProfileData.is_prefecture_public || false)
        setIsIllnessDurationPublic(userProfileData.is_illness_duration_public || false)
        setIsDevicesPublic(userProfileData.is_devices_public || false)
        setIsHba1cPublic(userProfileData.is_hba1c_public || false)
      }

      // Also try profiles table for other fields
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileData) {
        if (!userProfileData) {
          setDisplayName(profileData.display_name || '')
          setBio(profileData.bio || '')
          setDiabetesType(profileData.diabetes_type)
          setDiagnosisYear(profileData.diagnosis_year)
        }
        setAvatarUrl(profileData.avatar_url || '')
        setTreatments(profileData.treatments || [])
        setIsTagsPublic(profileData.is_tags_public || false)
      }

      // Try users table for display_name
      const { data: userData } = await supabase
        .from('users')
        .select('display_name, avatar_url')
        .eq('id', user.id)
        .single()

      if (userData) {
        if (!displayName) setDisplayName(userData.display_name || '')
        if (!avatarUrl) setAvatarUrl(userData.avatar_url || '')
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  function handleTreatmentChange(treatment: TreatmentType) {
    setTreatments((prev) =>
      prev.includes(treatment)
        ? prev.filter((t) => t !== treatment)
        : [...prev, treatment]
    )
  }

  function handleDeviceChange(device: DeviceType) {
    setDevices((prev) =>
      prev.includes(device)
        ? prev.filter((d) => d !== device)
        : [...prev, device]
    )
  }

  function addExternalLink() {
    setExternalLinks((prev) => [...prev, { title: '', url: '' }])
  }

  function updateExternalLink(index: number, field: 'title' | 'url', value: string) {
    setExternalLinks((prev) =>
      prev.map((link, i) => (i === index ? { ...link, [field]: value } : link))
    )
  }

  function removeExternalLink(index: number) {
    setExternalLinks((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return

    setSaving(true)
    setError(null)
    setSaved(false)

    try {
      // Update users table
      await supabase
        .from('users')
        .update({
          display_name: displayName || null,
          avatar_url: avatarUrl || null,
          updated_at: new Date().toISOString(),
        } as never)
        .eq('id', user.id)

      // Update or insert user_profiles table
      const userProfileData = {
        user_id: user.id,
        diabetes_type: diabetesType,
        diagnosis_year: diagnosisYear,
        bio: bio || null,
        age_group: ageGroup,
        gender: gender,
        prefecture: prefecture,
        illness_duration: illnessDuration,
        devices: devices.length > 0 ? devices : [],
        has_complications: hasComplications,
        on_dialysis: onDialysis,
        is_pregnant: isPregnant,
        external_links: externalLinks.filter((l) => l.title && l.url),
        is_age_public: isAgePublic,
        is_gender_public: isGenderPublic,
        is_prefecture_public: isPrefecturePublic,
        is_illness_duration_public: isIllnessDurationPublic,
        is_devices_public: isDevicesPublic,
        is_hba1c_public: isHba1cPublic,
      }

      const { error: upsertError } = await supabase
        .from('user_profiles')
        .upsert(userProfileData as never, { onConflict: 'user_id' })

      if (upsertError) {
        console.error('Error updating user_profiles:', upsertError)
      }

      // Also update profiles table for backward compatibility
      const profileData = {
        display_name: displayName || null,
        avatar_url: avatarUrl || null,
        bio: bio || null,
        diabetes_type: diabetesType,
        treatments: treatments.length > 0 ? treatments : null,
        diagnosis_year: diagnosisYear,
        is_tags_public: isTagsPublic,
        updated_at: new Date().toISOString(),
      }

      await supabase
        .from('profiles')
        .update(profileData as never)
        .eq('id', user.id)

      setSaved(true)
      refreshProfile()
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      console.error('Error saving profile:', err)
      setError('プロフィールの更新に失敗しました')
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
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Info Section */}
      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">基本情報</h3>

        {/* Display Name */}
        <div className="mb-4">
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
        <div className="mb-4">
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

        {/* Bio */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            自己紹介
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="自己紹介を入力..."
            rows={3}
            maxLength={500}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
          />
          <p className="mt-1 text-xs text-gray-500 text-right">{bio.length}/500</p>
        </div>
      </section>

      {/* Personal Info Section */}
      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">個人情報</h3>

        {/* Age Group */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">年代</label>
            <PrivacyToggle value={isAgePublic} onChange={setIsAgePublic} />
          </div>
          <select
            value={ageGroup || ''}
            onChange={(e) => setAgeGroup(e.target.value as AgeGroup || null)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">未設定</option>
            {AGE_GROUPS.filter(a => a !== 'private').map((age) => (
              <option key={age} value={age}>
                {AGE_GROUP_LABELS[age]}
              </option>
            ))}
          </select>
        </div>

        {/* Gender */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">性別</label>
            <PrivacyToggle value={isGenderPublic} onChange={setIsGenderPublic} />
          </div>
          <select
            value={gender || ''}
            onChange={(e) => setGender(e.target.value as Gender || null)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">未設定</option>
            {GENDERS.filter(g => g !== 'private').map((g) => (
              <option key={g} value={g}>
                {GENDER_LABELS[g]}
              </option>
            ))}
          </select>
        </div>

        {/* Prefecture */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">都道府県</label>
            <PrivacyToggle value={isPrefecturePublic} onChange={setIsPrefecturePublic} />
          </div>
          <select
            value={prefecture || ''}
            onChange={(e) => setPrefecture(e.target.value || null)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">未設定</option>
            {PREFECTURES.map((pref) => (
              <option key={pref} value={pref}>
                {pref}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Diabetes Info Section */}
      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">糖尿病に関する情報</h3>

        {/* Diabetes Type */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            糖尿病タイプ
          </label>
          <div className="grid grid-cols-2 gap-2">
            {DIABETES_TYPES.map((type) => (
              <label
                key={type}
                className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                  diabetesType === type ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="diabetesType"
                  checked={diabetesType === type}
                  onChange={() => setDiabetesType(type)}
                  className="w-4 h-4 text-green-600 focus:ring-green-500"
                />
                <span className="text-sm text-gray-700">{DIABETES_TYPE_LABELS[type]}</span>
              </label>
            ))}
            <label
              className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                diabetesType === null ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="diabetesType"
                checked={diabetesType === null}
                onChange={() => setDiabetesType(null)}
                className="w-4 h-4 text-green-600 focus:ring-green-500"
              />
              <span className="text-sm text-gray-500">未設定</span>
            </label>
          </div>
        </div>

        {/* Illness Duration */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">罹患期間</label>
            <PrivacyToggle value={isIllnessDurationPublic} onChange={setIsIllnessDurationPublic} />
          </div>
          <select
            value={illnessDuration || ''}
            onChange={(e) => setIllnessDuration(e.target.value as IllnessDuration || null)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">未設定</option>
            {ILLNESS_DURATIONS.map((duration) => (
              <option key={duration} value={duration}>
                {ILLNESS_DURATION_LABELS[duration]}
              </option>
            ))}
          </select>
        </div>

        {/* Diagnosis Year */}
        <div className="mb-4">
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

        {/* Treatments */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            治療方法（複数選択可）
          </label>
          <div className="grid grid-cols-2 gap-2">
            {TREATMENT_TYPES.map((treatment) => (
              <label
                key={treatment}
                className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                  treatments.includes(treatment) ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={treatments.includes(treatment)}
                  onChange={() => handleTreatmentChange(treatment)}
                  className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                />
                <span className="text-sm text-gray-700">
                  {TREATMENT_TYPE_LABELS[treatment]}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Devices */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">使用デバイス（複数選択可）</label>
            <PrivacyToggle value={isDevicesPublic} onChange={setIsDevicesPublic} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {DEVICE_TYPES.map((device) => (
              <label
                key={device}
                className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                  devices.includes(device) ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={devices.includes(device)}
                  onChange={() => handleDeviceChange(device)}
                  className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                />
                <span className="text-sm text-gray-700">
                  {DEVICE_TYPE_LABELS[device]}
                </span>
              </label>
            ))}
          </div>
        </div>
      </section>

      {/* Health Status Section */}
      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">健康状態</h3>

        {/* Complications */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            合併症
          </label>
          <div className="flex gap-2">
            {YES_NO_PRIVATES.map((option) => (
              <label
                key={option}
                className={`flex-1 flex items-center justify-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                  hasComplications === option ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="hasComplications"
                  checked={hasComplications === option}
                  onChange={() => setHasComplications(option)}
                  className="w-4 h-4 text-green-600 focus:ring-green-500"
                />
                <span className="text-sm text-gray-700">{YES_NO_PRIVATE_LABELS[option]}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Dialysis */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            透析
          </label>
          <div className="flex gap-2">
            {YES_NO_PRIVATES.map((option) => (
              <label
                key={option}
                className={`flex-1 flex items-center justify-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                  onDialysis === option ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="onDialysis"
                  checked={onDialysis === option}
                  onChange={() => setOnDialysis(option)}
                  className="w-4 h-4 text-green-600 focus:ring-green-500"
                />
                <span className="text-sm text-gray-700">{YES_NO_PRIVATE_LABELS[option]}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Pregnancy */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            妊娠中
          </label>
          <div className="flex gap-2">
            {YES_NO_PRIVATES.map((option) => (
              <label
                key={option}
                className={`flex-1 flex items-center justify-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                  isPregnant === option ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="isPregnant"
                  checked={isPregnant === option}
                  onChange={() => setIsPregnant(option)}
                  className="w-4 h-4 text-green-600 focus:ring-green-500"
                />
                <span className="text-sm text-gray-700">{YES_NO_PRIVATE_LABELS[option]}</span>
              </label>
            ))}
          </div>
        </div>
      </section>

      {/* External Links Section */}
      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">外部リンク</h3>

        <div className="space-y-3">
          {externalLinks.map((link, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={link.title}
                onChange={(e) => updateExternalLink(index, 'title', e.target.value)}
                placeholder="タイトル（例: X、ブログ）"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
              />
              <input
                type="url"
                value={link.url}
                onChange={(e) => updateExternalLink(index, 'url', e.target.value)}
                placeholder="https://..."
                className="flex-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
              />
              <button
                type="button"
                onClick={() => removeExternalLink(index)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}

          {externalLinks.length < 5 && (
            <button
              type="button"
              onClick={addExternalLink}
              className="flex items-center gap-2 px-4 py-2 text-green-600 border border-green-300 rounded-lg hover:bg-green-50 transition-colors text-sm"
            >
              <Plus size={16} />
              <span>リンクを追加</span>
            </button>
          )}
        </div>
      </section>

      {/* Privacy Settings Section */}
      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">公開設定</h3>

        <div className="space-y-4">
          <PrivacySettingRow
            label="タグを公開"
            description="糖尿病タイプや治療方法を投稿時に表示します"
            value={isTagsPublic}
            onChange={setIsTagsPublic}
          />

          <PrivacySettingRow
            label="HbA1cグラフを公開"
            description="プロフィールページでHbA1cの推移を表示します"
            value={isHba1cPublic}
            onChange={setIsHba1cPublic}
          />
        </div>
      </section>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <div className="flex items-center gap-4 pt-4 border-t">
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

// Privacy Toggle Component
function PrivacyToggle({
  value,
  onChange,
}: {
  value: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`flex items-center gap-1 px-2 py-1 text-xs rounded-full transition-colors ${
        value ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
      }`}
    >
      {value ? <Eye size={12} /> : <EyeOff size={12} />}
      <span>{value ? '公開' : '非公開'}</span>
    </button>
  )
}

// Privacy Setting Row Component
function PrivacySettingRow({
  label,
  description,
  value,
  onChange,
}: {
  label: string
  description: string
  value: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <label className="flex items-center justify-between cursor-pointer">
      <div>
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <p className="text-xs text-gray-500 mt-1">{description}</p>
      </div>
      <div className="relative">
        <input
          type="checkbox"
          checked={value}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
        <div
          className={`w-11 h-6 rounded-full transition-colors ${
            value ? 'bg-green-600' : 'bg-gray-300'
          }`}
        >
          <div
            className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
              value ? 'translate-x-5' : 'translate-x-0.5'
            } mt-0.5`}
          />
        </div>
      </div>
    </label>
  )
}
