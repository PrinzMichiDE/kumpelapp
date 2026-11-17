import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Barrierefreiheitserklärung',
  description: 'Informationen zur Barrierefreiheit der KumpelApp.',
}

export default function BarrierefreiheitPage() {
  return (
    <main id="main-content" className="flex-1">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-fc-fg">Barrierefreiheitserklärung</h1>
        <div className="mt-6 space-y-6 text-fc-fg/80">
          <p>
            Die KumpelApp soll für möglichst viele Fans nutzbar sein. Wir orientieren uns an den WCAG-Grundsätzen (wahrnehmbar, bedienbar, verständlich, robust)
            und verbessern die Barrierefreiheit kontinuierlich.
          </p>
          <section>
            <h2 className="text-xl font-semibold text-fc-fg">Maßnahmen</h2>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              <li>Semantische Struktur, Sprunglink zum Hauptinhalt, sichtbare Fokuszustände und große Touch-Targets.</li>
              <li>Dark-First-Design mit kontrastreicher Typografie; High-Contrast-Option in den Einstellungen (in Ausbau).</li>
              <li>Keine Information ausschließlich über Farbe; klare Beschriftungen und Screenreader-Hinweise wo nötig.</li>
              <li>Mobile Optimierung und robuste Darstellung auf Mittelklasse-Geräten.</li>
            </ul>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-fc-fg">Bekannte Einschränkungen</h2>
            <p className="mt-2">
              Einzelne Inhalte externer Quellen (z. B. verlinkte PDFs, eingebettete Drittangebote) liegen außerhalb unseres Einflussbereichs.
              Für Stadionbesuche siehe auch <Link href="/fans/barrierefreiheit" className="text-fc-violet hover:underline">Team Barrierefrei / Stadioninfos</Link>.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-fc-fg">Feedback & Kontakt</h2>
            <p className="mt-2">
              Barrieren können über die Kontaktwege im Impressum oder in den Profileinstellungen gemeldet werden. Wir priorisieren gemeldete Hürden bei der Weiterentwicklung.
            </p>
          </section>
          <p className="text-sm text-fc-fg/55">Stand: 2026-11-12 (in Überarbeitung für produktiven Launch).</p>
        </div>
      </div>
    </main>
  )
}
