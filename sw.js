const CACHE_NAME = "emil-cache-v2";
const urlsToCache = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./manifest.json",
  "./assets/flag-de.png",
  "./assets/flag-en.png",
  "./assets/banner.png",
  "./assets/aixbrain_logo.jfif",
  "./assets/wzl_logo.png",
  "./assets/page_background.png",
  "./assets/EMO-AI-Hub_Maskottchen_Emil_Flaggen.svg",
  "./assets/EMO-AI-Hub_Maskottchen_Emil_Warten.svg",
  "./assets/EMO-AI-Hub_Maskottchen_Emil_Winken.svg",
  "./assets/EMO-AI-Hub_Maskottchen_Emil_Denken.svg",
  "./assets/EMO-AI-Hub_Maskottchen_Emil_Idee.svg",
  "./assets/EMO-AI-Hub_Maskottchen_Emil_Suche.svg",
  "./assets/EMO-AI-Hub_Maskottchen_Emil_404.svg",
  "./assets/sigmoid_gradient.png",
  "./assets/page_background.png",
  "./assets/icon-192.png",
  "./assets/icon-512.png"
  
];

self.addEventListener("install", (e) => {
    e.waitUntil(
      caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
    );
  });
  
  self.addEventListener("activate", (e) => {
    e.waitUntil(
      caches.keys().then(keys =>
        Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
      ).then(() => self.clients.claim())
    );
  });
  
  self.addEventListener("fetch", (event) => {
    // Let non-GET (e.g., POST to your chat API) go to the network unmodified
    if (event.request.method !== "GET") return;
  
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;               // offline-first
        return fetch(event.request).catch(() =>  // network fallback
          event.request.mode === "navigate" ? caches.match("./index.html") : undefined
        );
      })
    );
  });