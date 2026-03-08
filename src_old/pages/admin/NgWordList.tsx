import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useToast } from '../../contexts/ToastContext'
import { NgWord } from '../../types/database'
import { Loader2, Plus, Trash2 } from 'lucide-react'

export function AdminNgWordList() {
  const { showToast } = useToast()
  const [ngWords, setNgWords] = useState<NgWord[]>([])
  const [loading, setLoading] = useState(true)
  const [newWord, setNewWord] = useState('')
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    fetchNgWords()
  }, [])

  async function fetchNgWords() {
    const { data, error } = await supabase
      .from('ng_words')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching NG words:', error)
      showToast('NGワードの取得に失敗しました', 'error')
    } else {
      setNgWords(data as unknown as NgWord[])
    }
    setLoading(false)
  }

  async function addWord(e: React.FormEvent) {
    e.preventDefault()
    const word = newWord.trim()

    if (!word) {
      showToast('ワードを入力してください', 'error')
      return
    }

    // Check for duplicates
    if (ngWords.some((ng) => ng.word.toLowerCase() === word.toLowerCase())) {
      showToast('このワードは既に登録されています', 'error')
      return
    }

    setAdding(true)

    const { data, error } = await supabase
      .from('ng_words')
      .insert({ word } as never)
      .select()
      .single()

    if (error) {
      console.error('Error adding NG word:', error)
      showToast('追加に失敗しました', 'error')
    } else {
      setNgWords((prev) => [data as unknown as NgWord, ...prev])
      setNewWord('')
      showToast('NGワードを追加しました', 'success')
    }

    setAdding(false)
  }

  async function deleteWord(id: string) {
    if (!confirm('このNGワードを削除しますか？')) return

    const { error } = await supabase.from('ng_words').delete().eq('id', id)

    if (error) {
      console.error('Error deleting NG word:', error)
      showToast('削除に失敗しました', 'error')
    } else {
      setNgWords((prev) => prev.filter((ng) => ng.id !== id))
      showToast('NGワードを削除しました', 'success')
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('ja-JP')
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">NGワード管理</h1>

      {/* Add Form */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">新しいNGワードを追加</h2>
        <form onSubmit={addWord} className="flex gap-3">
          <input
            type="text"
            value={newWord}
            onChange={(e) => setNewWord(e.target.value)}
            placeholder="NGワードを入力..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={adding}
            className="flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 disabled:opacity-50 transition-colors"
          >
            {adding ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Plus size={18} />
            )}
            <span>追加</span>
          </button>
        </form>
      </div>

      {/* Word List */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 size={32} className="animate-spin text-rose-500" />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="font-medium text-gray-900">
              登録済みNGワード（{ngWords.length}件）
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left font-medium text-gray-600">ワード</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">登録日</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {ngWords.map((ng, index) => (
                  <tr
                    key={ng.id}
                    className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">{ng.word}</td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(ng.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        <button
                          onClick={() => deleteWord(ng.id)}
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

          {ngWords.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p>NGワードが登録されていません</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
