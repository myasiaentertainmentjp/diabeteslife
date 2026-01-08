import { Link } from 'react-router-dom'
import { FileQuestion, Home } from 'lucide-react'

export function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <FileQuestion size={48} className="text-gray-400" />
        </div>
        <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          ページが見つかりません
        </h2>
        <p className="text-gray-600 mb-8">
          お探しのページは存在しないか、移動した可能性があります。
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
        >
          <Home size={20} />
          <span>トップページに戻る</span>
        </Link>
      </div>
    </div>
  )
}
