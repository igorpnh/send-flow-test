import { Navigate, Outlet } from 'react-router'
import { LoadingState } from '../../shared/components/PageState'
import { useAuth } from './useAuth'

export const RequireAuth = () => {
  const { user, loading } = useAuth()
  if (loading) return <LoadingState />
  return user ? <Outlet /> : <Navigate to="/login" replace />
}

export const RequireGuest = () => {
  const { user, loading } = useAuth()
  if (loading) return <LoadingState />
  return user ? <Navigate to="/" replace /> : <Outlet />
}
