'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import {
  THREAD_CATEGORY_LABELS,
  THREAD_CATEGORY_COLORS,
  ThreadCategory,
} from '@/types/database'
import { MessageSquare, PenSquare, ChevronLeft, ChevronRight, Filter } from 'lucide-react'

interface Thread {
  id: string
  thread_number: number
  title: string
  category: string
  created_at: string
  user_id: string
  comments_count: number
}

interface ThreadListClientProps {
  initialThreads: Thread[]
  totalPages: number
  currentPage: number
  category?: string
}

const categories: ThreadCategory[] = [
  'todays_meal',
  'food_recipe',
  'treatment',
  'exercise_lifestyle',
  'mental_concerns',
  'complications_prevention',
  'chat_other',
]

export function ThreadListClient({
  initialThreads,
  totalPages,
  currentPage,
  category,
}: ThreadListClientProps) {
  const { user } = useAuth()
  const router = useRouter()

  function formatDate(dateString: string) {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const diffHours = Math.floor(diff / (1000 * 60 * 60))
    const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (diffHours < 1) return 'たった今'
    if (diffHours < 24) return `${diffHours}時間前`
    if (diffDays < 7) return `${diffDays}日前`

    return date.toLocaleDateString('ja-JP', {
      month: 'numeric',
      day: 'numeric',
    })
  }

  function handleCategoryChange(cat: string | undefined) {
    if (cat) {
      router.push(`/threads?category=${cat}`)
    } else {
      router.push('/threads')
    }
  }

  function handlePageChange(page: number) {
    const params = new URLSearchParams()
    if (category) params.set('category', category)
    params.set('page', page.toString())
    router.push(`/threads?${params.toString()}`)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Content */}
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">
              {category
                ? THREAD_CATEGORY_LABELS[category as ThreadCategory]
                : 'トピック一覧'}
            </h1>
            {user && (
              <Link
                href="/threads/new"
                className="flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors font-medium"
              >
                <PenSquare size={18} />
                <span>新規投稿</span>
              </Link>
            )}
          </div>

          {/* Category Filter */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Filter size={16} className="text-gray-500" />
              <span className="text-sm font-medium text-gray-700">カテゴリー</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleCategoryChange(undefined)}
                className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                  !category
                    ? 'bg-rose-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                すべて
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                    category === cat
                      ? 'bg-rose-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {THREAD_CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>
          </div>

          {/* Thread List */}
          <div className="bg-white rounded-lg shadow-sm">
            {initialThreads.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <MessageSquare size={40} className="mx-auto mb-3 text-gray-300" />
                <p>トピックがありません</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {initialThreads.map((thread) => (
                  <li key={thread.id}>
                    <Link
                      href={`/threads/${thread.thread_number || thread.id}`}
                      className="block px-4 py-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`px-2 py-0.5 text-xs font-medium rounded ${
                                THREAD_CATEGORY_COLORS[thread.category as ThreadCategory]
                              }`}
                            >
                              {THREAD_CATEGORY_LABELS[thread.category as ThreadCategory]}
                            </span>
                          </div>
                          <h3 className="text-gray-800 font-medium">{thread.title}</h3>
                        </div>
                        <div className="flex items-center gap-4 shrink-0 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <MessageSquare size={14} />
                            {thread.comments_count || 0}
                          </span>
                          <span>{formatDate(thread.created_at)}</span>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 px-4 py-4 border-t border-gray-100">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="text-sm text-gray-600">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
