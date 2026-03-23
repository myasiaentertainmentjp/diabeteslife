import { Metadata } from 'next'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { ThreadList } from '@/components/ThreadCard'
import { ThreadListFilter, Pagination } from '@/components/ThreadListFilter'
import { Breadcrumb, BreadcrumbItem } from '@/components/Breadcrumb'
import { THREAD_CATEGORY_LABELS, ThreadCategory } from '@/types/database'

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

  // Build breadcrumb items
  const breadcrumbItems: BreadcrumbItem[] = category
    ? [
        { label: 'トピック一覧', href: '/threads' },
        { label: THREAD_CATEGORY_LABELS[category as ThreadCategory] },
      ]
    : [{ label: 'トピック一覧' }]

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Content */}
        <div className="flex-1">
          {/* Filter (Client Component) */}
          <ThreadListFilter category={category} />

          {/* Thread List (Server Component) */}
          <div className="bg-white rounded-lg shadow-sm">
            <ThreadList threads={threads || []} />

            {/* Pagination (Client Component) */}
            <Pagination
              totalPages={totalPages}
              currentPage={currentPage}
              category={category}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
