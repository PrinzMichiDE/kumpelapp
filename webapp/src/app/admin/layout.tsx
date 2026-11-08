'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Building, ChevronDown, FileText, LayoutDashboard, LogOut, MapPin, MessageSquare, Shield, Users, X } from 'lucide-react'
import { cn } from '@kumpelapp/utils'
import { Button } from '@kumpelapp/ui'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@kumpelapp/ui'

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Teams', href: '/admin/teams', icon: Users },
  { name: 'Stadien', href: '/admin/venues', icon: MapPin },
  { name: 'Fanclubs', href: '/admin/fanclubs', icon: Users },
  { name: 'Kontakte', href: '/admin/contacts', icon: MessageSquare },
  { name: 'Links', href: '/admin/links', icon: FileText },
  { name: 'Tradition', href: '/admin/tradition', icon: Shield },
  { name: 'Abteilungen', href: '/admin/departments', icon: Building },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!sidebarOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSidebarOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [sidebarOpen])

  return (
    <div className="flex min-h-screen bg-fc-bg">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/55 backdrop-blur-[1px] lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Sidebar schließen"
        />
      )}

      {/* Sidebar */}
      <aside
        id="admin-sidebar"
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 transform border-r border-fc-border bg-fc-surface shadow-xl shadow-black/20 transition-transform duration-300 motion-reduce:transition-none lg:static lg:translate-x-0 lg:shadow-none',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        aria-label="Admin-Bereich"
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 items-center justify-between border-b border-fc-border px-4">
            <Link
              href="/admin"
              className="flex items-center gap-2 rounded-lg font-bold text-fc-fg transition-colors hover:text-fc-violet focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-surface"
              onClick={() => setSidebarOpen(false)}
            >
              <svg className="h-8 w-8 text-fc-violet" viewBox="0 0 100 100" fill="none" aria-hidden="true">
                <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="4" />
                <path d="M50 20 L50 80 M20 50 L80 50" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
              <span>Admin</span>
            </Link>
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-fc-fg/75 transition-colors hover:bg-fc-violet/10 hover:text-fc-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-surface lg:hidden"
              onClick={() => setSidebarOpen(false)}
              aria-label="Sidebar schließen"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label="Admin Navigation">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-[background-color,color,transform] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-surface active:scale-[0.99]',
                    isActive
                      ? 'bg-fc-violet text-white shadow-sm shadow-fc-violet/20'
                      : 'text-fc-fg/75 hover:bg-fc-violet/10 hover:text-fc-fg'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* User menu */}
          <div className="border-t border-fc-border p-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="h-11 w-full justify-start gap-2 border-fc-border/80 bg-fc-bg/20 hover:bg-fc-bg/35 focus-visible:ring-fc-violet"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-fc-violet/12 text-fc-violet ring-1 ring-inset ring-fc-violet/20">
                    <Users className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="flex-1 truncate text-left text-sm font-medium text-fc-fg">Admin User</span>
                  <ChevronDown className="h-4 w-4 text-fc-fg/50" aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 border-fc-border/80">
                <DropdownMenuLabel className="font-medium text-fc-fg">Admin User</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link
                    href="/admin/profile"
                    className="flex w-full cursor-pointer items-center gap-2 px-2 py-2 text-sm"
                    onClick={() => setSidebarOpen(false)}
                  >
                    Profil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href="/admin/settings"
                    className="flex w-full cursor-pointer items-center gap-2 px-2 py-2 text-sm"
                    onClick={() => setSidebarOpen(false)}
                  >
                    Einstellungen
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    /* signOut - logic unchanged */
                  }}
                  className="cursor-pointer text-fc-loss focus:bg-fc-loss/10 focus:text-fc-loss"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  Abmelden
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>

      {/* Mobile menu button */}
      <button
        type="button"
        className={cn(
          'fixed left-4 top-4 z-30 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-fc-border bg-fc-surface/95 text-fc-fg shadow-sm backdrop-blur transition-[background-color,border-color,transform] hover:bg-fc-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-bg active:scale-[0.98] lg:hidden',
          sidebarOpen && 'pointer-events-none opacity-0'
        )}
        onClick={() => setSidebarOpen(true)}
        aria-label="Admin-Menü öffnen"
        aria-expanded={sidebarOpen}
        aria-controls="admin-sidebar"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>

      {/* Main content */}
      <main id="main-content" className="min-w-0 flex-1 lg:pl-0">
        <div className="min-h-screen w-full">{children}</div>
      </main>
    </div>
  )
}