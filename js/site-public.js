/**
 * SOCHOU HAIR BEAUTY SALON - Script Public Unifié
 * =================================================
 * Charge dynamiquement toutes les données depuis Firestore
 * sur toutes les pages publiques du site.
 */
(function (window) {
  "use strict";

  const { initFirebase } = window.SochouFirebase;
  const Images = window.SochouImages || { resolveImagePath: function (p) { return p; } };

  // Stockage global pour le filtrage
  var allServices = [];
  var allGalerie = [];
  var allProduits = [];

  function escapeHtml(str) {
    if (!str) return "";
    var div = document.createElement("div");
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  function formatPrice(value) {
    return Number(value || 0).toLocaleString("fr-FR");
  }

  /* ---------- INFORMATIONS GÉNÉRALES ---------- */
  function loadInformations() {
    if (!window.SochouInformations) return;
    window.SochouInformations.getInformationsGenerales().then(function (data) {
      if (!data) return;

      // Logo
      if (data.logo) {
        document.querySelectorAll(".brand-mark img, .admin-brand-logo, .admin-login-logo").forEach(function (img) {
          if (img) img.src = Images.resolveImagePath(data.logo);
        });
      }

      // Nom du salon
      if (data.nom) {
        document.querySelectorAll(".footer-title, .info-value-nom").forEach(function (el) {
          if (el) el.textContent = data.nom;
        });
      }

      // Téléphone
      if (data.telephone) {
        document.querySelectorAll(".info-value-telephone, .telephone-display").forEach(function (el) {
          if (el) el.textContent = data.telephone;
        });
      }

      // WhatsApp
      if (data.whatsapp) {
        document.querySelectorAll(".info-value-whatsapp, .whatsapp-display").forEach(function (el) {
          if (el) el.textContent = data.whatsapp;
        });
      }

      // Email
      if (data.email) {
        document.querySelectorAll(".info-value-email, .email-display").forEach(function (el) {
          if (el) el.textContent = data.email;
        });
      }

      // Adresse
      if (data.adresse) {
        document.querySelectorAll(".info-value-adresse, .adresse-display").forEach(function (el) {
          if (el) el.textContent = data.adresse;
        });
      }

      // Horaires
      if (data.horaires) {
        var horairesContainer = document.querySelector(".info-value-horaires, .horaires-display");
        if (horairesContainer) {
          var html = "";
          for (var jour in data.horaires) {
            html += "<li>" + escapeHtml(jour) + " : " + escapeHtml(data.horaires[jour]) + "</li>";
          }
          horairesContainer.innerHTML = html;
        }
      }

      // Footer coordonnées
      var footerCoords = document.querySelector(".footer-links");
      if (footerCoords) {
        var lines = [];
        if (data.telephone) lines.push("Téléphone : " + data.telephone);
        if (data.whatsapp) lines.push("WhatsApp : " + data.whatsapp);
        if (data.adresse) lines.push("Adresse : " + data.adresse);
        if (data.email) lines.push("Email : " + data.email);
        if (data.horaires) {
          var horairesStr = [];
          for (var j in data.horaires) {
            horairesStr.push(j + " : " + data.horaires[j]);
          }
          if (horairesStr.length) lines.push("Horaires : " + horairesStr.join(", "));
        }
        footerCoords.innerHTML = lines.map(function (l) { return "<li>" + escapeHtml(l) + "</li>"; }).join("");
      }

      // Footer copyright
      var footerBottom = document.querySelector(".footer-bottom");
      if (footerBottom && data.nom) {
        footerBottom.textContent = "\u00a9 " + new Date().getFullYear() + " " + data.nom + ". Tous droits r\u00e9serv\u00e9s.";
      }
    }).catch(function (err) {
      console.error("Erreur chargement informations:", err);
    });
  }

  /* ---------- SERVICES ---------- */
  function loadServices() {
    if (!window.SochouServices) return;
    var container = document.getElementById("services-container");
    if (!container) return;

    container.innerHTML = '<p class="admin-loading">Chargement des services...</p>';

    window.SochouServices.getServices(true).then(function (services) {
      allServices = services;
      if (!services.length) {
        container.innerHTML = '<p class="admin-loading">Aucun service disponible pour le moment.</p>';
        return;
      }
      renderServices(services, container);
    }).catch(function (err) {
      container.innerHTML = '<p class="admin-loading">Impossible de charger les services. Veuillez réessayer.</p>';
      console.error("Erreur chargement services:", err);
    });
  }

  function renderServices(services, container) {
    container.innerHTML = "";
    services.forEach(function (service) {
      var card = document.createElement("article");
      card.className = "card";
      var imgHtml = service.image
        ? '<img src="' + escapeHtml(Images.resolveImagePath(service.image)) + '" alt="' + escapeHtml(service.nom) + '" loading="lazy">'
        : '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#999;">Pas d\'image</div>';
      card.innerHTML =
        '<div class="card-media">' + imgHtml + '</div>' +
        '<div class="card-body">' +
          '<span class="service-icon">' + escapeHtml(service.nom.charAt(0)) + '</span>' +
          '<h3>' + escapeHtml(service.nom) + '</h3>' +
          '<p>' + escapeHtml(service.description) + '</p>' +
          (service.prix ? '<p class="service-price"><strong>' + formatPrice(service.prix) + ' FCFA</strong></p>' : '') +
          (service.duree ? '<p class="service-duree">Durée : ' + escapeHtml(service.duree) + '</p>' : '') +
          '<a class="btn btn-dark" href="pages/contact.html">Réserver</a>' +
        '</div>';
      container.appendChild(card);
    });
  }

  /* ---------- GALERIE ---------- */
  function loadGalerie() {
    if (!window.SochouGalerie) return;
    var container = document.getElementById("galerie-container");
    if (!container) return;

    container.innerHTML = '<p class="admin-loading">Chargement de la galerie...</p>';

    window.SochouGalerie.getGalerie(true).then(function (items) {
      allGalerie = items;
      if (!items.length) {
        container.innerHTML = '<p class="admin-loading">Aucune image dans la galerie pour le moment.</p>';
        return;
      }
      renderCategoryFilter(items, "galerie-filter", renderGalerie, "galerie-container");
      renderGalerie(items, container);
    }).catch(function (err) {
      container.innerHTML = '<p class="admin-loading">Impossible de charger la galerie. Veuillez réessayer.</p>';
      console.error("Erreur chargement galerie:", err);
    });
  }

  function renderGalerie(items, container) {
    container.innerHTML = "";
    items.forEach(function (item) {
      var link = document.createElement("a");
      link.className = "gallery-item";
      link.href = item.image || "#";
      var imgHtml = item.image
        ? '<img src="' + escapeHtml(Images.resolveImagePath(item.image)) + '" alt="' + escapeHtml(item.titre) + '" loading="lazy">'
        : '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#999;">Pas d\'image</div>';
      link.innerHTML = imgHtml;
      container.appendChild(link);
    });
  }

  /**
   * Génère dynamiquement les boutons de filtrage par catégorie
   * à partir des catégories réellement présentes dans les données.
   * @param {Array} items - tableau des éléments (produits ou galerie)
   * @param {string} filterContainerId - id du conteneur des boutons de filtre
   * @param {Function} renderFn - fonction de rendu (renderProduits ou renderGalerie)
   * @param {string} containerId - id du conteneur où sont rendus les éléments
   */
  function renderCategoryFilter(items, filterContainerId, renderFn, containerId) {
    var filterContainer = document.getElementById(filterContainerId);
    if (!filterContainer) return;

    // Extraire les catégories uniques (dans l'ordre d'apparition)
    var categories = [];
    items.forEach(function (item) {
      if (item.categorie && categories.indexOf(item.categorie) === -1) {
        categories.push(item.categorie);
      }
    });

    // Générer le bouton "Tous" puis un bouton par catégorie
    var buttonsHtml = '<button class="category-filter-btn active" data-categorie="tous">Tous</button>';
    categories.forEach(function (cat) {
      buttonsHtml += '<button class="category-filter-btn" data-categorie="' + escapeHtml(cat) + '">' + escapeHtml(cat) + '</button>';
    });
    filterContainer.innerHTML = buttonsHtml;

    // Attacher les événements de filtrage
    filterContainer.querySelectorAll(".category-filter-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        // Mettre à jour l'état actif
        filterContainer.querySelectorAll(".category-filter-btn").forEach(function (b) {
          b.classList.remove("active");
        });
        btn.classList.add("active");

        // Filtrer
        var categorie = btn.getAttribute("data-categorie");
        var container = document.getElementById(containerId);
        if (!container) return;

        if (categorie === "tous") {
          renderFn(items, container);
        } else {
          var filtered = items.filter(function (item) {
            return item.categorie === categorie;
          });
          renderFn(filtered, container);
        }
      });
    });
  }

  /* ---------- PRODUITS (Boutique) ---------- */
  function loadProduits() {
    if (!window.SochouProduits) return;
    var container = document.getElementById("produits-container");
    if (!container) return;

    container.innerHTML = '<p class="admin-loading">Chargement des produits...</p>';

    window.SochouProduits.getProduits(true).then(function (produits) {
      allProduits = produits;
      if (!produits.length) {
        container.innerHTML = '<p class="admin-loading">Aucun produit disponible pour le moment.</p>';
        return;
      }
      renderCategoryFilter(produits, "produits-filter", renderProduits, "produits-container");
      renderProduits(produits, container);
    }).catch(function (err) {
      container.innerHTML = '<p class="admin-loading">Impossible de charger les produits. Veuillez réessayer.</p>';
      console.error("Erreur chargement produits:", err);
    });
  }

  function renderProduits(produits, container) {
    container.innerHTML = "";
    produits.forEach(function (prod) {
      var card = document.createElement("article");
      card.className = "card product-card";
      card.dataset.nom = prod.nom;
      card.dataset.prix = prod.prix;
      card.dataset.caracteristiques = prod.caracteristiques || "";
      var imgHtml = prod.image
        ? '<img src="' + escapeHtml(Images.resolveImagePath(prod.image)) + '" alt="' + escapeHtml(prod.nom) + '" loading="lazy">'
        : '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#999;">Pas d\'image</div>';
      card.innerHTML =
        '<div class="card-media">' + imgHtml + '</div>' +
        '<div class="card-body">' +
          '<h3 class="product-name">' + escapeHtml(prod.nom) + '</h3>' +
          '<p class="product-price">Prix unitaire : <strong>' + formatPrice(prod.prix) + ' FCFA</strong></p>' +
          (prod.description ? '<p class="product-desc">' + escapeHtml(prod.description) + '</p>' : '') +
          '<div class="product-actions">' +
            '<button class="btn btn-outline btn-sm" data-details>Détails</button>' +
            '<button class="btn btn-dark btn-sm" data-commander>Commander</button>' +
          '</div>' +
        '</div>';
      container.appendChild(card);
    });
  }

  /* ---------- SERVICES POUR FORMULAIRE RDV ---------- */
  function loadServicesForSelect() {
    if (!window.SochouServices) return;
    var select = document.getElementById("appointment-service");
    if (!select) return;

    window.SochouServices.getServices(true).then(function (services) {
      if (!services.length) return;
      select.innerHTML = "";
      services.forEach(function (service) {
        var option = document.createElement("option");
        option.value = service.nom;
        option.textContent = service.nom;
        select.appendChild(option);
      });
    }).catch(function () {});
  }

  /* ---------- INITIALISATION ---------- */
  function init() {
    if (!window.SochouFirebase) return;
    try { initFirebase(); } catch (e) { return; }

    loadInformations();
    loadServices();
    loadGalerie();
    loadProduits();
    loadServicesForSelect();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(window);
