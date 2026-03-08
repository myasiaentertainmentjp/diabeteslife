import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import { ArticleCategory, ARTICLE_CATEGORY_LABELS } from '../../types/database'
import { RichTextEditor } from '../../components/RichTextEditor'
import { ImageUploader } from '../../components/ImageUploader'
import { compressImage, uploadToSupabaseStorage } from '../../lib/imageUpload'
import { Loader2, Save, ArrowLeft, Eye, EyeOff, Wand2 } from 'lucide-react'

const CATEGORIES: ArticleCategory[] = ['food_recipe', 'treatment', 'exercise_lifestyle', 'mental_concerns', 'complications_prevention', 'chat_other']

interface FormData {
  title: string
  slug: string
  category: ArticleCategory
  tags: string
  thumbnail_url: string
  content: string
  is_published: boolean
}

const initialFormData: FormData = {
  title: '',
  slug: '',
  category: 'food_recipe',
  tags: '',
  thumbnail_url: '',
  content: '',
  is_published: false,
}

// Extract plain text from HTML and generate excerpt
function generateExcerpt(html: string, maxLength: number = 150): string {
  try {
    // Create a temporary element to parse HTML
    const div = document.createElement('div')
    div.innerHTML = html
    // Get text content and clean up whitespace
    const text = div.textContent || div.innerText || ''
    const cleaned = text.replace(/\s+/g, ' ').trim()
    // Truncate and add ellipsis if needed
    if (cleaned.length <= maxLength) {
      return cleaned
    }
    return cleaned.substring(0, maxLength).trim() + '...'
  } catch {
    // Fallback: strip HTML tags with regex
    const text = html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
    return text.length <= maxLength ? text : text.substring(0, maxLength).trim() + '...'
  }
}

