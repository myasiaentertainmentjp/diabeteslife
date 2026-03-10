'use client'

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase'
import type { UserRole } from '@/types/database'

interface UserProfile {
  id: string
  email?: string
  role: UserRole
  display_name?: string | null
  username?: string
}

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  session: Session | null
  loading: boolean
  isAdmin: boolean
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: Error | null }>
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signInWithGoogle: () => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function clearSupabaseAuthStorage(): void {
  try {
    const keysToRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && (key.startsWith('sb-') || key.includes('supabase') || key === 'dlife-auth-token')) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key))
  } catch {
    // ignore
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  // プロフィール取得（バックグラウンドで実行、3秒タイムアウト）
  const fetchUserData = useCallback(async (userId: string, userEmail: string): Promise<UserProfile> => {
    try {
      const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 3000))
      const queryPromise = supabase.from('users').select('id, email, role, display_name').eq('id', userId).single()
      const result = await Promise.race([queryPromise, timeoutPromise])

      if (result && (result as { data?: unknown }).data) {
        const data = (result as { data: { email: string; role: UserRole; display_name: string | null } }).data
        return {
          id: userId,
          email: data.email,
          role: data.role || 'user',
          display_name: data.display_name,
        }
      }
    } catch {
      // fallthrough to default
    }

    const isAdminEmail = userEmail === 'info@diabeteslife.jp' || userEmail === 'admin@diabeteslife.jp'
    return {
      id: userId,
      email: userEmail,
      role: isAdminEmail ? 'admin' : 'user' as UserRole,
      display_name: null,
    }
  }, [supabase])

  useEffect(() => {
    let mounted = true

    supabase.auth.getSession().then(async ({ data: { session: initialSession } }) => {
      if (!mounted) return

      setSession(initialSession)
      setUser(initialSession?.user ?? null)

      // ★ セッション取得直後にloading=falseにして画面を即表示
      setLoading(false)

      // プロフィールはバックグラウンドで取得
      if (initialSession?.user) {
        const userProfile = await fetchUserData(
          initialSession.user.id,
          initialSession.user.email || ''
        )
        if (mounted) setProfile(userProfile)
      }
    }).catch(() => {
      if (mounted) setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mounted) return

        if (event === 'SIGNED_OUT') {
          setSession(null)
          setUser(null)
          setProfile(null)
          return
        }

        setSession(newSession)
        setUser(newSession?.user ?? null)

        if (newSession?.user) {
          const userProfile = await fetchUserData(
            newSession.user.id,
            newSession.user.email || ''
          )
          if (mounted) setProfile(userProfile)
        } else {
          setProfile(null)
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [fetchUserData, supabase])

  async function signUp(email: string, password: string, displayName: string) {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: displayName },
          emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
        },
      })
      return { error: error as Error | null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  async function signIn(email: string, password: string) {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      return { error: error as Error | null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  async function signInWithGoogle() {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback` },
      })
      return { error: error as Error | null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  async function signOut() {
    try {
      await supabase.auth.signOut()
    } catch {
      clearSupabaseAuthStorage()
    }
    setProfile(null)
    setUser(null)
    setSession(null)
  }

  async function refreshProfile() {
    if (!user) return
    try {
      const { data } = await supabase.from('users').select('*').eq('id', user.id).single()
      if (data) {
        setProfile({
          id: user.id,
          email: data.email,
          role: data.role || 'user',
          display_name: data.display_name,
        })
      }
    } catch {
      // ignore
    }
  }

  const isAdmin = profile?.role === 'admin' ||
    profile?.email === 'info@diabeteslife.jp' ||
    profile?.email === 'admin@diabeteslife.jp'

  return (
    <AuthContext.Provider value={{
      user, profile, session, loading, isAdmin,
      signUp, signIn, signInWithGoogle, signOut, refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
