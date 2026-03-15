import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createServerSupabaseClient, createPublicServerClient } from '@/lib/supabase-server'
import { ArrowLeft, Calendar, Tag, Clock } from 'lucide-react'
import { ShareButtons } from '@/components/ShareButtons'
import type { Metadata } from 'next'


interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ preview?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = createPublicServerClient()

  const { data: article } = await supabase
    .from('articles')
    .select('title, excerpt, content, thumbnail_url')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (!article) {
    return {
      title: '記事が見つかりません',
    }
  }

  // excerpt未入力の場合は本文HTMLからプレーンテキストを抽出して120文字
  const description = article.excerpt ||
    (article.content
      ? article.content.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().slice(0, 120)
      : article.title)

  const fullTitle = `${article.title} | Dライフ`

  const canonicalUrl = `https://diabeteslife.jp/articles/${slug}`

  return {
    title: article.title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: fullTitle,
      description,
      type: 'article',
      siteName: 'Dライフ',
      url: canonicalUrl,
      images: article.thumbnail_url
        ? [{ url: article.thumbnail_url, width: 1280, height: 670, alt: article.title }]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: article.thumbnail_url ? [article.thumbnail_url] : undefined,
    },
  }
}

export const revalidate = 60

export default async function ArticleDetailPage({ params, searchParams }: Props) {
  const { slug } = await params
  const { preview } = await searchParams
  const isPreview = preview === '1'
  const supabase = await createServerSupabaseClient()

  const query = supabase.from('articles').select('*').eq('slug', slug)
  if (!isPreview) query.eq('is_published', true)
  const { data: article, error } = await query.single()

  if (error || !article) {
    notFound()
  }

  // Article構造化データ
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt || article.title,
    image: article.thumbnail_url || undefined,
    datePublished: article.published_at || article.created_at,
    dateModified: article.updated_at || article.created_at,
    author: {
      '@type': 'Organization',
      name: 'Dライフ編集部',
      url: 'https://diabeteslife.jp',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Dライフ',
      url: 'https://diabeteslife.jp',
      logo: {
        '@type': 'ImageObject',
        url: 'https://diabeteslife.jp/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://diabeteslife.jp/articles/${slug}`,
    },
  }

  // Fetch related articles
  const { data: relatedArticles } = await supabase
    .from('articles')
    .select('id, slug, title, thumbnail_url')
    .eq('is_published', true)
    .eq('category', article.category)
    .neq('id', article.id)
    .limit(3)

  function formatDate(dateString: string) {
    const date = new Date(dateString)
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  function estimateReadingTime(content: string): number {
    const wordsPerMinute = 400 // Japanese characters per minute
    const charCount = content.replace(/<[^>]*>/g, '').length
    return Math.max(1, Math.ceil(charCount / wordsPerMinute))
  }

  const readingTime = article.reading_time || estimateReadingTime(article.content || '')

  // JSON-LD構造化データ
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    description: article.excerpt || '',
    image: article.thumbnail_url || undefined,
    datePublished: article.published_at || article.created_at,
    dateModified: article.updated_at || article.published_at || article.created_at,
    author: {
      '@type': 'Organization',
      name: 'Dライフ',
      url: 'https://diabeteslife.jp',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Dライフ',
      url: 'https://diabeteslife.jp',
      logo: {
        '@type': 'ImageObject',
        url: 'https://diabeteslife.jp/images/ogp.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://diabeteslife.jp/articles/${slug}`,
    },
    wordCount: (article.content || '').replace(/<[^>]*>/g, '').length,
    timeRequired: `PT${readingTime}M`,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-4xl mx-auto px-4 py-6">
      <Link
        href="/articles"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-rose-500 mb-6"
      >
        <ArrowLeft size={20} />
        <span>記事一覧に戻る</span>
      </Link>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <article className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Thumbnail */}
        {article.thumbnail_url && (
          <div className="aspect-video bg-gray-100 relative">
            <Image
              src={article.thumbnail_url}
              alt={article.title}
              fill
              sizes="(max-width: 768px) 100vw, 896px"
              className="object-cover"
              priority
              unoptimized
            />
          </div>
        )}

        {/* Header */}
        <div className="p-6 md:p-8 border-b border-gray-100">
          {article.category && (
            <div className="flex items-center gap-1 text-sm text-rose-500 mb-3">
              <Tag size={14} />
              <span>{article.category}</span>
            </div>
          )}

          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            {article.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Calendar size={14} />
              <span>{formatDate(article.published_at || article.created_at)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={14} />
              <span>約{readingTime}分で読めます</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8">
          {article.excerpt && (
            <p className="text-lg text-gray-600 mb-6 pb-6 border-b border-gray-100">
              {article.excerpt}
            </p>
          )}

          <div
            className="prose prose-gray max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-rose-500 prose-a:no-underline hover:prose-a:underline prose-img:rounded-lg"
            dangerouslySetInnerHTML={{ __html: article.content || '' }}
          />
        </div>

        {/* Share */}
        <div className="px-6 md:px-8 pb-6 md:pb-8">
          <ShareButtons
            title={article.title}
            url={`https://diabeteslife.jp/articles/${slug}`}
          />
        </div>
      </article>

      {/* Related Articles */}
      {relatedArticles && relatedArticles.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">関連記事</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {relatedArticles.map((related) => (
              <Link
                key={related.id}
                href={`/articles/${related.slug}`}
                className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                {related.thumbnail_url && (
                  <div className="aspect-video bg-gray-100 relative">
                    <Image
                      src={related.thumbnail_url}
                      alt={related.title}
                      fill
                      sizes="(max-width: 768px) 33vw, 280px"
                      className="object-cover"
                      quality={70}
                      loading="lazy"
                    />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 line-clamp-2">
                    {related.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
      </div>
    </>
  )
}
