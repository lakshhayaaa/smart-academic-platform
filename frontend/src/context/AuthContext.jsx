import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { getDashboard } from '../api/dashboardApi'
import { signin, signout, signup } from '../api/authApi'
import { setUnauthorizedHandler } from '../api/axiosInstance'
import { getErrorMessage } from '../utils/errors'
import { getStoredToken, setStoredToken } from '../utils/storage'

const AuthContext = createContext(null)

const emptyDashboard = {
  student: null,
  my_uploads: { total: 0, items: [] },
  recently_viewed: [],
  recently_downloaded: [],
  my_ratings: { total: 0, items: [] },
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getStoredToken())
  const [user, setUser] = useState(null)
  const [dashboard, setDashboard] = useState(emptyDashboard)
  const [bootstrapping, setBootstrapping] = useState(Boolean(getStoredToken()))
  const [dashboardLoading, setDashboardLoading] = useState(false)
  const [dashboardError, setDashboardError] = useState('')

  const clearSession = useCallback(() => {
    setStoredToken(null)
    setToken(null)
    setUser(null)
    setDashboard(emptyDashboard)
  }, [])

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearSession()
    })
    return () => setUnauthorizedHandler(null)
  }, [clearSession])

  const refreshDashboard = useCallback(async () => {
    if (!getStoredToken()) return null
    setDashboardLoading(true)
    setDashboardError('')
    try {
      const { data } = await getDashboard()
      setDashboard(data)
      setUser(data.student)
      return data
    } catch (error) {
      setDashboardError(getErrorMessage(error, 'Could not load dashboard'))
      throw error
    } finally {
      setDashboardLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!token) {
      setBootstrapping(false)
      return
    }
    let cancelled = false
    ;(async () => {
      setBootstrapping(true)
      try {
        await refreshDashboard()
      } catch (error) {
        const status = error.response?.status
        if (!cancelled && (status === 401 || status === 404)) {
          clearSession()
        }
      } finally {
        if (!cancelled) setBootstrapping(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [token, refreshDashboard, clearSession])

  const login = useCallback(async ({ email, password }) => {
    const { data } = await signin({ email, password })
    if (!data?.access_token) {
      throw new Error(data?.message || 'Login failed')
    }
    setStoredToken(data.access_token)
    setToken(data.access_token)
    return data
  }, [])

  const register = useCallback(async (payload) => {
    const { data } = await signup(payload)
    const message = data?.message || ''
    if (!message.toLowerCase().includes('success')) {
      throw new Error(message || 'Registration failed')
    }
    return data
  }, [])

  const logout = useCallback(async () => {
    try {
      await signout()
    } catch {
      // Local session is still cleared even if token revocation fails.
    } finally {
      clearSession()
    }
  }, [clearSession])

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token && user),
      bootstrapping,
      dashboard,
      dashboardLoading,
      dashboardError,
      login,
      register,
      logout,
      refreshDashboard,
    }),
    [
      token,
      user,
      bootstrapping,
      dashboard,
      dashboardLoading,
      dashboardError,
      login,
      register,
      logout,
      refreshDashboard,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
