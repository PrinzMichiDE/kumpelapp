import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Datenschutz',
  description: 'Datenschutzhinweise der KumpelApp.',
}

export default function DatenschutzPage() {
  return (
    <main id="main-content" className="flex-1">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-fc-fg">Datenschutzerklärung</h1>
        <div className="mt-6 space-y-6 text-fc-fg/80">
          <p className="text-fc-fg/70">
            Diese Hinweise beschreiben die Verarbeitung personenbezogener Daten in der KumpelApp nach dem Grundsatz der Datenminimierung
            (Privacy by Design). Für den Produktivbetrieb sind verantwortliche Stelle, Rechtsgrundlagen und Auftragsverarbeiter final zu ergänzen.
          </p>

          <section>
            <h2 className="text-xl font-semibold text-fc-fg">1. Verantwortliche Stelle</h2>
            <p className="mt-2">[Name/Organisation, Anschrift, Kontakt, ggf. Datenschutzbeauftragte/r]</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-fc-fg">2. Verarbeitete Daten</h2>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              <li><strong>Account:</strong> E-Mail, Name/Anzeigename, Authentifizierungsdaten (gehasht, sofern Passwort).</li>
              <li><strong>Nutzung/Community:</strong> Tipps, Gruppenmitgliedschaften, Anwesenheitsstatus, Mitfahrangebote/-gesuche (minimale Angaben), Favoriten.</li>
              <li><strong>Tickets (optional):</strong> Hochgeladene PDFs und extrahierte Ticketdaten zur Anzeige/Wallet-Unterstützung; Barcodes/QR nach Möglichkeit lokal/minimal gespeichert.</li>
              <li><strong>Push (opt-in):</strong> Geräte-Token und Benachrichtigungseinstellungen inkl. Ruhezeiten.</li>
              <li><strong>Technisch:</strong> Server-Logs, Sicherheits- und Fehlerdaten im erforderlichen Umfang.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-fc-fg">3. Zwecke und Rechtsgrundlagen</h2>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              <li>Bereitstellung der App-Funktionen und Accounts (Art. 6 Abs. 1 lit. b DSGVO).</li>
              <li>Push-Benachrichtigungen und optionale Funktionen nur mit Einwilligung (Art. 6 Abs. 1 lit. a DSGVO).</li>
              <li>Sicherheit, Missbrauchsvermeidung und Betrieb (Art. 6 Abs. 1 lit. f DSGVO).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-fc-fg">4. Empfänger / Dienste</h2>
            <p className="mt-2">
              Je nach Konfiguration: Hosting/Deployment (z. B. Vercel), Datenbank/Cache, Dateiablage, Push-Dienst (z. B. Firebase Cloud Messaging),
              optionale cookiefreie Reichweitenmessung (z. B. Umami). Mit Auftragsverarbeitern sind AV-Verträge zu schließen.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-fc-fg">5. Speicherdauer & Rechte</h2>
            <p className="mt-2">
              Daten werden nur so lange gespeichert, wie es für die Zwecke erforderlich ist oder gesetzliche Pflichten bestehen.
              Betroffene haben Rechte auf Auskunft, Berichtigung, Löschung, Einschränkung, Datenübertragbarkeit, Widerspruch sowie Widerruf erteilter Einwilligungen.
              In der App sind Export/Löschung (DSGVO) in den Einstellungen vorzusehen.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-fc-fg">6. Standort & Community</h2>
            <p className="mt-2">
              Kein öffentlicher Echtzeit-Standortzwang. Check-ins/Mitfahrten erfolgen datensparsam und nur mit den von Nutzer:innen aktiv angegebenen Informationen.
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
