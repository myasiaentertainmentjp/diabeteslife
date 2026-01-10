import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { Profile, UserRole } from '../types/database'

// Session restoration timeout (3 seconds)
const SESSION_TIMEOUT = 3000

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
 * Supabase stores auth tokens with pattern: sb-{project-ref}-auth-token
 */
function clearSupabaseAuthStorage(): void {
  try {
    const keysToRemove: string[] = []

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && (key.startsWith('sb-') || key.includes('supabase'))) {
        keysToRemove.push(key)
      }
    }

    keysToRemove.forEach(key => {
      localStorage.removeItem(key)
      console.log(`[Auth] Cleared localStorage key: ${key}`)
    })

    // Also clear sessionStorage just in case
    const sessionKeysToRemove: string[] = []
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i)
      if (key && (key.startsWith('sb-') || key.includes('supabase'))) {
        sessionKeysToRemove.push(key)
      }
    }
    sessionKeysToRemove.forEach(key => sessionStorage.removeItem(key))

  } catch (e) {
    console.error('[Auth] Error clearing storage:', e)
  }
}

/**
 * Wrap a promise with a timeout
 */
function withTimeout<T>(promise: Promise<T>, ms: number, timeoutError: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(timeoutError)), ms)
    )
  ])
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  // Reset to unauthenticated state
  const resetAuthState = useCallback(() => {
    setUser(null)
    setProfile(null)
    setSession(null)
    setLoading(false)
  }, [])

  // Handle auth error: clear storage and reset state
  const handleAuthError = useCallback((error: unknown, context: string) => {
    console.error(`[Auth] ${context}:`, error)
    clearSupabaseAuthStorage()
    resetAuthState()
  }, [resetAuthState])

  // Fetch user profile from database
  const fetchUserData = useCallback(async (userId: string, userEmail: string): Promise<UserProfile> => {
    try {
      const { data: userData, error: userError } = await withTimeout(
        supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single(),
        5000,
        'User data fetch timeout'
      )

      if (userData && !userError) {
        return {
          id: userId,
          email: userData.email,
          role: userData.role || 'user',
          display_name: userData.display_name,
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
    let initTimeoutId: NodeJS.Timeout | null = null

    async function initialize() {
      console.log('[Auth] Initializing authentication...')

      try {
        // Set a hard timeout for the entire initialization
        initTimeoutId = setTimeout(() => {
          if (mounted && loading) {
            console.warn('[Auth] Initialization timeout - clearing auth state')
            clearSupabaseAuthStorage()
            resetAuthState()
          }
        }, SESSION_TIMEOUT)

        // Get session with timeout (2 seconds)
        const { data, error } = await withTimeout(
          supabase.auth.getSession(),
          2000,
          'Session restoration timeout'
        )

        if (!mounted) return

        if (error) {
          console.error('[Auth] Session error:', error.message)
          // Clear invalid tokens on error
          clearSupabaseAuthStorage()
          resetAuthState()
          return
        }

        if (data.session) {
          console.log('[Auth] Session found, fetching user profile...')
          setSession(data.session)
          setUser(data.session.user)

          try {
            const userProfile = await fetchUserData(
              data.session.user.id,
              data.session.user.email || ''
            )

            if (mounted) {
              setProfile(userProfile)
              console.log('[Auth] Authentication complete')
            }
          } catch (profileError) {
            console.error('[Auth] Profile fetch error:', profileError)
            // Session is valid but profile fetch failed - still authenticated
            if (mounted) {
              const isAdminEmail = data.session.user.email === 'info@diabeteslife.jp'
              setProfile({
                id: data.session.user.id,
                email: data.session.user.email || '',
                role: isAdminEmail ? 'admin' : 'user',
                display_name: null,
              })
            }
          }
        } else {
          console.log('[Auth] No session found')
        }
      } catch (error) {
        if (mounted) {
          handleAuthError(error, 'Initialization failed')
        }
        return
      } finally {
        if (mounted) {
          if (initTimeoutId) clearTimeout(initTimeoutId)
          setLoading(false)
        }
      }
    }

    initialize()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mounted) return

        console.log(`[Auth] Auth state changed: ${event}`)

        try {
          // Handle sign out or token refresh failure
          if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED' && !newSession) {
            resetAuthState()
            return
          }

          // Handle user deleted
          if (event === 'USER_DELETED') {
            clearSupabaseAuthStorage()
            resetAuthState()
            return
          }

          setSession(newSession)
          setUser(newSession?.user ?? null)

          if (newSession?.user) {
            try {
              const userProfile = await fetchUserData(
                newSession.user.id,
                newSession.user.email || ''
              )
              if (mounted) {
                setProfile(userProfile)
              }
            } catch (profileError) {
              console.error('[Auth] Profile fetch error on state change:', profileError)
              // Still set a basic profile
              if (mounted) {
                const isAdminEmail = newSession.user.email === 'info@diabeteslife.jp'
                setProfile({
                  id: newSession.user.id,
                  email: newSession.user.email || '',
                  role: isAdminEmail ? 'admin' : 'user',
                  display_name: null,
                })
              }
            }
          } else {
            setProfile(null)
          }
        } catch (error) {
          console.error('[Auth] Error in auth state change handler:', error)
          // Don't clear storage here as it might be a temporary error
          if (newSession?.user && mounted) {
            const isAdminEmail = newSession.user.email === 'info@diabeteslife.jp'
            setProfile({
              id: newSession.user.id,
              email: newSession.user.email || '',
              role: isAdminEmail ? 'admin' : 'user',
              display_name: null,
            })
          }
        } finally {
          if (mounted) setLoading(false)
        }
      }
    )

    // Final safety net - force loading to false after 5 seconds no matter what
    const safetyTimeoutId = setTimeout(() => {
      if (mounted && loading) {
        console.warn('[Auth] Safety timeout triggered - forcing loading to false')
        setLoading(false)
      }
    }, 5000)

    return () => {
      mounted = false
      if (initTimeoutId) clearTimeout(initTimeoutId)
      clearTimeout(safetyTimeoutId)
      subscription.unsubscribe()
    }
  }, [fetchUserData, handleAuthError, resetAuthState])

  async function signUp(email: string, password: string, displayName: string) {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: displayName },
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

  // Compute isAdmin from profile
  const isAdmin = profile?.role === 'admin'

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
