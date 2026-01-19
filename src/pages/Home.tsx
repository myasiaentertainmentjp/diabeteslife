import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { ThreadWithUser, THREAD_CATEGORY_LABELS, ThreadCategory, Article } from '../types/database'
import { PopularKeywords } from '../components/PopularKeywords'
import { HeroSlider } from '../components/HeroSlider'
import { Search, MessageSquare, PenSquare, ChevronRight, FileText } from 'lucide-react'

type TabType = 'popular' | 'new'

const categories: ThreadCategory[] = ['todays_meal', 'food_recipe', 'treatment', 'exercise_lifestyle', 'mental_concerns', 'complications_prevention', 'chat_other']

// スケルトンローディング
function ThreadSkeleton() {
  return (
    <div className="animate-pulse">
      {[...Array(10)].map((_, i) => (
        <div key={i} className="px-4 py-3 border-b border-gray-100 last:border-b-0">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      ))}
    </div>
  )
}

function SidebarSkeleton() {
  return (
    <div className="animate-pulse px-4 py-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-start gap-3 py-2">
          <div className="w-4 h-4 bg-gray-200 rounded shrink-0"></div>
          <div className="h-3 bg-gray-200 rounded flex-1"></div>
        </div>
      ))}
    </div>
  )
}

function ArticleSkeleton() {
  return (
    <div className="animate-pulse p-4 space-y-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-start gap-3">
          <div className="w-20 bg-gray-200 rounded shrink-0" style={{ aspectRatio: '1.91 / 1' }}></div>
          <div className="flex-1 space-y-1">
            <div className="h-3 bg-gray-200 rounded w-full"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('popular')
  // 人気トピック用と新着トピック用を別々に管理
  const [popularThreads, setPopularThreads] = useState<ThreadWithUser[]>([])
  const [newThreads, setNewThreads] = useState<ThreadWithUser[]>([])
  // サイドバー用の1週間人気トピック
  const [weeklyPopularThreads, setWeeklyPopularThreads] = useState<ThreadWithUser[]>([])
  const [featuredArticles, setFeaturedArticles] = useState<Article[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  // 個別のローディング状態
  const [loadingPopular, setLoadingPopular] = useState(true)
  const [loadingNew, setLoadingNew] = useState(true)
  const [loadingWeekly, setLoadingWeekly] = useState(true)
  const [loadingArticles, setLoadingArticles] = useState(true)

  const { user } = useAuth()
  const navigate = useNavigate()

  // 初回マウント時に全データを取得
  useEffect(() => {
    fetchPopularThreads()
    fetchNewThreads()
    fetchWeeklyPopularThreads()
    fetchFeaturedArticles()
  }, [])

  // 人気トピック: コメント数の多い順
  async function fetchPopularThreads() {
    setLoadingPopular(true)

    const timeoutPromise = new Promise<null>((resolve) => {
      setTimeout(() => resolve(null), 5000)
    })

    try {
      const now = new Date().toISOString()

      const queryPromise = supabase
        .from('threads')
        .select('id, thread_number, title, category, created_at, user_id, comments_count')
        .lte('created_at', now)
        .order('comments_count', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(25)

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
    } finally {
      setLoadingPopular(false)
    }
  }

  // 新着トピック: 1週間以内で作成日時の新しい順
  async function fetchNewThreads() {
    setLoadingNew(true)

    const timeoutPromise = new Promise<null>((resolve) => {
      setTimeout(() => resolve(null), 5000)
    })

    try {
      const now = new Date()
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(now.getDate() - 7)

      const queryPromise = supabase
        .from('threads')
        .select('id, thread_number, title, category, created_at, user_id, comments_count')
        .gte('created_at', oneWeekAgo.toISOString())
        .lte('created_at', now.toISOString())
        .order('created_at', { ascending: false })
        .limit(25)

      const result = await Promise.race([queryPromise, timeoutPromise])

      if (result === null) {
        console.warn('Fetch new threads timeout')
        setNewThreads([])
      } else if (result.error) {
        console.error('Error fetching new threads:', result.error)
        setNewThreads([])
      } else {
        setNewThreads((result.data || []) as unknown as ThreadWithUser[])
      }
    } catch (error) {
      console.error('Error fetching new threads:', error)
      setNewThreads([])
    } finally {
      setLoadingNew(false)
    }
  }

  // サイドバー用: 1週間以内のコメント数順
  async function fetchWeeklyPopularThreads() {
    setLoadingWeekly(true)

    const timeoutPromise = new Promise<null>((resolve) => {
      setTimeout(() => resolve(null), 5000)
    })

    try {
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      const now = new Date().toISOString()

      const queryPromise = supabase
        .from('threads')
        .select('id, thread_number, title, category, created_at, user_id, comments_count')
        .gte('created_at', oneWeekAgo.toISOString())
        .lte('created_at', now)
        .order('comments_count', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(10)

      const result = await Promise.race([queryPromise, timeoutPromise])

      if (result === null) {
        console.warn('Fetch weekly popular threads timeout')
        setWeeklyPopularThreads([])
      } else if (result.error) {
        console.error('Error fetching weekly popular threads:', result.error)
        setWeeklyPopularThreads([])
      } else {
        setWeeklyPopularThreads((result.data || []) as unknown as ThreadWithUser[])
      }
    } catch (error) {
      console.error('Error fetching weekly popular threads:', error)
      setWeeklyPopularThreads([])
    } finally {
      setLoadingWeekly(false)
    }
  }

  async function fetchFeaturedArticles() {
    setLoadingArticles(true)

    const timeoutPromise = new Promise<null>((resolve) => {
      setTimeout(() => resolve(null), 5000)
    })

    try {
      // まずis_published=trueで試す、なければ全件から取得
      let queryPromise = supabase
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
    } finally {
      setLoadingArticles(false)
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
    }
  }

  // 現在のタブに応じたスレッドリストを取得
  const currentThreads = activeTab === 'popular' ? popularThreads : newThreads
  const isLoadingThreads = activeTab === 'popular' ? loadingPopular : loadingNew

  return (
    <>
      <Helmet>
        <title>D-LIFE | 糖尿病患者とその家族のためのコミュニティサイト</title>
        <meta name="description" content="糖尿病患者とその家族のためのコミュニティサイト。食事、治療、運動、メンタルケアなど、糖尿病に関する情報を共有できます。" />
      </Helmet>

      <div className="min-h-screen bg-gray-100">
        {/* Hero Slider */}
        <HeroSlider />

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
              {isLoadingThreads ? (
                <ThreadSkeleton />
              ) : currentThreads.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <MessageSquare size={40} className="mx-auto mb-3 text-gray-300" />
                  <p>トピックがありません</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {currentThreads.map((thread) => (
                    <li key={thread.id}>
                      <Link
                        to={`/threads/${(thread as any).thread_number || thread.id}`}
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
                              {(thread as any).comments_count || 0}
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
              {loadingWeekly ? (
                <SidebarSkeleton />
              ) : weeklyPopularThreads.length === 0 ? (
                <div className="px-4 py-6 text-center text-gray-500 text-sm">
                  まだトピックがありません
                </div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {weeklyPopularThreads.map((thread, index) => (
                    <li key={thread.id}>
                      <Link
                        to={`/threads/${(thread as any).thread_number || thread.id}`}
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
              {loadingArticles ? (
                <ArticleSkeleton />
              ) : featuredArticles.length === 0 ? (
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
    </>
  )
}
