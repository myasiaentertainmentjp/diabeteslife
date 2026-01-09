import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { ThreadWithUser, THREAD_CATEGORY_LABELS, ThreadCategory, Article } from '../types/database'
import { PopularKeywords } from '../components/PopularKeywords'
import { HeroSlider } from '../components/HeroSlider'
import { Search, MessageSquare, PenSquare, ChevronRight, Loader2, FileText } from 'lucide-react'

type TabType = 'popular' | 'new'

const categories: ThreadCategory[] = ['food_recipe', 'treatment', 'exercise_lifestyle', 'mental_concerns', 'complications_prevention', 'chat_other']

export function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('popular')
  const [threads, setThreads] = useState<ThreadWithUser[]>([])
  const [popularThreads, setPopularThreads] = useState<ThreadWithUser[]>([])
  const [featuredArticles, setFeaturedArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  const { user } = useAuth()
  const navigate = useNavigate()

  // 初回マウント時にサイドバーのデータを取得
  useEffect(() => {
    fetchPopularThreads()
    fetchFeaturedArticles()
  }, [])

  // タブ切り替え時（初回含む）にメインコンテンツを取得
  useEffect(() => {
    fetchThreads()
  }, [activeTab])

  async function fetchThreads() {
    setLoading(true)

    // 10秒タイムアウト
    const timeoutPromise = new Promise<null>((resolve) => {
      setTimeout(() => resolve(null), 10000)
    })

    try {
      const queryPromise = supabase
        .from('threads')
        .select('id, title, category, created_at, user_id')
        .order('created_at', { ascending: false })
        .limit(10)

      const result = await Promise.race([queryPromise, timeoutPromise])

      if (result === null) {
        console.warn('Fetch threads timeout')
        setThreads([])
      } else if (result.error) {
        console.error('Error fetching threads:', result.error)
        setThreads([])
      } else {
        setThreads((result.data || []) as unknown as ThreadWithUser[])
      }
    } catch (error) {
      console.error('Error fetching threads:', error)
      setThreads([])
    } finally {
      setLoading(false)
    }
  }

  async function fetchPopularThreads() {
    const timeoutPromise = new Promise<null>((resolve) => {
      setTimeout(() => resolve(null), 10000)
    })

    try {
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

      const queryPromise = supabase
        .from('threads')
        .select('id, title, category, created_at, user_id')
        .gte('created_at', oneWeekAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(5)

      const result = await Promise.race([queryPromise, timeoutPromise])

      if (result === null) {
        console.warn('Fetch popular threads timeout')
        setPopularThreads([])
      } else if (result.error) {
        console.error('Error fetching popular threads:', result.error)
        setPopularThreads([])
      } else {
        setPopularThreads((result.data || []) as unknown as ThreadWithUser[])
      }
    } catch (error) {
      console.error('Error fetching popular threads:', error)
      setPopularThreads([])
    }
  }

  async function fetchFeaturedArticles() {
    const timeoutPromise = new Promise<null>((resolve) => {
      setTimeout(() => resolve(null), 10000)
    })

    try {
      const queryPromise = supabase
        .from('articles')
        .select('id, title, slug, thumbnail_url, created_at')
        .order('created_at', { ascending: false })
        .limit(5)

      const result = await Promise.race([queryPromise, timeoutPromise])

      if (result === null) {
        console.warn('Fetch articles timeout')
        setFeaturedArticles([])
      } else if (result.error) {
        console.error('Error fetching featured articles:', result.error)
        setFeaturedArticles([])
      } else {
        setFeaturedArticles((result.data || []) as Article[])
      }
    } catch (error) {
      console.error('Error fetching featured articles:', error)
      setFeaturedArticles([])
    }
  }

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

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  return (
    <div className="bg-rose-50 min-h-screen">
      {/* Hero Slider */}
      <HeroSlider />

      {/* Search Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <form onSubmit={handleSearch} className="relative max-w-md mx-auto">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="キーワードで検索..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-full text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none shadow-sm"
            />
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          </form>
        </div>
      </div>

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
                今日の人気トピック
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
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 size={28} className="animate-spin text-rose-500" />
                </div>
              ) : threads.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <MessageSquare size={40} className="mx-auto mb-3 text-gray-300" />
                  <p>トピックがありません</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {threads.map((thread) => (
                    <li key={thread.id}>
                      <Link
                        to={`/threads/${thread.id}`}
                        className="block px-4 py-3 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-gray-800 font-medium truncate">
                              {thread.title}
                            </h3>
                          </div>
                          <div className="flex items-center gap-4 shrink-0 text-sm text-gray-500">
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
                  to="/threads"
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
                to="/threads/new"
                className="flex items-center justify-center gap-2 w-full py-3 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors font-medium shadow-sm"
              >
                <PenSquare size={18} />
                <span>トピックを投稿する</span>
              </Link>
            ) : (
              <Link
                to="/login"
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
              {popularThreads.length === 0 ? (
                <div className="px-4 py-6 text-center text-gray-500 text-sm">
                  まだトピックがありません
                </div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {popularThreads.map((thread, index) => (
                    <li key={thread.id}>
                      <Link
                        to={`/threads/${thread.id}`}
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
              {featuredArticles.length === 0 ? (
                <div className="px-4 py-6 text-center text-gray-500 text-sm">
                  <FileText size={24} className="mx-auto mb-2 text-gray-300" />
                  <p>おすすめ記事がありません</p>
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  {featuredArticles.map((article) => (
                    <Link
                      key={article.id}
                      to={`/articles/${article.slug}`}
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
                        <div className="w-20 bg-gray-200 rounded shrink-0 flex items-center justify-center" style={{ aspectRatio: '1.91 / 1' }}>
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
                  to="/articles"
                  className="flex items-center gap-1 text-rose-500 hover:text-rose-600 text-sm font-medium"
                >
                  <span>記事一覧</span>
                  <ChevronRight size={16} />
                </Link>
              </div>
            </div>

            {/* Popular Keywords */}
            <PopularKeywords />

            {/* Categories */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-4 py-3 border-b border-gray-100">
                <h2 className="font-bold text-gray-800">カテゴリー</h2>
              </div>
              <ul className="divide-y divide-gray-100">
                {categories.map((category) => (
                  <li key={category}>
                    <Link
                      to={`/threads?category=${category}`}
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
