"use client";

import { useEffect, useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";

function subscribe(listener: () => void) {
  window.addEventListener('swa-theme-change', listener);
  return () => window.removeEventListener('swa-theme-change', listener);
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe,
    () => document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light',
    () => 'light');
  useEffect(() => {
    let saved: "light" | "dark" = "light";
    try { saved = localStorage.getItem('swa-theme') === 'dark' ? 'dark' : 'light'; } catch { /* Storage can be blocked. */ }
    document.documentElement.dataset.theme = saved;
    document.documentElement.style.colorScheme = saved;
    window.dispatchEvent(new CustomEvent('swa-theme-change', { detail: saved }));
  }, []);
  return <button type="button" className="flex size-9 items-center justify-center rounded-md border border-border-subtle"
    aria-label={theme === 'dark' ? 'Usa sfondo chiaro' : 'Usa sfondo notte'}
    onClick={() => {
      const next = theme === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      document.documentElement.style.colorScheme = next;
      try { localStorage.setItem('swa-theme', next); } catch { /* Theme still works without storage. */ }
      window.dispatchEvent(new CustomEvent('swa-theme-change', {detail: next}));
    }}>
    {theme === 'dark' ? <Sun className="size-4" aria-hidden="true" /> : <Moon className="size-4" aria-hidden="true" />}
  </button>;
}
