/* =========================================================
   SOCHOU HAIR BEAUTY SALON - PWA
   =========================================================
   Enregistre le Service Worker, affiche le bouton
   "Installer l'application" quand l'installation est
   disponible, et gere le bandeau hors-ligne.
   ========================================================= */
(function (window) {
  "use strict";

  var INSTALLED =
    window.matchMedia && window.matchMedia("(display-mode: standalone)").matches;

  /* ---------- 1. Enregistrement du Service Worker ---------- */
  function registerServiceWorker() {
    if (!("serviceWorker" in navigator)) return;

    var manifestLink = document.querySelector('link[rel="manifest"]');
    if (!manifestLink) return;

    // Le manifest est a la racine du site; le Service Worker est a cote.
    var manifestURL = new URL(manifestLink.href);
    var swURL = new URL("sw.js", manifestURL);

    navigator.serviceWorker.register(swURL)
      .catch(function (err) {
        console.warn("Echec de l'enregistrement du Service Worker:", err);
      });
  }

  /* ---------- 2. Bandeau hors-ligne ---------- */
  var offlineBanner = null;

  function ensureBanner() {
    if (offlineBanner) return;
    offlineBanner = document.createElement("div");
    offlineBanner.className = "pwa-offline-banner";
    offlineBanner.setAttribute("role", "status");
    offlineBanner.innerHTML =
      '<span class="pwa-offline-dot" aria-hidden="true"></span>' +
      "<span>Connexion Internet indisponible. Certaines informations peuvent ne pas être à jour.</span>";
    document.body.appendChild(offlineBanner);
  }

  function updateOfflineStatus() {
    if (navigator.onLine === false) {
      ensureBanner();
      offlineBanner.classList.add("is-visible");
    } else {
      if (offlineBanner) {
        offlineBanner.classList.remove("is-visible");
      }
    }
  }

  /* ---------- 3. Bouton d'installation ---------- */
  var deferredPrompt = null;
  var installButton = null;

  function canShowInstall() {
    // Jamais sur les pages d'administration, ni dans une app deja installee.
    var isAdmin = document.body && document.body.classList.contains("admin-body");
    return !isAdmin && !INSTALLED && !installButton;
  }

  function createInstallButton() {
    if (!canShowInstall() || !deferredPrompt) return;

    installButton = document.createElement("button");
    installButton.type = "button";
    installButton.className = "pwa-install-btn";
    installButton.setAttribute("aria-label", "Installer l'application SOCHOU Salon");
    installButton.innerHTML =
      '<svg class="pwa-install-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>' +
      '<polyline points="7 10 12 15 17 10"/>' +
      '<line x1="12" y1="15" x2="12" y2="3"/>' +
      "</svg>" +
      "<span>Installer l'application</span>";
    document.body.appendChild(installButton);

    installButton.addEventListener("click", function (event) {
      event.preventDefault();
      if (!deferredPrompt) return;

      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(function (choice) {
        if (choice.outcome === "accepted") {
          hideInstallButton(true);
        }
        deferredPrompt = null;
      }).catch(function () {
        deferredPrompt = null;
      });
    });
  }

  function hideInstallButton(installed) {
    if (installButton) {
      installButton.classList.add("is-hidden");
      setTimeout(function () {
        if (installButton && installButton.parentNode) {
          installButton.parentNode.removeChild(installButton);
        }
        installButton = null;
      }, 250);
    }
    if (installed) INSTALLED = true;
  }

  window.addEventListener("beforeinstallprompt", function (event) {
    event.preventDefault();
    deferredPrompt = event;
    createInstallButton();
  });

  window.addEventListener("appinstalled", function () {
    hideInstallButton(true);
  });

  if (window.matchMedia && window.matchMedia.addEventListener) {
    window.matchMedia("(display-mode: standalone)").addEventListener("change", function (e) {
      if (e.matches) hideInstallButton(true);
    });
  }

  /* ---------- 4. Initialisation ---------- */
  function init() {
    registerServiceWorker();
    updateOfflineStatus();

    window.addEventListener("online", updateOfflineStatus);
    window.addEventListener("offline", updateOfflineStatus);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(window);
