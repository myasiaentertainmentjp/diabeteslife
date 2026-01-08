import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useToast } from '../../contexts/ToastContext'
import {
  Thread,
  ThreadCategory,
  ThreadStatus,
  THREAD_CATEGORY_LABELS,
  THREAD_STATUS_LABELS,
} from '../../types/database'
import { Loader2, Eye, EyeOff, Lock, Unlock, Trash2 } from 'lucide-react'

interface ThreadWithUser extends Thread {
  profiles?: { display_name: string | null; email: string }
}

const CATEGORIES: ThreadCategory[] = ['health', 'lifestyle', 'work', 'food', 'exercise', 'other']
const STATUSES: ThreadStatus[] = ['normal', 'hidden', 'locked']

export function AdminThreadList() {
  const { showToast } = useToast()
  const [threads, setThreads] = useState<ThreadWithUser[]>([])
  const [loading, setLoading] = useState(true)
  const [categoryFilter, setCategoryFilter] = useState<ThreadCategory | ''>('')
  const [statusFilter, setStatusFilter] = useState<ThreadStatus | ''>('')

  useEffect(() => {
    fetchThreads()
  }, [categoryFilter, statusFilter])

  async function fetchThreads() {
    setLoading(true)
    try {
      let query = supabase
        .from('threads')
        .select(`*, profiles:user_id(display_name, email)`)
        .order('created_at', { ascending: false })

      if (categoryFilter) {
        query = query.eq('category', categoryFilter)
      }
      if (statusFilter) {
        query = query.eq('status', statusFilter)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching threads:', error)
        showToast('スレッドの取得に失敗しました', 'error')
      } else {
        setThreads(data as unknown as ThreadWithUser[])
      }
    } catch (error) {
      console.error('Error fetching threads:', error)
      showToast('スレッドの取得に失敗しました', 'error')
    } finally {
      setLoading(false)
    }
  }

  async function updateStatus(id: string, status: ThreadStatus) {
    const { error } = await supabase
      .from('threads')
      .update({ status, updated_at: new Date().toISOString() } as never)
      .eq('id', id)

    if (error) {
      console.error('Error updating thread:', error)
      showToast('更新に失敗しました', 'error')
    } else {
      setThreads((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)))
      showToast('スレッドを更新しました', 'success')
    }
  }

  async function deleteThread(id: string) {
    if (!confirm('このスレッドを削除しますか？関連するコメントも削除されます。')) return

    // First delete comments
    await supabase.from('comments').delete().eq('thread_id', id)

    const { error } = await supabase.from('threads').delete().eq('id', id)

    if (error) {
      console.error('Error deleting thread:', error)
      showToast('削除に失敗しました', 'error')
    } else {
      setThreads((prev) => prev.filter((t) => t.id !== id))
      showToast('スレッドを削除しました', 'success')
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('ja-JP')
  }

  function getStatusBadge(status: ThreadStatus) {
    const styles = {
      normal: 'bg-green-100 text-green-700',
      hidden: 'bg-red-100 text-red-700',
      locked: 'bg-yellow-100 text-yellow-700',
    }
    return (
      <span className={`px-2 py-1 text-xs rounded ${styles[status]}`}>
        {THREAD_STATUS_LABELS[status]}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">スレッド管理</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as ThreadCategory | '')}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="">全カテゴリ</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {THREAD_CATEGORY_LABELS[cat]}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ThreadStatus | '')}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="">全状態</option>
          {STATUSES.map((status) => (
            <option key={status} value={status}>
              {THREAD_STATUS_LABELS[status]}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 size={32} className="animate-spin text-green-600" />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left font-medium text-gray-600">タイトル</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">投稿者</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">カテゴリ</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-600">コメント</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-600">状態</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">作成日</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {threads.map((thread, index) => (
                  <tr
                    key={thread.id}
                    className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}
                  >
                    <td className="px-4 py-3">
                      <div className="max-w-xs truncate font-medium text-gray-900">
                        {thread.title}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-gray-900">
                        {thread.profiles?.display_name || '匿名'}
                      </div>
                      <div className="text-xs text-gray-500">{thread.profiles?.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 text-xs bg-gray-100 rounded">
                        {THREAD_CATEGORY_LABELS[thread.category]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600">
                      {thread.comments_count}
                    </td>
                    <td className="px-4 py-3 text-center">{getStatusBadge(thread.status)}</td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(thread.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {thread.status === 'hidden' ? (
                          <button
                            onClick={() => updateStatus(thread.id, 'normal')}
                            className="p-1.5 text-green-600 rounded hover:bg-green-50 transition-colors"
                            title="表示する"
                          >
                            <Eye size={16} />
                          </button>
                        ) : (
                          <button
                            onClick={() => updateStatus(thread.id, 'hidden')}
                            className="p-1.5 text-red-600 rounded hover:bg-red-50 transition-colors"
                            title="非表示にする"
                          >
                            <EyeOff size={16} />
                          </button>
                        )}
                        {thread.status === 'locked' ? (
                          <button
                            onClick={() => updateStatus(thread.id, 'normal')}
                            className="p-1.5 text-yellow-600 rounded hover:bg-yellow-50 transition-colors"
                            title="ロック解除"
                          >
                            <Unlock size={16} />
                          </button>
                        ) : (
                          <button
                            onClick={() => updateStatus(thread.id, 'locked')}
                            className="p-1.5 text-yellow-600 rounded hover:bg-yellow-50 transition-colors"
                            title="ロックする"
                          >
                            <Lock size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => deleteThread(thread.id)}
                          className="p-1.5 text-red-600 rounded hover:bg-red-50 transition-colors"
                          title="削除"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {threads.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p>スレッドがありません</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
