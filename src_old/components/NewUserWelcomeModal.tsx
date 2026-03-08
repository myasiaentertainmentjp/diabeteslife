import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { X, Settings, PartyPopper } from 'lucide-react'

const STORAGE_KEY_NEW_USER = 'dlife_new_user'
const STORAGE_KEY_REDIRECT = 'dlife_new_user_redirect'

export function setNewUserFlag(redirectPath?: string) {
  localStorage.setItem(STORAGE_KEY_NEW_USER, 'true')
  if (redirectPath && redirectPath !== '/register' && redirectPath !== '/login') {
    localStorage.setItem(STORAGE_KEY_REDIRECT, redirectPath)
  }
}

export function NewUserWelcomeModal() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (loading) return

    const isNewUser = localStorage.getItem(STORAGE_KEY_NEW_USER) === 'true'
    const redirectPath = localStorage.getItem(STORAGE_KEY_REDIRECT)

    if (user && isNewUser) {
      // Clear the flag immediately
      localStorage.removeItem(STORAGE_KEY_NEW_USER)
      localStorage.removeItem(STORAGE_KEY_REDIRECT)

      // If no redirect path (direct registration), go to profile settings
      if (!redirectPath) {
        navigate('/mypage/profile', { replace: true })
        return
      }

      // Otherwise show the modal
      setIsOpen(true)
    }
  }, [user, loading, navigate])

  function handleClose() {
    setIsOpen(false)
  }

  function handleGoToSettings() {
    setIsOpen(false)
    navigate('/mypage/profile')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="閉じる"
        >
          <X size={24} />
        </button>

        {/* Content */}
        <div className="text-center">
          {/* Icon */}
          <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <PartyPopper size={32} className="text-rose-500" />
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            登録ありがとうございます!
          </h2>

          {/* Description */}
          <p className="text-gray-600 mb-6">
            プロフィールを設定すると、<br />
            他のユーザーとつながりやすくなります
          </p>

          {/* Buttons */}
          <div className="flex flex-col gap-3">
            <button
              onClick={handleGoToSettings}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-rose-500 text-white font-medium rounded-lg hover:bg-rose-600 transition-colors"
            >
              <Settings size={20} />
              今すぐ設定する
            </button>
            <button
              onClick={handleClose}
              className="w-full px-6 py-3 text-gray-600 font-medium rounded-lg hover:bg-gray-100 transition-colors"
            >
              あとで
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
