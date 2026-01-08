import { useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { HbA1cRecord } from '../types/database'

interface HbA1cChartProps {
  records: HbA1cRecord[]
  showFeedback?: boolean
}

export function HbA1cChart({ records, showFeedback = false }: HbA1cChartProps) {
  const chartData = useMemo(() => {
    return records
      .sort((a, b) => new Date(a.record_month).getTime() - new Date(b.record_month).getTime())
      .map((record) => ({
        month: formatMonth(record.record_month),
        value: record.value,
        memo: record.memo,
      }))
  }, [records])

  const feedback = useMemo(() => {
    if (!showFeedback || records.length < 2) return null

    const sorted = [...records].sort(
      (a, b) => new Date(b.record_month).getTime() - new Date(a.record_month).getTime()
    )
    const latest = sorted[0]
    const previous = sorted[1]

    if (!latest || !previous) return null

    const diff = latest.value - previous.value
    const absDiff = Math.abs(diff).toFixed(1)

    if (diff < -0.1) {
      return {
        type: 'improvement',
        message: `素晴らしい！${absDiff}%改善しました！`,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
      }
    } else if (diff > 0.1) {
      return {
        type: 'increase',
        message: `少し上がりましたが、一緒に頑張りましょう！`,
        color: 'text-amber-600',
        bgColor: 'bg-amber-50',
      }
    } else {
      return {
        type: 'stable',
        message: `安定していますね！この調子で！`,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
      }
    }
  }, [records, showFeedback])

  if (records.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>HbA1cの記録がありません</p>
      </div>
    )
  }

  return (
    <div>
      {feedback && (
        <div className={`mb-4 p-3 rounded-lg ${feedback.bgColor}`}>
          <p className={`text-sm font-medium ${feedback.color}`}>{feedback.message}</p>
        </div>
      )}

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12, fill: '#6b7280' }}
              tickLine={false}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis
              domain={['auto', 'auto']}
              tick={{ fontSize: 12, fill: '#6b7280' }}
              tickLine={false}
              axisLine={{ stroke: '#e5e7eb' }}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
              formatter={(value: number) => [`${value}%`, 'HbA1c']}
              labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
            />
            {/* Reference lines for target ranges */}
            <ReferenceLine y={7.0} stroke="#f59e0b" strokeDasharray="5 5" />
            <ReferenceLine y={6.5} stroke="#22c55e" strokeDasharray="5 5" />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#16a34a"
              strokeWidth={2}
              dot={{ fill: '#16a34a', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: '#16a34a' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 mt-4 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-green-500" style={{ borderStyle: 'dashed' }}></div>
          <span>目標値 6.5%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-amber-500" style={{ borderStyle: 'dashed' }}></div>
          <span>注意値 7.0%</span>
        </div>
      </div>
    </div>
  )
}

function formatMonth(dateString: string): string {
  const date = new Date(dateString)
  return `${date.getFullYear()}/${date.getMonth() + 1}`
}
