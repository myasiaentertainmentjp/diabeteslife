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

    async function fetchUserData(userId: string, userEmail: string): Promise<UserProfile> {
      console.log('Fetching user data for:', userId, userEmail)

      // Try to get from users table first (where role is stored)
      try {
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
      } catch (err) {
        console.error('Error fetching from users table:', err)
      }

      // Fallback to profiles table
      try {
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
      } catch (err) {
        console.error('Error fetching from profiles table:', err)
      }

      // Fallback to user_profiles table (newer schema)
      try {
        const { data: userProfileData, error: userProfileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', userId)
          .single()

        console.log('User_profiles table result:', { userProfileData, userProfileError })

        if (userProfileData && !userProfileError) {
          // Check if user has admin role from a separate query or default
          const userProfile: UserProfile = {
            id: userId,
            email: userEmail,
            role: 'user' as UserRole,
            display_name: null,
            ...userProfileData,
          }
          console.log('Setting profile from user_profiles table:', userProfile)
          return userProfile
        }
      } catch (err) {
        console.error('Error fetching from user_profiles table:', err)
      }

      // If no data found, create a default profile
      // For admin email, set admin role as fallback
      const isAdminEmail = userEmail === 'info@diabeteslife.jp'
      console.log('No profile found, using default. Is admin email:', isAdminEmail)
      return {
        id: userId,
        email: userEmail,
        role: isAdminEmail ? 'admin' : 'user' as UserRole,
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

    // Safety timeout - if auth takes too long, set a default admin profile for known admin email
    const timeoutId = setTimeout(async () => {
      if (mounted && loading) {
        console.log('Auth timeout reached, checking for session...')

        // Try to get current session
        const { data: sessionData } = await supabase.auth.getSession()
        if (sessionData?.session?.user) {
          const userEmail = sessionData.session.user.email || ''
          const isAdminEmail = userEmail === 'info@diabeteslife.jp'

          console.log('Setting fallback profile after timeout. Email:', userEmail, 'Is admin:', isAdminEmail)

          if (mounted && !profile) {
            setUser(sessionData.session.user)
            setSession(sessionData.session)
            setProfile({
              id: sessionData.session.user.id,
              email: userEmail,
              role: isAdminEmail ? 'admin' : 'user',
              display_name: null,
            })
          }
        }

        if (mounted) {
          setLoading(false)
        }
      }
    }, 5000) // Increased to 5 seconds

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
