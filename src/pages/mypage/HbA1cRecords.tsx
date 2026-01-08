import { useState, useEffect } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { HbA1cRecord } from '../../types/database'
import {
  Loader2,
  Plus,
  Edit2,
  Trash2,
  TrendingUp,
  TrendingDown,
  Minus,
  X,
} from 'lucide-react'

interface RecordFormData {
  record_month: string
  value: string
  memo: string
  is_public: boolean
}

const initialFormData: RecordFormData = {
  record_month: new Date().toISOString().slice(0, 7),
  value: '',
  memo: '',
  is_public: false,
}

export function HbA1cRecords() {
  const { user } = useAuth()
  const [records, setRecords] = useState<HbA1cRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<RecordFormData>(initialFormData)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      fetchRecords()
    }
  }, [user])

  async function fetchRecords() {
    if (!user) return

    const { data, error } = await supabase
      .from('hba1c_records')
      .select('*')
      .eq('user_id', user.id)
      .order('record_month', { ascending: false })

    if (error) {
      console.error('Error fetching records:', error)
    } else {
      setRecords(data as unknown as HbA1cRecord[])
    }
    setLoading(false)
  }

  function getChartData() {
    const sortedRecords = [...records]
      .sort((a, b) => a.record_month.localeCompare(b.record_month))
      .slice(-12)

    return sortedRecords.map((record) => ({
      month: record.record_month.slice(5),
      value: record.value,
    }))
  }

  function getFeedback(): { message: string; type: 'up' | 'down' | 'same' } | null {
    if (records.length < 2) return null

    const latest = records[0].value
    const previous = records[1].value
    const diff = latest - previous

    if (Math.abs(diff) < 0.1) {
      return { message: '前回と同じ値を維持しています', type: 'same' }
    } else if (diff < 0) {
      return {
        message: `前回より ${Math.abs(diff).toFixed(1)}% 改善しました！`,
        type: 'down',
      }
    } else {
      return {
        message: `前回より ${diff.toFixed(1)}% 上昇しています`,
        type: 'up',
      }
    }
  }

  function handleEdit(record: HbA1cRecord) {
    setEditingId(record.id)
    setFormData({
      record_month: record.record_month,
      value: record.value.toString(),
      memo: record.memo || '',
      is_public: record.is_public,
    })
    setShowForm(true)
  }

  async function handleDelete(id: string) {
    if (!confirm('この記録を削除しますか？')) return

    const { error } = await supabase.from('hba1c_records').delete().eq('id', id)

    if (error) {
      console.error('Error deleting record:', error)
      setError('削除に失敗しました')
    } else {
      setRecords((prev) => prev.filter((r) => r.id !== id))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return

    const value = parseFloat(formData.value)
    if (isNaN(value) || value < 4.0 || value > 15.0) {
      setError('HbA1c値は4.0〜15.0の範囲で入力してください')
      return
    }

    setSaving(true)
    setError(null)

    if (editingId) {
      const { error } = await supabase
        .from('hba1c_records')
        .update({
          record_month: formData.record_month,
          value,
          memo: formData.memo || null,
          is_public: formData.is_public,
          updated_at: new Date().toISOString(),
        } as never)
        .eq('id', editingId)

      if (error) {
        console.error('Error updating record:', error)
        setError('更新に失敗しました')
      } else {
        await fetchRecords()
        resetForm()
      }
    } else {
      const { error } = await supabase.from('hba1c_records').insert({
        user_id: user.id,
        record_month: formData.record_month,
        value,
        memo: formData.memo || null,
        is_public: formData.is_public,
      } as never)

      if (error) {
        console.error('Error inserting record:', error)
        setError('登録に失敗しました')
      } else {
        await fetchRecords()
        resetForm()
      }
    }

    setSaving(false)
  }

  function resetForm() {
    setFormData(initialFormData)
    setEditingId(null)
    setShowForm(false)
  }

  function formatMonth(monthStr: string) {
    const [year, month] = monthStr.split('-')
    return `${year}年${parseInt(month)}月`
  }

  const feedback = getFeedback()
  const chartData = getChartData()

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 size={24} className="animate-spin text-green-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Chart */}
      {chartData.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-4">
            HbA1c推移（過去12ヶ月）
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis
                domain={[4, 12]}
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: '#e5e7eb' }}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                formatter={(value: number) => [`${value}%`, 'HbA1c']}
                labelFormatter={(label) => `${label}月`}
              />
              <ReferenceLine
                y={7}
                stroke="#10B981"
                strokeDasharray="5 5"
                label={{ value: '目標: 7.0%', position: 'right', fontSize: 10, fill: '#10B981' }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#2563EB"
                strokeWidth={2}
                dot={{ fill: '#2563EB', strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Feedback */}
      {feedback && (
        <div
          className={`flex items-center gap-3 p-4 rounded-lg ${
            feedback.type === 'down'
              ? 'bg-green-50 text-green-700'
              : feedback.type === 'up'
              ? 'bg-orange-50 text-orange-700'
              : 'bg-gray-50 text-gray-700'
          }`}
        >
          {feedback.type === 'down' ? (
            <TrendingDown size={20} />
          ) : feedback.type === 'up' ? (
            <TrendingUp size={20} />
          ) : (
            <Minus size={20} />
          )}
          <span className="font-medium">{feedback.message}</span>
        </div>
      )}

      {/* Add Button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
        >
          <Plus size={18} />
          <span>新しい記録を追加</span>
        </button>
      )}

      {/* Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-gray-50 rounded-lg p-4 space-y-4"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-gray-900">
              {editingId ? '記録を編集' : '新しい記録'}
            </h3>
            <button
              type="button"
              onClick={resetForm}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                測定月
              </label>
              <input
                type="month"
                value={formData.record_month}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, record_month: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                HbA1c値（%）
              </label>
              <input
                type="number"
                step="0.1"
                min="4.0"
                max="15.0"
                value={formData.value}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, value: e.target.value }))
                }
                placeholder="例: 6.5"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              メモ（任意）
            </label>
            <textarea
              value={formData.memo}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, memo: e.target.value }))
              }
              placeholder="メモを入力..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_public}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, is_public: e.target.checked }))
              }
              className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
            />
            <span className="text-sm text-gray-700">この記録を公開する</span>
          </label>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {saving && <Loader2 size={16} className="animate-spin" />}
              <span>{editingId ? '更新する' : '記録する'}</span>
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              キャンセル
            </button>
          </div>
        </form>
      )}

      {/* History Table */}
      {records.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">記録履歴</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left font-medium text-gray-600">
                    測定月
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">
                    HbA1c
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">
                    メモ
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">
                    公開
                  </th>
                  <th className="px-4 py-2 text-right font-medium text-gray-600">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {records.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-900">
                      {formatMonth(record.record_month)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`font-medium ${
                          record.value <= 7
                            ? 'text-green-600'
                            : record.value <= 8
                            ? 'text-orange-600'
                            : 'text-red-600'
                        }`}
                      >
                        {record.value}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-[200px] truncate">
                      {record.memo || '-'}
                    </td>
                    <td className="px-4 py-3">
                      {record.is_public ? (
                        <span className="text-green-600">公開</span>
                      ) : (
                        <span className="text-gray-400">非公開</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(record)}
                          className="p-1 text-gray-400 hover:text-green-600"
                          title="編集"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(record.id)}
                          className="p-1 text-gray-400 hover:text-red-600"
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
        </div>
      )}

      {records.length === 0 && !showForm && (
        <div className="text-center py-8 text-gray-500">
          <p>まだ記録がありません</p>
          <p className="text-sm mt-1">
            「新しい記録を追加」ボタンから記録を始めましょう
          </p>
        </div>
      )}
    </div>
  )
}
