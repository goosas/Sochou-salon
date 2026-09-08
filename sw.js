/* =========================================================
   SOCHOU HAIR BEAUTY SALON - Service Worker (PWA)
   =========================================================
   Gestion du cache :
   - Installation : pre-cache des ressources statiques essentielles.
   - Activation : suppression des anciens caches (mise a jour).
   - Navigation (pages HTML) : la page est laissee au navigateur
     pour eviter de servir un HTML obsoleta pendant une mise a jour.
   - Autres ressources statiques (CSS, JS, images, icones,
     polices, SDK Firebase CDN) : stale-while-revalidate
     (cache si disponible, sinon reseau mis en cache en arriere-plan).
   - Les requetes vers les API Firebase (Firestore, Auth,
     Storage) ne sont JAMAIS interceptees ni mises en cache :
     elles passent toujours par le reseau. Les donnees dynamiques
     continuent donc de venir de Firestore normalement.
*/


const CACHE_VERSION = "sochou-cache-v1.0.5";
const PRECACHE_NAME = CACHE_VERSION + "-static";
const RUNTIME_CACHE_NAME = CACHE_VERSION + "-runtime";

const PRECACHE_URLS = [
  "./",
  "./index.html",
  "./offline.html",
  "./pages/apropos.html",
  "./pages/services.html",
  "./pages/boutique.html",
  "./pages/galerie.html",
  "./pages/contact.html",
  "./pages/admin/login.html",
  "./pages/admin/dashboard.html",

  // Styles
  "./css/style.css",
  "./css/admin.css",
  "./css/pwa.css",

  // Manifest et index des images
  "./manifest.webmanifest",
  "./images-manifest.json",

  // Logo et icones PWA
  "./images/logo/logo.png",
  "./icons/icon-192x192.png",
  "./icons/icon-512x512.png",
  "./icons/icon-maskable-512x512.png",

  // Scripts communs
  "./js/menu.js",
  "./js/site-data.js",
  "./js/site-public.js",
  "./js/boutique.js",
  "./js/image-selector.js",
  "./js/pwa.js",

  // Scripts d'administration
  "./js/admin-login.js",
  "./js/admin.js",

  // Modules Firebase
  "./js/firebase/config.js",
  "./js/firebase/auth.js",
  "./js/firebase/services.js",
  "./js/firebase/galerie.js",
  "./js/firebase/produits.js",
  "./js/firebase/commandes.js",
  "./js/firebase/rendezVous.js",
  "./js/firebase/informations.js",
  "./js/firebase/images.js"
];

/* ---------- Utilitaires ---------- */

function isFirebaseApi(url) {
  const hostname = url.hostname;
  return (
    hostname === "firestore.googleapis.com" ||
    hostname === "identitytoolkit.googleapis.com" ||
    hostname === "securetoken.googleapis.com" ||
    hostname === "firebasestorage.googleapis.com" ||
    hostname.endsWith(".firebaseapp.com") ||
    hostname.endsWith(".firebaseio.com")
  );
}

function isExternalCdn(url) {
  const hostname = url.hostname;
  // Ne pas intercepter les requêtes vers les CDN externes (SDK Firebase, polices Google, etc.)
  return (
    hostname === "www.gstatic.com" ||
    hostname === "fonts.googleapis.com" ||
    hostname === "fonts.gstatic.com" ||
    hostname !== self.location.hostname
  );
}

function isCacheableResponse(response) {
  if (!response) return false;
  return response.status === 200 || response.status === 0;
}

/* ---------- Installation ---------- */
function addAllSafely(cache, urls) {
  return Promise.all(
    urls.map(function (url) {
      return cache.add(url).catch(function (err) {
        console.warn("[SW] Ressource non pre-cachee:", url, err);
      });
    })
  );
}

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(PRECACHE_NAME)
      .then(function (cache) {
        return addAllSafely(cache, PRECACHE_URLS);
      })
      .then(function () {
        return self.skipWaiting();
      })
  );
});

/* ---------- Activation : nettoyage des anciens caches ---------- */
self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys()
      .then(function (keys) {
        return Promise.all(
          keys
            .filter(function (key) {
              return key.indexOf(CACHE_VERSION) !== 0;
            })
            .map(function (key) {
              return caches.delete(key);
            })
        );
      })
      .then(function () {
        return self.clients.claim();
      })
  );
});

/* ---------- Recuperation ---------- */
self.addEventListener("fetch", function (event) {
  const request = event.request;

  // Ne traiter que les requetes GET
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Ne pas intercepter les requetes vers les CDN externes (SDK Firebase, polices Google, etc.)
  if (isExternalCdn(url)) return;

  // Les API Firebase doivent TOUJOURS passer par le reseau.
  if (url.protocol !== "http:" && url.protocol !== "https:") return;
  if (isFirebaseApi(url)) return;

  // Navigation vers les pages HTML : ne pas intercepter
  // Laissez le navigateur gerer les requetes de navigation naturellement
  // Cela evite de bloquer l'accès aux pages en cas d'erreur reseau
  if (request.mode === "navigate") {
    // Ne pas appeler event.respondWith() pour laisser le navigateur gerer la requete
    return;
  }

  // Autres ressources statiques locales : stale-while-revalidate
  event.respondWith(
    caches.match(request).then(function (cached) {
      const fetchPromise = fetch(request)
        .then(function (response) {
          if (isCacheableResponse(response)) {
            const copy = response.clone();
            caches.open(RUNTIME_CACHE_NAME).then(function (cache) {
              cache.put(request, copy);
            });
          }
          return response;
        })
        .catch(function () {
          // Le reseau a echoue : on retourne la version en cache, si elle existe
          return cached;
        });
      return cached || fetchPromise;
    })
  );
});
