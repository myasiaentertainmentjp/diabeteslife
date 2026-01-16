import { Outlet, NavLink, Link } from 'react-router-dom'
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  MessageCircle,
  ShieldAlert,
  Users,
  Flag,
  TrendingUp,
  Bell,
  ArrowLeft,
  Menu,
  X,
  Calendar,
} from 'lucide-react'
import { useState } from 'react'

const MENU_ITEMS = [
  { path: '/admin', label: 'ダッシュボード', icon: LayoutDashboard, exact: true },
  { path: '/admin/notifications', label: '通知', icon: Bell },
  { path: '/admin/scheduled-posts', label: 'スケジュール投稿', icon: Calendar },
  { path: '/admin/articles', label: '記事管理', icon: FileText },
  { path: '/admin/threads', label: 'スレッド管理', icon: MessageSquare },
  { path: '/admin/comments', label: 'コメント管理', icon: MessageCircle },
  { path: '/admin/reports', label: '通報管理', icon: Flag },
  { path: '/admin/ng-words', label: 'NGワード管理', icon: ShieldAlert },
  { path: '/admin/keywords', label: '人気キーワード', icon: TrendingUp },
  { path: '/admin/users', label: 'ユーザー管理', icon: Users },
]

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gray-800 text-white transform transition-transform lg:transform-none ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-gray-700">
            <h1 className="text-lg font-bold">管理画面</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 hover:bg-gray-700 rounded"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {MENU_ITEMS.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.exact}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-rose-500 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`
                }
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Back to Site */}
          <div className="px-2 py-4 border-t border-gray-700">
            <Link
              to="/"
              className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
              <span>サイトに戻る</span>
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white shadow-sm px-4 py-3 flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <Menu size={24} />
          </button>
          <h1 className="text-lg font-bold text-gray-900">管理画面</h1>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
