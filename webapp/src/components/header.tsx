'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, User, LogOut, Settings, Bell } from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'
import { cn } from '@kumpelapp/utils'
import { Button } from '@kumpelapp/ui'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@kumpelapp/ui'

const navigation = [
  { name: 'Spieltag', href: '/spielplan', icon: 'calendar' },
  { name: 'Tabelle', href: '/tabelle', icon: 'trophy' },
  { name: 'Kader', href: '/kader', icon: 'users' },
  { name: 'News', href: '/news', icon: 'newspaper' },
  { name: 'Auswärts', href: '/auswaerts', icon: 'map-pin' },
  { name: 'Verein', href: '/verein', icon: 'building' },
  { name: 'Tradition', href: '/tradition', icon: 'history' },
  { name: 'Fans', href: '/fans', icon: 'heart' },
]

export function Header() {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-fc-border bg-fc-surface/95 backdrop-blur supports-[backdrop-filter]:bg-fc-surface/80">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3" aria-label="Hauptnavigation">
        <Link href="/" className="flex items-center space-x-2" aria-label="KumpelApp Startseite">
          <svg className="h-8 w-8 text-fc-violet" viewBox="0 0 100 100" fill="none" aria-hidden="true">
            <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="4"/>
            <path d="M50 20 L50 80 M20 50 L80 50" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
          </svg>
          <span className="font-bold text-xl text-fc-fg hidden sm:block">KumpelApp</span>
        </Link>

        <div className="hidden md:flex md:items-center md:space-x-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                pathname === item.href
                  ? 'bg-fc-violet text-fc-fg'
                  : 'text-fc-fg/70 hover:text-fc-fg hover:bg-fc-violet/10'
              )}
              aria-current={pathname === item.href ? 'page' : undefined}
            >
              {item.name}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex md:items-center md:space-x-3">
          {status === 'loading' ? (
            <div className="h-10 w-10 animate-pulse rounded-full bg-fc-border" />
          ) : session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                  <div className="h-10 w-10 rounded-full bg-fc-violet/20 flex items-center justify-center">
                    <User className="h-5 w-5 text-fc-violet" aria-hidden="true" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-medium">
                  {session.user.name || session.user.email}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profil" className="flex w-full items-center px-2 py-1.5 text-sm" onClick={() => setUserMenuOpen(false)}>
                    <User className="mr-2 h-4 w-4" aria-hidden="true" />
                    Profil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profil/einstellungen" className="flex w-full items-center px-2 py-1.5 text-sm" onClick={() => setUserMenuOpen(false)}>
                    <Settings className="mr-2 h-4 w-4" aria-hidden="true" />
                    Einstellungen
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/kumpels" className="flex w-full items-center px-2 py-1.5 text-sm" onClick={() => setUserMenuOpen(false)}>
                    <Bell className="mr-2 h-4 w-4" aria-hidden="true" />
                    Kumpels & Tippspiel
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="text-fc-loss focus:text-fc-loss"
                >
                  <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
                  Abmelden
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">Anmelden</Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Registrieren</Button>
              </Link>
            </div>
          )}
        </div>

        <button
          className="md:hidden p-2 rounded-md text-fc-fg hover:bg-fc-violet/10"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-menu"
          aria-label={mobileMenuOpen ? 'Menü schließen' : 'Menü öffnen'}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {mobileMenuOpen && (
        <div id="mobile-menu" className="md:hidden border-t border-fc-border bg-fc-surface py-4 px-4">
          <nav className="flex flex-col space-y-2" aria-label="Mobile Navigation">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  pathname === item.href
                    ? 'bg-fc-violet text-fc-fg'
                    : 'text-fc-fg/70 hover:text-fc-fg hover:bg-fc-violet/10'
                )}
                onClick={() => setMobileMenuOpen(false)}
                aria-current={pathname === item.href ? 'page' : undefined}
              >
                {item.name}
              </Link>
            ))}
            <hr className="border-fc-border my-2" />
            {session?.user ? (
              <div className="flex flex-col space-y-2">
                <Link href="/profil" className="px-3 py-2 rounded-md text-sm font-medium text-fc-fg/70 hover:text-fc-fg" onClick={() => setMobileMenuOpen(false)}>
                  Profil
                </Link>
                <Link href="/profil/einstellungen" className="px-3 py-2 rounded-md text-sm font-medium text-fc-fg/70 hover:text-fc-fg" onClick={() => setMobileMenuOpen(false)}>
                  Einstellungen
                </Link>
                <Link href="/kumpels" className="px-3 py-2 rounded-md text-sm font-medium text-fc-fg/70 hover:text-fc-fg" onClick={() => setMobileMenuOpen(false)}>
                  Kumpels & Tippspiel
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="px-3 py-2 rounded-md text-sm font-medium text-fc-loss text-left w-full"
                >
                  Abmelden
                </button>
              </div>
            ) : (
              <div className="flex flex-col space-y-2">
                <Link href="/login" className="px-3 py-2 rounded-md text-sm font-medium text-fc-fg/70 hover:text-fc-fg" onClick={() => setMobileMenuOpen(false)}>
                  Anmelden
                </Link>
                <Link href="/register" className="px-3 py-2 rounded-md text-sm font-medium text-fc-fg bg-fc-violet/10 hover:bg-fc-violet/20 text-center" onClick={() => setMobileMenuOpen(false)}>
                  Registrieren
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}

import { useState } from 'react'