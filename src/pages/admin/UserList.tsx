import { useState, useEffect } from 'react'
import JSZip from 'jszip'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import {
  AppUser,
  UserRole,
  USER_ROLE_LABELS,
  DIABETES_TYPE_LABELS,
  TREATMENT_TYPE_LABELS,
  AGE_GROUP_LABELS,
  GENDER_LABELS,
  ILLNESS_DURATION_LABELS,
  DEVICE_TYPE_LABELS,
  YES_NO_PRIVATE_LABELS,
  DiabetesType,
  TreatmentType,
  AgeGroup,
  Gender,
  IllnessDuration,
  DeviceType,
  YesNoPrivate,
} from '../../types/database'
import { Loader2, Shield, ShieldOff, Bot, Download } from 'lucide-react'

export function AdminUserList() {
  const { user: currentUser } = useAuth()
  const { showToast } = useToast()
  const [users, setUsers] = useState<AppUser[]>([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching users:', error)
        showToast('ユーザーの取得に失敗しました', 'error')
      } else if (data) {
        setUsers(data as AppUser[])
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      showToast('ユーザーの取得に失敗しました', 'error')
    } finally {
      setLoading(false)
    }
  }

  async function updateRole(userId: string, newRole: UserRole) {
    if (userId === currentUser?.id) {
      showToast('自分自身の役割は変更できません', 'error')
      return
    }

    const { error } = await supabase
      .from('users')
      .update({ role: newRole, updated_at: new Date().toISOString() } as never)
      .eq('id', userId)

    if (error) {
      console.error('Error updating user role:', error)
      showToast('更新に失敗しました', 'error')
    } else {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      )
      showToast(
        `ユーザーを${USER_ROLE_LABELS[newRole]}に変更しました`,
        'success'
      )
    }
  }

  async function toggleDummy(userId: string, currentIsDummy: boolean) {
    const { error } = await supabase
      .from('users')
      .update({ is_dummy: !currentIsDummy, updated_at: new Date().toISOString() } as never)
      .eq('id', userId)

    if (error) {
      console.error('Error updating dummy status:', error)
      showToast('更新に失敗しました', 'error')
    } else {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, is_dummy: !currentIsDummy } : u))
      )
      showToast(
        currentIsDummy ? 'ダミーユーザーを解除しました' : 'ダミーユーザーに設定しました',
        'success'
      )
    }
  }

  // Helper to escape CSV fields
  function escapeCSV(value: string | null | undefined): string {
    if (value === null || value === undefined) return ''
    const str = String(value)
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`
    }
    return str
  }

  // Export user data as ZIP
  async function handleExport() {
    setExporting(true)
    try {
      // Fetch all users
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (usersError) throw usersError

      // Fetch all user_profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('user_profiles')
        .select('*')

      if (profilesError) throw profilesError

      // Fetch all profiles (legacy)
      const { data: legacyProfilesData } = await supabase
        .from('profiles')
        .select('*')

      // Fetch activity data
      const { data: threadsData } = await supabase
        .from('threads')
        .select('user_id, created_at')

      const { data: commentsData } = await supabase
        .from('thread_comments')
        .select('user_id, created_at')

      const { data: likesData } = await supabase
        .from('thread_likes')
        .select('user_id')

      const { data: diaryLikesData } = await supabase
        .from('diary_entry_likes')
        .select('user_id')

      // Create users.csv
      const usersCSV = [
        ['user_id', '表示名', 'メールアドレス', '役割', 'ダミー', '登録日時', '更新日時'].join(','),
        ...(usersData || []).map(u => [
          escapeCSV(u.id),
          escapeCSV(u.display_name),
          escapeCSV(u.email),
          escapeCSV(USER_ROLE_LABELS[u.role as UserRole] || u.role),
          u.is_dummy ? 'はい' : 'いいえ',
          escapeCSV(u.created_at),
          escapeCSV(u.updated_at),
        ].join(','))
      ].join('\n')

      // Create profiles.csv
      const profilesMap = new Map((profilesData || []).map(p => [p.user_id, p]))
      const legacyProfilesMap = new Map((legacyProfilesData || []).map(p => [p.id, p]))

      const profilesCSV = [
        [
          'user_id', 'アバターURL', '自己紹介', '年代', '性別', '都道府県',
          '糖尿病タイプ', '罹患期間', '診断年', '治療方法', '使用デバイス',
          '合併症', '透析', '妊娠中', 'SNSリンク', 'HbA1c公開', 'プロフィール完成度'
        ].join(','),
        ...(usersData || []).map(u => {
          const profile = profilesMap.get(u.id)
          const legacyProfile = legacyProfilesMap.get(u.id)

          // Calculate profile completeness
          let completedFields = 0
          const totalFields = 8
          if (profile?.diabetes_type || legacyProfile?.diabetes_type) completedFields++
          if (profile?.diagnosis_year || legacyProfile?.diagnosis_year) completedFields++
          if (profile?.bio || legacyProfile?.bio) completedFields++
          if (profile?.age_group) completedFields++
          if (profile?.gender) completedFields++
          if (profile?.prefecture) completedFields++
          if (profile?.illness_duration) completedFields++
          if ((profile?.devices && profile.devices.length > 0) || (legacyProfile?.treatments && legacyProfile.treatments.length > 0)) completedFields++
          const completeness = Math.round((completedFields / totalFields) * 100)

          // Format treatments/devices
          const treatments = legacyProfile?.treatments?.map((t: TreatmentType) => TREATMENT_TYPE_LABELS[t]).join('; ') || ''
          const devices = profile?.devices?.map((d: DeviceType) => DEVICE_TYPE_LABELS[d]).join('; ') || ''

          // Format external links
          const links = profile?.external_links?.map((l: { title: string; url: string }) => `${l.title || ''}:${l.url}`).join('; ') || ''

          return [
            escapeCSV(u.id),
            escapeCSV(u.avatar_url || legacyProfile?.avatar_url),
            escapeCSV(profile?.bio || legacyProfile?.bio),
            escapeCSV(profile?.age_group ? AGE_GROUP_LABELS[profile.age_group as AgeGroup] : ''),
            escapeCSV(profile?.gender ? GENDER_LABELS[profile.gender as Gender] : ''),
            escapeCSV(profile?.prefecture),
            escapeCSV((profile?.diabetes_type || legacyProfile?.diabetes_type) ? DIABETES_TYPE_LABELS[(profile?.diabetes_type || legacyProfile?.diabetes_type) as NonNullable<DiabetesType>] : ''),
            escapeCSV(profile?.illness_duration ? ILLNESS_DURATION_LABELS[profile.illness_duration as IllnessDuration] : ''),
            escapeCSV(profile?.diagnosis_year || legacyProfile?.diagnosis_year),
            escapeCSV(treatments),
            escapeCSV(devices),
            escapeCSV(profile?.has_complications ? YES_NO_PRIVATE_LABELS[profile.has_complications as YesNoPrivate] : ''),
            escapeCSV(profile?.on_dialysis ? YES_NO_PRIVATE_LABELS[profile.on_dialysis as YesNoPrivate] : ''),
            escapeCSV(profile?.is_pregnant ? YES_NO_PRIVATE_LABELS[profile.is_pregnant as YesNoPrivate] : ''),
            escapeCSV(links),
            profile?.hba1c_public ? '公開' : '非公開',
            `${completeness}%`,
          ].join(',')
        })
      ].join('\n')

      // Create activity.csv
      const threadCountMap = new Map<string, { count: number; lastDate: string | null }>()
      const commentCountMap = new Map<string, number>()
      const likeCountMap = new Map<string, number>()

      (threadsData || []).forEach(t => {
        const current = threadCountMap.get(t.user_id) || { count: 0, lastDate: null }
        current.count++
        if (!current.lastDate || t.created_at > current.lastDate) {
          current.lastDate = t.created_at
        }
        threadCountMap.set(t.user_id, current)
      })

      ;(commentsData || []).forEach(c => {
        commentCountMap.set(c.user_id, (commentCountMap.get(c.user_id) || 0) + 1)
      })

      ;(likesData || []).forEach(l => {
        likeCountMap.set(l.user_id, (likeCountMap.get(l.user_id) || 0) + 1)
      })
      ;(diaryLikesData || []).forEach(l => {
        likeCountMap.set(l.user_id, (likeCountMap.get(l.user_id) || 0) + 1)
      })

      const activityCSV = [
        ['user_id', '投稿数', 'コメント数', 'いいね数', '最終投稿日'].join(','),
        ...(usersData || []).map(u => {
          const threadInfo = threadCountMap.get(u.id) || { count: 0, lastDate: null }
          const commentCount = commentCountMap.get(u.id) || 0
          const likeCount = likeCountMap.get(u.id) || 0

          return [
            escapeCSV(u.id),
            threadInfo.count,
            commentCount,
            likeCount,
            escapeCSV(threadInfo.lastDate ? new Date(threadInfo.lastDate).toLocaleDateString('ja-JP') : ''),
          ].join(',')
        })
      ].join('\n')

      // Create ZIP
      const zip = new JSZip()
      // Add BOM for Excel compatibility
      const BOM = '\uFEFF'
      zip.file('users.csv', BOM + usersCSV)
      zip.file('profiles.csv', BOM + profilesCSV)
      zip.file('activity.csv', BOM + activityCSV)

      // Generate and download
      const blob = await zip.generateAsync({ type: 'blob' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `dlife_users_export_${new Date().toISOString().split('T')[0]}.zip`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      showToast('エクスポートが完了しました', 'success')
    } catch (error) {
      console.error('Export error:', error)
      showToast('エクスポートに失敗しました', 'error')
    } finally {
      setExporting(false)
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('ja-JP')
  }

  function getRoleBadge(role: UserRole) {
    const styles = {
      admin: 'bg-purple-100 text-purple-700',
      user: 'bg-gray-100 text-gray-700',
    }
    return (
      <span className={`px-2 py-1 text-xs rounded ${styles[role] || styles.user}`}>
        {USER_ROLE_LABELS[role] || role}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 size={32} className="animate-spin text-rose-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">ユーザー管理</h1>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors"
        >
          {exporting ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span>エクスポート中...</span>
            </>
          ) : (
            <>
              <Download size={18} />
              <span>CSVエクスポート</span>
            </>
          )}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left font-medium text-gray-600">表示名</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">メール</th>
                <th className="px-4 py-3 text-center font-medium text-gray-600">役割</th>
                <th className="px-4 py-3 text-center font-medium text-gray-600">ダミー</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">登録日</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user, index) => {
                const isCurrentUser = user.id === currentUser?.id
                return (
                  <tr
                    key={user.id}
                    className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} ${
                      isCurrentUser ? 'bg-rose-50/50' : ''
                    } ${user.is_dummy ? 'bg-blue-50/50' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">
                          {user.display_name || 'ユーザー'}
                        </span>
                        {isCurrentUser && (
                          <span className="text-xs text-rose-500">(自分)</span>
                        )}
                        {user.is_dummy && (
                          <Bot size={14} className="text-blue-500" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{user.email}</td>
                    <td className="px-4 py-3 text-center">{getRoleBadge(user.role)}</td>
                    <td className="px-4 py-3 text-center">
                      {user.is_dummy ? (
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                          ダミー
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(user.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {!isCurrentUser && (
                          <>
                            <button
                              onClick={() => toggleDummy(user.id, user.is_dummy)}
                              className={`flex items-center gap-1 px-2 py-1 text-xs border rounded transition-colors ${
                                user.is_dummy
                                  ? 'text-blue-600 border-blue-200 hover:bg-blue-50'
                                  : 'text-gray-600 border-gray-200 hover:bg-gray-50'
                              }`}
                              title={user.is_dummy ? 'ダミー解除' : 'ダミーに設定'}
                            >
                              <Bot size={14} />
                              <span>{user.is_dummy ? 'ダミー解除' : 'ダミーに'}</span>
                            </button>
                            {user.role === 'user' ? (
                              <button
                                onClick={() => updateRole(user.id, 'admin')}
                                className="flex items-center gap-1 px-2 py-1 text-xs text-purple-600 border border-purple-200 rounded hover:bg-purple-50 transition-colors"
                                title="管理者にする"
                              >
                                <Shield size={14} />
                                <span>管理者に</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => updateRole(user.id, 'user')}
                                className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors"
                                title="一般ユーザーにする"
                              >
                                <ShieldOff size={14} />
                                <span>一般に</span>
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p>ユーザーがいません</p>
          </div>
        )}
      </div>
    </div>
  )
}
