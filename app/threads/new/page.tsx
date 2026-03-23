'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { ThreadCategory, THREAD_CATEGORY_LABELS, THREAD_CATEGORY_DESCRIPTIONS } from '@/types/database'
import { ArrowLeft, Send, AlertCircle, Loader2, X, Camera } from 'lucide-react'

const categories: ThreadCategory[] = ['todays_meal', 'food_recipe', 'treatment', 'exercise_lifestyle', 'mental_concerns', 'complications_prevention', 'chat_other']

const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB

export default function ThreadNewPage() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState<ThreadCategory | ''>('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/threads/new')
    }
  }, [user, authLoading, router])

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

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('画像ファイルを選択してください')
      return
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setError('画像サイズは5MB以下にしてください')
      return
    }

    setImageFile(file)
    setError('')

    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  function removeImage() {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  async function uploadImage(file: File): Promise<string | null> {
    setUploadingImage(true)
    try {
      const fileName = `threads/${Date.now()}-${Math.random().toString(36).substring(7)}.${file.name.split('.').pop()}`

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(fileName, file, {
          cacheControl: '31536000',
          contentType: file.type,
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        return null
      }

      const { data: urlData } = supabase.storage.from('images').getPublicUrl(fileName)
      return urlData.publicUrl
    } catch (err) {
      console.error('Upload error:', err)
      return null
    } finally {
      setUploadingImage(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return

    setError('')
    setSubmitting(true)

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

    if (!category) {
      setError('カテゴリを選択してください')
      setSubmitting(false)
      return
    }

    const hasNgWordInTitle = await checkNgWords(title)
    const hasNgWordInContent = await checkNgWords(content)

    if (hasNgWordInTitle || hasNgWordInContent) {
      setError('不適切な表現が含まれている可能性があります')
      setSubmitting(false)
      return
    }

    let imageUrl: string | null = null
    if (imageFile) {
      imageUrl = await uploadImage(imageFile)
      if (!imageUrl) {
        setError('画像のアップロードに失敗しました。画像なしで投稿するか、再度お試しください。')
        setSubmitting(false)
        return
      }
    }

    const { data, error: insertError } = await supabase
      .from('threads')
      .insert({
        user_id: user.id,
        title: title.trim(),
        body: content.trim(),
        category,
        mode: 'normal',
        comments_count: 0,
        image_url: imageUrl,
      } as never)
      .select()
      .single()

    if (insertError) {
      setError('トピックの作成に失敗しました')
      console.error('Error creating thread:', insertError)
      setSubmitting(false)
    } else {
      const threadData = data as { id: string; thread_number: number }
      router.push(`/threads/${threadData.thread_number || threadData.id}`)
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
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-gray-600 hover:text-rose-500 mb-6"
      >
        <ArrowLeft size={20} />
        <span>前のページに戻る</span>
      </button>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">新規トピック作成</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <AlertCircle size={20} />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Category - 必須 */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              カテゴリ <span className="text-rose-500">*</span>
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as ThreadCategory)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-colors bg-white ${
                !category ? 'border-gray-300 text-gray-400' : 'border-gray-300'
              }`}
              required
            >
              <option value="" disabled>
                カテゴリを選択してください
              </option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {THREAD_CATEGORY_LABELS[cat]}
                </option>
              ))}
            </select>
            {category && THREAD_CATEGORY_DESCRIPTIONS[category] && (
              <p className="mt-2 text-sm text-orange-600 flex items-center gap-1">
                <Camera size={14} />
                {THREAD_CATEGORY_DESCRIPTIONS[category]}
              </p>
            )}
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
              placeholder="トピックのタイトルを入力"
              maxLength={100}
              required
            />
            <div className="mt-1 flex justify-between items-center">
              {title.length > 0 && title.length < 15 ? (
                <p className="text-xs text-gray-400">
                  もう少し具体的に書くと、内容が伝わりやすくなります
                </p>
              ) : (
                <span />
              )}
              <p className="text-sm text-gray-500">
                {title.length}/100
              </p>
            </div>
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
              placeholder={category === 'todays_meal' ? '今日の食事を写真と一緒に共有しましょう!' : 'トピックの本文を入力...'}
              rows={8}
              maxLength={5000}
              required
            />
            <div className="mt-1 flex justify-between items-center">
              {content.length > 0 && content.length < 50 ? (
                <p className="text-xs text-gray-400">
                  もう少し詳しく書くと、回答が集まりやすくなります
                </p>
              ) : (
                <span />
              )}
              <p className="text-sm text-gray-500">
                {content.length}/5000
              </p>
            </div>
          </div>

          {/* Image Upload */}
          <div className={category === 'todays_meal' ? 'bg-orange-50 p-4 rounded-lg border border-orange-200' : ''}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {category === 'todays_meal' ? (
                <span className="flex items-center gap-2 text-orange-700">
                  <Camera size={16} />
                  写真を追加
                </span>
              ) : (
                '画像（任意）'
              )}
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />

            {imagePreview ? (
              <div className="relative inline-block">
                <Image
                  src={imagePreview}
                  alt="プレビュー"
                  width={400}
                  height={256}
                  className="max-w-full max-h-64 rounded-lg border border-gray-200 object-contain"
                  unoptimized
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`flex items-center gap-2 px-4 py-6 border-2 border-dashed rounded-lg transition-colors w-full justify-center ${
                  category === 'todays_meal'
                    ? 'border-orange-400 text-orange-600 hover:border-orange-500 hover:bg-orange-100'
                    : 'border-gray-300 text-gray-500 hover:border-rose-400 hover:text-rose-500'
                }`}
              >
                <Camera size={24} />
                <span className="font-medium">{category === 'todays_meal' ? '食事の写真を追加' : '画像を追加'}</span>
              </button>
            )}
            <p className="mt-2 text-xs text-gray-500">
              JPEG, PNG, GIF, WebP（最大5MB）
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Link
              href="/threads"
              className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              キャンセル
            </Link>
            <button
              type="submit"
              disabled={submitting || uploadingImage || !category}
              className="inline-flex items-center gap-2 px-6 py-3 bg-rose-500 text-white font-medium rounded-lg hover:bg-rose-600 transition-colors disabled:bg-rose-400 disabled:cursor-not-allowed"
            >
              {submitting || uploadingImage ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>{uploadingImage ? '画像アップロード中...' : '投稿中...'}</span>
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
