# Sync & Datenbetrieb – Runbook (KumpelApp)

> **Ziel:** Datenstörungen (Spielplan/Ergebnisse/Tabelle/Venues/Streams/News) schnell erkennen, eingrenzen, sicher korrigieren und transparent kommunizieren.  
> **Stand:** 2026-11-15 (erweitert für A3/A4/A5)

## 1. Grundregeln
- **Datenwahrheit vor Automatik:** Verifizierte manuelle Korrekturen haben Vorrang vor unsicheren Auto-Daten.
- **Transparenz:** Quelle, Stand, Prüfstatus, Stale-Zustand und manuelle Korrektur müssen sichtbar sein.
- **Nachvollziehbarkeit:** Jede relevante Korrektur mit Kontext dokumentieren (Was, Warum, Quelle/Referenz, Wer, Wann).
- **Keine stillen Fallbacks:** Nutzer/Admins sehen, wenn Daten veraltet/fehlend/nur eingeschränkt verfügbar sind.

## 2. Quellen, Jobs & Verantwortungsbereiche

| Quelle/Job | Inhalt | Typische Trigger | Erwartetes Ergebnis | Beobachtung |
|---|---|---|---|---|
| `openligadb` | Matches, Status, Ergebnisse, Tabelle, (optional Events) | manuell (Admin), zeitgesteuert, spieltagbezogen | Upsert Matches/Standings/Teams/Venues, Logs + Item-Zahlen | `SourceSyncLog`, `/admin/sync`, Kernseiten |
| `away-info` / Venues | Stadion-/Auswärtsinfos, Prüfstatus/Feldinfos | nach Seed/Review/Änderung | Venue-Felder aktualisiert, `fetchedAt`/Review gepflegt | Admin Venues, Auswärtsseiten |
| `streams` | Kuratierte Streamlinks | vor Spieltag, bei Änderung | Links aktuell, tote Links entfernt | Match/Stadionmodus |
| `news` | Kuratierte News-Teaser/Links | regelmäßig/manuell | Neue/aktualisierte Meldungen | News-Seite |
| `squad` / `traditions` / `quiz` | Kader, Chronik, Quizfragen | manuell/versioniert/saisonbezogen | Inhalte konsistent, reviewbar | jeweilige Seiten/Admin |
| `tickets` | Ticketverkauf/Parse-nahe Infos (falls aktiv) | anlassbezogen | Hinweise/Status aktualisiert | Tickets/Admin |

## 3. Health-Checks (täglich & spieltagbezogen)

### 3.1 Täglicher Schnellcheck (5–10 min)
1. `/admin/sync` öffnen: letzte Läufe, Fehler, Dauer, Item-Anzahl, Stale-Badges.
2. Stichprobe Kernseiten: Start, Spielplan, Matchdetail, Tabelle, Auswärts, News.
3. Prüfen: Quelle/Stand sichtbar? Stale/Korrekturhinweise korrekt? Nächste Aue-Spiele plausibel?
4. Bei Fehlern: Fehlerklasse bestimmen (API/Netzwerk/Format/Mapping/DB/Auth) und Playbook starten.

### 3.2 Spieltag-Check
- **T-60 bis T-30:** Kickoff, Ort, Status, Streams, wichtige Hinweise prüfen.
- **Live/Abpfiff:** Ergebnis/Status (und Events falls verfügbar) plausibilisieren.
- **Nach Spiel:** Tabelle/Ergebnis-Stale prüfen, ggf. Resync/Override.

## 4. Stale-Schwellen (Alarmierung/Handlung)

| Quelle | Warnung | Kritisch | Sofortmaßnahme |
|---|---:|---:|---|
| `openligadb` | > 6 h (spieltagrelevant) / > 24 h | > 24 h / Fehlerserie | Resync, API-Status prüfen, kritische Spiele manuell absichern |
| `news`, `streams` | > 24 h | > 72 h | Kurations-/Linkprüfung, manuelle Aktualisierung |
| `away-info`/Venues | > 30 Tage ungeprüft | Saisonstart/Matchday ungeprüft | Review-Pass, Quellen/`fetchedAt` aktualisieren |
| `squad`, `traditions`, `quiz` | > 90 Tage | vor Release/Saison ungeprüft | Review/Faktencheck, Seed-Update |

## 5. Incident-Playbooks

### 5.1 Falsches Ergebnis / falscher Spielstatus
1. **Verifizieren:** OpenLigaDB, fussball.de/Verband, offizielle Vereinsmeldung vergleichen.
2. **Korrigieren:** Admin-Override (Score/Status/Halbzeit/Notiz) setzen.
3. **Absichern:** Resync ausführen, prüfen ob Auto-Daten korrekte Werte halten; Override-/Notizkontext beibehalten.
4. **Folgen prüfen:** Matchdetail, Spielplan, Tabelle, ggf. Tippspiel-Auswertung.
5. **Dokumentieren:** Audit/Incident-Notiz.

### 5.2 Spielverlegung / Absage / Spielortänderung
1. Offizielle Quelle verifizieren (Verein/Verband/Stadion).
2. Kickoff/Status/Venue per Override aktualisieren.
3. `editorNote` sachlich formulieren (inkl. Bezug/Quelle kurz).
4. Stadionmodus, Auswärts-Guide, betroffene Listenansichten prüfen.
5. Push/News nur bei verifizierter Lage.

### 5.3 Sync fehlgeschlagen / API down / Rate-Limit
1. `SourceSyncLog.message`, Dauer, Item-Anzahl und Server-Logs prüfen.
2. Fehlerklasse: Netzwerk, Timeout, Rate-Limit, Auth, Formatänderung, DB, Mapping.
3. Sofort: Retry/Backoff, ggf. nur betroffene Quelle isolieren.
4. Kritische Matchday-Daten manuell pflegen (Override), Stale transparent halten.
5. Bei wiederholtem Fehler: Incident eskalieren, Monitoring/Runbook ergänzen.

