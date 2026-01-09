import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Thread, ThreadCommentWithUser, THREAD_CATEGORY_LABELS } from '../../types/database'
import { Loader2, MessageSquare, FileText, Calendar, ChevronRight } from 'lucide-react'

type HistoryTab = 'threads' | 'comments'

export function PostHistory() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<HistoryTab>('threads')
  const [threads, setThreads] = useState<Thread[]>([])
  const [comments, setComments] = useState<ThreadCommentWithUser[]>([])
  const [loadingThreads, setLoadingThreads] = useState(true)
  const [loadingComments, setLoadingComments] = useState(true)

  useEffect(() => {
    if (user) {
      fetchThreads()
      fetchComments()
    } else {
      // Reset loading states when user is not available
      setLoadingThreads(false)
      setLoadingComments(false)
    }
  }, [user])

  async function fetchThreads() {
    if (!user) return

    const { data, error } = await supabase
      .from('threads')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching threads:', error)
    } else {
      setThreads(data as unknown as Thread[])
    }
    setLoadingThreads(false)
  }

  async function fetchComments() {
    if (!user) return

    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        threads:thread_id (id, title)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Error fetching comments:', error)
    } else {
      setComments(data as unknown as ThreadCommentWithUser[])
    }
    setLoadingComments(false)
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString)
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  function formatRelativeTime(dateString: string) {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'たった今'
    if (minutes < 60) return `${minutes}分前`
    if (hours < 24) return `${hours}時間前`
    if (days < 7) return `${days}日前`
    return formatDate(dateString)
  }

  return (
    <div className="space-y-4">
      {/* Sub Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-3">
        <button
          onClick={() => setActiveTab('threads')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 'threads'
              ? 'bg-rose-100 text-rose-600'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <FileText size={16} />
          <span>スレッド</span>
          <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
            {threads.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('comments')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 'comments'
              ? 'bg-rose-100 text-rose-600'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <MessageSquare size={16} />
          <span>コメント</span>
          <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
            {comments.length}
          </span>
        </button>
      </div>

      {/* Threads List */}
      {activeTab === 'threads' && (
        <div>
          {loadingThreads ? (
            <div className="flex justify-center py-8">
              <Loader2 size={24} className="animate-spin text-rose-500" />
            </div>
          ) : threads.length > 0 ? (
            <div className="space-y-3">
              {threads.map((thread) => (
                <Link
                  key={thread.id}
                  to={`/threads/${thread.id}`}
                  className="block bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs px-2 py-0.5 bg-rose-100 text-rose-600 rounded">
                          {THREAD_CATEGORY_LABELS[thread.category]}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar size={12} />
                          {formatRelativeTime(thread.created_at)}
                        </span>
                      </div>
                      <h4 className="font-medium text-gray-900 truncate">
                        {thread.title}
                      </h4>
                      <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                        {thread.content}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                        <MessageSquare size={12} />
                        <span>{thread.comments_count}件のコメント</span>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-gray-400 flex-shrink-0" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FileText size={32} className="mx-auto mb-2 text-gray-300" />
              <p>まだスレッドを投稿していません</p>
              <Link
                to="/threads/new"
                className="inline-block mt-3 text-rose-500 hover:underline text-sm"
              >
                最初のスレッドを投稿する
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Comments List */}
      {activeTab === 'comments' && (
        <div>
          {loadingComments ? (
            <div className="flex justify-center py-8">
              <Loader2 size={24} className="animate-spin text-rose-500" />
            </div>
          ) : comments.length > 0 ? (
            <div className="space-y-3">
              {comments.map((comment) => (
                <Link
                  key={comment.id}
                  to={`/threads/${comment.thread_id}`}
                  className="block bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      {comment.threads && (
                        <div className="text-xs text-rose-500 mb-1 truncate">
                          スレッド: {comment.threads.title}
                        </div>
                      )}
                      <p className="text-sm text-gray-700 line-clamp-3">
                        {comment.content}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                        <Calendar size={12} />
                        <span>{formatRelativeTime(comment.created_at)}</span>
                        <span className="text-gray-300">•</span>
                        <span>#{comment.comment_number}</span>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-gray-400 flex-shrink-0" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare size={32} className="mx-auto mb-2 text-gray-300" />
              <p>まだコメントを投稿していません</p>
              <Link
                to="/threads"
                className="inline-block mt-3 text-rose-500 hover:underline text-sm"
              >
                スレッドを見る
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
