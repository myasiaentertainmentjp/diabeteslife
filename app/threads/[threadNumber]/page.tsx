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

  const isNumeric = /^\d+$/.test(threadNumber)

  const { data: thread } = isNumeric
    ? await supabase
        .from('threads')
        .select('title, content')
        .eq('thread_number', parseInt(threadNumber, 10))
        .single()
    : await supabase
        .from('threads')
        .select('title, content')
        .eq('id', threadNumber)
        .single()

  if (!thread) {
    return { title: 'トピックが見つかりません' }
  }

  // HTMLタグ除去・改行正規化して120文字
  const description = (thread.content || '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 120)

  const title = `${thread.title} | Dライフ掲示板`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      siteName: 'Dライフ',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  }
}

export const revalidate = 60

export default async function ThreadDetailPage({ params }: PageProps) {
  const { threadNumber } = await params
  const supabase = await createServerSupabaseClient()

  // Get current user session and check if admin
  const { data: { session } } = await supabase.auth.getSession()
  let isAdmin = false
  if (session?.user) {
    const { data: userData } = await supabase
      .from('users')
      .select('role, email')
      .eq('id', session.user.id)
      .single()
    isAdmin = userData?.role === 'admin' || userData?.email === 'info@diabeteslife.jp'
  }

  const isNumeric = /^\d+$/.test(threadNumber)

  // Fetch thread
  const { data: thread } = isNumeric
    ? await supabase.from('threads').select('*').eq('thread_number', parseInt(threadNumber, 10)).single()
    : await supabase.from('threads').select('*').eq('id', threadNumber).single()

  if (!thread) {
    notFound()
  }

  // Fetch thread author
  const { data: authorData } = await supabase
    .from('users')
    .select('email, display_name')
    .eq('id', thread.user_id)
    .single()

  // Fetch comments - include future comments for admin
  const now = new Date().toISOString()
  let commentsQuery = supabase
    .from('comments')
    .select('*')
    .eq('thread_id', thread.id)
    .eq('is_hidden', false)
    .order('created_at', { ascending: true })

  // Only filter future comments for non-admin users
  if (!isAdmin) {
    commentsQuery = commentsQuery.lte('created_at', now)
  }

  const { data: commentsData } = await commentsQuery

  // Get user IDs from comments
  const userIds = [...new Set((commentsData || []).map((c) => c.user_id))]

  // Fetch user info for all commenters
  let usersData: { id: string; display_name: string | null }[] = []
  if (userIds.length > 0) {
    const { data } = await supabase
      .from('users')
      .select('id, display_name')
      .in('id', userIds)

    usersData = data || []
  }

  const usersMap = new Map(usersData.map((u) => [u.id, u]))

  // Combine comments with user info
  const commentsWithUsers = (commentsData || []).map((comment) => ({
    ...comment,
    profiles: {
      display_name: usersMap.get(comment.user_id)?.display_name || null,
    },
  }))

  // Deduplicate comments (same user, same body, within 60 seconds)
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
