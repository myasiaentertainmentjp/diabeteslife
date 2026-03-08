'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import {
  Loader2,
  Trash2,
  Eye,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Search,
} from 'lucide-react'

interface Comment {
  id: string
  body: string
  created_at: string
  thread_id: string
  user_id: string
  users?: { display_name: string | null }
  threads?: { title: string; thread_number: number }
}

const ITEMS_PER_PAGE = 20

export default function AdminCommentsPage() {
  const supabase = createClient()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchComments()
  }, [page])

  async function fetchComments() {
    setLoading(true)

    try {
      const { count } = await supabase
        .from('comments')
        .select('id', { count: 'exact', head: true })

      setTotal(count || 0)

      const from = (page - 1) * ITEMS_PER_PAGE
      const to = from + ITEMS_PER_PAGE - 1

      const { data: commentsData } = await supabase
        .from('comments')
        .select('id, body, created_at, thread_id, user_id')
        .order('created_at', { ascending: false })
        .range(from, to)

      if (commentsData && commentsData.length > 0) {
        const userIds = [...new Set(commentsData.map(c => c.user_id))]
        const threadIds = [...new Set(commentsData.map(c => c.thread_id).filter(Boolean))]

        const [usersRes, threadsRes] = await Promise.all([
          supabase.from('users').select('id, display_name').in('id', userIds),
          threadIds.length > 0
            ? supabase.from('threads').select('id, title, thread_number').in('id', threadIds)
            : Promise.resolve({ data: [] }),
        ])

        const usersMap = new Map(usersRes.data?.map(u => [u.id, u]) || [])
        const threadsMap = new Map(threadsRes.data?.map(t => [t.id, t]) || [])

        const commentsWithData = commentsData.map(c => ({
          ...c,
          users: usersMap.get(c.user_id),
          threads: c.thread_id ? threadsMap.get(c.thread_id) : undefined,
        }))

        setComments(commentsWithData as Comment[])
      } else {
        setComments([])
      }
    } catch (error) {
      console.error('Error fetching comments:', error)
    } finally {
      setLoading(false)
    }
  }

  async function searchComments() {
    if (!searchQuery.trim()) {
      fetchComments()
      return
    }

    setLoading(true)
    try {
      const { data: commentsData, count } = await supabase
        .from('comments')
        .select('id, body, created_at, thread_id, user_id', { count: 'exact' })
        .ilike('body', `%${searchQuery}%`)
        .order('created_at', { ascending: false })
        .limit(ITEMS_PER_PAGE)

      setTotal(count || 0)

      if (commentsData && commentsData.length > 0) {
        const userIds = [...new Set(commentsData.map(c => c.user_id))]
        const threadIds = [...new Set(commentsData.map(c => c.thread_id).filter(Boolean))]

        const [usersRes, threadsRes] = await Promise.all([
          supabase.from('users').select('id, display_name').in('id', userIds),
          threadIds.length > 0
            ? supabase.from('threads').select('id, title, thread_number').in('id', threadIds)
            : Promise.resolve({ data: [] }),
        ])

        const usersMap = new Map(usersRes.data?.map(u => [u.id, u]) || [])
        const threadsMap = new Map(threadsRes.data?.map(t => [t.id, t]) || [])

        const commentsWithData = commentsData.map(c => ({
          ...c,
          users: usersMap.get(c.user_id),
          threads: c.thread_id ? threadsMap.get(c.thread_id) : undefined,
        }))

        setComments(commentsWithData as Comment[])
      } else {
        setComments([])
      }
    } catch (error) {
      console.error('Error searching comments:', error)
    } finally {
      setLoading(false)
    }
  }

  async function deleteComment(id: string) {
    if (!confirm('このコメントを削除しますか？')) return

    setDeleting(id)
    const { error } = await supabase.from('comments').delete().eq('id', id)

    if (error) {
      console.error('Error deleting comment:', error)
      alert('削除に失敗しました')
    } else {
      fetchComments()
    }
    setDeleting(null)
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString)
    const now = new Date()
    if (date > now) {
      return `予約: ${date.toLocaleString('ja-JP', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}`
    }
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <MessageCircle className="text-orange-500" />
          コメント管理
        </h1>
        <span className="text-sm text-gray-500">{total}件</span>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && searchComments()}
            placeholder="コメント内容で検索..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
          <button
            onClick={searchComments}
            className="px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
          >
            <Search size={18} />
          </button>
        </div>
      </div>

      {/* Comment List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 size={32} className="animate-spin text-rose-500" />
          </div>
        ) : comments.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500">
            <MessageCircle size={48} className="mx-auto mb-4 text-gray-300" />
            <p>コメントがありません</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {comments.map((comment) => (
              <div key={comment.id} className="px-6 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {comment.threads && (
                      <Link
                        href={`/threads/${comment.threads.thread_number}`}
                        className="text-sm text-rose-500 hover:underline mb-1 block"
                      >
                        #{comment.threads.thread_number} {comment.threads.title}
                      </Link>
                    )}
                    <p className="text-gray-700 line-clamp-3">{comment.body}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                      <span>{comment.users?.display_name || '匿名'}</span>
                      <span>{formatDate(comment.created_at)}</span>
                      {new Date(comment.created_at) > new Date() && (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded">
                          予約
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {comment.threads && (
                      <Link
                        href={`/threads/${comment.threads.thread_number}`}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="スレッドを見る"
                      >
                        <Eye size={18} />
                      </Link>
                    )}
                    <button
                      onClick={() => deleteComment(comment.id)}
                      disabled={deleting === comment.id}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="削除"
                    >
                      {deleting === comment.id ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <Trash2 size={18} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
