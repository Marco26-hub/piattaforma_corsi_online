import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "SWA Academy — Corsi online e competenze digitali",
    template: "%s — SWA Academy",
  },
  description:
    "Piattaforma di corsi online: guarda le lezioni, tieni traccia dei progressi e impara al tuo ritmo, da qualsiasi dispositivo.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
        <Toaster theme="system" richColors position="top-center" />
      </body>
    </html>
  );
}
