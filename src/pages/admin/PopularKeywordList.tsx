import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useToast } from '../../contexts/ToastContext'
import { PopularKeyword } from '../../types/database'
import { Plus, Edit2, Trash2, Loader2, GripVertical, Check, X, ToggleLeft, ToggleRight } from 'lucide-react'

export function PopularKeywordList() {
  const { showToast } = useToast()
  const [keywords, setKeywords] = useState<PopularKeyword[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [newKeyword, setNewKeyword] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  useEffect(() => {
    fetchKeywords()
  }, [])

  async function fetchKeywords() {
    try {
      const { data, error } = await supabase
        .from('popular_keywords')
        .select('*')
        .order('display_order', { ascending: true })

      if (error) {
        console.error('Error fetching keywords:', error)
        showToast('キーワードの取得に失敗しました', 'error')
      } else {
        setKeywords(data || [])
      }
    } catch (error) {
      console.error('Error fetching keywords:', error)
      showToast('キーワードの取得に失敗しました', 'error')
    } finally {
      setLoading(false)
    }
  }

  async function addKeyword() {
    if (!newKeyword.trim()) return

    const maxOrder = Math.max(...keywords.map(k => k.display_order), 0)

    const { data, error } = await supabase
      .from('popular_keywords')
      .insert({
        keyword: newKeyword.trim(),
        display_order: maxOrder + 1,
        is_active: true,
      })
      .select()
      .single()

    if (error) {
      console.error('Error adding keyword:', error)
      showToast('追加に失敗しました', 'error')
    } else {
      setKeywords([...keywords, data])
      setNewKeyword('')
      setIsAdding(false)
      showToast('キーワードを追加しました', 'success')
    }
  }

  async function updateKeyword(id: string) {
    if (!editValue.trim()) return

    const { error } = await supabase
      .from('popular_keywords')
      .update({ keyword: editValue.trim() })
      .eq('id', id)

    if (error) {
      console.error('Error updating keyword:', error)
      showToast('更新に失敗しました', 'error')
    } else {
      setKeywords(keywords.map(k =>
        k.id === id ? { ...k, keyword: editValue.trim() } : k
      ))
      setEditingId(null)
      setEditValue('')
      showToast('キーワードを更新しました', 'success')
    }
  }

  async function toggleActive(keyword: PopularKeyword) {
    const { error } = await supabase
      .from('popular_keywords')
      .update({ is_active: !keyword.is_active })
      .eq('id', keyword.id)

    if (error) {
      console.error('Error toggling keyword:', error)
      showToast('更新に失敗しました', 'error')
    } else {
      setKeywords(keywords.map(k =>
        k.id === keyword.id ? { ...k, is_active: !k.is_active } : k
      ))
      showToast(
        keyword.is_active ? 'キーワードを無効にしました' : 'キーワードを有効にしました',
        'success'
      )
    }
  }

  async function deleteKeyword(id: string) {
    if (!confirm('このキーワードを削除しますか？')) return

    const { error } = await supabase
      .from('popular_keywords')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting keyword:', error)
      showToast('削除に失敗しました', 'error')
    } else {
      setKeywords(keywords.filter(k => k.id !== id))
      showToast('キーワードを削除しました', 'success')
    }
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

    // Update display_order for both swapped items
    const updates = [
      { id: newKeywords[index].id, display_order: index + 1 },
      { id: newKeywords[newIndex].id, display_order: newIndex + 1 },
    ]

    for (const update of updates) {
      const { error } = await supabase
        .from('popular_keywords')
        .update({ display_order: update.display_order })
        .eq('id', update.id)

      if (error) {
        console.error('Error updating order:', error)
        showToast('並び順の更新に失敗しました', 'error')
        return
      }
    }

    setKeywords(newKeywords.map((k, i) => ({ ...k, display_order: i + 1 })))
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
        <div>
          <h1 className="text-2xl font-bold text-gray-900">人気キーワード管理</h1>
          <p className="text-sm text-gray-500 mt-1">
            ホームページに表示する人気キーワードを管理します
          </p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
        >
          <Plus size={18} />
          <span>新規追加</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        {/* Add new keyword form */}
        {isAdding && (
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                placeholder="新しいキーワードを入力..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') addKeyword()
                  if (e.key === 'Escape') {
                    setIsAdding(false)
                    setNewKeyword('')
                  }
                }}
              />
              <button
                onClick={addKeyword}
                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                title="追加"
              >
                <Check size={20} />
              </button>
              <button
                onClick={() => {
                  setIsAdding(false)
                  setNewKeyword('')
                }}
                className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"
                title="キャンセル"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        )}

        {/* Keywords list */}
        <div className="divide-y divide-gray-100">
          {keywords.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>キーワードがありません</p>
            </div>
          ) : (
            keywords.map((keyword, index) => (
              <div
                key={keyword.id}
                className={`flex items-center gap-3 px-4 py-3 ${
                  !keyword.is_active ? 'bg-gray-50 opacity-60' : ''
                }`}
              >
                {/* Order controls */}
                <div className="flex flex-col">
                  <button
                    onClick={() => moveKeyword(keyword.id, 'up')}
                    disabled={index === 0}
                    className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="上へ"
                  >
                    <GripVertical size={14} className="rotate-180" />
                  </button>
                  <button
                    onClick={() => moveKeyword(keyword.id, 'down')}
                    disabled={index === keywords.length - 1}
                    className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="下へ"
                  >
                    <GripVertical size={14} />
                  </button>
                </div>

                {/* Order number */}
                <span className="w-6 text-center text-sm text-gray-400 font-medium">
                  {index + 1}
                </span>

                {/* Keyword */}
                <div className="flex-1">
                  {editingId === keyword.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') updateKeyword(keyword.id)
                          if (e.key === 'Escape') {
                            setEditingId(null)
                            setEditValue('')
                          }
                        }}
                      />
                      <button
                        onClick={() => updateKeyword(keyword.id)}
                        className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(null)
                          setEditValue('')
                        }}
                        className="p-1.5 text-gray-400 hover:bg-gray-100 rounded transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <span className={`${index < 3 ? 'text-orange-700 font-medium' : 'text-gray-700'}`}>
                      {keyword.keyword}
                    </span>
                  )}
                </div>

                {/* Actions */}
                {editingId !== keyword.id && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleActive(keyword)}
                      className={`p-1.5 rounded hover:bg-gray-100 transition-colors ${
                        keyword.is_active ? 'text-green-500' : 'text-gray-400'
                      }`}
                      title={keyword.is_active ? '無効にする' : '有効にする'}
                    >
                      {keyword.is_active ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(keyword.id)
                        setEditValue(keyword.keyword)
                      }}
                      className="p-1.5 text-gray-400 rounded hover:bg-gray-100 transition-colors"
                      title="編集"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => deleteKeyword(keyword.id)}
                      className="p-1.5 text-red-600 rounded hover:bg-red-50 transition-colors"
                      title="削除"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Help text */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <h3 className="font-medium text-orange-800 mb-2">表示について</h3>
        <ul className="text-sm text-orange-700 space-y-1">
          <li>・上位3件はオレンジ色でハイライト表示されます</li>
          <li>・最大15件まで表示されます</li>
          <li>・無効にしたキーワードは表示されません</li>
        </ul>
      </div>
    </div>
  )
}
