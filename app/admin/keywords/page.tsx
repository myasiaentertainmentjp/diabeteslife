'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import {
  Loader2,
  TrendingUp,
  Plus,
  Trash2,
  X,
  GripVertical,
} from 'lucide-react'

interface Keyword {
  id: string
  keyword: string
  display_order: number
  created_at: string
}

export default function AdminKeywordsPage() {
  const supabase = createClient()
  const [keywords, setKeywords] = useState<Keyword[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [newKeyword, setNewKeyword] = useState('')
  const [adding, setAdding] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    fetchKeywords()
  }, [])

  async function fetchKeywords() {
    setLoading(true)
    const { data, error } = await supabase
      .from('popular_keywords')
      .select('id, keyword, display_order, created_at')
      .order('display_order', { ascending: true })

    if (error) {
      console.error('Error fetching keywords:', error)
    } else {
      setKeywords(data || [])
    }
    setLoading(false)
  }

  async function addKeyword() {
    if (!newKeyword.trim()) return

    setAdding(true)
    const maxOrder = keywords.length > 0
      ? Math.max(...keywords.map(k => k.display_order)) + 1
      : 0

    const { error } = await supabase
      .from('popular_keywords')
      .insert({
        keyword: newKeyword.trim(),
        display_order: maxOrder
      })

    if (error) {
      console.error('Error adding keyword:', error)
      if (error.code === '23505') {
        alert('このキーワードは既に登録されています')
      } else {
        alert('追加に失敗しました')
      }
    } else {
      setNewKeyword('')
      setShowAddForm(false)
      fetchKeywords()
    }
    setAdding(false)
  }

  async function deleteKeyword(id: string) {
    if (!confirm('このキーワードを削除しますか？')) return

    setDeleting(id)
    const { error } = await supabase.from('popular_keywords').delete().eq('id', id)

    if (error) {
      console.error('Error deleting keyword:', error)
      alert('削除に失敗しました')
    } else {
      fetchKeywords()
    }
    setDeleting(null)
  }

  async function moveKeyword(id: string, direction: 'up' | 'down') {
    const index = keywords.findIndex(k => k.id === id)
    if (index === -1) return
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === keywords.length - 1) return

    const newIndex = direction === 'up' ? index - 1 : index + 1
    const newKeywords = [...keywords]
    const [removed] = newKeywords.splice(index, 1)
    newKeywords.splice(newIndex, 0, removed)

    // Update display_order for all affected keywords
    const updates = newKeywords.map((k, i) => ({
      id: k.id,
      display_order: i,
    }))

    for (const update of updates) {
      await supabase
        .from('popular_keywords')
        .update({ display_order: update.display_order } as never)
        .eq('id', update.id)
    }

    fetchKeywords()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <TrendingUp className="text-green-500" />
          人気キーワード管理
        </h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
        >
          <Plus size={18} />
          追加
        </button>
      </div>

      <p className="text-sm text-gray-500">
        トップページに表示される人気キーワードを管理します。ドラッグで順序を変更できます。
      </p>

      {/* Add Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">キーワードを追加</h2>
              <button
                onClick={() => { setShowAddForm(false); setNewKeyword('') }}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            <input
              type="text"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addKeyword()}
              placeholder="キーワードを入力..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => { setShowAddForm(false); setNewKeyword('') }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={addKeyword}
                disabled={adding || !newKeyword.trim()}
                className="px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors disabled:opacity-50"
              >
                {adding ? <Loader2 size={18} className="animate-spin" /> : '追加'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Keywords List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 size={32} className="animate-spin text-rose-500" />
          </div>
        ) : keywords.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500">
            <TrendingUp size={48} className="mx-auto mb-4 text-gray-300" />
            <p>キーワードが登録されていません</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {keywords.map((keyword, index) => (
              <div
                key={keyword.id}
                className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50"
              >
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => moveKeyword(keyword.id, 'up')}
                    disabled={index === 0}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <svg width="12" height="8" viewBox="0 0 12 8" fill="currentColor">
                      <path d="M6 0L12 8H0L6 0Z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => moveKeyword(keyword.id, 'down')}
                    disabled={index === keywords.length - 1}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <svg width="12" height="8" viewBox="0 0 12 8" fill="currentColor">
                      <path d="M6 8L0 0H12L6 8Z" />
                    </svg>
                  </button>
                </div>

                <GripVertical size={18} className="text-gray-300" />

                <span className="text-sm font-medium text-gray-500 w-8">
                  #{index + 1}
                </span>

                <span className="flex-1 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg font-medium">
                  {keyword.keyword}
                </span>

                <button
                  onClick={() => deleteKeyword(keyword.id)}
                  disabled={deleting === keyword.id}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                  title="削除"
                >
                  {deleting === keyword.id ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Trash2 size={18} />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="text-sm text-gray-500">
        <p>計 {keywords.length} 件のキーワード</p>
      </div>
    </div>
  )
}
