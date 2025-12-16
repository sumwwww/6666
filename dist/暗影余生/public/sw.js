/**
 * public/sw.js
 * Minimal no-op service worker placeholder for offline capability.
 * Can be extended to cache assets for full PWA support.
 */

self.addEventListener('install', (event) => {
  // Skip waiting to activate immediately.
  // @ts-ignore
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  // @ts-ignore
  self.clients.claim()
})

// Basic fetch passthrough; can be turned into cache-first strategy if needed.
self.addEventListener('fetch', () => {
  // Intentionally left blank for now.
})
