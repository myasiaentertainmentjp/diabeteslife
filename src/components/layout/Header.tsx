import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, X, User, LogIn, LogOut, Settings, Shield, Search, Loader2 } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const { user, profile, signOut, loading } = useAuth()
  const navigate = useNavigate()

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
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">D</span>
            </div>
            <div>
              <div className="text-xl font-bold text-green-600">Dライフ</div>
              <div className="text-xs text-gray-500 -mt-0.5">ディーライフ</div>
            </div>
          </Link>

          {/* Desktop Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-6">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="キーワードで検索..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-shadow"
              />
              <button
                type="submit"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-600 transition-colors"
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

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-3">
            {loading ? (
              <div className="w-24 h-9 bg-gray-200 animate-pulse rounded-lg" />
            ) : user ? (
              <>
                {/* User Name */}
                <span className="text-sm text-gray-700 font-medium">
                  {displayName}
                </span>

                {/* Admin Link */}
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-1 px-3 py-2 text-purple-600 hover:text-purple-700 text-sm font-medium transition-colors"
                  >
                    <Shield size={16} />
                    <span>管理画面</span>
                  </Link>
                )}

                {/* MyPage */}
                <Link
                  to="/mypage"
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                >
                  <Settings size={16} />
                  <span>マイページ</span>
                </Link>

                {/* Logout */}
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-1 px-3 py-2 text-gray-600 hover:text-red-600 text-sm font-medium transition-colors"
                >
                  <LogOut size={16} />
                  <span>ログアウト</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="flex items-center gap-1 px-3 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 text-sm font-medium transition-colors"
                >
                  <LogIn size={16} />
                  <span>ログイン</span>
                </Link>
                <Link
                  to="/register"
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                >
                  <User size={16} />
                  <span>新規登録</span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-gray-600 hover:text-green-600"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="メニュー"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="キーワードで検索..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
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
                className="text-gray-600 hover:text-green-600 font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                ホーム
              </Link>
              <Link
                to="/threads"
                className="text-gray-600 hover:text-green-600 font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                スレッド一覧
              </Link>
              <Link
                to="/articles"
                className="text-gray-600 hover:text-green-600 font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                記事一覧
              </Link>
              <hr className="my-2" />
              {loading ? (
                <div className="w-full h-10 bg-gray-200 animate-pulse rounded-lg" />
              ) : user ? (
                <>
                  {/* User Info */}
                  <div className="flex items-center gap-2 px-2 py-1 text-gray-700 font-medium">
                    <User size={16} />
                    <span>{displayName}</span>
                    {isAdmin && (
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                        管理者
                      </span>
                    )}
                  </div>

                  {/* Admin Link */}
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

                  {/* MyPage */}
                  <Link
                    to="/mypage"
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium justify-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Settings size={16} />
                    <span>マイページ</span>
                  </Link>

                  {/* Logout */}
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
                    className="flex items-center gap-1 justify-center border border-green-600 text-green-600 rounded-lg hover:bg-green-50 font-medium transition-colors py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <LogIn size={16} />
                    <span>ログイン</span>
                  </Link>
                  <Link
                    to="/register"
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium justify-center"
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
      </div>
    </header>
  )
}
