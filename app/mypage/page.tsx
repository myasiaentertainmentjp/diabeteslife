'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase'
import {
  Loader2, User, FileText, Bookmark, LogOut, Download, AlertTriangle,
  Activity, Scale, BookOpen, Save, Bell, UserX, Settings, ChevronRight
} from 'lucide-react'

export default function MyPage() {
  const { user, profile, signOut, loading: authLoading, refreshProfile } = useAuth()
  const router = useRouter()
  const [showExportModal, setShowExportModal] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)

  // Profile form state
  const [displayName, setDisplayName] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '')
    }
  }, [profile])

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return

    setSaving(true)
    setSaveSuccess(false)

    const { error } = await supabase
      .from('users')
      .update({ display_name: displayName })
      .eq('id', user.id)

    if (!error) {
      setSaveSuccess(true)
      await refreshProfile()
      setTimeout(() => setSaveSuccess(false), 3000)
    }

    setSaving(false)
  }

  async function handleSignOut() {
    await signOut()
    router.push('/')
  }

  async function handleDataExport() {
    if (!user) return

    setExporting(true)
    setExportError(null)

    try {
      const { data: userData } = await supabase
        .from('users')
        .select('id, email, display_name, created_at')
        .eq('id', user.id)
        .single()

      const { data: hba1cRecords } = await supabase
        .from('hba1c_records')
        .select('*')
        .eq('user_id', user.id)
        .order('recorded_at', { ascending: false })

      const { data: weightRecords } = await supabase
        .from('weight_records')
        .select('*')
        .eq('user_id', user.id)
        .order('recorded_at', { ascending: false })

      const { data: threads } = await supabase
        .from('threads')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      const exportData = {
        exported_at: new Date().toISOString(),
        user: userData,
        hba1c_records: hba1cRecords || [],
        weight_records: weightRecords || [],
        threads: threads || [],
      }

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `dlife-data-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setShowExportModal(false)
    } catch (error) {
      console.error('Export error:', error)
      setExportError('データのエクスポートに失敗しました')
    } finally {
      setExporting(false)
    }
  }

  // デバッグ: 常に何かを表示
  if (authLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow-sm p-6 text-center">
          <Loader2 size={32} className="animate-spin text-rose-500 mx-auto mb-4" />
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow-sm p-6 text-center">
          <p className="text-gray-600 mb-4">ログインが必要です</p>
          <Link href="/login?redirect=/mypage" className="text-rose-500 hover:underline">
            ログインページへ
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">マイページ</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm"
          >
            <Download size={18} />
            <span className="hidden sm:inline">データエクスポート</span>
          </button>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
          >
            <LogOut size={18} />
            <span className="hidden sm:inline">ログアウト</span>
          </button>
        </div>
      </div>

      {/* All in One Card */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {/* Profile Section */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center">
              <User size={32} className="text-rose-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{profile?.display_name || 'ユーザー'}</h2>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                表示名
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
                placeholder="ニックネーム"
              />
            </div>
            <div className="flex items-center gap-4">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 bg-rose-500 text-white rounded-lg font-medium hover:bg-rose-600 disabled:bg-gray-300 transition-colors"
              >
                {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                <span>{saving ? '保存中...' : '保存'}</span>
              </button>
              {saveSuccess && (
                <span className="text-green-600 text-sm">保存しました</span>
              )}
            </div>
          </form>
        </div>

        {/* Settings Link */}
        <div className="px-6 py-4 border-b border-gray-100">
          <Link
            href="/mypage/profile"
            className="flex items-center justify-between text-rose-500 hover:text-rose-600"
          >
            <span className="flex items-center gap-2">
              <Settings size={18} />
              詳細プロフィール設定
            </span>
            <ChevronRight size={18} />
          </Link>
        </div>

        {/* Menu Grid */}
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/mypage/hba1c"
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-colors text-center"
            >
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Activity size={24} className="text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">HbA1c記録</p>
                <p className="text-xs text-gray-500">グラフで管理</p>
              </div>
            </Link>

            <Link
              href="/mypage/weight"
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-colors text-center"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Scale size={24} className="text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">体重記録</p>
                <p className="text-xs text-gray-500">推移を確認</p>
              </div>
            </Link>

            <Link
              href="/mypage/diary"
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-colors text-center"
            >
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <BookOpen size={24} className="text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">日記</p>
                <p className="text-xs text-gray-500">日々の記録</p>
              </div>
            </Link>

            <Link
              href="/threads/new"
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-colors text-center"
            >
              <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center">
                <FileText size={24} className="text-rose-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">新規投稿</p>
                <p className="text-xs text-gray-500">トピック作成</p>
              </div>
            </Link>

            <Link
              href="/notifications"
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-colors text-center"
            >
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                <Bell size={24} className="text-amber-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">通知</p>
                <p className="text-xs text-gray-500">お知らせ一覧</p>
              </div>
            </Link>

            <Link
              href="/mypage/posts"
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-colors text-center"
            >
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                <FileText size={24} className="text-indigo-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">投稿履歴</p>
                <p className="text-xs text-gray-500">トピック・コメント</p>
              </div>
            </Link>

            <Link
              href="/mypage/bookmarks"
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-colors text-center"
            >
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Bookmark size={24} className="text-yellow-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">ブックマーク</p>
                <p className="text-xs text-gray-500">保存したトピック</p>
              </div>
            </Link>

            <Link
              href="/mypage/blocked"
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-colors text-center"
            >
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <UserX size={24} className="text-gray-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">ブロック</p>
                <p className="text-xs text-gray-500">ユーザー管理</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Data Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Download size={24} className="text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">データエクスポート</h3>
                <p className="text-sm text-gray-500">個人データをダウンロード</p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-700">
                以下のデータがJSON形式でダウンロードされます：
              </p>
              <ul className="text-sm text-blue-700 mt-2 space-y-1">
                <li>・ プロフィール情報</li>
                <li>・ HbA1c記録</li>
                <li>・ 体重記録</li>
                <li>・ 投稿したトピック</li>
              </ul>
            </div>

            {exportError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
                <AlertTriangle size={16} />
                {exportError}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowExportModal(false)
                  setExportError(null)
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={handleDataExport}
                disabled={exporting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {exporting ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Download size={18} />
                )}
                <span>{exporting ? 'エクスポート中...' : 'ダウンロード'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
