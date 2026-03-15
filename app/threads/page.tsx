import { Metadata } from 'next'
import { createPublicServerClient } from '@/lib/supabase-server'
import { ThreadListClient } from '@/components/ThreadListClient'

export const metadata: Metadata = {
  title: '掲示板・トピック一覧',
  description: '糖尿病患者・ご家族が集まる掲示板。食事・治療・運動・メンタルケアなどカテゴリ別にトピックを探したり、自分でトピックを立てることができます。',
  openGraph: {
    title: '掲示板・トピック一覧 | Dライフ',
    description: '糖尿病患者・ご家族が集まる掲示板。食事・治療・運動・メンタルケアなどカテゴリ別にトピックを探せます。',
    type: 'website',
    siteName: 'Dライフ',
    images: [{ url: '/images/ogp.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '掲示板・トピック一覧 | Dライフ',
    description: '糖尿病患者・ご家族が集まる掲示板。',
  },
}

// スレッド一覧はログイン不要のためpublicクライアントを使用
export const revalidate = 300

interface PageProps {
  searchParams: Promise<{ category?: string; page?: string }>
}

export default async function ThreadListPage({ searchParams }: PageProps) {
  const { category, page } = await searchParams
  const supabase = createPublicServerClient()
  const currentPage = parseInt(page || '1', 10)
  const perPage = 20
  const offset = (currentPage - 1) * perPage
  const now = new Date().toISOString()

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
