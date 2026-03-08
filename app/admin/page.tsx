'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { THREAD_CATEGORY_LABELS, ThreadCategory } from '@/types/database'
import { Users, FileText, MessageSquare, BookOpen, Loader2, ArrowRight } from 'lucide-react'

interface Stats {
  totalUsers: number
  totalThreads: number
  totalComments: number
  totalArticles: number
  scheduledPosts: number
}

interface RecentThread {
  id: string
  thread_number: number
  title: string
  category: ThreadCategory
  created_at: string
  user_id: string
  users?: { display_name: string | null }
}

interface RecentComment {
  id: string
  body: string
  created_at: string
  thread_id: string
  user_id: string
  users?: { display_name: string | null }
  threads?: { title: string; thread_number: number }
}

export default function AdminDashboard() {
  const supabase = createClient()
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalThreads: 0,
    totalComments: 0,
    totalArticles: 0,
    scheduledPosts: 0,
  })
  const [recentThreads, setRecentThreads] = useState<RecentThread[]>([])
  const [recentComments, setRecentComments] = useState<RecentComment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    const now = new Date().toISOString()

    try {
      const [usersResult, threadsResult, commentsResult, articlesResult, scheduledResult] = await Promise.all([
        supabase.from('users').select('id', { count: 'exact', head: true }),
        supabase.from('threads').select('id', { count: 'exact', head: true }),
        supabase.from('comments').select('id', { count: 'exact', head: true }),
        supabase.from('articles').select('id', { count: 'exact', head: true }),
        supabase.from('comments').select('id', { count: 'exact', head: true }).gt('created_at', now),
      ])

      setStats({
        totalUsers: usersResult.count || 0,
        totalThreads: threadsResult.count || 0,
        totalComments: commentsResult.count || 0,
        totalArticles: articlesResult.count || 0,
        scheduledPosts: scheduledResult.count || 0,
      })

      // Fetch recent threads
      const { data: threads } = await supabase
        .from('threads')
        .select('id, thread_number, title, category, created_at, user_id')
        .order('created_at', { ascending: false })
        .limit(5)

      if (threads && threads.length > 0) {
        const userIds = [...new Set(threads.map(t => t.user_id))]
        const { data: usersData } = await supabase
          .from('users')
          .select('id, display_name')
          .in('id', userIds)

        const usersMap = new Map(usersData?.map(u => [u.id, u]) || [])
        const threadsWithUsers = threads.map(thread => ({
          ...thread,
          users: usersMap.get(thread.user_id) || { display_name: null }
        }))

        setRecentThreads(threadsWithUsers as RecentThread[])
      }

      // Fetch recent comments
      const { data: comments } = await supabase
        .from('comments')
        .select('id, body, created_at, thread_id, user_id')
        .order('created_at', { ascending: false })
        .limit(5)

      if (comments && comments.length > 0) {
        const userIds = [...new Set(comments.map(c => c.user_id))]
        const threadIds = [...new Set(comments.map(c => c.thread_id).filter(Boolean))]

        const [usersData, threadsData] = await Promise.all([
          supabase.from('users').select('id, display_name').in('id', userIds),
          threadIds.length > 0
            ? supabase.from('threads').select('id, title, thread_number').in('id', threadIds)
            : Promise.resolve({ data: [] })
        ])

        const usersMap = new Map(usersData.data?.map(u => [u.id, u]) || [])
        const threadsMap = new Map(threadsData.data?.map(t => [t.id, t]) || [])

        const commentsWithData = comments.map(comment => ({
          ...comment,
          users: usersMap.get(comment.user_id) || { display_name: null },
          threads: comment.thread_id ? threadsMap.get(comment.thread_id) || null : null
        }))

        setRecentComments(commentsWithData as RecentComment[])
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  function formatRelativeTime(dateString: string) {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (diff < 0) return '予約中'
    if (minutes < 1) return 'たった今'
    if (minutes < 60) return `${minutes}分前`
    if (hours < 24) return `${hours}時間前`
    if (days < 7) return `${days}日前`
    return date.toLocaleDateString('ja-JP')
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 size={32} className="animate-spin text-rose-500" />
      </div>
    )
  }

  const statCards = [
    { label: '総ユーザー数', value: stats.totalUsers, icon: Users, color: 'bg-blue-500' },
    { label: '総スレッド数', value: stats.totalThreads, icon: MessageSquare, color: 'bg-rose-500' },
    { label: '総コメント数', value: stats.totalComments, icon: FileText, color: 'bg-orange-500' },
    { label: '公開記事数', value: stats.totalArticles, icon: BookOpen, color: 'bg-purple-500' },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${card.color}`}>
                <card.icon size={24} className="text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{card.value.toLocaleString()}</p>
                <p className="text-sm text-gray-500">{card.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Scheduled Posts Alert */}
      {stats.scheduledPosts > 0 && (
        <Link
          href="/admin/scheduled"
          className="block bg-amber-50 border border-amber-200 rounded-lg p-4 hover:bg-amber-100 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-amber-800">予約投稿があります</p>
              <p className="text-sm text-amber-600">{stats.scheduledPosts}件の予約コメント</p>
            </div>
            <ArrowRight className="text-amber-600" />
          </div>
        </Link>
      )}

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Threads */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="font-bold text-gray-900">最新スレッド</h2>
            <Link
              href="/admin/threads"
              className="flex items-center gap-1 text-sm text-rose-500 hover:underline"
            >
              すべて見る
              <ArrowRight size={14} />
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {recentThreads.length > 0 ? (
              recentThreads.map((thread) => (
                <Link
                  key={thread.id}
                  href={`/threads/${thread.thread_number}`}
                  className="block px-6 py-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 truncate">{thread.title}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                        <span className="px-2 py-0.5 bg-gray-100 rounded">
                          {THREAD_CATEGORY_LABELS[thread.category] || thread.category}
                        </span>
                        <span>{thread.users?.display_name || '匿名'}</span>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {formatRelativeTime(thread.created_at)}
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <p className="px-6 py-4 text-gray-500 text-sm">スレッドがありません</p>
            )}
          </div>
        </div>

        {/* Recent Comments */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="font-bold text-gray-900">最新コメント</h2>
            <Link
              href="/admin/comments"
              className="flex items-center gap-1 text-sm text-rose-500 hover:underline"
            >
              すべて見る
              <ArrowRight size={14} />
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {recentComments.length > 0 ? (
              recentComments.map((comment) => (
                <Link
                  key={comment.id}
                  href={comment.threads ? `/threads/${comment.threads.thread_number}` : '#'}
                  className="block px-6 py-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-gray-700 line-clamp-1">{comment.body}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                        <span>{comment.users?.display_name || '匿名'}</span>
                        <span className="text-gray-300">•</span>
                        <span className="truncate">{comment.threads?.title || '削除済み'}</span>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {formatRelativeTime(comment.created_at)}
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <p className="px-6 py-4 text-gray-500 text-sm">コメントがありません</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
