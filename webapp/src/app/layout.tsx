import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Toaster } from '@kumpelapp/ui'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'KumpelApp - FC Erzgebirge Aue',
    template: '%s | KumpelApp',
  },
  description: 'Die ultimative Fan-App für den FC Erzgebirge Aue - Spieltag, Tabelle, Kader, News, Tickets, Tippspiel und mehr.',
  keywords: ['FC Erzgebirge Aue', 'Regionalliga Nordost', 'Fußball', 'Fan-App', 'Kumpelverein'],
  authors: [{ name: 'KumpelApp' }],
  creator: 'KumpelApp',
  publisher: 'KumpelApp',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'de_DE',
    url: 'https://kumpelapp.vercel.app',
    siteName: 'KumpelApp',
    title: 'KumpelApp - FC Erzgebirge Aue',
    description: 'Die ultimative Fan-App für den FC Erzgebirge Aue',
    images: [
      {
        url: '/brand/og-image.png',
        width: 1200,
        height: 630,
        alt: 'KumpelApp - FC Erzgebirge Aue',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KumpelApp - FC Erzgebirge Aue',
    description: 'Die ultimative Fan-App für den FC Erzgebirge Aue',
    images: ['/brand/og-image.png'],
  },
  icons: {
    icon: '/brand/favicon.ico',
    shortcut: '/brand/favicon-16x16.png',
    apple: '/brand/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  themeColor: '#5C2D91',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de" className={`${inter.variable} h-full antialiased`} data-theme="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <a href="#main-content" className="skip-link">
          Zum Hauptinhalt springen
        </a>
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  )
}