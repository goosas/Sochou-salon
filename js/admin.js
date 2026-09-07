/**
 * SOCHOU HAIR BEAUTY SALON - Logique Administration
 * ==================================================
 * Gère la navigation, les modals, le CRUD et le dashboard.
 */

(function (window) {
  "use strict";

  const { initFirebase } = window.SochouFirebase;
  const { onAuthStateChanged, logout } = window.SochouAuth;
  const Services = window.SochouServices;
  const Galerie = window.SochouGalerie;
  const Produits = window.SochouProduits;
  const Commandes = window.SochouCommandes;
  const RendezVous = window.SochouRendezVous;
  const Informations = window.SochouInformations;
  const ImageSelector = window.SochouImageSelector;

  let currentSection = "dashboard";
  let deleteCallback = null;

  document.addEventListener("DOMContentLoaded", function () {
    initFirebase();

    onAuthStateChanged(
      function (user) {
        initApp();
      },
      function () {
        window.location.href = "login.html";
      }
    );
  });

  function initApp() {
    setupNavigation();
    setupLogout();
    setupModals();
    setupForms();
    loadDashboard();
  }

  /* ---------- Navigation ---------- */
  function setupNavigation() {
    var nav = document.getElementById("admin-nav");
    if (!nav) return;
    nav.querySelectorAll(".admin-nav-link").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var section = btn.getAttribute("data-nav");
        if (section) showSection(section);
      });
    });
  }

  function showSection(section) {
    currentSection = section;
    document.querySelectorAll(".admin-section").forEach(function (s) {
      s.classList.add("hidden");
    });
    var target = document.getElementById("section-" + section);
    if (target) target.classList.remove("hidden");

    document.querySelectorAll(".admin-nav-link").forEach(function (b) {
      b.classList.toggle("active", b.getAttribute("data-nav") === section);
    });

    if (section === "dashboard") loadDashboard();
    if (section === "services") loadServices();
    if (section === "galerie") loadGalerie();
    if (section === "boutique") loadProduits();
    if (section === "commandes") loadCommandes();
    if (section === "rendez-vous") loadRendezVous();
    if (section === "informations") loadInformations();
  }

  /* ---------- Logout ---------- */
  function setupLogout() {
    var btn = document.getElementById("logout-btn");
    if (!btn) return;
    btn.addEventListener("click", function () {
      logout().then(function () {
        window.location.href = "login.html";
      }).catch(function (err) {
        alert("Erreur lors de la déconnexion : " + err.message);
      });
    });
  }

  /* ---------- Modals ---------- */
  function setupModals() {
    document.querySelectorAll("[data-close-modal]").forEach(function (el) {
      el.addEventListener("click", function () {
        document.querySelectorAll(".admin-modal").forEach(function (m) {
          m.classList.add("hidden");
        });
      });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        document.querySelectorAll(".admin-modal").forEach(function (m) {
          m.classList.add("hidden");
        });
      }
    });
  }

  function openModal(id) {
    var modal = document.getElementById(id);
    if (modal) modal.classList.remove("hidden");
  }

  function closeAllModals() {
    document.querySelectorAll(".admin-modal").forEach(function (m) {
      m.classList.add("hidden");
    });
  }

  /* ---------- Toast ---------- */
  function showToast(msg, type) {
    if (window.SochouData && window.SochouData.showToast) {
      window.SochouData.showToast(msg, type);
    } else {
      alert(msg);
    }
  }

  /* ---------- Confirm Delete ---------- */
  function confirmDelete(callback) {
    deleteCallback = callback;
    openModal("modal-confirm");
  }

  var confirmBtn = document.getElementById("confirm-delete-btn");
  if (confirmBtn) {
    confirmBtn.addEventListener("click", function () {
      closeAllModals();
      if (deleteCallback) deleteCallback();
      deleteCallback = null;
    });
  }

  /* ==================== DASHBOARD ==================== */
  function loadDashboard() {
    console.log("[DASHBOARD] loadDashboard() appele");
    var loading = document.getElementById("dashboard-loading");
    if (loading) loading.textContent = "Chargement...";

    console.log("[DASHBOARD] Services defini:", typeof Services);
    console.log("[DASHBOARD] Galerie defini:", typeof Galerie);

    var promises = [];
    promises.push(
      Services.getServices(true)
        .then(function(data) { console.log("[DASHBOARD] Services recus:", data.length, "elements"); return data; })
        .catch(function(err) { console.error("[DASHBOARD] Erreur Services:", err.message); return []; })
    );
    promises.push(
      Galerie.getGalerie(true)
        .then(function(data) { console.log("[DASHBOARD] Galerie recue:", data.length, "elements"); return data; })
        .catch(function(err) { console.error("[DASHBOARD] Erreur Galerie:", err.message); return []; })
    );
    promises.push(
      RendezVous.countByStatut()
        .then(function(data) { console.log("[DASHBOARD] RDV counts:", JSON.stringify(data)); return data; })
        .catch(function(err) { console.error("[DASHBOARD] Erreur RDV:", err.message); return { en_attente: 0, confirme: 0 }; })
    );
    promises.push(
      Produits.getProduits(false)
        .then(function(data) { console.log("[DASHBOARD] Produits recus:", data.length, "elements"); return data; })
        .catch(function(err) { console.error("[DASHBOARD] Erreur Produits:", err.message); return []; })
    );
    promises.push(
      Commandes.getCommandes(null)
        .then(function(data) { console.log("[DASHBOARD] Commandes recues:", data.length, "elements"); return data; })
        .catch(function(err) { console.error("[DASHBOARD] Erreur Commandes:", err.message); return []; })
    );

    Promise.all(promises).then(function (results) {
      console.log("[DASHBOARD] Promise.all termine, results:", results.length, "resultats");
      var servicesActifs = results[0];
      var galerie = results[1];
      var rdvCounts = results[2];
      var produits = results[3];
      var commandes = results[4];

      console.log("[DASHBOARD] Mise a jour des compteurs...");
      var elServices = document.getElementById("stat-services-actifs");
      var elGalerie = document.getElementById("stat-galerie");
      console.log("[DASHBOARD] Element stat-services-actifs:", elServices ? "trouve" : "NON TROUVE");
      console.log("[DASHBOARD] Element stat-galerie:", elGalerie ? "trouve" : "NON TROUVE");

      if (elServices) elServices.textContent = servicesActifs.length;
      if (elGalerie) elGalerie.textContent = galerie.length;
      document.getElementById("stat-rdv-attente").textContent = rdvCounts.en_attente || 0;
      document.getElementById("stat-rdv-confirmes").textContent = rdvCounts.confirme || 0;
      document.getElementById("stat-produits").textContent = produits.length;
      document.getElementById("stat-commandes").textContent = commandes.length;

      if (loading) loading.classList.add("hidden");
      console.log("[DASHBOARD] Compteurs mis a jour !");
    }).catch(function (err) {
      console.error("[DASHBOARD] Erreur Promise.all:", err);
      if (loading) loading.textContent = "Erreur de chargement.";
    });
  }

  /* ==================== SERVICES ==================== */
  function loadServices() {
    var loading = document.getElementById("services-loading");
    var list = document.getElementById("services-list");
    if (!list) return;
    if (loading) loading.textContent = "Chargement...";
    list.innerHTML = "";

    Services.getServices(false).then(function (services) {
      if (loading) loading.classList.add("hidden");
      if (!services.length) {
        list.innerHTML = '<p class="admin-loading">Aucun service. Cliquez sur "Ajouter un service" pour commencer.</p>';
        return;
      }
      services.forEach(function (svc) {
        list.appendChild(renderServiceCard(svc));
      });
    }).catch(function (err) {
      if (loading) loading.textContent = "Erreur : " + err.message;
    });
  }

  function renderServiceCard(svc) {
    var card = document.createElement("div");
    card.className = "admin-item-card";
    var imagePath = svc.image ? "../../" + svc.image : "";
    var imgHtml = imagePath
      ? '<img src="' + imagePath + '" alt="' + svc.nom + '" loading="lazy">'
      : '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#999;">Pas d\'image</div>';
    var prixFormatted = Number(svc.prix || 0).toLocaleString("fr-FR");
    var badgeClass = svc.actif ? "badge-actif" : "badge-inactif";
    var badgeText = svc.actif ? "Actif" : "Inactif";

    card.innerHTML =
      '<div class="admin-item-card-image">' + imgHtml + '</div>' +
      '<div class="admin-item-card-body">' +
        '<h4 class="admin-item-card-title">' + escapeHtml(svc.nom) + '</h4>' +
        '<p class="admin-item-card-meta">' + prixFormatted + ' FCFA' + (svc.duree ? ' • ' + escapeHtml(svc.duree) : '') + '</p>' +
        '<span class="admin-badge ' + badgeClass + '">' + badgeText + '</span>' +
        '<div class="admin-item-card-actions">' +
          '<button class="btn btn-outline btn-sm" data-action="edit">Modifier</button>' +
          '<button class="btn btn-outline btn-sm" data-action="toggle">' + (svc.actif ? 'Désactiver' : 'Activer') + '</button>' +
          '<button class="btn btn-danger btn-sm" data-action="delete">Supprimer</button>' +
        '</div>' +
      '</div>';

    card.querySelector('[data-action="edit"]').addEventListener("click", function () {
      openServiceForm(svc);
    });
    card.querySelector('[data-action="toggle"]').addEventListener("click", function () {
      Services.toggleServiceActif(svc.id, !svc.actif).then(function () {
        showToast(svc.actif ? "Service désactivé" : "Service activé");
        loadServices();
      }).catch(function (err) {
        showToast("Erreur : " + err.message, "error");
      });
    });
    card.querySelector('[data-action="delete"]').addEventListener("click", function () {
      confirmDelete(function () {
        Services.deleteService(svc.id).then(function () {
          showToast("Service supprimé");
          loadServices();
        }).catch(function (err) {
          showToast("Erreur : " + err.message, "error");
        });
      });
    });

    return card;
  }

  function openServiceForm(svc) {
    var modal = document.getElementById("modal-service");
    var form = document.getElementById("form-service");
    var title = document.getElementById("modal-service-title");
    var selectorContainer = document.getElementById("service-image-selector");
    if (!form) return;

    form.reset();
    selectorContainer.innerHTML = "";

    var isEdit = !!svc;
    title.textContent = isEdit ? "Modifier le service" : "Ajouter un service";
    form.elements["id"].value = svc ? svc.id : "";
    form.elements["nom"].value = svc ? svc.nom : "";
    form.elements["prix"].value = svc ? svc.prix : "";
    form.elements["duree"].value = svc ? svc.duree : "";
    form.elements["ordre"].value = svc ? svc.ordre : 0;
    form.elements["description"].value = svc ? svc.description : "";
    form.elements["actif"].checked = svc ? svc.actif : true;

    ImageSelector.createImageSelector({
      dossier: "services",
      valeurInitiale: svc ? svc.image : "",
      container: selectorContainer,
      inputName: "image"
    });

    openModal("modal-service");
  }

  function setupServiceForm() {
    var form = document.getElementById("form-service");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var id = form.elements["id"].value;
      var data = {
        nom: form.elements["nom"].value,
        prix: form.elements["prix"].value,
        duree: form.elements["duree"].value,
        ordre: form.elements["ordre"].value,
        description: form.elements["description"].value,
        image: form.elements["image"] ? form.elements["image"].value : "",
        actif: form.elements["actif"].checked
      };

      var promise = id ? Services.updateService(id, data) : Services.addService(data);
      promise.then(function () {
        closeAllModals();
        showToast(id ? "Service modifié" : "Service ajouté");
        loadServices();
      }).catch(function (err) {
        showToast("Erreur : " + err.message, "error");
      });
    });

    var addBtn = document.getElementById("btn-add-service");
    if (addBtn) addBtn.addEventListener("click", function () { openServiceForm(null); });
  }

  /* ==================== GALERIE ==================== */
  function loadGalerie() {
    var loading = document.getElementById("galerie-loading");
    var list = document.getElementById("galerie-list");
    if (!list) return;
    if (loading) loading.textContent = "Chargement...";
    list.innerHTML = "";

    Galerie.getGalerie(false).then(function (items) {
      if (loading) loading.classList.add("hidden");
      if (!items.length) {
        list.innerHTML = '<p class="admin-loading">Aucune réalisation. Cliquez sur "Ajouter" pour commencer.</p>';
        return;
      }
      items.forEach(function (item) {
        list.appendChild(renderGalerieCard(item));
      });
    }).catch(function (err) {
      if (loading) loading.textContent = "Erreur : " + err.message;
    });
  }

  function renderGalerieCard(item) {
    var card = document.createElement("div");
    card.className = "admin-item-card";
    var imagePath = item.image ? "../../" + item.image : "";
    var imgHtml = imagePath
      ? '<img src="' + imagePath + '" alt="' + item.titre + '" loading="lazy">'
      : '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#999;">Pas d\'image</div>';
    var badgeClass = item.actif ? "badge-actif" : "badge-inactif";

    card.innerHTML =
      '<div class="admin-item-card-image">' + imgHtml + '</div>' +
      '<div class="admin-item-card-body">' +
        '<h4 class="admin-item-card-title">' + escapeHtml(item.titre) + '</h4>' +
        '<p class="admin-item-card-meta">' + escapeHtml(item.categorie || "Sans catégorie") + '</p>' +
        '<span class="admin-badge ' + badgeClass + '">' + (item.actif ? "Visible" : "Masqué") + '</span>' +
        '<div class="admin-item-card-actions">' +
          '<button class="btn btn-outline btn-sm" data-action="edit">Modifier</button>' +
          '<button class="btn btn-outline btn-sm" data-action="toggle">' + (item.actif ? 'Masquer' : 'Afficher') + '</button>' +
          '<button class="btn btn-danger btn-sm" data-action="delete">Supprimer</button>' +
        '</div>' +
      '</div>';

    card.querySelector('[data-action="edit"]').addEventListener("click", function () {
      openGalerieForm(item);
    });
    card.querySelector('[data-action="toggle"]').addEventListener("click", function () {
      Galerie.toggleRealisationActif(item.id, !item.actif).then(function () {
        showToast(item.actif ? "Réalisation masquée" : "Réalisation visible");
        loadGalerie();
      }).catch(function (err) { showToast("Erreur : " + err.message, "error"); });
    });
    card.querySelector('[data-action="delete"]').addEventListener("click", function () {
      confirmDelete(function () {
        Galerie.deleteRealisation(item.id).then(function () {
          showToast("Réalisation supprimée");
          loadGalerie();
        }).catch(function (err) { showToast("Erreur : " + err.message, "error"); });
      });
    });

    return card;
  }

  function openGalerieForm(item) {
    var form = document.getElementById("form-galerie");
    var title = document.getElementById("modal-galerie-title");
    var selectorContainer = document.getElementById("galerie-image-selector");
    if (!form) return;

    form.reset();
    selectorContainer.innerHTML = "";

    var isEdit = !!item;
    title.textContent = isEdit ? "Modifier la réalisation" : "Ajouter une réalisation";
    form.elements["id"].value = item ? item.id : "";
    form.elements["titre"].value = item ? item.titre : "";
    form.elements["categorie"].value = item ? item.categorie : "";
    form.elements["ordre"].value = item ? item.ordre : 0;
    form.elements["description"].value = item ? item.description : "";
    form.elements["actif"].checked = item ? item.actif : true;

    ImageSelector.createImageSelector({
      dossier: "galerie",
      valeurInitiale: item ? item.image : "",
      container: selectorContainer,
      inputName: "image"
    });

    openModal("modal-galerie");
  }

  function setupGalerieForm() {
    var form = document.getElementById("form-galerie");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var id = form.elements["id"].value;
      var data = {
        titre: form.elements["titre"].value,
        categorie: form.elements["categorie"].value,
        ordre: form.elements["ordre"].value,
        description: form.elements["description"].value,
        image: form.elements["image"] ? form.elements["image"].value : "",
        actif: form.elements["actif"].checked
      };

      var promise = id ? Galerie.updateRealisation(id, data) : Galerie.addRealisation(data);
      promise.then(function () {
        closeAllModals();
        showToast(id ? "Réalisation modifiée" : "Réalisation ajoutée");
        loadGalerie();
      }).catch(function (err) {
        showToast("Erreur : " + err.message, "error");
      });
    });

    var addBtn = document.getElementById("btn-add-galerie");
    if (addBtn) addBtn.addEventListener("click", function () { openGalerieForm(null); });
  }

  /* ==================== RENDEZ-VOUS ==================== */
  function loadRendezVous(filter) {
    var loading = document.getElementById("rendez-vous-loading");
    var list = document.getElementById("rendez-vous-list");
    if (!list) return;
    if (loading) loading.textContent = "Chargement...";
    list.innerHTML = "";

    RendezVous.getRendezVous(filter || null).then(function (items) {
      if (loading) loading.classList.add("hidden");
      if (!items.length) {
        list.innerHTML = '<p class="admin-loading">Aucun rendez-vous.</p>';
        return;
      }
      items.forEach(function (rdv) {
        list.appendChild(renderRendezVousItem(rdv));
      });
    }).catch(function (err) {
      if (loading) loading.textContent = "Erreur : " + err.message;
    });
  }

  function renderRendezVousItem(rdv) {
    var div = document.createElement("div");
    div.className = "admin-rdv-item";
    var badgeClass = "badge-" + rdv.statut;
    var statutLabel = { en_attente: "En attente", confirme: "Confirmé", annule: "Annulé", termine: "Terminé" };

    div.innerHTML =
      '<div class="admin-rdv-info">' +
        '<h4>' + escapeHtml(rdv.nomClient || "Anonyme") + '</h4>' +
        '<p>' + escapeHtml(rdv.service || "Service non spécifié") + '</p>' +
        '<p>' + escapeHtml(rdv.telephone || "Pas de téléphone") + (rdv.date ? ' • ' + escapeHtml(rdv.date) : '') + (rdv.heure ? ' à ' + escapeHtml(rdv.heure) : '') + '</p>' +
        (rdv.message ? '<p style="font-style:italic;">' + escapeHtml(rdv.message) + '</p>' : '') +
        '<span class="admin-badge ' + badgeClass + '">' + (statutLabel[rdv.statut] || rdv.statut) + '</span>' +
      '</div>' +
      '<div class="admin-rdv-actions">' +
        '<button class="btn btn-outline btn-sm" data-action="confirm">Confirmer</button>' +
        '<button class="btn btn-outline btn-sm" data-action="termine">Terminer</button>' +
        '<button class="btn btn-outline btn-sm" data-action="annule">Annuler</button>' +
        '<button class="btn btn-danger btn-sm" data-action="delete">Supprimer</button>' +
      '</div>';

    div.querySelector('[data-action="confirm"]').addEventListener("click", function () {
      RendezVous.setStatut(rdv.id, "confirme").then(function () {
        showToast("Rendez-vous confirmé");
        loadRendezVous(document.getElementById("rdv-filter").value);
      });
    });
    div.querySelector('[data-action="termine"]').addEventListener("click", function () {
      RendezVous.setStatut(rdv.id, "termine").then(function () {
        showToast("Rendez-vous marqué terminé");
        loadRendezVous(document.getElementById("rdv-filter").value);
      });
    });
    div.querySelector('[data-action="annule"]').addEventListener("click", function () {
      RendezVous.setStatut(rdv.id, "annule").then(function () {
        showToast("Rendez-vous annulé");
        loadRendezVous(document.getElementById("rdv-filter").value);
      });
    });
    div.querySelector('[data-action="delete"]').addEventListener("click", function () {
      confirmDelete(function () {
        RendezVous.deleteRendezVous(rdv.id).then(function () {
          showToast("Rendez-vous supprimé");
          loadRendezVous(document.getElementById("rdv-filter").value);
        });
      });
    });

    return div;
  }

  /* ==================== INFORMATIONS ==================== */
  var INFO_CHAMPS_PRINCIPAUX = [
    { cle: "nom", label: "Nom du salon", type: "text" },
    { cle: "slogan", label: "Slogan", type: "text" },
    { cle: "description", label: "Description", type: "textarea" },
    { cle: "logo", label: "Logo", type: "image" },
    { cle: "telephone", label: "T\u00e9l\u00e9phone", type: "text" },
    { cle: "whatsapp", label: "WhatsApp", type: "text" },
    { cle: "email", label: "Email", type: "text" },
    { cle: "adresse", label: "Adresse", type: "text" },
    { cle: "horaires", label: "Horaires", type: "horaires" },
    { cle: "facebook", label: "Facebook", type: "text" },
    { cle: "instagram", label: "Instagram", type: "text" },
    { cle: "localisation", label: "Localisation (Maps)", type: "text" }
  ];

  function loadInformations() {
    var loading = document.getElementById("informations-loading");
    var container = document.getElementById("informations-container");
    if (!container) return;
    if (loading) loading.textContent = "Chargement...";

    Informations.getInformationsGenerales().then(function (data) {
      if (loading) loading.classList.add("hidden");
      if (!data) {
        container.innerHTML = '<div class="admin-loading" style="text-align:center;padding:2rem;"><p>Aucune information enregistr\u00e9e.</p><button class="btn btn-primary" id="btn-init-info">Initialiser les informations</button></div>';
        var initBtn = document.getElementById("btn-init-info");
        if (initBtn) {
          initBtn.addEventListener("click", function () {
            openInformationsForm({
              nom: "SOCHOU HAIR BEAUTY SALON", slogan: "", description: "",
              logo: "images/logo/logo.png", telephone: "", whatsapp: "",
              email: "", adresse: "", horaires: {}, facebook: "",
              instagram: "", localisation: ""
            });
          });
        }
        return;
      }
      renderInformationsView(data);
    }).catch(function (err) {
      if (loading) loading.textContent = "Erreur : " + err.message;
    });
  }

  function renderInformationsView(data) {
    var container = document.getElementById("informations-container");
    if (!container) return;
    container.innerHTML = "";

    var header = document.createElement("div");
    header.className = "admin-section-header";
    header.innerHTML = '<h3 style="margin:0;">Informations du salon</h3>';
    var modifierToutBtn = document.createElement("button");
    modifierToutBtn.className = "btn btn-outline btn-sm";
    modifierToutBtn.textContent = "Modifier tout";
    modifierToutBtn.addEventListener("click", function () {
      openInformationsForm(data);
    });
    header.appendChild(modifierToutBtn);
    container.appendChild(header);

    var grid = document.createElement("div");
    grid.className = "admin-info-grid";

    INFO_CHAMPS_PRINCIPAUX.forEach(function (champ) {
      var valeur = data[champ.cle];
      if (champ.cle === "horaires") {
        valeur = formatHoraires(valeur);
      } else if (champ.cle === "logo") {
        valeur = valeur ? "D\u00e9fini" : "Non d\u00e9fini";
      }
      grid.appendChild(createInfoCard(champ, valeur, data));
    });

    container.appendChild(grid);

    var suppTitleRow = document.createElement("div");
    suppTitleRow.className = "admin-section-header";
    suppTitleRow.style.marginTop = "2rem";
    suppTitleRow.innerHTML = '<h3 style="margin:0;">Informations suppl\u00e9mentaires</h3>';
    var addSuppBtn = document.createElement("button");
    addSuppBtn.className = "btn btn-primary btn-sm";
    addSuppBtn.id = "btn-add-info-supp";
    addSuppBtn.textContent = "+ Ajouter une information";
    addSuppBtn.addEventListener("click", function () {
      openAjoutInfoSupplementaire();
    });
    suppTitleRow.appendChild(addSuppBtn);
    container.appendChild(suppTitleRow);

    var suppContainer = document.createElement("div");
    suppContainer.id = "infos-supplementaires-container";
    suppContainer.className = "admin-info-grid";
    container.appendChild(suppContainer);

    var supplementaires = data.supplementaires || {};
    var cles = Object.keys(supplementaires);
    if (cles.length === 0) {
      suppContainer.innerHTML = '<p class="admin-loading">Aucune information suppl\u00e9mentaire.</p>';
    } else {
      cles.forEach(function (cle) {
        suppContainer.appendChild(createInfoSupplementaireCard(cle, supplementaires[cle]));
      });
    }
  }

  function createInfoCard(champ, valeurAffichage, fullData) {
    var card = document.createElement("div");
    card.className = "admin-info-card";
    card.setAttribute("data-info-cle", champ.cle);

    var label = document.createElement("div");
    label.className = "admin-info-card-label";
    label.textContent = champ.label;

    var valeur = document.createElement("div");
    valeur.className = "admin-info-card-value";
    if (valeurAffichage && valeurAffichage !== "Non renseign\u00e9" && valeurAffichage !== "Non d\u00e9fini") {
      valeur.textContent = valeurAffichage;
    } else {
      valeur.textContent = "Non renseign\u00e9";
      valeur.style.color = "#999";
      valeur.style.fontStyle = "italic";
    }

    if (champ.cle === "logo" && fullData.logo) {
      var imgPreview = document.createElement("img");
      imgPreview.src = "../../" + fullData.logo;
      imgPreview.alt = "Logo";
      imgPreview.className = "admin-info-card-logo";
      valeur.insertBefore(imgPreview, valeur.firstChild);
    }

    var actions = document.createElement("div");
    actions.className = "admin-info-card-actions";
    var editBtn = document.createElement("button");
    editBtn.className = "btn btn-outline btn-sm";
    editBtn.textContent = "Modifier";
    editBtn.addEventListener("click", function () {
      openChampInfoForm(champ, fullData);
    });
    actions.appendChild(editBtn);

    card.appendChild(label);
    card.appendChild(valeur);
    card.appendChild(actions);
    return card;
  }

  function createInfoSupplementaireCard(cle, valeur) {
    var card = document.createElement("div");
    card.className = "admin-info-card";
    card.setAttribute("data-supp-cle", cle);

    var label = document.createElement("div");
    label.className = "admin-info-card-label";
    label.textContent = cle;

    var valeurEl = document.createElement("div");
    valeurEl.className = "admin-info-card-value";
    valeurEl.textContent = valeur || "";

    var actions = document.createElement("div");
    actions.className = "admin-info-card-actions";

    var editBtn = document.createElement("button");
    editBtn.className = "btn btn-outline btn-sm";
    editBtn.textContent = "Modifier";
    editBtn.addEventListener("click", function () {
      openEditInfoSupplementaire(cle, valeur);
    });

    var delBtn = document.createElement("button");
    delBtn.className = "btn btn-danger btn-sm";
    delBtn.textContent = "Supprimer";
    delBtn.addEventListener("click", function () {
      confirmDelete(function () {
        Informations.deleteChampSupplementaire(cle).then(function () {
          showToast("Information supprim\u00e9e");
          loadInformations();
        }).catch(function (err) {
          showToast("Erreur : " + err.message, "error");
        });
      });
    });

    actions.appendChild(editBtn);
    actions.appendChild(delBtn);

    card.appendChild(label);
    card.appendChild(valeurEl);
    card.appendChild(actions);
    return card;
  }

  function formatHoraires(horaires) {
    if (!horaires || Object.keys(horaires).length === 0) return "Non renseign\u00e9";
    var jours = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
    var parts = [];
    jours.forEach(function (j) {
      if (horaires[j]) parts.push(j.substring(0, 3) + " " + horaires[j]);
    });
    return parts.join(" | ") || "Non renseign\u00e9";
  }

  function openChampInfoForm(champ, fullData) {
    var form = document.getElementById("form-informations");
    var selectorContainer = document.getElementById("info-logo-selector");
    if (!form) return;

    form.reset();
    selectorContainer.innerHTML = "";

    form.elements["nom"].value = fullData.nom || "";
    form.elements["slogan"].value = fullData.slogan || "";
    form.elements["description"].value = fullData.description || "";
    form.elements["telephone"].value = fullData.telephone || "";
    form.elements["whatsapp"].value = fullData.whatsapp || "";
    form.elements["email"].value = fullData.email || "";
    form.elements["adresse"].value = fullData.adresse || "";
    form.elements["facebook"].value = fullData.facebook || "";
    form.elements["instagram"].value = fullData.instagram || "";
    form.elements["localisation"].value = fullData.localisation || "";

    renderHoraires(fullData.horaires || {});

    ImageSelector.createImageSelector({
      dossier: "logo",
      valeurInitiale: fullData.logo || "",
      container: selectorContainer,
      inputName: "logo"
    });

    var modalTitle = document.querySelector("#modal-informations h3");
    if (modalTitle) modalTitle.textContent = "Modifier - " + champ.label;

    openModal("modal-informations");
  }

  function openAjoutInfoSupplementaire() {
    var modal = document.getElementById("modal-info-supp");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "modal-info-supp";
      modal.className = "admin-modal";
      modal.setAttribute("role", "dialog");
      modal.setAttribute("aria-modal", "true");
      modal.innerHTML =
        '<div class="admin-modal-overlay" data-close-modal-info></div>' +
        '<div class="admin-modal-dialog admin-modal-small">' +
          '<button class="admin-modal-close" type="button" data-close-modal-info>&times;</button>' +
          '<h3>Ajouter une information</h3>' +
          '<form id="form-info-supp" class="admin-form">' +
            '<div class="form-field"><label for="info-supp-cle">Nom du champ</label><input id="info-supp-cle" name="cle" type="text" required maxlength="100" placeholder="ex: TikTok"></div>' +
            '<div class="form-field"><label for="info-supp-valeur">Valeur</label><input id="info-supp-valeur" name="valeur" type="text" required maxlength="500" placeholder="ex: https://tiktok.com/@sochou"></div>' +
            '<div class="form-field full form-actions">' +
              '<button type="button" class="btn btn-outline" data-close-modal-info>Annuler</button>' +
              '<button type="submit" class="btn btn-dark">Ajouter</button>' +
            '</div>' +
          '</form>' +
        '</div>';
      document.body.appendChild(modal);

      var self = this;
      modal.querySelectorAll("[data-close-modal-info]").forEach(function (el) {
        el.addEventListener("click", function () {
          modal.classList.add("hidden");
        });
      });

      var formS = document.getElementById("form-info-supp");
      formS.addEventListener("submit", function (e) {
        e.preventDefault();
        var cle = formS.elements["cle"].value.trim();
        var valeur = formS.elements["valeur"].value.trim();
        if (!cle) return;
        Informations.upsertChampSupplementaire(cle, valeur).then(function () {
          modal.classList.add("hidden");
          showToast("Information ajout\u00e9e");
          loadInformations();
        }).catch(function (err) {
          showToast("Erreur : " + err.message, "error");
        });
      });
    } else {
      var formS2 = document.getElementById("form-info-supp");
      if (formS2) formS2.reset();
      var titleEl = modal.querySelector("h3");
      if (titleEl) titleEl.textContent = "Ajouter une information";
    }
    modal.classList.remove("hidden");
  }

  function openEditInfoSupplementaire(cle, valeur) {
    openAjoutInfoSupplementaire();
    var modal = document.getElementById("modal-info-supp");
    var form = document.getElementById("form-info-supp");
    if (form) {
      form.elements["cle"].value = cle;
      form.elements["valeur"].value = valeur || "";
      var title = modal.querySelector("h3");
      if (title) title.textContent = "Modifier - " + cle;
    }
  }

  function openInformationsForm(data) {
    var form = document.getElementById("form-informations");
    var selectorContainer = document.getElementById("info-logo-selector");
    if (!form) return;

    form.reset();
    selectorContainer.innerHTML = "";

    form.elements["nom"].value = data.nom || "";
    form.elements["slogan"].value = data.slogan || "";
    form.elements["description"].value = data.description || "";
    form.elements["telephone"].value = data.telephone || "";
    form.elements["whatsapp"].value = data.whatsapp || "";
    form.elements["email"].value = data.email || "";
    form.elements["adresse"].value = data.adresse || "";
    form.elements["facebook"].value = data.facebook || "";
    form.elements["instagram"].value = data.instagram || "";
    form.elements["localisation"].value = data.localisation || "";

    renderHoraires(data.horaires || {});

    ImageSelector.createImageSelector({
      dossier: "logo",
      valeurInitiale: data.logo || "",
      container: selectorContainer,
      inputName: "logo"
    });

    var modalTitle = document.querySelector("#modal-informations h3");
    if (modalTitle) modalTitle.textContent = "Modifier les informations du salon";

    openModal("modal-informations");
  }

  function renderHoraires(horaires) {
    var container = document.getElementById("info-horaires-container");
    if (!container) return;
    container.innerHTML = "";
    var jours = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
    jours.forEach(function (jour) {
      var row = document.createElement("div");
      row.className = "horaire-row";
      var label = document.createElement("span");
      label.style.minWidth = "80px";
      label.style.fontSize = "0.85rem";
      label.textContent = jour;
      var input = document.createElement("input");
      input.type = "text";
      input.name = "horaire_" + jour;
      input.placeholder = "ex: 8h - 18h ou Ferm\u00e9";
      input.value = horaires[jour] || "";
      row.appendChild(label);
      row.appendChild(input);
      container.appendChild(row);
    });
  }

  function setupInformationsForm() {
    var form = document.getElementById("form-informations");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var horaires = {};
      var jours = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
      jours.forEach(function (jour) {
        var val = form.elements["horaire_" + jour];
        if (val && val.value.trim()) horaires[jour] = val.value.trim();
      });

      var data = {
        nom: form.elements["nom"].value,
        slogan: form.elements["slogan"].value,
        description: form.elements["description"].value,
        logo: form.elements["logo"] ? form.elements["logo"].value : "",
        telephone: form.elements["telephone"].value,
        whatsapp: form.elements["whatsapp"].value,
        email: form.elements["email"].value,
        adresse: form.elements["adresse"].value,
        horaires: horaires,
        facebook: form.elements["facebook"].value,
        instagram: form.elements["instagram"].value,
        localisation: form.elements["localisation"].value
      };

      Informations.updateInformationsGenerales(data).then(function () {
        closeAllModals();
        showToast("Informations mises \u00e0 jour");
        loadInformations();
      }).catch(function (err) {
        showToast("Erreur : " + err.message, "error");
      });
    });
  }

  /* ==================== FORMS SETUP ==================== */
  function setupForms() {
    setupServiceForm();
    setupGalerieForm();
    setupProduitForm();
    setupInformationsForm();
    setupCommandeFilter();

    var filter = document.getElementById("rdv-filter");
    if (filter) {
      filter.addEventListener("change", function () {
        loadRendezVous(filter.value);
      });
    }
  }

  /* ==================== BOUTIQUE (PRODUITS) ==================== */
  function loadProduits() {
    var loading = document.getElementById("produits-loading");
    var list = document.getElementById("produits-list");
    if (!list) return;
    if (loading) loading.textContent = "Chargement...";
    list.innerHTML = "";

    Produits.getProduits(false).then(function (produits) {
      if (loading) loading.classList.add("hidden");
      if (!produits.length) {
        list.innerHTML = '<p class="admin-loading">Aucun produit. Cliquez sur "Ajouter" pour commencer.</p>';
        return;
      }
      produits.forEach(function (prod) {
        list.appendChild(renderProduitCard(prod));
      });
    }).catch(function (err) {
      if (loading) loading.textContent = "Erreur : " + err.message;
    });
  }

  function renderProduitCard(prod) {
    var card = document.createElement("div");
    card.className = "admin-item-card";
    var imagePath = prod.image ? "../../" + prod.image : "";
    var imgHtml = imagePath
      ? '<img src="' + imagePath + '" alt="' + prod.nom + '" loading="lazy">'
      : '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#999;">Pas d\'image</div>';
    var prixFormatted = Number(prod.prix || 0).toLocaleString("fr-FR");
    var badgeClass = prod.actif ? "badge-actif" : "badge-inactif";

    card.innerHTML =
      '<div class="admin-item-card-image">' + imgHtml + '</div>' +
      '<div class="admin-item-card-body">' +
        '<h4 class="admin-item-card-title">' + escapeHtml(prod.nom) + '</h4>' +
        '<p class="admin-item-card-meta">' + prixFormatted + ' FCFA' + (prod.categorie ? ' • ' + escapeHtml(prod.categorie) : '') + '</p>' +
        '<span class="admin-badge ' + badgeClass + '">' + (prod.actif ? "Visible" : "Masqué") + '</span>' +
        '<div class="admin-item-card-actions">' +
          '<button class="btn btn-outline btn-sm" data-action="edit">Modifier</button>' +
          '<button class="btn btn-outline btn-sm" data-action="toggle">' + (prod.actif ? 'Masquer' : 'Afficher') + '</button>' +
          '<button class="btn btn-danger btn-sm" data-action="delete">Supprimer</button>' +
        '</div>' +
      '</div>';

    card.querySelector('[data-action="edit"]').addEventListener("click", function () {
      openProduitForm(prod);
    });
    card.querySelector('[data-action="toggle"]').addEventListener("click", function () {
      Produits.toggleProduitActif(prod.id, !prod.actif).then(function () {
        showToast(prod.actif ? "Produit masqué" : "Produit visible");
        loadProduits();
      }).catch(function (err) { showToast("Erreur : " + err.message, "error"); });
    });
    card.querySelector('[data-action="delete"]').addEventListener("click", function () {
      confirmDelete(function () {
        Produits.deleteProduit(prod.id).then(function () {
          showToast("Produit supprimé");
          loadProduits();
        }).catch(function (err) { showToast("Erreur : " + err.message, "error"); });
      });
    });

    return card;
  }

  function openProduitForm(prod) {
    var form = document.getElementById("form-produit");
    var title = document.getElementById("modal-produit-title");
    var selectorContainer = document.getElementById("produit-image-selector");
    if (!form) return;

    form.reset();
    selectorContainer.innerHTML = "";

    var isEdit = !!prod;
    title.textContent = isEdit ? "Modifier le produit" : "Ajouter un produit";
    form.elements["id"].value = prod ? prod.id : "";
    form.elements["nom"].value = prod ? prod.nom : "";
    form.elements["prix"].value = prod ? prod.prix : "";
    form.elements["categorie"].value = prod ? prod.categorie : "";
    form.elements["ordre"].value = prod ? prod.ordre : 0;
    form.elements["description"].value = prod ? prod.description : "";
    form.elements["caracteristiques"].value = prod ? prod.caracteristiques : "";
    form.elements["actif"].checked = prod ? prod.actif : true;

    ImageSelector.createImageSelector({
      dossier: "produits",
      valeurInitiale: prod ? prod.image : "",
      container: selectorContainer,
      inputName: "image"
    });

    openModal("modal-produit");
  }

  function setupProduitForm() {
    var form = document.getElementById("form-produit");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var id = form.elements["id"].value;
      var data = {
        nom: form.elements["nom"].value,
        prix: form.elements["prix"].value,
        categorie: form.elements["categorie"].value,
        ordre: form.elements["ordre"].value,
        description: form.elements["description"].value,
        caracteristiques: form.elements["caracteristiques"] ? form.elements["caracteristiques"].value : "",
        image: form.elements["image"] ? form.elements["image"].value : "",
        actif: form.elements["actif"].checked
      };

      var promise = id ? Produits.updateProduit(id, data) : Produits.addProduit(data);
      promise.then(function () {
        closeAllModals();
        showToast(id ? "Produit modifié" : "Produit ajouté");
        loadProduits();
      }).catch(function (err) {
        showToast("Erreur : " + err.message, "error");
      });
    });

    var addBtn = document.getElementById("btn-add-produit");
    if (addBtn) addBtn.addEventListener("click", function () { openProduitForm(null); });
  }

  /* ==================== COMMANDES ==================== */
  function loadCommandes(filter) {
    var loading = document.getElementById("commandes-loading");
    var list = document.getElementById("commandes-list");
    if (!list) return;
    if (loading) loading.textContent = "Chargement...";
    list.innerHTML = "";

    Commandes.getCommandes(filter || null).then(function (items) {
      if (loading) loading.classList.add("hidden");
      if (!items.length) {
        list.innerHTML = '<p class="admin-loading">Aucune commande.</p>';
        return;
      }
      items.forEach(function (cmd) {
        list.appendChild(renderCommandeItem(cmd));
      });
    }).catch(function (err) {
      if (loading) loading.textContent = "Erreur : " + err.message;
    });
  }

  function renderCommandeItem(cmd) {
    var div = document.createElement("div");
    div.className = "admin-rdv-item";
    var badgeClass = "badge-" + cmd.statut;
    var statutLabel = { en_attente: "En attente", confirme: "Confirmée", annule: "Annulée", livree: "Livrée" };
    var totalFormatted = Number(cmd.total || 0).toLocaleString("fr-FR");

    div.innerHTML =
      '<div class="admin-rdv-info">' +
        '<h4>' + escapeHtml(cmd.nomClient || "Anonyme") + '</h4>' +
        '<p>' + escapeHtml(cmd.produit || "Produit non spécifié") + ' × ' + (cmd.quantite || 1) + '</p>' +
        '<p>' + escapeHtml(cmd.telephone || "Pas de téléphone") + ' • Total : ' + totalFormatted + ' FCFA</p>' +
        (cmd.message ? '<p style="font-style:italic;">' + escapeHtml(cmd.message) + '</p>' : '') +
        '<span class="admin-badge ' + badgeClass + '">' + (statutLabel[cmd.statut] || cmd.statut) + '</span>' +
      '</div>' +
      '<div class="admin-rdv-actions">' +
        '<button class="btn btn-outline btn-sm" data-action="confirm">Confirmer</button>' +
        '<button class="btn btn-outline btn-sm" data-action="livree">Livrée</button>' +
        '<button class="btn btn-outline btn-sm" data-action="annule">Annuler</button>' +
        '<button class="btn btn-danger btn-sm" data-action="delete">Supprimer</button>' +
      '</div>';

    div.querySelector('[data-action="confirm"]').addEventListener("click", function () {
      Commandes.setStatut(cmd.id, "confirme").then(function () {
        showToast("Commande confirmée");
        loadCommandes(document.getElementById("commande-filter").value);
      });
    });
    div.querySelector('[data-action="livree"]').addEventListener("click", function () {
      Commandes.setStatut(cmd.id, "livree").then(function () {
        showToast("Commande marquée livrée");
        loadCommandes(document.getElementById("commande-filter").value);
      });
    });
    div.querySelector('[data-action="annule"]').addEventListener("click", function () {
      Commandes.setStatut(cmd.id, "annule").then(function () {
        showToast("Commande annulée");
        loadCommandes(document.getElementById("commande-filter").value);
      });
    });
    div.querySelector('[data-action="delete"]').addEventListener("click", function () {
      confirmDelete(function () {
        Commandes.deleteCommande(cmd.id).then(function () {
          showToast("Commande supprimée");
          loadCommandes(document.getElementById("commande-filter").value);
        });
      });
    });

    return div;
  }

  function setupCommandeFilter() {
    var filter = document.getElementById("commande-filter");
    if (filter) {
      filter.addEventListener("change", function () {
        loadCommandes(filter.value);
      });
    }
  }

  /* ==================== UTILITAIRES ==================== */
  function escapeHtml(str) {
    if (!str) return "";
    var div = document.createElement("div");
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

})(window);
