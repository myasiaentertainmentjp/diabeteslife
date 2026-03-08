'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { ARTICLE_CATEGORY_LABELS, ArticleCategory } from '@/types/database'
import { Loader2, Plus, Edit, Trash2, Eye, EyeOff, FileText } from 'lucide-react'

interface Article {
  id: string
  title: string
  slug: string
  excerpt: string | null
  category: ArticleCategory
  is_published: boolean
  published_at: string | null
  created_at: string
}

export default function AdminArticlesPage() {
  const supabase = createClient()
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    fetchArticles()
  }, [])

  async function fetchArticles() {
    setLoading(true)
    const { data, error } = await supabase
      .from('articles')
      .select('id, title, slug, excerpt, category, is_published, published_at, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching articles:', error)
    } else {
      setArticles(data || [])
    }
    setLoading(false)
  }

  async function togglePublish(id: string, currentStatus: boolean) {
    const { error } = await supabase
      .from('articles')
      .update({
        is_published: !currentStatus,
        published_at: !currentStatus ? new Date().toISOString() : null,
      } as never)
      .eq('id', id)

    if (error) {
      console.error('Error updating article:', error)
    } else {
      fetchArticles()
    }
  }

  async function deleteArticle(id: string) {
    if (!confirm('この記事を削除しますか？')) return

    setDeleting(id)
    const { error } = await supabase.from('articles').delete().eq('id', id)

    if (error) {
      console.error('Error deleting article:', error)
    } else {
      fetchArticles()
    }
    setDeleting(null)
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">記事管理</h1>
        <Link
          href="/admin/articles/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
        >
          <Plus size={18} />
          新規作成
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {articles.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500">
            <FileText size={48} className="mx-auto mb-4 text-gray-300" />
            <p>記事がありません</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">タイトル</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">カテゴリ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状態</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">作成日</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {articles.map((article) => (
                <tr key={article.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{article.title}</p>
                      <p className="text-sm text-gray-500">/articles/{article.slug}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                      {ARTICLE_CATEGORY_LABELS[article.category]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {article.is_published ? (
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">公開中</span>
                    ) : (
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">下書き</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatDate(article.created_at)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/articles/${article.slug}`}
                        target="_blank"
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="プレビュー"
                      >
                        <Eye size={18} />
                      </Link>
                      <button
                        onClick={() => togglePublish(article.id, article.is_published)}
                        className={`p-2 rounded-lg ${
                          article.is_published
                            ? 'text-gray-600 hover:bg-gray-100'
                            : 'text-green-600 hover:bg-green-50'
                        }`}
                        title={article.is_published ? '非公開にする' : '公開する'}
                      >
                        {article.is_published ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                      <Link
                        href={`/admin/articles/${article.id}/edit`}
                        className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg"
                        title="編集"
                      >
                        <Edit size={18} />
                      </Link>
                      <button
                        onClick={() => deleteArticle(article.id)}
                        disabled={deleting === article.id}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
                        title="削除"
                      >
                        {deleting === article.id ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <Trash2 size={18} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
