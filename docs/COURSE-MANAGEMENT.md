# Gestione corsi

La gestione comprende ricerca, categoria, stato, ordinamento e pagine da 20 corsi; modifica dei dettagli, moduli e lezioni; riordino; anteprima riservata agli amministratori; duplicazione e archivio reversibile.

## Regole

- I nuovi corsi e le copie sono sempre bozze. Una copia comprende il programma, mai iscritti o avanzamento.
- Pubblicare richiede titolo, descrizione e almeno una lezione completa. Sono supportati testo, YouTube, Vimeo e collegamenti HTTPS a file video.
- Cambiare il titolo non cambia il collegamento pubblico esistente.
- Archiviare nasconde il corso dal catalogo senza revocare gli accessi. Ripristinare lo riporta in bozza.
- Moduli e lezioni con uno storico di iscrizioni non possono essere eliminati. I contenuti restano modificabili.
- Un corso pubblicato non puo perdere la sua ultima lezione: occorre prima ritirarlo dal catalogo.
- Le operazioni sul programma sono serializzate sul corso e verificano l'appartenenza di ogni modulo e lezione.

## Pubblicazione

Prima di distribuire questo codice, verificare il database di destinazione, fare un backup e applicare le migrazioni con `npm run db:deploy`. La migrazione `20261020140000_course_archive` aggiunge soltanto `courses.archivedAt`, senza eliminare dati. Sono necessarie anche tutte le migrazioni precedenti.

Non utilizzare il database locale di test o gli account dimostrativi in produzione. Una distribuzione Vercel pronta non dimostra che il database sia configurato o che l'accesso funzioni.

## Verifiche

`npm test` verifica filtri, video e validazione della pubblicazione. `npm run test:integration`, con un database locale esplicitamente dedicato ai test, verifica anche archivio, duplicazione, conservazione degli iscritti e dell'avanzamento, appartenenza dei contenuti, riordino e operazioni concorrenti.
