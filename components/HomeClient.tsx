'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { THREAD_CATEGORY_LABELS, ThreadCategory } from '@/types/database'
import { MessageSquare, PenSquare, ChevronRight, FileText } from 'lucide-react'

type TabType = 'popular' | 'new'

interface Thread {
  id: string
  thread_number: number
  title: string
  category: ThreadCategory
  created_at: string
  user_id: string
  comments_count: number
}

interface Article {
  id: string
  title: string
  slug: string
  thumbnail_url: string | null
  created_at: string
}

interface HomeClientProps {
  initialPopularThreads: Thread[]
  initialNewThreads: Thread[]
  initialWeeklyPopularThreads: Thread[]
  initialFeaturedArticles: Article[]
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

export function HomeClient({
  initialPopularThreads,
  initialNewThreads,
  initialWeeklyPopularThreads,
  initialFeaturedArticles,
}: HomeClientProps) {
  const [activeTab, setActiveTab] = useState<TabType>('popular')
  const { user } = useAuth()

  const currentThreads = activeTab === 'popular' ? initialPopularThreads : initialNewThreads

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

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column - Main Content */}
          <div className="flex-1">
            {/* Tabs - Full width 2-column */}
            <div className="flex mb-0">
              <button
                onClick={() => setActiveTab('popular')}
                className={`flex-1 py-4 text-base font-medium transition-colors relative ${
                  activeTab === 'popular'
                    ? 'bg-rose-400 text-white'
                    : 'bg-blue-50 text-cyan-600 hover:bg-blue-100'
                }`}
              >
                人気トピック
                {activeTab === 'popular' && (
                  <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-rose-400" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('new')}
                className={`flex-1 py-4 text-base font-medium transition-colors relative ${
                  activeTab === 'new'
                    ? 'bg-rose-400 text-white'
                    : 'bg-blue-50 text-cyan-600 hover:bg-blue-100'
                }`}
              >
                新着トピック
                {activeTab === 'new' && (
                  <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-rose-400" />
                )}
              </button>
            </div>

            {/* Thread List */}
            <div className="bg-white rounded-b-lg shadow-sm pt-2">
              {currentThreads.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <MessageSquare size={40} className="mx-auto mb-3 text-gray-300" />
                  <p>トピックがありません</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {currentThreads.map((thread) => (
                    <li key={thread.id}>
                      <Link
                        href={`/threads/${thread.thread_number || thread.id}`}
                        className="block px-4 py-3 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-gray-800 font-medium truncate">
                              {thread.title}
                            </h3>
                          </div>
                          <div className="flex items-center gap-4 shrink-0 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <MessageSquare size={14} />
                              {thread.comments_count || 0}
                            </span>
                            <span className="hidden sm:inline">
                              {formatDate(thread.created_at)}
                            </span>
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}

              {/* View More */}
              <div className="px-4 py-3 border-t border-gray-100">
                <Link
                  href="/threads"
                  className="flex items-center justify-center gap-1 text-rose-500 hover:text-rose-600 text-sm font-medium"
                >
                  <span>もっと見る</span>
                  <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:w-80 space-y-6">
            {/* Post Button */}
            {user ? (
              <Link
                href="/threads/new"
                className="flex items-center justify-center gap-2 w-full py-3 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors font-medium shadow-sm"
              >
                <PenSquare size={18} />
                <span>トピックを投稿する</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="flex items-center justify-center gap-2 w-full py-3 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors font-medium shadow-sm"
              >
                <PenSquare size={18} />
                <span>ログインして投稿する</span>
              </Link>
            )}

            {/* Weekly Popular Topics */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-4 py-3 border-b border-gray-100">
                <h2 className="font-bold text-gray-800">一週間の人気トピック</h2>
              </div>
              {initialWeeklyPopularThreads.length === 0 ? (
                <div className="px-4 py-6 text-center text-gray-500 text-sm">
                  まだトピックがありません
                </div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {initialWeeklyPopularThreads.map((thread, index) => (
                    <li key={thread.id}>
                      <Link
                        href={`/threads/${thread.thread_number || thread.id}`}
                        className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                      >
                        <span className="text-rose-500 font-bold text-sm">
                          {index + 1}
                        </span>
                        <span className="text-gray-700 text-sm line-clamp-2">
                          {thread.title}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Recommended Articles */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-4 py-3 border-b border-gray-100">
                <h2 className="font-bold text-gray-800">おすすめ記事</h2>
              </div>
              {initialFeaturedArticles.length === 0 ? (
                <div className="px-4 py-6 text-center text-gray-500 text-sm">
                  <FileText size={24} className="mx-auto mb-2 text-gray-300" />
                  <p>おすすめ記事がありません</p>
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  {initialFeaturedArticles.map((article) => (
                    <Link
                      key={article.id}
                      href={`/articles/${article.slug}`}
                      className="flex items-start gap-3 group"
                    >
                      {article.thumbnail_url ? (
                        <img
                          src={article.thumbnail_url}
                          alt={article.title}
                          className="w-20 object-cover rounded shrink-0"
                          style={{ aspectRatio: '1.91 / 1' }}
                        />
                      ) : (
                        <div
                          className="w-20 bg-gray-200 rounded shrink-0 flex items-center justify-center"
                          style={{ aspectRatio: '1.91 / 1' }}
                        >
                          <FileText size={16} className="text-gray-400" />
                        </div>
                      )}
                      <p className="text-sm text-gray-700 line-clamp-2 group-hover:text-rose-500 transition-colors">
                        {article.title}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
              <div className="px-4 py-3 border-t border-gray-100">
                <Link
                  href="/articles"
                  className="flex items-center gap-1 text-rose-500 hover:text-rose-600 text-sm font-medium"
                >
                  <span>記事一覧</span>
                  <ChevronRight size={16} />
                </Link>
              </div>
            </div>

            {/* Categories */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-4 py-3 border-b border-gray-100">
                <h2 className="font-bold text-gray-800">カテゴリー</h2>
              </div>
              <ul className="divide-y divide-gray-100">
                {categories.map((category) => (
                  <li key={category}>
                    <Link
                      href={`/threads?category=${category}`}
                      className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-gray-700 text-sm">
                        {THREAD_CATEGORY_LABELS[category]}
                      </span>
                      <ChevronRight size={16} className="text-gray-400" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
