import { createPublicServerClient } from '@/lib/supabase-server'
import { HomeClient } from '@/components/HomeClient'

export const metadata = {
  title: 'Dライフ | 糖尿病と向き合う人のためのコミュニティ',
  description: '糖尿病患者・ご家族・支える人たちが安心して話せるコミュニティサイト。HbA1c記録、食事管理、トピック掲示板などの機能が無料で使えます。',
}

// 1時間キャッシュ
export const revalidate = 3600

export default async function Home() {
  const supabase = createPublicServerClient()
  const now = new Date().toISOString()
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
  const weekAgoISO = oneWeekAgo.toISOString()

  // 4クエリを並列実行してレスポンスタイムを短縮
  const [
    { data: popularThreads },
    { data: newThreads },
    { data: weeklyPopularThreads },
    { data: featuredArticles },
  ] = await Promise.all([
    supabase
      .from('threads')
      .select('id, thread_number, title, category, created_at, user_id, comments_count')
      .gt('comments_count', 0)
      .lte('created_at', now)
      .order('comments_count', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(25),

    supabase
      .from('threads')
      .select('id, thread_number, title, category, created_at, user_id, comments_count')
      .gt('comments_count', 0)
      .lte('created_at', now)
      .order('created_at', { ascending: false })
      .limit(25),

    supabase
      .from('threads')
      .select('id, thread_number, title, category, created_at, user_id, comments_count')
      .gt('comments_count', 0)
      .gte('created_at', weekAgoISO)
      .lte('created_at', now)
      .order('comments_count', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(10),

    supabase
      .from('articles')
      .select('id, title, slug, thumbnail_url, created_at')
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  return (
    <HomeClient
      initialPopularThreads={popularThreads || []}
      initialNewThreads={newThreads || []}
      initialWeeklyPopularThreads={weeklyPopularThreads || []}
      initialFeaturedArticles={featuredArticles || []}
    />
  )
}
