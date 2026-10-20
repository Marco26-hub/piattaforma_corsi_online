/**
 * Pagine legali: la piattaforma corsi e' gestita dalla stessa impresa del sito
 * principale, quindi punta alle informative gia' pubblicate li'.
 * Sostituisci gli URL se in futuro le informative vivranno su questo dominio.
 */
const LEGAL_BASE = process.env.NEXT_PUBLIC_LEGAL_BASE_URL ?? "https://www.socialautomation.app";

export const LEGAL_LINKS = {
  privacy: `${LEGAL_BASE}/privacy`,
  termini: `${LEGAL_BASE}/termini`,
  cookie: `${LEGAL_BASE}/cookie-policy`,
  recesso: `${LEGAL_BASE}/recesso`,
};

export const COMPANY = {
  name: "Social Web Automation di Marco Dibenedetto",
  vat: "03786790133",
  address: "Via Giuseppe Verdi 2B, 22072 Cermenate (CO)",
};
