import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Loader2, User, FileText, UserX, Bookmark, LogOut, Download, AlertTriangle } from 'lucide-react'
import { ProfileSettings } from './mypage/ProfileSettings'
import { PostHistory } from './mypage/PostHistory'
import { BlockedUsers } from './mypage/BlockedUsers'
import { Bookmarks } from './mypage/Bookmarks'

type TabType = 'profile' | 'history' | 'bookmarks' | 'blocked'

const TABS: { id: TabType; label: string; icon: React.ReactNode }[] = [
  { id: 'profile', label: 'プロフィール設定', icon: <User size={18} /> },
  { id: 'history', label: '投稿履歴', icon: <FileText size={18} /> },
  { id: 'bookmarks', label: 'ブックマーク', icon: <Bookmark size={18} /> },
  { id: 'blocked', label: 'ブロック', icon: <UserX size={18} /> },
]

export function MyPage() {
  const { user, signOut, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [activeTab, setActiveTab] = useState<TabType>('profile')
  const [showExportModal, setShowExportModal] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  async function handleDataExport() {
    if (!user) return

    setExporting(true)
    setExportError(null)

    try {
      // Fetch user data
      const { data: userData } = await supabase
        .from('users')
        .select('id, email, display_name, avatar_url, created_at')
        .eq('id', user.id)
        .single()

      // Fetch profile data
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      // Fetch HbA1c records
      const { data: hba1cRecords } = await supabase
        .from('hba1c_records')
        .select('*')
        .eq('user_id', user.id)
        .order('recorded_at', { ascending: false })

      // Fetch weight records
      const { data: weightRecords } = await supabase
        .from('weight_records')
        .select('*')
        .eq('user_id', user.id)
        .order('recorded_at', { ascending: false })

      // Fetch threads
      const { data: threads } = await supabase
        .from('threads')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      // Fetch comments
      const { data: comments } = await supabase
        .from('thread_comments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      // Fetch consents
      const { data: consents } = await supabase
        .from('user_consents')
        .select('*')
        .eq('user_id', user.id)

      // Build export data
      const exportData = {
        exported_at: new Date().toISOString(),
        user: userData,
        profile: profileData,
        hba1c_records: hba1cRecords || [],
        weight_records: weightRecords || [],
        threads: threads || [],
        comments: comments || [],
        consents: consents || [],
      }

      // Create and download JSON file
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

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login', { state: { from: location.pathname } })
    }
  }, [user, authLoading, navigate, location.pathname])

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 size={32} className="animate-spin text-rose-500" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">マイページ</h1>
        <button
          onClick={() => setShowExportModal(true)}
          className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium"
        >
          <Download size={18} />
          <span className="hidden sm:inline">データエクスポート</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-4 -mb-px items-center justify-between">
          <div className="flex gap-4">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-rose-500 text-rose-500'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
          >
            <LogOut size={18} />
            <span className="hidden sm:inline">ログアウト</span>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        {activeTab === 'profile' && <ProfileSettings />}
        {activeTab === 'history' && <PostHistory />}
        {activeTab === 'bookmarks' && <Bookmarks />}
        {activeTab === 'blocked' && <BlockedUsers />}
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
                <li>• プロフィール情報</li>
                <li>• HbA1c記録</li>
                <li>• 体重記録</li>
                <li>• 投稿したトピック・コメント</li>
                <li>• データ利用同意履歴</li>
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
