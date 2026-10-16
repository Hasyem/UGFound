'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MOCK_USERS } from '@/lib/mock-data'
import type { Tables, UserRole } from '@/types/database'

const LOCAL_AUTH_USER_KEY = 'ugfound_auth_user_v1'

interface AuthState {
  user: { id: string; email: string } | null
  profile: Tables<'users'> | null
  loading: boolean
  isAdmin: boolean
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
    isAdmin: false,
  })

  const isLiveSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your_')

  const fetchProfile = useCallback(async (userId: string) => {
    if (!isLiveSupabase) {
      const mock = MOCK_USERS.find((u) => u.id === userId)
      return mock || null
    }

    try {
      const supabase = createClient()
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()
      return data
    } catch {
      return null
    }
  }, [isLiveSupabase])

  useEffect(() => {
    const initAuth = async () => {
      if (isLiveSupabase) {
        try {
          const supabase = createClient()
          const { data: { user } } = await supabase.auth.getUser()
          if (user) {
            const profile = await fetchProfile(user.id)
            setAuthState({
              user: { id: user.id, email: user.email || '' },
              profile,
              loading: false,
              isAdmin: profile?.role === 'admin',
            })
            return
          }
        } catch (e) {
          console.error('Supabase auth error:', e)
        }
      }

      // Check localStorage for session / demo user
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(LOCAL_AUTH_USER_KEY)
        if (stored) {
          try {
            const parsed = JSON.parse(stored) as Tables<'users'>
            setAuthState({
              user: { id: parsed.id, email: parsed.email },
              profile: parsed,
              loading: false,
              isAdmin: parsed.role === 'admin',
            })
            return
          } catch {
            // invalid json
          }
        }
      }

      // Default: logged in as demo student for immediate convenience
      const defaultUser = MOCK_USERS[1] // Dimas Aditya (Mahasiswa)
      if (typeof window !== 'undefined') {
        localStorage.setItem(LOCAL_AUTH_USER_KEY, JSON.stringify(defaultUser))
      }
      setAuthState({
        user: { id: defaultUser.id, email: defaultUser.email },
        profile: defaultUser,
        loading: false,
        isAdmin: defaultUser.role === 'admin',
      })
    }

    initAuth()
  }, [fetchProfile, isLiveSupabase])

  const switchDemoAccount = (role: UserRole) => {
    const found = MOCK_USERS.find((u) => u.role === role) || MOCK_USERS[1]
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_AUTH_USER_KEY, JSON.stringify(found))
    }
    setAuthState({
      user: { id: found.id, email: found.email },
      profile: found,
      loading: false,
      isAdmin: found.role === 'admin',
    })
  }

  const signOut = async () => {
    if (isLiveSupabase) {
      try {
        const supabase = createClient()
        await supabase.auth.signOut()
      } catch (e) {
        console.error('Sign out error:', e)
      }
    }

    if (typeof window !== 'undefined') {
      localStorage.removeItem(LOCAL_AUTH_USER_KEY)
    }

    setAuthState({
      user: null,
      profile: null,
      loading: false,
      isAdmin: false,
    })
  }

  const loginWithCustomUser = (user: Tables<'users'>) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_AUTH_USER_KEY, JSON.stringify(user))
    }
    setAuthState({
      user: { id: user.id, email: user.email },
      profile: user,
      loading: false,
      isAdmin: user.role === 'admin',
    })
  }

  return {
    ...authState,
    signOut,
    switchDemoAccount,
    loginWithCustomUser,
  }
}
