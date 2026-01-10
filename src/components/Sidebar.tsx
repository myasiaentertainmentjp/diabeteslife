import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { ThreadWithUser, Article, THREAD_CATEGORY_LABELS, ThreadCategory } from '../types/database'
import { PopularKeywords } from './PopularKeywords'
import { PenSquare, ChevronRight, FileText } from 'lucide-react'

const categories: ThreadCategory[] = [
  'food_recipe',
  'treatment',
  'exercise_lifestyle',
  'mental_concerns',
  'complications_prevention',
  'chat_other'
]

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
  const [popularThreads, setPopularThreads] = useState<ThreadWithUser[]>([])
  const [featuredArticles, setFeaturedArticles] = useState<Article[]>([])

  useEffect(() => {
    if (showPopularThreads) fetchPopularThreads()
    if (showArticles) fetchFeaturedArticles()
  }, [showPopularThreads, showArticles])

  async function fetchPopularThreads() {
    try {
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

      const { data, error } = await supabase
        .from('threads')
        .select('id, thread_number, title, category, created_at, user_id')
        .gte('created_at', oneWeekAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(5)

      if (!error && data) {
        setPopularThreads(data as unknown as ThreadWithUser[])
      }
    } catch (error) {
      console.error('Error fetching popular threads:', error)
    }
  }

  async function fetchFeaturedArticles() {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('id, title, slug, thumbnail_url, created_at')
        .order('created_at', { ascending: false })
        .limit(5)

      if (!error && data) {
        setFeaturedArticles(data as Article[])
      }
    } catch (error) {
      console.error('Error fetching featured articles:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Post Button */}
      {showPostButton && (
        user ? (
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
        )
      )}

      {/* Weekly Popular Topics */}
      {showPopularThreads && (
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
      )}

      {/* Recommended Articles */}
      {showArticles && (
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
      )}

      {/* Popular Keywords */}
      {showKeywords && <PopularKeywords />}

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
      )}
    </div>
  )
}
