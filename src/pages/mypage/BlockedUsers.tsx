import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import { Loader2, UserX, User } from 'lucide-react'

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

export function BlockedUsers() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([])
  const [loading, setLoading] = useState(true)
  const [unblocking, setUnblocking] = useState<string | null>(null)

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

      // Fetch user info for blocked users
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

  async function handleUnblock(blockId: string, blockedId: string) {
    setUnblocking(blockId)
    try {
      const { error } = await supabase
        .from('user_blocks')
        .delete()
        .eq('id', blockId)

      if (error) {
        console.error('Error unblocking user:', error)
        showToast('ブロック解除に失敗しました', 'error')
        return
      }

      showToast('ブロックを解除しました', 'success')
      setBlockedUsers(prev => prev.filter(b => b.id !== blockId))
    } catch (error) {
      console.error('Error unblocking user:', error)
      showToast('ブロック解除に失敗しました', 'error')
    } finally {
      setUnblocking(null)
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 size={24} className="animate-spin text-rose-500" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <UserX size={20} className="text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">ブロックしたユーザー</h3>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        ブロックしたユーザーはあなたのプロフィールやスレッドにコメントできません。
      </p>

      {blockedUsers.length === 0 ? (
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
                  to={`/users/${block.blocked_id}`}
                  className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center overflow-hidden"
                >
                  {block.blocked_user?.avatar_url ? (
                    <img
                      src={block.blocked_user.avatar_url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={20} className="text-rose-400" />
                  )}
                </Link>
                <div>
                  <Link
                    to={`/users/${block.blocked_id}`}
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
                onClick={() => handleUnblock(block.id, block.blocked_id)}
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
  )
}
