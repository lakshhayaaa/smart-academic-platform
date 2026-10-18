import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function PublicOnlyRoute() {
  const { bootstrapping, token } = useAuth()

  if (bootstrapping) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">Loading…</p>
      </div>
    )
  }

  if (token) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
