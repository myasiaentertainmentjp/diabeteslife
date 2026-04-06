'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase'
import { getPresetThumbnailUrl } from '@/lib/image-utils'
import {
  THREAD_CATEGORY_LABELS,
  THREAD_CATEGORY_COLORS,
} from '@/types/database'
import {
  ArrowLeft,
  MessageSquare,
  Send,
  AlertCircle,
  Loader2,
  Reply,
  Bookmark,
} from 'lucide-react'
import { Sidebar } from './Sidebar'

interface Thread {
  id: string
  thread_number: number
  user_id: string
  title: string
  content: string
  body?: string
  category: string
  image_url?: string
  created_at: string
  comments_count: number
  users?: { email: string; display_name: string | null }
  profiles?: { display_name: string | null }
}

interface Comment {
  id: string
  thread_id: string
  user_id: string
  body?: string
  content?: string
  image_url?: string
  parent_id?: string
  is_hidden: boolean
  created_at: string
  profiles?: { display_name: string | null }
}

interface ThreadDetailClientProps {
  initialThread: Thread
  initialComments: Comment[]
  isAdmin?: boolean
}

export function ThreadDetailClient({
  initialThread,
  initialComments,
  isAdmin: _isAdmin = false,
}: ThreadDetailClientProps) {
  // Note: _isAdmin is used server-side to determine which comments to fetch
  // Future comments are only included for admin users
  void _isAdmin
  const [thread] = useState(initialThread)
  const [comments] = useState(initialComments)
  const [commentContent, setCommentContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [hoveredComment, setHoveredComment] = useState<number | null>(null)
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 })
  const [imageModal, setImageModal] = useState<string | null>(null)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [bookmarkLoading, setBookmarkLoading] = useState(false)
  const [mobileCommentOpen, setMobileCommentOpen] = useState(false)

  const mobileTextareaRef = useRef<HTMLTextAreaElement>(null)
  const { user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  // Check bookmark status
  useEffect(() => {
    async function checkBookmarkStatus() {
      if (!thread?.id || !user) return

      const { data } = await supabase
        .from('thread_bookmarks')
        .select('id')
        .eq('user_id', user.id)
        .eq('thread_id', thread.id)
        .single()

      setIsBookmarked(!!data)
    }

    checkBookmarkStatus()
  }, [thread?.id, user, supabase])

  async function toggleBookmark() {
    if (!user || !thread?.id || bookmarkLoading) return

    setBookmarkLoading(true)

    if (isBookmarked) {
      const { error } = await supabase
        .from('thread_bookmarks')
        .delete()
        .eq('user_id', user.id)
        .eq('thread_id', thread.id)

      if (!error) {
        setIsBookmarked(false)
      }
    } else {
      const { error } = await supabase
        .from('thread_bookmarks')
        .insert({
          user_id: user.id,
          thread_id: thread.id,
        } as never)

      if (!error) {
        setIsBookmarked(true)
      }
    }

    setBookmarkLoading(false)
  }

  async function checkNgWords(text: string): Promise<boolean> {
    const { data, error } = await supabase.from('ng_words').select('word')

    if (error || !data || data.length === 0) return false

    const ngWords = data.map((item: { word: string }) => item.word.toLowerCase())
    const lowerText = text.toLowerCase()

    return ngWords.some((word) => lowerText.includes(word))
  }

  // スレッドがロックされているかチェック
  const isThreadLocked = thread?.is_locked === true
  const nextThreadId = thread?.next_thread_id
  const isContinuous = thread?.is_continuous === true
  const isThreadExpired = thread?.created_at
    ? new Date(thread.created_at) < new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
    : false
  const isThreadFull = (thread?.comments_count ?? 0) >= (thread?.max_comments_count ?? 500)
  const isClosed = isThreadLocked || isThreadExpired || isThreadFull

  async function handleSubmitComment(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !commentContent.trim() || !thread?.id) return
    if (isClosed) return

    setError('')
    setSubmitting(true)

    // Check for NG words
    const hasNgWord = await checkNgWords(commentContent)
    if (hasNgWord) {
      setError('不適切な表現が含まれている可能性があります')
      setSubmitting(false)
      return
    }

    const { error: insertError } = await supabase.from('comments').insert({
      thread_id: thread.id,
      user_id: user.id,
      body: commentContent,
    } as never)

    if (insertError) {
      setError('コメントの投稿に失敗しました')
      console.error('Error posting comment:', insertError)
    } else {
      setCommentContent('')
      setMobileCommentOpen(false)
      // Refresh page to get new comments
      router.refresh()
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

  function handleReply(commentNumber: number) {
    const anchor = `>>${commentNumber} `
    if (!commentContent.includes(`>>${commentNumber}`)) {
      setCommentContent((prev) => (prev ? `${prev}${anchor}` : anchor))
    }
    setMobileCommentOpen(true)
    setTimeout(() => mobileTextareaRef.current?.focus(), 300)
  }

  function handleAnchorHover(e: React.MouseEvent, commentNumber: number) {
    const rect = e.currentTarget.getBoundingClientRect()
    setPopupPosition({
      x: rect.left,
      y: rect.bottom + window.scrollY + 8,
    })
    setHoveredComment(commentNumber)
  }

  function getCommentByNumber(num: number) {
    if (num === 1 && thread) {
      return {
        user_id: thread.user_id,
        profiles: thread.profiles,
        body: thread.body || thread.content,
      }
    }
    return comments[num - 2] || null
  }

  function renderCommentWithAnchors(text: string, totalComments: number) {
    const anchorRegex = />>(\d+)(?:-(\d+))?/g
    const parts: (string | JSX.Element)[] = []
    let lastIndex = 0
    let match

    while ((match = anchorRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index))
      }

      const startNum = parseInt(match[1], 10)

      if (startNum >= 1 && startNum <= totalComments) {
        parts.push(
          <button
            key={`${match.index}-${startNum}`}
            onClick={() => scrollToComment(startNum)}
            onMouseEnter={(e) => handleAnchorHover(e, startNum)}
            onMouseLeave={() => setHoveredComment(null)}
            className="text-blue-600 hover:text-blue-700 hover:underline font-medium"
          >
            {match[0]}
          </button>
        )
      } else {
        parts.push(match[0])
      }

      lastIndex = match.index + match[0].length
    }

    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex))
    }

    return parts.length > 0 ? parts : text
  }

  function scrollToComment(commentNumber: number) {
    setHoveredComment(null)
    const element = document.getElementById(`comment-${commentNumber}`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      element.classList.add('bg-rose-50')
      setTimeout(() => {
        element.classList.remove('bg-rose-50')
      }, 2000)
    }
  }

  const threadContent = thread.body || thread.content || ''

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Back Link */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-gray-600 hover:text-rose-500 mb-6"
      >
        <ArrowLeft size={20} />
        <span>前のページに戻る</span>
      </button>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Title Section */}
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 text-xs font-medium rounded ${
                      THREAD_CATEGORY_COLORS[thread.category as keyof typeof THREAD_CATEGORY_COLORS]
                    }`}
                  >
                    {THREAD_CATEGORY_LABELS[thread.category as keyof typeof THREAD_CATEGORY_LABELS]}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {user && (
                    <button
                      onClick={toggleBookmark}
                      disabled={bookmarkLoading}
                      className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${
                        isBookmarked
                          ? 'bg-rose-100 text-rose-600 hover:bg-rose-200'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      <Bookmark size={14} className={isBookmarked ? 'fill-current' : ''} />
                      <span>{isBookmarked ? 'ブックマーク済み' : 'ブックマーク'}</span>
                    </button>
                  )}
                </div>
              </div>
              <h1 className="text-xl font-bold text-gray-800">{thread.title}</h1>
            </div>

            {/* Original Post as 1: */}
            <div className="px-6 py-5">
              <div className="flex flex-wrap items-baseline gap-1 mb-2">
                <span className="font-bold text-rose-500">1:</span>
                <Link
                  href={`/users/${thread.user_id}`}
                  className="font-medium text-blue-800 hover:underline"
                >
                  {thread.profiles?.display_name || '匿名'}
                </Link>
                <span className="text-gray-400 text-sm ml-2">
                  {formatDate(thread.created_at)}
                </span>
              </div>
              <div className="pl-4 text-gray-900 whitespace-pre-wrap leading-relaxed">
                {threadContent}
              </div>

              {thread.image_url && (
                <div className="mt-4 pl-4">
                  <div className="relative inline-block">
                    <Image
                      src={getPresetThumbnailUrl(thread.image_url, 'detail')}
                      alt="投稿画像"
                      width={600}
                      height={384}
                      className="max-w-full max-h-96 object-contain rounded-lg border border-gray-200 cursor-pointer hover:opacity-90"
                      onClick={() => setImageModal(thread.image_url!)}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Comments Section header */}
            <div className="px-6 py-4 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <MessageSquare size={20} className="text-gray-600" />
                <h2 className="font-semibold text-gray-800">
                  コメント ({comments.length})
        {!isClosed && thread?.max_comments_count && (
          <span className="text-xs text-gray-400 ml-2">
            残り{(thread.max_comments_count - (thread.comments_count ?? 0))}件
          </span>
        )}
                </h2>
              </div>
            </div>

            {/* Comments List */}
            {comments.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                まだコメントはありません
              </div>
            ) : (
              <div className="px-6 py-2">
                {comments.map((comment, index) => {
                  const isFutureComment = new Date(comment.created_at) > new Date()

                  return (
                    <div
                      key={comment.id}
                      id={`comment-${index + 2}`}
                      className={`py-5 transition-colors duration-500 ${
                        isFutureComment ? 'opacity-50 bg-yellow-50 rounded-lg px-3' : ''
                      }`}
                    >
                      <div className="flex flex-wrap items-baseline gap-1 mb-2">
                        <span className="font-bold text-rose-500">{index + 2}:</span>
                        {isFutureComment && (
                          <span className="px-1.5 py-0.5 text-xs font-medium bg-yellow-400 text-yellow-900 rounded">
                            予約
                          </span>
                        )}
                        <Link
                          href={`/users/${comment.user_id}`}
                          className="font-medium text-blue-800 hover:underline"
                        >
                          {comment.profiles?.display_name || '匿名'}
                        </Link>
                        <span className="text-gray-400 text-sm ml-2">
                          {formatDate(comment.created_at)}
                        </span>
                        {user && (
                          <button
                            onClick={() => handleReply(index + 2)}
                            className="inline-flex items-center gap-0.5 text-xs text-gray-400 hover:text-blue-500 transition-colors ml-2"
                          >
                            <Reply size={12} />
                            <span>返信</span>
                          </button>
                        )}
                      </div>
                      <div className="pl-4 text-gray-900 whitespace-pre-wrap leading-relaxed">
                        {renderCommentWithAnchors(
                          comment.body || comment.content || '',
                          comments.length + 1
                        )}

                        {comment.image_url && (
                          <div className="mt-2">
                            <div className="relative inline-block max-w-xs">
                              <Image
                                src={getPresetThumbnailUrl(comment.image_url, 'listSquare')}
                                alt="添付画像"
                                width={320}
                                height={192}
                                className="rounded-lg border border-gray-200 cursor-pointer hover:opacity-90 object-contain"
                                onClick={() => setImageModal(comment.image_url!)}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}

                {/* Anchor Popup */}
                {hoveredComment && getCommentByNumber(hoveredComment) && (
                  <div
                    className="fixed z-50 bg-white border border-gray-300 rounded-lg shadow-lg p-3 max-w-sm"
                    style={{
                      left: Math.min(popupPosition.x, window.innerWidth - 320),
                      top: popupPosition.y,
                    }}
                    onMouseEnter={() => setHoveredComment(hoveredComment)}
                    onMouseLeave={() => setHoveredComment(null)}
                  >
                    <div className="text-xs text-gray-500 mb-1">
                      <span className="font-bold text-rose-500">{hoveredComment}:</span>{' '}
                      {getCommentByNumber(hoveredComment)?.profiles?.display_name || '匿名'}
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap line-clamp-4">
                      {getCommentByNumber(hoveredComment)?.body || ''}
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="h-16" />
          </div>
        </div>

        {/* Sidebar - hidden on mobile */}
        <div className="hidden lg:block w-80 shrink-0">
          <Sidebar showPostButton={true} showPopularThreads={true} showArticles={true} showKeywords={true} showCategories={false} />
        </div>
      </div>

      {/* スレッド締め切り表示 */}
      {isClosed && (
        <div className="mx-4 mb-4 rounded-xl overflow-hidden">
          <div className="px-4 py-3 bg-gray-100 text-center">
            <p className="text-sm text-gray-500 font-medium">
              {isThreadFull
                ? 'このスレッドはコメント数が上限（500件）に達したため締め切りました'
                : isThreadLocked
                ? '締め切られました'
                : '作成から90日が経過したため締め切りました'}
            </p>
          </div>
          {nextThreadId && (
            <a
              href={`/threads/${nextThreadId}`}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-rose-500 text-white text-sm font-medium hover:bg-rose-600 transition-colors"
            >
              <span>続きはこちら →</span>
            </a>
          )}
        </div>
      )}

      {/* Floating comment button */}
      {!mobileCommentOpen && !isClosed && (
        <button
          onClick={() => {
            setMobileCommentOpen(true)
            if (user) {
              setTimeout(() => mobileTextareaRef.current?.focus(), 300)
            }
          }}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-5 py-3 bg-rose-500 text-white rounded-full shadow-lg hover:bg-rose-600 transition-all hover:scale-105"
        >
          <MessageSquare size={20} />
          <span className="font-medium">コメント</span>
        </button>
      )}

      {/* Comment panel overlay */}
      {mobileCommentOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40"
          onClick={() => setMobileCommentOpen(false)}
        />
      )}

      {/* Expandable comment panel */}
      {mobileCommentOpen && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.15)] rounded-t-2xl">
          {user ? (
            <form
              onSubmit={(e) => {
                handleSubmitComment(e)
              }}
              className="p-4"
            >
              {error && (
                <div className="flex items-center gap-2 p-2 mb-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  <AlertCircle size={16} />
                  <span className="text-xs">{error}</span>
                </div>
              )}
              <textarea
                ref={mobileTextareaRef}
                value={commentContent}
                onChange={(e) => {
                  setCommentContent(e.target.value)
                  e.target.style.height = '100px'
                  e.target.style.height = Math.min(e.target.scrollHeight, 300) + 'px'
                }}
                placeholder="コメントを入力..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none resize-none text-base leading-relaxed bg-white"
                rows={4}
                style={{ minHeight: '100px', maxHeight: '300px' }}
              />
              <div className="flex items-center justify-between mt-3">
                <p className="hidden md:block text-xs text-gray-400">
                  Enter で送信 / Shift + Enter で改行
                </p>
                <button
                  type="submit"
                  disabled={submitting || !commentContent.trim()}
                  className="flex items-center gap-2 px-5 py-2 bg-rose-500 text-white rounded-lg disabled:bg-rose-400 disabled:cursor-not-allowed font-medium text-sm"
                >
                  {submitting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Send size={16} />
                  )}
                  <span>送信</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="p-6 text-center">
              <p className="text-gray-600 mb-4">コメントするにはログインが必要です</p>
              <Link
                href={`/login?redirect=${encodeURIComponent(pathname)}`}
                className="w-full block py-3 bg-rose-500 text-white rounded-lg font-medium text-sm hover:bg-rose-600 transition-colors"
              >
                ログインしてコメントする
              </Link>
            </div>
          )}
          <div
            className="border-t border-gray-100 px-4 py-2 flex justify-center cursor-pointer hover:bg-gray-50"
            onClick={() => setMobileCommentOpen(false)}
          >
            <button type="button" className="text-xs text-gray-400 py-1">
              閉じる
            </button>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {imageModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setImageModal(null)}
        >
          <button
            className="absolute top-4 right-4 text-white text-3xl hover:text-gray-300"
            onClick={() => setImageModal(null)}
          >
            ×
          </button>
          <Image
            src={getPresetThumbnailUrl(imageModal, 'modal')}
            alt="拡大画像"
            fill
            className="object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}
