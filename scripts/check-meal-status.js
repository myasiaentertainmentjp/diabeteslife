/**
 * 食事画像投入計画のための現状確認
 */
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://josanlblwfjdaaezqbnw.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvc2FubGJsd2ZqZGFhZXpxYm53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg0MjYwNiwiZXhwIjoyMDgzNDE4NjA2fQ.JlTXBmY5HJAqfRD_AazsiBORpgLZfB74fPkNyyfVSQY'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function check() {
  console.log('=== 食事画像投入計画 現状確認 ===\n')

  // 1. ダミーユーザー数と層別確認
  const { data: dummyUsers } = await supabase
    .from('users')
    .select('id, display_name')
    .eq('is_dummy', true)

  const { data: profiles } = await supabase
    .from('user_profiles')
    .select('user_id, diabetes_type, tier')
    .in('user_id', dummyUsers?.map(u => u.id) || [])

  const tierMap = new Map(profiles?.map(p => [p.user_id, p.tier || 'unknown']) || [])
  const typeMap = new Map(profiles?.map(p => [p.user_id, p.diabetes_type]) || [])

  const tierCounts = { core: 0, semi_active: 0, light: 0, read_only: 0, unknown: 0 }
  for (const [, tier] of tierMap) {
    tierCounts[tier] = (tierCounts[tier] || 0) + 1
  }

  console.log('=== ダミーユーザー層別分布 ===')
  console.log('  コア (core):', tierCounts.core)
  console.log('  準アクティブ (semi_active):', tierCounts.semi_active)
  console.log('  ライト (light):', tierCounts.light)
  console.log('  閲覧専用 (read_only):', tierCounts.read_only)
  console.log('  未分類:', tierCounts.unknown)
  console.log('  総数:', dummyUsers?.length || 0)

  // 2. 既存の食事投稿（meal_posts）
  const { data: mealPosts, count: mealCount } = await supabase
    .from('meal_posts')
    .select('id, user_id, caption, tags, created_at', { count: 'exact' })

  const dummyMealPosts = mealPosts?.filter(p =>
    dummyUsers?.some(u => u.id === p.user_id)
  ) || []

  console.log('\n=== 既存の食事投稿 (meal_posts) ===')
  console.log('  全投稿数:', mealCount || 0)
  console.log('  ダミーユーザーの投稿:', dummyMealPosts.length)

  // 3. threads の todays_meal カテゴリ
  const { data: mealThreads, count: threadCount } = await supabase
    .from('threads')
    .select('id, user_id, title, image_url, created_at', { count: 'exact' })
    .eq('category', 'todays_meal')

  const dummyMealThreads = mealThreads?.filter(t =>
    dummyUsers?.some(u => u.id === t.user_id)
  ) || []

  const withImage = mealThreads?.filter(t => t.image_url) || []

  console.log('\n=== 既存の食事スレッド (threads category=todays_meal) ===')
  console.log('  全スレッド数:', threadCount || 0)
  console.log('  画像付き:', withImage.length)
  console.log('  ダミーユーザーのスレッド:', dummyMealThreads.length)

  // 4. 層別の現在の活動量
  console.log('\n=== 層別 活動状況 ===')

  const { data: threads } = await supabase
    .from('threads')
    .select('id, user_id')
    .in('user_id', dummyUsers?.map(u => u.id) || [])

  const { data: comments } = await supabase
    .from('comments')
    .select('id, user_id')
    .in('user_id', dummyUsers?.map(u => u.id) || [])

  // 層別集計
  const activityByTier = { core: { threads: 0, comments: 0, meals: 0 }, semi_active: { threads: 0, comments: 0, meals: 0 }, light: { threads: 0, comments: 0, meals: 0 }, read_only: { threads: 0, comments: 0, meals: 0 } }

  for (const t of threads || []) {
    const tier = tierMap.get(t.user_id) || 'unknown'
    if (activityByTier[tier]) activityByTier[tier].threads++
  }

  for (const c of comments || []) {
    const tier = tierMap.get(c.user_id) || 'unknown'
    if (activityByTier[tier]) activityByTier[tier].comments++
  }

  for (const m of dummyMealPosts) {
    const tier = tierMap.get(m.user_id) || 'unknown'
    if (activityByTier[tier]) activityByTier[tier].meals++
  }

  console.log('層         | 人数 | スレッド | コメント | 食事投稿')
  console.log('-'.repeat(55))
  for (const [tier, counts] of Object.entries(activityByTier)) {
    if (tier === 'unknown') continue
    const userCount = tierCounts[tier] || 0
    console.log(`${tier.padEnd(12)} | ${String(userCount).padStart(4)} | ${String(counts.threads).padStart(8)} | ${String(counts.comments).padStart(8)} | ${String(counts.meals).padStart(8)}`)
  }

  // 5. コアユーザーの詳細（食事投稿候補）
  console.log('\n=== コア層ユーザー一覧（食事投稿優先候補）===')
  const coreUsers = dummyUsers?.filter(u => tierMap.get(u.id) === 'core') || []

  for (const u of coreUsers.slice(0, 15)) {
    const type = typeMap.get(u.id) || '-'
    const threadCount = threads?.filter(t => t.user_id === u.id).length || 0
    const mealCount = dummyMealPosts.filter(m => m.user_id === u.id).length
    console.log(`  ${u.display_name?.substring(0, 12).padEnd(12)} | ${type.padEnd(6)} | スレ:${threadCount} | 食事:${mealCount}`)
  }

  // 6. サンプル食事投稿
  if (dummyMealPosts.length > 0) {
    console.log('\n=== サンプル食事投稿 ===')
    for (const m of dummyMealPosts.slice(0, 3)) {
      const userName = dummyUsers?.find(u => u.id === m.user_id)?.display_name || '不明'
      console.log(`  [${m.created_at?.slice(0, 10)}] ${userName}: "${m.caption?.slice(0, 30) || '(キャプションなし)'}"`)
      console.log(`    タグ: ${m.tags?.join(', ') || 'なし'}`)
    }
  }

  console.log('\n✅ 確認完了')
}

check().catch(console.error)
