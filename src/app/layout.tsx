import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Formia — Corsi online che fanno crescere le tue competenze",
    template: "%s — Formia",
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
        <Toaster theme="dark" richColors position="top-center" />
      </body>
    </html>
  );
}
