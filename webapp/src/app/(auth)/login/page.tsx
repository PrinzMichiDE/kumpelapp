import { unstable_noStore } from 'next/cache'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@kumpelapp/ui'
import { LoginForm } from './login-form'

export default function LoginPage() {
  unstable_noStore()

  return (
    <div className="flex min-h-[calc(100vh-12rem)] items-center justify-center px-4 py-10 sm:px-6 sm:py-14">
      <Card className="w-full max-w-md border-fc-border/80 bg-card/95 shadow-lg shadow-black/10">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight text-fc-fg">Anmelden</CardTitle>
          <CardDescription className="text-fc-fg/70">
            Melde dich an, um auf alle Funktionen der KumpelApp zuzugreifen.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  )
}