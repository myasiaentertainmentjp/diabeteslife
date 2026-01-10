import { useState, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { ThreadCategory, ThreadMode, THREAD_CATEGORY_LABELS } from '../types/database'
import { ArrowLeft, Send, AlertCircle, Loader2, BookOpen, MessageSquare, HelpCircle } from 'lucide-react'

const categories: ThreadCategory[] = ['food_recipe', 'treatment', 'exercise_lifestyle', 'mental_concerns', 'complications_prevention', 'chat_other']

export function ThreadNew() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState<ThreadCategory>('food_recipe')
  const [mode, setMode] = useState<ThreadMode>('normal')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login', { state: { from: location.pathname } })
    }
  }, [user, authLoading, navigate, location.pathname])

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return

    setError('')
    setSubmitting(true)

    // Validate
    if (!title.trim()) {
      setError('タイトルを入力してください')
      setSubmitting(false)
      return
    }

    if (!content.trim()) {
      setError('本文を入力してください')
      setSubmitting(false)
      return
    }

    // Check for NG words in title and content
    const hasNgWordInTitle = await checkNgWords(title)
    const hasNgWordInContent = await checkNgWords(content)

    if (hasNgWordInTitle || hasNgWordInContent) {
      setError('不適切な表現が含まれている可能性があります')
      setSubmitting(false)
      return
    }

    const { data, error: insertError } = await supabase
      .from('threads')
      .insert({
        user_id: user.id,
        title: title.trim(),
        content: content.trim(),
        category,
        mode,
        comments_count: 0,
      } as never)
      .select()
      .single()

    if (insertError) {
      setError('スレッドの作成に失敗しました')
      console.error('Error creating thread:', insertError)
      setSubmitting(false)
    } else {
      const threadData = data as { id: string }
      navigate(`/threads/${threadData.id}`)
    }
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
      {/* Back Link */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-gray-600 hover:text-rose-500 mb-6"
      >
        <ArrowLeft size={20} />
        <span>前のページに戻る</span>
      </button>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">新規スレッド作成</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <AlertCircle size={20} />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Mode Selection */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <label className="text-sm font-medium text-gray-700">
                スレッドタイプ
              </label>
              <a
                href="/help/thread-modes"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-rose-500 transition-colors"
                title="通常モードと日記モードの違いを見る"
              >
                <HelpCircle size={16} />
              </a>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMode('normal')}
                className={`p-3 border-2 rounded-lg text-left transition-all ${
                  mode === 'normal'
                    ? 'border-rose-500 bg-rose-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <MessageSquare size={20} className={`flex-shrink-0 ${mode === 'normal' ? 'text-rose-500' : 'text-gray-400'}`} />
                  <span className={`font-medium whitespace-nowrap ${mode === 'normal' ? 'text-rose-600' : 'text-gray-700'}`}>
                    通常モード
                  </span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  誰でも投稿・コメントできます。質問や議論に最適。
                </p>
              </button>
              <button
                type="button"
                onClick={() => setMode('diary')}
                className={`p-3 border-2 rounded-lg text-left transition-all ${
                  mode === 'diary'
                    ? 'border-rose-500 bg-rose-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <BookOpen size={20} className={`flex-shrink-0 ${mode === 'diary' ? 'text-rose-500' : 'text-gray-400'}`} />
                  <span className={`font-medium whitespace-nowrap ${mode === 'diary' ? 'text-rose-600' : 'text-gray-700'}`}>
                    日記モード
                  </span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  あなただけが投稿。他の人はリアクションで応援。
                </p>
              </button>
            </div>
            {mode === 'diary' && (
              <p className="mt-2 text-xs text-amber-600 bg-amber-50 p-2 rounded">
                日記モードは作成後に変更できません。他のユーザーはコメントのみ可能です。
              </p>
            )}
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              カテゴリ
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as ThreadCategory)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-colors bg-white"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {THREAD_CATEGORY_LABELS[cat]}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              タイトル
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-colors"
              placeholder="スレッドのタイトルを入力"
              maxLength={100}
              required
            />
            <p className="mt-1 text-sm text-gray-500 text-right">
              {title.length}/100
            </p>
          </div>

          {/* Content */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              本文
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-colors resize-none"
              placeholder="スレッドの本文を入力..."
              rows={8}
              maxLength={5000}
              required
            />
            <p className="mt-1 text-sm text-gray-500 text-right">
              {content.length}/5000
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Link
              to="/threads"
              className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              キャンセル
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-3 bg-rose-500 text-white font-medium rounded-lg hover:bg-rose-600 transition-colors disabled:bg-rose-400 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>投稿中...</span>
                </>
              ) : (
                <>
                  <Send size={20} />
                  <span>投稿する</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
