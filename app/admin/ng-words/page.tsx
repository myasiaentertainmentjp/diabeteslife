'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import {
  Loader2,
  ShieldAlert,
  Plus,
  Trash2,
  X,
} from 'lucide-react'

interface NGWord {
  id: string
  word: string
  created_at: string
}

export default function AdminNGWordsPage() {
  const supabase = createClient()
  const [ngWords, setNGWords] = useState<NGWord[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [newWord, setNewWord] = useState('')
  const [adding, setAdding] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    fetchNGWords()
  }, [])

  async function fetchNGWords() {
    setLoading(true)
    const { data, error } = await supabase
      .from('ng_words')
      .select('id, word, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching NG words:', error)
    } else {
      setNGWords(data || [])
    }
    setLoading(false)
  }

  async function addNGWord() {
    if (!newWord.trim()) return

    setAdding(true)
    const { error } = await supabase
      .from('ng_words')
      .insert({ word: newWord.trim() })

    if (error) {
      console.error('Error adding NG word:', error)
      if (error.code === '23505') {
        alert('このNGワードは既に登録されています')
      } else {
        alert('追加に失敗しました')
      }
    } else {
      setNewWord('')
      setShowAddForm(false)
      fetchNGWords()
    }
    setAdding(false)
  }

  async function deleteNGWord(id: string) {
    if (!confirm('このNGワードを削除しますか？')) return

    setDeleting(id)
    const { error } = await supabase.from('ng_words').delete().eq('id', id)

    if (error) {
      console.error('Error deleting NG word:', error)
      alert('削除に失敗しました')
    } else {
      fetchNGWords()
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <ShieldAlert className="text-red-500" />
          NGワード管理
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
        登録されたNGワードを含む投稿は自動的にブロックされます。
      </p>

      {/* Add Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">NGワードを追加</h2>
              <button
                onClick={() => { setShowAddForm(false); setNewWord('') }}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            <input
              type="text"
              value={newWord}
              onChange={(e) => setNewWord(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addNGWord()}
              placeholder="NGワードを入力..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => { setShowAddForm(false); setNewWord('') }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={addNGWord}
                disabled={adding || !newWord.trim()}
                className="px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors disabled:opacity-50"
              >
                {adding ? <Loader2 size={18} className="animate-spin" /> : '追加'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NG Words List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 size={32} className="animate-spin text-rose-500" />
          </div>
        ) : ngWords.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500">
            <ShieldAlert size={48} className="mx-auto mb-4 text-gray-300" />
            <p>NGワードが登録されていません</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ワード</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">登録日</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {ngWords.map((ngWord) => (
                <tr key={ngWord.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded font-mono">
                      {ngWord.word}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatDate(ngWord.created_at)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end">
                      <button
                        onClick={() => deleteNGWord(ngWord.id)}
                        disabled={deleting === ngWord.id}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="削除"
                      >
                        {deleting === ngWord.id ? (
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

      <div className="text-sm text-gray-500">
        <p>計 {ngWords.length} 件のNGワード</p>
      </div>
    </div>
  )
}
