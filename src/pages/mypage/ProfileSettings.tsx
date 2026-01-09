import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { compressImage, uploadToSupabaseStorage } from '../../lib/imageUpload'
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
import { Loader2, Save, Check, Plus, Trash2, Link as LinkIcon, Eye, EyeOff, Camera, User } from 'lucide-react'

const DIABETES_TYPES: NonNullable<DiabetesType>[] = [
  'type1',
  'type2',
  'gestational',
  'prediabetes',
  'family',
]

const TREATMENT_TYPES: TreatmentType[] = [
  'insulin',
  'insulin_pump',
  'oral_medication',
  'glp1',
  'diet_therapy',
  'exercise_therapy',
  'observation',
]

const AGE_GROUPS: AgeGroup[] = ['10s', '20s', '30s', '40s', '50s', '60s', '70s_plus', 'private']
const GENDERS: Gender[] = ['male', 'female', 'other', 'private']
const ILLNESS_DURATIONS: IllnessDuration[] = ['less_than_1', '1_to_3', '3_to_5', '5_to_10', '10_plus']
const DEVICE_TYPES: DeviceType[] = ['libre', 'dexcom', 'insulin_pump', 'meter_only', 'none', 'other']
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

  // Privacy toggles (using new naming convention)
  const [ageGroupPublic, setAgeGroupPublic] = useState(false)
  const [genderPublic, setGenderPublic] = useState(false)
  const [prefecturePublic, setPrefecturePublic] = useState(false)
  const [illnessDurationPublic, setIllnessDurationPublic] = useState(true) // default: true
  const [treatmentPublic, setTreatmentPublic] = useState(true) // default: true
  const [devicePublic, setDevicePublic] = useState(true) // default: true
  const [bioPublic, setBioPublic] = useState(true) // default: true
  const [hba1cPublic, setHba1cPublic] = useState(false)
  const [linksPublic, setLinksPublic] = useState(true) // default: true

  // Avatar upload state
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [avatarError, setAvatarError] = useState<string | null>(null)
  const avatarInputRef = useRef<HTMLInputElement>(null)

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setAvatarError('画像ファイルを選択してください')
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError('ファイルサイズは5MB以下にしてください')
      return
    }

    setAvatarUploading(true)
    setAvatarError(null)

    try {
      // Compress image (thumbnail size for avatar)
      const compressedFile = await compressImage(file, 'thumbnail')

      // Upload to Supabase Storage
      const url = await uploadToSupabaseStorage(compressedFile, 'avatars')
      setAvatarUrl(url)
    } catch (err) {
      console.error('Avatar upload error:', err)
      setAvatarError(err instanceof Error ? err.message : 'アップロードに失敗しました')
    } finally {
      setAvatarUploading(false)
      // Reset input
      if (avatarInputRef.current) {
        avatarInputRef.current.value = ''
      }
    }
  }

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
        setAgeGroupPublic(userProfileData.age_group_public ?? false)
        setGenderPublic(userProfileData.gender_public ?? false)
        setPrefecturePublic(userProfileData.prefecture_public ?? false)
        setIllnessDurationPublic(userProfileData.illness_duration_public ?? true)
        setTreatmentPublic(userProfileData.treatment_public ?? true)
        setDevicePublic(userProfileData.device_public ?? true)
        setBioPublic(userProfileData.bio_public ?? true)
        setHba1cPublic(userProfileData.hba1c_public ?? false)
        setLinksPublic(userProfileData.links_public ?? true)
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
        // Privacy flags (new naming convention)
        age_group_public: ageGroupPublic,
        gender_public: genderPublic,
        prefecture_public: prefecturePublic,
        illness_duration_public: illnessDurationPublic,
        treatment_public: treatmentPublic,
        device_public: devicePublic,
        bio_public: bioPublic,
        hba1c_public: hba1cPublic,
        links_public: linksPublic,
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
        <Loader2 size={24} className="animate-spin text-rose-500" />
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
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
          />
        </div>

        {/* Avatar Upload */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            アバター画像
          </label>
          <div className="flex items-center gap-4">
            {/* Avatar Preview */}
            <div className="relative">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-rose-100 flex items-center justify-center">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="アバター"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                ) : (
                  <User size={32} className="text-rose-400" />
                )}
              </div>
              {avatarUploading && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                  <Loader2 size={24} className="animate-spin text-white" />
                </div>
              )}
            </div>

            {/* Upload Button */}
            <div className="flex-1">
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
                id="avatar-upload"
              />
              <label
                htmlFor="avatar-upload"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg cursor-pointer transition-colors text-sm"
              >
                <Camera size={16} />
                <span>画像を選択</span>
              </label>
              <p className="text-xs text-gray-500 mt-1">
                JPG, PNG, GIF（5MB以下）
              </p>
              {avatarError && (
                <p className="text-xs text-red-500 mt-1">{avatarError}</p>
              )}
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">自己紹介</label>
            <PrivacyToggle value={bioPublic} onChange={setBioPublic} />
          </div>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="自己紹介を入力..."
            rows={3}
            maxLength={500}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none"
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
            <PrivacyToggle value={ageGroupPublic} onChange={setAgeGroupPublic} />
          </div>
          <select
            value={ageGroup || ''}
            onChange={(e) => setAgeGroup(e.target.value as AgeGroup || null)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
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
            <PrivacyToggle value={genderPublic} onChange={setGenderPublic} />
          </div>
          <select
            value={gender || ''}
            onChange={(e) => setGender(e.target.value as Gender || null)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
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
            <PrivacyToggle value={prefecturePublic} onChange={setPrefecturePublic} />
          </div>
          <select
            value={prefecture || ''}
            onChange={(e) => setPrefecture(e.target.value || null)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
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
                  diabetesType === type ? 'border-rose-500 bg-rose-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="diabetesType"
                  checked={diabetesType === type}
                  onChange={() => setDiabetesType(type)}
                  className="w-4 h-4 text-rose-500 focus:ring-rose-500"
                />
                <span className="text-sm text-gray-700">{DIABETES_TYPE_LABELS[type]}</span>
              </label>
            ))}
            <label
              className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                diabetesType === null ? 'border-rose-500 bg-rose-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="diabetesType"
                checked={diabetesType === null}
                onChange={() => setDiabetesType(null)}
                className="w-4 h-4 text-rose-500 focus:ring-rose-500"
              />
              <span className="text-sm text-gray-500">未設定</span>
            </label>
          </div>
        </div>

        {/* Illness Duration */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">罹患期間</label>
            <PrivacyToggle value={illnessDurationPublic} onChange={setIllnessDurationPublic} />
          </div>
          <select
            value={illnessDuration || ''}
            onChange={(e) => setIllnessDuration(e.target.value as IllnessDuration || null)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
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
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
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
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">治療方法（複数選択可）</label>
            <PrivacyToggle value={treatmentPublic} onChange={setTreatmentPublic} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {TREATMENT_TYPES.map((treatment) => (
              <label
                key={treatment}
                className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                  treatments.includes(treatment) ? 'border-rose-500 bg-rose-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={treatments.includes(treatment)}
                  onChange={() => handleTreatmentChange(treatment)}
                  className="w-4 h-4 text-rose-500 rounded focus:ring-rose-500"
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
            <PrivacyToggle value={devicePublic} onChange={setDevicePublic} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {DEVICE_TYPES.map((device) => (
              <label
                key={device}
                className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                  devices.includes(device) ? 'border-rose-500 bg-rose-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={devices.includes(device)}
                  onChange={() => handleDeviceChange(device)}
                  className="w-4 h-4 text-rose-500 rounded focus:ring-rose-500"
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
                  hasComplications === option ? 'border-rose-500 bg-rose-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="hasComplications"
                  checked={hasComplications === option}
                  onChange={() => setHasComplications(option)}
                  className="w-4 h-4 text-rose-500 focus:ring-rose-500"
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
                  onDialysis === option ? 'border-rose-500 bg-rose-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="onDialysis"
                  checked={onDialysis === option}
                  onChange={() => setOnDialysis(option)}
                  className="w-4 h-4 text-rose-500 focus:ring-rose-500"
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
                  isPregnant === option ? 'border-rose-500 bg-rose-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="isPregnant"
                  checked={isPregnant === option}
                  onChange={() => setIsPregnant(option)}
                  className="w-4 h-4 text-rose-500 focus:ring-rose-500"
                />
                <span className="text-sm text-gray-700">{YES_NO_PRIVATE_LABELS[option]}</span>
              </label>
            ))}
          </div>
        </div>
      </section>

      {/* External Links Section */}
      <section>
        <div className="flex items-center justify-between mb-4 pb-2 border-b">
          <h3 className="text-lg font-semibold text-gray-900">外部リンク</h3>
          <PrivacyToggle value={linksPublic} onChange={setLinksPublic} />
        </div>

        <div className="space-y-3">
          {externalLinks.map((link, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={link.title}
                onChange={(e) => updateExternalLink(index, 'title', e.target.value)}
                placeholder="タイトル（例: X、ブログ）"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent text-sm"
              />
              <input
                type="url"
                value={link.url}
                onChange={(e) => updateExternalLink(index, 'url', e.target.value)}
                placeholder="https://..."
                className="flex-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent text-sm"
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
              className="flex items-center gap-2 px-4 py-2 text-rose-500 border border-rose-300 rounded-lg hover:bg-rose-50 transition-colors text-sm"
            >
              <Plus size={16} />
              <span>リンクを追加</span>
            </button>
          )}
        </div>
      </section>

      {/* HbA1c Privacy Settings */}
      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">HbA1c記録の公開設定</h3>

        <div className="space-y-4">
          <PrivacySettingRow
            label="HbA1cグラフを公開"
            description="プロフィールページでHbA1cの推移グラフと記録を表示します"
            value={hba1cPublic}
            onChange={setHba1cPublic}
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
          className="flex items-center gap-2 px-6 py-2 bg-rose-500 text-white rounded-lg font-medium hover:bg-rose-600 disabled:opacity-50 transition-colors"
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
        value ? 'bg-rose-100 text-rose-600' : 'bg-gray-100 text-gray-500'
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
            value ? 'bg-rose-500' : 'bg-gray-300'
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
