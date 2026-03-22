import type { Metadata } from 'next'
import { createPublicServerClient } from '@/lib/supabase-server'
import { MealsClient } from '@/components/MealsClient'

export const metadata: Metadata = {
  title: '食事の記録',
  description: '糖尿病患者が毎日の食事を記録・共有するページ。低糖質・外食・手作りなどタグや糖尿病の種別・年代で絞って参考にできます。',
  alternates: { canonical: 'https://diabeteslife.jp/meals' },
  openGraph: {
    title: '食事の記録 | Dライフ',
    description: '糖尿病患者が毎日の食事を記録・共有するページ。',
    type: 'website',
    siteName: 'Dライフ',
    images: [{ url: '/images/ogp.png', width: 1200, height: 630 }],
  },
}

export const revalidate = 300

interface PageProps {
  searchParams: Promise<{ tag?: string; dtype?: string; age?: string }>
}

export default async function MealsPage({ searchParams }: PageProps) {
  const { tag, dtype, age } = await searchParams
  const supabase = createPublicServerClient()

  let query = supabase
    .from('meal_posts')
    .select('id, user_id, image_url, caption, tags, diabetes_type, age_group, blood_sugar_after, likes_count, comments_count, created_at')
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(100)

  if (tag) query = query.contains('tags', [tag])
  if (dtype) query = query.eq('diabetes_type', dtype)
  if (age) query = query.eq('age_group', age)

  const { data: posts } = await query

  // 投稿者情報を取得
  const userIds = [...new Set((posts || []).map(p => p.user_id))]
  let usersMap: Record<string, string> = {}
  if (userIds.length > 0) {
    const { data: users } = await supabase
      .from('users').select('id, display_name').in('id', userIds)
    usersMap = Object.fromEntries((users || []).map(u => [u.id, u.display_name || 'ユーザー']))
  }

  const postsWithUsers = (posts || []).map(p => ({
    ...p,
    display_name: usersMap[p.user_id] || 'ユーザー',
  }))

  return (
    <MealsClient
      initialPosts={postsWithUsers}
      selectedTag={tag}
      selectedDiabetesType={dtype}
      selectedAgeGroup={age}
    />
  )
}
