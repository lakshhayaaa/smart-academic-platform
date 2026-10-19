
import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Sidebar from './Sidebar'
import TopBar from './TopBar'

const titles = {
  '/dashboard': 'Dashboard',
  '/resources': 'Discover Resources',
  '/upload': 'Upload Resource',
  '/register-course': 'Register Course',
  '/my-uploads': 'My Uploads',
  '/my-ratings': 'My Ratings',
  '/recently-viewed': 'Recently Viewed',
  '/recently-downloaded': 'Recently Downloaded',
  '/requests': 'Resource Requests',
}

export default function AppShell() {
  const { logout } = useAuth()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const title = location.pathname.startsWith('/resources/')
    ? 'Resource details'
    : titles[location.pathname] || 'ScholarShare'

  return (
    <div className="flex h-dvh overflow-hidden bg-slate-50">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((value) => !value)}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        onLogout={logout}
      />

      <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col">
        <TopBar
          title={title}
          onMenu={() => setMobileOpen(true)}
        />

        <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
