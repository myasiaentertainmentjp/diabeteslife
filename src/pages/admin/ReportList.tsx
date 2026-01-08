import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useToast } from '../../contexts/ToastContext'
import {
  Report,
  ReportStatus,
  REPORT_REASON_LABELS,
  REPORT_STATUS_LABELS,
  ReportTargetType,
} from '../../types/database'
import {
  Loader2,
  Flag,
  CheckCircle,
  XCircle,
  Eye,
  AlertTriangle,
  MessageSquare,
  FileText,
  User,
  BookOpen,
} from 'lucide-react'

interface ReportWithDetails extends Report {
  reporter?: { display_name: string | null; email: string }
}

const STATUS_COLORS: Record<ReportStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  reviewed: 'bg-blue-100 text-blue-700',
  resolved: 'bg-green-100 text-green-700',
  dismissed: 'bg-gray-100 text-gray-600',
}

const TARGET_TYPE_ICONS: Record<ReportTargetType, React.ReactNode> = {
  thread: <MessageSquare size={14} />,
  comment: <MessageSquare size={14} />,
  diary_entry: <BookOpen size={14} />,
  user: <User size={14} />,
}

const TARGET_TYPE_LABELS: Record<ReportTargetType, string> = {
  thread: 'スレッド',
  comment: 'コメント',
  diary_entry: '日記',
  user: 'ユーザー',
}

