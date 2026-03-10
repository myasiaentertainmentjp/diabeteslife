'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase'
import { uploadImage } from '@/lib/imageUpload'
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ReferenceLine,
} from 'recharts'
import {
  Loader2, User, Save, LogOut, Download, AlertTriangle,
  Activity, Scale, Plus, Trash2, Edit3, Eye, EyeOff,
  Bell, Link as LinkIcon, CheckCircle, Camera, ChevronRight,
} from 'lucide-react'
import {
  DiabetesType, TreatmentType, AgeGroup, Gender, DeviceType,
  DIABETES_TYPE_LABELS, TREATMENT_TYPE_LABELS, AGE_GROUP_LABELS,
  GENDER_LABELS, DEVICE_TYPE_LABELS, PREFECTURES,
} from '@/types/database'

// ─── Types ───────────────────────────────────────────────────────────────────

interface ProfileState {
  display_name: string
  bio: string
  bio_public: boolean
  age_group: AgeGroup | null
  age_group_public: boolean
  gender: Gender | null
  gender_public: boolean
  prefecture: string | null
  prefecture_public: boolean
  diabetes_type: DiabetesType
  diagnosis_year: number | null
  treatment_methods: TreatmentType[]
  treatment_public: boolean
  device: DeviceType | null
  device_public: boolean
  hba1c_public: boolean
  x_id: string
  instagram_id: string
  youtube_id: string
  tiktok_id: string
  custom_link_title: string
  custom_link_url: string
  links_public: boolean
}

interface HbA1cRecord {
  id: string
  recorded_at: string
  value: number
  memo: string | null
  is_public: boolean
}

interface WeightRecord {
  id: string
  recorded_at: string
  value: number
  memo: string | null
  is_public: boolean
}

