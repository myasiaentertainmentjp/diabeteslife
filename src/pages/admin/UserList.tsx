import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import { AppUser, UserRole, USER_ROLE_LABELS } from '../../types/database'
import { Loader2, Shield, ShieldOff } from 'lucide-react'

export function AdminUserList() {
  const { user: currentUser } = useAuth()
  const { showToast } = useToast()
  const [users, setUsers] = useState<AppUser[]>([])
  const [loading, setLoading] = useState(true)

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
        setUsers(data as unknown as AppUser[])
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
        <Loader2 size={32} className="animate-spin text-green-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">ユーザー管理</h1>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left font-medium text-gray-600">表示名</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">メール</th>
                <th className="px-4 py-3 text-center font-medium text-gray-600">役割</th>
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
                      isCurrentUser ? 'bg-green-50/50' : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">
                        {user.display_name || 'ユーザー'}
                        {isCurrentUser && (
                          <span className="ml-2 text-xs text-green-600">(自分)</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{user.email}</td>
                    <td className="px-4 py-3 text-center">{getRoleBadge(user.role)}</td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(user.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {!isCurrentUser && (
                          <>
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
