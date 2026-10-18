import { ChevronDown, Menu, Search, UserRound } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function TopBar({ title, onMenu, showSearch = true }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const menuRef = useRef(null)

  useEffect(() => {
    function handleClick(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function submitSearch(event) {
    event.preventDefault()
    const next = query.trim()
    navigate(next ? `/resources?q=${encodeURIComponent(next)}` : '/resources')
  }

  return (
    <header className="sticky top-0 z-20 flex items-center gap-4 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur">
      <button
        type="button"
        onClick={onMenu}
        className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5" />
      </button>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-900">{title}</p>
      </div>
      {showSearch ? (
        <form onSubmit={submitSearch} className="hidden max-w-md flex-1 md:block">
          <label className="relative block">
            <span className="sr-only">Search resources</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by title or course code"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-indigo-400 focus:bg-white"
            />
          </label>
        </form>
      ) : null}
      <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50"
          aria-haspopup="menu"
          aria-expanded={open}
        >
          <UserRound className="h-4 w-4 text-indigo-600" />
          <span className="hidden max-w-[8rem] truncate sm:inline">{user?.name || 'Account'}</span>
          <ChevronDown className="h-4 w-4 text-slate-400" />
        </button>
        {open ? (
          <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-lg" role="menu">
            <div className="border-b border-slate-100 px-3 py-2">
              <p className="text-sm font-medium text-slate-900">{user?.name}</p>
              <p className="text-xs text-slate-500">{user?.roll_no}</p>
            </div>
            <Link
              to="/dashboard"
              className="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
              onClick={() => setOpen(false)}
            >
              Dashboard
            </Link>
            <button
              type="button"
              className="block w-full rounded-lg px-3 py-2 text-left text-sm text-rose-700 hover:bg-rose-50"
              onClick={() => {
                setOpen(false)
                logout()
              }}
            >
              Logout
            </button>
          </div>
        ) : null}
      </div>
    </header>
  )
}
