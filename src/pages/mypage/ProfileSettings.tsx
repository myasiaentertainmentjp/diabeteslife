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
import { Loader2, Save, Check, Plus, Trash2, Link as LinkIcon, Eye, EyeOff, Camera, User, AlertTriangle, Bell } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'

const PROFILE_DRAFT_KEY = 'profile_settings_draft'

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
  const { user, profile: authProfile, refreshProfile, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check if returning from preview
  const returningFromPreview = (location.state as { fromPreview?: boolean } | null)?.fromPreview === true

  // Account deletion state
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

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
  // SNS links (ID only, converted to URL on save)
  const [xId, setXId] = useState('')
  const [instagramId, setInstagramId] = useState('')
  const [youtubeId, setYoutubeId] = useState('')
  const [tiktokId, setTiktokId] = useState('')
  const [customLinkTitle, setCustomLinkTitle] = useState('')
  const [customLinkUrl, setCustomLinkUrl] = useState('')

  // Helper to extract ID from URL
  function extractIdFromUrl(url: string, platform: string): string {
    if (!url) return ''
    try {
      const urlObj = new URL(url)
      const pathname = urlObj.pathname.replace(/^\//, '').replace(/\/$/, '')
      if (platform === 'youtube' && pathname.startsWith('@')) {
        return pathname
      }
      return pathname.split('/')[0] || ''
    } catch {
      return url.replace('@', '')
    }
  }

  // Helper to build URL from ID
  function buildUrl(id: string, platform: string): string {
    if (!id) return ''
    const cleanId = id.replace('@', '').trim()
    if (!cleanId) return ''
    switch (platform) {
      case 'x': return `https://x.com/${cleanId}`
      case 'instagram': return `https://instagram.com/${cleanId}`
      case 'youtube': return `https://youtube.com/@${cleanId}`
      case 'tiktok': return `https://tiktok.com/@${cleanId}`
      default: return ''
    }
  }

  // Save current form state to sessionStorage
  function saveDraft() {
    const draft = {
      displayName,
      avatarUrl,
      bio,
      diabetesType,
      treatments,
      diagnosisYear,
      ageGroup,
      gender,
      prefecture,
      illnessDuration,
      devices,
      hasComplications,
      onDialysis,
      isPregnant,
      xId,
      instagramId,
      youtubeId,
      tiktokId,
      customLinkTitle,
      customLinkUrl,
      ageGroupPublic,
      genderPublic,
      prefecturePublic,
      illnessDurationPublic,
      treatmentPublic,
      devicePublic,
      bioPublic,
      hba1cPublic,
      linksPublic,
      notifyThreadComment,
      notifyReply,
      notifyLikes,
      notifyProfileComment,
    }
    sessionStorage.setItem(PROFILE_DRAFT_KEY, JSON.stringify(draft))
  }

  // Restore form state from sessionStorage
  function restoreDraft(): boolean {
    const draftStr = sessionStorage.getItem(PROFILE_DRAFT_KEY)
    if (!draftStr) return false

    try {
      const draft = JSON.parse(draftStr)
      setDisplayName(draft.displayName || '')
      setAvatarUrl(draft.avatarUrl || '')
      setBio(draft.bio || '')
      setDiabetesType(draft.diabetesType)
      setTreatments(draft.treatments || [])
      setDiagnosisYear(draft.diagnosisYear)
      setAgeGroup(draft.ageGroup)
      setGender(draft.gender)
      setPrefecture(draft.prefecture)
      setIllnessDuration(draft.illnessDuration)
      setDevices(draft.devices || [])
      setHasComplications(draft.hasComplications || 'private')
      setOnDialysis(draft.onDialysis || 'private')
      setIsPregnant(draft.isPregnant || 'private')
      setXId(draft.xId || '')
      setInstagramId(draft.instagramId || '')
      setYoutubeId(draft.youtubeId || '')
      setTiktokId(draft.tiktokId || '')
      setCustomLinkTitle(draft.customLinkTitle || '')
      setCustomLinkUrl(draft.customLinkUrl || '')
      setAgeGroupPublic(draft.ageGroupPublic ?? false)
      setGenderPublic(draft.genderPublic ?? false)
      setPrefecturePublic(draft.prefecturePublic ?? false)
      setIllnessDurationPublic(draft.illnessDurationPublic ?? true)
      setTreatmentPublic(draft.treatmentPublic ?? true)
      setDevicePublic(draft.devicePublic ?? true)
      setBioPublic(draft.bioPublic ?? true)
      setHba1cPublic(draft.hba1cPublic ?? false)
      setLinksPublic(draft.linksPublic ?? true)
      setNotifyThreadComment(draft.notifyThreadComment ?? true)
      setNotifyReply(draft.notifyReply ?? true)
      setNotifyLikes(draft.notifyLikes ?? true)
      setNotifyProfileComment(draft.notifyProfileComment ?? true)
      return true
    } catch {
      return false
    }
  }

  // Clear draft from sessionStorage
  function clearDraft() {
    sessionStorage.removeItem(PROFILE_DRAFT_KEY)
  }

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

  // Notification settings
  const [notifyThreadComment, setNotifyThreadComment] = useState(true)
  const [notifyReply, setNotifyReply] = useState(true)
  const [notifyLikes, setNotifyLikes] = useState(true)
  const [notifyProfileComment, setNotifyProfileComment] = useState(true)

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
    // If returning from preview, restore draft instead of fetching
    if (returningFromPreview) {
      const restored = restoreDraft()
      if (restored) {
        setLoading(false)
        return
      }
    }
    fetchProfile()
  }, [user, returningFromPreview])

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
        // Load treatment from user_profiles
        if (userProfileData.treatment && Array.isArray(userProfileData.treatment)) {
          setTreatments(userProfileData.treatment)
        }
        setDevices(userProfileData.devices || [])
        setHasComplications(userProfileData.has_complications || 'private')
        setOnDialysis(userProfileData.on_dialysis || 'private')
        setIsPregnant(userProfileData.is_pregnant || 'private')
        // Parse external_links into SNS fields (extract IDs from URLs)
        const links = userProfileData.external_links || []
        links.forEach((link: ExternalLink) => {
          const url = link.url?.toLowerCase() || ''
          if (url.includes('twitter.com') || url.includes('x.com')) {
            setXId(extractIdFromUrl(link.url, 'x'))
          } else if (url.includes('instagram.com')) {
            setInstagramId(extractIdFromUrl(link.url, 'instagram'))
          } else if (url.includes('youtube.com') || url.includes('youtu.be')) {
            setYoutubeId(extractIdFromUrl(link.url, 'youtube'))
          } else if (url.includes('tiktok.com')) {
            setTiktokId(extractIdFromUrl(link.url, 'tiktok'))
          } else if (!customLinkUrl) {
            setCustomLinkTitle(link.title || '')
            setCustomLinkUrl(link.url)
          }
        })
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

      // Try users table for display_name and avatar
      const { data: userData } = await supabase
        .from('users')
        .select('display_name, avatar_url')
        .eq('id', user.id)
        .single()

      if (userData) {
        if (!displayName) setDisplayName(userData.display_name || '')
        if (!avatarUrl) setAvatarUrl(userData.avatar_url || '')
      }

      // Fetch notification settings
      const { data: notifSettings } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (notifSettings) {
        setNotifyThreadComment(notifSettings.thread_comment ?? true)
        setNotifyReply(notifSettings.reply ?? true)
        setNotifyLikes(notifSettings.likes ?? true)
        setNotifyProfileComment(notifSettings.profile_comment ?? true)
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return

    setSaving(true)
    setError(null)
    setSaved(false)

    try {
      // Update users table
      const { error: usersError } = await supabase
        .from('users')
        .update({
          display_name: displayName || null,
          avatar_url: avatarUrl || null,
          updated_at: new Date().toISOString(),
        } as never)
        .eq('id', user.id)

      if (usersError) {
        console.error('Error updating users:', usersError)
      }

      // Build profile data
      const externalLinks = [
        ...(xId ? [{ title: 'X', url: buildUrl(xId, 'x') }] : []),
        ...(instagramId ? [{ title: 'Instagram', url: buildUrl(instagramId, 'instagram') }] : []),
        ...(youtubeId ? [{ title: 'YouTube', url: buildUrl(youtubeId, 'youtube') }] : []),
        ...(tiktokId ? [{ title: 'TikTok', url: buildUrl(tiktokId, 'tiktok') }] : []),
        ...(customLinkUrl ? [{ title: customLinkTitle || 'リンク', url: customLinkUrl }] : []),
      ]

      // Check if user_profiles record exists
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('user_id')
        .eq('user_id', user.id)
        .single()

      const userProfileData = {
        diabetes_type: diabetesType,
        diagnosis_year: diagnosisYear,
        bio: bio || null,
        age_group: ageGroup,
        gender: gender,
        prefecture: prefecture,
        illness_duration: illnessDuration,
        treatment: treatments.length > 0 ? treatments : [],
        devices: devices.length > 0 ? devices : [],
        has_complications: hasComplications,
        on_dialysis: onDialysis,
        is_pregnant: isPregnant,
        external_links: externalLinks,
        display_name: displayName || null,
        // Privacy flags
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

      if (existingProfile) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update(userProfileData as never)
          .eq('user_id', user.id)

        if (updateError) {
          console.error('Error updating user_profiles:', updateError)
          throw updateError
        }
      } else {
        // Insert new record
        const { error: insertError } = await supabase
          .from('user_profiles')
          .insert({ ...userProfileData, user_id: user.id } as never)

        if (insertError) {
          console.error('Error inserting user_profiles:', insertError)
          throw insertError
        }
      }

      // Check if notification settings exist
      const { data: existingNotif } = await supabase
        .from('notification_settings')
        .select('user_id')
        .eq('user_id', user.id)
        .single()

      const notifData = {
        thread_comment: notifyThreadComment,
        reply: notifyReply,
        likes: notifyLikes,
        profile_comment: notifyProfileComment,
      }

      if (existingNotif) {
        await supabase
          .from('notification_settings')
          .update(notifData as never)
          .eq('user_id', user.id)
      } else {
        await supabase
          .from('notification_settings')
          .insert({ ...notifData, user_id: user.id } as never)
      }

      setSaved(true)
      clearDraft() // Clear draft after successful save
      refreshProfile()
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      console.error('Error saving profile:', err)
      setError('プロフィールの更新に失敗しました')
    }

    setSaving(false)
  }

  async function handleDeleteAccount() {
    if (!user || deleteConfirmText !== '退会する') return

    setDeleting(true)
    setDeleteError(null)

    try {
      // Delete user data from various tables
      // The order matters due to foreign key constraints

      // Delete HbA1c records
      await supabase.from('hba1c_records').delete().eq('user_id', user.id)

      // Delete comments
      await supabase.from('comments').delete().eq('user_id', user.id)

      // Delete diary entries
      await supabase.from('diary_entries').delete().eq('user_id', user.id)

      // Delete threads
      await supabase.from('threads').delete().eq('user_id', user.id)

      // Delete profile comments (both as commenter and profile owner)
      await supabase.from('profile_comments').delete().eq('commenter_id', user.id)
      await supabase.from('profile_comments').delete().eq('profile_user_id', user.id)

      // Delete reactions
      await supabase.from('diary_reactions').delete().eq('user_id', user.id)
      await supabase.from('thread_reactions').delete().eq('user_id', user.id)

      // Delete user_profiles
      await supabase.from('user_profiles').delete().eq('user_id', user.id)

      // Delete from users table
      await supabase.from('users').delete().eq('id', user.id)

      // Sign out and redirect
      await signOut()
      navigate('/', { replace: true })
    } catch (err) {
      console.error('Error deleting account:', err)
      setDeleteError('退会処理中にエラーが発生しました。お問い合わせください。')
      setDeleting(false)
    }
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
          <h3 className="text-lg font-semibold text-gray-900">SNS・外部リンク</h3>
          <PrivacyToggle value={linksPublic} onChange={setLinksPublic} />
        </div>

        <div className="space-y-4">
          {/* X (Twitter) */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center bg-black text-white rounded-lg text-lg font-bold shrink-0">
              𝕏
            </div>
            <div className="flex-1 flex items-center">
              <span className="px-3 py-2 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg text-gray-500 text-sm">@</span>
              <input
                type="text"
                value={xId}
                onChange={(e) => setXId(e.target.value.replace('@', ''))}
                placeholder="ID（ユーザー名）"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Instagram */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 text-white rounded-lg shrink-0">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </div>
            <div className="flex-1 flex items-center">
              <span className="px-3 py-2 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg text-gray-500 text-sm">@</span>
              <input
                type="text"
                value={instagramId}
                onChange={(e) => setInstagramId(e.target.value.replace('@', ''))}
                placeholder="ID（ユーザー名）"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* YouTube */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center bg-red-600 text-white rounded-lg shrink-0">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </div>
            <div className="flex-1 flex items-center">
              <span className="px-3 py-2 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg text-gray-500 text-sm">@</span>
              <input
                type="text"
                value={youtubeId}
                onChange={(e) => setYoutubeId(e.target.value.replace('@', ''))}
                placeholder="チャンネルID"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* TikTok */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center bg-black text-white rounded-lg shrink-0">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
              </svg>
            </div>
            <div className="flex-1 flex items-center">
              <span className="px-3 py-2 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg text-gray-500 text-sm">@</span>
              <input
                type="text"
                value={tiktokId}
                onChange={(e) => setTiktokId(e.target.value.replace('@', ''))}
                placeholder="ID（ユーザー名）"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Custom Link */}
          <div className="pt-2 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-2">自由リンク（ブログなど）</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center bg-gray-500 text-white rounded-lg shrink-0">
                <LinkIcon size={20} />
              </div>
              <div className="flex-1 flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={customLinkTitle}
                  onChange={(e) => setCustomLinkTitle(e.target.value)}
                  placeholder="タイトル"
                  className="w-full sm:w-28 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent text-sm"
                />
                <input
                  type="url"
                  value={customLinkUrl}
                  onChange={(e) => setCustomLinkUrl(e.target.value)}
                  placeholder="https://..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent text-sm"
                />
              </div>
            </div>
          </div>
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

      {/* Notification Settings */}
      <section>
        <div className="flex items-center gap-2 mb-4 pb-2 border-b">
          <Bell size={20} className="text-rose-500" />
          <h3 className="text-lg font-semibold text-gray-900">通知設定</h3>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          各種アクティビティの通知のオン/オフを設定できます。
        </p>

        <div className="space-y-4">
          <PrivacySettingRow
            label="スレッドへのコメント"
            description="自分のスレッドに新しいコメントが付いたときに通知"
            value={notifyThreadComment}
            onChange={setNotifyThreadComment}
          />
          <PrivacySettingRow
            label="コメントへの返信"
            description="自分のコメントに返信が付いたときに通知"
            value={notifyReply}
            onChange={setNotifyReply}
          />
          <PrivacySettingRow
            label="いいね"
            description="スレッドや日記にいいねされたときに通知"
            value={notifyLikes}
            onChange={setNotifyLikes}
          />
          <PrivacySettingRow
            label="プロフィールコメント"
            description="プロフィールに応援コメントが付いたときに通知"
            value={notifyProfileComment}
            onChange={setNotifyProfileComment}
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
      <div className="flex flex-wrap items-center gap-4 pt-4 border-t">
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
        <button
          type="button"
          onClick={() => {
            // Save draft before navigating to preview
            saveDraft()
            // Pass current form state to preview
            const previewData = {
              display_name: displayName,
              avatar_url: avatarUrl,
              diabetes_type: diabetesType,
              diagnosis_year: diagnosisYear,
              bio: bio,
              age_group: ageGroup,
              gender: gender,
              prefecture: prefecture,
              illness_duration: illnessDuration,
              treatment: treatments,
              devices: devices,
              external_links: [
                ...(xId ? [{ title: 'X', url: buildUrl(xId, 'x') }] : []),
                ...(instagramId ? [{ title: 'Instagram', url: buildUrl(instagramId, 'instagram') }] : []),
                ...(youtubeId ? [{ title: 'YouTube', url: buildUrl(youtubeId, 'youtube') }] : []),
                ...(tiktokId ? [{ title: 'TikTok', url: buildUrl(tiktokId, 'tiktok') }] : []),
                ...(customLinkUrl ? [{ title: customLinkTitle || 'リンク', url: customLinkUrl }] : []),
              ],
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
            navigate(`/users/${user?.id}`, { state: { previewData, isPreview: true } })
          }}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          <Eye size={18} />
          <span>プレビュー</span>
        </button>
      </div>

      {/* Account Deletion Section */}
      <section className="mt-12 pt-8 border-t-2 border-red-200">
        <h3 className="text-lg font-semibold text-red-600 mb-4">退会</h3>
        <p className="text-sm text-gray-600 mb-4">
          退会すると、投稿したスレッド・コメント・HbA1c記録などすべてのデータが削除されます。この操作は取り消せません。
        </p>
        <button
          type="button"
          onClick={() => setShowDeleteModal(true)}
          className="flex items-center gap-2 px-4 py-2 border-2 border-red-500 text-red-500 rounded-lg font-medium hover:bg-red-50 transition-colors"
        >
          <Trash2 size={18} />
          <span>退会する</span>
        </button>
      </section>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle size={24} className="text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">本当に退会しますか？</h3>
                <p className="text-sm text-gray-500">この操作は取り消せません</p>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-red-700">
                退会すると以下のデータがすべて削除されます：
              </p>
              <ul className="text-sm text-red-700 mt-2 space-y-1">
                <li>• 投稿したスレッド・コメント</li>
                <li>• HbA1c記録</li>
                <li>• プロフィール情報</li>
                <li>• その他すべてのデータ</li>
              </ul>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                確認のため「退会する」と入力してください
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="退会する"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            {deleteError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {deleteError}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false)
                  setDeleteConfirmText('')
                  setDeleteError(null)
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== '退会する' || deleting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {deleting ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Trash2 size={18} />
                )}
                <span>{deleting ? '処理中...' : '退会する'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
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
