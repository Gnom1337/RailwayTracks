import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'
import type { Role } from '../api/types'

export function ProtectedRoute({ roles }: { roles?: Role[] }) {
  const { user, hasRole } = useAuth()
  const location = useLocation()

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (roles && roles.length > 0 && !hasRole(...roles)) {
    return <Navigate to="/403" replace />
  }

  return <Outlet />
}
