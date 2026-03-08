import { useState, useEffect, useRef } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts'
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
  VisitFrequency,
  MedicalDepartment,
  ComplicationType,
  DietMethod,
  ExerciseFrequency,
  ExerciseType,
  SmokingStatus,
  DrinkingStatus,
  ConsentType,
  UserConsent,
  DIABETES_TYPE_LABELS,
  TREATMENT_TYPE_LABELS,
  AGE_GROUP_LABELS,
  GENDER_LABELS,
  ILLNESS_DURATION_LABELS,
  DEVICE_TYPE_LABELS,
  YES_NO_PRIVATE_LABELS,
  VISIT_FREQUENCY_LABELS,
  MEDICAL_DEPARTMENT_LABELS,
  COMPLICATION_LABELS,
  DIET_METHOD_LABELS,
  EXERCISE_FREQUENCY_LABELS,
  EXERCISE_TYPE_LABELS,
  SMOKING_STATUS_LABELS,
  DRINKING_STATUS_LABELS,
  CONSENT_LABELS,
  PREFECTURES,
  DIABETES_MEDICATIONS,
  ExternalLink,
  HbA1cRecord,
  WeightRecord,
} from '../../types/database'
import { Loader2, Save, Check, Plus, Trash2, Link as LinkIcon, Eye, EyeOff, Camera, User, AlertTriangle, Bell, Activity, Edit2, X, Stethoscope, Heart, Shield, Download } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'

// HbA1c記録用の型とデフォルト値
interface HbA1cFormData {
  recorded_at: string
  value: string
  memo: string
  is_public: boolean
}

const initialHbA1cFormData: HbA1cFormData = {
  recorded_at: new Date().toISOString().slice(0, 10),
  value: '',
  memo: '',
  is_public: false,
}

// 体重記録用の型とデフォルト値
interface WeightFormData {
  recorded_at: string
  value: string
  memo: string
  is_public: boolean
}

const initialWeightFormData: WeightFormData = {
  recorded_at: new Date().toISOString().slice(0, 10),
  value: '',
  memo: '',
  is_public: false,
}

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
  'none',
]

const AGE_GROUPS: AgeGroup[] = ['10s', '20s', '30s', '40s', '50s', '60s', '70s_plus', 'private']
const GENDERS: Gender[] = ['male', 'female', 'other', 'private']
const ILLNESS_DURATIONS: IllnessDuration[] = ['less_than_1', '1_to_3', '3_to_5', '5_to_10', '10_plus']
const DEVICE_TYPES: DeviceType[] = ['libre', 'dexcom', 'insulin_pump', 'meter_only', 'none', 'other']
const YES_NO_PRIVATES: YesNoPrivate[] = ['yes', 'no', 'private']

// M&A Phase 2: 通院・生活習慣の選択肢
const VISIT_FREQUENCIES: VisitFrequency[] = ['monthly', 'bimonthly', 'quarterly', 'biannually', 'annually', 'irregular']
const MEDICAL_DEPARTMENTS: MedicalDepartment[] = ['diabetes_internal', 'general_internal', 'endocrine', 'other']
const COMPLICATION_TYPES: ComplicationType[] = ['retinopathy', 'nephropathy', 'neuropathy', 'cardiovascular', 'foot', 'dental', 'other']
const DIET_METHODS: DietMethod[] = ['carb_restriction', 'calorie_restriction', 'balanced', 'none']
const EXERCISE_FREQUENCIES: ExerciseFrequency[] = ['daily', 'several_weekly', 'weekly', 'monthly', 'rarely', 'none']
const EXERCISE_TYPE_LIST: ExerciseType[] = ['walking', 'jogging', 'gym', 'swimming', 'cycling', 'yoga', 'other']
const SMOKING_STATUSES: SmokingStatus[] = ['never', 'former', 'current']
const DRINKING_STATUSES: DrinkingStatus[] = ['never', 'rarely', 'sometimes', 'often']
const CONSENT_TYPES: ConsentType[] = ['research_data', 'pharma_data', 'marketing']

const currentYear = new Date().getFullYear()

interface ProfileSettingsProps {
  // No props needed now that HbA1c is integrated
}

