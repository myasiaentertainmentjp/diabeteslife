import { createServerSupabaseClient, createPublicServerClient } from '@/lib/supabase-server'
import { ThreadDetailClient } from '@/components/ThreadDetailClient'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ threadNumber: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { threadNumber } = await params
  const supabase = createPublicServerClient()
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://diabeteslife.jp'

  const isNumeric = /^\d+$/.test(threadNumber)

  const { data: thread } = isNumeric
    ? await supabase
        .from('threads')
        .select('title, body, thread_number')
        .eq('thread_number', parseInt(threadNumber, 10))
        .single()
    : await supabase
        .from('threads')
        .select('title, body, thread_number')
        .eq('id', threadNumber)
        .single()

  if (!thread) {
    return { title: 'トピックが見つかりません' }
  }

  const description = (thread.body || '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 120)

  const title = `${thread.title} | Dライフ掲示板`
  const canonicalUrl = `${baseUrl}/threads/${thread.thread_number}`

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      type: 'article',
      siteName: 'Dライフ',
      url: canonicalUrl,
      images: [{ url: '/images/ogp.png', width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/images/ogp.png'],
    },
  }
}

// スレッド詳細のベースデータはpublicクライアントで取得
// ログイン状態の確認のみcookiesクライアントを使用
export const revalidate = 60

export default async function ThreadDetailPage({ params }: PageProps) {
  const { threadNumber } = await params

  // ログイン状態・管理者チェックのみcookiesクライアントを使用
  const authSupabase = await createServerSupabaseClient()
  const { data: { session } } = await authSupabase.auth.getSession()
  let isAdmin = false
  if (session?.user) {
    const { data: userData } = await authSupabase
      .from('users')
      .select('role, email')
      .eq('id', session.user.id)
      .single()
    isAdmin = userData?.role === 'admin' || userData?.email === 'info@diabeteslife.jp'
  }

  // スレッドデータ取得はpublicクライアントで（cache-control: privateを回避）
  const supabase = createPublicServerClient()
  const isNumeric = /^\d+$/.test(threadNumber)

  const { data: thread } = isNumeric
    ? await supabase.from('threads').select('*').eq('thread_number', parseInt(threadNumber, 10)).single()
    : await supabase.from('threads').select('*').eq('id', threadNumber).single()

  if (!thread) {
    notFound()
  }

  const { data: authorData } = await supabase
    .from('users')
    .select('email, display_name')
    .eq('id', thread.user_id)
    .single()

  const now = new Date().toISOString()
  let commentsQuery = supabase
    .from('comments')
    .select('*')
    .eq('thread_id', thread.id)
    .eq('is_hidden', false)
    .order('created_at', { ascending: true })

  if (!isAdmin) {
    commentsQuery = commentsQuery.lte('created_at', now)
  }

  const { data: commentsData } = await commentsQuery

  const userIds = [...new Set((commentsData || []).map((c) => c.user_id))]

  let usersData: { id: string; display_name: string | null }[] = []
  if (userIds.length > 0) {
    const { data } = await supabase
      .from('users')
      .select('id, display_name')
      .in('id', userIds)
    usersData = data || []
  }

  const usersMap = new Map(usersData.map((u) => [u.id, u]))

  const commentsWithUsers = (commentsData || []).map((comment) => ({
    ...comment,
    profiles: {
      display_name: usersMap.get(comment.user_id)?.display_name || null,
    },
  }))

  const deduped = commentsWithUsers.filter((comment, index) => {
    const body = comment.body || ''
    const time = new Date(comment.created_at).getTime()
    return !commentsWithUsers.some((other, otherIndex) => {
      if (otherIndex >= index) return false
      const otherBody = other.body || ''
      const otherTime = new Date(other.created_at).getTime()
      return (
        comment.user_id === other.user_id &&
        body === otherBody &&
        Math.abs(time - otherTime) < 60000
      )
    })
  })

  const threadWithAuthor = {
    ...thread,
    users: authorData,
    profiles: { display_name: authorData?.display_name || null },
  }

  return (
    <ThreadDetailClient
      initialThread={threadWithAuthor}
      initialComments={deduped}
      isAdmin={isAdmin}
    />
  )
}
