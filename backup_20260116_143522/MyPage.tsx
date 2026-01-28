import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Loader2, User, Activity, FileText, UserX, Bookmark } from 'lucide-react'
import { ProfileSettings } from './mypage/ProfileSettings'
import { HbA1cRecords } from './mypage/HbA1cRecords'
import { PostHistory } from './mypage/PostHistory'
import { BlockedUsers } from './mypage/BlockedUsers'
import { Bookmarks } from './mypage/Bookmarks'

type TabType = 'profile' | 'hba1c' | 'history' | 'bookmarks' | 'blocked'

const TABS: { id: TabType; label: string; icon: React.ReactNode }[] = [
  { id: 'profile', label: 'プロフィール設定', icon: <User size={18} /> },
  { id: 'hba1c', label: 'HbA1c記録', icon: <Activity size={18} /> },
  { id: 'history', label: '投稿履歴', icon: <FileText size={18} /> },
  { id: 'bookmarks', label: 'ブックマーク', icon: <Bookmark size={18} /> },
  { id: 'blocked', label: 'ブロック', icon: <UserX size={18} /> },
]

export function MyPage() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [activeTab, setActiveTab] = useState<TabType>('profile')

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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">マイページ</h1>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-4 -mb-px">
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
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        {activeTab === 'profile' && <ProfileSettings />}
        {activeTab === 'hba1c' && <HbA1cRecords />}
        {activeTab === 'history' && <PostHistory />}
        {activeTab === 'bookmarks' && <Bookmarks />}
        {activeTab === 'blocked' && <BlockedUsers />}
      </div>
    </div>
  )
}
