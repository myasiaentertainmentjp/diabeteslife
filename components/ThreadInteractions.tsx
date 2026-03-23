'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase'
import {
  ArrowLeft,
  MessageSquare,
  Send,
  AlertCircle,
  Loader2,
} from 'lucide-react'

interface Thread {
  id: string
  thread_number: number
  user_id: string
  title: string
  body?: string
  content?: string
  profiles?: { display_name: string | null }
}

interface Comment {
  id: string
  user_id: string
  body?: string
  content?: string
  profiles?: { display_name: string | null }
}

interface ThreadInteractionsProps {
  thread: Thread
  comments: Comment[]
}

export function ThreadInteractions({ thread, comments }: ThreadInteractionsProps) {
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

  // Render bookmark button in slot
  useEffect(() => {
    const slot = document.getElementById('thread-bookmark-slot')
    if (!slot || !user) return

    // This is a workaround - ideally we'd use a portal but keeping it simple
    slot.innerHTML = ''
    const button = document.createElement('button')
    button.className = `flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${
      isBookmarked
        ? 'bg-rose-100 text-rose-600 hover:bg-rose-200'
        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
    }`
    button.disabled = bookmarkLoading
    button.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="${isBookmarked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
      <span>${isBookmarked ? 'ブックマーク済み' : 'ブックマーク'}</span>
    `
    button.onclick = toggleBookmark
    slot.appendChild(button)
  }, [user, isBookmarked, bookmarkLoading])

  // Setup image modal handlers
  useEffect(() => {
    const handleImageClick = (e: Event) => {
      const target = e.target as HTMLElement
      const imageUrl = target.getAttribute('data-image-modal')
      if (imageUrl) {
        setImageModal(imageUrl)
      }
    }

    document.querySelectorAll('[data-image-modal]').forEach(el => {
      el.addEventListener('click', handleImageClick)
    })

    return () => {
      document.querySelectorAll('[data-image-modal]').forEach(el => {
        el.removeEventListener('click', handleImageClick)
      })
    }
  }, [])

  // Setup reply button handlers and anchor hover
  useEffect(() => {
    // Add reply buttons
    document.querySelectorAll('[data-reply-slot]').forEach(slot => {
      if (!user) return
      const commentNumber = parseInt(slot.getAttribute('data-reply-slot') || '0', 10)
      if (!commentNumber) return

      slot.innerHTML = ''
      const button = document.createElement('button')
      button.className = 'inline-flex items-center gap-0.5 text-xs text-gray-400 hover:text-blue-500 transition-colors ml-2'
      button.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/></svg>
        <span>返信</span>
      `
      button.onclick = () => handleReply(commentNumber)
      slot.appendChild(button)
    })

    // Enhance anchor text with hover handlers
    document.querySelectorAll('[data-comment-text]').forEach(el => {
      const text = el.textContent || ''
      const anchorRegex = />>(\d+)(?:-(\d+))?/g
      let match
      const totalComments = comments.length + 1

      // Only process if there are anchors
      if (!anchorRegex.test(text)) return

      anchorRegex.lastIndex = 0
      let newHtml = ''
      let lastIndex = 0

      while ((match = anchorRegex.exec(text)) !== null) {
        newHtml += escapeHtml(text.slice(lastIndex, match.index))
        const startNum = parseInt(match[1], 10)

        if (startNum >= 1 && startNum <= totalComments) {
          newHtml += `<button class="anchor-link text-blue-600 hover:text-blue-700 hover:underline font-medium" data-anchor="${startNum}">${escapeHtml(match[0])}</button>`
        } else {
          newHtml += escapeHtml(match[0])
        }
        lastIndex = match.index + match[0].length
      }
      newHtml += escapeHtml(text.slice(lastIndex))

      el.innerHTML = newHtml

      // Add event listeners to anchor links
      el.querySelectorAll('.anchor-link').forEach(link => {
        const anchorNum = parseInt(link.getAttribute('data-anchor') || '0', 10)
        link.addEventListener('click', () => scrollToComment(anchorNum))
        link.addEventListener('mouseenter', (e) => handleAnchorHover(e as MouseEvent, anchorNum))
        link.addEventListener('mouseleave', () => setHoveredComment(null))
      })
    })
  }, [user, comments.length])

  function escapeHtml(text: string) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
  }

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

  async function handleSubmitComment(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !commentContent.trim() || !thread?.id) return

    setError('')
    setSubmitting(true)

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
      router.refresh()
    }

    setSubmitting(false)
  }

  function handleReply(commentNumber: number) {
    const anchor = `>>${commentNumber} `
    if (!commentContent.includes(`>>${commentNumber}`)) {
      setCommentContent((prev) => (prev ? `${prev}${anchor}` : anchor))
    }
    setMobileCommentOpen(true)
    setTimeout(() => mobileTextareaRef.current?.focus(), 300)
  }

  function handleAnchorHover(e: MouseEvent, commentNumber: number) {
    const target = e.target as HTMLElement
    const rect = target.getBoundingClientRect()
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

  return (
    <>
      {/* Back Link */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-gray-600 hover:text-rose-500 mb-6"
      >
        <ArrowLeft size={20} />
        <span>前のページに戻る</span>
      </button>

      {/* Floating comment button */}
      {!mobileCommentOpen && (
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
            <form onSubmit={handleSubmitComment} className="p-4">
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

      {/* Anchor Popup */}
      {hoveredComment && getCommentByNumber(hoveredComment) && (
        <div
          className="fixed z-50 bg-white border border-gray-300 rounded-lg shadow-lg p-3 max-w-sm"
          style={{
            left: Math.min(popupPosition.x, (typeof window !== 'undefined' ? window.innerWidth : 1000) - 320),
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
            src={imageModal}
            alt="拡大画像"
            fill
            className="object-contain"
            onClick={(e) => e.stopPropagation()}
            unoptimized
          />
        </div>
      )}
    </>
  )
}
