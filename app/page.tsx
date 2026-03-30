import Link from 'next/link'
import Image from 'next/image'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { HeroSlider } from '@/components/HeroSlider'
import { HomePageTabs } from '@/components/HomePageTabs'
import { HomeThreadList } from '@/components/HomeThreadList'
import { PostButton } from '@/components/PostButton'
import { THREAD_CATEGORY_LABELS, ThreadCategory } from '@/types/database'
import { ChevronRight, FileText, Camera } from 'lucide-react'
import { getPresetThumbnailUrl, getResizedUrl } from '@/lib/image-utils'

// 1時間キャッシュ
export const revalidate = 3600

const categories: ThreadCategory[] = [
  'todays_meal',
  'food_recipe',
  'treatment',
  'exercise_lifestyle',
  'mental_concerns',
  'complications_prevention',
  'chat_other',
]

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

  // Fetch new threads (all, by date)
  const { data: newThreads } = await supabase
    .from('threads')
    .select('id, thread_number, title, category, created_at, user_id, comments_count')
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

  // Fetch featured meal posts
  const { data: featuredMeals } = await supabase
    .from('meal_posts')
    .select('id, image_url, caption, likes_count')
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(6)

  return (
    <div className="min-h-screen">
      {/* Hero Slider */}
      <HeroSlider />

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column - Main Content */}
          <div className="flex-1">
            {/* 食事の記録 - 横スクロール（トピック一覧の上に配置） */}
            {featuredMeals && featuredMeals.length > 0 && (
              <div className="mb-4 px-1">
                <div className="flex items-center justify-between mb-2 px-1">
                  <h2 className="font-bold text-gray-800 text-sm flex items-center gap-1">
                    <Camera size={14} className="text-rose-500" />
                    みんなの食事記録
                  </h2>
                  <Link href="/meals" className="text-xs text-rose-500 hover:text-rose-600 font-medium">
                    もっと見る →
                  </Link>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {featuredMeals.map((meal) => (
                    <Link
                      key={meal.id}
                      href="/meals"
                      className="relative flex-shrink-0 w-28 h-28 bg-gray-100 rounded-xl overflow-hidden group"
                    >
                      <Image
                        src={getResizedUrl(meal.image_url, 200, 200, 'cover')}
                        alt={meal.caption || '食事の記録'}
                        fill
                        sizes="112px"
                        className="object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    </Link>
                  ))}
                  {/* もっと見るボタン */}
                  <Link
                    href="/meals"
                    className="flex-shrink-0 w-28 h-28 bg-rose-50 rounded-xl flex flex-col items-center justify-center gap-1 hover:bg-rose-100 transition-colors border border-rose-200"
                  >
                    <span className="text-rose-500 text-xs font-medium text-center leading-tight">もっと<br />見る</span>
                    <ChevronRight size={14} className="text-rose-500" />
                  </Link>
                </div>
              </div>
            )}

            {/* Tabs with Server-rendered content */}
            <HomePageTabs
              popularContent={<HomeThreadList threads={popularThreads || []} />}
              newContent={<HomeThreadList threads={newThreads || []} />}
            />
          </div>

          {/* Right Column - Sidebar (Server-rendered) */}
          <div className="lg:w-80 space-y-6">
            {/* Post Button (Client Component for auth check) */}
            <PostButton />

            {/* Weekly Popular Topics */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-4 py-3 border-b border-gray-100">
                <h2 className="font-bold text-gray-800">一週間の人気トピック</h2>
              </div>
              {!weeklyPopularThreads || weeklyPopularThreads.length === 0 ? (
                <div className="px-4 py-6 text-center text-gray-500 text-sm">
                  まだトピックがありません
                </div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {weeklyPopularThreads.map((thread, index) => (
                    <li key={thread.id}>
                      <Link
                        href={`/threads/${thread.thread_number || thread.id}`}
                        className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                      >
                        <span className="text-rose-500 font-bold text-sm">
                          {index + 1}
                        </span>
                        <span className="text-gray-700 text-sm line-clamp-2">
                          {thread.title}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Recommended Articles */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-4 py-3 border-b border-gray-100">
                <h2 className="font-bold text-gray-800">おすすめ記事</h2>
              </div>
              {!featuredArticles || featuredArticles.length === 0 ? (
                <div className="px-4 py-6 text-center text-gray-500 text-sm">
                  <FileText size={24} className="mx-auto mb-2 text-gray-300" />
                  <p>おすすめ記事がありません</p>
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  {featuredArticles.map((article) => (
                    <Link
                      key={article.id}
                      href={`/articles/${article.slug}`}
                      className="flex items-start gap-3 group"
                    >
                      {article.thumbnail_url ? (
                        <Image
                          src={getPresetThumbnailUrl(article.thumbnail_url, 'sidebar')}
                          alt={article.title}
                          width={80}
                          height={42}
                          className="object-cover rounded shrink-0"
                          style={{ aspectRatio: '1.91 / 1' }}
                        />
                      ) : (
                        <div
                          className="w-20 bg-gray-200 rounded shrink-0 flex items-center justify-center"
                          style={{ aspectRatio: '1.91 / 1' }}
                        >
                          <FileText size={16} className="text-gray-400" />
                        </div>
                      )}
                      <p className="text-sm text-gray-700 line-clamp-2 group-hover:text-rose-500 transition-colors">
                        {article.title}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
              <div className="px-4 py-3 border-t border-gray-100">
                <Link
                  href="/articles"
                  className="flex items-center gap-1 text-rose-500 hover:text-rose-600 text-sm font-medium"
                >
                  <span>記事一覧</span>
                  <ChevronRight size={16} />
                </Link>
              </div>
            </div>

            {/* Categories */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-4 py-3 border-b border-gray-100">
                <h2 className="font-bold text-gray-800">カテゴリー</h2>
              </div>
              <ul className="divide-y divide-gray-100">
                {categories.map((category) => (
                  <li key={category}>
                    <Link
                      href={`/threads?category=${category}`}
                      className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-gray-700 text-sm">
                        {THREAD_CATEGORY_LABELS[category]}
                      </span>
                      <ChevronRight size={16} className="text-gray-400" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
