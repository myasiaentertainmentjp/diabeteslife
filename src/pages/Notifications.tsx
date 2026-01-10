import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { UserNotification } from '../types/database'
import { Bell, MessageSquare, Heart, User, Check, Loader2, Trash2 } from 'lucide-react'

const NOTIFICATION_ICONS: Record<string, React.ReactNode> = {
  thread_comment: <MessageSquare size={16} className="text-blue-500" />,
  reply: <MessageSquare size={16} className="text-green-500" />,
  like: <Heart size={16} className="text-rose-500" />,
  profile_comment: <User size={16} className="text-purple-500" />,
}

export function Notifications() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [notifications, setNotifications] = useState<UserNotification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login', { state: { from: location.pathname } })
    }
  }, [user, authLoading, navigate, location.pathname])

  useEffect(() => {
    if (user) {
      fetchNotifications()
    }
  }, [user])

  async function fetchNotifications() {
    if (!user) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) {
        console.error('Error fetching notifications:', error)
        return
      }

      setNotifications(data as UserNotification[])
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  async function markAsRead(id: string) {
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id)

      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      )
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  async function markAllAsRead() {
    if (!user) return

    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false)

      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  async function deleteNotification(id: string) {
    try {
      await supabase
        .from('notifications')
        .delete()
        .eq('id', id)

      setNotifications(prev => prev.filter(n => n.id !== id))
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'たった今'
    if (minutes < 60) return `${minutes}分前`
    if (hours < 24) return `${hours}時間前`
    if (days < 7) return `${days}日前`
    return date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  if (authLoading || loading) {
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
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center">
            <Bell size={24} className="text-rose-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">通知</h1>
            {unreadCount > 0 && (
              <p className="text-sm text-gray-500">{unreadCount}件の未読</p>
            )}
          </div>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-rose-500 transition-colors"
          >
            <Check size={16} />
            <span>すべて既読</span>
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {notifications.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500">
            <Bell size={48} className="mx-auto mb-2 text-gray-300" />
            <p>通知はありません</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`px-4 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors ${
                  !notification.is_read ? 'bg-rose-50/50' : ''
                }`}
              >
                <div className="mt-1">
                  {NOTIFICATION_ICONS[notification.type] || <Bell size={16} className="text-gray-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  {notification.link ? (
                    <Link
                      to={notification.link}
                      onClick={() => !notification.is_read && markAsRead(notification.id)}
                      className="block"
                    >
                      <p className={`text-sm ${!notification.is_read ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
                        {notification.title}
                      </p>
                      {notification.message && (
                        <p className="text-xs text-gray-500 mt-0.5 truncate">{notification.message}</p>
                      )}
                    </Link>
                  ) : (
                    <>
                      <p className={`text-sm ${!notification.is_read ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
                        {notification.title}
                      </p>
                      {notification.message && (
                        <p className="text-xs text-gray-500 mt-0.5 truncate">{notification.message}</p>
                      )}
                    </>
                  )}
                  <p className="text-xs text-gray-400 mt-1">{formatDate(notification.created_at)}</p>
                </div>
                <div className="flex items-center gap-2">
                  {!notification.is_read && (
                    <div className="w-2 h-2 bg-rose-500 rounded-full" />
                  )}
                  <button
                    onClick={() => deleteNotification(notification.id)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    title="削除"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
