import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { sendCommentNotificationEmail } from '../lib/email'
import {
  ThreadWithUser,
  ThreadCommentWithUser,
  THREAD_CATEGORY_LABELS,
  ThreadCategory,
} from '../types/database'
import { ArrowLeft, MessageSquare, Send, AlertCircle, Loader2 } from 'lucide-react'

// Category badge colors
const categoryColors: Record<ThreadCategory, string> = {
  health: 'bg-green-100 text-green-700',
  food: 'bg-orange-100 text-orange-700',
  exercise: 'bg-blue-100 text-blue-700',
  lifestyle: 'bg-purple-100 text-purple-700',
  work: 'bg-gray-100 text-gray-700',
  other: 'bg-gray-100 text-gray-600',
}

// Extended thread type with author email for notifications
interface ThreadWithAuthor extends ThreadWithUser {
  users?: { email: string; display_name: string | null }
}

export function ThreadDetail() {
  const { id } = useParams<{ id: string }>()
  const [thread, setThread] = useState<ThreadWithAuthor | null>(null)
  const [comments, setComments] = useState<ThreadCommentWithUser[]>([])
  const [loading, setLoading] = useState(true)
  const [commentContent, setCommentContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const { user } = useAuth()

  useEffect(() => {
    if (id) {
      fetchData()
    }
  }, [id])

  async function fetchData() {
    setLoading(true)
    try {
      await Promise.all([fetchThread(), fetchComments()])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchThread() {
    if (!id) return

    try {
      // First get the thread data
      const { data: threadData, error: threadError } = await supabase
        .from('threads')
        .select('*')
        .eq('id', id)
        .single()

      if (threadError) {
        console.error('Error fetching thread:', threadError)
        return
      }

      // Then get the author info from users table
      let authorInfo = null
      if (threadData?.user_id) {
        const { data: userData } = await supabase
          .from('users')
          .select('email, display_name')
          .eq('id', threadData.user_id)
          .single()
        authorInfo = userData
      }

      setThread({
        ...threadData,
        users: authorInfo,
        profiles: { display_name: authorInfo?.display_name || null },
      } as unknown as ThreadWithAuthor)
    } catch (error) {
      console.error('Error fetching thread:', error)
    }
  }

  async function fetchComments() {
    if (!id) return

    try {
      // Get comments
      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select('*')
        .eq('thread_id', id)
        .order('created_at', { ascending: true })

      if (commentsError) {
        console.error('Error fetching comments:', commentsError)
        return
      }

      if (!commentsData || commentsData.length === 0) {
        setComments([])
        return
      }

      // Get unique user IDs from comments
      const userIds = [...new Set(commentsData.map((c) => c.user_id))]

      // Fetch user info for all commenters
      const { data: usersData } = await supabase
        .from('users')
        .select('id, display_name')
        .in('id', userIds)

      const usersMap = new Map(usersData?.map((u) => [u.id, u]) || [])

      // Combine comments with user info
      const commentsWithUsers = commentsData.map((comment) => ({
        ...comment,
        profiles: {
          display_name: usersMap.get(comment.user_id)?.display_name || null,
        },
      }))

      setComments(commentsWithUsers as unknown as ThreadCommentWithUser[])
    } catch (error) {
      console.error('Error fetching comments:', error)
      setComments([])
    }
  }

  async function checkNgWords(text: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('ng_words')
      .select('word')

    if (error) {
      console.error('Error fetching NG words:', error)
      return false
    }

    if (!data || data.length === 0) return false

    const ngWords = (data as { word: string }[]).map((item) => item.word.toLowerCase())
    const lowerText = text.toLowerCase()

    return ngWords.some((word) => lowerText.includes(word))
  }

  async function handleSubmitComment(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !commentContent.trim() || !id) return

    setError('')
    setSubmitting(true)

    // Check for NG words
    const hasNgWord = await checkNgWords(commentContent)
    if (hasNgWord) {
      setError('不適切な表現が含まれている可能性があります')
      setSubmitting(false)
      return
    }

    const { error: insertError } = await supabase
      .from('comments')
      .insert({
        thread_id: id,
        user_id: user.id,
        body: commentContent,
      } as never)

    if (insertError) {
      setError('コメントの投稿に失敗しました')
      console.error('Error posting comment:', insertError)
    } else {
      setCommentContent('')
      fetchComments()
      // Update thread comments count
      if (thread) {
        await supabase
          .from('threads')
          .update({ comments_count: thread.comments_count + 1 } as never)
          .eq('id', id)
        setThread({ ...thread, comments_count: thread.comments_count + 1 })

        // Send notification email to thread author (if not the same user)
        if (thread.user_id !== user.id && thread.users?.email) {
          // Get current user's display name
          const { data: currentUserData } = await supabase
            .from('users')
            .select('display_name')
            .eq('id', user.id)
            .single()

          sendCommentNotificationEmail({
            threadAuthorEmail: thread.users.email,
            threadAuthorName: thread.users.display_name || 'ユーザー',
            threadTitle: thread.title,
            threadId: thread.id,
            commenterName: currentUserData?.display_name || '匿名',
            commentContent: commentContent,
          }).catch((e) => {
            console.error('Failed to send comment notification:', e)
          })
        }
      }
    }

    setSubmitting(false)
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString)
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 size={32} className="animate-spin text-green-600" />
      </div>
    )
  }

  if (!thread) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">スレッドが見つかりませんでした</p>
          <Link
            to="/threads"
            className="inline-flex items-center gap-2 text-green-600 hover:underline"
          >
            <ArrowLeft size={20} />
            <span>スレッド一覧に戻る</span>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back Link */}
      <Link
        to="/threads"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-green-600 mb-6"
      >
        <ArrowLeft size={20} />
        <span>スレッド一覧に戻る</span>
      </Link>

      {/* Thread Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className={`px-2 py-0.5 text-xs font-medium rounded ${categoryColors[thread.category]}`}>
            {THREAD_CATEGORY_LABELS[thread.category]}
          </span>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">{thread.title}</h1>
        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mb-4">
          <Link
            to={`/users/${thread.user_id}`}
            className="font-medium text-gray-700 hover:text-green-600 hover:underline"
          >
            {thread.profiles?.display_name || '匿名'}
          </Link>
          <span className="text-gray-400">|</span>
          <span>{formatDate(thread.created_at)}</span>
        </div>
        <div className="prose prose-gray max-w-none">
          <p className="whitespace-pre-wrap text-gray-700">{(thread as any).body || thread.content}</p>
        </div>
      </div>

      {/* Comments Section */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2">
            <MessageSquare size={20} className="text-gray-600" />
            <h2 className="font-semibold text-gray-800">
              コメント ({thread.comments_count})
            </h2>
          </div>
        </div>

        {/* Comments List */}
        {comments.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-500">
            まだコメントはありません
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {comments.map((comment, index) => (
              <div key={comment.id} className="px-6 py-4">
                <div className="flex items-start gap-3">
                  <div className="shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-green-600">
                      {index + 1}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-sm mb-2">
                      <Link
                        to={`/users/${comment.user_id}`}
                        className="font-medium text-gray-700 hover:text-green-600 hover:underline"
                      >
                        {comment.profiles?.display_name || '匿名'}
                      </Link>
                      <span className="text-gray-400 text-xs">
                        {formatDate(comment.created_at)}
                      </span>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap">{(comment as any).body || comment.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Comment Form */}
        {user ? (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <form onSubmit={handleSubmitComment}>
              {error && (
                <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  <AlertCircle size={18} />
                  <span className="text-sm">{error}</span>
                </div>
              )}
              <div className="flex gap-3">
                <textarea
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  placeholder="コメントを入力..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors resize-none"
                  rows={3}
                  required
                />
                <button
                  type="submit"
                  disabled={submitting || !commentContent.trim()}
                  className="self-end px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-400 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <Send size={20} />
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 text-center">
            <p className="text-gray-600 text-sm">
              コメントするには
              <Link to="/login" className="text-green-600 hover:underline mx-1">
                ログイン
              </Link>
              してください
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
