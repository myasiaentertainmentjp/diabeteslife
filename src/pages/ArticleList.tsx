import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Article, ArticleCategory, ARTICLE_CATEGORY_LABELS } from '../types/database'
import { Calendar, ChevronLeft, ChevronRight, Loader2, FileText } from 'lucide-react'

const ITEMS_PER_PAGE = 10

const categories: (ArticleCategory | 'all')[] = ['all', 'health', 'lifestyle', 'food', 'exercise', 'medical', 'other']

export function ArticleList() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<ArticleCategory | 'all'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  useEffect(() => {
    fetchArticles()
  }, [selectedCategory, currentPage])

  async function fetchArticles() {
    setLoading(true)

    try {
      let query = supabase
        .from('articles')
        .select('*', { count: 'exact' })
        .eq('is_published', true)
        .order('published_at', { ascending: false })

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory)
      }

      const from = (currentPage - 1) * ITEMS_PER_PAGE
      const to = from + ITEMS_PER_PAGE - 1
      query = query.range(from, to)

      const { data, error, count } = await query

      if (error) {
        console.error('Error fetching articles:', error)
      } else {
        setArticles(data as Article[])
        setTotalCount(count || 0)
      }
    } catch (error) {
      console.error('Error fetching articles:', error)
    } finally {
      setLoading(false)
    }
  }

  function formatDate(dateString: string | null) {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">記事一覧</h1>
        <p className="text-gray-600">糖尿病に関する役立つ情報をお届けします</p>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => {
              setSelectedCategory(category)
              setCurrentPage(1)
            }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === category
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {category === 'all' ? '全て' : ARTICLE_CATEGORY_LABELS[category]}
          </button>
        ))}
      </div>

      {/* Article List */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 size={32} className="animate-spin text-green-600" />
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <FileText size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-600">記事がありません</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {articles.map((article) => (
            <Link
              key={article.id}
              to={`/articles/${article.slug}`}
              className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col"
            >
              {/* Thumbnail */}
              <div className="aspect-video bg-gray-200 relative">
                {article.thumbnail_url ? (
                  <img
                    src={article.thumbnail_url}
                    alt={article.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FileText size={48} className="text-gray-400" />
                  </div>
                )}
                <span className="absolute top-3 left-3 px-2 py-1 text-xs font-medium bg-green-600 text-white rounded">
                  {ARTICLE_CATEGORY_LABELS[article.category]}
                </span>
              </div>

              {/* Content */}
              <div className="p-4 flex-1 flex flex-col">
                <h2 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {article.title}
                </h2>
                {article.excerpt && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2 flex-1">
                    {article.excerpt}
                  </p>
                )}
                <div className="flex items-center gap-1 text-gray-500 text-sm">
                  <Calendar size={14} />
                  <span>{formatDate(article.published_at)}</span>
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
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
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
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                        currentPage === page
                          ? 'bg-green-600 text-white'
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
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  )
}
