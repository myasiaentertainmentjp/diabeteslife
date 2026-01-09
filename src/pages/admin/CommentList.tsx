import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useToast } from '../../contexts/ToastContext'
import { CommentStatus, COMMENT_STATUS_LABELS } from '../../types/database'
import { Loader2, Eye, EyeOff, Trash2 } from 'lucide-react'

interface CommentWithRelations {
  id: string
  thread_id: string
  user_id: string
  content?: string
  body?: string
  status: CommentStatus
  created_at: string
  users?: { display_name: string | null; email: string }
  threads?: { id: string; title: string }
}

const STATUSES: CommentStatus[] = ['visible', 'hidden']

export function AdminCommentList() {
  const { showToast } = useToast()
  const [comments, setComments] = useState<CommentWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<CommentStatus | ''>('')

  useEffect(() => {
    fetchComments()
  }, [statusFilter])

  async function fetchComments() {
    setLoading(true)

    // 10秒タイムアウト
    const timeoutPromise = new Promise<null>((resolve) => {
      setTimeout(() => resolve(null), 10000)
    })

    try {
      // まずコメントを取得
      let query = supabase
        .from('comments')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)

      if (statusFilter) {
        query = query.eq('status', statusFilter)
      }

      const result = await Promise.race([query, timeoutPromise])

      if (result === null) {
        console.warn('Fetch comments timeout')
        showToast('コメントの取得がタイムアウトしました', 'error')
        setComments([])
        return
      }

      if (result.error) {
        console.error('Error fetching comments:', result.error)
        if (!result.error.message.includes('Could not find')) {
          showToast('コメントの取得に失敗しました', 'error')
        }
        setComments([])
        return
      }

      if (!result.data || result.data.length === 0) {
        setComments([])
        return
      }

      // ユーザー情報を取得
      const userIds = [...new Set(result.data.map((c: any) => c.user_id))]
      const { data: usersData } = await supabase
        .from('users')
        .select('id, display_name, email')
        .in('id', userIds)

      const usersMap = new Map(usersData?.map((u: any) => [u.id, u]) || [])

      // スレッド情報を取得
      const threadIds = [...new Set(result.data.map((c: any) => c.thread_id).filter(Boolean))]
      let threadsMap = new Map()
      if (threadIds.length > 0) {
        const { data: threadsData } = await supabase
          .from('threads')
          .select('id, title')
          .in('id', threadIds)
        threadsMap = new Map(threadsData?.map((t: any) => [t.id, t]) || [])
      }

      // データを結合
      const commentsWithRelations = result.data.map((comment: any) => ({
        ...comment,
        users: usersMap.get(comment.user_id) || null,
        threads: threadsMap.get(comment.thread_id) || null,
      }))

      setComments(commentsWithRelations as CommentWithRelations[])
    } catch (error) {
      console.error('Error fetching comments:', error)
      setComments([])
    } finally {
      setLoading(false)
    }
  }

  async function toggleVisibility(comment: CommentWithRelations) {
    const newStatus: CommentStatus = comment.status === 'visible' ? 'hidden' : 'visible'

    const { error } = await supabase
      .from('comments')
      .update({ status: newStatus, updated_at: new Date().toISOString() } as never)
      .eq('id', comment.id)

    if (error) {
      console.error('Error updating comment:', error)
      showToast('更新に失敗しました', 'error')
    } else {
      setComments((prev) =>
        prev.map((c) => (c.id === comment.id ? { ...c, status: newStatus } : c))
      )
      showToast(
        newStatus === 'visible' ? 'コメントを表示しました' : 'コメントを非表示にしました',
        'success'
      )
    }
  }

  async function deleteComment(comment: CommentWithRelations) {
    if (!confirm('このコメントを削除しますか？')) return

    const { error } = await supabase.from('comments').delete().eq('id', comment.id)

    if (error) {
      console.error('Error deleting comment:', error)
      showToast('削除に失敗しました', 'error')
    } else {
      // Update thread comment count
      if (comment.threads) {
        await supabase.rpc('decrement_comments_count', { thread_id: comment.thread_id })
      }
      setComments((prev) => prev.filter((c) => c.id !== comment.id))
      showToast('コメントを削除しました', 'success')
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  function truncateText(text: string | null | undefined, maxLength: number) {
    if (!text) return ''
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text
  }

  function getCommentContent(comment: CommentWithRelations) {
    return (comment as any).body || comment.content || ''
  }

  function getStatusBadge(status: CommentStatus) {
    const styles = {
      visible: 'bg-rose-100 text-rose-600',
      hidden: 'bg-red-100 text-red-700',
    }
    return (
      <span className={`px-2 py-1 text-xs rounded ${styles[status]}`}>
        {COMMENT_STATUS_LABELS[status]}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">コメント管理</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as CommentStatus | '')}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
        >
          <option value="">全状態</option>
          {STATUSES.map((status) => (
            <option key={status} value={status}>
              {COMMENT_STATUS_LABELS[status]}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 size={32} className="animate-spin text-rose-500" />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left font-medium text-gray-600">本文</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">投稿者</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">スレッド</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-600">状態</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">作成日</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {comments.map((comment, index) => (
                  <tr
                    key={comment.id}
                    className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}
                  >
                    <td className="px-4 py-3">
                      <div className="max-w-xs text-gray-900">
                        {truncateText(getCommentContent(comment), 30)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-gray-900">
                        {comment.users?.display_name || '匿名'}
                      </div>
                      <div className="text-xs text-gray-500">{comment.users?.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="max-w-[200px] truncate text-gray-700">
                        {comment.threads?.title || '削除済み'}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">{getStatusBadge(comment.status)}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {formatDate(comment.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {comment.status === 'visible' ? (
                          <button
                            onClick={() => toggleVisibility(comment)}
                            className="p-1.5 text-red-600 rounded hover:bg-red-50 transition-colors"
                            title="非表示にする"
                          >
                            <EyeOff size={16} />
                          </button>
                        ) : (
                          <button
                            onClick={() => toggleVisibility(comment)}
                            className="p-1.5 text-rose-500 rounded hover:bg-rose-50 transition-colors"
                            title="表示する"
                          >
                            <Eye size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => deleteComment(comment)}
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

          {comments.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p>コメントがありません</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
