'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, User, LogOut, Settings, Bell } from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'
import { cn } from '@kumpelapp/utils'
import { Button } from '@kumpelapp/ui'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@kumpelapp/ui'

const navigation = [
  { name: 'Spieltag', href: '/spielplan' },
  { name: 'Tabelle', href: '/tabelle' },
  { name: 'Saison', href: '/saison' },
  { name: 'Bilanz', href: '/gegner' },
  { name: 'Kader', href: '/kader' },
  { name: 'News', href: '/news' },
  { name: 'Auswärts', href: '/auswaerts' },
  { name: 'Verein', href: '/verein' },
  { name: 'Tradition', href: '/tradition' },
  { name: 'Quiz', href: '/quiz' },
  { name: 'Fans', href: '/fans' },
]

function isActivePath(pathname: string, href: string) {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function Header() {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!mobileMenuOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileMenuOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [mobileMenuOpen])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-fc-border/80 bg-fc-surface/90 backdrop-blur-md supports-[backdrop-filter]:bg-fc-surface/75">
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8"
        aria-label="Hauptnavigation"
      >
        <Link
          href="/"
          className="group flex shrink-0 items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-surface"
          aria-label="KumpelApp Startseite"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-fc-violet/15 ring-1 ring-fc-violet/30 transition-colors group-hover:bg-fc-violet/25">
            <svg className="h-5 w-5 text-fc-violet" viewBox="0 0 100 100" fill="none" aria-hidden="true">
              <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="5" />
              <path d="M50 22 L50 78 M22 50 L78 50" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
            </svg>
          </span>
          <span className="hidden text-lg font-bold tracking-tight text-fc-fg sm:block">KumpelApp</span>
        </Link>

        <div className="hidden min-w-0 flex-1 lg:flex lg:items-center lg:justify-center">
          <div className="relative w-full max-w-3xl xl:max-w-4xl">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-0 z-10 w-6 bg-gradient-to-r from-fc-surface/95 to-transparent supports-[backdrop-filter]:from-fc-surface/80"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 right-0 z-10 w-6 bg-gradient-to-l from-fc-surface/95 to-transparent supports-[backdrop-filter]:from-fc-surface/80"
            />
            <ul
              className="flex items-center gap-1 overflow-x-auto px-1 py-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
              aria-label="Hauptbereiche"
            >
              {navigation.map((item) => {
                const active = isActivePath(pathname, item.href)
                return (
                  <li key={item.name} className="shrink-0">
                    <Link
                      href={item.href}
                      className={cn(
                        'relative inline-flex items-center whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-[color,background-color,box-shadow,transform] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-surface active:scale-[0.98] motion-reduce:transform-none',
                        active
                          ? 'bg-fc-violet text-white shadow-sm shadow-fc-violet/20'
                          : 'text-fc-fg/75 hover:bg-fc-violet/10 hover:text-fc-fg'
                      )}
                      aria-current={active ? 'page' : undefined}
                    >
                      {item.name}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>

        <div className="hidden shrink-0 items-center gap-2 lg:flex">
          {status === 'loading' ? (
            <div className="h-10 w-10 animate-pulse rounded-full bg-fc-border/70" aria-hidden="true" />
          ) : session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full p-0 ring-1 ring-fc-border/70 transition hover:ring-fc-violet/50"
                  aria-label="Benutzermenü öffnen"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-fc-violet/15">
                    <User className="h-5 w-5 text-fc-violet" aria-hidden="true" />
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-medium">
                  <span className="block truncate">{session.user.name || session.user.email}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profil" className="flex w-full items-center">
                    <User className="mr-2 h-4 w-4" aria-hidden="true" />
                    Profil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profil/einstellungen" className="flex w-full items-center">
                    <Settings className="mr-2 h-4 w-4" aria-hidden="true" />
                    Einstellungen
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/kumpels" className="flex w-full items-center">
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
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-fc-fg/80 hover:text-fc-fg">
                  Anmelden
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="shadow-sm shadow-fc-violet/20">
                  Registrieren
                </Button>
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg p-2.5 text-fc-fg transition-colors hover:bg-fc-violet/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-surface lg:hidden"
          onClick={() => setMobileMenuOpen((open) => !open)}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-menu"
          aria-label={mobileMenuOpen ? 'Menü schließen' : 'Menü öffnen'}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
        </button>
      </nav>

      <div
        id="mobile-menu"
        className={cn(
          'grid transition-[grid-template-rows,opacity] duration-200 ease-out lg:hidden',
          mobileMenuOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        )}
        aria-hidden={!mobileMenuOpen}
      >
        <div className="overflow-hidden border-t border-fc-border/80 bg-fc-surface/95">
          <div className="mx-auto max-w-7xl space-y-4 px-4 py-4 sm:px-6">
            <nav aria-label="Mobile Navigation">
              <ul className="flex flex-col gap-1">
                {navigation.map((item) => {
                  const active = isActivePath(pathname, item.href)
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={cn(
                          'flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                          active
                            ? 'bg-fc-violet text-white'
                            : 'text-fc-fg/80 hover:bg-fc-violet/10 hover:text-fc-fg'
                        )}
                        onClick={() => setMobileMenuOpen(false)}
                        aria-current={active ? 'page' : undefined}
                        tabIndex={mobileMenuOpen ? 0 : -1}
                      >
                        {item.name}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </nav>

            <div className="border-t border-fc-border/80 pt-3">
              {status === 'loading' ? (
                <div className="h-10 w-full animate-pulse rounded-lg bg-fc-border/60" aria-hidden="true" />
              ) : session?.user ? (
                <div className="space-y-1">
                  <p className="truncate px-3 pb-1 text-xs font-medium uppercase tracking-wide text-fc-fg/50">
                    {session.user.name || session.user.email}
                  </p>
                  <Link
                    href="/profil"
                    className="flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-fc-fg/80 transition-colors hover:bg-fc-violet/10 hover:text-fc-fg"
                    onClick={() => setMobileMenuOpen(false)}
                    tabIndex={mobileMenuOpen ? 0 : -1}
                  >
                    <User className="mr-2 h-4 w-4" aria-hidden="true" />
                    Profil
                  </Link>
                  <Link
                    href="/profil/einstellungen"
                    className="flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-fc-fg/80 transition-colors hover:bg-fc-violet/10 hover:text-fc-fg"
                    onClick={() => setMobileMenuOpen(false)}
                    tabIndex={mobileMenuOpen ? 0 : -1}
                  >
                    <Settings className="mr-2 h-4 w-4" aria-hidden="true" />
                    Einstellungen
                  </Link>
                  <Link
                    href="/kumpels"
                    className="flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-fc-fg/80 transition-colors hover:bg-fc-violet/10 hover:text-fc-fg"
                    onClick={() => setMobileMenuOpen(false)}
                    tabIndex={mobileMenuOpen ? 0 : -1}
                  >
                    <Bell className="mr-2 h-4 w-4" aria-hidden="true" />
                    Kumpels & Tippspiel
                  </Link>
                  <button
                    type="button"
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="flex w-full items-center rounded-lg px-3 py-2.5 text-left text-sm font-medium text-fc-loss transition-colors hover:bg-fc-loss/10"
                    tabIndex={mobileMenuOpen ? 0 : -1}
                  >
                    <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
                    Abmelden
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center rounded-lg border border-fc-border px-3 py-2.5 text-sm font-medium text-fc-fg transition-colors hover:bg-fc-violet/10"
                    onClick={() => setMobileMenuOpen(false)}
                    tabIndex={mobileMenuOpen ? 0 : -1}
                  >
                    Anmelden
                  </Link>
                  <Link
                    href="/register"
                    className="inline-flex items-center justify-center rounded-lg bg-fc-violet px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-fc-violet-dark"
                    onClick={() => setMobileMenuOpen(false)}
                    tabIndex={mobileMenuOpen ? 0 : -1}
                  >
                    Registrieren
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}