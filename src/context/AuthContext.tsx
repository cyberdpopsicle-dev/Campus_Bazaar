import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import {
  AuthError,
  MissingIdentityError,
  getUser,
  handleAuthCallback,
  login,
  logout,
  onAuthChange,
  signup,
  type User,
} from '@netlify/identity'

type AuthContextValue = {
  user: User | null
  loading: boolean
  notice: string | null
  clearNotice: () => void
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName: string) => Promise<{ needsConfirmation: boolean }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function authErrorMessage(error: unknown): string {
  if (error instanceof MissingIdentityError) return 'Sign-in is not available right now. Please try again later.'
  if (error instanceof AuthError) {
    if (error.status === 401) return 'Invalid email or password. If you just signed up, confirm your email first.'
    if (error.status === 403) return 'New signups are currently closed.'
    if (error.status === 422) return error.message || 'Please check your email and password.'
    return error.message
  }
  return 'Something went wrong. Please try again.'
}

export function displayName(user: User | null) {
  if (!user) return ''
  const meta = user.userMetadata as { full_name?: string } | undefined
  return meta?.full_name || user.name || user.email?.split('@')[0] || 'Student'
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthChange((_event, next) => setUser(next))

    // Handles email-confirmation links that land back on the site.
    handleAuthCallback()
      .then((result) => {
        if (result?.type === 'confirmation') setNotice('Email confirmed — welcome to Campus Bazaar!')
      })
      .catch((error) => setNotice(authErrorMessage(error)))
      .finally(() =>
        getUser()
          .then(setUser)
          .finally(() => setLoading(false)),
      )

    return unsubscribe
  }, [])

  const value: AuthContextValue = {
    user,
    loading,
    notice,
    clearNotice: () => setNotice(null),
    signIn: async (email, password) => {
      setUser(await login(email, password))
    },
    signUp: async (email, password, fullName) => {
      const created = await signup(email, password, { full_name: fullName })
      if (created.confirmedAt) {
        setUser(created)
        return { needsConfirmation: false }
      }
      return { needsConfirmation: true }
    },
    signOut: async () => {
      await logout()
      setUser(null)
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
