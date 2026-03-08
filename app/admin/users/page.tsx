'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import {
  Loader2,
  Users,
  ChevronLeft,
  ChevronRight,
  Search,
  Shield,
  ShieldOff,
  Ban,
  CheckCircle,
} from 'lucide-react'

interface User {
  id: string
  email: string
  display_name: string | null
  role: string
  is_admin: boolean
  is_banned: boolean
  created_at: string
  thread_count?: number
  comment_count?: number
}

const ITEMS_PER_PAGE = 20

export default function AdminUsersPage() {
  const supabase = createClient()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [updating, setUpdating] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [page])

  async function fetchUsers() {
    setLoading(true)

    try {
      const { count } = await supabase
        .from('users')
        .select('id', { count: 'exact', head: true })

      setTotal(count || 0)

      const from = (page - 1) * ITEMS_PER_PAGE
      const to = from + ITEMS_PER_PAGE - 1

      const { data: usersData } = await supabase
        .from('users')
        .select('id, email, display_name, role, is_admin, is_banned, created_at')
        .order('created_at', { ascending: false })
        .range(from, to)

      if (usersData) {
        setUsers(usersData)
      } else {
        setUsers([])
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  async function searchUsers() {
    if (!searchQuery.trim()) {
      fetchUsers()
      return
    }

    setLoading(true)
    try {
      const { data: usersData, count } = await supabase
        .from('users')
        .select('id, email, display_name, role, is_admin, is_banned, created_at', { count: 'exact' })
        .or(`email.ilike.%${searchQuery}%,display_name.ilike.%${searchQuery}%`)
        .order('created_at', { ascending: false })
        .limit(ITEMS_PER_PAGE)

      setTotal(count || 0)

      if (usersData) {
        setUsers(usersData)
      } else {
        setUsers([])
      }
    } catch (error) {
      console.error('Error searching users:', error)
    } finally {
      setLoading(false)
    }
  }

  async function toggleAdmin(userId: string, currentStatus: boolean) {
    setUpdating(userId)
    const { error } = await supabase
      .from('users')
      .update({ is_admin: !currentStatus } as never)
      .eq('id', userId)

    if (error) {
      console.error('Error updating user:', error)
      alert('更新に失敗しました')
    } else {
      fetchUsers()
    }
    setUpdating(null)
  }

  async function toggleBan(userId: string, currentStatus: boolean) {
    const action = currentStatus ? '解除' : 'BAN'
    if (!confirm(`このユーザーを${action}しますか？`)) return

    setUpdating(userId)
    const { error } = await supabase
      .from('users')
      .update({ is_banned: !currentStatus } as never)
      .eq('id', userId)

    if (error) {
      console.error('Error updating user:', error)
      alert('更新に失敗しました')
    } else {
      fetchUsers()
    }
    setUpdating(null)
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Users className="text-blue-500" />
          ユーザー管理
        </h1>
        <span className="text-sm text-gray-500">{total}人</span>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && searchUsers()}
            placeholder="メールアドレスまたは表示名で検索..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
          <button
            onClick={searchUsers}
            className="px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
          >
            <Search size={18} />
          </button>
        </div>
      </div>

      {/* User List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 size={32} className="animate-spin text-rose-500" />
          </div>
        ) : users.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500">
            <Users size={48} className="mx-auto mb-4 text-gray-300" />
            <p>ユーザーがいません</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ユーザー</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状態</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">登録日</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => (
                <tr key={user.id} className={`hover:bg-gray-50 ${user.is_banned ? 'bg-red-50' : ''}`}>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{user.display_name || '未設定'}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {user.is_admin && (
                        <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded flex items-center gap-1">
                          <Shield size={12} />
                          管理者
                        </span>
                      )}
                      {user.is_banned ? (
                        <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded flex items-center gap-1">
                          <Ban size={12} />
                          BAN
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded flex items-center gap-1">
                          <CheckCircle size={12} />
                          有効
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatDate(user.created_at)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => toggleAdmin(user.id, user.is_admin)}
                        disabled={updating === user.id}
                        className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
                          user.is_admin
                            ? 'text-purple-600 hover:bg-purple-50'
                            : 'text-gray-400 hover:bg-gray-100'
                        }`}
                        title={user.is_admin ? '管理者権限を剥奪' : '管理者にする'}
                      >
                        {updating === user.id ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : user.is_admin ? (
                          <ShieldOff size={18} />
                        ) : (
                          <Shield size={18} />
                        )}
                      </button>
                      <button
                        onClick={() => toggleBan(user.id, user.is_banned)}
                        disabled={updating === user.id}
                        className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
                          user.is_banned
                            ? 'text-green-600 hover:bg-green-50'
                            : 'text-red-600 hover:bg-red-50'
                        }`}
                        title={user.is_banned ? 'BANを解除' : 'BANする'}
                      >
                        {updating === user.id ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : user.is_banned ? (
                          <CheckCircle size={18} />
                        ) : (
                          <Ban size={18} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-sm text-gray-600">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  )
}
