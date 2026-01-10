import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { supabase } from '../lib/supabase'
import { Article, ARTICLE_CATEGORY_LABELS } from '../types/database'
import { ArrowLeft, Calendar, Tag, Loader2, FileText } from 'lucide-react'

const SITE_URL = 'https://diabeteslife.jp'
const DEFAULT_OGP_IMAGE = `${SITE_URL}/images/ogp.png`

export function ArticleDetail() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
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

    // 10秒タイムアウト
    const timeoutPromise = new Promise<null>((resolve) => {
      setTimeout(() => resolve(null), 10000)
    })

    try {
      const queryPromise = supabase
        .from('articles')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .single()

      const result = await Promise.race([queryPromise, timeoutPromise])

      if (result === null) {
        console.warn('Fetch article timeout')
        setArticle(null)
        setLoading(false)
        return
      }

      if (result.error) {
        console.error('Error fetching article:', result.error)
        setArticle(null)
        setLoading(false)
        return
      }

      const articleData = result.data as unknown as Article
      setArticle(articleData)

      // Increment view count (fire and forget)
      supabase
        .from('articles')
        .update({ view_count: (articleData.view_count || 0) + 1 } as never)
        .eq('id', articleData.id)
        .then(() => {})

      // Fetch related articles with timeout
      const relatedPromise = supabase
        .from('articles')
        .select('*')
        .eq('is_published', true)
        .eq('category', articleData.category)
        .neq('id', articleData.id)
        .order('published_at', { ascending: false })
        .limit(3)

      const relatedResult = await Promise.race([relatedPromise, timeoutPromise])

      if (relatedResult && relatedResult !== null && relatedResult.data) {
        setRelatedArticles(relatedResult.data as unknown as Article[])
      }
    } catch (error) {
      console.error('Error fetching article:', error)
      setArticle(null)
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 size={32} className="animate-spin text-rose-500" />
      </div>
    )
  }

  if (!article) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <FileText size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-600 mb-4">記事が見つかりませんでした</p>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-rose-500 hover:underline"
          >
            <ArrowLeft size={20} />
            <span>前のページに戻る</span>
          </button>
        </div>
      </div>
    )
  }

  const ogDescription = article.excerpt || article.content.replace(/<[^>]*>/g, '').substring(0, 150)
  const ogImage = article.thumbnail_url || DEFAULT_OGP_IMAGE
  const ogUrl = `${SITE_URL}/articles/${article.slug}`

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Helmet>
        <title>{article.title} | Dライフ</title>
        <meta name="description" content={ogDescription} />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={ogDescription} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:url" content={ogUrl} />
        <meta property="og:type" content="article" />
        <meta property="og:site_name" content="Dライフ" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={article.title} />
        <meta name="twitter:description" content={ogDescription} />
        <meta name="twitter:image" content={ogImage} />
        <link rel="canonical" href={ogUrl} />
      </Helmet>

      {/* Back Link */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-gray-600 hover:text-rose-500 mb-6"
      >
        <ArrowLeft size={20} />
        <span>前のページに戻る</span>
      </button>

      {/* Article Header */}
      <article className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Thumbnail - note.com style 1.91:1 aspect ratio */}
        {article.thumbnail_url && (
          <div className="relative w-full overflow-hidden bg-gray-200" style={{ paddingBottom: '52.36%' }}>
            <img
              src={article.thumbnail_url}
              alt={article.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-6 md:p-8">
          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="px-3 py-1 text-sm font-medium bg-rose-100 text-rose-600 rounded">
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
          <div
            className="article-content"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-2 flex-wrap">
                <Tag size={16} className="text-gray-500" />
                {article.tags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => navigate(`/search?q=${encodeURIComponent(tag)}`)}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-rose-100 hover:text-rose-600 transition-colors cursor-pointer"
                  >
                    {tag}
                  </button>
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
                <div className="relative w-full overflow-hidden bg-gray-200" style={{ paddingBottom: '52.36%' }}>
                  {related.thumbnail_url ? (
                    <img
                      src={related.thumbnail_url}
                      alt={related.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 w-full h-full flex items-center justify-center">
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