export function ArticleForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { showToast } = useToast()
  const isEdit = Boolean(id)

  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [originalIsPublished, setOriginalIsPublished] = useState(false)
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    if (isEdit && id) {
      fetchArticle(id)
    }
  }, [id, isEdit])

  async function fetchArticle(articleId: string) {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('id', articleId)
        .single()

      if (error) {
        console.error('Error fetching article:', error)
        showToast('記事の取得に失敗しました', 'error')
        navigate('/admin/articles')
        return
      }

      setFormData({
        title: data.title,
        slug: data.slug,
        category: data.category,
        tags: data.tags?.join(', ') || '',
        thumbnail_url: data.thumbnail_url || '',
        content: data.content,
        is_published: data.is_published,
      })
      setOriginalIsPublished(data.is_published)
    } catch (error) {
      console.error('Error fetching article:', error)
      showToast('記事の取得に失敗しました', 'error')
      navigate('/admin/articles')
    } finally {
      setLoading(false)
    }
  }

  function generateSlug() {
    const slug = formData.title
      .toLowerCase()
      .replace(/[^\w\s\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 50)

    const timestamp = Date.now().toString(36)
    setFormData((prev) => ({ ...prev, slug: `${slug}-${timestamp}` }))
  }

  // Handle image upload from rich text editor
  const handleContentImageUpload = useCallback(async (file: File): Promise<string> => {
    try {
      const compressedFile = await compressImage(file, 'content')
      const url = await uploadToSupabaseStorage(compressedFile, 'images')
      return url
    } catch (error) {
      showToast('画像のアップロードに失敗しました', 'error')
      throw error
    }
  }, [showToast])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!formData.title.trim()) {
      showToast('タイトルを入力してください', 'error')
      return
    }
    if (!formData.slug.trim()) {
      showToast('スラッグを入力してください', 'error')
      return
    }
    // Check if content has actual text (not just empty HTML tags)
    const contentText = formData.content.replace(/<[^>]*>/g, '').trim()
    if (!contentText) {
      showToast('本文を入力してください', 'error')
      return
    }

    setSaving(true)

    // Auto-generate excerpt from content
    const autoExcerpt = generateExcerpt(formData.content)

    const now = new Date().toISOString()

    // Build tags array, ensuring it's properly formatted
    const tagsArray = formData.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    const articleData: Record<string, unknown> = {
      title: formData.title.trim(),
      slug: formData.slug.trim(),
      category: formData.category,
      tags: tagsArray.length > 0 ? tagsArray : null, // Send null if no tags
      thumbnail_url: formData.thumbnail_url.trim() || null,
      excerpt: autoExcerpt || null,
      content: formData.content,
      is_published: formData.is_published,
      updated_at: now,
    }

    // Handle published_at based on context
    if (isEdit) {
      // Only update published_at when publish status actually changes
      if (formData.is_published && !originalIsPublished) {
        // Changing from unpublished to published
        articleData.published_at = now
      } else if (!formData.is_published && originalIsPublished) {
        // Changing from published to unpublished
        articleData.published_at = null
      }
      // If status unchanged, don't include published_at (preserve existing value)
    } else {
      // New article
      articleData.published_at = formData.is_published ? now : null
      articleData.created_at = now
      articleData.author_id = user?.id || null
    }

    console.log('Article data to be sent:', JSON.stringify(articleData, null, 2))

    try {
      // Check authentication status
      const { data: session } = await supabase.auth.getSession()
      console.log('Current session:', session?.session?.user?.id)

      if (!session?.session) {
        showToast('セッションが切れました。再度ログインしてください。', 'error')
        setSaving(false)
        return
      }

      if (isEdit && id) {
        console.log('Updating article:', id, articleData)
        const { data, error } = await supabase
          .from('articles')
          .update(articleData as never)
          .eq('id', id)
          .select()

        if (error) {
          console.error('Error updating article:', error)
          console.error('Error details:', JSON.stringify(error, null, 2))
          if (error.code === '23505') {
            showToast('このスラッグは既に使用されています', 'error')
          } else {
            showToast('更新に失敗しました: ' + error.message, 'error')
          }
        } else if (!data || data.length === 0) {
          console.error('Update returned no rows - possible RLS policy issue')
          showToast('更新に失敗しました。権限を確認してください。', 'error')
        } else {
          console.log('Article updated successfully:', data)
          showToast('記事を更新しました', 'success')
          navigate('/admin/articles')
        }
      } else {
        console.log('Creating article:', articleData)
        const { data, error } = await supabase.from('articles').insert(articleData).select()

        if (error) {
          console.error('Error creating article:', error)
          console.error('Error code:', error.code)
          console.error('Error message:', error.message)
          console.error('Error details:', error.details)
          console.error('Error hint:', error.hint)
          if (error.code === '23505') {
            showToast('このスラッグは既に使用されています', 'error')
          } else {
            showToast('作成に失敗しました: ' + error.message, 'error')
          }
        } else {
          console.log('Article created successfully:', data)
          showToast('記事を作成しました', 'success')
          navigate('/admin/articles')
        }
      }
    } catch (err) {
      console.error('Unexpected error saving article:', err)
      showToast('予期しないエラーが発生しました', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 size={32} className="animate-spin text-rose-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/articles')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? '記事を編集' : '新規記事作成'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              タイトル <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              placeholder="記事のタイトル"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              スラッグ（URL） <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                placeholder="article-slug"
              />
              <button
                type="button"
                onClick={generateSlug}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Wand2 size={16} />
                <span>自動生成</span>
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">/articles/{formData.slug || 'slug'}</p>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">カテゴリ</label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, category: e.target.value as ArticleCategory }))
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {ARTICLE_CATEGORY_LABELS[cat]}
                </option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">タグ</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData((prev) => ({ ...prev, tags: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              placeholder="タグ1, タグ2, タグ3（カンマ区切り）"
            />
          </div>

          {/* Thumbnail */}
          <ImageUploader
            value={formData.thumbnail_url}
            onChange={(url) => setFormData((prev) => ({ ...prev, thumbnail_url: url }))}
            type="thumbnail"
            label="サムネイル画像"
          />

          {/* Content */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                本文 <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-1 text-sm text-rose-500 hover:underline"
              >
                {showPreview ? <EyeOff size={14} /> : <Eye size={14} />}
                {showPreview ? '編集に戻る' : 'プレビュー'}
              </button>
            </div>
            {showPreview ? (
              <div className="min-h-[400px] p-6 border border-gray-300 rounded-lg bg-white">
                {formData.content ? (
                  <div
                    className="article-content"
                    dangerouslySetInnerHTML={{ __html: formData.content }}
                  />
                ) : (
                  <p className="text-gray-400 italic">プレビューする内容がありません</p>
                )}
              </div>
            ) : (
              <RichTextEditor
                content={formData.content}
                onChange={(html) => setFormData((prev) => ({ ...prev, content: html }))}
                placeholder="記事の内容を入力..."
                onImageUpload={handleContentImageUpload}
              />
            )}
            <p className="mt-1 text-xs text-gray-500">
              WordPressやnoteからコピー＆ペーストすると書式が保持されます
            </p>
          </div>

          {/* Publish Status */}
          <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_published}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, is_published: e.target.checked }))
                }
                className="w-4 h-4 text-rose-500 rounded focus:ring-rose-500"
              />
              <span className="text-sm font-medium text-gray-700">公開する</span>
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/admin/articles')}
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            キャンセル
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 disabled:opacity-50 transition-colors"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            <span>{isEdit ? '更新する' : '作成する'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}
