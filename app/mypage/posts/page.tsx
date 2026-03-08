'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Thread, THREAD_CATEGORY_LABELS, ThreadCategory } from '@/types/database'
import { Loader2, MessageSquare, FileText, Calendar, ChevronRight, Clock, ArrowLeft } from 'lucide-react'

type HistoryTab = 'threads' | 'comments'

interface Comment {
  id: string
  thread_id: string
  user_id: string
  body: string
  comment_number: number
  created_at: string
  is_hidden: boolean
  threads: { id: string; title: string; thread_number: number } | null
}

export default function PostHistoryPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const supabase = createClient()
  const [activeTab, setActiveTab] = useState<HistoryTab>('threads')
  const [threads, setThreads] = useState<Thread[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [loadingThreads, setLoadingThreads] = useState(true)
  const [loadingComments, setLoadingComments] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/mypage/posts')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      fetchThreads()
      fetchComments()
    } else {
      setLoadingThreads(false)
      setLoadingComments(false)
    }
  }, [user])

  async function fetchThreads() {
    if (!user) return

    const now = new Date().toISOString()

    const { data, error } = await supabase
      .from('threads')
      .select('*')
      .eq('user_id', user.id)
      .lte('created_at', now)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching threads:', error)
    } else {
      setThreads(data as Thread[])
    }
    setLoadingThreads(false)
  }

  async function fetchComments() {
    if (!user) return

    const { data, error } = await supabase
      .from('comments')
      .select(`
        id,
        thread_id,
        user_id,
        body,
        comment_number,
        created_at,
        is_hidden,
        threads:thread_id (id, title, thread_number)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Error fetching comments:', error)
    } else if (data) {
      const formattedComments = data.map((item) => ({
        ...item,
        threads: Array.isArray(item.threads) ? item.threads[0] || null : item.threads,
      }))
      setComments(formattedComments as Comment[])
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

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 size={32} className="animate-spin text-rose-500" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <button
        onClick={() => router.push('/mypage')}
        className="inline-flex items-center gap-2 text-gray-600 hover:text-rose-500 mb-6"
      >
        <ArrowLeft size={20} />
        <span>マイページに戻る</span>
      </button>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">投稿履歴</h1>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {/* Sub Tabs */}
        <div className="flex gap-2 border-b border-gray-200 pb-3 mb-4">
          <button
            onClick={() => setActiveTab('threads')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'threads'
                ? 'bg-rose-100 text-rose-600'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <FileText size={16} />
            <span>トピック</span>
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
                    href={`/threads/${(thread as Thread & { thread_number?: number }).thread_number || thread.id}`}
                    className="block bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs px-2 py-0.5 bg-rose-100 text-rose-600 rounded">
                            {THREAD_CATEGORY_LABELS[thread.category as ThreadCategory]}
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
                <p>まだトピックを投稿していません</p>
                <Link
                  href="/threads/new"
                  className="inline-block mt-3 text-rose-500 hover:underline text-sm"
                >
                  最初のトピックを投稿する
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
                {comments.map((comment) => {
                  const isScheduled = comment.is_hidden || new Date(comment.created_at) > new Date()
                  return (
                    <Link
                      key={comment.id}
                      href={`/threads/${comment.threads?.thread_number || comment.thread_id}`}
                      className={`block rounded-lg p-4 transition-colors ${
                        isScheduled
                          ? 'bg-yellow-50 hover:bg-yellow-100 border border-yellow-200'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {comment.threads && (
                              <span className="text-xs text-rose-500 truncate">
                                トピック: {comment.threads.title}
                              </span>
                            )}
                            {isScheduled && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-700 rounded">
                                <Clock size={10} />
                                予約中
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-700 line-clamp-3">
                            {comment.body}
                          </p>
                          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                            <Calendar size={12} />
                            <span>
                              {isScheduled
                                ? `${formatDate(comment.created_at)} に公開予定`
                                : formatRelativeTime(comment.created_at)
                              }
                            </span>
                            {!isScheduled && (
                              <>
                                <span className="text-gray-300">•</span>
                                <span>#{comment.comment_number}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <ChevronRight size={20} className="text-gray-400 flex-shrink-0" />
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare size={32} className="mx-auto mb-2 text-gray-300" />
                <p>まだコメントを投稿していません</p>
                <Link
                  href="/threads"
                  className="inline-block mt-3 text-rose-500 hover:underline text-sm"
                >
                  トピックを見る
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
