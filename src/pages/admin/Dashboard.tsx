import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { Users, FileText, MessageSquare, BookOpen, Loader2, ArrowRight } from 'lucide-react'
import { THREAD_CATEGORY_LABELS, ThreadCategory } from '../../types/database'

interface Stats {
  totalUsers: number
  totalThreads: number
  totalComments: number
  totalArticles: number
}

interface RecentThread {
  id: string
  title: string
  category: ThreadCategory
  created_at: string
  user_id: string
  users?: { display_name: string | null }
}

interface RecentComment {
  id: string
  content: string
  created_at: string
  thread_id: string
  user_id: string
  users?: { display_name: string | null }
  threads?: { title: string }
}

export function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalThreads: 0,
    totalComments: 0,
    totalArticles: 0,
  })
  const [recentThreads, setRecentThreads] = useState<RecentThread[]>([])
  const [recentComments, setRecentComments] = useState<RecentComment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)

    try {
      // Fetch counts with error handling for each
      const [usersResult, threadsResult, commentsResult, articlesResult] = await Promise.all([
        supabase.from('users').select('id', { count: 'exact', head: true }).catch(() => ({ count: 0 })),
        supabase.from('threads').select('id', { count: 'exact', head: true }).catch(() => ({ count: 0 })),
        supabase.from('comments').select('id', { count: 'exact', head: true }).catch(() => ({ count: 0 })),
        supabase.from('articles').select('id', { count: 'exact', head: true }).eq('is_published', true).catch(() => ({ count: 0 })),
      ])

      setStats({
        totalUsers: (usersResult as { count: number | null }).count || 0,
        totalThreads: (threadsResult as { count: number | null }).count || 0,
        totalComments: (commentsResult as { count: number | null }).count || 0,
        totalArticles: (articlesResult as { count: number | null }).count || 0,
      })

      // Fetch recent threads with error handling
      try {
        const { data: threads } = await supabase
          .from('threads')
          .select(`id, title, category, created_at, user_id, users:user_id(display_name)`)
          .order('created_at', { ascending: false })
          .limit(5)

        if (threads) {
          setRecentThreads(threads as unknown as RecentThread[])
        }
      } catch (e) {
        console.error('Error fetching recent threads:', e)
      }

      // Fetch recent comments with error handling
      try {
        const { data: comments } = await supabase
          .from('comments')
          .select(`id, content, created_at, thread_id, user_id, users:user_id(display_name), threads:thread_id(title)`)
          .order('created_at', { ascending: false })
          .limit(5)

        if (comments) {
          setRecentComments(comments as unknown as RecentComment[])
        }
      } catch (e) {
        console.error('Error fetching recent comments:', e)
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

    if (minutes < 1) return 'たった今'
    if (minutes < 60) return `${minutes}分前`
    if (hours < 24) return `${hours}時間前`
    if (days < 7) return `${days}日前`
    return date.toLocaleDateString('ja-JP')
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 size={32} className="animate-spin text-green-600" />
      </div>
    )
  }

  const statCards = [
    { label: '総ユーザー数', value: stats.totalUsers, icon: Users, color: 'bg-blue-500' },
    { label: '総スレッド数', value: stats.totalThreads, icon: MessageSquare, color: 'bg-green-500' },
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

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Threads */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="font-bold text-gray-900">最新スレッド</h2>
            <Link
              to="/admin/threads"
              className="flex items-center gap-1 text-sm text-green-600 hover:underline"
            >
              すべて見る
              <ArrowRight size={14} />
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {recentThreads.length > 0 ? (
              recentThreads.map((thread) => (
                <div key={thread.id} className="px-6 py-3">
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
                </div>
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
              to="/admin/comments"
              className="flex items-center gap-1 text-sm text-green-600 hover:underline"
            >
              すべて見る
              <ArrowRight size={14} />
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {recentComments.length > 0 ? (
              recentComments.map((comment) => (
                <div key={comment.id} className="px-6 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-gray-700 line-clamp-1">{comment.content}</p>
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
                </div>
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
