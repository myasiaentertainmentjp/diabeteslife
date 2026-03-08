'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts'
import { ArrowLeft, Plus, Trash2, Loader2, Scale } from 'lucide-react'

interface WeightRecord {
  id: string
  value: number
  recorded_at: string
  memo?: string
}

export default function WeightPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [records, setRecords] = useState<WeightRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newValue, setNewValue] = useState('')
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0])
  const [newMemo, setNewMemo] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [targetWeight, setTargetWeight] = useState<number | null>(null)

  const supabase = createClient()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/mypage/weight')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      fetchRecords()
      fetchTargetWeight()
    }
  }, [user])

  async function fetchRecords() {
    if (!user) return
    setLoading(true)
    const { data } = await supabase
      .from('weight_records')
      .select('*')
      .eq('user_id', user.id)
      .order('recorded_at', { ascending: true })
    setRecords(data || [])
    setLoading(false)
  }

  async function fetchTargetWeight() {
    if (!user) return
    const { data } = await supabase
      .from('users')
      .select('target_weight')
      .eq('id', user.id)
      .single()
    if (data?.target_weight) {
      setTargetWeight(data.target_weight)
    }
  }

  async function handleAddRecord(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !newValue) return

    setSubmitting(true)
    const { error } = await supabase.from('weight_records').insert({
      user_id: user.id,
      value: parseFloat(newValue),
      recorded_at: newDate,
      memo: newMemo || null,
    })

    if (!error) {
      setNewValue('')
      setNewMemo('')
      setShowAddModal(false)
      fetchRecords()
    }
    setSubmitting(false)
  }

  async function handleDeleteRecord(id: string) {
    if (!confirm('この記録を削除しますか？')) return

    await supabase.from('weight_records').delete().eq('id', id)
    fetchRecords()
  }

  const chartData = useMemo(() => {
    return records.map((record) => ({
      date: new Date(record.recorded_at).toLocaleDateString('ja-JP', {
        month: 'short',
        day: 'numeric',
      }),
      value: record.value,
    }))
  }, [records])

  const feedback = useMemo(() => {
    if (records.length < 2) return null

    const sorted = [...records].sort(
      (a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()
    )
    const latest = sorted[0]
    const previous = sorted[1]

    const diff = latest.value - previous.value
    const absDiff = Math.abs(diff).toFixed(1)

    if (targetWeight) {
      const toTarget = latest.value - targetWeight
      if (Math.abs(toTarget) < 0.5) {
        return {
          message: `目標体重達成！おめでとうございます！`,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
        }
      }
    }

    if (diff < -0.3) {
      return {
        message: `前回より${absDiff}kg減りました！`,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
      }
    } else if (diff > 0.3) {
      return {
        message: `前回より${absDiff}kg増えました。`,
        color: 'text-amber-600',
        bgColor: 'bg-amber-50',
      }
    } else {
      return {
        message: `体重は安定しています！`,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
      }
    }
  }, [records, targetWeight])

  const stats = useMemo(() => {
    if (records.length === 0) return null

    const values = records.map(r => r.value)
    const latest = records[records.length - 1]?.value
    const min = Math.min(...values)
    const max = Math.max(...values)

    return { latest, min, max }
  }, [records])

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
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Scale size={24} className="text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">体重記録</h1>
            <p className="text-sm text-gray-500">グラフで推移を確認</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} />
          <span>記録を追加</span>
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4 text-center">
            <p className="text-sm text-gray-500 mb-1">現在</p>
            <p className="text-2xl font-bold text-gray-900">{stats.latest}<span className="text-sm font-normal ml-1">kg</span></p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 text-center">
            <p className="text-sm text-gray-500 mb-1">最小</p>
            <p className="text-2xl font-bold text-green-600">{stats.min}<span className="text-sm font-normal ml-1">kg</span></p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 text-center">
            <p className="text-sm text-gray-500 mb-1">最大</p>
            <p className="text-2xl font-bold text-amber-600">{stats.max}<span className="text-sm font-normal ml-1">kg</span></p>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        {feedback && (
          <div className={`mb-4 p-3 rounded-lg ${feedback.bgColor}`}>
            <p className={`text-sm font-medium ${feedback.color}`}>{feedback.message}</p>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 size={32} className="animate-spin text-gray-400" />
          </div>
        ) : records.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Scale size={48} className="mx-auto mb-4 text-gray-300" />
            <p>まだ記録がありません</p>
            <p className="text-sm mt-2">「記録を追加」から最初の記録を追加しましょう</p>
          </div>
        ) : (
          <>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    tickLine={false}
                    axisLine={{ stroke: '#e5e7eb' }}
                  />
                  <YAxis
                    domain={['auto', 'auto']}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    tickLine={false}
                    axisLine={{ stroke: '#e5e7eb' }}
                    tickFormatter={(value) => `${value}kg`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    }}
                    formatter={(value) => [`${value}kg`, '体重']}
                  />
                  {targetWeight && (
                    <ReferenceLine y={targetWeight} stroke="#22c55e" strokeDasharray="5 5" />
                  )}
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: '#2563eb' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {targetWeight && (
              <div className="flex justify-center mt-4 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-0.5 bg-green-500" style={{ borderStyle: 'dashed' }}></div>
                  <span>目標体重 {targetWeight}kg</span>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Records List */}
      {records.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-4">記録一覧</h2>
          <div className="space-y-3">
            {[...records].reverse().map((record) => (
              <div
                key={record.id}
                className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
              >
                <div>
                  <p className="font-medium text-gray-900">{record.value}kg</p>
                  <p className="text-sm text-gray-500">
                    {new Date(record.recorded_at).toLocaleDateString('ja-JP')}
                  </p>
                  {record.memo && <p className="text-sm text-gray-600 mt-1">{record.memo}</p>}
                </div>
                <button
                  onClick={() => handleDeleteRecord(record.id)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">体重記録を追加</h3>
            <form onSubmit={handleAddRecord} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  体重 (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="20"
                  max="300"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="65.0"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">測定日</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  メモ（任意）
                </label>
                <input
                  type="text"
                  value={newMemo}
                  onChange={(e) => setNewMemo(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="朝食前"
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
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
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
