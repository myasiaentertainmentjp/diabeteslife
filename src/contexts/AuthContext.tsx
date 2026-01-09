import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { Profile, AppUser, UserRole } from '../types/database'

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
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: Error | null }>
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function fetchUserData(userId: string, userEmail: string): Promise<UserProfile> {
      // Get from users table (where role is stored)
      try {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single()

        if (userData && !userError) {
          return {
            id: userId,
            email: userData.email,
            role: userData.role || 'user',
            display_name: userData.display_name,
          }
        }
      } catch (err) {
        console.error('Error fetching from users table:', err)
      }

      // If no data found, create a default profile
      // For admin email, set admin role as fallback
      const isAdminEmail = userEmail === 'info@diabeteslife.jp'
      return {
        id: userId,
        email: userEmail,
        role: isAdminEmail ? 'admin' : 'user' as UserRole,
        display_name: null,
      }
    }

    async function initialize() {
      try {
        const { data, error } = await supabase.auth.getSession()

        if (!mounted) return

        if (error) {
          console.error('Error getting session:', error)
          setLoading(false)
          return
        }

        if (data.session) {
          setSession(data.session)
          setUser(data.session.user)

          const userProfile = await fetchUserData(
            data.session.user.id,
            data.session.user.email || ''
          )

          if (mounted) {
            setProfile(userProfile)
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    initialize()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mounted) return

        try {
          setSession(newSession)
          setUser(newSession?.user ?? null)

          if (newSession?.user) {
            const userProfile = await fetchUserData(
              newSession.user.id,
              newSession.user.email || ''
            )
            if (mounted) {
              setProfile(userProfile)
            }
          } else {
            setProfile(null)
          }
        } catch (error) {
          console.error('Error in auth state change handler:', error)
          // Set default profile on error
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

    // Safety timeout - force loading to false after 3 seconds
    // This ensures UI shows login buttons even if Supabase hangs
    const timeoutId = setTimeout(() => {
      if (mounted) {
        setLoading(false)
      }
    }, 3000)

    return () => {
      mounted = false
      clearTimeout(timeoutId)
      subscription.unsubscribe()
    }
  }, [])

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
    await supabase.auth.signOut()
    setProfile(null)
  }

  async function refreshProfile() {
    if (user) {
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
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      session,
      loading,
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