interface NotifSettings {
  thread_comment: boolean
  reply: boolean
  likes: boolean
  profile_comment: boolean
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function calcCompleteness(p: ProfileState, hba1c: HbA1cRecord[], weight: WeightRecord[]): number {
  const fields = [
    p.display_name, p.bio, p.diabetes_type, p.diagnosis_year,
    p.treatment_methods.length > 0, p.age_group, p.gender,
    p.prefecture, p.device,
    hba1c.length > 0, weight.length > 0,
  ]
  const filled = fields.filter(Boolean).length
  return Math.round((filled / fields.length) * 100)
}

function completenessMsg(pct: number): string {
  if (pct === 100) return '🎉 プロフィールが完成しています！'
  if (pct >= 80) return '👍 もう少しで完成！残りの項目を入力してみましょう'
  if (pct >= 50) return '📝 プロフィールを充実させると仲間を見つけやすくなります'
  return '✍️ プロフィールを入力してコミュニティに参加しましょう'
}

function TogglePublic({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full border transition-colors ${
        value ? 'border-green-400 text-green-600 bg-green-50' : 'border-gray-300 text-gray-400 bg-gray-50'
      }`}
    >
      {value ? <Eye size={12} /> : <EyeOff size={12} />}
      {value ? '公開' : '非公開'}
    </button>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200 flex items-center gap-2">
      {children}
    </h2>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MyPage() {
  const { user, profile: authProfile, signOut, loading: authLoading, refreshProfile } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const [pageLoading, setPageLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [showExportModal, setShowExportModal] = useState(false)
  const [exporting, setExporting] = useState(false)

  // Avatar
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const avatarRef = useRef<HTMLInputElement>(null)

  // Profile
  const [prof, setProf] = useState<ProfileState>({
    display_name: '', bio: '', bio_public: true,
    age_group: null, age_group_public: false,
    gender: null, gender_public: false,
    prefecture: null, prefecture_public: false,
    diabetes_type: null, diagnosis_year: null,
    treatment_methods: [], treatment_public: true,
    device: null, device_public: true,
    hba1c_public: false,
    x_id: '', instagram_id: '', youtube_id: '', tiktok_id: '',
    custom_link_title: '', custom_link_url: '', links_public: true,
  })

  // HbA1c
  const [hba1cRecords, setHba1cRecords] = useState<HbA1cRecord[]>([])
  const [hba1cForm, setHba1cForm] = useState({ recorded_at: '', value: '', memo: '', is_public: true })
  const [hba1cAdding, setHba1cAdding] = useState(false)
  const [hba1cEditId, setHba1cEditId] = useState<string | null>(null)
  const [showHba1cForm, setShowHba1cForm] = useState(false)

  // Weight
  const [weightRecords, setWeightRecords] = useState<WeightRecord[]>([])
  const [weightForm, setWeightForm] = useState({ recorded_at: '', value: '', memo: '', is_public: true })
  const [weightAdding, setWeightAdding] = useState(false)
  const [weightEditId, setWeightEditId] = useState<string | null>(null)
  const [showWeightForm, setShowWeightForm] = useState(false)

  // Notifications
  const [notif, setNotif] = useState<NotifSettings>({
    thread_comment: true, reply: true, likes: false, profile_comment: true,
  })

  // ─── Load data ─────────────────────────────────────────────────────────────

  const loadData = useCallback(async () => {
    if (!user) return
    setPageLoading(true)

    const [userRes, extRes, hba1cRes, weightRes, notifRes] = await Promise.all([
      supabase.from('users').select('display_name, avatar_url').eq('id', user.id).single(),
      supabase.from('extended_user_profiles').select('*').eq('user_id', user.id).single(),
      supabase.from('hba1c_records').select('*').eq('user_id', user.id).order('recorded_at', { ascending: false }),
      supabase.from('weight_records').select('*').eq('user_id', user.id).order('recorded_at', { ascending: false }),
      supabase.from('notification_settings').select('*').eq('user_id', user.id).single(),
    ])

    const u = userRes.data
    const e = extRes.data
    const links = e?.external_links || []
    const customLink = links.find((l: { title: string; url: string }) => !['X', 'Instagram', 'YouTube', 'TikTok'].includes(l.title))

    setAvatarUrl(u?.avatar_url || null)
    setProf({
      display_name: u?.display_name || '',
      bio: e?.bio || '',
      bio_public: e?.bio_public ?? true,
      age_group: e?.age_group || null,
      age_group_public: e?.age_group_public ?? false,
      gender: e?.gender || null,
      gender_public: e?.gender_public ?? false,
      prefecture: e?.prefecture || null,
      prefecture_public: e?.prefecture_public ?? false,
      diabetes_type: e?.diabetes_type || null,
      diagnosis_year: e?.diagnosis_year || null,
      treatment_methods: e?.treatment_methods || [],
      treatment_public: e?.treatment_public ?? true,
      device: e?.device || null,
      device_public: e?.device_public ?? true,
      hba1c_public: e?.hba1c_public ?? false,
      x_id: links.find((l: { title: string }) => l.title === 'X')?.url?.replace('https://x.com/', '') || '',
      instagram_id: links.find((l: { title: string }) => l.title === 'Instagram')?.url?.replace('https://instagram.com/', '') || '',
      youtube_id: links.find((l: { title: string }) => l.title === 'YouTube')?.url?.replace('https://youtube.com/@', '') || '',
      tiktok_id: links.find((l: { title: string }) => l.title === 'TikTok')?.url?.replace('https://tiktok.com/@', '') || '',
      custom_link_title: customLink?.title || '',
      custom_link_url: customLink?.url || '',
      links_public: e?.links_public ?? true,
    })

    setHba1cRecords(hba1cRes.data || [])
    setWeightRecords(weightRes.data || [])

    if (notifRes.data) {
      setNotif({
        thread_comment: notifRes.data.thread_comment ?? true,
        reply: notifRes.data.reply ?? true,
        likes: notifRes.data.likes ?? false,
        profile_comment: notifRes.data.profile_comment ?? true,
      })
    }

    setPageLoading(false)
  }, [user, supabase])

  useEffect(() => {
    if (!authLoading && !user) router.push('/login?redirect=/mypage')
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) loadData()
  }, [user, loadData])

  // ─── Avatar upload ──────────────────────────────────────────────────────────

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !user) return
    setAvatarUploading(true)
    try {
      const url = await uploadImage(file, 'content')
      if (url) {
        await supabase.from('users').update({ avatar_url: url }).eq('id', user.id)
        setAvatarUrl(url)
        await refreshProfile()
      }
    } catch {
      console.error(err)
    }
    setAvatarUploading(false)
  }

  // ─── Save all ──────────────────────────────────────────────────────────────

  async function handleSaveAll(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setSaving(true)
    setSaveError('')
    setSaveSuccess(false)

    try {
      // Build external_links
      const external_links: { title: string; url: string }[] = []
      if (prof.x_id) external_links.push({ title: 'X', url: `https://x.com/${prof.x_id}` })
      if (prof.instagram_id) external_links.push({ title: 'Instagram', url: `https://instagram.com/${prof.instagram_id}` })
      if (prof.youtube_id) external_links.push({ title: 'YouTube', url: `https://youtube.com/@${prof.youtube_id}` })
      if (prof.tiktok_id) external_links.push({ title: 'TikTok', url: `https://tiktok.com/@${prof.tiktok_id}` })
      if (prof.custom_link_title && prof.custom_link_url) external_links.push({ title: prof.custom_link_title, url: prof.custom_link_url })

      // Update users table
      await supabase.from('users').update({ display_name: prof.display_name }).eq('id', user.id)

      // Upsert extended profile
      const extData = {
        user_id: user.id,
        bio: prof.bio || null,
        bio_public: prof.bio_public,
        age_group: prof.age_group,
        age_group_public: prof.age_group_public,
        gender: prof.gender,
        gender_public: prof.gender_public,
        prefecture: prof.prefecture,
        prefecture_public: prof.prefecture_public,
        diabetes_type: prof.diabetes_type,
        diagnosis_year: prof.diagnosis_year,
        treatment_methods: prof.treatment_methods.length > 0 ? prof.treatment_methods : null,
        treatment_public: prof.treatment_public,
        device: prof.device,
        device_public: prof.device_public,
        hba1c_public: prof.hba1c_public,
        external_links,
        links_public: prof.links_public,
      }
      await supabase.from('extended_user_profiles').upsert(extData as never)

      // Upsert notification settings
      await supabase.from('notification_settings').upsert({
        user_id: user.id,
        ...notif,
      } as never)

      await refreshProfile()
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch {
      setSaveError('保存に失敗しました。再度お試しください。')
    } finally {
      setSaving(false)
    }
  }

  // ─── HbA1c CRUD ────────────────────────────────────────────────────────────

  async function handleHba1cSave() {
    if (!user || !hba1cForm.recorded_at || !hba1cForm.value) return
    setHba1cAdding(true)
    const payload = {
      user_id: user.id,
      recorded_at: hba1cForm.recorded_at + '-01',
      value: parseFloat(hba1cForm.value),
      memo: hba1cForm.memo || null,
      is_public: hba1cForm.is_public,
    }
    if (hba1cEditId) {
      await supabase.from('hba1c_records').update(payload as never).eq('id', hba1cEditId)
    } else {
      await supabase.from('hba1c_records').insert(payload as never)
    }
    setHba1cForm({ recorded_at: '', value: '', memo: '', is_public: true })
    setHba1cEditId(null)
    setShowHba1cForm(false)
    const { data } = await supabase.from('hba1c_records').select('*').eq('user_id', user.id).order('recorded_at', { ascending: false })
    setHba1cRecords(data || [])
    setHba1cAdding(false)
  }

  async function handleHba1cDelete(id: string) {
    if (!confirm('削除しますか？')) return
    await supabase.from('hba1c_records').delete().eq('id', id)
    setHba1cRecords(prev => prev.filter(r => r.id !== id))
  }

  function handleHba1cEdit(r: HbA1cRecord) {
    setHba1cEditId(r.id)
    setHba1cForm({
      recorded_at: r.recorded_at.substring(0, 7),
      value: String(r.value),
      memo: r.memo || '',
      is_public: r.is_public,
    })
    setShowHba1cForm(true)
  }

  // ─── Weight CRUD ────────────────────────────────────────────────────────────

  async function handleWeightSave() {
    if (!user || !weightForm.recorded_at || !weightForm.value) return
    setWeightAdding(true)
    const payload = {
      user_id: user.id,
      recorded_at: weightForm.recorded_at + '-01',
      value: parseFloat(weightForm.value),
      memo: weightForm.memo || null,
      is_public: weightForm.is_public,
    }
    if (weightEditId) {
      await supabase.from('weight_records').update(payload as never).eq('id', weightEditId)
    } else {
      await supabase.from('weight_records').insert(payload as never)
    }
    setWeightForm({ recorded_at: '', value: '', memo: '', is_public: true })
    setWeightEditId(null)
    setShowWeightForm(false)
    const { data } = await supabase.from('weight_records').select('*').eq('user_id', user.id).order('recorded_at', { ascending: false })
    setWeightRecords(data || [])
    setWeightAdding(false)
  }

  async function handleWeightDelete(id: string) {
    if (!confirm('削除しますか？')) return
    await supabase.from('weight_records').delete().eq('id', id)
    setWeightRecords(prev => prev.filter(r => r.id !== id))
  }

  function handleWeightEdit(r: WeightRecord) {
    setWeightEditId(r.id)
    setWeightForm({
      recorded_at: r.recorded_at.substring(0, 7),
      value: String(r.value),
      memo: r.memo || '',
      is_public: r.is_public,
    })
    setShowWeightForm(true)
  }

  // ─── Data Export ────────────────────────────────────────────────────────────

  async function handleDataExport() {
    if (!user) return
    setExporting(true)
    try {
      const { data: userData } = await supabase.from('users').select('*').eq('id', user.id).single()
      const exportData = { exported_at: new Date().toISOString(), user: userData, hba1c_records: hba1cRecords, weight_records: weightRecords }
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a'); a.href = url
      a.download = `dlife-data-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a); a.click(); document.body.removeChild(a)
      URL.revokeObjectURL(url)
      setShowExportModal(false)
    } catch {
      console.error(err)
    }
    setExporting(false)
  }

  // ─── Chart data ─────────────────────────────────────────────────────────────

  function buildChartData(records: { recorded_at: string; value: number }[]) {
    return [...records]
      .sort((a, b) => a.recorded_at.localeCompare(b.recorded_at))
      .slice(-12)
      .map(r => ({
        month: r.recorded_at.substring(0, 7).replace('-', '/'),
        value: r.value,
      }))
  }

  function hba1cFeedback(records: HbA1cRecord[]): string {
    if (records.length < 2) return ''
    const latest = records[0].value
    const prev = records[1].value
    if (latest < prev) return `📈 前回より ${(prev - latest).toFixed(1)}% 改善しました！`
    if (latest > prev) return `📉 前回より ${(latest - prev).toFixed(1)}% 上昇しています。`
    return '➡️ 前回と同じ値です。'
  }

  // ─── Guards ─────────────────────────────────────────────────────────────────

  if (authLoading || pageLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="animate-spin text-rose-500" />
      </div>
    )
  }

  if (!user) return null

  const completeness = calcCompleteness(prof, hba1cRecords, weightRecords)
  const currentYear = new Date().getFullYear()
  const yearOptions = Array.from({ length: 80 }, (_, i) => currentYear - i)

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-32">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">マイページ</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowExportModal(true)} className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <Download size={16} /><span className="hidden sm:inline">エクスポート</span>
          </button>
          <button onClick={async () => { await signOut(); router.push('/') }} className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors">
            <LogOut size={16} /><span className="hidden sm:inline">ログアウト</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSaveAll} className="space-y-6">

        {/* ① 充実度バー */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">プロフィール充実度</span>
            <span className="text-sm font-bold text-rose-500">{completeness}%</span>
          </div>
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden mb-3">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${completeness}%`, background: 'linear-gradient(to right, #fb7185, #fb923c)' }}
            />
          </div>
          <p className="text-sm text-gray-600">{completenessMsg(completeness)}</p>
        </div>

        {/* ② 基本情報 */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <SectionTitle><User size={18} className="text-rose-500" />基本情報</SectionTitle>

          {/* Avatar */}
          <div className="flex items-center gap-4 mb-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-rose-100 overflow-hidden flex items-center justify-center border-2 border-rose-200">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="アバター" className="w-full h-full object-cover" />
                ) : (
                  <User size={36} className="text-rose-400" />
                )}
              </div>
              <button
                type="button"
                onClick={() => avatarRef.current?.click()}
                disabled={avatarUploading}
                className="absolute -bottom-1 -right-1 w-7 h-7 bg-rose-500 text-white rounded-full flex items-center justify-center shadow hover:bg-rose-600 transition-colors"
              >
                {avatarUploading ? <Loader2 size={12} className="animate-spin" /> : <Camera size={12} />}
              </button>
              <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">{authProfile?.display_name || 'ユーザー'}</p>
              <p className="text-xs text-gray-400">{user.email}</p>
            </div>
          </div>

