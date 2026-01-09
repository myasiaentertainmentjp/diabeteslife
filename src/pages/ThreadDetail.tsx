import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
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
  ThreadMode,
  THREAD_MODE_LABELS,
  DiaryEntry,
} from '../types/database'
import { ReportButton } from '../components/ReportButton'
import { ArrowLeft, MessageSquare, Send, AlertCircle, Loader2, BookOpen, ChevronDown, ChevronUp, Plus, Image as ImageIcon } from 'lucide-react'

const SITE_URL = 'https://diabeteslife.jp'
const DEFAULT_OGP_IMAGE = `${SITE_URL}/images/ogp.png`

// Extended thread type with author email for notifications
interface ThreadWithAuthor extends ThreadWithUser {
  users?: { email: string; display_name: string | null }
  mode?: ThreadMode
}

// Diary entry with user info
interface DiaryEntryWithUser extends DiaryEntry {
  profiles?: { display_name: string | null }
}

export function ThreadDetail() {
  const { id } = useParams<{ id: string }>()
  const [thread, setThread] = useState<ThreadWithAuthor | null>(null)
  const [comments, setComments] = useState<ThreadCommentWithUser[]>([])
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntryWithUser[]>([])
  const [loading, setLoading] = useState(true)
  const [commentContent, setCommentContent] = useState('')
  const [diaryContent, setDiaryContent] = useState('')
  const [diaryImages, setDiaryImages] = useState<File[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [submittingDiary, setSubmittingDiary] = useState(false)
  const [error, setError] = useState('')
  const [diaryError, setDiaryError] = useState('')
  const [showComments, setShowComments] = useState(false)
  const [showDiaryForm, setShowDiaryForm] = useState(false)

  const MAX_DIARY_IMAGES = 4

  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (id) {
      fetchData()
    }
  }, [id])

  async function fetchData() {
    setLoading(true)
    try {
      const threadData = await fetchThread()
      await fetchComments()
      // Fetch diary entries if diary mode
      if (threadData?.mode === 'diary') {
        await fetchDiaryEntries()
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchThread(): Promise<ThreadWithAuthor | null> {
    if (!id) return null

    try {
      // First get the thread data
      const { data: threadData, error: threadError } = await supabase
        .from('threads')
        .select('*')
        .eq('id', id)
        .single()

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

  async function fetchDiaryEntries() {
    if (!id) return

    try {
      const { data: entriesData, error: entriesError } = await supabase
        .from('diary_entries')
        .select('*')
        .eq('thread_id', id)
        .order('created_at', { ascending: false })

      if (entriesError) {
        console.error('Error fetching diary entries:', entriesError)
        return
      }

      if (!entriesData || entriesData.length === 0) {
        setDiaryEntries([])
        return
      }

      // Get user info for entries
      const userIds = [...new Set(entriesData.map((e) => e.user_id))]
      const { data: usersData } = await supabase
        .from('users')
        .select('id, display_name')
        .in('id', userIds)

      const usersMap = new Map(usersData?.map((u) => [u.id, u]) || [])

      const entriesWithUsers = entriesData.map((entry) => ({
        ...entry,
        profiles: {
          display_name: usersMap.get(entry.user_id)?.display_name || null,
        },
      }))

      setDiaryEntries(entriesWithUsers as unknown as DiaryEntryWithUser[])
    } catch (error) {
      console.error('Error fetching diary entries:', error)
      setDiaryEntries([])
    }
  }

  function handleDiaryImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    if (diaryImages.length + files.length > MAX_DIARY_IMAGES) {
      setDiaryError(`画像は${MAX_DIARY_IMAGES}枚まで添付できます`)
      return
    }
    setDiaryImages([...diaryImages, ...files])
  }

  function removeDiaryImage(index: number) {
    setDiaryImages(diaryImages.filter((_, i) => i !== index))
  }

  async function uploadDiaryImages(files: File[]): Promise<string[]> {
    const urls: string[] = []

    for (const file of files) {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`
      const filePath = `diary/${user?.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file)

      if (uploadError) {
        console.error('Error uploading image:', uploadError)
        continue
      }

      const { data: urlData } = supabase.storage
        .from('images')
        .getPublicUrl(filePath)

      if (urlData?.publicUrl) {
        urls.push(urlData.publicUrl)
      }
    }

    return urls
  }

  async function handleSubmitDiaryEntry(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !diaryContent.trim() || !id || !thread) return
    if (thread.user_id !== user.id) return // Only thread owner can post

    setDiaryError('')
    setSubmittingDiary(true)

    // Check for NG words
    const hasNgWord = await checkNgWords(diaryContent)
    if (hasNgWord) {
      setDiaryError('不適切な表現が含まれている可能性があります')
      setSubmittingDiary(false)
      return
    }

    // Upload images if any
    let imageUrls: string[] = []
    if (diaryImages.length > 0) {
      imageUrls = await uploadDiaryImages(diaryImages)
    }

    const { error: insertError } = await supabase
      .from('diary_entries')
      .insert({
        thread_id: id,
        user_id: user.id,
        content: diaryContent.trim(),
        image_url: imageUrls[0] || null, // First image as main image
        image_urls: imageUrls, // All images
      } as never)

    if (insertError) {
      setDiaryError('日記の投稿に失敗しました')
      console.error('Error posting diary entry:', insertError)
    } else {
      setDiaryContent('')
      setDiaryImages([])
      setShowDiaryForm(false)
      fetchDiaryEntries()
    }

    setSubmittingDiary(false)
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
            .eq('thread_id', id)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

          await supabase
            .from('admin_notifications')
            .insert({
              type: 'new_comment',
              thread_id: id,
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

  // Parse comment text and convert >>N patterns to clickable anchor links
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
        if (endNum) {
          // Range anchor >>N-M
          parts.push(
            <button
              key={`${match.index}-range`}
              onClick={() => scrollToComment(startNum)}
              className="text-rose-500 hover:text-rose-600 hover:underline font-medium"
            >
              {match[0]}
            </button>
          )
        } else {
          // Single anchor >>N
          parts.push(
            <button
              key={match.index}
              onClick={() => scrollToComment(startNum)}
              className="text-rose-500 hover:text-rose-600 hover:underline font-medium"
            >
              {match[0]}
            </button>
          )
        }
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
  const ogUrl = `${SITE_URL}/threads/${thread.id}`

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
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

      {/* Thread Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 text-xs font-medium rounded ${THREAD_CATEGORY_COLORS[thread.category]}`}>
              {THREAD_CATEGORY_LABELS[thread.category]}
            </span>
            {thread.mode === 'diary' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded bg-purple-100 text-purple-700">
                <BookOpen size={12} />
                {THREAD_MODE_LABELS.diary}
              </span>
            )}
          </div>
          <ReportButton targetType="thread" targetId={thread.id} />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">{thread.title}</h1>
        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mb-4">
          <Link
            to={`/users/${thread.user_id}`}
            className="font-medium text-gray-700 hover:text-rose-500 hover:underline"
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

      {/* Diary Entries Section (for diary mode) */}
      {thread.mode === 'diary' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-200 bg-purple-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen size={20} className="text-purple-600" />
                <h2 className="font-semibold text-gray-800">
                  日記エントリー ({diaryEntries.length})
                </h2>
              </div>
              {user && thread.user_id === user.id && (
                <button
                  onClick={() => setShowDiaryForm(!showDiaryForm)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Plus size={16} />
                  <span>新規エントリー</span>
                </button>
              )}
            </div>
          </div>

          {/* Diary Entry Form */}
          {showDiaryForm && user && thread.user_id === user.id && (
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <form onSubmit={handleSubmitDiaryEntry}>
                {diaryError && (
                  <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    <AlertCircle size={18} />
                    <span className="text-sm">{diaryError}</span>
                  </div>
                )}
                <textarea
                  value={diaryContent}
                  onChange={(e) => setDiaryContent(e.target.value)}
                  placeholder="今日の出来事を記録..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-colors resize-none mb-3"
                  rows={4}
                  required
                />

                {/* Image Preview */}
                {diaryImages.length > 0 && (
                  <div className="flex gap-2 mb-3 flex-wrap">
                    {diaryImages.map((img, i) => (
                      <div key={i} className="relative">
                        <img
                          src={URL.createObjectURL(img)}
                          alt=""
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeDiaryImage(i)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <label className="cursor-pointer text-gray-500 hover:text-purple-500 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleDiaryImageSelect}
                      className="hidden"
                      disabled={diaryImages.length >= MAX_DIARY_IMAGES}
                    />
                    <span className="inline-flex items-center gap-1 text-sm">
                      <ImageIcon size={18} />
                      画像を追加（{diaryImages.length}/{MAX_DIARY_IMAGES}）
                    </span>
                  </label>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowDiaryForm(false)
                        setDiaryImages([])
                        setDiaryContent('')
                      }}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      キャンセル
                    </button>
                    <button
                      type="submit"
                      disabled={submittingDiary || !diaryContent.trim()}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-purple-400 disabled:cursor-not-allowed"
                    >
                      {submittingDiary ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <Send size={18} />
                      )}
                      <span>投稿</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* Diary Entries List */}
          {diaryEntries.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              まだ日記エントリーはありません
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {diaryEntries.map((entry, index) => {
                const images = (entry as any).image_urls || (entry.image_url ? [entry.image_url] : [])
                return (
                  <div key={entry.id} className="px-6 py-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-purple-500 text-sm">{index + 1}.</span>
                        <span className="text-sm text-gray-500">
                          {formatDate(entry.created_at)}
                        </span>
                      </div>
                      <ReportButton targetType="diary_entry" targetId={entry.id} />
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap">{entry.content}</p>
                    {images.length > 0 && (
                      <div className={`grid gap-2 mt-3 ${
                        images.length === 1 ? 'grid-cols-1 max-w-md' :
                        images.length === 2 ? 'grid-cols-2' :
                        'grid-cols-2'
                      }`}>
                        {images.map((url: string, i: number) => (
                          <img
                            key={i}
                            src={url}
                            alt={`日記の画像 ${i + 1}`}
                            className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => window.open(url, '_blank')}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Comments Section */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          {thread.mode === 'diary' ? (
            <button
              onClick={() => setShowComments(!showComments)}
              className="w-full flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <MessageSquare size={20} className="text-gray-600" />
                <h2 className="font-semibold text-gray-800">
                  コメント ({thread.comments_count})
                </h2>
              </div>
              {showComments ? (
                <ChevronUp size={20} className="text-gray-500" />
              ) : (
                <ChevronDown size={20} className="text-gray-500" />
              )}
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <MessageSquare size={20} className="text-gray-600" />
              <h2 className="font-semibold text-gray-800">
                コメント ({thread.comments_count})
              </h2>
            </div>
          )}
        </div>

        {/* Comments List - collapsible for diary mode */}
        {(thread.mode !== 'diary' || showComments) && (
          <>
            {comments.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                まだコメントはありません
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {comments.map((comment, index) => (
                  <div
                    key={comment.id}
                    id={`comment-${index + 1}`}
                    className="px-6 py-4 transition-colors duration-500"
                  >
                    <div className="flex items-start gap-3">
                      <div className="shrink-0 w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-rose-500">
                          {index + 1}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 text-sm mb-2">
                          <Link
                            to={`/users/${comment.user_id}`}
                            className="font-medium text-gray-700 hover:text-rose-500 hover:underline"
                          >
                            {comment.profiles?.display_name || '匿名'}
                          </Link>
                          <span className="text-gray-400 text-xs">
                            {formatDate(comment.created_at)}
                          </span>
                          <ReportButton targetType="comment" targetId={comment.id} />
                        </div>
                        <p className="text-gray-700 whitespace-pre-wrap">
                          {renderCommentWithAnchors((comment as any).body || comment.content || '', comments.length)}
                        </p>
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
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-colors resize-none"
                      rows={3}
                      required
                    />
                    <button
                      type="submit"
                      disabled={submitting || !commentContent.trim()}
                      className="self-end px-4 py-3 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors disabled:bg-rose-400 disabled:cursor-not-allowed"
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
                  <Link to="/login" className="text-rose-500 hover:underline mx-1">
                    ログイン
                  </Link>
                  してください
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
