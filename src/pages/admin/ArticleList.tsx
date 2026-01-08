import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useToast } from '../../contexts/ToastContext'
import { Article, ARTICLE_CATEGORY_LABELS } from '../../types/database'
import { Plus, Edit2, Trash2, Eye, EyeOff, Loader2 } from 'lucide-react'

export function AdminArticleList() {
  const { showToast } = useToast()
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchArticles()
  }, [])

  async function fetchArticles() {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching articles:', error)
      showToast('記事の取得に失敗しました', 'error')
    } else {
      setArticles(data as unknown as Article[])
    }
    setLoading(false)
  }

  async function togglePublish(article: Article) {
    const { error } = await supabase
      .from('articles')
      .update({
        is_published: !article.is_published,
        published_at: !article.is_published ? new Date().toISOString() : null,
      } as never)
      .eq('id', article.id)

    if (error) {
      console.error('Error updating article:', error)
      showToast('更新に失敗しました', 'error')
    } else {
      setArticles((prev) =>
        prev.map((a) =>
          a.id === article.id
            ? { ...a, is_published: !a.is_published }
            : a
        )
      )
      showToast(
        article.is_published ? '記事を非公開にしました' : '記事を公開しました',
        'success'
      )
    }
  }

  async function deleteArticle(id: string) {
    if (!confirm('この記事を削除しますか？')) return

    const { error } = await supabase.from('articles').delete().eq('id', id)

    if (error) {
      console.error('Error deleting article:', error)
      showToast('削除に失敗しました', 'error')
    } else {
      setArticles((prev) => prev.filter((a) => a.id !== id))
      showToast('記事を削除しました', 'success')
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('ja-JP')
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">記事管理</h1>
        <Link
          to="/admin/articles/new"
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus size={18} />
          <span>新規作成</span>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left font-medium text-gray-600">タイトル</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">カテゴリ</th>
                <th className="px-4 py-3 text-center font-medium text-gray-600">公開状態</th>
                <th className="px-4 py-3 text-center font-medium text-gray-600">閲覧数</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">作成日</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {articles.map((article, index) => (
                <tr
                  key={article.id}
                  className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}
                >
                  <td className="px-4 py-3">
                    <div className="max-w-xs truncate font-medium text-gray-900">
                      {article.title}
                    </div>
                    <div className="text-xs text-gray-500 truncate">/articles/{article.slug}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 text-xs bg-gray-100 rounded">
                      {ARTICLE_CATEGORY_LABELS[article.category]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {article.is_published ? (
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
                        公開
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                        下書き
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-600">
                    {article.view_count.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(article.created_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => togglePublish(article)}
                        className={`p-1.5 rounded hover:bg-gray-100 transition-colors ${
                          article.is_published ? 'text-green-600' : 'text-gray-400'
                        }`}
                        title={article.is_published ? '非公開にする' : '公開する'}
                      >
                        {article.is_published ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>
                      <Link
                        to={`/admin/articles/${article.id}/edit`}
                        className="p-1.5 text-green-600 rounded hover:bg-green-50 transition-colors"
                        title="編集"
                      >
                        <Edit2 size={16} />
                      </Link>
                      <button
                        onClick={() => deleteArticle(article.id)}
                        className="p-1.5 text-red-600 rounded hover:bg-red-50 transition-colors"
                        title="削除"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {articles.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p>記事がありません</p>
          </div>
        )}
      </div>
    </div>
  )
}
