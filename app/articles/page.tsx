import Link from 'next/link'
import { ARTICLE_CATEGORY_LABELS } from '@/types/database'
import Image from 'next/image'
import { getPresetThumbnailUrl } from '@/lib/image-utils'
import type { Metadata } from 'next'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { Breadcrumb, BreadcrumbItem } from '@/components/Breadcrumb'
import { FileText, Calendar, ChevronRight, ChevronLeft, Tag } from 'lucide-react'

interface Props {
  searchParams: Promise<{ category?: string; page?: string }>
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { category, page } = await searchParams
  const currentPage = parseInt(page || '1', 10)
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://diabeteslife.jp'

  // Build canonical URL (self-referencing)
  const params = new URLSearchParams()
  if (category) params.set('category', category)
  if (currentPage > 1) params.set('page', currentPage.toString())
  const qs = params.toString()
  const canonicalUrl = qs ? `${baseUrl}/articles?${qs}` : `${baseUrl}/articles`

  const title = category
    ? `${category}の記事一覧${currentPage > 1 ? ` - ${currentPage}ページ目` : ''}`
    : `記事一覧${currentPage > 1 ? ` - ${currentPage}ページ目` : ''}`

  return {
    title,
    description: '糖尿病に関する役立つ情報や知識をお届けします。',
    alternates: {
      canonical: canonicalUrl,
    },
  }
}

export const revalidate = 60

const PER_PAGE = 20

export default async function ArticlesPage({ searchParams }: Props) {
  const { category: selectedCategory, page } = await searchParams
  const currentPage = parseInt(page || '1', 10)
  const offset = (currentPage - 1) * PER_PAGE
  const supabase = await createServerSupabaseClient()

  // First, get all categories for the filter (separate query)
  const { data: allArticlesForCategories } = await supabase
    .from('articles')
    .select('category')
    .eq('is_published', true)

  const categories = Array.from(
    new Set((allArticlesForCategories || []).map((a) => a.category).filter(Boolean))
  )

  // Build paginated query with count
  let query = supabase
    .from('articles')
    .select('id, slug, title, excerpt, category, thumbnail_url, published_at, created_at', { count: 'exact' })
    .eq('is_published', true)
    .order('published_at', { ascending: false })

  if (selectedCategory) {
    query = query.eq('category', selectedCategory)
  }

  const { data: articles, count } = await query.range(offset, offset + PER_PAGE - 1)

  const totalPages = count ? Math.ceil(count / PER_PAGE) : 1

  function formatDate(dateString: string) {
    const date = new Date(dateString)
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  // Build pagination URL
  function buildPageUrl(pageNum: number) {
    const params = new URLSearchParams()
    if (selectedCategory) params.set('category', selectedCategory)
    if (pageNum > 1) params.set('page', pageNum.toString())
    const qs = params.toString()
    return qs ? `/articles?${qs}` : '/articles'
  }

  // Build breadcrumb items
  const breadcrumbItems: BreadcrumbItem[] = selectedCategory
    ? [
        { label: '記事一覧', href: '/articles' },
        { label: selectedCategory },
      ]
    : [{ label: '記事一覧' }]

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-rose-100 rounded-lg flex items-center justify-center">
          <FileText size={24} className="text-rose-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">記事一覧</h1>
          <p className="text-sm text-gray-500">糖尿病に関する役立つ情報</p>
        </div>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <Link
            href="/articles"
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              !selectedCategory
                ? 'bg-rose-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            すべて
          </Link>
          {categories.map((category) => (
            <Link
              key={category}
              href={`/articles?category=${encodeURIComponent(category!)}`}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                selectedCategory === category
                  ? 'bg-rose-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {ARTICLE_CATEGORY_LABELS[category as keyof typeof ARTICLE_CATEGORY_LABELS] || category}
            </Link>
          ))}
        </div>
      )}

      {/* Articles Grid */}
      {!articles || articles.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <FileText size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500">記事がありません</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            {articles.map((article) => (
              <Link
                key={article.id}
                href={`/articles/${article.slug}`}
                className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                {article.thumbnail_url && (
                  <div className="aspect-video bg-gray-100 relative">
                    <Image
                      src={getPresetThumbnailUrl(article.thumbnail_url, 'grid')}
                      alt={article.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="p-4">
                  {article.category && (
                    <div className="flex items-center gap-1 text-xs text-rose-500 mb-2">
                      <Tag size={12} />
                      <span>{ARTICLE_CATEGORY_LABELS[article.category as keyof typeof ARTICLE_CATEGORY_LABELS] || article.category}</span>
                    </div>
                  )}
                  <h2 className="font-bold text-gray-900 line-clamp-2 mb-2">
                    {article.title}
                  </h2>
                  {article.excerpt && (
                    <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                      {article.excerpt}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <div className="flex items-center gap-1">
                      <Calendar size={12} />
                      <span>{formatDate(article.published_at || article.created_at)}</span>
                    </div>
                    <ChevronRight size={16} />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              {currentPage > 1 ? (
                <Link
                  href={buildPageUrl(currentPage - 1)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <ChevronLeft size={20} />
                </Link>
              ) : (
                <span className="p-2 text-gray-300 cursor-not-allowed">
                  <ChevronLeft size={20} />
                </span>
              )}

              <span className="text-sm text-gray-600 px-4">
                {currentPage} / {totalPages}
              </span>

              {currentPage < totalPages ? (
                <Link
                  href={buildPageUrl(currentPage + 1)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <ChevronRight size={20} />
                </Link>
              ) : (
                <span className="p-2 text-gray-300 cursor-not-allowed">
                  <ChevronRight size={20} />
                </span>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
