import { Link } from 'react-router-dom'
import { ServerCrash, Home, RotateCcw } from 'lucide-react'

export function ServerError() {
  function handleReload() {
    window.location.reload()
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <ServerCrash size={48} className="text-orange-400" />
        </div>
        <h1 className="text-6xl font-bold text-gray-300 mb-4">500</h1>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          サーバーエラーが発生しました
        </h2>
        <p className="text-gray-600 mb-8">
          申し訳ございません。サーバーで問題が発生しました。<br />
          時間をおいて再度お試しください。
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={handleReload}
            className="inline-flex items-center gap-2 px-6 py-3 bg-rose-500 text-white font-medium rounded-lg hover:bg-rose-600 transition-colors"
          >
            <RotateCcw size={20} />
            <span>ページを再読み込み</span>
          </button>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <Home size={20} />
            <span>トップページに戻る</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
