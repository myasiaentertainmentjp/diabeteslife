import { MetadataRoute } from 'next'
import { createPublicServerClient } from '@/lib/supabase-server'

// sitemapはpublicクライアントを使用（cache-control: privateを回避）
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://diabeteslife.jp'
  const supabase = createPublicServerClient()

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

  const now = new Date().toISOString()
  const { data: threads } = await supabase
    .from('threads')
    .select('thread_number, created_at')
    .lte('created_at', now)
    .order('created_at', { ascending: false })
    .limit(500)

  const threadPages: MetadataRoute.Sitemap = (threads || []).map((thread) => ({
    url: `${baseUrl}/threads/${thread.thread_number}`,
    lastModified: new Date(thread.created_at),
    changeFrequency: 'daily' as const,
    priority: 0.6,
  }))

  return [...staticPages, ...articlePages, ...threadPages]
}
