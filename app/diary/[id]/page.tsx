'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase'
import { ArrowLeft, Edit2, Trash2, Loader2, BookOpen, Calendar, Save, X } from 'lucide-react'

interface DiaryEntry {
  id: string
  user_id: string
  title: string
  content: string
  mood?: string
  created_at: string
  updated_at?: string
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

export default function DiaryDetailPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const diaryId = params.id as string

  const [entry, setEntry] = useState<DiaryEntry | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [editMood, setEditMood] = useState<string>('okay')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/mypage/diary')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user && diaryId) {
      fetchEntry()
    }
  }, [user, diaryId])

  async function fetchEntry() {
    if (!user) return
    setLoading(true)
    const { data, error } = await supabase
      .from('diary_entries')
      .select('*')
      .eq('id', diaryId)
      .eq('user_id', user.id)
      .single()

    if (error || !data) {
      router.push('/mypage/diary')
      return
    }

    setEntry(data)
    setEditTitle(data.title)
    setEditContent(data.content)
    setEditMood(data.mood || 'okay')
    setLoading(false)
  }

  async function handleSave() {
    if (!user || !entry) return

    setSaving(true)
    const { error } = await supabase
      .from('diary_entries')
      .update({
        title: editTitle.trim(),
        content: editContent.trim(),
        mood: editMood,
        updated_at: new Date().toISOString(),
      })
      .eq('id', entry.id)
      .eq('user_id', user.id)

    if (!error) {
      setEntry({
        ...entry,
        title: editTitle.trim(),
        content: editContent.trim(),
        mood: editMood,
      })
      setIsEditing(false)
    }
    setSaving(false)
  }

  async function handleDelete() {
    if (!user || !entry) return
    if (!confirm('この日記を削除しますか？')) return

    setDeleting(true)
    const { error } = await supabase
      .from('diary_entries')
      .delete()
      .eq('id', entry.id)
      .eq('user_id', user.id)

    if (!error) {
      router.push('/mypage/diary')
    }
    setDeleting(false)
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString)
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    })
  }

  function formatTime(dateString: string) {
    const date = new Date(dateString)
    return date.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 size={32} className="animate-spin text-rose-500" />
      </div>
    )
  }

  if (!user || !entry) {
    return null
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <Link
        href="/mypage/diary"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-rose-500 mb-6"
      >
        <ArrowLeft size={20} />
        <span>日記一覧に戻る</span>
      </Link>

      <div className="bg-white rounded-lg shadow-sm">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                {entry.mood ? (
                  <span className="text-2xl">{MOOD_EMOJI[entry.mood]}</span>
                ) : (
                  <BookOpen size={24} className="text-purple-600" />
                )}
              </div>
              <div>
                {isEditing ? (
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="text-xl font-bold text-gray-900 border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                  />
                ) : (
                  <h1 className="text-xl font-bold text-gray-900">{entry.title}</h1>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                  <Calendar size={14} />
                  <span>{formatDate(entry.created_at)}</span>
                  <span>{formatTime(entry.created_at)}</span>
                  {entry.mood && !isEditing && (
                    <>
                      <span>・</span>
                      <span>{MOOD_LABEL[entry.mood]}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {!isEditing && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                  title="編集"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                  title="削除"
                >
                  {deleting ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Trash2 size={18} />
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Mood selector in edit mode */}
          {isEditing && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                気分
              </label>
              <div className="flex gap-2">
                {Object.entries(MOOD_EMOJI).map(([key, emoji]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setEditMood(key)}
                    className={`flex-1 py-2 rounded-lg text-xl transition-all ${
                      editMood === key
                        ? 'bg-purple-100 ring-2 ring-purple-500'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                    title={MOOD_LABEL[key]}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {isEditing ? (
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={10}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none resize-none"
            />
          ) : (
            <div className="prose prose-gray max-w-none">
              {entry.content.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4 last:mb-0 text-gray-700 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          )}
        </div>

        {/* Edit Actions */}
        {isEditing && (
          <div className="px-6 pb-6 flex gap-3">
            <button
              onClick={() => {
                setIsEditing(false)
                setEditTitle(entry.title)
                setEditContent(entry.content)
                setEditMood(entry.mood || 'okay')
              }}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              <X size={18} />
              <span>キャンセル</span>
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:bg-gray-300 transition-colors"
            >
              {saving ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Save size={18} />
              )}
              <span>{saving ? '保存中...' : '保存'}</span>
            </button>
          </div>
        )}

        {/* Update info */}
        {entry.updated_at && entry.updated_at !== entry.created_at && (
          <div className="px-6 pb-6 text-xs text-gray-400">
            最終更新: {formatDate(entry.updated_at)} {formatTime(entry.updated_at)}
          </div>
        )}
      </div>
    </div>
  )
}
