"use client";

import { useEffect } from "react";

// Registers the service worker for PWA install + offline app-shell caching.
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      process.env.NODE_ENV === "production"
    ) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // registration failure is non-fatal
      });
    }
  }, []);

  return null;
}
