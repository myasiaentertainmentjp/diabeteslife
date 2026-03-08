'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { THREAD_CATEGORY_LABELS, ThreadCategory } from '@/types/database'
import {
  Loader2,
  Trash2,
  Eye,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Search,
} from 'lucide-react'

interface Thread {
  id: string
  thread_number: number
  title: string
  body: string
  category: ThreadCategory
  created_at: string
  user_id: string
  comment_count: number
  users?: { display_name: string | null }
}

const ITEMS_PER_PAGE = 20

export default function AdminThreadsPage() {
  const supabase = createClient()
  const [threads, setThreads] = useState<Thread[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('')

  useEffect(() => {
    fetchThreads()
  }, [page, categoryFilter])

  async function fetchThreads() {
    setLoading(true)

    try {
      let query = supabase
        .from('threads')
        .select('id', { count: 'exact', head: true })

      if (categoryFilter) {
        query = query.eq('category', categoryFilter)
      }

      const { count } = await query
      setTotal(count || 0)

      const from = (page - 1) * ITEMS_PER_PAGE
      const to = from + ITEMS_PER_PAGE - 1

      let dataQuery = supabase
        .from('threads')
        .select('id, thread_number, title, body, category, created_at, user_id, comment_count')
        .order('created_at', { ascending: false })
        .range(from, to)

      if (categoryFilter) {
        dataQuery = dataQuery.eq('category', categoryFilter)
      }

      const { data: threadsData } = await dataQuery

      if (threadsData && threadsData.length > 0) {
        const userIds = [...new Set(threadsData.map(t => t.user_id))]
        const { data: usersData } = await supabase
          .from('users')
          .select('id, display_name')
          .in('id', userIds)

        const usersMap = new Map(usersData?.map(u => [u.id, u]) || [])

        const threadsWithUsers = threadsData.map(t => ({
          ...t,
          users: usersMap.get(t.user_id),
        }))

        setThreads(threadsWithUsers)
      } else {
        setThreads([])
      }
    } catch (error) {
      console.error('Error fetching threads:', error)
    } finally {
      setLoading(false)
    }
  }

  async function searchThreads() {
    if (!searchQuery.trim()) {
      fetchThreads()
      return
    }

    setLoading(true)
    try {
      const { data: threadsData, count } = await supabase
        .from('threads')
        .select('id, thread_number, title, body, category, created_at, user_id, comment_count', { count: 'exact' })
        .or(`title.ilike.%${searchQuery}%,body.ilike.%${searchQuery}%`)
        .order('created_at', { ascending: false })
        .limit(ITEMS_PER_PAGE)

      setTotal(count || 0)

      if (threadsData && threadsData.length > 0) {
        const userIds = [...new Set(threadsData.map(t => t.user_id))]
        const { data: usersData } = await supabase
          .from('users')
          .select('id, display_name')
          .in('id', userIds)

        const usersMap = new Map(usersData?.map(u => [u.id, u]) || [])

        const threadsWithUsers = threadsData.map(t => ({
          ...t,
          users: usersMap.get(t.user_id),
        }))

        setThreads(threadsWithUsers)
      } else {
        setThreads([])
      }
    } catch (error) {
      console.error('Error searching threads:', error)
    } finally {
      setLoading(false)
    }
  }

  async function deleteThread(id: string) {
    if (!confirm('このスレッドを削除しますか？関連するコメントも削除されます。')) return

    setDeleting(id)
    const { error } = await supabase.from('threads').delete().eq('id', id)

    if (error) {
      console.error('Error deleting thread:', error)
      alert('削除に失敗しました')
    } else {
      fetchThreads()
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
    })
  }

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <MessageSquare className="text-rose-500" />
          スレッド管理
        </h1>
        <span className="text-sm text-gray-500">{total}件</span>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchThreads()}
              placeholder="タイトルまたは本文で検索..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
            <button
              onClick={searchThreads}
              className="px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
            >
              <Search size={18} />
            </button>
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(1) }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            <option value="">すべてのカテゴリ</option>
            {Object.entries(THREAD_CATEGORY_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Thread List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 size={32} className="animate-spin text-rose-500" />
          </div>
        ) : threads.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500">
            <MessageSquare size={48} className="mx-auto mb-4 text-gray-300" />
            <p>スレッドがありません</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {threads.map((thread) => (
              <div key={thread.id} className="px-6 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm text-gray-500">#{thread.thread_number}</span>
                      <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded">
                        {THREAD_CATEGORY_LABELS[thread.category]}
                      </span>
                      {new Date(thread.created_at) > new Date() && (
                        <span className="px-2 py-0.5 text-xs bg-amber-100 text-amber-700 rounded">
                          予約
                        </span>
                      )}
                    </div>
                    <Link
                      href={`/threads/${thread.thread_number}`}
                      className="font-medium text-gray-900 hover:text-rose-500 transition-colors"
                    >
                      {thread.title}
                    </Link>
                    <p className="text-sm text-gray-500 line-clamp-1 mt-1">{thread.body}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                      <span>{thread.users?.display_name || '匿名'}</span>
                      <span>{formatDate(thread.created_at)}</span>
                      <span>{thread.comment_count || 0}件のコメント</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/threads/${thread.thread_number}`}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="表示"
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
