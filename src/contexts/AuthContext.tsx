import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { sendWelcomeEmail } from '../lib/email'
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

    async function fetchUserData(userId: string, userEmail: string) {
      console.log('Fetching user data for:', userId, userEmail)

      // Try to get from users table first (where role is stored)
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      console.log('Users table result:', { userData, userError })

      if (userData && !userError) {
        const userProfile: UserProfile = {
          id: userId,
          email: userData.email,
          role: userData.role || 'user',
          display_name: userData.display_name,
        }
        console.log('Setting profile from users table:', userProfile)
        return userProfile
      }

      // Fallback to profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      console.log('Profiles table result:', { profileData, profileError })

      if (profileData && !profileError) {
        const userProfile: UserProfile = {
          ...profileData,
          id: userId,
          role: profileData.role || 'user',
        }
        console.log('Setting profile from profiles table:', userProfile)
        return userProfile
      }

      // If no data found, create a default profile
      console.log('No profile found, using default')
      return {
        id: userId,
        email: userEmail,
        role: 'user' as UserRole,
        display_name: null,
      }
    }

    async function initialize() {
      try {
        console.log('Initializing auth...')
        const { data, error } = await supabase.auth.getSession()

        if (!mounted) return

        if (error) {
          console.error('Error getting session:', error)
          setLoading(false)
          return
        }

        console.log('Session data:', data.session ? 'exists' : 'null')

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
        console.log('Auth state changed:', event)
        if (!mounted) return

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

        if (mounted) setLoading(false)
      }
    )

    // Safety timeout
    const timeoutId = setTimeout(() => {
      if (mounted) {
        console.log('Auth timeout reached')
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

      // Send welcome email (don't block on failure)
      if (!error) {
        sendWelcomeEmail(email, displayName).catch((e) => {
          console.error('Failed to send welcome email:', e)
        })
      }

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
      // Try users table first
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
        return
      }

      // Fallback to profiles
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileData) {
        setProfile({
          ...profileData,
          id: user.id,
          role: profileData.role || 'user',
        })
      }
    }
  }

  // Debug log
  console.log('AuthContext state:', { user: user?.email, profile, loading })

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
