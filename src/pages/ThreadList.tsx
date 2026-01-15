import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import {
  ThreadCategory,
  ThreadWithUser,
  THREAD_CATEGORY_LABELS,
  THREAD_CATEGORY_COLORS,
  THREAD_CATEGORY_DESCRIPTIONS,
} from '../types/database'
import { MessageSquare, Plus, ChevronLeft, ChevronRight, Camera } from 'lucide-react'

const ITEMS_PER_PAGE = 10

const categories: (ThreadCategory | 'all')[] = ['all', 'todays_meal', 'food_recipe', 'treatment', 'exercise_lifestyle', 'mental_concerns', 'complications_prevention', 'chat_other']

export function ThreadList() {
  const [threads, setThreads] = useState<ThreadWithUser[]>([])
  const [totalCount, setTotalCount] = useState(0)

  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  // URLからカテゴリとページを取得（初期値を同期）
  const categoryParam = searchParams.get('category') as ThreadCategory | 'all' | null
  const pageParam = searchParams.get('page')

  const selectedCategory: ThreadCategory | 'all' =
    categoryParam && categories.includes(categoryParam) ? categoryParam : 'all'
  const currentPage = pageParam ? Math.max(1, parseInt(pageParam, 10) || 1) : 1

  // カテゴリ変更時にURLを更新
  function handleCategoryChange(category: ThreadCategory | 'all') {
    const params = new URLSearchParams()
    if (category !== 'all') {
      params.set('category', category)
    }
    // ページは1にリセット
    setSearchParams(params)
  }

  // ページ変更時にURLを更新
  function handlePageChange(page: number) {
    const params = new URLSearchParams(searchParams)
    if (page > 1) {
      params.set('page', String(page))
    } else {
      params.delete('page')
    }
    setSearchParams(params)
  }

  useEffect(() => {
    fetchThreads()
  }, [selectedCategory, currentPage])

  async function fetchThreads() {
    // 10秒タイムアウト
    const timeoutPromise = new Promise<null>((resolve) => {
      setTimeout(() => resolve(null), 10000)
    })

    try {
      // 未来の日付を除外
      const now = new Date().toISOString()

      let query = supabase
        .from('threads')
        .select('id, thread_number, user_id, title, category, comments_count, created_at', { count: 'exact' })
        .lte('created_at', now)
        .order('created_at', { ascending: false })

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory)
      }

      const from = (currentPage - 1) * ITEMS_PER_PAGE
      const to = from + ITEMS_PER_PAGE - 1
      query = query.range(from, to)

      const result = await Promise.race([query, timeoutPromise])

      if (result === null) {
        console.warn('Fetch threads timeout')
        setThreads([])
        setTotalCount(0)
        return
      }

      const { data, error, count } = result

      if (error) {
        console.error('Error fetching threads:', error)
        setThreads([])
        setTotalCount(0)
        return
      }

      if (!data || data.length === 0) {
        setThreads([])
        setTotalCount(count || 0)
        return
      }

      // Get user info for all threads
      const userIds = [...new Set(data.map((t) => t.user_id))]
      const { data: usersData } = await supabase
        .from('users')
        .select('id, display_name')
        .in('id', userIds)

      const usersMap = new Map(usersData?.map((u) => [u.id, u]) || [])

      // Combine threads with user info
      const threadsWithUsers = data.map((thread) => ({
        ...thread,
        profiles: {
          display_name: usersMap.get(thread.user_id)?.display_name || null,
        },
      }))

      setThreads(threadsWithUsers as ThreadWithUser[])
      setTotalCount(count || 0)
    } catch (error) {
      console.error('Error fetching threads:', error)
      setThreads([])
      setTotalCount(0)
    }
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const diffMinutes = Math.floor(diff / (1000 * 60))
    const diffHours = Math.floor(diff / (1000 * 60 * 60))
    const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (diffMinutes < 1) return 'たった今'
    if (diffMinutes < 60) return `${diffMinutes}分前`
    if (diffHours < 24) return `${diffHours}時間前`
    if (diffDays < 7) return `${diffDays}日前`

    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

  return (
    <>
      <Helmet>
        <title>スレッド一覧 | Dライフ</title>
        <meta name="description" content="糖尿病に関するスレッド一覧。食事、治療、運動、メンタルなど様々なカテゴリで情報交換できます。" />
        <link rel="canonical" href="https://diabeteslife.jp/threads" />
        <meta property="og:title" content="スレッド一覧 | Dライフ" />
        <meta property="og:url" content="https://diabeteslife.jp/threads" />
      </Helmet>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">スレッド一覧</h1>
          <p className="text-gray-600 mt-1">みんなで情報交換しましょう</p>
        </div>
        {user && (
          <Link
            to="/threads/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-rose-500 text-white font-medium rounded-lg hover:bg-rose-600 transition-colors"
          >
            <Plus size={20} />
            <span>新規作成</span>
          </Link>
        )}
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => handleCategoryChange(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === category
                ? 'bg-rose-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {category === 'all' ? '全て' : THREAD_CATEGORY_LABELS[category]}
          </button>
        ))}
      </div>

      {/* Banner for 食事の記録 category */}
      {selectedCategory === 'todays_meal' && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6 flex items-center gap-3">
          <Camera size={24} className="text-orange-500 flex-shrink-0" />
          <div>
            <p className="text-orange-800 font-medium">写真を添付して、みんなの食事を見てみましょう!</p>
            <p className="text-orange-600 text-sm mt-0.5">{THREAD_CATEGORY_DESCRIPTIONS['todays_meal']}</p>
          </div>
        </div>
      )}

      {/* Thread List */}
      {threads.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <MessageSquare size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">スレッドがありません</p>
          {user && (
            <Link
              to="/threads/new"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-rose-500 text-white font-medium rounded-lg hover:bg-rose-600 transition-colors"
            >
              <Plus size={20} />
              <span>最初のスレッドを作成</span>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {threads.map((thread) => (
            <Link
              key={thread.id}
              to={`/threads/${(thread as any).thread_number || thread.id}`}
              className="block bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded ${THREAD_CATEGORY_COLORS[thread.category]}`}>
                      {THREAD_CATEGORY_LABELS[thread.category]}
                    </span>
                  </div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-2 truncate">
                    {thread.title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        navigate(`/users/${thread.user_id}`)
                      }}
                      className="text-gray-700 hover:text-rose-500 hover:underline font-medium"
                    >
                      {thread.profiles?.display_name || '匿名'}
                    </button>
                    <span className="text-gray-400">|</span>
                    <span>{formatDate(thread.created_at)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-gray-500 shrink-0">
                  <MessageSquare size={18} />
                  <span className="text-sm font-medium">{thread.comments_count}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <button
            onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((page) => {
                if (totalPages <= 7) return true
                if (page === 1 || page === totalPages) return true
                if (Math.abs(page - currentPage) <= 1) return true
                return false
              })
              .map((page, index, arr) => {
                const showEllipsis = index > 0 && page - arr[index - 1] > 1
                return (
                  <div key={page} className="flex items-center">
                    {showEllipsis && <span className="px-2 text-gray-400">...</span>}
                    <button
                      onClick={() => handlePageChange(page)}
                      className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                        currentPage === page
                          ? 'bg-rose-500 text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  </div>
                )
              })}
          </div>
          <button
            onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
      </div>
    </>
  )
}
