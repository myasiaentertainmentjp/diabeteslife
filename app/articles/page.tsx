import Link from 'next/link'
import Image from 'next/image'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { FileText, Calendar, ChevronRight, Tag } from 'lucide-react'


export const metadata = {
  title: '記事一覧',
  description: '糖尿病に関する役立つ情報や知識をお届けします。',
}

export const revalidate = 60

interface Props {
  searchParams: Promise<{ category?: string }>
}

export default async function ArticlesPage({ searchParams }: Props) {
  const { category: selectedCategory } = await searchParams
  const supabase = await createServerSupabaseClient()

  // まず全記事を取得してカテゴリ一覧を作成
  const { data: allArticles } = await supabase
    .from('articles')
    .select('id, slug, title, excerpt, category, thumbnail_url, published_at, created_at')
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .limit(50)

  const categories = Array.from(
    new Set((allArticles || []).map((a) => a.category).filter(Boolean))
  )

  // カテゴリでフィルター
  const articles = selectedCategory
    ? (allArticles || []).filter((a) => a.category === selectedCategory)
    : allArticles

  function formatDate(dateString: string) {
    const date = new Date(dateString)
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
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
              {category}
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
                    src={article.thumbnail_url}
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
                    <span>{article.category}</span>
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
      )}
    </div>
  )
}
