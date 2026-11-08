'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2, Lock, Mail, User } from 'lucide-react'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input } from '@kumpelapp/ui'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const validatePassword = (pwd: string) => {
    if (pwd.length < 8) return 'Passwort muss mindestens 8 Zeichen lang sein'
    if (!/[A-Z]/.test(pwd)) return 'Passwort muss mindestens einen Großbuchstaben enthalten'
    if (!/[a-z]/.test(pwd)) return 'Passwort muss mindestens einen Kleinbuchstaben enthalten'
    if (!/[0-9]/.test(pwd)) return 'Passwort muss mindestens eine Zahl enthalten'
    return null
  }

  const passwordChecks = [
    { label: 'Mindestens 8 Zeichen', ok: password.length >= 8 },
    { label: 'Großbuchstabe', ok: /[A-Z]/.test(password) },
    { label: 'Kleinbuchstabe', ok: /[a-z]/.test(password) },
    { label: 'Zahl', ok: /[0-9]/.test(password) },
  ]

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')

    const pwdError = validatePassword(password)
    if (pwdError) {
      setError(pwdError)
      return
    }

    if (password !== confirmPassword) {
      setError('Passwörter stimmen nicht überein')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })

      const data = (await response.json()) as { message?: string }

      if (!response.ok) {
        setError(data.message || 'Registrierung fehlgeschlagen')
        return
      }

      router.push('/login?registered=true')
    } catch {
      setError('Ein Fehler ist aufgetreten. Bitte versuche es später erneut.')
    } finally {
      setLoading(false)
    }
  }

  const passwordError = password ? validatePassword(password) : null
  const passwordMismatch = Boolean(confirmPassword) && password !== confirmPassword
  const formErrorId = 'register-form-error'
  const confirmErrorId = 'confirm-password-error'
  const linkFocus =
    'rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-surface'

  return (
    <div className="flex min-h-[calc(100vh-12rem)] items-center justify-center px-4 py-10 sm:px-6 sm:py-14">
      <Card className="w-full max-w-md border-fc-border/80 bg-card/95 shadow-lg shadow-black/10">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight text-fc-fg">Registrieren</CardTitle>
          <CardDescription className="text-fc-fg/70">Erstelle dein kostenloses KumpelApp-Konto</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div aria-live="polite" aria-atomic="true">
            {error ? (
              <div
                id={formErrorId}
                className="flex items-start gap-3 rounded-xl border border-fc-loss/25 bg-fc-loss/10 p-3.5 text-sm text-fc-loss"
                role="alert"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <p>{error}</p>
              </div>
            ) : null}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" aria-busy={loading}>
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-fc-fg">
                Name <span className="font-normal text-fc-fg/55">(optional)</span>
              </label>
              <div className="relative">
                <User
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fc-fg/45"
                  aria-hidden="true"
                />
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Dein Name"
                  className="h-11 pl-10"
                  autoComplete="name"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-fc-fg">
                E-Mail
              </label>
              <div className="relative">
                <Mail
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fc-fg/45"
                  aria-hidden="true"
                />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="deine@email.de"
                  className="h-11 pl-10"
                  required
                  autoComplete="email"
                  inputMode="email"
                  disabled={loading}
                  aria-invalid={Boolean(error && !passwordError && !passwordMismatch)}
                  aria-describedby={error && !passwordError && !passwordMismatch ? formErrorId : undefined}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-fc-fg">
                Passwort
              </label>
              <div className="relative">
                <Lock
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fc-fg/45"
                  aria-hidden="true"
                />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-11 pl-10 pr-11"
                  required
                  autoComplete="new-password"
                  disabled={loading}
                  aria-invalid={Boolean(passwordError)}
                  aria-describedby="password-requirements"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-fc-fg/55 transition-colors hover:bg-fc-violet/10 hover:text-fc-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-surface disabled:pointer-events-none disabled:opacity-50"
                  aria-label={showPassword ? 'Passwort verbergen' : 'Passwort anzeigen'}
                  aria-pressed={showPassword}
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                </button>
              </div>

              <div id="password-requirements" className="rounded-lg border border-fc-border/70 bg-fc-bg/35 p-3">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-fc-fg/55">Passwort-Anforderungen</p>
                <ul className="grid gap-1.5 sm:grid-cols-2" aria-label="Passwort-Anforderungen">
                  {passwordChecks.map((item) => (
                    <li key={item.label} className="flex items-center gap-2 text-sm">
                      {item.ok ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-fc-win" aria-hidden="true" />
                      ) : (
                        <span className="h-4 w-4 shrink-0 rounded-full border border-fc-border/80" aria-hidden="true" />
                      )}
                      <span className={item.ok ? 'text-fc-fg/85' : 'text-fc-fg/60'}>{item.label}</span>
                    </li>
                  ))}
                </ul>
                {passwordError ? (
                  <p className="mt-2 text-sm text-fc-loss" role="status">
                    {passwordError}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-fc-fg">
                Passwort bestätigen
              </label>
              <div className="relative">
                <Lock
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fc-fg/45"
                  aria-hidden="true"
                />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-11 pl-10"
                  required
                  autoComplete="new-password"
                  disabled={loading}
                  aria-invalid={passwordMismatch}
                  aria-describedby={passwordMismatch ? confirmErrorId : undefined}
                />
              </div>
              {passwordMismatch ? (
                <p id={confirmErrorId} className="flex items-center gap-2 text-sm text-fc-loss" role="alert">
                  <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                  Passwörter stimmen nicht überein
                </p>
              ) : null}
            </div>

            <Button type="submit" className="h-11 w-full" disabled={loading} size="lg">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Registrieren...
                </>
              ) : (
                'Konto erstellen'
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-fc-fg/65">
            Schon ein Konto?{' '}
            <Link href="/login" className={`font-semibold text-fc-violet transition-colors hover:text-fc-violet-light ${linkFocus}`}>
              Anmelden
            </Link>
          </p>

          <p className="text-center text-xs leading-relaxed text-fc-fg/55">
            Mit der Registrierung stimmst du unseren{' '}
            <Link href="/agb" className={`underline underline-offset-2 transition-colors hover:text-fc-violet ${linkFocus}`}>
              AGB
            </Link>{' '}
            und der{' '}
            <Link href="/datenschutz" className={`underline underline-offset-2 transition-colors hover:text-fc-violet ${linkFocus}`}>
              Datenschutzerklärung
            </Link>{' '}
            zu.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}