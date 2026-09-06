/* =========================================================
   SOCHOU HAIR BEAUTY SALON - Couche de données partagée
   Mini-base locale (localStorage) utilisée par le site et
   par la page administrateur (administrateur.html).
   ========================================================= */
(function (window) {
  "use strict";

  var STORE = {
    products: "sochou_products",
    services: "sochou_services",
    orders: "sochou_orders",
    appointments: "sochou_appointments",
    settings: "sochou_settings",
    client: "sochou_client_profile"
  };

    var ADMIN_CODE = "2580";

  var CATEGORIES = [
    { key: "cosmetiques", label: "Produits cosmétiques" },
    { key: "meches", label: "Mèches" },
    { key: "perruques", label: "Perruques" },
    { key: "outils", label: "Outils d'esthétique" }
  ];

  var PRODUCT_IMAGES = [
    "images/produits/huile de coco.jpeg",
    "images/produits/savon visage.jpeg",
    "images/produits/mèches synthétiques.jpeg",
    "images/produits/perruques.jpeg",
    "images/produits/outils-esthetiques.jpeg",
    "images/produits/accessoires-de-beauté.jpeg"
  ];

  var SERVICE_IMAGES = [
    "images/services/coiffures.png",
    "images/services/tresse.png",
    "images/services/perruque.png",
    "images/services/pose-perruque.png",
    "images/services/soins-capillaires.jpeg",
    "images/services/manucure.png",
    "images/services/pedicure.png"
  ];

  var DEFAULT_PRODUCTS = [
    { id: "p1", nom: "Beurre de karité", prix: 3500, categorie: "cosmetiques", description: "Crème naturelle pour hydrater et nourrir la peau et les cheveux.", caracteristiques: ["100% naturel", "Hydrate la peau et les cheveux en profondeur", "Convient à toute la famille", "Sans parfum artificiel"], image: "images/produits/huile de coco.jpeg" },
    { id: "p2", nom: "Savon noir artisanal", prix: 1500, categorie: "cosmetiques", description: "Nettoie en douceur tout en respectant les peaux sensibles.", caracteristiques: ["Fait main au Togo", "Nettoie en douceur", "Idéal pour les peaux sensibles", "Visage et corps"], image: "images/produits/savon visage.jpeg" },
    { id: "p3", nom: "Huile de coco biologique", prix: 3000, categorie: "cosmetiques", description: "Nourrit les cheveux secs et adoucit la peau au quotidien.", caracteristiques: ["Pressée à froid", "Nourrit les cheveux secs", "Adoucit et hydrate la peau", "Polyvalente corps et cheveux"], image: "images/produits/huile de coco.jpeg" },
    { id: "p4", nom: "Paquet de mèches synthétiques", prix: 2500, categorie: "meches", description: "Des mèches faciles à tresser pour des coiffures protectrices variées.", caracteristiques: ["Longueur 24 pouces", "Faciles à tresser", "Réutilisables plusieurs fois", "Idéal tresses et vanilles"], image: "images/produits/mèches synthétiques.jpeg" },
    { id: "p5", nom: "Mèches braids longues", prix: 4000, categorie: "meches", description: "Des mèches longues, brillantes et légères pour un rendu naturel.", caracteristiques: ["Longueur 28 pouces", "Brillantes et souples", "Légères sur la tête", "Pour coiffures protectrices"], image: "images/produits/mèches synthétiques.jpeg" },
    { id: "p6", nom: "Mèches blondes", prix: 3000, categorie: "meches", description: "Une couleur blonde éclatante pour des tresses pleines de style.", caracteristiques: ["Longueur 20 pouces", "Couleur blonde éclatante", "Faciles à entretenir", "Pour tresses et vanilles"], image: "images/produits/mèches blondes.jpeg" },
    { id: "p7", nom: "Perruque lace front", prix: 25000, categorie: "perruques", description: "Une lace frontale fine pour un contour de visage naturel.", caracteristiques: ["Lace frontale naturelle", "Taille ajustable", "Prête à porter", "Facile à entretenir"], image: "images/produits/perruques.jpeg" },
    { id: "p8", nom: "Perruque courte naturelle", prix: 18000, categorie: "perruques", description: "Un look court, élégant et confortable pour le quotidien.", caracteristiques: ["Look court élégant", "Légère et confortable", "Bonnet ajustable", "Idéale au quotidien"], image: "images/produits/perruques.jpeg" },
    { id: "p9", nom: "Perruque bouclée longue", prix: 22000, categorie: "perruques", description: "Des boucles naturelles et volumineuses pour un style glamour.", caracteristiques: ["Cheveux bouclés naturels", "Longueur 22 pouces", "Bonnet ajustable", "Prête à porter"], image: "images/produits/perruques.jpeg" },
    { id: "p10", nom: "Kit manucure complet", prix: 8000, categorie: "outils", description: "Un kit complet pour des ongles propres et soignés à la maison.", caracteristiques: ["12 pièces", "Lime, ciseaux et pousse-cuticules", "Étui de rangement inclus", "Usage professionnel"], image: "images/produits/outils-esthetiques.jpeg" },
    { id: "p11", nom: "Accessoires de soin beauté", prix: 5000, categorie: "outils", description: "Pinceaux et petits accessoires pour parfaire votre mise en beauté.", caracteristiques: ["Pinceaux et accessoires variés", "Idéal pour le maquillage", "Faciles à nettoyer", "Petit budget"], image: "images/produits/accessoires-de-beauté.jpeg" }
  ];
var DEFAULT_SERVICES = [
    { id: "s1", nom: "Coiffure", description: "Coupes, coiffures protectrices, brushing et finitions adaptées à votre visage.", icone: "C", image: "images/services/coiffures.png" },
    { id: "s2", nom: "Tresses africaines", description: "Nattes, vanilles, tresses longues ou courtes avec un rendu net et confortable.", icone: "T", image: "images/services/tresse.png" },
    { id: "s3", nom: "Pose de perruques", description: "Préparation, pose, ajustement et conseils pour un résultat naturel.", icone: "P", image: "images/services/perruque.png" },
    { id: "s4", nom: "Soins capillaires", description: "Hydratation, réparation et entretien pour cheveux naturels ou traités.", icone: "S", image: "images/services/soins-capillaires.jpeg" },
    { id: "s5", nom: "Manucure", description: "Soin des mains, mise en forme des ongles et finition élégante.", icone: "M", image: "images/services/manucure.png" },
    { id: "s6", nom: "Pédicure", description: "Soin des pieds, confort, hygiène et beauté jusqu'au bout des ongles.", icone: "P", image: "images/services/pedicure.png" }
  ];

  var DEFAULT_SETTINGS = {
    phone: "+228 96 10 03 60",
    whatsapp: "+228 96 10 03 60",
    address: "Lomé, Togo",
    email: "contact@sochoubeauty.com",
    horaires: "Lun - Sam, 8h - 19h"
  };

  var STATUSES = {
    order: ["Nouvelle", "Confirmée", "En cours", "Livrée", "Annulée"],
    appointment: ["Nouveau", "Confirmé", "Terminé", "Annulé"]
  };

  /* ---------- Helpers ---------- */
  function safeGet(key, fallback) {
    try {
      var value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch (e) { return fallback; }
  }

  function safeSet(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch (e) { return false; }
  }

  function escapeHtml(text) {
    return String(text == null ? "" : text)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }

  function formatPrice(value) {
    return Number(value || 0).toLocaleString("fr-FR");
  }

  function formatDateTime(value) {
    if (!value) return "-";
    var d = new Date(value);
    if (isNaN(d.getTime())) return "-";
    return d.toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
  }

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function showToast(message, type) {
    var container = document.getElementById("site-toasts");
    if (!container) {
      container = document.createElement("div");
      container.id = "site-toasts";
      container.className = "site-toasts";
      document.body.appendChild(container);
    }
    var toast = document.createElement("div");
    toast.className = "site-toast" + (type === "error" ? " is-error" : "");
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(function () {
      toast.classList.add("is-leaving");
      setTimeout(function () { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 400);
    }, 3200);
  }

  /* ---------- Fenêtre modale de remerciement (après commande ou rendez-vous) ---------- */
  function showThankYou(titre, message) {
    var modal = document.getElementById("thank-you-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "thank-you-modal";
      modal.className = "thank-you-modal";
      modal.setAttribute("aria-hidden", "true");
      modal.innerHTML =
        '<div class="thank-you-overlay" data-thank-close></div>' +
        '<div class="thank-you-dialog" role="dialog" aria-modal="true" aria-labelledby="thank-you-title">' +
          '<button class="thank-you-close" type="button" aria-label="Fermer la fenêtre" data-thank-close>×</button>' +
          '<span class="thank-you-icon" aria-hidden="true">&#10022;</span>' +
          '<h2 id="thank-you-title">Merci !</h2>' +
          '<p id="thank-you-message"></p>' +
          '<button class="btn btn-primary" type="button" data-thank-close>Fermer</button>' +
        '</div>';
      document.body.appendChild(modal);

      var close = function () {
        modal.classList.remove("is-open");
        modal.setAttribute("aria-hidden", "true");
        document.body.classList.remove("modal-open");
      };

      modal.querySelectorAll("[data-thank-close]").forEach(function (el) {
        el.addEventListener("click", close);
      });
      document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && modal.classList.contains("is-open")) close();
      });
    }

    document.getElementById("thank-you-title").textContent = titre || "Merci !";
    document.getElementById("thank-you-message").textContent = message || "Merci de votre confiance.";
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
  }

  /* ---------- Version des données (force la réinitialisation si incohérent) ---------- */
  var DATA_VERSION = "2.0";
  function ensureDataVersion() {
    if (safeGet("sochou_data_version", null) !== DATA_VERSION) {
      safeSet(STORE.products, DEFAULT_PRODUCTS);
      safeSet(STORE.services, DEFAULT_SERVICES);
      safeSet("sochou_data_version", DATA_VERSION);
    }
  }
  ensureDataVersion();

  /* ---------- Lecture / écriture ---------- */
  function getProducts() { return safeGet(STORE.products, DEFAULT_PRODUCTS); }
  function saveProducts(list) { return safeSet(STORE.products, list); }
  function getServices() { return safeGet(STORE.services, DEFAULT_SERVICES); }
  function saveServices(list) { return safeSet(STORE.services, list); }

  function getOrders() { return safeGet(STORE.orders, []); }
  function saveOrders(list) { return safeSet(STORE.orders, list); }
  function addOrder(order) {
    var orders = getOrders();
    orders.unshift(order);
    return saveOrders(orders);
  }

  function getAppointments() { return safeGet(STORE.appointments, []); }
  function saveAppointments(list) { return safeSet(STORE.appointments, list); }
  function addAppointment(appointment) {
    var appointments = getAppointments();
    appointments.unshift(appointment);
    return saveAppointments(appointments);
  }

  function getSettings() {
    var settings = safeGet(STORE.settings, null);
    if (!settings) {
      settings = DEFAULT_SETTINGS;
      safeSet(STORE.settings, settings);
    }
    return settings;
  }
  function saveSettings(settings) { return safeSet(STORE.settings, settings); }

  function getClientProfile() { return safeGet(STORE.client, null); }
/* ---------- Application des infos salon sur la page ---------- */
  function applySettingsToSite() {
    var settings = getSettings();

    // Footer : bloc "Coordonnées" (identifié par son premier <li> "Téléphone ...")
    document.querySelectorAll(".footer-grid .footer-links").forEach(function (ul) {
      var firstText = (ul.children[0] && ul.children[0].textContent || "").trim();
      if (firstText.indexOf("Téléphone") === 0 || firstText.indexOf("Téléphone : ") === 0) {
        ul.innerHTML =
          "<li>Téléphone : " + escapeHtml(settings.phone) + "</li>" +
          "<li>WhatsApp : " + escapeHtml(settings.whatsapp) + "</li>" +
          "<li>Adresse : " + escapeHtml(settings.address) + "</li>" +
          "<li>Email : " + escapeHtml(settings.email) + "</li>" +
          "<li>Horaires : " + escapeHtml(settings.horaires) + "</li>";
      }
    });

    // Footer : bloc "Services" (premier <li> est un nom de service)
    document.querySelectorAll(".footer-grid .footer-links").forEach(function (ul) {
      var firstText = (ul.children[0] && ul.children[0].textContent || "").trim();
      var serviceNames = getServices().map(function (s) { return s.nom; });
      if (serviceNames.indexOf(firstText) > -1) {
        ul.innerHTML = serviceNames.map(function (name) {
          return "<li>" + escapeHtml(name) + "</li>";
        }).join("");
      }
    });

    // Page contact : carte des coordonnées
    var mapping = [
      { title: "Téléphone", value: settings.phone },
      { title: "WhatsApp", value: settings.whatsapp },
      { title: "Adresse", value: settings.address },
      { title: "Email", value: settings.email },
      { title: "Horaires", value: settings.horaires }
    ];
    document.querySelectorAll(".contact-item").forEach(function (item) {
      var title = item.querySelector("h3");
      if (!title) return;
      var p = item.querySelector("p");
      if (!p) return;
      mapping.forEach(function (m) {
        if (title.textContent.trim().toLowerCase() === m.title.toLowerCase()) {
          p.textContent = m.value;
        }
      });
    });
  }

  /** ---------- Résolution de chemin d'image ---------- */
  /**
   * Corrige automatiquement le chemin d'une image en fonction de la profondeur
   * de la page courante dans l'arborescence du site.
   *
   *  Exemples (fichiers à la racine)     → images/...         (inchangé)
   *  Exemples (pages dans /pages/)       → ../images/...      (ajusté)
   */
  function resolveImagePath(path) {
    if (!path) return path;
    if (path.indexOf("images/") === 0) {
      // On considère qu'on est dans un sous-dossier si le pathname contient "/pages/"
      if (window.location.pathname.indexOf("/pages/") > -1) {
        return "../" + path;
      }
      return path;
    }
    return path;
  }

  /* ---------- API publique ---------- */
  window.SochouData = {
        STORE: STORE,
    CATEGORIES: CATEGORIES,
    ADMIN_CODE: ADMIN_CODE,
    PRODUCT_IMAGES: PRODUCT_IMAGES,
    SERVICE_IMAGES: SERVICE_IMAGES,
    DEFAULT_PRODUCTS: DEFAULT_PRODUCTS,
    DEFAULT_SERVICES: DEFAULT_SERVICES,
    STATUSES: STATUSES,
    getProducts: getProducts,
    saveProducts: saveProducts,
    getServices: getServices,
    saveServices: saveServices,
    getOrders: getOrders,
    saveOrders: saveOrders,
    addOrder: addOrder,
    getAppointments: getAppointments,
    saveAppointments: saveAppointments,
    addAppointment: addAppointment,
    getSettings: getSettings,
    saveSettings: saveSettings,
    getClientProfile: getClientProfile,
    saveClientProfile: saveClientProfile,
    applySettingsToSite: applySettingsToSite,
    escapeHtml: escapeHtml,
    formatPrice: formatPrice,
    formatDateTime: formatDateTime,
    uid: uid,
    showToast: showToast,
        showThankYou: showThankYou,
    resolveImagePath: resolveImagePath
  };

  // Applique les infos salon dès le chargement si la page en contient
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applySettingsToSite);
  } else {
    applySettingsToSite();
  }
})(window);
  function saveClientProfile(profile) { return safeSet(STORE.client, profile); }