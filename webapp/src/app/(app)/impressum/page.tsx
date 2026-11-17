import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Impressum',
  description: 'Impressum der KumpelApp.',
}

export default function ImpressumPage() {
  return (
    <main id="main-content" className="flex-1">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-fc-fg">Impressum</h1>
        <div className="prose prose-invert mt-6 max-w-none text-fc-fg/80">
          <p className="text-fc-fg/70">
            Angaben gemäß § 5 DDG. Diese Seite ist als Platzhalter für die produktive Veröffentlichung zu vervollständigen.
          </p>
          <h2 className="text-xl font-semibold text-fc-fg mt-6">Betreiber / Verantwortlich für den Inhalt</h2>
          <p>
            KumpelApp (Projekt)<br />
            [Name / Organisation]<br />
            [Anschrift]<br />
            [PLZ Ort]<br />
            Deutschland
          </p>
          <h2 className="text-xl font-semibold text-fc-fg mt-6">Kontakt</h2>
          <p>
            E-Mail: [kontakt@beispiel.de]<br />
            Telefon: [optional]
          </p>
          <h2 className="text-xl font-semibold text-fc-fg mt-6">Haftungshinweis</h2>
          <p>
            Die KumpelApp ist ein inoffizielles Fanprojekt und steht in keiner offiziellen Verbindung zum FC Erzgebirge Aue e.V.,
            sofern nicht ausdrücklich anders angegeben. Inhalte externer Links liegen in der Verantwortung der jeweiligen Betreiber.
            Für Spiel- und Vereinsdaten werden externe Quellen genutzt; trotz sorgfältiger Prüfung kann keine Gewähr für Vollständigkeit,
            Richtigkeit und Aktualität übernommen werden.
          </p>
          <h2 className="text-xl font-semibold text-fc-fg mt-6">Markenhinweis</h2>
          <p>
            Genannte Vereinsnamen, Marken und Logos sind Eigentum der jeweiligen Rechteinhaber. Eine Verwendung in der produktiven App
            erfolgt nur mit entsprechender Freigabe bzw. in zulässigem Rahmen.
          </p>
        </div>
      </div>
    </main>
  )
}
