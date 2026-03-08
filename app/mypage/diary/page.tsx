'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase'
import { ArrowLeft, Plus, Loader2, BookOpen, Calendar, ChevronRight } from 'lucide-react'

interface DiaryEntry {
  id: string
  title: string
  content: string
  mood?: string
  created_at: string
}

const MOOD_EMOJI: Record<string, string> = {
  great: '😊',
  good: '🙂',
  okay: '😐',
  bad: '😔',
  terrible: '😢',
}

const MOOD_LABEL: Record<string, string> = {
  great: 'とても良い',
  good: '良い',
  okay: '普通',
  bad: '悪い',
  terrible: 'とても悪い',
}

export default function DiaryListPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [entries, setEntries] = useState<DiaryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')
  const [newMood, setNewMood] = useState<string>('okay')
  const [submitting, setSubmitting] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/mypage/diary')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      fetchEntries()
    }
  }, [user])

  async function fetchEntries() {
    if (!user) return
    setLoading(true)
    const { data } = await supabase
      .from('diary_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)
    setEntries(data || [])
    setLoading(false)
  }

  async function handleAddEntry(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !newTitle.trim() || !newContent.trim()) return

    setSubmitting(true)
    const { error } = await supabase.from('diary_entries').insert({
      user_id: user.id,
      title: newTitle.trim(),
      content: newContent.trim(),
      mood: newMood,
    })

    if (!error) {
      setNewTitle('')
      setNewContent('')
      setNewMood('okay')
      setShowAddModal(false)
      fetchEntries()
    }
    setSubmitting(false)
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString)
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  function getExcerpt(content: string, maxLength: number = 100) {
    if (content.length <= maxLength) return content
    return content.slice(0, maxLength) + '...'
  }

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 size={32} className="animate-spin text-rose-500" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <Link
        href="/mypage"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-rose-500 mb-6"
      >
        <ArrowLeft size={20} />
        <span>マイページに戻る</span>
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <BookOpen size={24} className="text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">療養日記</h1>
            <p className="text-sm text-gray-500">日々の体調や気持ちを記録</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
        >
          <Plus size={18} />
          <span>日記を書く</span>
        </button>
      </div>

      {/* Entries List */}
      <div className="bg-white rounded-lg shadow-sm">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 size={32} className="animate-spin text-gray-400" />
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <BookOpen size={48} className="mx-auto mb-4 text-gray-300" />
            <p>まだ日記がありません</p>
            <p className="text-sm mt-2">「日記を書く」から最初の日記を書いてみましょう</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {entries.map((entry) => (
              <li key={entry.id}>
                <Link
                  href={`/diary/${entry.id}`}
                  className="flex items-start gap-4 p-4 hover:bg-gray-50 transition-colors"
                >
                  {entry.mood && (
                    <div className="text-2xl flex-shrink-0 mt-1">
                      {MOOD_EMOJI[entry.mood] || '📝'}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">{entry.title}</h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                      {getExcerpt(entry.content)}
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                      <Calendar size={12} />
                      <span>{formatDate(entry.created_at)}</span>
                      {entry.mood && (
                        <>
                          <span>・</span>
                          <span>{MOOD_LABEL[entry.mood]}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-gray-400 flex-shrink-0 mt-2" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-4">日記を書く</h3>
            <form onSubmit={handleAddEntry} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  タイトル
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                  placeholder="今日の体調"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  今日の気分
                </label>
                <div className="flex gap-2">
                  {Object.entries(MOOD_EMOJI).map(([key, emoji]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setNewMood(key)}
                      className={`flex-1 py-3 rounded-lg text-2xl transition-all ${
                        newMood === key
                          ? 'bg-purple-100 ring-2 ring-purple-500'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                      title={MOOD_LABEL[key]}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1 text-center">
                  {MOOD_LABEL[newMood]}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  内容
                </label>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none resize-none"
                  placeholder="今日の体調や、食事の内容、運動したことなどを自由に書いてください..."
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:bg-gray-300 transition-colors"
                >
                  {submitting && <Loader2 size={18} className="animate-spin" />}
                  <span>{submitting ? '保存中...' : '保存'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
