# Formia — Piattaforma corsi online

Piattaforma per creare, vendere e seguire corsi online. Admin carica corsi
(moduli, lezioni video/testo), i clienti li acquistano con Stripe e li
seguono da un'area riservata con tracciamento dei progressi. Mobile-first.

## Stack

- **Next.js 16** (App Router, Server Actions, TypeScript)
- **Tailwind CSS v4**
- **Prisma** + **PostgreSQL** (pensato per [Neon](https://neon.tech))
- **Auth.js (NextAuth v5)** — login email/password, ruoli `ADMIN` / `CUSTOMER`
- **Stripe Checkout** — pagamento una tantum per corso

## Setup locale

1. Installa le dipendenze:

   ```bash
   npm install
   ```

2. Copia `.env.example` in `.env` e compila le variabili (vedi sotto).

3. Applica lo schema al database e genera il client Prisma:

   ```bash
   npm run db:migrate
   ```

4. Crea l'utente admin e due corsi di esempio:

   ```bash
   npm run db:seed
   ```

5. Avvia il server di sviluppo:

   ```bash
   npm run dev
   ```

   Apri [http://localhost:3000](http://localhost:3000). Accedi come admin
   con le credenziali definite in `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`.

## Variabili d'ambiente

Vedi `.env.example` per l'elenco completo. Le principali:

| Variabile | Descrizione |
| --- | --- |
| `DATABASE_URL` | Connessione Postgres (pooled, per l'app) |
| `DIRECT_URL` | Connessione Postgres diretta (per le migration Prisma) |
| `AUTH_SECRET` | Secret per le sessioni — genera con `openssl rand -base64 33` |
| `NEXTAUTH_URL` | URL pubblico del sito (`http://localhost:3000` in locale) |
| `STRIPE_SECRET_KEY` | Chiave segreta Stripe (`sk_test_...` in sviluppo) |
| `STRIPE_WEBHOOK_SECRET` | Secret del webhook Stripe (`whsec_...`) |
| `NEXT_PUBLIC_APP_URL` | URL pubblico usato nei redirect di Stripe Checkout |

### Neon (Postgres)

Crea un progetto su [neon.tech](https://neon.tech), quindi copia due
connection string dal dashboard:

- quella con `-pooler` nell'host → `DATABASE_URL`
- quella diretta (senza `-pooler`) → `DIRECT_URL` (serve solo alle migration)

## Configurare Stripe

1. Crea un account su [stripe.com](https://stripe.com) (o usa uno esistente)
   e recupera la **chiave segreta di test** da
   Sviluppatori → Chiavi API → `STRIPE_SECRET_KEY`.

2. **Test in locale con Stripe CLI** (consigliato prima del deploy):

   ```bash
   stripe login
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

   Il comando stampa un `whsec_...`: copialo in `STRIPE_WEBHOOK_SECRET`.
   Lascia il comando in esecuzione mentre testi gli acquisti — inoltra gli
   eventi (incluso `checkout.session.completed`) al tuo server locale.

3. **In produzione**, crea l'endpoint webhook dal dashboard Stripe
   (Sviluppatori → Webhook → Aggiungi endpoint):

   - URL: `https://<tuo-dominio>/api/webhooks/stripe`
   - Evento da ascoltare: `checkout.session.completed`
   - Copia il "Signing secret" generato in `STRIPE_WEBHOOK_SECRET` (variabile
     d'ambiente del progetto Vercel)

4. **Carte di test**: usa `4242 4242 4242 4242`, data futura qualsiasi, CVC
   qualsiasi — vedi la [documentazione Stripe](https://docs.stripe.com/testing).

### Come funziona il flusso di pagamento

- L'acquisto crea una `Checkout Session` di Stripe con `price_data` generato
  al volo dal prezzo del corso (nessuna sincronizzazione manuale di prodotti
  su Stripe necessaria).
- Sono abilitati i codici promozionali Stripe (`allow_promotion_codes`).
- Un corso con prezzo `0` salta del tutto Stripe e crea l'iscrizione subito.
- Alla conferma del pagamento, il **webhook** (`/api/webhooks/stripe`) crea
  l'iscrizione (`Enrollment`) in modo idempotente.
- Per evitare che l'utente veda la pagina del corso come "non acquistato"
  se il webhook non è ancora arrivato, la pagina del corso in dashboard
  verifica anche direttamente la sessione Stripe al primo accesso dopo il
  pagamento (parametro `session_id` nell'URL di ritorno).

## Deploy (Vercel + Neon)

1. Push del repository su GitHub (già fatto se stai leggendo questo su
   GitHub).
2. Importa il repository su [vercel.com](https://vercel.com).
3. Aggiungi tutte le variabili d'ambiente di `.env.example` nel progetto
   Vercel (usa le chiavi Stripe **live** solo quando sei pronto a vendere
   davvero).
4. Imposta `NEXTAUTH_URL` e `NEXT_PUBLIC_APP_URL` con il dominio definitivo.
5. Al primo deploy, esegui la migration sul database di produzione:

   ```bash
   npm run db:deploy
   ```

6. Esegui il seed (opzionale, solo per creare il primo utente admin):

   ```bash
   npm run db:seed
   ```

7. Configura il webhook Stripe di produzione come descritto sopra.

## Script disponibili

| Comando | Descrizione |
| --- | --- |
| `npm run dev` | Avvia il server di sviluppo |
| `npm run build` | Build di produzione |
| `npm run lint` | Lint del codice |
| `npm run db:migrate` | Crea/applica una migration in sviluppo |
| `npm run db:deploy` | Applica le migration in produzione |
| `npm run db:seed` | Crea admin + corsi di esempio |
| `npm run db:studio` | Apre Prisma Studio per esplorare il database |

## Struttura del progetto

```
prisma/schema.prisma       Schema database (User, Course, Module, Lesson, Enrollment, Progress)
prisma/seed.ts             Seed: admin + corsi di esempio
src/lib/auth.ts            Configurazione Auth.js (credentials + ruoli)
src/lib/stripe.ts          Client Stripe
src/proxy.ts               Protezione route /admin e /dashboard (ex middleware)
src/app/actions/           Server Actions (auth, corsi, checkout, progressi, utenti)
src/app/(site)/            Sito pubblico: home, catalogo, corso, login, registrazione
src/app/dashboard/         Area cliente: i miei corsi, player lezioni
src/app/admin/             Area admin: dashboard, gestione corsi/moduli/lezioni, utenti
```

## Limiti noti / prossimi passi

- Le immagini dei corsi sono URL esterni incollati dall'admin (nessun upload
  file integrato).
- Le lezioni video richiedono un link embed (YouTube/Vimeo) o un file
  video diretto (`.mp4`); non c'è hosting video integrato.
- Nessun invio email transazionale (conferma registrazione, ricevuta) oltre
  alla ricevuta automatica di Stripe.
