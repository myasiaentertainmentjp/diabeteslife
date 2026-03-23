'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2, UserX, User, ArrowLeft } from 'lucide-react'

interface BlockedUser {
  id: string
  blocked_id: string
  created_at: string
  blocked_user?: {
    id: string
    display_name: string | null
    avatar_url: string | null
  }
}

export default function BlockedUsersPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const supabase = createClient()
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([])
  const [loading, setLoading] = useState(true)
  const [unblocking, setUnblocking] = useState<string | null>(null)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/mypage/blocked')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      fetchBlockedUsers()
    }
  }, [user])

  async function fetchBlockedUsers() {
    if (!user) return

    setLoading(true)
    try {
      const { data: blocks, error } = await supabase
        .from('user_blocks')
        .select('id, blocked_id, created_at')
        .eq('blocker_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching blocked users:', error)
        return
      }

      if (!blocks || blocks.length === 0) {
        setBlockedUsers([])
        return
      }

      const blockedIds = blocks.map(b => b.blocked_id)
      const { data: users } = await supabase
        .from('users')
        .select('id, display_name, avatar_url')
        .in('id', blockedIds)

      const userMap = new Map(users?.map(u => [u.id, u]) || [])

      const blocksWithUsers = blocks.map(block => ({
        ...block,
        blocked_user: userMap.get(block.blocked_id) || null
      }))

      setBlockedUsers(blocksWithUsers as BlockedUser[])
    } catch (error) {
      console.error('Error fetching blocked users:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleUnblock(blockId: string) {
    setUnblocking(blockId)
    try {
      const { error } = await supabase
        .from('user_blocks')
        .delete()
        .eq('id', blockId)

      if (error) {
        console.error('Error unblocking user:', error)
        setMessage({ text: 'ブロック解除に失敗しました', type: 'error' })
        return
      }

      setMessage({ text: 'ブロックを解除しました', type: 'success' })
      setBlockedUsers(prev => prev.filter(b => b.id !== blockId))
    } catch (error) {
      console.error('Error unblocking user:', error)
      setMessage({ text: 'ブロック解除に失敗しました', type: 'error' })
    } finally {
      setUnblocking(null)
      setTimeout(() => setMessage(null), 3000)
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (authLoading) {
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
      <button
        onClick={() => router.push('/mypage')}
        className="inline-flex items-center gap-2 text-gray-600 hover:text-rose-500 mb-6"
      >
        <ArrowLeft size={20} />
        <span>マイページに戻る</span>
      </button>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
          <UserX size={24} className="text-gray-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">ブロックしたユーザー</h1>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${
          message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <p className="text-sm text-gray-600 mb-4">
          ブロックしたユーザーはあなたのプロフィールやトピックにコメントできません。
        </p>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 size={24} className="animate-spin text-rose-500" />
          </div>
        ) : blockedUsers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <UserX size={48} className="mx-auto mb-2 text-gray-300" />
            <p>ブロックしたユーザーはいません</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {blockedUsers.map((block) => (
              <div key={block.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Link
                    href={`/users/${block.blocked_id}`}
                    className="relative w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center overflow-hidden"
                  >
                    {block.blocked_user?.avatar_url ? (
                      <Image
                        src={block.blocked_user.avatar_url}
                        alt=""
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <User size={20} className="text-rose-400" />
                    )}
                  </Link>
                  <div>
                    <Link
                      href={`/users/${block.blocked_id}`}
                      className="font-medium text-gray-900 hover:text-rose-500"
                    >
                      {block.blocked_user?.display_name || '匿名ユーザー'}
                    </Link>
                    <p className="text-xs text-gray-500">
                      {formatDate(block.created_at)} にブロック
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleUnblock(block.id)}
                  disabled={unblocking === block.id}
                  className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  {unblocking === block.id ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    '解除'
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