export function ReportList() {
  const { showToast } = useToast()
  const [reports, setReports] = useState<ReportWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<ReportStatus | 'all'>('pending')
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    fetchReports()
  }, [filterStatus])

  async function fetchReports() {
    setLoading(true)

    try {
      let query = supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false })

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching reports:', error)
        showToast('通報の取得に失敗しました', 'error')
        setReports([])
      } else {
        // Fetch reporter details
        const reporterIds = [...new Set((data || []).map((r) => r.reporter_id))]

        if (reporterIds.length > 0) {
          const { data: usersData } = await supabase
            .from('users')
            .select('id, display_name, email')
            .in('id', reporterIds)

          const usersMap = new Map(usersData?.map((u) => [u.id, u]) || [])

          const reportsWithDetails = (data || []).map((report) => ({
            ...report,
            reporter: usersMap.get(report.reporter_id),
          }))

          setReports(reportsWithDetails as ReportWithDetails[])
        } else {
          setReports((data || []) as ReportWithDetails[])
        }
      }
    } catch (error) {
      console.error('Error fetching reports:', error)
      showToast('通報の取得に失敗しました', 'error')
      setReports([])
    } finally {
      setLoading(false)
    }
  }

  async function updateReportStatus(reportId: string, newStatus: ReportStatus) {
    setUpdating(reportId)

    const { error } = await supabase
      .from('reports')
      .update({
        status: newStatus,
        reviewed_at: new Date().toISOString(),
      } as never)
      .eq('id', reportId)

    if (error) {
      console.error('Error updating report:', error)
      showToast('更新に失敗しました', 'error')
    } else {
      showToast('ステータスを更新しました', 'success')
      fetchReports()
    }

    setUpdating(null)
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  function getTargetLink(report: Report): string | null {
    switch (report.target_type) {
      case 'thread':
        return `/threads/${report.target_id}`
      case 'comment':
        return null // Comments don't have direct URLs
      case 'diary_entry':
        return null
      case 'user':
        return `/users/${report.target_id}`
      default:
        return null
    }
  }

  const statusCounts = {
    pending: reports.filter((r) => r.status === 'pending').length,
    reviewed: reports.filter((r) => r.status === 'reviewed').length,
    resolved: reports.filter((r) => r.status === 'resolved').length,
    dismissed: reports.filter((r) => r.status === 'dismissed').length,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Flag size={24} className="text-red-500" />
          <h1 className="text-2xl font-bold text-gray-900">通報管理</h1>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filterStatus === 'all'
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          すべて
        </button>
        <button
          onClick={() => setFilterStatus('pending')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
            filterStatus === 'pending'
              ? 'bg-yellow-500 text-white'
              : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
          }`}
        >
          <AlertTriangle size={14} />
          <span>未対応</span>
          {statusCounts.pending > 0 && (
            <span className="bg-white/30 px-1.5 py-0.5 rounded text-xs">
              {statusCounts.pending}
            </span>
          )}
        </button>
        <button
          onClick={() => setFilterStatus('reviewed')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filterStatus === 'reviewed'
              ? 'bg-blue-500 text-white'
              : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
          }`}
        >
          確認中
        </button>
        <button
          onClick={() => setFilterStatus('resolved')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filterStatus === 'resolved'
              ? 'bg-green-500 text-white'
              : 'bg-green-100 text-green-700 hover:bg-green-200'
          }`}
        >
          対応済み
        </button>
        <button
          onClick={() => setFilterStatus('dismissed')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filterStatus === 'dismissed'
              ? 'bg-gray-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          却下
        </button>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 size={32} className="animate-spin text-green-600" />
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Flag size={40} className="mx-auto mb-3 text-gray-300" />
            <p>通報がありません</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left font-medium text-gray-600">ステータス</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">対象</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">理由</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">通報者</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">日時</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reports.map((report) => {
                  const targetLink = getTargetLink(report)

                  return (
                    <tr key={report.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded ${
                            STATUS_COLORS[report.status]
                          }`}
                        >
                          {REPORT_STATUS_LABELS[report.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">
                            {TARGET_TYPE_ICONS[report.target_type]}
                          </span>
                          <span className="text-gray-700">
                            {TARGET_TYPE_LABELS[report.target_type]}
                          </span>
                          {targetLink && (
                            <Link
                              to={targetLink}
                              className="text-green-600 hover:underline text-xs"
                              target="_blank"
                            >
                              <Eye size={14} />
                            </Link>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <span className="text-gray-900 font-medium">
                            {REPORT_REASON_LABELS[report.reason]}
                          </span>
                          {report.description && (
                            <p className="text-gray-500 text-xs mt-1 truncate max-w-xs">
                              {report.description}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          to={`/users/${report.reporter_id}`}
                          className="text-gray-700 hover:text-green-600"
                        >
                          {report.reporter?.display_name || report.reporter?.email || '匿名'}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {formatDate(report.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {report.status === 'pending' && (
                            <>
                              <button
                                onClick={() => updateReportStatus(report.id, 'reviewed')}
                                disabled={updating === report.id}
                                className="p-1.5 text-blue-600 rounded hover:bg-blue-50 transition-colors disabled:opacity-50"
                                title="確認中にする"
                              >
                                {updating === report.id ? (
                                  <Loader2 size={16} className="animate-spin" />
                                ) : (
                                  <Eye size={16} />
                                )}
                              </button>
                              <button
                                onClick={() => updateReportStatus(report.id, 'resolved')}
                                disabled={updating === report.id}
                                className="p-1.5 text-green-600 rounded hover:bg-green-50 transition-colors disabled:opacity-50"
                                title="対応済みにする"
                              >
                                <CheckCircle size={16} />
                              </button>
                              <button
                                onClick={() => updateReportStatus(report.id, 'dismissed')}
                                disabled={updating === report.id}
                                className="p-1.5 text-gray-600 rounded hover:bg-gray-100 transition-colors disabled:opacity-50"
                                title="却下する"
                              >
                                <XCircle size={16} />
                              </button>
                            </>
                          )}
                          {report.status === 'reviewed' && (
                            <>
                              <button
                                onClick={() => updateReportStatus(report.id, 'resolved')}
                                disabled={updating === report.id}
                                className="p-1.5 text-green-600 rounded hover:bg-green-50 transition-colors disabled:opacity-50"
                                title="対応済みにする"
                              >
                                {updating === report.id ? (
                                  <Loader2 size={16} className="animate-spin" />
                                ) : (
                                  <CheckCircle size={16} />
                                )}
                              </button>
                              <button
                                onClick={() => updateReportStatus(report.id, 'dismissed')}
                                disabled={updating === report.id}
                                className="p-1.5 text-gray-600 rounded hover:bg-gray-100 transition-colors disabled:opacity-50"
                                title="却下する"
                              >
                                <XCircle size={16} />
                              </button>
                            </>
                          )}
                          {(report.status === 'resolved' || report.status === 'dismissed') && (
                            <button
                              onClick={() => updateReportStatus(report.id, 'pending')}
                              disabled={updating === report.id}
                              className="p-1.5 text-yellow-600 rounded hover:bg-yellow-50 transition-colors disabled:opacity-50"
                              title="未対応に戻す"
                            >
                              {updating === report.id ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : (
                                <AlertTriangle size={16} />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
