import { useState, useEffect } from 'react'
import { useParams, Link, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import {
  Thread,
  THREAD_CATEGORY_LABELS,
  DIABETES_TYPE_LABELS,
  TREATMENT_TYPE_LABELS,
  DEVICE_TYPE_LABELS,
  AGE_GROUP_LABELS,
  GENDER_LABELS,
  ILLNESS_DURATION_LABELS,
  DiabetesType,
  TreatmentType,
  DeviceType,
  AgeGroup,
  Gender,
  IllnessDuration,
  ExternalLink,
} from '../types/database'
import {
  User,
  Calendar,
  FileText,
  MessageSquare,
  Settings,
  Loader2,
  MapPin,
  Activity,
  ExternalLink as ExternalLinkIcon,
  Lock,
  Send,
  Trash2,
} from 'lucide-react'

interface UserData {
  id: string
  display_name: string | null
  avatar_url: string | null
  created_at: string
}

interface UserProfileData {
  diabetes_type: DiabetesType
  diagnosis_year: number | null
  bio: string | null
  age_group: AgeGroup | null
  gender: Gender | null
  prefecture: string | null
  illness_duration: IllnessDuration | null
  treatment: TreatmentType[] | null
  devices: DeviceType[] | null
  external_links: ExternalLink[] | null
  is_age_public: boolean
  is_gender_public: boolean
  is_prefecture_public: boolean
  is_illness_duration_public: boolean
  is_treatment_public: boolean
  is_devices_public: boolean
  is_bio_public: boolean
  is_hba1c_public: boolean
  is_links_public: boolean
}

interface HbA1cRecord {
  id: string
  recorded_at: string
  value: number
}

interface ProfileComment {
  id: string
  profile_user_id: string
  commenter_id: string
  body: string
  created_at: string
  commenter?: {
    id: string
    display_name: string | null
    avatar_url: string | null
  }
}

function getSnsIcon(url: string): React.ReactNode {
  const lowerUrl = url.toLowerCase()
  if (lowerUrl.includes('twitter.com') || lowerUrl.includes('x.com')) {
    return <span className="w-5 h-5 flex items-center justify-center bg-black text-white rounded text-xs font-bold">𝕏</span>
  }
  if (lowerUrl.includes('instagram.com')) {
    return (
      <span className="w-5 h-5 flex items-center justify-center bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 text-white rounded">
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      </span>
    )
  }
  if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) {
    return (
      <span className="w-5 h-5 flex items-center justify-center bg-red-600 text-white rounded">
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      </span>
    )
  }
  if (lowerUrl.includes('tiktok.com')) {
    return (
      <span className="w-5 h-5 flex items-center justify-center bg-black text-white rounded">
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
        </svg>
      </span>
    )
  }
  return <span className="w-5 h-5 flex items-center justify-center bg-gray-500 text-white rounded"><ExternalLinkIcon size={12} /></span>
}

function PrivateBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-gray-200 text-gray-500 rounded text-xs">
      <Lock size={10} />
      非公開
    </span>
  )
}

