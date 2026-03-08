'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import {
  Calendar,
  Clock,
  MessageSquare,
  FileText,
  Loader2,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

interface ScheduledComment {
  id: string
  thread_id: string
  body: string
  created_at: string
  user_id: string
  users?: { display_name: string | null }
  threads?: { title: string; thread_number: number }
}

interface ScheduledThread {
  id: string
  thread_number: number
  title: string
  body: string
  category: string
  created_at: string
  user_id: string
  users?: { display_name: string | null }
}

const ITEMS_PER_PAGE = 20

export default function ScheduledPostsPage() {
  const supabase = createClient()
  const [activeTab, setActiveTab] = useState<'comments' | 'threads'>('comments')
  const [comments, setComments] = useState<ScheduledComment[]>([])
  const [threads, setThreads] = useState<ScheduledThread[]>([])
  const [loading, setLoading] = useState(true)
  const [totalComments, setTotalComments] = useState(0)
  const [totalThreads, setTotalThreads] = useState(0)
  const [page, setPage] = useState(1)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [activeTab, page])

  async function fetchData() {
    setLoading(true)
    const now = new Date().toISOString()

    try {
      if (activeTab === 'comments') {
        // Get total count
        const { count } = await supabase
          .from('comments')
          .select('id', { count: 'exact', head: true })
          .gt('created_at', now)

        setTotalComments(count || 0)

        // Get paginated comments
        const from = (page - 1) * ITEMS_PER_PAGE
        const to = from + ITEMS_PER_PAGE - 1

        const { data: commentsData } = await supabase
          .from('comments')
          .select('id, thread_id, body, created_at, user_id')
          .gt('created_at', now)
          .order('created_at', { ascending: true })
          .range(from, to)

        if (commentsData && commentsData.length > 0) {
          const userIds = [...new Set(commentsData.map(c => c.user_id))]
          const threadIds = [...new Set(commentsData.map(c => c.thread_id))]

          const [usersRes, threadsRes] = await Promise.all([
            supabase.from('users').select('id, display_name').in('id', userIds),
            supabase.from('threads').select('id, title, thread_number').in('id', threadIds),
          ])

          const usersMap = new Map(usersRes.data?.map(u => [u.id, u]) || [])
          const threadsMap = new Map(threadsRes.data?.map(t => [t.id, t]) || [])

          const commentsWithData = commentsData.map(c => ({
            ...c,
            users: usersMap.get(c.user_id),
            threads: threadsMap.get(c.thread_id),
          }))

          setComments(commentsWithData)
        } else {
          setComments([])
        }
      } else {
        // Get total count for threads
        const { count } = await supabase
          .from('threads')
          .select('id', { count: 'exact', head: true })
          .gt('created_at', now)

        setTotalThreads(count || 0)

        // Get paginated threads
        const from = (page - 1) * ITEMS_PER_PAGE
        const to = from + ITEMS_PER_PAGE - 1

        const { data: threadsData } = await supabase
          .from('threads')
          .select('id, thread_number, title, body, category, created_at, user_id')
          .gt('created_at', now)
          .order('created_at', { ascending: true })
          .range(from, to)

        if (threadsData && threadsData.length > 0) {
          const userIds = [...new Set(threadsData.map(t => t.user_id))]
          const { data: usersData } = await supabase
            .from('users')
            .select('id, display_name')
            .in('id', userIds)

          const usersMap = new Map(usersData?.map(u => [u.id, u]) || [])

          const threadsWithData = threadsData.map(t => ({
            ...t,
            users: usersMap.get(t.user_id),
          }))

          setThreads(threadsWithData)
        } else {
          setThreads([])
        }
      }
    } catch (error) {
      console.error('Error fetching scheduled posts:', error)
    } finally {
      setLoading(false)
    }
  }

  async function deleteComment(id: string) {
    if (!confirm('この予約コメントを削除しますか？')) return

    setDeleting(id)
    const { error } = await supabase.from('comments').delete().eq('id', id)

    if (error) {
      console.error('Error deleting comment:', error)
      alert('削除に失敗しました')
    } else {
      fetchData()
    }
    setDeleting(null)
  }

  async function deleteThread(id: string) {
    if (!confirm('この予約スレッドを削除しますか？関連するコメントも削除されます。')) return

    setDeleting(id)
    const { error } = await supabase.from('threads').delete().eq('id', id)

    if (error) {
      console.error('Error deleting thread:', error)
      alert('削除に失敗しました')
    } else {
      fetchData()
    }
    setDeleting(null)
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString)
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  function formatRelativeTime(dateString: string) {
    const date = new Date(dateString)
    const now = new Date()
    const diff = date.getTime() - now.getTime()
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (days > 0) return `${days}日後`
    if (hours > 0) return `${hours}時間後`
    return 'まもなく'
  }

  const totalPages = Math.ceil(
    (activeTab === 'comments' ? totalComments : totalThreads) / ITEMS_PER_PAGE
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Calendar className="text-amber-500" />
          予約投稿管理
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          未来日付に設定された投稿を管理します
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-2 text-amber-600 mb-1">
            <MessageSquare size={18} />
            <span className="text-sm">予約コメント</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalComments}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-2 text-blue-600 mb-1">
            <FileText size={18} />
            <span className="text-sm">予約スレッド</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalThreads}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => { setActiveTab('comments'); setPage(1) }}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'comments'
              ? 'border-rose-500 text-rose-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          コメント ({totalComments})
        </button>
        <button
          onClick={() => { setActiveTab('threads'); setPage(1) }}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'threads'
              ? 'border-rose-500 text-rose-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          スレッド ({totalThreads})
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 size={32} className="animate-spin text-rose-500" />
          </div>
        ) : activeTab === 'comments' ? (
          comments.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              <MessageSquare size={48} className="mx-auto mb-4 text-gray-300" />
              <p>予約コメントはありません</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {comments.map((comment) => (
                <div key={comment.id} className="px-6 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 rounded">
                          <Clock size={12} />
                          {formatRelativeTime(comment.created_at)}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatDate(comment.created_at)}
                        </span>
                      </div>
                      {comment.threads && (
                        <Link
                          href={`/threads/${comment.threads.thread_number}`}
                          className="text-sm text-rose-500 hover:underline mb-1 block"
                        >
                          #{comment.threads.thread_number} {comment.threads.title}
                        </Link>
                      )}
                      <p className="text-sm text-gray-700 line-clamp-2">{comment.body}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        投稿者: {comment.users?.display_name || '匿名'}
                      </p>
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
          )
        ) : (
          threads.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              <FileText size={48} className="mx-auto mb-4 text-gray-300" />
              <p>予約スレッドはありません</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {threads.map((thread) => (
                <div key={thread.id} className="px-6 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 rounded">
                          <Clock size={12} />
                          {formatRelativeTime(thread.created_at)}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatDate(thread.created_at)}
                        </span>
                      </div>
                      <p className="font-medium text-gray-900 mb-1">
                        #{thread.thread_number} {thread.title}
                      </p>
                      <p className="text-sm text-gray-700 line-clamp-2">{thread.body}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        投稿者: {thread.users?.display_name || '匿名'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/threads/${thread.thread_number}`}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="スレッドを見る"
                      >
                        <Eye size={18} />
                      </Link>
                      <button
                        onClick={() => deleteThread(thread.id)}
                        disabled={deleting === thread.id}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="削除"
                      >
                        {deleting === thread.id ? (
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
          )
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
