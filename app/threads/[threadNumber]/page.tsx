import { createServerSupabaseClient } from '@/lib/supabase-server'
import { ThreadContent } from '@/components/ThreadContent'
import { CommentList } from '@/components/CommentList'
import { ThreadInteractions } from '@/components/ThreadInteractions'
import { Sidebar } from '@/components/Sidebar'
import { Breadcrumb } from '@/components/Breadcrumb'
import { SameCategoryThreadsLinks } from '@/components/SameCategoryThreadsLinks'
import { RegisterBanner } from '@/components/RegisterBanner'
import { THREAD_CATEGORY_LABELS, ThreadCategory } from '@/types/database'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ threadNumber: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { threadNumber } = await params
  const supabase = await createServerSupabaseClient()

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

  const description = (thread.content || '').substring(0, 150)

  return {
    title: thread.title,
    description,
    openGraph: {
      title: thread.title,
      description,
      type: 'article',
    },
  }
}

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

  // Fetch related threads from the same category
  let relatedThreads: { id: string; thread_number: number; title: string; created_at: string; comment_count: number }[] = []
  if (thread.category) {
    const { data: relatedData } = await supabase
      .from('threads')
      .select('id, thread_number, title, created_at, comment_count')
      .eq('category', thread.category)
      .neq('id', thread.id)
      .order('created_at', { ascending: false })
      .limit(5)
    relatedThreads = relatedData || []
  }

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

  /**
   * 開発環境用: スレッド品質ログ
   * Search Console で「クロール済み未登録」が出た際の原因分析用
   *
   * SEO品質ガイドライン:
   * - スレッド本文は100文字以上が望ましい（短すぎると低品質判定リスク）
   * - タイトルは具体性を持たせること（「質問です」等は避ける）
   * - カテゴリ未設定はSEO上不利（内部リンク導線から外れる）
   */
  if (process.env.NODE_ENV !== 'production') {
    const contentLength = (thread.body || thread.content || '').length
    const titleLength = thread.title.length
    console.log('[SEO品質チェック] スレッド詳細:', {
      threadNumber: thread.thread_number,
      titleLength,
      contentLength,
      commentCount: deduped.length,
      hasCategory: !!thread.category,
      category: thread.category || 'なし',
      // 品質警告
      warnings: [
        contentLength < 100 && '⚠️ 本文が100文字未満',
        titleLength < 10 && '⚠️ タイトルが短すぎる',
        !thread.category && '⚠️ カテゴリ未設定',
      ].filter(Boolean),
    })
  }

  // Generate DiscussionForumPosting structured data
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://diabeteslife.jp'
  const threadUrl = `${siteUrl}/threads/${thread.thread_number || thread.id}`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'DiscussionForumPosting',
    '@id': threadUrl,
    headline: thread.title,
    text: (thread.body || thread.content || '').substring(0, 500),
    datePublished: thread.created_at,
    dateModified: thread.updated_at || thread.created_at,
    author: {
      '@type': 'Person',
      name: authorData?.display_name || '匿名',
    },
    url: threadUrl,
    discussionUrl: threadUrl,
    commentCount: deduped.length,
    comment: deduped.slice(0, 10).map((comment, index) => ({
      '@type': 'Comment',
      position: index + 2,
      text: (comment.body || comment.content || '').substring(0, 300),
      datePublished: comment.created_at,
      author: {
        '@type': 'Person',
        name: comment.profiles?.display_name || '匿名',
      },
    })),
    interactionStatistic: {
      '@type': 'InteractionCounter',
      interactionType: 'https://schema.org/CommentAction',
      userInteractionCount: deduped.length,
    },
    isPartOf: {
      '@type': 'WebSite',
      name: 'Dライフ',
      url: siteUrl,
    },
  }

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: 'トピック一覧', href: '/threads' },
            { label: THREAD_CATEGORY_LABELS[thread.category as ThreadCategory], href: `/threads?category=${thread.category}` },
            { label: thread.title },
          ]}
        />

        {/* Back Link & Interactions (Client) */}
        <ThreadInteractions
          thread={threadWithAuthor}
          comments={deduped}
        />

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {/* Thread Content (Server) */}
              <ThreadContent thread={threadWithAuthor} />

              {/* Comment List (Server) */}
              <CommentList comments={deduped} />
            </div>
          </div>

          {/* Sidebar - hidden on mobile */}
          <div className="hidden lg:block w-80 shrink-0">
            <Sidebar
              showPostButton={true}
              showPopularThreads={true}
              showArticles={true}
              showKeywords={true}
              showCategories={false}
            />
          </div>
        </div>

        {/* Register Banner - 未ログインユーザー向け登録促進 */}
        <RegisterBanner />

        {/* Related Threads from Same Category - GA4計測付き */}
        <SameCategoryThreadsLinks threads={relatedThreads} />
      </div>
    </>
  )
}
