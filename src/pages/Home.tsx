import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { ThreadWithUser, THREAD_CATEGORY_LABELS, ThreadCategory } from '../types/database'
import { PopularKeywords } from '../components/PopularKeywords'
import { Search, MessageSquare, PenSquare, ChevronRight, Loader2 } from 'lucide-react'

type TabType = 'popular' | 'new'

const categories: ThreadCategory[] = ['health', 'lifestyle', 'work', 'food', 'exercise', 'other']

export function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('popular')
  const [threads, setThreads] = useState<ThreadWithUser[]>([])
  const [popularThreads, setPopularThreads] = useState<ThreadWithUser[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    fetchThreads()
    fetchPopularThreads()
  }, [activeTab])

  async function fetchThreads() {
    setLoading(true)

    try {
      let query = supabase
        .from('threads')
        .select('*')
        .eq('is_hidden', false)
        .limit(10)

      if (activeTab === 'popular') {
        query = query.order('comments_count', { ascending: false })
      } else {
        query = query.order('created_at', { ascending: false })
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching threads:', error)
      } else if (data) {
        setThreads(data as unknown as ThreadWithUser[])
      }
    } catch (error) {
      console.error('Error fetching threads:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchPopularThreads() {
    try {
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

      const { data, error } = await supabase
        .from('threads')
        .select('*')
        .eq('is_hidden', false)
        .gte('created_at', oneWeekAgo.toISOString())
        .order('comments_count', { ascending: false })
        .limit(5)

      if (error) {
        console.error('Error fetching popular threads:', error)
      } else if (data) {
        setPopularThreads(data as unknown as ThreadWithUser[])
      }
    } catch (error) {
      console.error('Error fetching popular threads:', error)
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
    <div className="bg-green-50 min-h-screen">
      {/* Sub Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <p className="text-gray-600 text-base">
              糖尿病患者とその家族のためのコミュニティサイト
            </p>
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="キーワードで検索"
                className="w-full md:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              />
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </form>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column - Main Content */}
          <div className="flex-1">
            {/* Tabs */}
            <div className="flex mb-4">
              <button
                onClick={() => setActiveTab('popular')}
                className={`px-6 py-3 text-sm font-medium rounded-t-lg transition-colors ${
                  activeTab === 'popular'
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                今日の人気トピック
              </button>
              <button
                onClick={() => setActiveTab('new')}
                className={`px-6 py-3 text-sm font-medium rounded-t-lg transition-colors ${
                  activeTab === 'new'
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                新着トピック
              </button>
            </div>

            {/* Thread List */}
            <div className="bg-white rounded-lg shadow-sm">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 size={28} className="animate-spin text-green-600" />
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
                            <span className="flex items-center gap-1">
                              <MessageSquare size={14} />
                              {thread.comments_count}
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
                  className="flex items-center justify-center gap-1 text-green-600 hover:text-green-700 text-sm font-medium"
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
                className="flex items-center justify-center gap-2 w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-sm"
              >
                <PenSquare size={18} />
                <span>トピックを投稿する</span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="flex items-center justify-center gap-2 w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-sm"
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
                        <span className="text-green-600 font-bold text-sm">
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
              <div className="p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-16 h-12 bg-gray-200 rounded shrink-0" />
                  <p className="text-sm text-gray-700 line-clamp-2">
                    糖尿病の基礎知識 - 初めての方へ
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-16 h-12 bg-gray-200 rounded shrink-0" />
                  <p className="text-sm text-gray-700 line-clamp-2">
                    血糖値を安定させる食事のコツ
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-16 h-12 bg-gray-200 rounded shrink-0" />
                  <p className="text-sm text-gray-700 line-clamp-2">
                    運動療法の始め方ガイド
                  </p>
                </div>
              </div>
              <div className="px-4 py-3 border-t border-gray-100">
                <Link
                  to="/articles"
                  className="flex items-center gap-1 text-green-600 hover:text-green-700 text-sm font-medium"
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
