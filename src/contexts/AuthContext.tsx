import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { Profile, UserRole } from '../types/database'

// Extended profile that includes role from users table
interface UserProfile extends Partial<Profile> {
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
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

/**
 * Clear all Supabase auth-related items from localStorage
 * Only called on explicit sign out
 */
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
  } catch (e) {
    console.error('[Auth] Error clearing storage:', e)
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch user profile from database (with 10 second timeout)
  const fetchUserData = useCallback(async (userId: string, userEmail: string): Promise<UserProfile> => {
    try {
      // 10秒タイムアウト
      const timeoutPromise = new Promise<null>((resolve) => {
        setTimeout(() => resolve(null), 10000)
      })

      const queryPromise = supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      const result = await Promise.race([queryPromise, timeoutPromise])

      if (result === null) {
        console.warn('[Auth] User data fetch timeout')
      } else if (result.data) {
        return {
          id: userId,
          email: result.data.email,
          role: result.data.role || 'user',
          display_name: result.data.display_name,
        }
      }
    } catch (err) {
      console.error('[Auth] Error fetching user data:', err)
    }

    // Default profile fallback
    const isAdminEmail = userEmail === 'info@diabeteslife.jp'
    return {
      id: userId,
      email: userEmail,
      role: isAdminEmail ? 'admin' : 'user' as UserRole,
      display_name: null,
    }
  }, [])

  useEffect(() => {
    let mounted = true

    // タイムアウト付きでセッション取得（15秒）
    const sessionTimeout = setTimeout(() => {
      if (mounted && loading) {
        console.warn('[Auth] Session fetch timeout - proceeding without auth')
        setLoading(false)
      }
    }, 15000)

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session: initialSession } }) => {
      if (!mounted) return
      clearTimeout(sessionTimeout)

      setSession(initialSession)
      setUser(initialSession?.user ?? null)

      if (initialSession?.user) {
        const userProfile = await fetchUserData(
          initialSession.user.id,
          initialSession.user.email || ''
        )
        if (mounted) setProfile(userProfile)
      }

      setLoading(false)
    }).catch((error) => {
      console.error('[Auth] Session fetch error:', error)
      if (mounted) {
        clearTimeout(sessionTimeout)
        setLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mounted) return

        // Only handle explicit sign out
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
      clearTimeout(sessionTimeout)
      subscription.unsubscribe()
    }
  }, [fetchUserData])

  async function signUp(email: string, password: string, displayName: string) {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: displayName },
          emailRedirectTo: 'https://diabeteslife.jp',
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

  async function signOut() {
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error('[Auth] Sign out error:', error)
      // Even if signOut fails, clear local state
      clearSupabaseAuthStorage()
    }
    setProfile(null)
    setUser(null)
    setSession(null)
  }

  async function refreshProfile() {
    if (user) {
      try {
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single()

        if (userData) {
          setProfile({
            id: user.id,
            email: userData.email,
            role: userData.role || 'user',
            display_name: userData.display_name,
          })
        }
      } catch (error) {
        console.error('[Auth] Refresh profile error:', error)
      }
    }
  }

  // Compute isAdmin from profile - check both role and email
  const isAdmin = profile?.role === 'admin' || profile?.email === 'info@diabeteslife.jp'

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      session,
      loading,
      isAdmin,
      signUp,
      signIn,
      signOut,
      refreshProfile,
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
