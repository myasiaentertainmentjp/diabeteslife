import { Metadata } from 'next'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { ThreadListClient } from '@/components/ThreadListClient'

export const metadata: Metadata = {
  title: 'トピック一覧',
  description: '糖尿病患者とその家族のためのコミュニティ。食事、治療、運動、メンタルケアなど、様々なカテゴリでトピックを探せます。',
  openGraph: {
    title: 'トピック一覧 | Dライフ',
    description: '糖尿病患者とその家族のためのコミュニティ。食事、治療、運動、メンタルケアなど、様々なカテゴリでトピックを探せます。',
    type: 'website',
  },
}

export const revalidate = 300 // 5分キャッシュ

interface PageProps {
  searchParams: Promise<{ category?: string; page?: string }>
}

export default async function ThreadListPage({ searchParams }: PageProps) {
  const { category, page } = await searchParams
  const supabase = await createServerSupabaseClient()
  const currentPage = parseInt(page || '1', 10)
  const perPage = 20
  const offset = (currentPage - 1) * perPage
  const now = new Date().toISOString()

  // Build query
  let query = supabase
    .from('threads')
    .select('id, thread_number, title, category, created_at, user_id, comments_count', { count: 'exact' })
    .lte('created_at', now)
    .order('created_at', { ascending: false })

  if (category) {
    query = query.eq('category', category)
  }

  const { data: threads, count } = await query.range(offset, offset + perPage - 1)

  const totalPages = count ? Math.ceil(count / perPage) : 1

  return (
    <ThreadListClient
      initialThreads={threads || []}
      totalPages={totalPages}
      currentPage={currentPage}
      category={category}
    />
  )
}