### 5.4 Veraltete Daten trotz „erfolgreichem“ Sync
1. Prüfen: richtige Saison/Liga/Shortcut/Zeitraum?
2. Log prüfen: `items=0`, Dauer, partielle Fehlerhinweise.
3. DB-Stichprobe: `updatedAt`, `externalId`, Zuordnungen, Duplikate.
4. Mapping/Saisonparameter korrigieren, gezielten Resync ausführen.
5. Bei Bedarf manuell korrigieren und Ursache dokumentieren.

### 5.5 Venue-/Auswärtsinfo falsch, unvollständig oder ungeprüft
1. Bestehende Feldquellen/`reviewStatus`/`fetchedAt` prüfen.
2. Redaktionell verifizieren (Verein, Stadionseite, OSM, offizielle Hinweise).
3. Nur belegbare, neutrale Informationen speichern; kritische Felder vorsichtig formulieren.
4. `reviewStatus` (`DRAFT`/`CHECKED`), `fetchedAt`, Quellen/Attribution aktualisieren.
5. UI prüfen (Auswärtsdetail, Stadionmodus, Spielbezug).

### 5.6 Toter Stream-Link / falscher Streamhinweis
1. Link vor Spieltag prüfen (Erreichbarkeit, Plattform, Zuordnung).
2. Entfernen/deaktivieren oder ersetzen; Prüfdatum/Quelle hinterlegen.
3. Niemals Vollständigkeit suggerieren; „kein verifizierter Stream bekannt“ zulassen.

## 6. Override-Policy (A4)

### Pflichtangaben (in App/Admin implementiert: `editorNote`, `reason`, `sourceRef`)
- **Was:** Feld(er) + vorher/nachher (fachlich eindeutig; UI zeigt Änderungen, Audit speichert Before/After)
- **Warum (`reason`, Pflicht in Admin):** Verlegung, Korrektur, verifizierte Info
- **Quelle/Referenz (`sourceRef`):** URL, offizielle Meldung, Ansprechpartner/Notiz
- **Wer/Wann:** Bearbeiter + Zeitstempel (`AuditLog`, `SourceSyncLog`, redaktioneller Hinweis in UI über `editorNote`)

### Regeln
- Minimal-invasiv ändern (nur betroffene Felder).
- Override-Status sichtbar machen (`editorNote`/Hinweis/Badge je Kontext).
- Automatische Syncs dürfen verifizierte Korrekturen nicht still überschreiben (technisch/operativ absichern, ggf. Re-Apply).

## 7. Saison-Rollover Kurzablauf (A5)

1. **Vorbereitung:** Neue Saison/Liga/Teams/Venues prüfen, Seeds versionieren.
2. **Ausführung:** Rollover-/Ingest-Skripte ausführen (ideal: Dry-Run + Report).
3. **Review:** Venue-kritische Felder, Traditions-/Quiz-Relevanz, Stream-/News-Quellen neu bewerten.
4. **Smoke-Test:** Start, Spielplan, Tabelle, Matchdetail, Stadionmodus, Auswärts, Admin-Sync.
5. **Go-Live:** Monitoring/Stale-Schwellen aktiv, erste Spieltage eng prüfen.

## 8. Eskalationsstufen

| Stufe | Beispiel | Zielzeit | Maßnahme |
|---|---|---:|---|
| Niedrig | News/Content veraltet, kein Matchday-Bezug | < 24 h | Planmäßige Pflege/Resync |
| Mittel | Stale Daten ohne akuten Spielbezug | < 6 h | Analyse, Resync, ggf. manuelle Ergänzung |
| Hoch | Falsches nächstes Spiel/Kickoff/Ort im Matchday-Fenster | < 30 min | Sofort Override + UI-Hinweis + Verifikation |
| Kritisch | Wiederholte Sync-Ausfälle, Sicherheits-/Datenschutzproblem | sofort | Notfallmaßnahmen, ggf. Anzeige begrenzen, Incident dokumentieren |

## 9. Dokumentationspflicht nach Incident
- Zeitlinie (erkannt, Ursache, Fix, Verifikation)
- Betroffene Entitäten/Seiten/Nutzerwirkung
- Durchgeführte Overrides/Syncs (inkl. `AuditLog`-Einträge, `editorNote`, `reason`, `sourceRef`)
- Prävention (Schwelle, Mapping, Test, Runbook/Source-Matrix-Update)

## 10. Implementierungsstand (App/Betrieb)
- **Admin Sync:** `/admin/sync` mit Laufstatus, Stale-Indikatoren, letzten Logs und nächster Aktion je Quelle.
- **Manuelle Match-Korrekturen:** `/admin/matches` + `PATCH /api/v1/admin/matches/[id]` mit Pflichtgrund, optionaler Quelle/Referenz, Audit- und SourceSyncLog-Eintrag, Tipps-Neuauswertung bei finalem Ergebnis.
- **Sync-Schutz bei Override:** OpenLigaDB-Sync erhält bei gesetztem `editorNote` Kernfelder (Kickoff/Status/Ergebnis/Halbzeit/Venue/Spieltag) und aktualisiert Zuordnung/Metadaten; Events werden in diesem Fall nicht blind überschrieben.
- **Transparenz in UI:** `DataMeta`/Status-Badges auf Kernseiten (u. a. Spielplan, Tabelle, Saison, Matchdetail, Stadionmodus, Auswärts, News, Tradition, Quiz, Kader, Venue-Detail) für Quelle/Stand/Prüfstatus/Fallback/Korrekturhinweise.
