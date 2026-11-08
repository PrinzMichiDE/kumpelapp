import type { ReactNode } from 'react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { OfflineBanner } from '@/components/offline-banner'

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <OfflineBanner />
      <Header />
      <div className="flex-1">{children}</div>
      <Footer />
    </>
  )
}
