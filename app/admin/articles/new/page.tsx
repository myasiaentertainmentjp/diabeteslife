'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { ARTICLE_CATEGORY_LABELS, ArticleCategory } from '@/types/database'
import { Loader2, ArrowLeft, Save } from 'lucide-react'

export default function NewArticlePage() {
  const router = useRouter()
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: 'basics' as ArticleCategory,
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

    if (!formData.content.trim()) {
      alert('本文を入力してください')
      return
    }

    setSaving(true)

    const { error } = await supabase.from('articles').insert({
      title: formData.title.trim(),
      slug: formData.slug.trim(),
      excerpt: formData.excerpt.trim() || null,
      content: formData.content.trim(),
      category: formData.category,
      is_published: formData.is_published,
      published_at: formData.is_published ? new Date().toISOString() : null,
    })

    if (error) {
      console.error('Error creating article:', error)
      if (error.code === '23505') {
        alert('このスラッグは既に使用されています')
      } else {
        alert('保存に失敗しました')
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              カテゴリ
            </label>
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

          {/* Excerpt */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              抜粋
            </label>
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
            <textarea
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              rows={15}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono text-sm"
              placeholder="マークダウン形式で本文を入力"
            />
            <p className="mt-1 text-xs text-gray-500">マークダウン形式に対応しています</p>
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
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors disabled:opacity-50"
          >
            {saving ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}
            保存
          </button>
        </div>
      </form>
    </div>
  )
}
