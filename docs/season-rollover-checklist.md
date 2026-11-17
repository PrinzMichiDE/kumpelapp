# Saison-Rollover-Checkliste (KumpelApp, RLNO)

> **Zweck:** Saisonwechsel reproduzierbar, nachvollziehbar und ohne Dateninkonsistenzen durchführen.  
> **Gilt für:** Ligazugehörigkeit, Teams/Gegner, Venues, Seeds, Sync-Konfiguration, Review-Status, Inhalte und Go-Live-Checks.

## 0. Rahmen & Rollen
- [ ] Saison identifiziert (z. B. `2026/27`) und Zeitfenster definiert
- [ ] Verantwortliche benannt: Betrieb/Sync, Redaktion/Venues, Content/Tradition/Quiz, QA/Release
- [ ] Freeze-/Kommunikationsfenster für kritische Änderungen festgelegt
- [ ] Backup/Restore-Pfad für relevante Datenstände geklärt (DB + Seeds + Doku)

## 1. Vorbereitung (Datenmodell & Seeds)

### 1.1 Liga/Saison
- [ ] Neue `Season` und `League` (Shortcut/Tier) angelegt oder korrekt aktiviert
- [ ] `isCurrent`-Flags geprüft (nur eine aktuelle Saison je Kontext)
- [ ] OpenLigaDB-/Quellparameter für neue Saison verifiziert (Shortcut/Jahr/Endpoints)

### 1.2 Teams & Zuordnungen
- [ ] Teilnehmerfeld der RLNO-Saison vollständig erfasst (inkl. Auf-/Absteiger, U23-Teams falls relevant)
- [ ] Team-Mappings/Slugs/`externalId`s geprüft (keine Dubletten, korrekte Zuordnung)
- [ ] Aue-`isOwn`/Team-Hierarchien konsistent

### 1.3 Venues & Auswärtsbasis
- [ ] `tooling/seed-data/venues-rlno-2026-27.json` (bzw. saisonrelevante Datei) aktualisiert/versioniert
- [ ] Venue-Slugs, Adressen, Städte, Koordinaten, Basisfelder geprüft
- [ ] `reviewStatus`, `fetchedAt`, `source`, `attribution`, `fieldSources` je Venue sinnvoll gesetzt
- [ ] Kritische Felder (Gästeblock, Einlass, Parken, ÖPNV, Barriere) für Saisonstart priorisiert

### 1.4 Content-Seeds
- [ ] `tradition-timeline.json` auf saisonrelevante Updates geprüft (z. B. Neuanfang/Meilensteine)
- [ ] `quiz-veilchen.json` auf Aktualität/Fakten/Duplikate geprüft
- [ ] News/Streams-Quellenliste und Kurationsregeln für neue Saison geprüft

## 2. Technische Ausführung

### 2.1 Skripte / Ingest (mit Protokoll)
- [ ] `pnpm tsx tooling/scripts/season-rollover.ts <startYear> <endYear> [label]` (oder projektäquivalentes Script) ausgeführt; JSON-Report archiviert
- [ ] `pnpm ingest:venues` ausgeführt
- [ ] `pnpm ingest:away-info` (falls vorhanden/relevant) ausgeführt
- [ ] `pnpm ingest:traditions` ausgeführt
- [ ] `pnpm ingest:quiz` ausgeführt
- [ ] Weitere relevante Ingests ausgeführt (`squad`, `news`, `streams`, `tickets`) sofern vorgesehen
- [ ] Laufprotokolle/Ergebnisse dokumentiert (Datum, Dauer, Items, Fehler, `SourceSyncLog`)

### 2.2 Sync & Datenstand
- [ ] OpenLigaDB-Sync für neue Saison erfolgreich (Matches/Standings plausibel)
- [ ] `SourceSyncLog` geprüft (keine stillen Teilfehler)
- [ ] Stale-/Health-Indikatoren im Admin sichtbar und plausibel

## 3. Redaktionelle Verifikation (vor Go-Live)

### 3.1 Matchday-Kern
- [ ] Nächstes Aue-Spiel korrekt (Kickoff lokal, Gegner, Heim/Auswärts, Venue, Status)
- [ ] Spielplan/Stichtag plausibel gegen Referenzquelle
- [ ] Tabelle initial plausibel (oder bewusst leer + transparenter Hinweis)

### 3.2 Auswärts/Venues
- [ ] Alle spielrelevanten Venues der Saison erreichbar (Liste/Detail)
- [ ] Review-Status/Fetched-Datum für kritische Venues gesetzt
- [ ] Keine ungeprüften Behauptungen in kritischen Hinweisen

### 3.3 Transparenz & Capabilities
- [ ] Quelle/Stand/Prüfstatus auf Kernseiten sichtbar (Start/Stadionmodus/Spielplan/Match/Tabelle/Auswärts/News je nach Datenlage)
- [ ] Ehrliche Live-Capability (Events vs Ergebnis-only vs keine Live-Daten)
- [ ] Offline-Fallbacks für Kernrouten geprüft

### 3.4 Overrides & Audit
- [ ] Test-Override (Kickoff/Status/Ergebnis/Venue-Hinweis) durchgeführt und zurückgenommen/dokumentiert
- [ ] Audit-/Notiz-Kontext nachvollziehbar

## 4. Go-Live & Nachbereitung

### 4.1 Smoke-Test (Minimum)
- [ ] Startseite / Matchday-Hub
- [ ] Stadionmodus
- [ ] Spielplan (Filter)
- [ ] Matchdetail
- [ ] Tabelle
- [ ] Auswärts (Liste + Detail)
- [ ] News (Quelle/Stand)
- [ ] Admin Sync (Health/Logs/Trigger)

### 4.2 Monitoring nach Go-Live (erste 7–14 Tage / erste Spieltage)
- [ ] Tägliche Sync-Health-Prüfung
- [ ] Spieltagnahe Verifikation (T-60/T-30, Abpfiff, Folgetag)
- [ ] Incident- und Override-Log geführt
- [ ] Learnings in Runbook/Source-Matrix zurückgespielt

## 5. Abnahme
- [ ] Fachliche Abnahme (Daten/Betrieb/Redaktion)
- [ ] Technische Abnahme (Sync/Logs/UI/Fehlerfälle)
- [ ] Rest-Risiken dokumentiert (z. B. fehlende Event-Coverage, ungeprüfte Venues)

> **Definition „rollover ready“:** Neue Saison aktiv, Kernquellen synchronisiert, kritische Venues geprüft, Transparenz/Override-Fähigkeit verifiziert, Smoke-Tests bestanden.
