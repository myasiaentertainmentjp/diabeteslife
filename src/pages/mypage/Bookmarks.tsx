import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Thread, THREAD_CATEGORY_LABELS } from '../../types/database'
import { Loader2, MessageSquare, Calendar, ChevronRight, Bookmark, Trash2 } from 'lucide-react'

interface BookmarkWithThread {
  id: string
  thread_id: string
  created_at: string
  threads: Thread & { thread_number: number }
}

export function Bookmarks() {
  const { user } = useAuth()
  const [bookmarks, setBookmarks] = useState<BookmarkWithThread[]>([])
  const [loading, setLoading] = useState(true)
  const [removingId, setRemovingId] = useState<string | null>(null)

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

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 size={24} className="animate-spin text-rose-500" />
      </div>
    )
  }

  if (bookmarks.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Bookmark size={32} className="mx-auto mb-2 text-gray-300" />
        <p>ブックマークしたトピックはありません</p>
        <Link
          to="/threads"
          className="inline-block mt-3 text-rose-500 hover:underline text-sm"
        >
          トピックを探す
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500 mb-4">
        {bookmarks.length}件のブックマーク
      </p>

      {bookmarks.map((bookmark) => (
        <Link
          key={bookmark.id}
          to={`/threads/${bookmark.threads.thread_number}`}
          className="block bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs px-2 py-0.5 bg-rose-100 text-rose-600 rounded">
                  {THREAD_CATEGORY_LABELS[bookmark.threads.category]}
                </span>
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <Calendar size={12} />
                  {formatRelativeTime(bookmark.threads.created_at)}
                </span>
              </div>
              <h4 className="font-medium text-gray-900 truncate">
                {bookmark.threads.title}
              </h4>
              <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                {bookmark.threads.content}
              </p>
              <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <MessageSquare size={12} />
                  {bookmark.threads.comments_count}件のコメント
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
  )
}
