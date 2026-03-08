'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { THREAD_CATEGORY_LABELS, ThreadCategory } from '@/types/database'
import { PenSquare, ChevronRight, FileText, TrendingUp, Loader2 } from 'lucide-react'

const categories: ThreadCategory[] = [
  'todays_meal',
  'food_recipe',
  'treatment',
  'exercise_lifestyle',
  'mental_concerns',
  'complications_prevention',
  'chat_other'
]

// Keyword pool for fallback
const KEYWORD_POOL = [
  'HbA1c', '血糖値', 'インスリン', '糖質制限', '低糖質レシピ',
  'リブレ', 'フリースタイルリブレ', 'インスリンポンプ', 'SGLT2阻害薬',
  '1型糖尿病', '2型糖尿病', '妊娠糖尿病', '境界型',
  '食後血糖', '空腹時血糖', 'スパイク', '低血糖', '高血糖',
  '合併症', '網膜症', '腎症', '神経障害', 'フットケア',
  '運動療法', 'ウォーキング', '筋トレ', '有酸素運動',
  '食事療法', 'カーボカウント', 'GI値', '糖質量',
  'メトホルミン', 'DPP-4阻害薬', 'GLP-1',
  'CGM', '血糖測定器', 'ケトン体', 'ケトアシドーシス',
  'シックデイ', '旅行', '外食', 'コンビニ食',
  '間食', 'おやつ', 'スイーツ', '糖質オフ',
  'ストレス', 'メンタル', '不安', '相談',
]

function getRotatedKeywords(): string[] {
  const now = new Date()
  const seed = Math.floor(now.getTime() / (1000 * 60 * 60 * 24 * 3))
  const shuffled = [...KEYWORD_POOL]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.abs((seed * (i + 1) * 9973) % (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled.slice(0, 6)
}

interface Thread {
  id: string
  thread_number: number
  title: string
  category: string
  comments_count: number
}

interface Article {
  id: string
  title: string
  slug: string
  thumbnail_url: string | null
}

interface SidebarProps {
  showPostButton?: boolean
  showPopularThreads?: boolean
  showArticles?: boolean
  showKeywords?: boolean
  showCategories?: boolean
}

export function Sidebar({
  showPostButton = true,
  showPopularThreads = true,
  showArticles = true,
  showKeywords = true,
  showCategories = true,
}: SidebarProps) {
  const { user } = useAuth()
  const supabase = createClient()
  const [popularThreads, setPopularThreads] = useState<Thread[]>([])
  const [featuredArticles, setFeaturedArticles] = useState<Article[]>([])
  const [keywords, setKeywords] = useState<string[]>([])
  const [loadingThreads, setLoadingThreads] = useState(true)
  const [loadingArticles, setLoadingArticles] = useState(true)
  const [loadingKeywords, setLoadingKeywords] = useState(true)

  const fallbackKeywords = useMemo(() => getRotatedKeywords(), [])

  useEffect(() => {
    if (showPopularThreads) fetchPopularThreads()
    if (showArticles) fetchFeaturedArticles()
    if (showKeywords) fetchPopularKeywords()
  }, [showPopularThreads, showArticles, showKeywords])

  async function fetchPopularThreads() {
    setLoadingThreads(true)
    try {
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      const now = new Date().toISOString()

      const { data, error } = await supabase
        .from('threads')
        .select('id, thread_number, title, category, comments_count')
        .gt('comments_count', 0)
        .gte('created_at', oneWeekAgo.toISOString())
        .lte('created_at', now)
        .order('comments_count', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(10)

      if (!error && data) {
        setPopularThreads(data as Thread[])
      }
    } catch (error) {
      console.error('Error fetching popular threads:', error)
    } finally {
      setLoadingThreads(false)
    }
  }

  async function fetchFeaturedArticles() {
    setLoadingArticles(true)
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('id, title, slug, thumbnail_url')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(5)

      if (!error && data) {
        setFeaturedArticles(data as Article[])
      }
    } catch (error) {
      console.error('Error fetching featured articles:', error)
    } finally {
      setLoadingArticles(false)
    }
  }

  async function fetchPopularKeywords() {
    setLoadingKeywords(true)
    const timeoutId = setTimeout(() => {
      setLoadingKeywords(false)
      setKeywords([])
    }, 3000)

    try {
      const { data, error } = await supabase
        .from('popular_keywords')
        .select('keyword')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .limit(15)

      clearTimeout(timeoutId)

      if (!error && data) {
        setKeywords(data.map((k: { keyword: string }) => k.keyword))
      } else {
        setKeywords([])
      }
    } catch {
      clearTimeout(timeoutId)
      setKeywords([])
    } finally {
      setLoadingKeywords(false)
    }
  }

  const displayKeywords = keywords.length > 0 ? keywords : fallbackKeywords

  return (
    <div className="space-y-6">
      {/* Post Button */}
      {showPostButton && (
        user ? (
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
        )
      )}

      {/* Weekly Popular Topics */}
      {showPopularThreads && (
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
              <TrendingUp size={16} className="text-rose-500" />
              人気トピック
            </h2>
          </div>
          {loadingThreads ? (
            <div className="animate-pulse px-4 py-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-start gap-3 py-2">
                  <div className="w-4 h-4 bg-gray-200 rounded shrink-0"></div>
                  <div className="h-3 bg-gray-200 rounded flex-1"></div>
                </div>
              ))}
            </div>
          ) : popularThreads.length === 0 ? (
            <div className="px-4 py-6 text-center text-gray-500 text-sm">
              まだトピックがありません
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {popularThreads.map((thread, index) => (
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
      )}

      {/* Recommended Articles */}
      {showArticles && (
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="font-bold text-gray-800">記事一覧</h2>
          </div>
          {loadingArticles ? (
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
              href="/articles"
              className="flex items-center gap-1 text-rose-500 hover:text-rose-600 text-sm font-medium"
            >
              <span>記事一覧</span>
              <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      )}

      {/* Popular Keywords */}
      {showKeywords && (
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp size={16} className="text-orange-500" />
              人気のキーワード
            </h2>
          </div>
          {loadingKeywords ? (
            <div className="p-4 flex justify-center">
              <Loader2 size={20} className="animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="p-4">
              <div className="flex flex-wrap gap-2">
                {displayKeywords.map((keyword, index) => (
                  <Link
                    key={keyword}
                    href={`/search?q=${encodeURIComponent(keyword)}`}
                    className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm transition-colors ${
                      index < 3
                        ? 'bg-orange-50 text-orange-700 hover:bg-orange-100'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {keyword}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Categories */}
      {showCategories && (
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
      )}
    </div>
  )
}
