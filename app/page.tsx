import { createServerSupabaseClient } from '@/lib/supabase-server'
import { HomeClient } from '@/components/HomeClient'

// 1時間キャッシュ
export const revalidate = 3600

export default async function Home() {
  const supabase = await createServerSupabaseClient()
  const now = new Date().toISOString()
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

  // Fetch popular threads (by comments count)
  const { data: popularThreads } = await supabase
    .from('threads')
    .select('id, thread_number, title, category, created_at, user_id, comments_count')
    .gt('comments_count', 0)
    .lte('created_at', now)
    .order('comments_count', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(25)

  // Fetch new threads (last week, by date)
  const { data: newThreads } = await supabase
    .from('threads')
    .select('id, thread_number, title, category, created_at, user_id, comments_count')
    .gt('comments_count', 0)
    .gte('created_at', oneWeekAgo.toISOString())
    .lte('created_at', now)
    .order('created_at', { ascending: false })
    .limit(25)

  // Fetch weekly popular threads
  const { data: weeklyPopularThreads } = await supabase
    .from('threads')
    .select('id, thread_number, title, category, created_at, user_id, comments_count')
    .gt('comments_count', 0)
    .gte('created_at', oneWeekAgo.toISOString())
    .lte('created_at', now)
    .order('comments_count', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(10)

  // Fetch featured articles
  const { data: featuredArticles } = await supabase
    .from('articles')
    .select('id, title, slug, thumbnail_url, created_at')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <HomeClient
      initialPopularThreads={popularThreads || []}
      initialNewThreads={newThreads || []}
      initialWeeklyPopularThreads={weeklyPopularThreads || []}
      initialFeaturedArticles={featuredArticles || []}
    />
  )
}