export function UserProfile() {
  const { userId } = useParams<{ userId: string }>()
  const { user: currentUser, isAdmin } = useAuth()
  const { showToast } = useToast()
  const location = useLocation()
  const currentPath = location.pathname
  const [userData, setUserData] = useState<UserData | null>(null)
  const [profileData, setProfileData] = useState<UserProfileData | null>(null)
  const [threads, setThreads] = useState<Thread[]>([])
  const [hba1cRecords, setHba1cRecords] = useState<HbA1cRecord[]>([])
  const [profileComments, setProfileComments] = useState<ProfileComment[]>([])
  const [commentBody, setCommentBody] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)
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
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, display_name, avatar_url, created_at')
        .eq('id', userId)
        .single()

      if (userError) {
        console.error('Error fetching user:', userError)
        return
      }

      setUserData(user)

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (profile) {
        setProfileData(profile as UserProfileData)

        if (profile.is_hba1c_public || isOwnProfile) {
          const { data: records } = await supabase
            .from('hba1c_records')
            .select('id, recorded_at, value')
            .eq('user_id', userId)
            .order('recorded_at', { ascending: true })
            .limit(12)

          if (records) {
            setHba1cRecords(records as HbA1cRecord[])
          }
        }
      }

      const { data: userThreads } = await supabase
        .from('threads')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10)

      if (userThreads) {
        setThreads(userThreads as Thread[])
      }

      // Fetch profile comments
      await fetchProfileComments()
    } catch (error) {
      console.error('Error fetching user data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchProfileComments() {
    try {
      const { data: comments, error } = await supabase
        .from('profile_comments')
        .select('*')
        .eq('profile_user_id', userId)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error fetching profile comments:', error)
        return
      }

      if (!comments || comments.length === 0) {
        setProfileComments([])
        return
      }

      // Fetch commenter info
      const commenterIds = [...new Set(comments.map(c => c.commenter_id))]
      const { data: commenters } = await supabase
        .from('users')
        .select('id, display_name, avatar_url')
        .in('id', commenterIds)

      const commenterMap = new Map(commenters?.map(u => [u.id, u]) || [])

      const commentsWithCommenters = comments.map(comment => ({
        ...comment,
        commenter: commenterMap.get(comment.commenter_id) || null
      }))

      setProfileComments(commentsWithCommenters as ProfileComment[])
    } catch (error) {
      console.error('Error fetching profile comments:', error)
    }
  }

  async function submitProfileComment(e: React.FormEvent) {
    e.preventDefault()
    if (!currentUser || !commentBody.trim()) return

    setSubmittingComment(true)
    try {
      const { error } = await supabase
        .from('profile_comments')
        .insert({
          profile_user_id: userId,
          commenter_id: currentUser.id,
          body: commentBody.trim()
        })

      if (error) {
        console.error('Error submitting comment:', error)
        showToast('コメントの投稿に失敗しました', 'error')
        return
      }

      setCommentBody('')
      showToast('コメントを投稿しました', 'success')
      await fetchProfileComments()
    } catch (error) {
      console.error('Error submitting comment:', error)
      showToast('コメントの投稿に失敗しました', 'error')
    } finally {
      setSubmittingComment(false)
    }
  }

  async function deleteProfileComment(commentId: string) {
    if (!confirm('このコメントを削除しますか？')) return

    try {
      const { error } = await supabase
        .from('profile_comments')
        .delete()
        .eq('id', commentId)

      if (error) {
        console.error('Error deleting comment:', error)
        showToast('コメントの削除に失敗しました', 'error')
        return
      }

      showToast('コメントを削除しました', 'success')
      setProfileComments(prev => prev.filter(c => c.id !== commentId))
    } catch (error) {
      console.error('Error deleting comment:', error)
      showToast('コメントの削除に失敗しました', 'error')
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  function formatShortDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  function shouldShow(isPublic: boolean | undefined): boolean {
    if (isOwnProfile) return true
    return isPublic ?? false
  }

  // Format chart data
  function getChartData() {
    return hba1cRecords.map((record) => ({
      date: record.recorded_at,
      value: record.value,
      label: new Date(record.recorded_at).toLocaleDateString('ja-JP', { month: 'short' }),
    }))
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 size={32} className="animate-spin text-rose-500" />
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <User size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="text-gray-600 mb-4">ユーザーが見つかりませんでした</p>
          <Link to="/" className="text-rose-500 hover:underline">
            トップページに戻る
          </Link>
        </div>
      </div>
    )
  }

  const showAgeGroup = profileData?.age_group && shouldShow(profileData.is_age_public)
  const showGender = profileData?.gender && shouldShow(profileData.is_gender_public)
  const showPrefecture = profileData?.prefecture && shouldShow(profileData.is_prefecture_public)
  const showIllnessDuration = profileData?.illness_duration && shouldShow(profileData.is_illness_duration_public)
  const showTreatment = (profileData?.treatment?.length ?? 0) > 0 && shouldShow(profileData.is_treatment_public)
  const showDevices = (profileData?.devices?.length ?? 0) > 0 && shouldShow(profileData.is_devices_public)
  const showBio = profileData?.bio && shouldShow(profileData.is_bio_public)
  const showHba1c = hba1cRecords.length > 0 && shouldShow(profileData?.is_hba1c_public)
  const showLinks = (profileData?.external_links?.length ?? 0) > 0 && shouldShow(profileData.is_links_public)

  const chartData = getChartData()
  const latestHba1c = hba1cRecords[hba1cRecords.length - 1]?.value

  // Build info items for compact display
  const infoItems: { label: string; value: string; isPublic: boolean }[] = []
  if (showAgeGroup) infoItems.push({ label: '年代', value: AGE_GROUP_LABELS[profileData!.age_group!], isPublic: profileData!.is_age_public })
  if (showGender) infoItems.push({ label: '性別', value: GENDER_LABELS[profileData!.gender!], isPublic: profileData!.is_gender_public })
  if (showPrefecture) infoItems.push({ label: '地域', value: profileData!.prefecture!, isPublic: profileData!.is_prefecture_public })
  if (showIllnessDuration) infoItems.push({ label: '罹患歴', value: `闘病${ILLNESS_DURATION_LABELS[profileData!.illness_duration!]}`, isPublic: profileData!.is_illness_duration_public })

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Compact Profile Card */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-3">
        {/* Header Row */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
            {userData.avatar_url ? (
              <img
                src={userData.avatar_url}
                alt={userData.display_name || 'ユーザー'}
                className="w-full h-full object-cover"
              />
            ) : (
              <User size={32} className="text-rose-500" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-gray-900">
                {userData.display_name || '匿名ユーザー'}
              </h1>
              {profileData?.diabetes_type && (
                <span className="px-2 py-0.5 bg-rose-100 text-rose-700 rounded-full text-xs font-medium">
                  {DIABETES_TYPE_LABELS[profileData.diabetes_type]}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {formatShortDate(userData.created_at)} 登録
            </p>
            {/* Compact Info Row */}
            {infoItems.length > 0 && (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-sm text-gray-600">
                {infoItems.map((item, idx) => (
                  <span key={idx} className={`flex items-center gap-1 ${isOwnProfile && !item.isPublic ? 'opacity-50' : ''}`}>
                    {item.value}
                    {isOwnProfile && !item.isPublic && <Lock size={10} className="text-gray-400" />}
                    {idx < infoItems.length - 1 && <span className="text-gray-300 ml-2">|</span>}
                  </span>
                ))}
              </div>
            )}
          </div>
          {isOwnProfile && (
            <Link
              to="/mypage/profile"
              className="flex items-center gap-1 px-3 py-1.5 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors text-sm font-medium flex-shrink-0"
            >
              <Settings size={14} />
              <span className="hidden sm:inline">編集</span>
            </Link>
          )}
        </div>

        {/* Treatment & Devices Row */}
        {(showTreatment || showDevices) && (
          <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-1.5">
            {showTreatment && profileData!.treatment!.map((t) => (
              <span key={t} className={`px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs ${isOwnProfile && !profileData?.is_treatment_public ? 'opacity-50' : ''}`}>
                {TREATMENT_TYPE_LABELS[t]}
              </span>
            ))}
            {showDevices && profileData!.devices!.map((d) => (
              <span key={d} className={`px-2 py-0.5 bg-green-50 text-green-700 rounded text-xs ${isOwnProfile && !profileData?.is_devices_public ? 'opacity-50' : ''}`}>
                {DEVICE_TYPE_LABELS[d]}
              </span>
            ))}
          </div>
        )}

        {/* Bio */}
        {showBio && (
          <div className={`mt-3 pt-3 border-t border-gray-100 ${isOwnProfile && !profileData?.is_bio_public ? 'opacity-50' : ''}`}>
            <p className="text-sm text-gray-700">{profileData!.bio}</p>
          </div>
        )}

        {/* External Links */}
        {showLinks && (
          <div className={`mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-2 ${isOwnProfile && !profileData?.is_links_public ? 'opacity-50' : ''}`}>
            {profileData!.external_links!.map((link, index) => (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors"
              >
                {getSnsIcon(link.url)}
                <span className="text-gray-700">{link.title || 'リンク'}</span>
              </a>
            ))}
          </div>
        )}
      </div>

      {/* HbA1c Chart */}
      {showHba1c && (
        <div className={`bg-white rounded-xl shadow-sm p-4 mb-3 ${isOwnProfile && !profileData?.is_hba1c_public ? 'opacity-60' : ''}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-rose-500" />
              <h2 className="text-sm font-bold text-gray-900">HbA1c推移</h2>
              {isOwnProfile && !profileData?.is_hba1c_public && <PrivateBadge />}
            </div>
            {latestHba1c && (
              <span className="text-sm font-bold text-rose-600">
                最新HbA1c: {latestHba1c}%
              </span>
            )}
          </div>
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10 }}
                tickLine={false}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis
                domain={[4, 10]}
                tick={{ fontSize: 10 }}
                tickLine={false}
                axisLine={{ stroke: '#e5e7eb' }}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                formatter={(value: number) => [`${value}%`, 'HbA1c']}
                labelFormatter={(label) => label}
              />
              <ReferenceLine y={7} stroke="#10B981" strokeDasharray="3 3" />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#f43f5e"
                strokeWidth={2}
                dot={{ fill: '#f43f5e', strokeWidth: 0, r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* No HbA1c data message for own profile */}
      {isOwnProfile && !showHba1c && profileData?.is_hba1c_public && (
        <div className="bg-white rounded-xl shadow-sm p-4 mb-3">
          <div className="flex items-center gap-2 mb-2">
            <Activity size={16} className="text-rose-500" />
            <h2 className="text-sm font-bold text-gray-900">HbA1c推移</h2>
          </div>
          <div className="text-center py-4 text-gray-500 text-sm">
            <p>まだ記録がありません</p>
            <Link to="/mypage/hba1c" className="text-rose-500 hover:underline text-xs mt-1 inline-block">
              HbA1cを記録する →
            </Link>
          </div>
        </div>
      )}

      {/* Threads */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 bg-rose-50">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-rose-500" />
            <h2 className="text-sm font-semibold text-gray-900">投稿したスレッド</h2>
            <span className="text-xs text-gray-500">({threads.length})</span>
          </div>
        </div>

        {threads.length === 0 ? (
          <div className="px-4 py-6 text-center text-gray-500 text-sm">
            まだスレッドを投稿していません
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {threads.map((thread) => (
              <Link
                key={thread.id}
                to={`/threads/${thread.id}`}
                className="block px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {thread.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-xs">
                      <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
                        {THREAD_CATEGORY_LABELS[thread.category]}
                      </span>
                      <span className="flex items-center gap-0.5 text-gray-500">
                        <MessageSquare size={12} />
                        {thread.comments_count}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {formatShortDate(thread.created_at)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Profile Comments */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mt-3">
        <div className="px-4 py-3 border-b border-gray-100 bg-rose-50">
          <div className="flex items-center gap-2">
            <MessageSquare size={16} className="text-rose-500" />
            <h2 className="text-sm font-semibold text-gray-900">コメント</h2>
            <span className="text-xs text-gray-500">({profileComments.length})</span>
          </div>
        </div>

        {/* Comment Form */}
        {currentUser ? (
          <form onSubmit={submitProfileComment} className="px-4 py-3 border-b border-gray-100">
            <div className="flex gap-2">
              <textarea
                value={commentBody}
                onChange={(e) => setCommentBody(e.target.value)}
                placeholder="コメントを入力..."
                rows={2}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none"
              />
              <button
                type="submit"
                disabled={submittingComment || !commentBody.trim()}
                className="self-end px-3 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {submittingComment ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="px-4 py-3 border-b border-gray-100 text-center text-sm text-gray-500">
            <Link to="/login" state={{ from: currentPath }} className="text-rose-500 hover:underline">ログイン</Link>してコメントする
          </div>
        )}

        {/* Comments List */}
        {profileComments.length === 0 ? (
          <div className="px-4 py-6 text-center text-gray-500 text-sm">
            まだコメントがありません
          </div>
        ) : (
          <div className="px-4 py-3">
            {profileComments.map((comment, index) => {
              const canDelete = currentUser && (
                currentUser.id === comment.commenter_id || // Comment author
                currentUser.id === userId || // Profile owner
                isAdmin // Admin
              )

              return (
                <div key={comment.id} className="py-2">
                  <div className="flex items-start gap-2">
                    <span className="text-xs text-gray-400 font-mono shrink-0 pt-0.5">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          to={`/users/${comment.commenter_id}`}
                          className="text-sm font-medium text-rose-600 hover:underline"
                        >
                          {comment.commenter?.display_name || '匿名'}
                        </Link>
                        <span className="text-xs text-gray-400">
                          {formatShortDate(comment.created_at)}
                        </span>
                        {canDelete && (
                          <button
                            onClick={() => deleteProfileComment(comment.id)}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                            title="削除"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap break-words">
                        {comment.body}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
