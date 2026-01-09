import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
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

function getLinkIcon(url: string): string {
  const lowerUrl = url.toLowerCase()
  if (lowerUrl.includes('twitter.com') || lowerUrl.includes('x.com')) return '𝕏'
  if (lowerUrl.includes('instagram.com')) return '📷'
  if (lowerUrl.includes('youtube.com')) return '▶️'
  if (lowerUrl.includes('tiktok.com')) return '🎵'
  if (lowerUrl.includes('facebook.com')) return '📘'
  return '🔗'
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
  const { user: currentUser } = useAuth()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [profileData, setProfileData] = useState<UserProfileData | null>(null)
  const [threads, setThreads] = useState<Thread[]>([])
  const [hba1cRecords, setHba1cRecords] = useState<HbA1cRecord[]>([])
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
                className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs transition-colors"
              >
                <span>{getLinkIcon(link.url)}</span>
                <span className="text-gray-700">{link.title || 'リンク'}</span>
                <ExternalLinkIcon size={10} className="text-gray-400" />
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
    </div>
  )
}
