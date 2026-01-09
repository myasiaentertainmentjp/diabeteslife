import { Link } from 'react-router-dom'
import { ShieldX, Home } from 'lucide-react'

export function Forbidden() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldX size={48} className="text-red-400" />
        </div>
        <h1 className="text-6xl font-bold text-gray-300 mb-4">403</h1>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          アクセス権限がありません
        </h2>
        <p className="text-gray-600 mb-8">
          このページにアクセスする権限がありません。<br />
          ログインが必要な場合は、ログインしてから再度お試しください。
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-rose-500 text-white font-medium rounded-lg hover:bg-rose-600 transition-colors"
          >
            <Home size={20} />
            <span>トップページに戻る</span>
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <span>ログインする</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
