import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import { supabase } from '../../lib/supabase'
import { useToast } from '../../contexts/ToastContext'
import { ArticleCategory, ARTICLE_CATEGORY_LABELS } from '../../types/database'
import { Loader2, Save, ArrowLeft, Eye, EyeOff, Wand2 } from 'lucide-react'

const CATEGORIES: ArticleCategory[] = ['health', 'lifestyle', 'food', 'exercise', 'medical', 'other']

interface FormData {
  title: string
  slug: string
  category: ArticleCategory
  tags: string
  thumbnail_url: string
  excerpt: string
  content: string
  is_published: boolean
}

const initialFormData: FormData = {
  title: '',
  slug: '',
  category: 'health',
  tags: '',
  thumbnail_url: '',
  excerpt: '',
  content: '',
  is_published: false,
}

export function ArticleForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const isEdit = Boolean(id)

  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    if (isEdit && id) {
      fetchArticle(id)
    }
  }, [id, isEdit])

  async function fetchArticle(articleId: string) {
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
      excerpt: data.excerpt || '',
      content: data.content,
      is_published: data.is_published,
    })
    setLoading(false)
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
    if (!formData.content.trim()) {
      showToast('本文を入力してください', 'error')
      return
    }

    setSaving(true)

    const articleData = {
      title: formData.title.trim(),
      slug: formData.slug.trim(),
      category: formData.category,
      tags: formData.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      thumbnail_url: formData.thumbnail_url.trim() || null,
      excerpt: formData.excerpt.trim() || null,
      content: formData.content,
      is_published: formData.is_published,
      published_at: formData.is_published ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    }

    if (isEdit && id) {
      const { error } = await supabase
        .from('articles')
        .update(articleData as never)
        .eq('id', id)

      if (error) {
        console.error('Error updating article:', error)
        showToast('更新に失敗しました', 'error')
      } else {
        showToast('記事を更新しました', 'success')
        navigate('/admin/articles')
      }
    } else {
      const { error } = await supabase.from('articles').insert(articleData as never)

      if (error) {
        console.error('Error creating article:', error)
        if (error.code === '23505') {
          showToast('このスラッグは既に使用されています', 'error')
        } else {
          showToast('作成に失敗しました', 'error')
        }
      } else {
        showToast('記事を作成しました', 'success')
        navigate('/admin/articles')
      }
    }

    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 size={32} className="animate-spin text-green-600" />
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="タグ1, タグ2, タグ3（カンマ区切り）"
            />
          </div>

          {/* Thumbnail URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">サムネイルURL</label>
            <input
              type="url"
              value={formData.thumbnail_url}
              onChange={(e) => setFormData((prev) => ({ ...prev, thumbnail_url: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="https://example.com/image.jpg"
            />
            {formData.thumbnail_url && (
              <img
                src={formData.thumbnail_url}
                alt="サムネイルプレビュー"
                className="mt-2 h-32 object-cover rounded-lg"
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
            )}
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">抜粋</label>
            <textarea
              value={formData.excerpt}
              onChange={(e) => setFormData((prev) => ({ ...prev, excerpt: e.target.value }))}
              rows={2}
              maxLength={200}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              placeholder="記事の概要（150文字程度）"
            />
            <p className="mt-1 text-xs text-gray-500">{formData.excerpt.length}/200文字</p>
          </div>

          {/* Content */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                本文 <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-1 text-sm text-green-600 hover:underline"
              >
                {showPreview ? <EyeOff size={14} /> : <Eye size={14} />}
                {showPreview ? '編集に戻る' : 'プレビュー'}
              </button>
            </div>
            {showPreview ? (
              <div className="min-h-[300px] p-4 border border-gray-300 rounded-lg bg-gray-50 prose prose-sm max-w-none">
                <ReactMarkdown>{formData.content || '*プレビューする内容がありません*'}</ReactMarkdown>
              </div>
            ) : (
              <textarea
                value={formData.content}
                onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
                rows={15}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-y font-mono text-sm"
                placeholder="Markdown形式で記事を書いてください..."
              />
            )}
            <p className="mt-1 text-xs text-gray-500">Markdown記法が使用できます</p>
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
                className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
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
            className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            <span>{isEdit ? '更新する' : '作成する'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}
