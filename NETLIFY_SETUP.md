# Netlify PostgreSQL Setup für KumpelApp

## 1. Netlify PostgreSQL erstellen

```bash
# Netlify CLI installieren
npm install -g netlify-cli

# Einloggen
netlify login

# PostgreSQL Datenbank erstellen
netlify addons:create postgres
```

## 2. Umgebungsvariablen konfigurieren

In Netlify Dashboard → Site settings → Environment variables:

```bash
# Database (wird automatisch von Netlify gesetzt)
DATABASE_URL = postgresql://user:pass@host:5432/db

# Auth
BETTER_AUTH_SECRET = "dein-super-sicherer-secret-key-min-32-chars"
BETTER_AUTH_URL = "https://deine-app.netlify.app"

# Liga
LEAGUE_PROVIDER = "openligadb"
OPENLIGADB_LEAGUE_SHORTCUT = "rlno"
SEASON = "2026/2027"

# Redis (Upstash empfohlen)
UPSTASH_REDIS_REST_URL = "https://..."
UPSTASH_REDIS_REST_TOKEN = "..."

# Storage (Vercel Blob oder Alternative)
BLOB_READ_WRITE_TOKEN = "vercel_blob_token..."

# Firebase (für Push)
FIREBASE_PROJECT_ID = "kumpelapp-fcaue"
FIREBASE_CLIENT_EMAIL = "firebase-adminsdk@kumpelapp-fcaue.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY = "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
NEXT_PUBLIC_FIREBASE_API_KEY = "..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = "kumpelapp-fcaue.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID = "kumpelapp-fcaue"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = "kumpelapp-fcaue.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = "..."
NEXT_PUBLIC_FIREBASE_APP_ID = "..."
NEXT_PUBLIC_FIREBASE_VAPID_KEY = "..."

# App
NEXT_PUBLIC_APP_URL = "https://deine-app.netlify.app"
NEXT_PUBLIC_UMAMI_URL = "https://analytics.deine-domain.de"
NEXT_PUBLIC_UMAMI_SITE_ID = "..."
```

## 3. Datenbank migrieren

```bash
# Lokal testen
pnpm db:migrate deploy

# Oder via Script
pnpm tsx tooling/scripts/setup-netlify-db.ts
```

## 4. Build & Deploy

```bash
# Build testen
pnpm build

# Deploy zu Netlify
netlify deploy --prod --dir=webapp/.next
```

## 4. Edge Functions aktivieren

In `netlify.toml` ist bereits konfiguriert:
- `/api/v1/sync/bootstrap` → Edge Function für schnelles Caching
- KV Storage für 1h Caching der Sync-Bundles

## 5. Umgebungsvariablen in Netlify UI setzen

Gehe zu: **Site settings → Environment variables**

Füge alle Variablen aus Schritt 2 hinzu.

Wichtige Hinweise:
- `BETTER_AUTH_SECRET`: Mindestens 32 Zeichen, zufällig generieren
- `FIREBASE_PRIVATE_KEY`: Mit `\n` für Zeilenumbrüche escapen
- `DATABASE_URL`: Wird von Netlify automatisch gesetzt nach `netlify addons:create postgres`

## 6. Netlify PostgreSQL Add-on verwalten

```bash
# Verbindung testen
netlify postgres:connect

# Backup erstellen
netlify postgres:backup

# Logs ansehen
netlify postgres:logs
```

## 6. Domains konfigurieren

In Netlify Dashboard → Domain management:
- Custom domain hinzufügen (z.B. `kumpelapp.de`)
- DNS konfigurieren (Netlify Nameserver oder CNAME)
- HTTPS erzwingen (automatisch bei Netlify)

## 7. Monitoring & Analytics

- Netlify Analytics aktivieren (Dashboard → Analytics)
- Umami Analytics: `NEXT_PUBLIC_UMAMI_URL` + `NEXT_PUBLIC_UMAMI_SITE_ID`
- Error tracking: Sentry DSN als `SENTRY_DSN` hinzufügen (optional)

## 7. Troubleshooting

### Build schlägt fehl
```bash
# Cache leeren
netlify build --clear-cache

# Lokale Build testen
pnpm build --filter=webapp
```

### Datenbankverbindung fehlschlägt
- Prüfe `DATABASE_URL` in Netlify Env Vars
- SSL mode: `?sslmode=require` anhängen falls nötig
- IP-Allowlist prüfen (Netlify IPs erlauben)

### Edge Functions funktionieren nicht
- Prüfe `netlify.toml` → `[functions.edge]`
- KV Storage muss in Netlify UI aktiviert sein

## 8. Nützliche Befehle

```bash
# Lokale Entwicklung mit Netlify
netlify dev

# Logs ansehen
netlify logs

# Funktionen testen
netlify functions:invoke api --payload '{"path":"/api/v1/teams"}'

# Datenbank Shell
netlify postgres:connect
```