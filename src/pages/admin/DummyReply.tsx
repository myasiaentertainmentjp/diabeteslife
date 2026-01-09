import { useState, useEffect } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useToast } from '../../contexts/ToastContext'
import { AppUser, Thread, ThreadCommentWithUser } from '../../types/database'
import { Bot, Send, Loader2, ArrowLeft, MessageSquare, ExternalLink } from 'lucide-react'

export function DummyReply() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { showToast } = useToast()

  const threadId = searchParams.get('thread')
  const commentId = searchParams.get('comment')

  const [thread, setThread] = useState<Thread | null>(null)
  const [comments, setComments] = useState<ThreadCommentWithUser[]>([])
  const [dummyUsers, setDummyUsers] = useState<AppUser[]>([])
  const [selectedDummyId, setSelectedDummyId] = useState<string>('')
  const [replyContent, setReplyContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (threadId) {
      fetchData()
    }
  }, [threadId])

  async function fetchData() {
    setLoading(true)
    try {
      // Fetch thread
      const { data: threadData, error: threadError } = await supabase
        .from('threads')
        .select('*')
        .eq('id', threadId)
        .single()

      if (threadError) {
        console.error('Error fetching thread:', threadError)
        showToast('スレッドの取得に失敗しました', 'error')
        return
      }
      setThread(threadData as Thread)

      // Fetch comments with user info
      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select('*')
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true })

      if (commentsError) {
        console.error('Error fetching comments:', commentsError)
      } else if (commentsData) {
        // Get user info
        const userIds = [...new Set(commentsData.map((c) => c.user_id))]
        const { data: usersData } = await supabase
          .from('users')
          .select('id, display_name, is_dummy')
          .in('id', userIds)

        const usersMap = new Map(usersData?.map((u) => [u.id, u]) || [])

        const commentsWithUsers = commentsData.map((comment) => ({
          ...comment,
          profiles: usersMap.get(comment.user_id) || { display_name: null, is_dummy: false },
        }))

        setComments(commentsWithUsers as unknown as ThreadCommentWithUser[])
      }

      // Fetch dummy users
      const { data: dummyData, error: dummyError } = await supabase
        .from('users')
        .select('*')
        .eq('is_dummy', true)
        .order('display_name', { ascending: true })

      if (dummyError) {
        console.error('Error fetching dummy users:', dummyError)
      } else {
        setDummyUsers(dummyData || [])
        // Auto-select thread author if they're a dummy user
        if (threadData) {
          const authorIsDummy = dummyData?.some((d) => d.id === threadData.user_id)
          if (authorIsDummy) {
            setSelectedDummyId(threadData.user_id)
          }
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedDummyId || !replyContent.trim() || !threadId || !thread) return

    setSubmitting(true)

    const { error } = await supabase
      .from('comments')
      .insert({
        thread_id: threadId,
        user_id: selectedDummyId,
        body: replyContent.trim(),
      } as never)

    if (error) {
      console.error('Error posting reply:', error)
      showToast('返信に失敗しました', 'error')
    } else {
      // Update comments count
      await supabase
        .from('threads')
        .update({ comments_count: thread.comments_count + 1 } as never)
        .eq('id', threadId)

      showToast('ダミーユーザーとして返信しました', 'success')
      setReplyContent('')
      fetchData()

      // Mark related notification as read if commentId is provided
      if (commentId) {
        await supabase
          .from('admin_notifications')
          .update({ is_read: true })
          .eq('comment_id', commentId)
      }
    }

    setSubmitting(false)
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString)
    return date.toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 size={32} className="animate-spin text-rose-500" />
      </div>
    )
  }

  if (!thread) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">スレッドが見つかりませんでした</p>
        <Link
          to="/admin/notifications"
          className="inline-flex items-center gap-2 text-rose-500 hover:underline"
        >
          <ArrowLeft size={20} />
          <span>通知一覧に戻る</span>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bot className="text-blue-500" />
            ダミーユーザーで返信
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            選択したダミーユーザーとしてコメントを投稿します
          </p>
        </div>
        <Link
          to={`/threads/${threadId}`}
          target="_blank"
          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <ExternalLink size={16} />
          <span>スレッドを見る</span>
        </Link>
      </div>

      {/* Thread Info */}
      <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-rose-500">
        <h2 className="font-semibold text-gray-900 mb-2">{thread.title}</h2>
        <p className="text-sm text-gray-600 line-clamp-2">{thread.content}</p>
      </div>

      {/* Recent Comments */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="font-medium text-gray-800 flex items-center gap-2">
            <MessageSquare size={16} />
            最近のコメント ({comments.length})
          </h3>
        </div>
        <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
          {comments.length === 0 ? (
            <div className="px-4 py-6 text-center text-gray-500">
              まだコメントはありません
            </div>
          ) : (
            comments.slice(-10).map((comment, index) => {
              const isDummy = (comment.profiles as any)?.is_dummy
              const isHighlighted = comment.id === commentId
              return (
                <div
                  key={comment.id}
                  className={`px-4 py-3 ${isHighlighted ? 'bg-yellow-50' : ''}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-gray-500">
                      #{comments.indexOf(comment) + 1}
                    </span>
                    <span className="font-medium text-sm text-gray-700">
                      {comment.profiles?.display_name || '匿名'}
                    </span>
                    {isDummy && (
                      <Bot size={12} className="text-blue-500" />
                    )}
                    <span className="text-xs text-gray-400">
                      {formatDate(comment.created_at)}
                    </span>
                    {isHighlighted && (
                      <span className="text-xs bg-yellow-200 text-yellow-800 px-1.5 py-0.5 rounded">
                        対象コメント
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    {(comment as any).body || comment.content}
                  </p>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Reply Form */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="font-medium text-gray-800 mb-4">返信を作成</h3>

        {dummyUsers.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <Bot size={32} className="mx-auto mb-2 text-gray-300" />
            <p>ダミーユーザーがいません</p>
            <p className="text-sm mt-1">
              <Link to="/admin/users" className="text-rose-500 hover:underline">
                ユーザー管理
              </Link>
              でダミーユーザーを設定してください
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Dummy User Select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                返信するダミーユーザー
              </label>
              <select
                value={selectedDummyId}
                onChange={(e) => setSelectedDummyId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
                required
              >
                <option value="">ダミーユーザーを選択...</option>
                {dummyUsers.map((dummy) => (
                  <option key={dummy.id} value={dummy.id}>
                    {dummy.display_name || 'ダミーユーザー'}
                    {dummy.id === thread.user_id && ' (スレッド作成者)'}
                  </option>
                ))}
              </select>
            </div>

            {/* Reply Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                返信内容
              </label>
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="返信を入力..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none resize-none"
                rows={5}
                required
              />
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-between">
              <Link
                to="/admin/notifications"
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft size={20} className="inline mr-1" />
                通知一覧に戻る
              </Link>
              <button
                type="submit"
                disabled={submitting || !selectedDummyId || !replyContent.trim()}
                className="inline-flex items-center gap-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    <Bot size={18} />
                    <Send size={18} />
                  </>
                )}
                <span>ダミーとして返信</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
