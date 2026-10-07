import { redirect } from "next/navigation";

// Public discovery lives in SWA, not in a second demo storefront.
export default function AcademyHomePage() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) {
    return <main className="container-app py-12"><h1>SWA Academy</h1><p>Il collegamento al catalogo SWA deve essere configurato.</p></main>;
  }
  const origin = new URL(appUrl);
  if (!["https:", "http:"].includes(origin.protocol)) throw new Error("URL pubblico Academy non valido");
  redirect(new URL("/corsi", origin.origin).toString());
}
