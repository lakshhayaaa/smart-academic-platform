import {
  Clock,
  Compass,
  Download,
  LayoutDashboard,
  LogOut,
  MessageSquarePlus,
  PanelLeftClose,
  PanelLeftOpen,
  Star,
  Upload,
  Files,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/resources', label: 'Discover Resources', icon: Compass },
  { to: '/upload', label: 'Upload Resource', icon: Upload },
  { to: '/requests', label: 'Resource Requests', icon: MessageSquarePlus },
  { to: '/my-uploads', label: 'My Uploads', icon: Files },
  { to: '/my-ratings', label: 'My Ratings', icon: Star },
  { to: '/recently-viewed', label: 'Recently Viewed', icon: Clock },
  { to: '/recently-downloaded', label: 'Recently Downloaded', icon: Download },
]

export default function Sidebar({ collapsed, onToggle, mobileOpen, onClose, onLogout }) {
  const content = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-4 py-5">
        {!collapsed ? (
          <div>
            <p className="text-sm font-semibold tracking-tight text-white">ScholarShare</p>
            <p className="text-xs text-slate-400">Academic resources</p>
          </div>
        ) : (
          <span className="text-sm font-semibold text-white">SS</span>
        )}
        <button
          type="button"
          onClick={onToggle}
          className="hidden rounded-lg p-2 text-slate-300 hover:bg-slate-800 hover:text-white lg:inline-flex"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </div>
      <nav className="flex-1 space-y-1 px-3" aria-label="Main">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              } ${collapsed ? 'justify-center' : ''}`
            }
            title={collapsed ? label : undefined}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {!collapsed ? <span>{label}</span> : <span className="sr-only">{label}</span>}
          </NavLink>
        ))}
      </nav>
      <div className="p-3">
        <button
          type="button"
          onClick={onLogout}
          className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed ? 'Logout' : <span className="sr-only">Logout</span>}
        </button>
      </div>
    </div>
  )

  return (
    <>
      <aside
        className={`hidden h-full shrink-0 bg-slate-950 text-white transition-[width] duration-200 lg:block ${
          collapsed ? 'w-[4.5rem]' : 'w-64'
        }`}
      >
        {content}
      </aside>
      {mobileOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button type="button" className="absolute inset-0 bg-slate-900/50" aria-label="Close menu" onClick={onClose} />
          <aside className="relative h-full w-72 bg-slate-950 text-white shadow-xl">{content}</aside>
        </div>
      ) : null}
    </>
  )
}
