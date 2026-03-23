import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

const THREADS_PER_SITEMAP = 1000

// Create a direct Supabase client for build-time operations (no cookies needed)
function createBuildTimeClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Generate sitemap index entries (called at build time)
export async function generateSitemaps() {
  const supabase = createBuildTimeClient()

  // Count total threads
  const { count: threadCount } = await supabase
    .from('threads')
    .select('*', { count: 'exact', head: true })
    .lte('created_at', new Date().toISOString())

  const totalThreads = threadCount || 0
  const threadSitemapCount = Math.max(1, Math.ceil(totalThreads / THREADS_PER_SITEMAP))

  // Generate sitemap IDs: 0 = static + articles, 1+ = threads pages
  const sitemaps = [
    { id: 0 }, // static pages and articles
    ...Array.from({ length: threadSitemapCount }, (_, i) => ({ id: i + 1 })),
  ]

  return sitemaps
}

export default async function sitemap({
  id,
}: {
  id: number
}): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://diabeteslife.jp'
  const supabase = createBuildTimeClient()

  // Sitemap 0: Static pages + Articles
  if (id === 0) {
    // 静的ページ
    const staticPages: MetadataRoute.Sitemap = [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
      {
        url: `${baseUrl}/threads`,
        lastModified: new Date(),
        changeFrequency: 'hourly',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/articles`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/guide`,
        changeFrequency: 'monthly',
        priority: 0.7,
      },
      {
        url: `${baseUrl}/faq`,
        changeFrequency: 'monthly',
        priority: 0.6,
      },
      {
        url: `${baseUrl}/company`,
        changeFrequency: 'yearly',
        priority: 0.3,
      },
      {
        url: `${baseUrl}/terms`,
        changeFrequency: 'yearly',
        priority: 0.3,
      },
      {
        url: `${baseUrl}/privacy`,
        changeFrequency: 'yearly',
        priority: 0.3,
      },
      {
        url: `${baseUrl}/guidelines`,
        changeFrequency: 'yearly',
        priority: 0.3,
      },
      {
        url: `${baseUrl}/disclaimer`,
        changeFrequency: 'yearly',
        priority: 0.3,
      },
      {
        url: `${baseUrl}/contact`,
        changeFrequency: 'yearly',
        priority: 0.4,
      },
    ]

    // 記事ページを取得（全件）
    const { data: articles } = await supabase
      .from('articles')
      .select('slug, updated_at, published_at')
      .eq('is_published', true)
      .order('published_at', { ascending: false })

    const articlePages: MetadataRoute.Sitemap = (articles || []).map((article) => ({
      url: `${baseUrl}/articles/${article.slug}`,
      lastModified: new Date(article.updated_at || article.published_at || new Date()),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))

    return [...staticPages, ...articlePages]
  }

  // Sitemap 1+: Thread pages (paginated)
  const threadSitemapIndex = id - 1 // 0-indexed
  const offset = threadSitemapIndex * THREADS_PER_SITEMAP
  const now = new Date().toISOString()

  const { data: threads } = await supabase
    .from('threads')
    .select('thread_number, created_at, updated_at')
    .lte('created_at', now)
    .order('created_at', { ascending: false })
    .range(offset, offset + THREADS_PER_SITEMAP - 1)

  const threadPages: MetadataRoute.Sitemap = (threads || []).map((thread) => ({
    url: `${baseUrl}/threads/${thread.thread_number}`,
    lastModified: new Date(thread.updated_at || thread.created_at),
    changeFrequency: 'daily' as const,
    priority: 0.6,
  }))

  return threadPages
}
