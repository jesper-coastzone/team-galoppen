/* sw.js — minimal service worker. Gør appen installerbar (PWA) uden at cache/forstyrre realtime.
   Vi laver bevidst INGEN offline-cache: et live event kræver netværk, og vi vil aldrig
   servere en forældet version midt i et spil. */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', () => { /* netværks-passthrough */ });
