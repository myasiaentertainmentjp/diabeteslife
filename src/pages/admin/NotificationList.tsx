import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useToast } from '../../contexts/ToastContext'
import { AdminNotification, AdminNotificationType } from '../../types/database'
import { Bell, MessageSquare, FileText, Flag, Check, CheckCheck, Loader2, Bot, ExternalLink } from 'lucide-react'

const NOTIFICATION_TYPE_CONFIG: Record<AdminNotificationType, { icon: typeof Bell; color: string; label: string }> = {
  new_comment: { icon: MessageSquare, color: 'text-blue-500', label: '新規コメント' },
  new_thread: { icon: FileText, color: 'text-green-500', label: '新規スレッド' },
  report: { icon: Flag, color: 'text-red-500', label: '通報' },
}

export function NotificationList() {
  const { showToast } = useToast()
  const [notifications, setNotifications] = useState<AdminNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread'>('unread')

  useEffect(() => {
    fetchNotifications()
  }, [filter])

  async function fetchNotifications() {
    try {
      let query = supabase
        .from('admin_notifications')
        .select('id, type, thread_id, comment_id, user_id, message, is_read, created_at')
        .order('created_at', { ascending: false })
        .limit(50)

      if (filter === 'unread') {
        query = query.eq('is_read', false)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching notifications:', error)
        showToast('通知の取得に失敗しました', 'error')
        setNotifications([])
        return
      }

      if (!data || data.length === 0) {
        setNotifications([])
        return
      }

      // Fetch related data separately
      const threadIds = [...new Set(data.map(n => n.thread_id).filter(Boolean))]
      const userIds = [...new Set(data.map(n => n.user_id).filter(Boolean))]

      const [threadsResult, usersResult] = await Promise.all([
        threadIds.length > 0
          ? supabase.from('threads').select('id, title').in('id', threadIds)
          : Promise.resolve({ data: [] }),
        userIds.length > 0
          ? supabase.from('users').select('id, display_name, is_dummy').in('id', userIds)
          : Promise.resolve({ data: [] }),
      ])

      const threadsMap = new Map(threadsResult.data?.map(t => [t.id, t]) || [])
      const usersMap = new Map(usersResult.data?.map(u => [u.id, u]) || [])

      const notificationsWithData = data.map(notification => ({
        ...notification,
        threads: notification.thread_id ? threadsMap.get(notification.thread_id) || { title: '削除済み' } : undefined,
        users: notification.user_id ? usersMap.get(notification.user_id) || { display_name: null, is_dummy: false } : undefined,
      }))

      setNotifications(notificationsWithData as AdminNotification[])
    } catch (error) {
      console.error('Error fetching notifications:', error)
      showToast('通知の取得に失敗しました', 'error')
      setNotifications([])
    } finally {
      setLoading(false)
    }
  }

  async function markAsRead(id: string) {
    const { error } = await supabase
      .from('admin_notifications')
      .update({ is_read: true })
      .eq('id', id)

    if (error) {
      console.error('Error marking notification as read:', error)
      showToast('更新に失敗しました', 'error')
    } else {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      )
    }
  }

  async function markAllAsRead() {
    const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.id)
    if (unreadIds.length === 0) return

    const { error } = await supabase
      .from('admin_notifications')
      .update({ is_read: true })
      .in('id', unreadIds)

    if (error) {
      console.error('Error marking all as read:', error)
      showToast('更新に失敗しました', 'error')
    } else {
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true }))
      )
      showToast('全て既読にしました', 'success')
    }
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const diffMinutes = Math.floor(diff / (1000 * 60))
    const diffHours = Math.floor(diff / (1000 * 60 * 60))
    const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (diffMinutes < 1) return 'たった今'
    if (diffMinutes < 60) return `${diffMinutes}分前`
    if (diffHours < 24) return `${diffHours}時間前`
    if (diffDays < 7) return `${diffDays}日前`

    return date.toLocaleDateString('ja-JP')
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length

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
          <h1 className="text-2xl font-bold text-gray-900">通知</h1>
          <p className="text-sm text-gray-500 mt-1">
            ダミーユーザーへのコメント通知
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Filter buttons */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                filter === 'unread'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              未読 {unreadCount > 0 && `(${unreadCount})`}
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                filter === 'all'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              全て
            </button>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <CheckCheck size={16} />
              <span>全て既読</span>
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm divide-y divide-gray-100">
        {notifications.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Bell size={40} className="mx-auto mb-3 text-gray-300" />
            <p>{filter === 'unread' ? '未読の通知はありません' : '通知がありません'}</p>
          </div>
        ) : (
          notifications.map((notification) => {
            const config = NOTIFICATION_TYPE_CONFIG[notification.type]
            const Icon = config.icon
            const isDummy = notification.users?.is_dummy

            return (
              <div
                key={notification.id}
                className={`flex items-start gap-4 p-4 ${
                  !notification.is_read ? 'bg-blue-50/50' : ''
                }`}
              >
                {/* Icon */}
                <div className={`shrink-0 ${config.color}`}>
                  <Icon size={20} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      notification.type === 'new_comment' ? 'bg-blue-100 text-blue-700' :
                      notification.type === 'new_thread' ? 'bg-green-100 text-green-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {config.label}
                    </span>
                    {isDummy && (
                      <span className="flex items-center gap-1 text-xs text-blue-600">
                        <Bot size={12} />
                        ダミーユーザーへ
                      </span>
                    )}
                    <span className="text-xs text-gray-400">
                      {formatDate(notification.created_at)}
                    </span>
                  </div>

                  <p className="text-sm text-gray-900 mb-1">
                    {notification.message}
                  </p>

                  {notification.threads && (
                    <p className="text-sm text-gray-600 truncate">
                      スレッド: {notification.threads.title}
                    </p>
                  )}

                  <div className="flex items-center gap-3 mt-2">
                    <Link
                      to={`/threads/${notification.thread_id}`}
                      target="_blank"
                      className="flex items-center gap-1 text-xs text-rose-500 hover:text-rose-600"
                    >
                      <ExternalLink size={12} />
                      スレッドを見る
                    </Link>
                    {notification.type === 'new_comment' && isDummy && (
                      <Link
                        to={`/admin/dummy-reply?thread=${notification.thread_id}&comment=${notification.comment_id}`}
                        className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600"
                      >
                        <Bot size={12} />
                        ダミーで返信
                      </Link>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="shrink-0">
                  {!notification.is_read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="p-1.5 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded transition-colors"
                      title="既読にする"
                    >
                      <Check size={16} />
                    </button>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
