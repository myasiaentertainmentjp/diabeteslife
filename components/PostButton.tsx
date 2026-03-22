'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { PenSquare } from 'lucide-react'

export function PostButton() {
  const { user } = useAuth()

  if (user) {
    return (
      <Link
        href="/threads/new"
        className="flex items-center justify-center gap-2 w-full py-3 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors font-medium shadow-sm"
      >
        <PenSquare size={18} />
        <span>トピックを投稿する</span>
      </Link>
    )
  }

  return (
    <Link
      href="/login"
      className="flex items-center justify-center gap-2 w-full py-3 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors font-medium shadow-sm"
    >
      <PenSquare size={18} />
      <span>ログインして投稿する</span>
    </Link>
  )
}
