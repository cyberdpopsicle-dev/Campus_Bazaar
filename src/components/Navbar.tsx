import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { ChevronDown, LogOut, Menu, Package, Plus, User as UserIcon, X } from 'lucide-react'
import { displayName, useAuth } from '../context/AuthContext'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-2 text-sm font-semibold transition ${
    isActive ? 'bg-primary-50 text-primary-800' : 'text-neutral-600 hover:text-neutral-900'
  }`

export default function Navbar() {
  const { user, loading, signOut } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const handleSignOut = async () => {
    setMenuOpen(false)
    setMobileOpen(false)
    await signOut()
    navigate('/')
  }

  const name = displayName(user)

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200/70 bg-[#f7f5ef]/85 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="group flex items-center gap-2.5">
          <span className="grid h-9 w-9 -rotate-6 place-items-center rounded-xl bg-primary-700 text-white shadow-[0_2px_0_0_#104e1d] transition group-hover:rotate-0">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M3 9l1.5-5h15L21 9" />
              <path d="M3 9h18v2a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0V9z" />
              <path d="M5 13v7h14v-7" />
            </svg>
          </span>
          <span className="leading-tight">
            <span className="block text-[15px] font-extrabold tracking-tight text-neutral-900">Campus Bazaar</span>
            <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-primary-700">NIT Srinagar</span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          <NavLink to="/" end className={linkClass}>Browse</NavLink>
          {user && <NavLink to="/my-listings" className={linkClass}>My listings</NavLink>}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {loading ? (
            <div className="skeleton h-9 w-40" />
          ) : user ? (
            <>
              <Link to="/sell" className="btn-accent">
                <Plus className="h-4 w-4" /> Sell an item
              </Link>
              <div className="relative" ref={menuRef}>
                <button onClick={() => setMenuOpen((o) => !o)} className="btn-ghost pl-2" aria-expanded={menuOpen}>
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-primary-100 text-xs font-bold text-primary-800">
                    {name.charAt(0).toUpperCase()}
                  </span>
                  <span className="max-w-[8rem] truncate">{name}</span>
                  <ChevronDown className="h-4 w-4 text-neutral-400" />
                </button>
                {menuOpen && (
                  <div className="card absolute right-0 mt-2 w-52 animate-scale-in overflow-hidden p-1.5">
                    <Link to="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-neutral-50">
                      <UserIcon className="h-4 w-4 text-neutral-400" /> Profile
                    </Link>
                    <Link to="/my-listings" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-neutral-50">
                      <Package className="h-4 w-4 text-neutral-400" /> My listings
                    </Link>
                    <button onClick={handleSignOut} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50">
                      <LogOut className="h-4 w-4" /> Sign out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/signin" className="btn text-neutral-700 hover:text-neutral-900">Sign in</Link>
              <Link to="/signup" className="btn-primary">Join the bazaar</Link>
            </>
          )}
        </div>

        <button className="btn-ghost px-2.5 md:hidden" onClick={() => setMobileOpen((o) => !o)} aria-label="Toggle menu">
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {mobileOpen && (
        <div className="animate-slide-up border-t border-neutral-200 bg-white px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1" onClick={() => setMobileOpen(false)}>
            <NavLink to="/" end className={linkClass}>Browse</NavLink>
            {user ? (
              <>
                <NavLink to="/sell" className={linkClass}>Sell an item</NavLink>
                <NavLink to="/my-listings" className={linkClass}>My listings</NavLink>
                <NavLink to="/profile" className={linkClass}>Profile</NavLink>
              </>
            ) : (
              <>
                <NavLink to="/signin" className={linkClass}>Sign in</NavLink>
                <NavLink to="/signup" className={linkClass}>Create account</NavLink>
              </>
            )}
          </div>
          {user && (
            <button onClick={handleSignOut} className="mt-2 w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-red-600 hover:bg-red-50">
              Sign out
            </button>
          )}
        </div>
      )}
    </header>
  )
}
