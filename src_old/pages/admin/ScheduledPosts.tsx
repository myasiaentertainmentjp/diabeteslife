import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useToast } from '../../contexts/ToastContext'
import { AppUser, Thread, ThreadCategory, THREAD_CATEGORY_LABELS } from '../../types/database'
import {
  Calendar,
  Clock,
  MessageSquare,
  FileText,
  Loader2,
  Play,
  Pause,
  Trash2,
  Bot,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Plus,
} from 'lucide-react'

interface ScheduledPost {
  id: string
  type: 'thread' | 'comment'
  title: string | null
  category: ThreadCategory | null
  thread_id: string | null
  content: string
  user_id: string
  scheduled_at: string
  status: 'pending' | 'posted' | 'cancelled'
  posted_at: string | null
  created_at: string
  // Joined data
  users?: { display_name: string | null }
  threads?: { title: string; thread_number: number }
}

export function ScheduledPosts() {
  const { showToast } = useToast()
  const [posts, setPosts] = useState<ScheduledPost[]>([])
  const [dummyUsers, setDummyUsers] = useState<AppUser[]>([])
  const [threads, setThreads] = useState<Thread[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [filter, setFilter] = useState<'all' | 'pending' | 'posted' | 'cancelled'>('pending')

  // Form state for adding new scheduled post
  const [showForm, setShowForm] = useState(false)
  const [formType, setFormType] = useState<'thread' | 'comment'>('comment')
  const [formTitle, setFormTitle] = useState('')
  const [formCategory, setFormCategory] = useState<ThreadCategory>('chat_other')
  const [formThreadId, setFormThreadId] = useState('')
  const [formContent, setFormContent] = useState('')
  const [formUserId, setFormUserId] = useState('')
  const [formScheduledAt, setFormScheduledAt] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchData()
  }, [filter])

  async function fetchData() {
    setLoading(true)
    try {
      // Fetch scheduled posts
      let query = supabase
        .from('scheduled_posts')
        .select('*')
        .order('scheduled_at', { ascending: true })

      if (filter !== 'all') {
        query = query.eq('status', filter)
      }

      const { data: postsData, error: postsError } = await query

      if (postsError) {
        console.error('Error fetching scheduled posts:', postsError)
        showToast('スケジュール投稿の取得に失敗しました', 'error')
        return
      }

      // Get user info
      if (postsData && postsData.length > 0) {
        const userIds = [...new Set(postsData.map((p) => p.user_id))]
        const { data: usersData } = await supabase
          .from('users')
          .select('id, display_name')
          .in('id', userIds)

        const usersMap = new Map(usersData?.map((u) => [u.id, u]) || [])

        // Get thread info for comments
        const threadIds = postsData
          .filter((p) => p.thread_id)
          .map((p) => p.thread_id)

        let threadsMap = new Map<string, { title: string; thread_number: number }>()
        if (threadIds.length > 0) {
          const { data: threadsData } = await supabase
            .from('threads')
            .select('id, title, thread_number')
            .in('id', threadIds)
          threadsMap = new Map(threadsData?.map((t) => [t.id, t]) || [])
        }

        const postsWithDetails = postsData.map((post) => ({
          ...post,
          users: usersMap.get(post.user_id),
          threads: post.thread_id ? threadsMap.get(post.thread_id) : undefined,
        }))

        setPosts(postsWithDetails as ScheduledPost[])
      } else {
        setPosts([])
      }

      // Fetch dummy users
      const { data: dummyData } = await supabase
        .from('users')
        .select('*')
        .eq('is_dummy', true)
        .order('display_name')
      setDummyUsers(dummyData || [])

      // Fetch threads for dropdown
      const { data: threadsData } = await supabase
        .from('threads')
        .select('*')
        .eq('status', 'normal')
        .order('created_at', { ascending: false })
        .limit(100)
      setThreads(threadsData || [])

    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  async function processNow() {
    setProcessing(true)
    try {
      const { error } = await supabase.rpc('process_scheduled_posts')
      if (error) {
        console.error('Error processing scheduled posts:', error)
        showToast('処理に失敗しました', 'error')
      } else {
        showToast('スケジュール済み投稿を処理しました', 'success')
        fetchData()
      }
    } catch (error) {
      console.error('Error:', error)
      showToast('処理に失敗しました', 'error')
    } finally {
      setProcessing(false)
    }
  }

  async function cancelPost(id: string) {
    const { error } = await supabase
      .from('scheduled_posts')
      .update({ status: 'cancelled' })
      .eq('id', id)

    if (error) {
      showToast('キャンセルに失敗しました', 'error')
    } else {
      showToast('投稿をキャンセルしました', 'success')
      fetchData()
    }
  }

  async function deletePost(id: string) {
    const { error } = await supabase
      .from('scheduled_posts')
      .delete()
      .eq('id', id)

    if (error) {
      showToast('削除に失敗しました', 'error')
    } else {
      showToast('投稿を削除しました', 'success')
      fetchData()
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formUserId || !formContent.trim() || !formScheduledAt) return

    setSubmitting(true)

    const newPost = {
      type: formType,
      title: formType === 'thread' ? formTitle : null,
      category: formType === 'thread' ? formCategory : null,
      thread_id: formType === 'comment' ? formThreadId : null,
      content: formContent.trim(),
      user_id: formUserId,
      scheduled_at: new Date(formScheduledAt).toISOString(),
      status: 'pending',
    }

    const { error } = await supabase
      .from('scheduled_posts')
      .insert(newPost as never)

    if (error) {
      console.error('Error creating scheduled post:', error)
      showToast('作成に失敗しました', 'error')
    } else {
      showToast('スケジュール投稿を作成しました', 'success')
      setShowForm(false)
      resetForm()
      fetchData()
    }

    setSubmitting(false)
  }

  function resetForm() {
    setFormType('comment')
    setFormTitle('')
    setFormCategory('chat_other')
    setFormThreadId('')
    setFormContent('')
    setFormUserId('')
    setFormScheduledAt('')
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString)
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-700 rounded">
            <Clock size={12} />
            予約中
          </span>
        )
      case 'posted':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded">
            <CheckCircle size={12} />
            投稿済み
          </span>
        )
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded">
            <AlertCircle size={12} />
            キャンセル
          </span>
        )
    }
  }

  // Validate >>N references in content
  function validateReferences(content: string, threadId: string): { valid: boolean; error?: string } {
    const refs = content.match(/>>(\d+)/g)
    if (!refs) return { valid: true }

    // Get the current comment count for this thread
    const thread = threads.find((t) => t.id === threadId)
    if (!thread) return { valid: true }

    // Count pending scheduled comments for this thread
    const pendingForThread = posts.filter(
      (p) => p.thread_id === threadId && p.status === 'pending' && p.type === 'comment'
    ).length

    // Total comments = existing + pending + 1 (thread OP)
    const maxRef = thread.comments_count + pendingForThread + 1

    for (const ref of refs) {
      const num = parseInt(ref.replace('>>', ''))
      if (num > maxRef) {
        return {
          valid: false,
          error: `>>N の参照エラー: >>${num} は存在しません（最大: >>${maxRef}）`,
        }
      }
    }

    return { valid: true }
  }

  const pendingCount = posts.filter((p) => p.status === 'pending').length

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 size={32} className="animate-spin text-rose-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="text-blue-500" />
            スケジュール投稿
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            ダミーコンテンツの予約投稿を管理します
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={processNow}
            disabled={processing || pendingCount === 0}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {processing ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Play size={18} />
            )}
            今すぐ処理 ({pendingCount})
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
          >
            <Plus size={18} />
            新規追加
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {(['pending', 'posted', 'cancelled', 'all'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              filter === f
                ? 'border-rose-500 text-rose-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {f === 'pending' && '予約中'}
            {f === 'posted' && '投稿済み'}
            {f === 'cancelled' && 'キャンセル'}
            {f === 'all' && 'すべて'}
          </button>
        ))}
      </div>

      {/* Posts list */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {posts.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500">
            <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
            <p>スケジュール投稿はありません</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {posts.map((post) => (
              <div key={post.id} className="px-6 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-2">
                      {post.type === 'thread' ? (
                        <FileText size={16} className="text-blue-500" />
                      ) : (
                        <MessageSquare size={16} className="text-green-500" />
                      )}
                      <span className="text-xs font-medium text-gray-500">
                        {post.type === 'thread' ? 'スレッド' : 'コメント'}
                      </span>
                      {getStatusBadge(post.status)}
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock size={12} />
                        {formatDate(post.scheduled_at)}
                      </span>
                    </div>

                    {/* Thread title or target thread */}
                    {post.type === 'thread' ? (
                      <div className="mb-2">
                        <span className="font-medium text-gray-900">{post.title}</span>
                        {post.category && (
                          <span className="ml-2 text-xs text-gray-500">
                            [{THREAD_CATEGORY_LABELS[post.category]}]
                          </span>
                        )}
                      </div>
                    ) : post.threads && (
                      <div className="mb-2 text-sm text-gray-600">
                        返信先: #{post.threads.thread_number} {post.threads.title}
                      </div>
                    )}

                    {/* Content preview */}
                    <p className="text-sm text-gray-700 line-clamp-2">{post.content}</p>

                    {/* User */}
                    <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                      <Bot size={12} className="text-blue-500" />
                      {post.users?.display_name || '不明'}
                    </div>
                  </div>

                  {/* Actions */}
                  {post.status === 'pending' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => cancelPost(post.id)}
                        className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                        title="キャンセル"
                      >
                        <Pause size={18} />
                      </button>
                      <button
                        onClick={() => deletePost(post.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="削除"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">スケジュール投稿を追加</h2>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  投稿タイプ
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="comment"
                      checked={formType === 'comment'}
                      onChange={(e) => setFormType(e.target.value as 'comment')}
                      className="text-rose-500 focus:ring-rose-500"
                    />
                    <span className="text-sm">コメント</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="thread"
                      checked={formType === 'thread'}
                      onChange={(e) => setFormType(e.target.value as 'thread')}
                      className="text-rose-500 focus:ring-rose-500"
                    />
                    <span className="text-sm">スレッド</span>
                  </label>
                </div>
              </div>

              {/* Thread-specific fields */}
              {formType === 'thread' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      タイトル
                    </label>
                    <input
                      type="text"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      カテゴリ
                    </label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as ThreadCategory)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
                    >
                      {Object.entries(THREAD_CATEGORY_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {/* Comment-specific fields */}
              {formType === 'comment' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    返信先スレッド
                  </label>
                  <select
                    value={formThreadId}
                    onChange={(e) => setFormThreadId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
                    required
                  >
                    <option value="">スレッドを選択...</option>
                    {threads.map((thread) => (
                      <option key={thread.id} value={thread.id}>
                        #{thread.thread_number} {thread.title.substring(0, 40)}
                        {thread.title.length > 40 ? '...' : ''} ({thread.comments_count}件)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* User */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  投稿ユーザー (ダミー)
                </label>
                <select
                  value={formUserId}
                  onChange={(e) => setFormUserId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
                  required
                >
                  <option value="">ユーザーを選択...</option>
                  {dummyUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.display_name || 'ダミーユーザー'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  内容
                </label>
                <textarea
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none resize-none"
                  rows={5}
                  placeholder="コメント内容を入力...&#10;>>N で既存のコメントに返信できます"
                  required
                />
                {formType === 'comment' && formThreadId && formContent.includes('>>') && (
                  <div className="mt-1">
                    {(() => {
                      const validation = validateReferences(formContent, formThreadId)
                      if (!validation.valid) {
                        return (
                          <p className="text-xs text-red-500 flex items-center gap-1">
                            <AlertCircle size={12} />
                            {validation.error}
                          </p>
                        )
                      }
                      return (
                        <p className="text-xs text-green-600 flex items-center gap-1">
                          <CheckCircle size={12} />
                          参照は有効です
                        </p>
                      )
                    })()}
                  </div>
                )}
              </div>

              {/* Scheduled time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  投稿日時
                </label>
                <input
                  type="datetime-local"
                  value={formScheduledAt}
                  onChange={(e) => setFormScheduledAt(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
                  required
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    resetForm()
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors disabled:bg-rose-400"
                >
                  {submitting && <Loader2 size={16} className="animate-spin" />}
                  追加
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
