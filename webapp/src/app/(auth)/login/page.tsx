import { unstable_noStore } from 'next/cache'
import { LoginForm } from './login-form'

export default function LoginPage() {
  unstable_noStore()
  
  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-fc-fg">Anmelden</h1>
          <p className="mt-2 text-fc-fg/70">Melde dich an, um auf alle Funktionen zuzugreifen</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}