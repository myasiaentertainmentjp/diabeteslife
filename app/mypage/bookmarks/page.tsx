'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Thread, THREAD_CATEGORY_LABELS, ThreadCategory } from '@/types/database'
import { Loader2, MessageSquare, Calendar, ChevronRight, Bookmark, Trash2, ArrowLeft } from 'lucide-react'

interface BookmarkWithThread {
  id: string
  thread_id: string
  created_at: string
  threads: Thread & { thread_number: number }
}

export default function BookmarksPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const supabase = createClient()
  const [bookmarks, setBookmarks] = useState<BookmarkWithThread[]>([])
  const [loading, setLoading] = useState(true)
  const [removingId, setRemovingId] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/mypage/bookmarks')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      fetchBookmarks()
    } else {
      setLoading(false)
    }
  }, [user])

  async function fetchBookmarks() {
    if (!user) return

    const { data, error } = await supabase
      .from('thread_bookmarks')
      .select(`
        id,
        thread_id,
        created_at,
        threads (
          id,
          thread_number,
          title,
          content,
          category,
          comments_count,
          created_at
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching bookmarks:', error)
    } else {
      setBookmarks(data as unknown as BookmarkWithThread[])
    }
    setLoading(false)
  }

  async function removeBookmark(bookmarkId: string, e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    if (!user) return

    setRemovingId(bookmarkId)

    const { error } = await supabase
      .from('thread_bookmarks')
      .delete()
      .eq('id', bookmarkId)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error removing bookmark:', error)
    } else {
      setBookmarks(prev => prev.filter(b => b.id !== bookmarkId))
    }

    setRemovingId(null)
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

      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
          <Bookmark size={24} className="text-amber-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">ブックマーク</h1>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 size={24} className="animate-spin text-rose-500" />
          </div>
        ) : bookmarks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Bookmark size={32} className="mx-auto mb-2 text-gray-300" />
            <p>ブックマークしたトピックはありません</p>
            <Link
              href="/threads"
              className="inline-block mt-3 text-rose-500 hover:underline text-sm"
            >
              トピックを探す
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-500 mb-4">
              {bookmarks.length}件のブックマーク
            </p>

            {bookmarks.map((bookmark) => (
              <Link
                key={bookmark.id}
                href={`/threads/${bookmark.threads?.thread_number || bookmark.thread_id}`}
                className="block bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs px-2 py-0.5 bg-rose-100 text-rose-600 rounded">
                        {bookmark.threads && THREAD_CATEGORY_LABELS[bookmark.threads.category as ThreadCategory]}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar size={12} />
                        {bookmark.threads && formatRelativeTime(bookmark.threads.created_at)}
                      </span>
                    </div>
                    <h4 className="font-medium text-gray-900 truncate">
                      {bookmark.threads?.title}
                    </h4>
                    <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                      {bookmark.threads?.content}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <MessageSquare size={12} />
                        {bookmark.threads?.comments_count}件のコメント
                      </span>
                      <span className="flex items-center gap-1 text-amber-500">
                        <Bookmark size={12} />
                        {formatRelativeTime(bookmark.created_at)}に保存
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={(e) => removeBookmark(bookmark.id, e)}
                      disabled={removingId === bookmark.id}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="ブックマークを解除"
                    >
                      {removingId === bookmark.id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                    <ChevronRight size={20} className="text-gray-400" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
