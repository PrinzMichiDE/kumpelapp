'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, User, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react'
import { Button } from '@kumpelapp/ui'
import { Input } from '@kumpelapp/ui'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@kumpelapp/ui'

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

  const handleSubmit = async (e: React.FormEvent) => {
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

      const data = await response.json()

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

  const passwordError = password && validatePassword(password)

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Registrieren</CardTitle>
          <CardDescription>Erstelle dein kostenloses KumpelApp-Konto</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-fc-loss/10 text-fc-loss text-sm" role="alert">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-fc-fg">
                Name (optional)
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-fc-fg/40" aria-hidden="true" />
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Dein Name"
                  className="pl-10"
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
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-fc-fg/40" aria-hidden="true" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="deine@email.de"
                  className="pl-10"
                  required
                  autoComplete="email"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-fc-fg">
                Passwort
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-fc-fg/40" aria-hidden="true" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                  required
                  autoComplete="new-password"
                  disabled={loading}
                  aria-describedby={passwordError ? 'password-error' : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-fc-fg/40 hover:text-fc-fg"
                  aria-label={showPassword ? 'Passwort verbergen' : 'Passwort anzeigen'}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {passwordError && (
                <p id="password-error" className="text-sm text-fc-loss flex items-center gap-1" role="alert">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {passwordError}
                </p>
              )}
              {!passwordError && password.length >= 8 && (
                <p className="text-sm text-fc-win flex items-center gap-1">
                  <CheckCircle className="h-3.5 w-3.5" />
                  Passwort ist stark
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-fc-fg">
                Passwort bestätigen
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-fc-fg/40" aria-hidden="true" />
                <Input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10"
                  required
                  autoComplete="new-password"
                  disabled={loading}
                  aria-describedby={confirmPassword && password !== confirmPassword ? 'confirm-error' : undefined}
                />
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p id="confirm-error" className="text-sm text-fc-loss flex items-center gap-1" role="alert">
                  <AlertCircle className="h-3.5 w-3.5" />
                  Passwörter stimmen nicht überein
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={loading} size="lg">
              {loading ? 'Registrieren...' : 'Konto erstellen'}
            </Button>
          </form>

          <p className="text-center text-sm text-fc-fg/60">
            Schon ein Konto?{' '}
            <Link href="/login" className="text-fc-violet hover:underline font-medium">
              Anmelden
            </Link>
          </p>

          <p className="text-center text-xs text-fc-fg/50">
            Mit der Registrierung stimmst du unseren{' '}
            <Link href="/agb" className="underline hover:text-fc-violet">AGB</Link>{' '}
            und der{' '}
            <Link href="/datenschutz" className="underline hover:text-fc-violet">Datenschutzerklärung</Link>
            zu.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}