export function ProfileSettings({}: ProfileSettingsProps) {
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

  // HbA1c Records state
  const [hba1cRecords, setHba1cRecords] = useState<HbA1cRecord[]>([])
  const [hba1cLoading, setHba1cLoading] = useState(true)
  const [hba1cSaving, setHba1cSaving] = useState(false)
  const [showHba1cForm, setShowHba1cForm] = useState(false)
  const [hba1cEditingId, setHba1cEditingId] = useState<string | null>(null)
  const [hba1cFormData, setHba1cFormData] = useState<HbA1cFormData>(initialHbA1cFormData)
  const [hba1cError, setHba1cError] = useState<string | null>(null)

  // Weight Records state
  const [weightRecords, setWeightRecords] = useState<WeightRecord[]>([])
  const [weightLoading, setWeightLoading] = useState(true)
  const [weightSaving, setWeightSaving] = useState(false)
  const [showWeightForm, setShowWeightForm] = useState(false)
  const [weightEditingId, setWeightEditingId] = useState<string | null>(null)
  const [weightFormData, setWeightFormData] = useState<WeightFormData>(initialWeightFormData)
  const [weightError, setWeightError] = useState<string | null>(null)
  const [weightPublic, setWeightPublic] = useState(false)

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
  // 服用薬（M&A向け重要データ）
  const [medications, setMedications] = useState<string[]>([])
  const [medicationsPublic, setMedicationsPublic] = useState(false)
  const [medicationInput, setMedicationInput] = useState('')
  const [showMedicationSuggestions, setShowMedicationSuggestions] = useState(false)

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
      notifyHba1cReminder,
      medications,
      medicationsPublic,
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
      setNotifyHba1cReminder(draft.notifyHba1cReminder ?? true)
      setMedications(draft.medications || [])
      setMedicationsPublic(draft.medicationsPublic ?? false)
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
  const [notifyHba1cReminder, setNotifyHba1cReminder] = useState(true)
  const [notifyWeightReminder, setNotifyWeightReminder] = useState(true)

  // M&A Phase 2: 通院・検査データ
  const [visitFrequency, setVisitFrequency] = useState<VisitFrequency | null>(null)
  const [medicalDepartment, setMedicalDepartment] = useState<MedicalDepartment | null>(null)
  const [complications, setComplications] = useState<ComplicationType[]>([])
  const [visitFrequencyPublic, setVisitFrequencyPublic] = useState(false)
  const [medicalDepartmentPublic, setMedicalDepartmentPublic] = useState(false)
  const [complicationsPublic, setComplicationsPublic] = useState(false)

  // M&A Phase 2: 生活習慣データ
  const [dietMethod, setDietMethod] = useState<DietMethod[]>([])
  const [exerciseFrequency, setExerciseFrequency] = useState<ExerciseFrequency | null>(null)
  const [exerciseTypes, setExerciseTypes] = useState<ExerciseType[]>([])
  const [smokingStatus, setSmokingStatus] = useState<SmokingStatus | null>(null)
  const [drinkingStatus, setDrinkingStatus] = useState<DrinkingStatus | null>(null)
  const [lifestylePublic, setLifestylePublic] = useState(false)

  // M&A Phase 2: データ利用同意
  const [consents, setConsents] = useState<UserConsent[]>([])
  const [consentLoading, setConsentLoading] = useState(true)
  const [consentSaving, setConsentSaving] = useState(false)

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
    fetchHba1cRecords()
    fetchWeightRecords()
  }, [user, returningFromPreview])

  // HbA1c Records functions
  async function fetchHba1cRecords() {
    if (!user) {
      setHba1cLoading(false)
      return
    }

    const { data, error } = await supabase
      .from('hba1c_records')
      .select('*')
      .eq('user_id', user.id)
      .order('recorded_at', { ascending: false })

    if (error) {
      console.error('Error fetching HbA1c records:', error)
    } else {
      setHba1cRecords(data as unknown as HbA1cRecord[])
    }
    setHba1cLoading(false)
  }

  function getHba1cChartData() {
    const sortedRecords = [...hba1cRecords]
      .sort((a, b) => a.recorded_at.localeCompare(b.recorded_at))
      .slice(-12)

    return sortedRecords.map((record) => ({
      month: record.recorded_at.slice(5),
      value: record.value,
    }))
  }

  function getHba1cFeedback(): { message: string; emoji: string; type: 'up' | 'down' | 'same' } | null {
    if (hba1cRecords.length < 2) return null

    const latest = hba1cRecords[0].value
    const previous = hba1cRecords[1].value
    const diff = latest - previous

    if (Math.abs(diff) < 0.1) {
      return { message: '安定していますね！この調子で！', emoji: '💪', type: 'same' }
    } else if (diff < 0) {
      return {
        message: `素晴らしい！${Math.abs(diff).toFixed(1)}%改善しました！`,
        emoji: '🎉',
        type: 'down',
      }
    } else {
      return {
        message: '少し上がりましたが、一緒に頑張りましょう！',
        emoji: '😊',
        type: 'up',
      }
    }
  }

  function handleHba1cEdit(record: HbA1cRecord) {
    setHba1cEditingId(record.id)
    setHba1cFormData({
      recorded_at: record.recorded_at,
      value: record.value.toString(),
      memo: record.memo || '',
      is_public: record.is_public,
    })
    setShowHba1cForm(true)
  }

  async function handleHba1cDelete(id: string) {
    if (!confirm('この記録を削除しますか？')) return

    const { error } = await supabase.from('hba1c_records').delete().eq('id', id)

    if (error) {
      console.error('Error deleting HbA1c record:', error)
      setHba1cError('削除に失敗しました')
    } else {
      setHba1cRecords((prev) => prev.filter((r) => r.id !== id))
    }
  }

  async function handleHba1cSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return

    const value = parseFloat(hba1cFormData.value)
    if (isNaN(value) || value < 4.0 || value > 15.0) {
      setHba1cError('HbA1c値は4.0〜15.0の範囲で入力してください')
      return
    }

    setHba1cSaving(true)
    setHba1cError(null)

    if (hba1cEditingId) {
      const { error } = await supabase
        .from('hba1c_records')
        .update({
          recorded_at: hba1cFormData.recorded_at,
          value,
          memo: hba1cFormData.memo || null,
          is_public: hba1cFormData.is_public,
          updated_at: new Date().toISOString(),
        } as never)
        .eq('id', hba1cEditingId)

      if (error) {
        console.error('Error updating HbA1c record:', error)
        setHba1cError('更新に失敗しました')
      } else {
        await fetchHba1cRecords()
        resetHba1cForm()
      }
    } else {
      const { error } = await supabase.from('hba1c_records').insert({
        user_id: user.id,
        recorded_at: hba1cFormData.recorded_at,
        value,
        memo: hba1cFormData.memo || null,
        is_public: hba1cFormData.is_public,
      } as never)

      if (error) {
        console.error('Error inserting HbA1c record:', error)
        setHba1cError('登録に失敗しました')
      } else {
        await fetchHba1cRecords()
        resetHba1cForm()
      }
    }

    setHba1cSaving(false)
  }

  function resetHba1cForm() {
    setHba1cFormData(initialHbA1cFormData)
    setHba1cEditingId(null)
    setShowHba1cForm(false)
  }

  function formatHba1cMonth(monthStr: string) {
    const [year, month] = monthStr.split('-')
    return `${year}年${parseInt(month)}月`
  }

  // Weight Records functions
  async function fetchWeightRecords() {
    if (!user) {
      setWeightLoading(false)
      return
    }

    const { data, error } = await supabase
      .from('weight_records')
      .select('*')
      .eq('user_id', user.id)
      .order('recorded_at', { ascending: false })

    if (error) {
      console.error('Error fetching weight records:', error)
    } else {
      setWeightRecords(data as unknown as WeightRecord[])
    }
    setWeightLoading(false)
  }

  function getWeightChartData() {
    const sortedRecords = [...weightRecords]
      .sort((a, b) => a.recorded_at.localeCompare(b.recorded_at))
      .slice(-12)

    return sortedRecords.map((record) => ({
      month: record.recorded_at.slice(5),
      value: record.value,
    }))
  }

  function getWeightFeedback(): { message: string; emoji: string; type: 'up' | 'down' | 'same' } | null {
    if (weightRecords.length < 2) return null

    const latest = weightRecords[0].value
    const previous = weightRecords[1].value
    const diff = latest - previous

    if (Math.abs(diff) < 0.5) {
      return { message: '安定していますね！', emoji: '💪', type: 'same' }
    } else if (diff < 0) {
      return {
        message: `順調です！${Math.abs(diff).toFixed(1)}kg減りました！`,
        emoji: '🎉',
        type: 'down',
      }
    } else {
      return {
        message: '一緒に頑張りましょう！',
        emoji: '😊',
        type: 'up',
      }
    }
  }

  function handleWeightEdit(record: WeightRecord) {
    setWeightEditingId(record.id)
    setWeightFormData({
      recorded_at: record.recorded_at,
      value: record.value.toString(),
      memo: record.memo || '',
      is_public: record.is_public,
    })
    setShowWeightForm(true)
  }

  async function handleWeightDelete(id: string) {
    if (!confirm('この記録を削除しますか？')) return

    const { error } = await supabase.from('weight_records').delete().eq('id', id)

    if (error) {
      console.error('Error deleting weight record:', error)
      setWeightError('削除に失敗しました')
    } else {
      setWeightRecords((prev) => prev.filter((r) => r.id !== id))
    }
  }

  async function handleWeightSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return

    const value = parseFloat(weightFormData.value)
    if (isNaN(value) || value < 20 || value > 300) {
      setWeightError('体重は20〜300kgの範囲で入力してください')
      return
    }

    setWeightSaving(true)
    setWeightError(null)

    if (weightEditingId) {
      const { error } = await supabase
        .from('weight_records')
        .update({
          recorded_at: weightFormData.recorded_at,
          value,
          memo: weightFormData.memo || null,
          is_public: weightFormData.is_public,
          updated_at: new Date().toISOString(),
        } as never)
        .eq('id', weightEditingId)

      if (error) {
        console.error('Error updating weight record:', error)
        setWeightError('更新に失敗しました')
      } else {
        await fetchWeightRecords()
        resetWeightForm()
      }
    } else {
      const { error } = await supabase.from('weight_records').insert({
        user_id: user.id,
        recorded_at: weightFormData.recorded_at,
        value,
        memo: weightFormData.memo || null,
        is_public: weightFormData.is_public,
      } as never)

      if (error) {
        console.error('Error inserting weight record:', error)
        setWeightError('登録に失敗しました')
      } else {
        await fetchWeightRecords()
        resetWeightForm()
      }
    }

    setWeightSaving(false)
  }

  function resetWeightForm() {
    setWeightFormData(initialWeightFormData)
    setWeightEditingId(null)
    setShowWeightForm(false)
  }

  async function fetchProfile() {
    if (!user) {
      setLoading(false)
      return
    }

    setLoading(true)

    try {
      // Fetch basic data from users table
      const { data: userData } = await supabase
        .from('users')
        .select('display_name, avatar_url')
        .eq('id', user.id)
        .single()

      if (userData) {
        setDisplayName(userData.display_name || '')
        setAvatarUrl(userData.avatar_url || '')
      }

      // Fetch extended profile from user_profiles table
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (profileData) {
        setBio(profileData.bio || '')
        setDiabetesType(profileData.diabetes_type || null)
        setDiagnosisYear(profileData.diagnosis_year || null)
        setAgeGroup(profileData.age_group || null)
        setGender(profileData.gender || null)
        setPrefecture(profileData.prefecture || null)
        setIllnessDuration(profileData.illness_duration || null)
        if (profileData.treatment_methods && Array.isArray(profileData.treatment_methods)) {
          setTreatments(profileData.treatment_methods)
        }
        if (profileData.device) {
          setDevices([profileData.device])
        }
        setHasComplications(profileData.has_complications || 'private')
        setOnDialysis(profileData.on_dialysis || 'private')
        setIsPregnant(profileData.is_pregnant || 'private')
        // Parse external_links
        const links = profileData.external_links || []
        if (Array.isArray(links)) {
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
        }
        // Privacy settings
        setAgeGroupPublic(profileData.age_group_public ?? false)
        setGenderPublic(profileData.gender_public ?? false)
        setPrefecturePublic(profileData.prefecture_public ?? false)
        setIllnessDurationPublic(profileData.illness_duration_public ?? true)
        setTreatmentPublic(profileData.treatment_public ?? true)
        setDevicePublic(profileData.device_public ?? true)
        setBioPublic(profileData.bio_public ?? true)
        setHba1cPublic(profileData.hba1c_public ?? false)
        setLinksPublic(profileData.links_public ?? true)
        // 服用薬
        if (profileData.medications && Array.isArray(profileData.medications)) {
          setMedications(profileData.medications)
        }
        setMedicationsPublic(profileData.medications_public ?? false)
        setWeightPublic(profileData.weight_public ?? false)

        // M&A Phase 2: 通院・検査データ
        setVisitFrequency(profileData.visit_frequency || null)
        setMedicalDepartment(profileData.medical_department || null)
        if (profileData.complications && Array.isArray(profileData.complications)) {
          setComplications(profileData.complications)
        }
        setVisitFrequencyPublic(profileData.visit_frequency_public ?? false)
        setMedicalDepartmentPublic(profileData.medical_department_public ?? false)
        setComplicationsPublic(profileData.complications_public ?? false)

        // M&A Phase 2: 生活習慣データ
        if (profileData.diet_method && Array.isArray(profileData.diet_method)) {
          setDietMethod(profileData.diet_method)
        }
        setExerciseFrequency(profileData.exercise_frequency || null)
        if (profileData.exercise_types && Array.isArray(profileData.exercise_types)) {
          setExerciseTypes(profileData.exercise_types)
        }
        setSmokingStatus(profileData.smoking_status || null)
        setDrinkingStatus(profileData.drinking_status || null)
        setLifestylePublic(profileData.lifestyle_public ?? false)
      }

      // Fetch notification settings
      const { data: notifSettings } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (notifSettings) {
        setNotifyThreadComment(notifSettings.thread_comment ?? true)
        setNotifyReply(notifSettings.reply ?? true)
        setNotifyLikes(notifSettings.likes ?? true)
        setNotifyProfileComment(notifSettings.profile_comment ?? true)
        setNotifyHba1cReminder((notifSettings as any).hba1c_reminder ?? true)
        setNotifyWeightReminder((notifSettings as any).weight_reminder ?? true)
      }

      // Fetch user consents
      const { data: consentData } = await supabase
        .from('user_consents')
        .select('*')
        .eq('user_id', user.id)

      if (consentData) {
        setConsents(consentData as UserConsent[])
      }
      setConsentLoading(false)
    } catch (error) {
      console.error('Error fetching profile:', error)
      setConsentLoading(false)
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

  // M&A Phase 2: 合併症選択ハンドラー
  function handleComplicationChange(complication: ComplicationType) {
    setComplications((prev) =>
      prev.includes(complication)
        ? prev.filter((c) => c !== complication)
        : [...prev, complication]
    )
  }

  // M&A Phase 2: 食事管理選択ハンドラー
  function handleDietMethodChange(method: DietMethod) {
    setDietMethod((prev) =>
      prev.includes(method)
        ? prev.filter((m) => m !== method)
        : [...prev, method]
    )
  }

  // M&A Phase 2: 運動種類選択ハンドラー
  function handleExerciseTypeChange(type: ExerciseType) {
    setExerciseTypes((prev) =>
      prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type]
    )
  }

  // M&A Phase 2: 同意変更ハンドラー
  async function handleConsentChange(consentType: ConsentType, consented: boolean) {
    if (!user) return

    setConsentSaving(true)
    try {
      const existingConsent = consents.find(c => c.consent_type === consentType)
      const now = new Date().toISOString()

      if (existingConsent) {
        // Update existing consent
        const { error } = await supabase
          .from('user_consents')
          .update({
            consented,
            consented_at: consented ? now : null,
            ip_address: null, // Could capture if needed
            user_agent: navigator.userAgent,
            updated_at: now,
          } as never)
          .eq('id', existingConsent.id)

        if (error) throw error

        setConsents(prev => prev.map(c =>
          c.id === existingConsent.id
            ? { ...c, consented, consented_at: consented ? now : null, updated_at: now }
            : c
        ))
      } else {
        // Create new consent record
        const { data, error } = await supabase
          .from('user_consents')
          .insert({
            user_id: user.id,
            consent_type: consentType,
            consented,
            consented_at: consented ? now : null,
            user_agent: navigator.userAgent,
          } as never)
          .select()
          .single()

        if (error) throw error

        if (data) {
          setConsents(prev => [...prev, data as UserConsent])
        }
      }
    } catch (error) {
      console.error('Error updating consent:', error)
    } finally {
      setConsentSaving(false)
    }
  }

  // 同意状態を取得するヘルパー
  function getConsentValue(consentType: ConsentType): boolean {
    const consent = consents.find(c => c.consent_type === consentType)
    return consent?.consented ?? false
  }

  function getConsentDate(consentType: ConsentType): string | null {
    const consent = consents.find(c => c.consent_type === consentType)
    return consent?.consented_at ?? null
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return

    setSaving(true)
    setError(null)
    setSaved(false)

    try {
      // Build external links
      const externalLinks = [
        ...(xId ? [{ title: 'X', url: buildUrl(xId, 'x') }] : []),
        ...(instagramId ? [{ title: 'Instagram', url: buildUrl(instagramId, 'instagram') }] : []),
        ...(youtubeId ? [{ title: 'YouTube', url: buildUrl(youtubeId, 'youtube') }] : []),
        ...(tiktokId ? [{ title: 'TikTok', url: buildUrl(tiktokId, 'tiktok') }] : []),
        ...(customLinkUrl ? [{ title: customLinkTitle || 'リンク', url: customLinkUrl }] : []),
      ]

      // Update users table (basic profile data)
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
        throw usersError
      }

      // Update user_profiles table (extended profile data)
      const profileData = {
        user_id: user.id,
        bio: bio || null,
        diabetes_type: diabetesType,
        diagnosis_year: diagnosisYear,
        age_group: ageGroup,
        gender: gender,
        prefecture: prefecture,
        illness_duration: illnessDuration,
        treatment_methods: treatments.length > 0 ? treatments : [],
        device: devices.length > 0 ? devices[0] : null,
        has_complications: hasComplications,
        on_dialysis: onDialysis,
        is_pregnant: isPregnant,
        external_links: externalLinks,
        age_group_public: ageGroupPublic,
        gender_public: genderPublic,
        prefecture_public: prefecturePublic,
        illness_duration_public: illnessDurationPublic,
        treatment_public: treatmentPublic,
        device_public: devicePublic,
        bio_public: bioPublic,
        hba1c_public: hba1cPublic,
        links_public: linksPublic,
        medications: medications.length > 0 ? medications : null,
        medications_public: medicationsPublic,
        weight_public: weightPublic,
        // M&A Phase 2: 通院・検査データ
        visit_frequency: visitFrequency,
        medical_department: medicalDepartment,
        complications: complications.length > 0 ? complications : null,
        visit_frequency_public: visitFrequencyPublic,
        medical_department_public: medicalDepartmentPublic,
        complications_public: complicationsPublic,
        // M&A Phase 2: 生活習慣データ
        diet_method: dietMethod.length > 0 ? dietMethod : null,
        exercise_frequency: exerciseFrequency,
        exercise_types: exerciseTypes.length > 0 ? exerciseTypes : null,
        smoking_status: smokingStatus,
        drinking_status: drinkingStatus,
        lifestyle_public: lifestylePublic,
        updated_at: new Date().toISOString(),
      }

      // Try upsert to user_profiles
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert(profileData, { onConflict: 'user_id' })

      if (profileError) {
        console.warn('Could not save extended profile:', profileError)
        // Don't throw - basic profile was saved successfully
      }

      // Handle notification settings
      const { data: existingNotif } = await supabase
        .from('notification_settings')
        .select('user_id')
        .eq('user_id', user.id)
        .maybeSingle()

      const notifData = {
        thread_comment: notifyThreadComment,
        reply: notifyReply,
        likes: notifyLikes,
        profile_comment: notifyProfileComment,
        hba1c_reminder: notifyHba1cReminder,
        weight_reminder: notifyWeightReminder,
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
      clearDraft()
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

  // ローディング表示は削除 - フォームを即座に表示してデータは非同期で読み込む

  // Calculate profile completeness
  const calculateProfileCompleteness = () => {
    let score = 0
    const maxScore = 100

    // Basic info (40 points)
    if (displayName) score += 15
    if (avatarUrl) score += 15
    if (bio) score += 10

    // Personal info (20 points)
    if (ageGroup) score += 7
    if (gender) score += 7
    if (prefecture) score += 6

    // Diabetes info (30 points) - family type can skip some
    if (diabetesType) score += 10
    if (diabetesType === 'family') {
      // Family/supporter gets full points for these sections
      score += 20
    } else {
      if (treatments.length > 0) score += 10
      if (diagnosisYear || illnessDuration) score += 10
    }

    // Links (10 points)
    if (xId || instagramId || youtubeId || tiktokId || customLinkUrl) score += 10

    return Math.min(score, maxScore)
  }

  const profileCompleteness = calculateProfileCompleteness()

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Profile Completeness Bar */}
      <section className="bg-gradient-to-r from-rose-50 to-orange-50 rounded-xl p-4 border border-rose-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">プロフィール充実度</span>
          <span className="text-lg font-bold text-rose-500">{profileCompleteness}%</span>
        </div>
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-rose-400 to-orange-400 rounded-full transition-all duration-500"
            style={{ width: `${profileCompleteness}%` }}
          />
        </div>
        {profileCompleteness < 100 && (
          <p className="text-xs text-gray-500 mt-2">
            {profileCompleteness < 50
              ? '基本情報を入力して、充実したプロフィールを作りましょう！'
              : profileCompleteness < 80
              ? 'あと少しで充実したプロフィールになります！'
              : '素晴らしい！もう少しで完璧です！'}
          </p>
        )}
      </section>

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
          <p className="text-xs text-gray-500 mb-2">
            糖尿病のタイプ・経過年数・治療法・趣味など、自由に書いてみましょう
          </p>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder={"例）2型糖尿病3年目です。食事管理と運動を中心に頑張ってます。同じ境遇の方と情報交換できたら嬉しいです！"}
            rows={3}
            maxLength={200}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none"
          />
          <p className="mt-1 text-xs text-gray-500 text-right">{bio.length}/200</p>
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

        {/* Note for family/supporter */}
        {diabetesType === 'family' && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
            <p>家族・サポーターの方は、治療法・診断年の入力は任意です。ご自身が糖尿病でない場合は「該当なし」を選択してください。</p>
          </div>
        )}

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

        {/* Diagnosis Year with auto-calculated duration */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">
              診断年
              {diabetesType === 'family' && <span className="ml-2 text-xs text-gray-400">- 任意</span>}
            </label>
            <PrivacyToggle value={illnessDurationPublic} onChange={setIllnessDurationPublic} />
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={diagnosisYear || ''}
                onChange={(e) => setDiagnosisYear(e.target.value ? Number(e.target.value) : null)}
                placeholder="1960"
                min={1960}
                max={currentYear}
                className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
              <span className="text-gray-500">年</span>
            </div>
            {diagnosisYear && diagnosisYear <= currentYear && diagnosisYear >= 1960 && (
              <span className="px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-sm font-medium">
                糖尿病歴：約{currentYear - diagnosisYear}年
              </span>
            )}
          </div>
        </div>

        {/* Treatments */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">
              治療方法（複数選択可）
              {diabetesType === 'family' && <span className="ml-2 text-xs text-gray-400">- 任意</span>}
            </label>
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

        {/* Medications - M&A向け重要データ */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">
              服用中の薬
              <span className="ml-2 px-2 py-0.5 bg-rose-100 text-rose-600 text-xs rounded-full">重要</span>
            </label>
            <PrivacyToggle value={medicationsPublic} onChange={setMedicationsPublic} />
          </div>
          <p className="text-xs text-gray-500 mb-2">
            糖尿病治療で服用中の薬を入力してください（複数可）
          </p>

          {/* 選択済みの薬タグ */}
          {medications.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {medications.map((med, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-sm"
                >
                  {med}
                  <button
                    type="button"
                    onClick={() => setMedications(prev => prev.filter((_, i) => i !== index))}
                    className="text-rose-500 hover:text-rose-700"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* 薬の入力フィールド */}
          <div className="relative">
            <input
              type="text"
              value={medicationInput}
              onChange={(e) => {
                setMedicationInput(e.target.value)
                setShowMedicationSuggestions(e.target.value.length > 0)
              }}
              onFocus={() => setShowMedicationSuggestions(medicationInput.length > 0 || true)}
              onBlur={() => setTimeout(() => setShowMedicationSuggestions(false), 200)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && medicationInput.trim()) {
                  e.preventDefault()
                  if (!medications.includes(medicationInput.trim())) {
                    setMedications(prev => [...prev, medicationInput.trim()])
                  }
                  setMedicationInput('')
                  setShowMedicationSuggestions(false)
                }
              }}
              placeholder="薬の名前を入力（例：メトホルミン）"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            />

            {/* サジェストドロップダウン */}
            {showMedicationSuggestions && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {DIABETES_MEDICATIONS
                  .filter(med =>
                    med.toLowerCase().includes(medicationInput.toLowerCase()) &&
                    !medications.includes(med)
                  )
                  .slice(0, 10)
                  .map((med) => (
                    <button
                      key={med}
                      type="button"
                      onClick={() => {
                        setMedications(prev => [...prev, med])
                        setMedicationInput('')
                        setShowMedicationSuggestions(false)
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-rose-50 text-gray-700 hover:text-rose-600 transition-colors"
                    >
                      {med}
                    </button>
                  ))}
                {medicationInput.trim() &&
                  !medications.includes(medicationInput.trim()) &&
                  !DIABETES_MEDICATIONS.includes(medicationInput.trim() as typeof DIABETES_MEDICATIONS[number]) && (
                  <button
                    type="button"
                    onClick={() => {
                      setMedications(prev => [...prev, medicationInput.trim()])
                      setMedicationInput('')
                      setShowMedicationSuggestions(false)
                    }}
                    className="w-full px-4 py-2 text-left text-sm bg-gray-50 hover:bg-rose-50 text-gray-600 hover:text-rose-600 transition-colors border-t"
                  >
                    「{medicationInput.trim()}」を追加
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Health Status Section */}
      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">健康状態</h3>
        <p className="text-sm text-gray-500 mb-4">「未回答」を選ぶと、この項目は表示されません。</p>

        {/* Complications */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            合併症
          </label>
          <div className="flex gap-2">
            {(['yes', 'no', 'private'] as const).map((option) => (
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
                <span className="text-sm text-gray-700">
                  {option === 'yes' ? 'あり' : option === 'no' ? 'なし' : '未回答'}
                </span>
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
            {(['yes', 'no', 'private'] as const).map((option) => (
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
                <span className="text-sm text-gray-700">
                  {option === 'yes' ? 'あり' : option === 'no' ? 'なし' : '未回答'}
                </span>
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
            {(['yes', 'no', 'private'] as const).map((option) => (
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
                <span className="text-sm text-gray-700">
                  {option === 'yes' ? 'あり' : option === 'no' ? 'なし' : '未回答'}
                </span>
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

          {/* YouTube - 非表示（既存データは保持） */}
          {/* TikTok - 非表示（既存データは保持） */}

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

      {/* HbA1c Records Section - 統合版 */}
      <section>
        <div className="flex items-center gap-2 mb-4 pb-2 border-b">
          <Activity size={20} className="text-rose-500" />
          <h3 className="text-lg font-semibold text-gray-900">HbA1c記録</h3>
        </div>

        {/* Privacy Setting */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <PrivacySettingRow
            label="HbA1cグラフを公開"
            description="プロフィールページでHbA1cの推移グラフと記録を表示します"
            value={hba1cPublic}
            onChange={setHba1cPublic}
          />
        </div>

        {/* HbA1c Loading */}
        {hba1cLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 size={24} className="animate-spin text-rose-500" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Chart */}
            {hba1cRecords.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-4">HbA1c推移（過去12ヶ月）</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={getHba1cChartData()} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#e5e7eb' }} />
                    <YAxis domain={[4, 12]} tick={{ fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#e5e7eb' }} tickFormatter={(value) => `${value}%`} />
                    <Tooltip formatter={(value: number) => [`${value}%`, 'HbA1c']} labelFormatter={(label) => `${label}月`} />
                    <ReferenceLine y={7} stroke="#10B981" strokeDasharray="5 5" />
                    <Line type="monotone" dataKey="value" stroke="#2563EB" strokeWidth={2} dot={{ fill: '#2563EB', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Feedback */}
            {getHba1cFeedback() && (
              <div className={`flex items-center gap-3 p-4 rounded-lg ${
                getHba1cFeedback()?.type === 'down' ? 'bg-green-50 text-green-700' :
                getHba1cFeedback()?.type === 'up' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'
              }`}>
                <span className="text-2xl">{getHba1cFeedback()?.emoji}</span>
                <span className="font-medium">{getHba1cFeedback()?.message}</span>
              </div>
            )}

            {/* Add Button */}
            {!showHba1cForm && (
              <button type="button" onClick={() => setShowHba1cForm(true)} className="flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-lg font-medium hover:bg-rose-600 transition-colors">
                <Plus size={18} />
                <span>新しい記録を追加</span>
              </button>
            )}

            {/* Form */}
            {showHba1cForm && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">{hba1cEditingId ? '記録を編集' : '新しい記録'}</h4>
                  <button type="button" onClick={resetHba1cForm} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">測定月</label>
                    <div className="flex gap-2">
                      <select value={hba1cFormData.recorded_at.split('-')[0]} onChange={(e) => setHba1cFormData((prev) => ({ ...prev, recorded_at: `${e.target.value}-${prev.recorded_at.split('-')[1] || '01'}-15` }))} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent">
                        {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i).map((year) => (<option key={year} value={year}>{year}年</option>))}
                      </select>
                      <select value={hba1cFormData.recorded_at.split('-')[1] || '01'} onChange={(e) => setHba1cFormData((prev) => ({ ...prev, recorded_at: `${prev.recorded_at.split('-')[0]}-${e.target.value}-15` }))} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent">
                        {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map((month) => (<option key={month} value={month}>{parseInt(month)}月</option>))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">HbA1c値（%）</label>
                    <input type="number" step="0.1" min="4.0" max="15.0" value={hba1cFormData.value} onChange={(e) => setHba1cFormData((prev) => ({ ...prev, value: e.target.value }))} placeholder="例: 6.5" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">メモ（任意）</label>
                  <textarea value={hba1cFormData.memo} onChange={(e) => setHba1cFormData((prev) => ({ ...prev, memo: e.target.value }))} placeholder="メモを入力..." rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none" />
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={hba1cFormData.is_public} onChange={(e) => setHba1cFormData((prev) => ({ ...prev, is_public: e.target.checked }))} className="w-4 h-4 text-rose-500 rounded focus:ring-rose-500" />
                  <span className="text-sm text-gray-700">この記録を公開する</span>
                </label>
                {hba1cError && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{hba1cError}</div>}
                <div className="flex gap-3">
                  <button type="button" onClick={handleHba1cSubmit} disabled={hba1cSaving} className="flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-lg font-medium hover:bg-rose-600 disabled:opacity-50 transition-colors">
                    {hba1cSaving && <Loader2 size={16} className="animate-spin" />}
                    <span>{hba1cEditingId ? '更新する' : '記録する'}</span>
                  </button>
                  <button type="button" onClick={resetHba1cForm} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors">キャンセル</button>
                </div>
              </div>
            )}

            {/* History Table */}
            {hba1cRecords.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">記録履歴</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-4 py-2 text-left font-medium text-gray-600">測定月</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-600">HbA1c</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-600">メモ</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-600">公開</th>
                        <th className="px-4 py-2 text-right font-medium text-gray-600">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {hba1cRecords.map((record) => (
                        <tr key={record.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-gray-900">{formatHba1cMonth(record.recorded_at)}</td>
                          <td className="px-4 py-3"><span className={`font-medium ${record.value <= 7 ? 'text-green-600' : record.value <= 8 ? 'text-orange-600' : 'text-red-600'}`}>{record.value}%</span></td>
                          <td className="px-4 py-3 text-gray-600 max-w-[200px] truncate">{record.memo || '-'}</td>
                          <td className="px-4 py-3">{record.is_public ? <span className="text-rose-500">公開</span> : <span className="text-gray-400">非公開</span>}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-2">
                              <button type="button" onClick={() => handleHba1cEdit(record)} className="p-1 text-gray-400 hover:text-rose-500"><Edit2 size={16} /></button>
                              <button type="button" onClick={() => handleHba1cDelete(record.id)} className="p-1 text-gray-400 hover:text-red-600"><Trash2 size={16} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {hba1cRecords.length === 0 && !showHba1cForm && (
              <div className="text-center py-8 text-gray-500">
                <p>まだ記録がありません</p>
                <p className="text-sm mt-1">「新しい記録を追加」ボタンから記録を始めましょう</p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Weight Records Section */}
      <section>
        <div className="flex items-center gap-2 mb-4 pb-2 border-b">
          <Activity size={20} className="text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-900">体重記録</h3>
        </div>

        {/* Privacy Setting */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <PrivacySettingRow
            label="体重グラフを公開"
            description="プロフィールページで体重の推移グラフと記録を表示します"
            value={weightPublic}
            onChange={setWeightPublic}
          />
        </div>

        {/* Weight Loading */}
        {weightLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 size={24} className="animate-spin text-blue-500" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Chart */}
            {weightRecords.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-4">体重推移（過去12ヶ月）</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={getWeightChartData()} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#e5e7eb' }} />
                    <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#e5e7eb' }} tickFormatter={(value) => `${value}kg`} />
                    <Tooltip formatter={(value: number) => [`${value}kg`, '体重']} labelFormatter={(label) => `${label}月`} />
                    <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2} dot={{ fill: '#3B82F6', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Feedback */}
            {getWeightFeedback() && (
              <div className={`flex items-center gap-3 p-4 rounded-lg ${
                getWeightFeedback()?.type === 'down' ? 'bg-green-50 text-green-700' :
                getWeightFeedback()?.type === 'up' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'
              }`}>
                <span className="text-2xl">{getWeightFeedback()?.emoji}</span>
                <span className="font-medium">{getWeightFeedback()?.message}</span>
              </div>
            )}

            {/* Add Button */}
            {!showWeightForm && (
              <button type="button" onClick={() => setShowWeightForm(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors">
                <Plus size={18} />
                <span>新しい記録を追加</span>
              </button>
            )}

            {/* Form */}
            {showWeightForm && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">{weightEditingId ? '記録を編集' : '新しい記録'}</h4>
                  <button type="button" onClick={resetWeightForm} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">測定日</label>
                    <div className="flex gap-2">
                      <select value={weightFormData.recorded_at.split('-')[0]} onChange={(e) => setWeightFormData((prev) => ({ ...prev, recorded_at: `${e.target.value}-${prev.recorded_at.split('-')[1] || '01'}-${prev.recorded_at.split('-')[2] || '15'}` }))} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i).map((year) => (<option key={year} value={year}>{year}年</option>))}
                      </select>
                      <select value={weightFormData.recorded_at.split('-')[1] || '01'} onChange={(e) => setWeightFormData((prev) => ({ ...prev, recorded_at: `${prev.recorded_at.split('-')[0]}-${e.target.value}-${prev.recorded_at.split('-')[2] || '15'}` }))} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map((month) => (<option key={month} value={month}>{parseInt(month)}月</option>))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">体重（kg）</label>
                    <input type="number" step="0.1" min="20" max="300" value={weightFormData.value} onChange={(e) => setWeightFormData((prev) => ({ ...prev, value: e.target.value }))} placeholder="例: 65.0" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">メモ（任意）</label>
                  <textarea value={weightFormData.memo} onChange={(e) => setWeightFormData((prev) => ({ ...prev, memo: e.target.value }))} placeholder="メモを入力..." rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" />
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={weightFormData.is_public} onChange={(e) => setWeightFormData((prev) => ({ ...prev, is_public: e.target.checked }))} className="w-4 h-4 text-blue-500 rounded focus:ring-blue-500" />
                  <span className="text-sm text-gray-700">この記録を公開する</span>
                </label>
                {weightError && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{weightError}</div>}
                <div className="flex gap-3">
                  <button type="button" onClick={handleWeightSubmit} disabled={weightSaving} className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 transition-colors">
                    {weightSaving && <Loader2 size={16} className="animate-spin" />}
                    <span>{weightEditingId ? '更新する' : '記録する'}</span>
                  </button>
                  <button type="button" onClick={resetWeightForm} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors">キャンセル</button>
                </div>
              </div>
            )}

            {/* History Table */}
            {weightRecords.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">記録履歴</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-4 py-2 text-left font-medium text-gray-600">測定日</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-600">体重</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-600">メモ</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-600">公開</th>
                        <th className="px-4 py-2 text-right font-medium text-gray-600">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {weightRecords.map((record) => (
                        <tr key={record.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-gray-900">{formatHba1cMonth(record.recorded_at)}</td>
                          <td className="px-4 py-3"><span className="font-medium text-blue-600">{record.value}kg</span></td>
                          <td className="px-4 py-3 text-gray-600 max-w-[200px] truncate">{record.memo || '-'}</td>
                          <td className="px-4 py-3">{record.is_public ? <span className="text-blue-500">公開</span> : <span className="text-gray-400">非公開</span>}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-2">
                              <button type="button" onClick={() => handleWeightEdit(record)} className="p-1 text-gray-400 hover:text-blue-500"><Edit2 size={16} /></button>
                              <button type="button" onClick={() => handleWeightDelete(record.id)} className="p-1 text-gray-400 hover:text-red-600"><Trash2 size={16} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {weightRecords.length === 0 && !showWeightForm && (
              <div className="text-center py-8 text-gray-500">
                <p>まだ記録がありません</p>
                <p className="text-sm mt-1">「新しい記録を追加」ボタンから記録を始めましょう</p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* M&A Phase 2: 通院情報 */}
      <section>
        <div className="flex items-center gap-2 mb-4 pb-2 border-b">
          <Stethoscope size={20} className="text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-900">通院情報</h3>
        </div>

        <div className="space-y-6">
          {/* 通院頻度 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">通院頻度</label>
              <PrivacyToggle value={visitFrequencyPublic} onChange={setVisitFrequencyPublic} />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {VISIT_FREQUENCIES.map((freq) => (
                <label
                  key={freq}
                  className={`flex items-center justify-center px-3 py-2 border rounded-lg cursor-pointer transition-colors ${
                    visitFrequency === freq
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'bg-white border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="visitFrequency"
                    value={freq}
                    checked={visitFrequency === freq}
                    onChange={() => setVisitFrequency(freq)}
                    className="sr-only"
                  />
                  <span className="text-sm">{VISIT_FREQUENCY_LABELS[freq]}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 診療科 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">主な診療科</label>
              <PrivacyToggle value={medicalDepartmentPublic} onChange={setMedicalDepartmentPublic} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {MEDICAL_DEPARTMENTS.map((dept) => (
                <label
                  key={dept}
                  className={`flex items-center justify-center px-3 py-2 border rounded-lg cursor-pointer transition-colors ${
                    medicalDepartment === dept
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'bg-white border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="medicalDepartment"
                    value={dept}
                    checked={medicalDepartment === dept}
                    onChange={() => setMedicalDepartment(dept)}
                    className="sr-only"
                  />
                  <span className="text-sm">{MEDICAL_DEPARTMENT_LABELS[dept]}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 合併症 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">合併症（複数選択可）</label>
              <PrivacyToggle value={complicationsPublic} onChange={setComplicationsPublic} />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {COMPLICATION_TYPES.map((comp) => (
                <label
                  key={comp}
                  className={`flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer transition-colors ${
                    complications.includes(comp)
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'bg-white border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={complications.includes(comp)}
                    onChange={() => handleComplicationChange(comp)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">{COMPLICATION_LABELS[comp]}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* M&A Phase 2: 生活習慣 */}
      <section>
        <div className="flex items-center gap-2 mb-4 pb-2 border-b">
          <Heart size={20} className="text-green-500" />
          <h3 className="text-lg font-semibold text-gray-900">生活習慣</h3>
          <PrivacyToggle value={lifestylePublic} onChange={setLifestylePublic} />
        </div>

        <div className="space-y-6">
          {/* 食事管理 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">食事管理（複数選択可）</label>
            <div className="grid grid-cols-2 gap-2">
              {DIET_METHODS.map((method) => (
                <label
                  key={method}
                  className={`flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer transition-colors ${
                    dietMethod.includes(method)
                      ? 'bg-green-50 border-green-500 text-green-700'
                      : 'bg-white border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={dietMethod.includes(method)}
                    onChange={() => handleDietMethodChange(method)}
                    className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm">{DIET_METHOD_LABELS[method]}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 運動頻度 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">運動頻度</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {EXERCISE_FREQUENCIES.map((freq) => (
                <label
                  key={freq}
                  className={`flex items-center justify-center px-3 py-2 border rounded-lg cursor-pointer transition-colors ${
                    exerciseFrequency === freq
                      ? 'bg-green-50 border-green-500 text-green-700'
                      : 'bg-white border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="exerciseFrequency"
                    value={freq}
                    checked={exerciseFrequency === freq}
                    onChange={() => setExerciseFrequency(freq)}
                    className="sr-only"
                  />
                  <span className="text-sm">{EXERCISE_FREQUENCY_LABELS[freq]}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 運動種類（運動している場合のみ表示） */}
          {exerciseFrequency && exerciseFrequency !== 'none' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">運動の種類（複数選択可）</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {EXERCISE_TYPE_LIST.map((type) => (
                  <label
                    key={type}
                    className={`flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer transition-colors ${
                      exerciseTypes.includes(type)
                        ? 'bg-green-50 border-green-500 text-green-700'
                        : 'bg-white border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={exerciseTypes.includes(type)}
                      onChange={() => handleExerciseTypeChange(type)}
                      className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-sm">{EXERCISE_TYPE_LABELS[type]}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* 喫煙 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">喫煙</label>
            <div className="flex gap-2">
              {SMOKING_STATUSES.map((status) => (
                <label
                  key={status}
                  className={`flex-1 flex items-center justify-center px-3 py-2 border rounded-lg cursor-pointer transition-colors ${
                    smokingStatus === status
                      ? 'bg-green-50 border-green-500 text-green-700'
                      : 'bg-white border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="smokingStatus"
                    value={status}
                    checked={smokingStatus === status}
                    onChange={() => setSmokingStatus(status)}
                    className="sr-only"
                  />
                  <span className="text-sm">{SMOKING_STATUS_LABELS[status]}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 飲酒 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">飲酒</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {DRINKING_STATUSES.map((status) => (
                <label
                  key={status}
                  className={`flex items-center justify-center px-3 py-2 border rounded-lg cursor-pointer transition-colors ${
                    drinkingStatus === status
                      ? 'bg-green-50 border-green-500 text-green-700'
                      : 'bg-white border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="drinkingStatus"
                    value={status}
                    checked={drinkingStatus === status}
                    onChange={() => setDrinkingStatus(status)}
                    className="sr-only"
                  />
                  <span className="text-sm">{DRINKING_STATUS_LABELS[status]}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* M&A Phase 2: データ利用同意 */}
      <section>
        <div className="flex items-center gap-2 mb-4 pb-2 border-b">
          <Shield size={20} className="text-purple-500" />
          <h3 className="text-lg font-semibold text-gray-900">データ利用設定</h3>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          あなたのデータを匿名化した上で、以下の目的に活用することに同意いただけますか？
          同意いただくことで、糖尿病治療の発展に貢献できます。
        </p>

        {consentLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 size={24} className="animate-spin text-purple-500" />
          </div>
        ) : (
          <div className="space-y-4">
            {CONSENT_TYPES.map((type) => {
              const consented = getConsentValue(type)
              const consentedAt = getConsentDate(type)
              return (
                <div
                  key={type}
                  className={`p-4 border rounded-lg transition-colors ${
                    consented ? 'bg-purple-50 border-purple-200' : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{CONSENT_LABELS[type].title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{CONSENT_LABELS[type].description}</p>
                      {consented && consentedAt && (
                        <p className="text-xs text-purple-600 mt-2">
                          {new Date(consentedAt).toLocaleDateString('ja-JP', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}に同意
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleConsentChange(type, !consented)}
                      disabled={consentSaving}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                        consented ? 'bg-purple-600' : 'bg-gray-200'
                      } ${consentSaving ? 'opacity-50' : ''}`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          consented ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
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
            label="トピックへのコメント"
            description="自分のトピックに新しいコメントが付いたときに通知"
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
            description="トピックや日記にいいねされたときに通知"
            value={notifyLikes}
            onChange={setNotifyLikes}
          />
          <PrivacySettingRow
            label="プロフィールコメント"
            description="プロフィールに応援コメントが付いたときに通知"
            value={notifyProfileComment}
            onChange={setNotifyProfileComment}
          />
          <PrivacySettingRow
            label="HbA1cリマインド"
            description="最後の記録から30日経過した際にメールでお知らせ"
            value={notifyHba1cReminder}
            onChange={setNotifyHba1cReminder}
          />
          <PrivacySettingRow
            label="体重リマインド"
            description="最後の記録から30日経過した際にメールでお知らせ"
            value={notifyWeightReminder}
            onChange={setNotifyWeightReminder}
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
              medications: medications,
              medications_public: medicationsPublic,
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
          退会すると、投稿したトピック・コメント・HbA1c記録などすべてのデータが削除されます。この操作は取り消せません。
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
                <li>• 投稿したトピック・コメント</li>
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
      <div className="relative flex-shrink-0">
        <input
          type="checkbox"
          checked={value}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
        <div
          className={`w-11 h-6 rounded-full transition-colors flex items-center ${
            value ? 'bg-rose-500' : 'bg-gray-300'
          }`}
        >
          <div
            className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
              value ? 'translate-x-[22px]' : 'translate-x-0.5'
            }`}
          />
        </div>
      </div>
    </label>
  )
}
