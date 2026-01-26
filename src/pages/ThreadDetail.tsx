import { useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { sendCommentNotificationEmail } from '../lib/email'
import {
  ThreadWithUser,
  ThreadCommentWithUser,
  THREAD_CATEGORY_LABELS,
  THREAD_CATEGORY_COLORS,
  ThreadCategory,
} from '../types/database'
import { ReportButton } from '../components/ReportButton'
import { Sidebar } from '../components/Sidebar'
import { ArrowLeft, MessageSquare, Send, AlertCircle, Loader2, Reply, Bookmark, Image, X } from 'lucide-react'
import { compressImage, uploadToSupabaseStorage } from '../lib/imageUpload'

const SITE_URL = 'https://diabeteslife.jp'
const DEFAULT_OGP_IMAGE = `${SITE_URL}/images/ogp.png`

// Extended thread type with author email for notifications
interface ThreadWithAuthor extends ThreadWithUser {
  users?: { email: string; display_name: string | null }
}

export function ThreadDetail() {
  const { threadNumber } = useParams<{ threadNumber: string }>()
  const [thread, setThread] = useState<ThreadWithAuthor | null>(null)
  const [comments, setComments] = useState<ThreadCommentWithUser[]>([])
  const [loading, setLoading] = useState(true)
  const [commentContent, setCommentContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [hoveredComment, setHoveredComment] = useState<number | null>(null)
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 })
  const [imageModal, setImageModal] = useState<string | null>(null)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [bookmarkLoading, setBookmarkLoading] = useState(false)
  
  // 画像添付用state
  const [commentImage, setCommentImage] = useState<File | null>(null)
  const [commentImagePreview, setCommentImagePreview] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const imageInputRef = useRef<HTMLInputElement>(null)

  const commentTextareaRef = useRef<HTMLTextAreaElement>(null)

  const { user, isAdmin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const currentPath = location.pathname

  useEffect(() => {
    if (threadNumber) {
      fetchData()
    }
  }, [threadNumber, isAdmin])

  // Check bookmark status when thread and user are available
  useEffect(() => {
    if (thread?.id && user) {
      checkBookmarkStatus(thread.id)
    }
  }, [thread?.id, user])

  async function checkBookmarkStatus(threadId: string) {
    if (!user) return

    const { data } = await supabase
      .from('thread_bookmarks')
      .select('id')
      .eq('user_id', user.id)
      .eq('thread_id', threadId)
      .single()

    setIsBookmarked(!!data)
  }

  async function toggleBookmark() {
    if (!user || !thread?.id || bookmarkLoading) return

    setBookmarkLoading(true)

    if (isBookmarked) {
      // Remove bookmark
      const { error } = await supabase
        .from('thread_bookmarks')
        .delete()
        .eq('user_id', user.id)
        .eq('thread_id', thread.id)

      if (!error) {
        setIsBookmarked(false)
      }
    } else {
      // Add bookmark
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

  async function fetchData() {
    setLoading(true)

    // 15秒タイムアウト
    const timeoutId = setTimeout(() => {
      console.warn('Fetch data timeout')
      setLoading(false)
    }, 15000)

    try {
      const threadData = await fetchThread()
      if (threadData?.id) {
        await fetchComments(threadData.id)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      clearTimeout(timeoutId)
      setLoading(false)
    }
  }

  async function fetchThread(): Promise<ThreadWithAuthor | null> {
    if (!threadNumber) return null

    try {
      // Check if threadNumber is a number or UUID
      const isNumeric = /^\d+$/.test(threadNumber)

      // First get the thread data
      let query = supabase.from('threads').select('*')

      if (isNumeric) {
        query = query.eq('thread_number', parseInt(threadNumber, 10))
      } else {
        // Fallback to UUID for backwards compatibility
        query = query.eq('id', threadNumber)
      }

      const { data: threadData, error: threadError } = await query.single()

      if (threadError) {
        console.error('Error fetching thread:', threadError)
        return null
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

      const result = {
        ...threadData,
        users: authorInfo,
        profiles: { display_name: authorInfo?.display_name || null },
      } as unknown as ThreadWithAuthor

      setThread(result)
      return result
    } catch (error) {
      console.error('Error fetching thread:', error)
      return null
    }
  }

  async function fetchComments(threadId: string) {
    if (!threadId) return

    try {
      // Get comments
      // Admin sees all comments, regular users only see non-hidden past comments
      let query = supabase
        .from('comments')
        .select('*')
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true })

      if (!isAdmin) {
        // Regular users: filter out future comments and hidden comments
        query = query
          .eq('is_hidden', false)
          .lte('created_at', new Date().toISOString())
      }

      const { data: commentsData, error: commentsError } = await query

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

      // Deduplicate comments (same user, same body, within 60 seconds)
      const deduped = commentsWithUsers.filter((comment, index) => {
        const body = (comment as any).body || (comment as any).content || ''
        const time = new Date(comment.created_at).getTime()
        return !commentsWithUsers.some((other, otherIndex) => {
          if (otherIndex >= index) return false
          const otherBody = (other as any).body || (other as any).content || ''
          const otherTime = new Date(other.created_at).getTime()
          return (
            comment.user_id === other.user_id &&
            body === otherBody &&
            Math.abs(time - otherTime) < 60000
          )
        })
      })

      setComments(deduped as unknown as ThreadCommentWithUser[])
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
    if (!user || !commentContent.trim() || !thread?.id) return

    setError('')
    setSubmitting(true)

    // Check for NG words
    const hasNgWord = await checkNgWords(commentContent)
    if (hasNgWord) {
      setError('不適切な表現が含まれている可能性があります')
      setSubmitting(false)
      return
    }

    // 画像がある場合はアップロード
    let imageUrl: string | null = null
    if (commentImage) {
      try {
        setUploadingImage(true)
        const compressedImage = await compressImage(commentImage, 'content')
        imageUrl = await uploadToSupabaseStorage(compressedImage, 'comment-images')
      } catch (err) {
        console.error('Image upload error:', err)
        setError('画像のアップロードに失敗しました')
        setSubmitting(false)
        setUploadingImage(false)
        return
      } finally {
        setUploadingImage(false)
      }
    }

    const { error: insertError } = await supabase
      .from('comments')
      .insert({
        thread_id: thread.id,
        user_id: user.id,
        body: commentContent,
        image_url: imageUrl,
      } as never)

    if (insertError) {
      setError('コメントの投稿に失敗しました')
      console.error('Error posting comment:', insertError)
    } else {
      setCommentContent('')
      // 画像もクリア
      setCommentImage(null)
      setCommentImagePreview(null)
      await fetchComments(thread.id)
      // Update thread comments count with actual count from DB
      if (thread) {
        const { count } = await supabase
          .from('comments')
          .select('*', { count: 'exact', head: true })
          .eq('thread_id', thread.id)

        const newCount = count || 0
        await supabase
          .from('threads')
          .update({ comments_count: newCount } as never)
          .eq('id', thread.id)
        setThread({ ...thread, comments_count: newCount })

        // Get current user's display name
        const { data: currentUserData } = await supabase
          .from('users')
          .select('display_name')
          .eq('id', user.id)
          .single()

        // Check if thread author is a dummy user
        const { data: authorProfile } = await supabase
          .from('users')
          .select('is_dummy, display_name')
          .eq('id', thread.user_id)
          .single()

        // If thread author is dummy user, create admin notification
        if (authorProfile?.is_dummy) {
          const { data: newComment } = await supabase
            .from('comments')
            .select('id')
            .eq('thread_id', thread.id)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

          await supabase
            .from('admin_notifications')
            .insert({
              type: 'new_comment',
              thread_id: thread.id,
              comment_id: newComment?.id || null,
              user_id: user.id,
              message: `${currentUserData?.display_name || '匿名'}さんが「${thread.title}」にコメントしました`,
              is_read: false,
            } as never)
        }

        // Send notification email to thread author (if not the same user and not dummy)
        if (thread.user_id !== user.id && thread.users?.email && !authorProfile?.is_dummy) {
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

        // Create in-app notification for thread owner (if not self and not dummy)
        if (thread.user_id !== user.id && !authorProfile?.is_dummy) {
          // Check notification settings
          const { data: notifSettings } = await supabase
            .from('notification_settings')
            .select('thread_comment')
            .eq('user_id', thread.user_id)
            .single()

          // Default to true if no settings found
          const shouldNotify = notifSettings?.thread_comment ?? true

          if (shouldNotify) {
            await supabase.from('notifications').insert({
              user_id: thread.user_id,
              from_user_id: user.id,
              from_user_name: currentUserData?.display_name || '匿名',
              type: 'thread_comment',
              title: `${currentUserData?.display_name || '匿名'}さんがコメントしました`,
              message: commentContent.substring(0, 100),
              link: `/threads/${(thread as any)?.thread_number || thread?.id}`,
            } as never)
          }
        }

        // Handle reply notifications - detect >>N patterns
        const replyMatches = commentContent.match(/>>(\d+)/g)
        if (replyMatches) {
          const repliedNumbers = [...new Set(replyMatches.map(m => parseInt(m.replace('>>', ''))))]

          for (const num of repliedNumbers) {
            // num 1 = OP (thread owner), already notified above
            if (num === 1) continue

            // Get the comment that was replied to (comments are 0-indexed, but display is 2-indexed)
            const repliedComment = comments[num - 2]
            if (repliedComment && repliedComment.user_id !== user.id) {
              // Check notification settings
              const { data: notifSettings } = await supabase
                .from('notification_settings')
                .select('reply')
                .eq('user_id', repliedComment.user_id)
                .single()

              const shouldNotify = notifSettings?.reply ?? true

              if (shouldNotify) {
                await supabase.from('notifications').insert({
                  user_id: repliedComment.user_id,
                  from_user_id: user.id,
                  from_user_name: currentUserData?.display_name || '匿名',
                  type: 'reply',
                  title: `${currentUserData?.display_name || '匿名'}さんが返信しました`,
                  message: commentContent.substring(0, 100),
                  link: `/threads/${(thread as any)?.thread_number || thread?.id}`,
                } as never)
              }
            }
          }
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

  // Handle reply button click - insert >>N into comment field
  function handleReply(commentNumber: number) {
    const anchor = `>>${commentNumber} `
    // Check if anchor already exists to avoid duplicates
    if (!commentContent.includes(`>>${commentNumber}`)) {
      setCommentContent((prev) => prev ? `${prev}${anchor}` : anchor)
    }
    // Focus and scroll to comment textarea
    if (commentTextareaRef.current) {
      commentTextareaRef.current.focus()
      commentTextareaRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  // 画像選択ハンドラ
  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // ファイルタイプチェック
    if (!file.type.startsWith('image/')) {
      setError('画像ファイルを選択してください')
      return
    }

    // ファイルサイズチェック（10MB）
    if (file.size > 10 * 1024 * 1024) {
      setError('画像サイズは10MB以下にしてください')
      return
    }

    setCommentImage(file)
    
    // プレビュー作成
    const reader = new FileReader()
    reader.onload = (event) => {
      setCommentImagePreview(event.target?.result as string)
    }
    reader.readAsDataURL(file)
    setError('')
  }

  // 画像削除ハンドラ
  function removeImage() {
    setCommentImage(null)
    setCommentImagePreview(null)
    if (imageInputRef.current) {
      imageInputRef.current.value = ''
    }
  }

  // Handle anchor hover for popup
  function handleAnchorHover(e: React.MouseEvent, commentNumber: number) {
    const rect = e.currentTarget.getBoundingClientRect()
    setPopupPosition({
      x: rect.left,
      y: rect.bottom + window.scrollY + 8,
    })
    setHoveredComment(commentNumber)
  }

  // Get comment by number for popup (1 = OP, 2+ = comments)
  function getCommentByNumber(num: number): { user_id: string; profiles?: { display_name: string | null }; body?: string; content?: string } | null {
    if (num === 1 && thread) {
      // Return thread OP as "comment 1"
      return {
        user_id: thread.user_id,
        profiles: thread.profiles,
        body: (thread as any).body || thread.content,
      }
    }
    // Comments start from 2
    return comments[num - 2] || null
  }

  // Parse comment text and convert >>N patterns to clickable anchor links with hover
  function renderCommentWithAnchors(text: string, totalComments: number) {
    // Match >>N or >>N-M patterns (e.g., >>5, >>3-7)
    const anchorRegex = />>(\d+)(?:-(\d+))?/g
    const parts: (string | JSX.Element)[] = []
    let lastIndex = 0
    let match

    while ((match = anchorRegex.exec(text)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index))
      }

      const startNum = parseInt(match[1], 10)
      const endNum = match[2] ? parseInt(match[2], 10) : null

      // Validate anchor numbers
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
        // Invalid anchor, keep as plain text
        parts.push(match[0])
      }

      lastIndex = match.index + match[0].length
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex))
    }

    return parts.length > 0 ? parts : text
  }

  function scrollToComment(commentNumber: number) {
    setHoveredComment(null) // Hide popup
    const element = document.getElementById(`comment-${commentNumber}`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      // Highlight effect
      element.classList.add('bg-rose-50')
      setTimeout(() => {
        element.classList.remove('bg-rose-50')
      }, 2000)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 size={32} className="animate-spin text-rose-500" />
      </div>
    )
  }

  if (!thread) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">スレッドが見つかりませんでした</p>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-rose-500 hover:underline"
          >
            <ArrowLeft size={20} />
            <span>前のページに戻る</span>
          </button>
        </div>
      </div>
    )
  }

  const threadContent = (thread as any).body || thread.content || ''
  const ogDescription = threadContent.substring(0, 150)
  const ogUrl = `${SITE_URL}/threads/${(thread as any).thread_number || thread.id}`

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Helmet>
        <title>{thread.title} | Dライフ</title>
        <meta name="description" content={ogDescription} />
        <meta property="og:title" content={thread.title} />
        <meta property="og:description" content={ogDescription} />
        <meta property="og:image" content={DEFAULT_OGP_IMAGE} />
        <meta property="og:url" content={ogUrl} />
        <meta property="og:type" content="article" />
        <meta property="og:site_name" content="Dライフ" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={thread.title} />
        <meta name="twitter:description" content={ogDescription} />
        <meta name="twitter:image" content={DEFAULT_OGP_IMAGE} />
        <link rel="canonical" href={ogUrl} />
      </Helmet>

      {/* Back Link */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-gray-600 hover:text-rose-500 mb-6"
      >
        <ArrowLeft size={20} />
        <span>前のページに戻る</span>
      </button>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Thread Card - Header + Content + Comments unified */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Title Section */}
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 text-xs font-medium rounded ${THREAD_CATEGORY_COLORS[thread.category]}`}>
                {THREAD_CATEGORY_LABELS[thread.category]}
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
                  title={isBookmarked ? 'ブックマークを解除' : 'ブックマークに追加'}
                >
                  <Bookmark size={14} className={isBookmarked ? 'fill-current' : ''} />
                  <span>{isBookmarked ? 'ブックマーク済み' : 'ブックマーク'}</span>
                </button>
              )}
              <ReportButton targetType="thread" targetId={thread.id} />
            </div>
          </div>
          <h1 className="text-xl font-bold text-gray-800">{thread.title}</h1>
        </div>

        {/* Original Post as 1: */}
        <div className="px-6 py-5">
          <div className="flex flex-wrap items-baseline gap-1 mb-2">
            <span className="font-bold text-rose-500">1:</span>
            <Link
              to={`/users/${thread.user_id}`}
              className="font-medium text-blue-600 hover:underline"
            >
              {thread.profiles?.display_name || '匿名'}
            </Link>
            <span className="text-gray-400 text-sm ml-2">
              {formatDate(thread.created_at)}
            </span>
          </div>
          <div className="pl-4 text-gray-900 whitespace-pre-wrap leading-relaxed">
            {(thread as any).body || thread.content}
          </div>

          {/* Thread Image */}
          {(thread as any).image_url && (
            <div className="mt-4 pl-4">
              <img
                src={(thread as any).image_url}
                alt="投稿画像"
                className="max-w-full max-h-96 object-contain rounded-lg border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => setImageModal((thread as any).image_url)}
              />
            </div>
          )}

        </div>

          {/* Comments Section header */}
          <div className="px-6 py-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <MessageSquare size={20} className="text-gray-600" />
              <h2 className="font-semibold text-gray-800">
                コメント ({comments.length})
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
                {(() => {
                  // Create a map of comment.id -> display number for parent lookup
                  const commentIdToNumber = new Map<string, number>()
                  comments.forEach((c, i) => {
                    commentIdToNumber.set(c.id, i + 2)
                  })

                  return comments.map((comment, index) => {
                    // Get parent comment number if parent_id exists
                    const parentId = (comment as any).parent_id
                    const parentNumber = parentId ? commentIdToNumber.get(parentId) : null

                    return (
                      <div
                        key={comment.id}
                        id={`comment-${index + 2}`}
                        className="py-5 transition-colors duration-500"
                      >
                        {/* 2ch/ガルちゃん風ヘッダー: 番号: 名前 日時 (スレ主=1なのでコメントは2から) */}
                        <div className="flex flex-wrap items-baseline gap-1 mb-2">
                          <span className="font-bold text-rose-500">{index + 2}:</span>
                          <Link
                            to={`/users/${comment.user_id}`}
                            className="font-medium text-blue-600 hover:underline"
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
                          <ReportButton targetType="comment" targetId={comment.id} />
                        </div>
                        {/* コメント本文 - インデント付き */}
                        <div className="pl-4 text-gray-900 whitespace-pre-wrap leading-relaxed">
                          {/* parent_idがある場合、返信先を表示 */}
                          {parentNumber && (
                            <button
                              onClick={() => scrollToComment(parentNumber)}
                              onMouseEnter={(e) => handleAnchorHover(e, parentNumber)}
                              onMouseLeave={() => setHoveredComment(null)}
                              className="text-blue-600 hover:text-blue-700 hover:underline font-medium mr-1"
                            >
                              &gt;&gt;{parentNumber}
                            </button>
                          )}
                          {renderCommentWithAnchors((comment as any).body || comment.content || '', comments.length + 1)}
                          
                          {/* コメントに添付された画像 */}
                          {(comment as any).image_url && (
                            <div className="mt-2">
                              <img
                                src={(comment as any).image_url}
                                alt="添付画像"
                                className="max-w-xs max-h-48 rounded-lg border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() => setImageModal((comment as any).image_url)}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })
                })()}

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
                      <span className="font-bold text-rose-500">{hoveredComment}:</span>
                      {' '}
                      {getCommentByNumber(hoveredComment)?.profiles?.display_name || '匿名'}
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap line-clamp-4">
                      {getCommentByNumber(hoveredComment)?.body ||
                       getCommentByNumber(hoveredComment)?.content || ''}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Comment Form */}
            <div className="px-4 md:px-6 py-6 bg-gray-50 border-t border-gray-200">
              {user ? (
                <form onSubmit={handleSubmitComment}>
                  {error && (
                    <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                      <AlertCircle size={18} />
                      <span className="text-sm">{error}</span>
                    </div>
                  )}
                  <div className="flex flex-col gap-3">
                    <textarea
                      ref={commentTextareaRef}
                      value={commentContent}
                      onChange={(e) => {
                        setCommentContent(e.target.value)
                        // Auto-resize textarea
                        e.target.style.height = '100px'
                        e.target.style.height = Math.min(e.target.scrollHeight, 300) + 'px'
                      }}
                      onKeyDown={(e) => {
                        // PC: Enter to send, Shift+Enter for newline
                        if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                          // Only on non-mobile
                          if (window.innerWidth >= 768) {
                            e.preventDefault()
                            if (commentContent.trim() && !submitting) {
                              handleSubmitComment(e as unknown as React.FormEvent)
                            }
                          }
                        }
                      }}
                      placeholder="コメントを入力..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-colors resize-none text-base leading-relaxed bg-white"
                      rows={4}
                      style={{ minHeight: '100px', maxHeight: '300px' }}
                      required
                    />

                    {/* 画像プレビュー */}
                    {commentImagePreview && (
                      <div className="relative inline-block">
                        <img
                          src={commentImagePreview}
                          alt="添付画像プレビュー"
                          className="max-h-32 rounded-lg border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {/* 画像添付ボタン */}
                        <input
                          ref={imageInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageSelect}
                          className="hidden"
                          id="comment-image-input"
                        />
                        <label
                          htmlFor="comment-image-input"
                          className="flex items-center gap-1 px-3 py-1.5 text-gray-500 hover:text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors text-sm"
                        >
                          <Image size={18} />
                          <span className="hidden sm:inline">画像を添付</span>
                        </label>
                        <p className="hidden md:block text-xs text-gray-400">
                          Enter で送信 / Shift + Enter で改行
                        </p>
                      </div>
                      <button
                        type="submit"
                        disabled={submitting || uploadingImage || !commentContent.trim()}
                        className="flex items-center gap-2 px-6 py-2.5 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors disabled:bg-rose-400 disabled:cursor-not-allowed font-medium"
                      >
                        {submitting || uploadingImage ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <Send size={18} />
                        )}
                        <span>{uploadingImage ? 'アップロード中...' : 'コメントする'}</span>
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="flex flex-col gap-3">
                  <div
                    onClick={() => navigate('/login', { state: { from: currentPath } })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white cursor-pointer hover:border-rose-300 transition-colors"
                    style={{ minHeight: '100px' }}
                  >
                    <p className="text-gray-400 text-base">
                      コメントするには<span className="text-rose-500 font-medium mx-1 hover:underline">ログイン</span>してください
                    </p>
                  </div>
                  <div className="flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => navigate('/login', { state: { from: currentPath } })}
                      className="flex items-center gap-2 px-6 py-2.5 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors font-medium"
                    >
                      <Send size={18} />
                      <span>コメントする</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
        </div>
      </div>

        {/* Sidebar - PC only */}
        <div className="hidden lg:block lg:w-80 shrink-0">
          <div className="sticky top-4">
            <Sidebar showPostButton={true} showCategories={false} />
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {imageModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setImageModal(null)}
        >
          <button
            className="absolute top-4 right-4 text-white text-3xl hover:text-gray-300 transition-colors"
            onClick={() => setImageModal(null)}
          >
            ×
          </button>
          <img
            src={imageModal}
            alt="拡大画像"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}
