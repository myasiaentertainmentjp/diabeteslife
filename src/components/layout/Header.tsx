import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Menu, X, User, LogIn, LogOut, Settings, Shield, Search, Loader2, Bell } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const { user, profile, signOut, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Current path for login redirect
  const currentPath = location.pathname + location.search

  // Fetch unread notification count
  useEffect(() => {
    if (!user) {
      setUnreadCount(0)
      return
    }

    async function fetchUnreadCount() {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user!.id)
        .eq('is_read', false)

      if (!error && count !== null) {
        setUnreadCount(count)
      }
    }

    fetchUnreadCount()

    // Subscribe to realtime notifications
    const channel = supabase
      .channel('notifications-header')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchUnreadCount()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setIsSearching(true)
    navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    setSearchQuery('')
    setIsSearching(false)
    setIsMenuOpen(false)
  }

  const isAdmin = profile?.role === 'admin'
  const displayName = profile?.display_name || profile?.username || 'ユーザー'

  async function handleSignOut() {
    await signOut()
    setIsMenuOpen(false)
    navigate('/')
  }

  return (
    <header className="shadow-sm">
      {/* Row 1: Pink background with logo and auth */}
      <div className="bg-rose-400">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center h-14">
            {/* Mobile Auth (left on mobile) */}
            <div className="md:hidden flex items-center gap-2">
              {loading ? (
                <div className="w-16 h-8 bg-white/30 animate-pulse rounded" />
              ) : user ? (
                <Link
                  to="/mypage"
                  className="px-3 py-1.5 bg-white text-rose-500 rounded text-sm font-medium"
                >
                  マイページ
                </Link>
              ) : (
                <Link
                  to="/login"
                  state={{ from: currentPath }}
                  className="text-white text-sm font-medium"
                >
                  ログイン
                </Link>
              )}
            </div>

            {/* Logo - Centered */}
            <Link to="/" className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">
              <span className="text-white text-[10px] tracking-wider">ディーライフ</span>
              <span className="text-white text-2xl font-bold tracking-wide -mt-1">D-LIFE</span>
            </Link>

            {/* Desktop Auth (right) */}
            <div className="hidden md:flex items-center gap-3 ml-auto">
              {loading ? (
                <div className="w-20 h-8 bg-white/30 animate-pulse rounded-lg" />
              ) : user ? (
                <>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="flex items-center gap-1 px-3 py-1.5 text-white hover:text-rose-100 text-sm font-medium transition-colors"
                    >
                      <Shield size={14} />
                      <span>管理</span>
                    </Link>
                  )}
                  <Link
                    to="/notifications"
                    className="relative p-2 text-white hover:text-rose-100 transition-colors"
                    title="通知"
                  >
                    <Bell size={20} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-white text-rose-500 text-xs font-bold rounded-full flex items-center justify-center px-1">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </Link>
                  <Link
                    to="/mypage"
                    className="flex items-center gap-1 px-3 py-1.5 bg-white text-rose-500 rounded hover:bg-rose-50 transition-colors text-sm font-medium"
                  >
                    <span>マイページ</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    state={{ from: currentPath }}
                    className="text-white hover:text-rose-100 text-sm font-medium transition-colors"
                  >
                    ログイン
                  </Link>
                  <Link
                    to="/register"
                    className="px-3 py-1.5 bg-white text-rose-500 rounded hover:bg-rose-50 transition-colors text-sm font-medium"
                  >
                    新規登録
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button (right on mobile) */}
            <button
              className="md:hidden p-2 text-white hover:text-rose-100"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="メニュー"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Row 2: Tagline and Search */}
      <div className="bg-rose-400/90 backdrop-blur-sm shadow-sm">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center h-10">
            {/* Tagline */}
            <p className="text-white text-xs md:text-sm drop-shadow-sm">
              糖尿病患者とその家族のためのコミュニティサイト
            </p>

            {/* Desktop Search Bar */}
            <form onSubmit={handleSearch} className="hidden md:flex">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="トピックを検索"
                  className="w-56 pl-3 pr-8 py-1 border border-rose-200 rounded text-sm focus:ring-1 focus:ring-rose-500 focus:border-rose-500 outline-none bg-white"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-rose-400 hover:text-rose-500 transition-colors"
                  disabled={isSearching}
                >
                  {isSearching ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Search size={16} />
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 py-4 px-4">
          {/* Mobile Search */}
          <form onSubmit={handleSearch} className="mb-4">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="トピックを検索..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
              />
              <button
                type="submit"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                disabled={isSearching}
              >
                {isSearching ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Search size={18} />
                )}
              </button>
            </div>
          </form>

          <nav className="flex flex-col gap-3">
            <Link
              to="/"
              className="text-gray-600 hover:text-rose-500 font-medium transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              ホーム
            </Link>
            <Link
              to="/threads"
              className="text-gray-600 hover:text-rose-500 font-medium transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              スレッド一覧
            </Link>
            <Link
              to="/articles"
              className="text-gray-600 hover:text-rose-500 font-medium transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              記事一覧
            </Link>
            <hr className="my-2" />
            {loading ? (
              <div className="w-full h-10 bg-gray-200 animate-pulse rounded-lg" />
            ) : user ? (
              <>
                <div className="flex items-center gap-2 px-2 py-1 text-gray-700 font-medium">
                  <User size={16} />
                  <span>{displayName}</span>
                  {isAdmin && (
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                      管理者
                    </span>
                  )}
                </div>

                {isAdmin && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium justify-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Shield size={16} />
                    <span>管理画面</span>
                  </Link>
                )}

                <Link
                  to="/notifications"
                  className="flex items-center gap-2 px-4 py-2 border border-rose-200 text-rose-500 rounded-lg hover:bg-rose-50 transition-colors text-sm font-medium justify-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Bell size={16} />
                  <span>通知</span>
                  {unreadCount > 0 && (
                    <span className="ml-1 min-w-[20px] h-[20px] bg-rose-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </Link>

                <Link
                  to="/mypage"
                  className="flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors text-sm font-medium justify-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Settings size={16} />
                  <span>マイページ</span>
                </Link>

                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-1 justify-center text-gray-600 hover:text-red-600 font-medium transition-colors py-2"
                >
                  <LogOut size={16} />
                  <span>ログアウト</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  state={{ from: currentPath }}
                  className="flex items-center gap-1 justify-center border border-rose-500 text-rose-500 rounded-lg hover:bg-rose-50 font-medium transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <LogIn size={16} />
                  <span>ログイン</span>
                </Link>
                <Link
                  to="/register"
                  className="flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors text-sm font-medium justify-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User size={16} />
                  <span>新規登録</span>
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
