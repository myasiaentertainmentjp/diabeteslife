'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import {
  Loader2,
  Flag,
  ChevronLeft,
  ChevronRight,
  Eye,
  Check,
  X,
  AlertTriangle,
} from 'lucide-react'

interface Report {
  id: string
  reason: string
  status: 'pending' | 'resolved' | 'dismissed'
  created_at: string
  reporter_id: string
  thread_id: string | null
  comment_id: string | null
  reporter?: { display_name: string | null }
  threads?: { title: string; thread_number: number }
  comments?: { body: string }
}

const ITEMS_PER_PAGE = 20

const STATUS_LABELS = {
  pending: { label: '未対応', color: 'bg-amber-100 text-amber-700' },
  resolved: { label: '対応済み', color: 'bg-green-100 text-green-700' },
  dismissed: { label: '却下', color: 'bg-gray-100 text-gray-600' },
}

export default function AdminReportsPage() {
  const supabase = createClient()
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [updating, setUpdating] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('pending')

  useEffect(() => {
    fetchReports()
  }, [page, statusFilter])

  async function fetchReports() {
    setLoading(true)

    try {
      let countQuery = supabase
        .from('reports')
        .select('id', { count: 'exact', head: true })

      if (statusFilter) {
        countQuery = countQuery.eq('status', statusFilter)
      }

      const { count } = await countQuery
      setTotal(count || 0)

      const from = (page - 1) * ITEMS_PER_PAGE
      const to = from + ITEMS_PER_PAGE - 1

      let dataQuery = supabase
        .from('reports')
        .select('id, reason, status, created_at, reporter_id, thread_id, comment_id')
        .order('created_at', { ascending: false })
        .range(from, to)

      if (statusFilter) {
        dataQuery = dataQuery.eq('status', statusFilter)
      }

      const { data: reportsData } = await dataQuery

      if (reportsData && reportsData.length > 0) {
        const reporterIds = [...new Set(reportsData.map(r => r.reporter_id))]
        const threadIds = [...new Set(reportsData.map(r => r.thread_id).filter(Boolean))]
        const commentIds = [...new Set(reportsData.map(r => r.comment_id).filter(Boolean))]

        const [reportersRes, threadsRes, commentsRes] = await Promise.all([
          supabase.from('users').select('id, display_name').in('id', reporterIds),
          threadIds.length > 0
            ? supabase.from('threads').select('id, title, thread_number').in('id', threadIds as string[])
            : Promise.resolve({ data: [] }),
          commentIds.length > 0
            ? supabase.from('comments').select('id, body').in('id', commentIds as string[])
            : Promise.resolve({ data: [] }),
        ])

        const reportersMap = new Map(reportersRes.data?.map(u => [u.id, u]) || [])
        const threadsMap = new Map(threadsRes.data?.map(t => [t.id, t]) || [])
        const commentsMap = new Map(commentsRes.data?.map(c => [c.id, c]) || [])

        const reportsWithData = reportsData.map(r => ({
          ...r,
          reporter: reportersMap.get(r.reporter_id),
          threads: r.thread_id ? threadsMap.get(r.thread_id) : null,
          comments: r.comment_id ? commentsMap.get(r.comment_id) : null,
        }))

        setReports(reportsWithData as Report[])
      } else {
        setReports([])
      }
    } catch (error) {
      console.error('Error fetching reports:', error)
    } finally {
      setLoading(false)
    }
  }

  async function updateStatus(id: string, status: 'resolved' | 'dismissed') {
    setUpdating(id)
    const { error } = await supabase
      .from('reports')
      .update({ status } as never)
      .eq('id', id)

    if (error) {
      console.error('Error updating report:', error)
      alert('更新に失敗しました')
    } else {
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

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Flag className="text-red-500" />
          通報管理
        </h1>
        {statusFilter === 'pending' && total > 0 && (
          <span className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-full">
            {total}件の未対応
          </span>
        )}
      </div>

      {/* Status Filter */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex gap-2">
          <button
            onClick={() => { setStatusFilter('pending'); setPage(1) }}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              statusFilter === 'pending'
                ? 'bg-amber-100 text-amber-700'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            未対応
          </button>
          <button
            onClick={() => { setStatusFilter('resolved'); setPage(1) }}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              statusFilter === 'resolved'
                ? 'bg-green-100 text-green-700'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            対応済み
          </button>
          <button
            onClick={() => { setStatusFilter('dismissed'); setPage(1) }}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              statusFilter === 'dismissed'
                ? 'bg-gray-200 text-gray-700'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            却下
          </button>
          <button
            onClick={() => { setStatusFilter(''); setPage(1) }}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              statusFilter === ''
                ? 'bg-rose-100 text-rose-700'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            すべて
          </button>
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 size={32} className="animate-spin text-rose-500" />
          </div>
        ) : reports.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500">
            <Flag size={48} className="mx-auto mb-4 text-gray-300" />
            <p>通報がありません</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {reports.map((report) => (
              <div key={report.id} className="px-6 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-0.5 text-xs rounded ${STATUS_LABELS[report.status].color}`}>
                        {STATUS_LABELS[report.status].label}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatDate(report.created_at)}
                      </span>
                    </div>

                    <div className="flex items-start gap-2 mb-2">
                      <AlertTriangle size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-700">{report.reason}</p>
                    </div>

                    {report.threads && (
                      <div className="text-sm text-gray-500 mb-1">
                        <span className="font-medium">対象スレッド: </span>
                        <Link
                          href={`/threads/${report.threads.thread_number}`}
                          className="text-rose-500 hover:underline"
                        >
                          #{report.threads.thread_number} {report.threads.title}
                        </Link>
                      </div>
                    )}

                    {report.comments && (
                      <div className="text-sm text-gray-500 mb-1">
                        <span className="font-medium">対象コメント: </span>
                        <span className="line-clamp-1">{report.comments.body}</span>
                      </div>
                    )}

                    <p className="text-xs text-gray-400">
                      通報者: {report.reporter?.display_name || '匿名'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {report.threads && (
                      <Link
                        href={`/threads/${report.threads.thread_number}`}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="表示"
                      >
                        <Eye size={18} />
                      </Link>
                    )}
                    {report.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateStatus(report.id, 'resolved')}
                          disabled={updating === report.id}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                          title="対応済みにする"
                        >
                          {updating === report.id ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : (
                            <Check size={18} />
                          )}
                        </button>
                        <button
                          onClick={() => updateStatus(report.id, 'dismissed')}
                          disabled={updating === report.id}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                          title="却下する"
                        >
                          {updating === report.id ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : (
                            <X size={18} />
                          )}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-sm text-gray-600">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  )
}
