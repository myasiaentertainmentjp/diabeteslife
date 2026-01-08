import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Thread, THREAD_CATEGORY_LABELS, DIABETES_TYPE_LABELS, DiabetesType } from '../types/database'
import { User, Calendar, FileText, MessageSquare, Settings, Loader2 } from 'lucide-react'

interface UserData {
  id: string
  display_name: string | null
  created_at: string
}

interface UserProfileData {
  diabetes_type: DiabetesType
  diagnosis_year: number | null
  bio: string | null
}

export function UserProfile() {
  const { userId } = useParams<{ userId: string }>()
  const { user: currentUser } = useAuth()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [profileData, setProfileData] = useState<UserProfileData | null>(null)
  const [threads, setThreads] = useState<Thread[]>([])
  const [loading, setLoading] = useState(true)

  const isOwnProfile = currentUser?.id === userId

  useEffect(() => {
    if (userId) {
      fetchUserData()
    }
  }, [userId])

  async function fetchUserData() {
    setLoading(true)
    try {
      // Fetch user basic info
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, display_name, created_at')
        .eq('id', userId)
        .single()

      if (userError) {
        console.error('Error fetching user:', userError)
        return
      }

      setUserData(user)

      // Fetch user profile (from user_profiles table)
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('diabetes_type, diagnosis_year, bio')
        .eq('user_id', userId)
        .single()

      if (profile) {
        setProfileData(profile as UserProfileData)
      }

      // Fetch user's threads
      const { data: userThreads, error: threadsError } = await supabase
        .from('threads')
        .select('*')
        .eq('user_id', userId)
        
        .order('created_at', { ascending: false })
        .limit(10)

      if (threadsError) {
        console.error('Error fetching threads:', threadsError)
      } else if (userThreads) {
        setThreads(userThreads as Thread[])
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    } finally {
      setLoading(false)
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  function formatRelativeDate(dateString: string) {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) return '今日'
    if (days === 1) return '昨日'
    if (days < 7) return `${days}日前`
    return formatDate(dateString)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 size={32} className="animate-spin text-green-600" />
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <User size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="text-gray-600 mb-4">ユーザーが見つかりませんでした</p>
          <Link
            to="/"
            className="text-green-600 hover:underline"
          >
            トップページに戻る
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <User size={32} className="text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {userData.display_name || '匿名ユーザー'}
              </h1>
              <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                <Calendar size={14} />
                <span>{formatDate(userData.created_at)} 登録</span>
              </div>
            </div>
          </div>

          {isOwnProfile && (
            <Link
              to="/mypage"
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            >
              <Settings size={16} />
              <span>プロフィール編集</span>
            </Link>
          )}
        </div>

        {/* Profile Details */}
        <div className="mt-6 space-y-4">
          {profileData?.diabetes_type && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 w-24">糖尿病タイプ</span>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                {DIABETES_TYPE_LABELS[profileData.diabetes_type]}
              </span>
            </div>
          )}

          {profileData?.diagnosis_year && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 w-24">診断年</span>
              <span className="text-gray-900">{profileData.diagnosis_year}年</span>
            </div>
          )}

          {profileData?.bio && (
            <div className="mt-4">
              <span className="text-sm text-gray-500 block mb-2">自己紹介</span>
              <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 rounded-lg p-4">
                {profileData.bio}
              </p>
            </div>
          )}

          {!profileData?.diabetes_type && !profileData?.bio && (
            <p className="text-gray-500 text-sm">プロフィール情報がありません</p>
          )}
        </div>
      </div>

      {/* User's Threads */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2">
            <FileText size={20} className="text-gray-600" />
            <h2 className="font-semibold text-gray-900">
              投稿したスレッド
            </h2>
          </div>
        </div>

        {threads.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-500">
            まだスレッドを投稿していません
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {threads.map((thread) => (
              <Link
                key={thread.id}
                to={`/threads/${thread.id}`}
                className="block px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 mb-1">
                      {thread.title}
                    </h3>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                        {THREAD_CATEGORY_LABELS[thread.category]}
                      </span>
                      <span className="flex items-center gap-1 text-gray-500">
                        <MessageSquare size={14} />
                        {thread.comments_count}
                      </span>
                    </div>
                  </div>
                  <span className="text-sm text-gray-400 whitespace-nowrap">
                    {formatRelativeDate(thread.created_at)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