          {/* Display name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">表示名</label>
            <input
              type="text"
              value={prof.display_name}
              onChange={e => setProf(p => ({ ...p, display_name: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
              placeholder="ニックネーム"
            />
          </div>

          {/* Bio */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-gray-700">自己紹介</label>
              <TogglePublic value={prof.bio_public} onChange={v => setProf(p => ({ ...p, bio_public: v }))} />
            </div>
            <textarea
              value={prof.bio}
              onChange={e => setProf(p => ({ ...p, bio: e.target.value.slice(0, 200) }))}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none resize-none"
              placeholder="自己紹介を入力... (200文字以内)"
            />
            <p className="text-xs text-right text-gray-400 mt-1">{prof.bio.length}/200</p>
          </div>
        </div>

        {/* ③ 個人情報 */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <SectionTitle>👤 個人情報</SectionTitle>
          <div className="space-y-4">
            {/* 年代 */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium text-gray-700">年代</label>
                <TogglePublic value={prof.age_group_public} onChange={v => setProf(p => ({ ...p, age_group_public: v }))} />
              </div>
              <select value={prof.age_group || ''} onChange={e => setProf(p => ({ ...p, age_group: e.target.value as AgeGroup || null }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none bg-white">
                <option value="">選択してください</option>
                {Object.entries(AGE_GROUP_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            {/* 性別 */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium text-gray-700">性別</label>
                <TogglePublic value={prof.gender_public} onChange={v => setProf(p => ({ ...p, gender_public: v }))} />
              </div>
              <select value={prof.gender || ''} onChange={e => setProf(p => ({ ...p, gender: e.target.value as Gender || null }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none bg-white">
                <option value="">選択してください</option>
                {Object.entries(GENDER_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            {/* 都道府県 */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium text-gray-700">都道府県</label>
                <TogglePublic value={prof.prefecture_public} onChange={v => setProf(p => ({ ...p, prefecture_public: v }))} />
              </div>
              <select value={prof.prefecture || ''} onChange={e => setProf(p => ({ ...p, prefecture: e.target.value || null }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none bg-white">
                <option value="">選択してください</option>
                {PREFECTURES.map(pref => <option key={pref} value={pref}>{pref}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* ④ 糖尿病情報 */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <SectionTitle>🩺 糖尿病に関する情報</SectionTitle>
          <div className="space-y-4">
            {/* タイプ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">糖尿病のタイプ</label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {Object.entries(DIABETES_TYPE_LABELS).map(([k, v]) => (
                  <label key={k} className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors text-sm ${
                    prof.diabetes_type === k ? 'border-rose-500 bg-rose-50 text-rose-700' : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input type="radio" name="diabetes_type" value={k}
                      checked={prof.diabetes_type === k}
                      onChange={() => setProf(p => ({ ...p, diabetes_type: k as DiabetesType }))}
                      className="sr-only" />
                    {v}
                  </label>
                ))}
              </div>
            </div>

            {/* 診断年 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">診断年（発症年）</label>
              <div className="flex items-center gap-3">
                <select value={prof.diagnosis_year || ''} onChange={e => setProf(p => ({ ...p, diagnosis_year: e.target.value ? parseInt(e.target.value) : null }))}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none bg-white">
                  <option value="">選択してください</option>
                  {yearOptions.map(y => <option key={y} value={y}>{y}年</option>)}
                </select>
                {prof.diagnosis_year && (
                  <span className="text-sm text-rose-600 font-medium whitespace-nowrap">
                    糖尿病歴：約{currentYear - prof.diagnosis_year}年
                  </span>
                )}
              </div>
            </div>

            {/* 治療方法 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">治療方法（複数選択可）</label>
                <TogglePublic value={prof.treatment_public} onChange={v => setProf(p => ({ ...p, treatment_public: v }))} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(TREATMENT_TYPE_LABELS).map(([k, v]) => (
                  <label key={k} className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors text-sm ${
                    prof.treatment_methods.includes(k as TreatmentType) ? 'border-rose-500 bg-rose-50 text-rose-700' : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input type="checkbox"
                      checked={prof.treatment_methods.includes(k as TreatmentType)}
                      onChange={() => setProf(p => ({
                        ...p,
                        treatment_methods: p.treatment_methods.includes(k as TreatmentType)
                          ? p.treatment_methods.filter(t => t !== k)
                          : [...p.treatment_methods, k as TreatmentType],
                      }))}
                      className="sr-only" />
                    {v}
                  </label>
                ))}
              </div>
            </div>

            {/* デバイス */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium text-gray-700">使用デバイス</label>
                <TogglePublic value={prof.device_public} onChange={v => setProf(p => ({ ...p, device_public: v }))} />
              </div>
              <select value={prof.device || ''} onChange={e => setProf(p => ({ ...p, device: e.target.value as DeviceType || null }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none bg-white">
                <option value="">選択してください</option>
                {Object.entries(DEVICE_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* ⑤ 外部リンク */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <LinkIcon size={18} className="text-rose-500" />外部リンク
            </h2>
            <TogglePublic value={prof.links_public} onChange={v => setProf(p => ({ ...p, links_public: v }))} />
          </div>
          <div className="space-y-3">
            {[
              { key: 'x_id', label: 'X（Twitter）', prefix: '@', placeholder: 'username' },
              { key: 'instagram_id', label: 'Instagram', prefix: '@', placeholder: 'username' },
              { key: 'youtube_id', label: 'YouTube', prefix: '@', placeholder: 'channel_id' },
              { key: 'tiktok_id', label: 'TikTok', prefix: '@', placeholder: 'username' },
            ].map(({ key, label, prefix, placeholder }) => (
              <div key={key} className="flex items-center gap-2">
                <span className="text-sm text-gray-500 w-28 shrink-0">{label}</span>
                <div className="flex flex-1 items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-rose-500">
                  <span className="px-3 py-3 bg-gray-50 text-gray-400 text-sm border-r border-gray-300">{prefix}</span>
                  <input
                    type="text"
                    value={(prof as unknown as Record<string, string>)[key] || ''}
                    onChange={e => setProf(p => ({ ...p, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="flex-1 px-3 py-3 outline-none text-sm"
                  />
                </div>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 w-28 shrink-0">カスタム</span>
              <div className="flex flex-1 gap-2">
                <input type="text" value={prof.custom_link_title}
                  onChange={e => setProf(p => ({ ...p, custom_link_title: e.target.value }))}
                  placeholder="タイトル"
                  className="w-1/3 px-3 py-3 border border-gray-300 rounded-lg outline-none text-sm focus:ring-2 focus:ring-rose-500" />
                <input type="url" value={prof.custom_link_url}
                  onChange={e => setProf(p => ({ ...p, custom_link_url: e.target.value }))}
                  placeholder="https://..."
                  className="flex-1 px-3 py-3 border border-gray-300 rounded-lg outline-none text-sm focus:ring-2 focus:ring-rose-500" />
              </div>
            </div>
          </div>
        </div>

        {/* ⑥ HbA1c記録 */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Activity size={18} className="text-rose-500" />HbA1c記録
            </h2>
            <TogglePublic value={prof.hba1c_public} onChange={v => setProf(p => ({ ...p, hba1c_public: v }))} />
          </div>

          {/* Graph */}
          {hba1cRecords.length > 0 && (
            <>
              {hba1cFeedback(hba1cRecords) && (
                <p className="text-sm text-gray-600 mb-3 bg-rose-50 px-3 py-2 rounded-lg">{hba1cFeedback(hba1cRecords)}</p>
              )}
              <div className="h-48 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={buildChartData(hba1cRecords)} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis domain={[4, 12]} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v: number) => [`${v}%`, 'HbA1c']} />
                    <ReferenceLine y={7} stroke="#22c55e" strokeDasharray="4 4" label={{ value: '目標7%', position: 'right', fontSize: 10, fill: '#22c55e' }} />
                    <Line type="monotone" dataKey="value" stroke="#f43f5e" strokeWidth={2} dot={{ r: 4, fill: '#f43f5e' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </>
          )}

          {/* Add button */}
          <button type="button" onClick={() => { setShowHba1cForm(!showHba1cForm); setHba1cEditId(null); setHba1cForm({ recorded_at: '', value: '', memo: '', is_public: true }) }}
            className="flex items-center gap-2 text-sm text-rose-500 hover:text-rose-600 mb-4">
            <Plus size={16} />新しい記録を追加
          </button>

          {/* Form */}
          {showHba1cForm && (
            <div className="bg-rose-50 rounded-lg p-4 mb-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">測定月</label>
                  <input type="month" value={hba1cForm.recorded_at}
                    onChange={e => setHba1cForm(f => ({ ...f, recorded_at: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none text-sm focus:ring-2 focus:ring-rose-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">HbA1c値（%）</label>
                  <input type="number" step="0.1" min="4" max="15" value={hba1cForm.value}
                    onChange={e => setHba1cForm(f => ({ ...f, value: e.target.value }))}
                    placeholder="6.5"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none text-sm focus:ring-2 focus:ring-rose-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">メモ</label>
                <input type="text" value={hba1cForm.memo}
                  onChange={e => setHba1cForm(f => ({ ...f, memo: e.target.value }))}
                  placeholder="気づいたことなど"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none text-sm focus:ring-2 focus:ring-rose-500" />
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input type="checkbox" checked={hba1cForm.is_public} onChange={e => setHba1cForm(f => ({ ...f, is_public: e.target.checked }))} className="rounded" />
                  公開
                </label>
                <button type="button" onClick={handleHba1cSave} disabled={hba1cAdding}
                  className="flex items-center gap-1 px-4 py-2 bg-rose-500 text-white text-sm rounded-lg hover:bg-rose-600 disabled:bg-gray-300">
                  {hba1cAdding ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  {hba1cEditId ? '更新' : '保存'}
                </button>
              </div>
            </div>
          )}

          {/* History table */}
          {hba1cRecords.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-left text-xs text-gray-500 border-b">
                  <th className="pb-2">月</th><th className="pb-2">値</th><th className="pb-2">メモ</th><th className="pb-2"></th>
                </tr></thead>
                <tbody>
                  {hba1cRecords.slice(0, 12).map(r => (
                    <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-2 text-gray-600">{r.recorded_at.substring(0, 7)}</td>
                      <td className="py-2 font-medium text-rose-600">{r.value}%</td>
                      <td className="py-2 text-gray-500 truncate max-w-[100px]">{r.memo}</td>
                      <td className="py-2">
                        <div className="flex gap-1">
                          <button type="button" onClick={() => handleHba1cEdit(r)} className="p-1 text-gray-400 hover:text-blue-500"><Edit3 size={14} /></button>
                          <button type="button" onClick={() => handleHba1cDelete(r.id)} className="p-1 text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ⑦ 体重記録 */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <SectionTitle><Scale size={18} className="text-blue-500" />体重記録</SectionTitle>

          {weightRecords.length > 0 && (
            <div className="h-48 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={buildChartData(weightRecords)} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => [`${v}kg`, '体重']} />
                  <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4, fill: '#3b82f6' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          <button type="button" onClick={() => { setShowWeightForm(!showWeightForm); setWeightEditId(null); setWeightForm({ recorded_at: '', value: '', memo: '', is_public: true }) }}
            className="flex items-center gap-2 text-sm text-blue-500 hover:text-blue-600 mb-4">
            <Plus size={16} />新しい記録を追加
          </button>

          {showWeightForm && (
            <div className="bg-blue-50 rounded-lg p-4 mb-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">記録月</label>
                  <input type="month" value={weightForm.recorded_at}
                    onChange={e => setWeightForm(f => ({ ...f, recorded_at: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none text-sm focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">体重（kg）</label>
                  <input type="number" step="0.1" min="20" max="300" value={weightForm.value}
                    onChange={e => setWeightForm(f => ({ ...f, value: e.target.value }))}
                    placeholder="65.0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none text-sm focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">メモ</label>
                <input type="text" value={weightForm.memo}
                  onChange={e => setWeightForm(f => ({ ...f, memo: e.target.value }))}
                  placeholder="気づいたことなど"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none text-sm focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input type="checkbox" checked={weightForm.is_public} onChange={e => setWeightForm(f => ({ ...f, is_public: e.target.checked }))} className="rounded" />
                  公開
                </label>
                <button type="button" onClick={handleWeightSave} disabled={weightAdding}
                  className="flex items-center gap-1 px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 disabled:bg-gray-300">
                  {weightAdding ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  {weightEditId ? '更新' : '保存'}
                </button>
              </div>
            </div>
          )}

          {weightRecords.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-left text-xs text-gray-500 border-b">
                  <th className="pb-2">月</th><th className="pb-2">体重</th><th className="pb-2">メモ</th><th className="pb-2"></th>
                </tr></thead>
                <tbody>
                  {weightRecords.slice(0, 12).map(r => (
                    <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-2 text-gray-600">{r.recorded_at.substring(0, 7)}</td>
                      <td className="py-2 font-medium text-blue-600">{r.value}kg</td>
                      <td className="py-2 text-gray-500 truncate max-w-[100px]">{r.memo}</td>
                      <td className="py-2">
                        <div className="flex gap-1">
                          <button type="button" onClick={() => handleWeightEdit(r)} className="p-1 text-gray-400 hover:text-blue-500"><Edit3 size={14} /></button>
                          <button type="button" onClick={() => handleWeightDelete(r.id)} className="p-1 text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ⑧ 通知設定 */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <SectionTitle><Bell size={18} className="text-rose-500" />通知設定</SectionTitle>
          <div className="space-y-3">
            {[
              { key: 'thread_comment', label: 'トピックへのコメント' },
              { key: 'reply', label: '返信通知' },
              { key: 'likes', label: 'いいね通知' },
              { key: 'profile_comment', label: 'プロフィールコメント' },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <span className="text-sm text-gray-700">{label}</span>
                <div className="relative">
                  <input type="checkbox" className="sr-only"
                    checked={(notif as unknown as Record<string, boolean>)[key]}
                    onChange={e => setNotif(n => ({ ...n, [key]: e.target.checked }))} />
                  <div className={`w-11 h-6 rounded-full transition-colors ${(notif as unknown as Record<string, boolean>)[key] ? 'bg-rose-500' : 'bg-gray-200'}`} />
                  <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${(notif as unknown as Record<string, boolean>)[key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* ⑨ 各種ページリンク */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <SectionTitle></SectionTitle>
          {[
            { href: '/mypage/posts', label: '投稿履歴', desc: 'トピック・コメント' },
            { href: '/mypage/bookmarks', label: 'ブックマーク', desc: '保存したトピック' },
            { href: '/mypage/blocked', label: 'ブロック管理', desc: 'ブロックしたユーザー' },
            { href: '/mypage/diary', label: '日記', desc: '日々の記録' },
          ].map(item => (
            <Link key={item.href} href={item.href} className="flex items-center justify-between px-4 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
              <div>
                <p className="text-sm font-medium text-gray-800">{item.label}</p>
                <p className="text-xs text-gray-400">{item.desc}</p>
              </div>
              <ChevronRight size={16} className="text-gray-400" />
            </Link>
          ))}
        </div>

        {/* ─── Feedback messages ─── */}
        {saveSuccess && (
          <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            <CheckCircle size={20} /><span className="text-sm">保存しました</span>
          </div>
        )}
        {saveError && (
          <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <AlertTriangle size={20} /><span className="text-sm">{saveError}</span>
          </div>
        )}
      </form>

      {/* ⑨ Fixed Save Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 z-40">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-rose-500 text-white font-semibold rounded-xl hover:bg-rose-600 disabled:bg-gray-300 transition-colors shadow-lg"
          >
            {saving ? <><Loader2 size={20} className="animate-spin" /><span>保存中...</span></> : <><Save size={20} /><span>すべて保存する</span></>}
          </button>
        </div>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold mb-4">データエクスポート</h3>
            <p className="text-sm text-gray-600 mb-4">プロフィール・HbA1c・体重記録をJSON形式でダウンロードします。</p>
            <div className="flex gap-3">
              <button onClick={() => setShowExportModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm">キャンセル</button>
              <button onClick={handleDataExport} disabled={exporting} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">
                {exporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}ダウンロード
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
