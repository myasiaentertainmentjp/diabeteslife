'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { ARTICLE_CATEGORY_LABELS, ArticleCategory } from '@/types/database'
import { RichTextEditor } from '@/components/RichTextEditor'
import { uploadImage } from '@/lib/imageUpload'
import { Loader2, ArrowLeft, Save, Upload, X } from 'lucide-react'

export default function NewArticlePage() {
  const router = useRouter()
  const supabase = createClient()
  const { user } = useAuth()
  const [saving, setSaving] = useState(false)
  const [thumbnailUploading, setThumbnailUploading] = useState(false)
  const thumbnailInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    thumbnail_url: '',
    category: 'chat_other' as ArticleCategory,
    is_published: false,
  })

  function generateSlug(title: string) {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  function handleTitleChange(title: string) {
    setFormData(prev => ({
      ...prev,
      title,
      slug: prev.slug || generateSlug(title),
    }))
  }

  async function handleThumbnailUpload(file: File) {
    setThumbnailUploading(true)
    try {
      const url = await uploadImage(file, 'thumbnail')
      setFormData(prev => ({ ...prev, thumbnail_url: url }))
    } catch (error) {
      console.error('Thumbnail upload failed:', error)
      alert('サムネイルのアップロードに失敗しました: ' + (error instanceof Error ? error.message : '不明なエラー'))
    } finally {
      setThumbnailUploading(false)
    }
  }

  async function handleContentImageUpload(file: File): Promise<string> {
    return uploadImage(file, 'content')
  }

  const [previewSlug, setPreviewSlug] = useState<string | null>(null)
  const [previewing, setPreviewing] = useState(false)

  async function handlePreview() {
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('タイトルと本文を入力してからプレビューしてください')
      return
    }
    setPreviewing(true)
    const slug = formData.slug.trim() || 'preview-draft'

    // 既存のプレビュー下書きがあれば更新、なければ作成
    const { data: existing } = await supabase
      .from('articles')
      .select('id')
      .eq('slug', slug)
      .eq('is_published', false)
      .maybeSingle()

    if (existing) {
      await supabase.from('articles').update({
        title: formData.title.trim(),
        content: formData.content.trim(),
        excerpt: formData.excerpt.trim() || null,
        thumbnail_url: formData.thumbnail_url || null,
        category: formData.category,
        is_published: false,
      }).eq('id', existing.id)
    } else {
      await supabase.from('articles').insert({
        title: formData.title.trim(),
        slug: slug,
        content: formData.content.trim(),
        excerpt: formData.excerpt.trim() || null,
        thumbnail_url: formData.thumbnail_url || null,
        category: formData.category,
        is_published: false,
        author_id: user?.id || null,
      })
    }

    setPreviewSlug(slug)
    window.open(`/articles/${slug}?preview=1`, '_blank')
    setPreviewing(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!formData.title.trim()) {
      alert('タイトルを入力してください')
      return
    }
    if (!formData.slug.trim()) {
      alert('スラッグを入力してください')
      return
    }
    if (!formData.content.trim() || formData.content === '<p></p>') {
      alert('本文を入力してください')
      return
    }

    setSaving(true)

    const { error } = await supabase.from('articles').insert({
      title: formData.title.trim(),
      slug: formData.slug.trim(),
      excerpt: formData.excerpt.trim() || null,
      content: formData.content.trim(),
      thumbnail_url: formData.thumbnail_url || null,
      category: formData.category,
      is_published: formData.is_published,
      published_at: formData.is_published ? new Date().toISOString() : null,
      author_id: user?.id || null,
    })

    if (error) {
      console.error('Error creating article:', error)
      if (error.code === '23505') {
        alert('このスラッグは既に使用されています')
      } else {
        alert(`保存に失敗しました\n\nエラー: ${error.message}\nコード: ${error.code}`)
      }
      setSaving(false)
      return
    }

    router.push('/admin/articles')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/articles"
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">新規記事作成</h1>
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
              onChange={(e) => handleTitleChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
              placeholder="記事タイトルを入力"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              スラッグ <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center">
              <span className="px-3 py-2 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg text-gray-500 text-sm">
                /articles/
              </span>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                placeholder="article-slug"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">カテゴリ</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as ArticleCategory }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              {Object.entries(ARTICLE_CATEGORY_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          {/* Thumbnail */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">サムネイル画像</label>
            {formData.thumbnail_url ? (
              <div className="relative inline-block">
                <img
                  src={formData.thumbnail_url}
                  alt="サムネイル"
                  className="w-64 h-36 object-cover rounded-lg border border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, thumbnail_url: '' }))}
                  className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div
                onClick={() => thumbnailInputRef.current?.click()}
                className="flex flex-col items-center justify-center w-64 h-36 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-rose-400 hover:bg-rose-50 transition-colors"
              >
                {thumbnailUploading ? (
                  <Loader2 size={24} className="animate-spin text-rose-500" />
                ) : (
                  <>
                    <Upload size={24} className="text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">クリックしてアップロード</span>
                    <span className="text-xs text-gray-400 mt-1">推奨: 1280×670px</span>
                  </>
                )}
              </div>
            )}
            <input
              ref={thumbnailInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleThumbnailUpload(file)
              }}
            />
            {/* URL直接入力 */}
            <div className="mt-2">
              <input
                type="url"
                value={formData.thumbnail_url}
                onChange={(e) => setFormData(prev => ({ ...prev, thumbnail_url: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm"
                placeholder="またはURLを直接入力"
              />
            </div>
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">抜粋</label>
            <textarea
              value={formData.excerpt}
              onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
              placeholder="記事の概要を入力（省略可）"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              本文 <span className="text-red-500">*</span>
            </label>
            <RichTextEditor
              content={formData.content}
              onChange={(html) => setFormData(prev => ({ ...prev, content: html }))}
              placeholder="記事の内容を入力..."
              onImageUpload={handleContentImageUpload}
            />
          </div>

          {/* Publish Toggle */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_published"
              checked={formData.is_published}
              onChange={(e) => setFormData(prev => ({ ...prev, is_published: e.target.checked }))}
              className="w-4 h-4 text-rose-500 border-gray-300 rounded focus:ring-rose-500"
            />
            <label htmlFor="is_published" className="text-sm font-medium text-gray-700">
              公開する
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Link
            href="/admin/articles"
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            キャンセル
          </Link>
          <button
            type="button"
            onClick={handlePreview}
            disabled={previewing}
            className="inline-flex items-center gap-2 px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            {previewing ? <Loader2 size={18} className="animate-spin" /> : <Eye size={18} />}
            プレビュー
          </button>
          <button
            type="submit"
            disabled={saving || thumbnailUploading}
            className="inline-flex items-center gap-2 px-6 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            保存
          </button>
        </div>
      </form>
    </div>
  )
}
