import Link from 'next/link'
import { Facebook, Instagram, Youtube, Twitter, Mail } from 'lucide-react'

const footerLinks = {
  app: [
    { name: 'Spieltag', href: '/spielplan' },
    { name: 'Tabelle', href: '/tabelle' },
    { name: 'Kader', href: '/kader' },
    { name: 'News', href: '/news' },
    { name: 'Auswärts', href: '/auswaerts' },
    { name: 'Verein', href: '/verein' },
    { name: 'Tradition', href: '/tradition' },
    { name: 'Fans', href: '/fans' },
  ],
  kumpels: [
    { name: 'Tippspiel', href: '/tippspiel' },
    { name: 'Gruppen', href: '/kumpels' },
    { name: 'Mitfahrbörse', href: '/kumpels/mitfahrten' },
    { name: 'Spieler des Spiels', href: '/tippspiel/mvp' },
  ],
  verein: [
    { name: 'Offizielle Website', href: 'https://www.fc-erzgebirge.de', external: true },
    { name: 'Tickets', href: 'https://customer59.ticketing.cloud.sap/shop?shopid=103', external: true },
    { name: 'Fanshop', href: 'https://www.fc-erzgebirge.shop', external: true },
    { name: 'Mitglied werden', href: '/verein/mitgliedschaft' },
    { name: 'Fanbeauftragter', href: '/fans/fanbeauftragter' },
    { name: 'Fanprojekt', href: '/fans/fanprojekt' },
    { name: 'Barrierefreiheit', href: '/fans/barrierefreiheit' },
  ],
  legal: [
    { name: 'Impressum', href: '/impressum' },
    { name: 'Datenschutz', href: '/datenschutz' },
    { name: 'AGB', href: '/agb' },
    { name: 'Quellen & Lizenzen', href: '/quellen' },
    { name: 'Barrierefreiheitserklärung', href: '/barrierefreiheit' },
  ],
}

const socialLinks = [
  { name: 'Facebook', href: 'https://www.facebook.com/FCErzgebirgeAue/', icon: Facebook },
  { name: 'Instagram', href: 'https://www.instagram.com/fcerzgebirgeaue/', icon: Instagram },
  { name: 'YouTube', href: 'https://www.youtube.com/channel/UChnv2SceLVgWU-mRoOVGKSA', icon: Youtube },
  { name: 'Twitter/X', href: 'https://twitter.com/FCErzgebirgeAue', icon: Twitter },
]

const focusRing =
  'rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-surface'

export function Footer() {
  return (
    <footer className="border-t border-fc-border/80 bg-fc-surface" role="contentinfo">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 md:grid-cols-5">
          <div className="col-span-2 md:col-span-1">
            <Link
              href="/"
              className={`group mb-4 inline-flex items-center gap-2.5 ${focusRing}`}
              aria-label="KumpelApp Startseite"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-fc-violet/12 ring-1 ring-fc-violet/25 transition-colors group-hover:bg-fc-violet/20">
                <svg className="h-5 w-5 text-fc-violet" viewBox="0 0 100 100" fill="none" aria-hidden="true">
                  <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="5" />
                  <path d="M50 22 L50 78 M22 50 L78 50" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                </svg>
              </span>
              <span className="text-lg font-bold tracking-tight text-fc-fg">KumpelApp</span>
            </Link>
            <p className="mb-5 max-w-xs text-sm leading-relaxed text-fc-fg/65">
              Die ultimative Fan-App für den FC Erzgebirge Aue. Vom Spieltag bis zur Tradition – alles an einem Ort.
            </p>
            <div className="flex flex-wrap gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex h-10 w-10 items-center justify-center rounded-lg border border-fc-border/70 bg-fc-bg/40 text-fc-fg/65 transition-[color,background-color,border-color,transform] duration-200 hover:border-fc-violet/35 hover:bg-fc-violet/10 hover:text-fc-violet active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-surface`}
                  aria-label={`${social.name} (öffnet in neuem Tab)`}
                >
                  <social.icon className="h-5 w-5" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          <nav aria-label="App Navigation">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-fc-fg/90">App</h3>
            <ul className="space-y-2.5">
              {footerLinks.app.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className={`inline-flex text-sm text-fc-fg/70 transition-colors duration-200 hover:text-fc-violet ${focusRing}`}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Kumpels & Tippspiel">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-fc-fg/90">Kumpels</h3>
            <ul className="space-y-2.5">
              {footerLinks.kumpels.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className={`inline-flex text-sm text-fc-fg/70 transition-colors duration-200 hover:text-fc-violet ${focusRing}`}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Verein & Offizielles">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-fc-fg/90">Verein</h3>
            <ul className="space-y-2.5">
              {footerLinks.verein.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    target={link.external ? '_blank' : undefined}
                    rel={link.external ? 'noopener noreferrer' : undefined}
                    className={`inline-flex items-center gap-1.5 text-sm text-fc-fg/70 transition-colors duration-200 hover:text-fc-violet ${focusRing}`}
                  >
                    <span>{link.name}</span>
                    {link.external && (
                      <svg
                        className="h-3.5 w-3.5 shrink-0 opacity-70"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        aria-hidden="true"
                      >
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Rechtliches">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-fc-fg/90">Rechtliches</h3>
            <ul className="space-y-2.5">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className={`inline-flex text-sm text-fc-fg/70 transition-colors duration-200 hover:text-fc-violet ${focusRing}`}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-12 border-t border-fc-border/80 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
            <p className="text-sm leading-relaxed text-fc-fg/55">
              © {new Date().getFullYear()} KumpelApp. Nicht offiziell mit dem FC Erzgebirge Aue e.V. verbunden.
            </p>
            <p className="max-w-2xl text-sm leading-relaxed text-fc-fg/55">
              Datenquellen: OpenLigaDB, fc-erzgebirge.de, fussball.de, Open-Meteo, OpenStreetMap, Wikidata
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}