import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import { supabase } from '../lib/supabase'
import { Article, ARTICLE_CATEGORY_LABELS } from '../types/database'
import { ArrowLeft, Calendar, Tag, Loader2, FileText } from 'lucide-react'

export function ArticleDetail() {
  const { slug } = useParams<{ slug: string }>()
  const [article, setArticle] = useState<Article | null>(null)
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (slug) {
      fetchArticle()
    }
  }, [slug])

  async function fetchArticle() {
    if (!slug) return

    setLoading(true)

    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .single()

    if (error) {
      console.error('Error fetching article:', error)
      setLoading(false)
      return
    }

    const articleData = data as unknown as Article
    setArticle(articleData)

    // Increment view count
    await supabase
      .from('articles')
      .update({ view_count: (articleData.view_count || 0) + 1 } as never)
      .eq('id', articleData.id)

    // Fetch related articles
    const { data: related } = await supabase
      .from('articles')
      .select('*')
      .eq('is_published', true)
      .eq('category', articleData.category)
      .neq('id', articleData.id)
      .order('published_at', { ascending: false })
      .limit(3)

    if (related) {
      setRelatedArticles(related as unknown as Article[])
    }

    setLoading(false)
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 size={32} className="animate-spin text-green-600" />
      </div>
    )
  }

  if (!article) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <FileText size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-600 mb-4">記事が見つかりませんでした</p>
          <Link
            to="/articles"
            className="inline-flex items-center gap-2 text-green-600 hover:underline"
          >
            <ArrowLeft size={20} />
            <span>記事一覧に戻る</span>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back Link */}
      <Link
        to="/articles"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-green-600 mb-6"
      >
        <ArrowLeft size={20} />
        <span>記事一覧に戻る</span>
      </Link>

      {/* Article Header */}
      <article className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Thumbnail */}
        {article.thumbnail_url && (
          <div className="aspect-video bg-gray-200">
            <img
              src={article.thumbnail_url}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-6 md:p-8">
          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="px-3 py-1 text-sm font-medium bg-green-100 text-green-700 rounded">
              {ARTICLE_CATEGORY_LABELS[article.category]}
            </span>
            <span className="flex items-center gap-1 text-gray-500 text-sm">
              <Calendar size={14} />
              {formatDate(article.published_at)}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
            {article.title}
          </h1>

          {/* Content */}
          <div className="prose prose-gray max-w-none prose-headings:font-bold prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-4 prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-3 prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-green-600 prose-a:no-underline hover:prose-a:underline prose-ul:my-4 prose-li:my-1 prose-blockquote:border-green-500 prose-blockquote:bg-green-50 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r">
            <ReactMarkdown>{article.content}</ReactMarkdown>
          </div>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-2 flex-wrap">
                <Tag size={16} className="text-gray-500" />
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">関連記事</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {relatedArticles.map((related) => (
              <Link
                key={related.id}
                to={`/articles/${related.slug}`}
                className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="aspect-video bg-gray-200">
                  {related.thumbnail_url ? (
                    <img
                      src={related.thumbnail_url}
                      alt={related.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FileText size={32} className="text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                    {related.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
