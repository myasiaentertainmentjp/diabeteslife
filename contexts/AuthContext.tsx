'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase'
import type { UserRole } from '@/types/database'

interface UserProfile {
  id: string
  email?: string
  role: UserRole
  display_name?: string | null
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
      if (key && (key.startsWith('sb-') || key.includes('supabase'))) {
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

  async function fetchProfile(userId: string, userEmail: string): Promise<UserProfile> {
    try {
      const { data } = await supabase
        .from('users')
        .select('id, email, role, display_name')
        .eq('id', userId)
        .single()

      if (data) {
        return {
          id: userId,
          email: data.email,
          role: data.role || 'user',
          display_name: data.display_name,
        }
      }
    } catch {
      // fallthrough
    }

    const isAdmin = userEmail === 'info@diabeteslife.jp' || userEmail === 'admin@diabeteslife.jp'
    return {
      id: userId,
      email: userEmail,
      role: isAdmin ? 'admin' : 'user' as UserRole,
      display_name: null,
    }
  }

  useEffect(() => {
    let mounted = true

    // onAuthStateChange だけで管理する（getSession+onAuthStateChangeの二重実行を避ける）
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mounted) return

        if (event === 'SIGNED_OUT') {
          setSession(null)
          setUser(null)
          setProfile(null)
          setLoading(false)
          return
        }

        setSession(newSession)
        setUser(newSession?.user ?? null)
        setLoading(false)  // ← セッション状態確定時点で即表示

        // プロフィールはバックグラウンドで取得
        if (newSession?.user) {
          fetchProfile(newSession.user.id, newSession.user.email || '').then(p => {
            if (mounted) setProfile(p)
          })
        } else {
          setProfile(null)
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

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
      setProfile(null)
      setUser(null)
      setSession(null)
    }
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
