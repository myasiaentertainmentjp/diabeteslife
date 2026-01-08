import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Loader2, ShieldX } from 'lucide-react'

interface ProtectedAdminRouteProps {
  children: React.ReactNode
}

export function ProtectedAdminRoute({ children }: ProtectedAdminRouteProps) {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <Loader2 size={32} className="animate-spin text-green-600" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (profile?.role !== 'admin') {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100">
        <ShieldX size={64} className="text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">アクセス拒否</h1>
        <p className="text-gray-600 mb-6">このページにアクセスする権限がありません。</p>
        <a
          href="/"
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          トップページに戻る
        </a>
      </div>
    )
  }

  return <>{children}</>
}
