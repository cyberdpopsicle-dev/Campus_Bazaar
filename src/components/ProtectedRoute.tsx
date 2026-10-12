import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-12">
        <div className="skeleton h-8 w-1/3" />
        <div className="skeleton h-40 w-full" />
      </div>
    )
  }
  if (!user) return <Navigate to="/signin" replace state={{ from: location.pathname }} />
  return <>{children}</>
}
