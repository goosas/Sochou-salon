/* =========================================================
   SOCHOU HAIR BEAUTY SALON - Administration
   Gestion des commandes, rendez-vous, produits, services
   et paramètres depuis la base locale (localStorage).
   ========================================================= */
(function (window) {
  "use strict";

    var D = window.SochouData;
  if (!D) return;

  var STATUSES = D.STATUSES;
  var CATEGORIES = D.CATEGORIES;
  var ADMIN_CODE = D.ADMIN_CODE || "2580";
  var adminAttempts = 0;

  function $(id) { return document.getElementById(id); }

  /**
   * ---- Sécurité page admin ----
   *  Affiche un écran de connexion tant que le code n'est pas validé.
   *  Après 2 tentatives incorrectes → redirection vers ../index.html
   */
  function checkAdminAccess(callback) {
    var loginScreen = $("admin-login-screen");
    var mainContent = $("admin-main-content");
    var form = $("admin-login-form");
    var input = $("admin-code");
    var errors = $("admin-code-errors");

    // Si la page n'a pas d'écran de login → callback direct
    if (!loginScreen || !form) {
      if (callback) callback();
      return;
    }

    // Déjà validé dans cette session ?
    if (sessionStorage.getItem("adminAccess") === "true") {
      loginScreen.style.display = "none";
      mainContent.style.display = "block";
      if (callback) callback();
      return;
    }

    // Sinon, on bloque l'accès au contenu et on montre le login
    loginScreen.style.display = "flex";
    mainContent.style.display = "none";

    // Empêche la validation HTML5 native (on gère soi-même)
    form.addEventListener("submit", function(e) {
      e.preventDefault();
      e.stopImmediatePropagation();
      var code = input.value.trim();
      if (code === ADMIN_CODE) {
        sessionStorage.setItem("adminAccess", "true");
        loginScreen.style.display = "none";
        mainContent.style.display = "block";
        input.value = "";
        if (callback) callback(); // init() se lance après validation
      } else {
        adminAttempts++;
        errors.textContent = "Code incorrect. Tentative " + adminAttempts + " / 2.";
        input.value = "";
        input.focus();
        if (adminAttempts >= 2) {
          // Redirection après 2 tentatives erronées
          setTimeout(function() {
            window.location.href = "index.html";
          }, 800);
        }
      }
    });

    input.focus();
  }

     // Lancer la vérification dès le chargement
   // (checkAdminAccess(init) est déplacée vers la fin du fichier)



  function escapeAttr(value) { return D.escapeHtml(value); }

  /* ---------- Badge coloré selon le statut ---------- */
  function badgeClass(statut) {
    var s = String(statut || "").toLowerCase()
      .replace(/[éèê]/g, "e").replace(/[àâ]/g, "a")
      .replace(/[ç]/g, "c").replace(/[ô]/g, "o").replace(/[ûù]/g, "u");
    if (s.indexOf("livr") > -1 || s.indexOf("confirme") > -1 || s.indexOf("termine") > -1) return "is-confirme";
    if (s.indexOf("annul") > -1) return "is-annule";
    if (s.indexOf("cours") > -1) return "is-en-cours";
    return "is-nouveau";
  }

  function badge(statut) {
    return '<span class="badge ' + badgeClass(statut) + '">' + escapeAttr(statut || "-") + "</span>";
  }

  function statusOptions(statuses, current) {
    return statuses.map(function (s) {
      return '<option value="' + escapeAttr(s) + '"' + (s === current ? " selected" : "") + ">" + escapeAttr(s) + "</option>";
    }).join("");
  }

  /* ---------- Onglets ---------- */
  function initTabs() {
    var tabs = document.querySelectorAll("[data-admin-tab]");
    var panels = document.querySelectorAll("[data-admin-panel]");
    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        var target = tab.dataset.adminTab;
        tabs.forEach(function (t) { t.classList.toggle("is-active", t === tab); });
        panels.forEach(function (panel) {
          panel.classList.toggle("is-active", panel.dataset.adminPanel === target);
        });
        if (target === "dashboard") renderDashboard();
      });
    });
  }

  /* ---------- Tableau de bord ---------- */
  function renderDashboard() {
    var orders = D.getOrders();
    var appointments = D.getAppointments();
    var statsNode = $("admin-stats");
    if (!statsNode) return;

    statsNode.innerHTML =
      '<div class="stat-card"><span>Commandes</span><strong>' + orders.length + "</strong></div>" +
      '<div class="stat-card"><span>Rendez-vous</span><strong>' + appointments.length + "</strong></div>" +
      '<div class="stat-card"><span>Produits</span><strong>' + D.getProducts().length + "</strong></div>" +
      '<div class="stat-card"><span>Services</span><strong>' + D.getServices().length + "</strong></div>";

    var recent = [];
    orders.forEach(function (o) {
      recent.push({ date: o.date, html: "Commande — <strong>" + escapeAttr(o.article) + "</strong> · " + escapeAttr(o.phone) + " · " + badge(o.statut) });
    });
    appointments.forEach(function (a) {
      recent.push({ date: a.created, html: "Rendez-vous — <strong>" + escapeAttr(a.name) + "</strong> · " + escapeAttr(a.service || "—") + " · " + badge(a.statut) });
    });
    recent.sort(function (a, b) { return String(b.date || "").localeCompare(String(a.date || "")); });
    recent = recent.slice(0, 8);

    var list = $("admin-recent");
    if (!list) return;
    list.innerHTML = recent.length
      ? recent.map(function (r) {
          return "<li><span>" + r.html + '</span><time class="count">' + escapeAttr(D.formatDateTime(r.date)) + "</time></li>";
        }).join("")
      : "<li><span>Aucune demande reçue pour le moment.</span></li>";
  }

  /* ---------- Commandes ---------- */
  function renderOrders() {
    var tbody = document.querySelector("#orders-table tbody");
    if (!tbody) return;
    var orders = D.getOrders();
    $("orders-count").textContent = orders.length ? orders.length + " commande(s)" : "Aucune commande";

    if (!orders.length) {
      tbody.innerHTML = '<tr><td colspan="7" class="muted">Aucune commande reçue pour le moment.</td></tr>';
      return;
    }

    tbody.innerHTML = orders.map(function (o) {
      return (
        "<tr>" +
          "<td>" + escapeAttr(o.article) + "</td>" +
          "<td>" + escapeAttr(o.phone) + "</td>" +
          "<td>" + (o.quantite || 1) + "</td>" +
          "<td><strong>" + D.formatPrice(o.total) + " FCFA</strong></td>" +
          '<td class="muted">' + escapeAttr(D.formatDateTime(o.date)) + "</td>" +
          "<td>" + badge(o.statut) + "</td>" +
          '<td><div class="admin-row-actions">' +
            '<select class="admin-select" data-status="order" data-id="' + escapeAttr(o.id) + '">' + statusOptions(STATUSES.order, o.statut) + "</select>" +
            '<button class="btn btn-danger btn-sm" type="button" data-delete-order="' + escapeAttr(o.id) + '">Supprimer</button>' +
          "</div></td>" +
        "</tr>"
      );
    }).join("");
  }

  /* ---------- Rendez-vous ---------- */
  function renderAppointments() {
    var tbody = document.querySelector("#appointments-table tbody");
    if (!tbody) return;
    var appointments = D.getAppointments();
    $("appointments-count").textContent = appointments.length ? appointments.length + " rendez-vous" : "Aucun rendez-vous";

    if (!appointments.length) {
      tbody.innerHTML = '<tr><td colspan="7" class="muted">Aucun rendez-vous reçu pour le moment.</td></tr>';
      return;
    }

    tbody.innerHTML = appointments.map(function (a) {
      return (
        "<tr>" +
          "<td><strong>" + escapeAttr(a.name) + "</strong></td>" +
          "<td>" + escapeAttr(a.phone) + "</td>" +
          "<td>" + escapeAttr(a.service || "—") + "</td>" +
          "<td>" + escapeAttr(a.date || "—") + "</td>" +
          '<td class="muted">' + escapeAttr(a.message || "—") + "</td>" +
          "<td>" + badge(a.statut) + "</td>" +
          '<td><div class="admin-row-actions">' +
            '<select class="admin-select" data-status="appointment" data-id="' + escapeAttr(a.id) + '">' + statusOptions(STATUSES.appointment, a.statut) + "</select>" +
            '<button class="btn btn-danger btn-sm" type="button" data-delete-appointment="' + escapeAttr(a.id) + '">Supprimer</button>' +
          "</div></td>" +
        "</tr>"
      );
    }).join("");
  }

  /* ---------- Changement de statut (délégation) ---------- */
  document.addEventListener("change", function (event) {
    var select = event.target;
    if (!select.dataset || select.dataset.status !== "order" && select.dataset.status !== "appointment") return;

    var id = select.dataset.id;
    var statut = select.value;

    if (select.dataset.status === "order") {
      D.saveOrders(D.getOrders().map(function (o) {
        if (o.id === id) o.statut = statut;
        return o;
      }));
      renderOrders();
      D.showToast("Statut de la commande mis à jour.");
    } else {
      D.saveAppointments(D.getAppointments().map(function (a) {
        if (a.id === id) a.statut = statut;
        return a;
      }));
      renderAppointments();
      D.showToast("Statut du rendez-vous mis à jour.");
    }
  });

  /* ---------- Suppression (délégation) ---------- */
  document.addEventListener("click", function (event) {
    var btn = event.target.closest ? event.target.closest("[data-delete-order], [data-delete-appointment], [data-delete-product], [data-delete-service]") : null;
    if (!btn) {
      var editBtn = event.target.closest ? event.target.closest("[data-edit-product], [data-edit-service]") : null;
      if (!editBtn) return;
      var id = editBtn.dataset.editProduct || editBtn.dataset.editService;
      var isProduct = editBtn.hasAttribute("data-edit-product");
      var list = isProduct ? D.getProducts() : D.getServices();
      var item = list.filter(function (x) { return x.id === id; })[0];
      if (item) { isProduct ? openProductForm(item) : openServiceForm(item); }
      return;
    }

    var label = btn.hasAttribute("data-delete-order") ? "cette commande" :
      btn.hasAttribute("data-delete-appointment") ? "ce rendez-vous" :
      btn.hasAttribute("data-delete-product") ? "ce produit" : "ce service";

    if (!window.confirm("Supprimer définitivement " + label + " ?")) return;

    var id = btn.getAttribute("data-delete-order") || btn.getAttribute("data-delete-appointment") ||
      btn.getAttribute("data-delete-product") || btn.getAttribute("data-delete-service");
    if (!id) return;

    if (btn.hasAttribute("data-delete-order")) {
      D.saveOrders(D.getOrders().filter(function (o) { return o.id !== id; }));
      renderAll();
      D.showToast("Commande supprimée.");
    } else if (btn.hasAttribute("data-delete-appointment")) {
      D.saveAppointments(D.getAppointments().filter(function (a) { return a.id !== id; }));
      renderAll();
      D.showToast("Rendez-vous supprimé.");
    } else if (btn.hasAttribute("data-delete-product")) {
      D.saveProducts(D.getProducts().filter(function (p) { return p.id !== id; }));
      renderAll();
      D.showToast("Produit supprimé.");
    } else {
      D.saveServices(D.getServices().filter(function (s) { return s.id !== id; }));
      renderAll();
      D.showToast("Service supprimé.");
    }
  });

  /* ---------- Produits ---------- */
  function renderProducts() {
    var tbody = document.querySelector("#products-table tbody");
    if (!tbody) return;
    var products = D.getProducts();

    if (!products.length) {
      tbody.innerHTML = '<tr><td colspan="5" class="muted">Aucun produit pour le moment.</td></tr>';
      return;
    }

    var labels = {};
    CATEGORIES.forEach(function (c) { labels[c.key] = c.label; });

    tbody.innerHTML = products.map(function (p) {
      return (
        "<tr>" +
          "<td><strong>" + escapeAttr(p.nom) + "</strong></td>" +
          "<td>" + escapeAttr(labels[p.categorie] || p.categorie || "—") + "</td>" +
          "<td><strong>" + D.formatPrice(p.prix) + "</strong></td>" +
          '<td class="muted">' + escapeAttr(p.image || "—") + "</td>" +
          '<td><div class="admin-row-actions">' +
            '<button class="btn btn-outline-dark btn-sm" type="button" data-edit-product="' + escapeAttr(p.id) + '">Modifier</button>' +
            '<button class="btn btn-danger btn-sm" type="button" data-delete-product="' + escapeAttr(p.id) + '">Supprimer</button>' +
          "</div></td>" +
        "</tr>"
      );
    }).join("");
  }

  function fillCategorySelect() {
    var select = $("product-categorie");
    if (!select) return;
    select.innerHTML = CATEGORIES.map(function (c) {
      return '<option value="' + escapeAttr(c.key) + '">' + escapeAttr(c.label) + "</option>";
    }).join("");
  }

  function openProductForm(product) {
    var form = $("product-form");
    if (!form) return;
    form.classList.remove("is-hidden");
    $("product-form-title").textContent = product ? "Modifier le produit" : "Nouveau produit";
    $("product-id").value = product ? product.id : "";
    $("product-nom").value = product ? product.nom : "";
    $("product-prix").value = product ? product.prix : "";
    $("product-categorie").value = product ? product.categorie : CATEGORIES[0].key;
    $("product-image").value = product ? (product.image || "") : "";
    $("product-description").value = product ? (product.description || "") : "";
    $("product-caracteristiques").value = product ? (product.caracteristiques || []).join("\n") : "";
    form.scrollIntoView({ behavior: "smooth", block: "nearest" });
    $("product-nom").focus();
  }

  function closeProductForm() {
    var form = $("product-form");
    if (form) form.classList.add("is-hidden");
  }

  $("product-form").addEventListener("submit", function (event) {
    event.preventDefault();
    var editId = $("product-id").value;
    var data = {
      nom: $("product-nom").value.trim(),
      prix: parseInt($("product-prix").value, 10) || 0,
      categorie: $("product-categorie").value,
      description: $("product-description").value.trim(),
      caracteristiques: $("product-caracteristiques").value.split("\n").map(function (line) { return line.trim(); }).filter(Boolean),
      image: $("product-image").value.trim()
    };

    var products = D.getProducts();
    if (editId) {
      products = products.map(function (p) {
        if (p.id === editId) return Object.assign({}, p, data);
        return p;
      });
    } else {
      data.id = D.uid();
      products.unshift(data);
    }
    D.saveProducts(products);
    closeProductForm();
    renderAll();
    D.showToast(editId ? "Produit modifié avec succès." : "Produit ajouté avec succès.");
  });

  document.querySelectorAll("[data-new-product]").forEach(function (btn) {
    btn.addEventListener("click", function () { openProductForm(null); });
  });

  document.querySelectorAll("[data-cancel-product]").forEach(function (btn) {
    btn.addEventListener("click", closeProductForm);
  });

  /* ---------- Services ---------- */
  function renderServices() {
    var tbody = document.querySelector("#services-table tbody");
    if (!tbody) return;
    var services = D.getServices();

    if (!services.length) {
      tbody.innerHTML = '<tr><td colspan="4" class="muted">Aucun service pour le moment.</td></tr>';
      return;
    }

    tbody.innerHTML = services.map(function (s) {
      return (
        "<tr>" +
          "<td><strong>" + escapeAttr(s.nom) + "</strong></td>" +
          '<td class="muted">' + escapeAttr(s.description || "—") + "</td>" +
          "<td>" + escapeAttr(s.icone || "—") + "</td>" +
          '<td><div class="admin-row-actions">' +
            '<button class="btn btn-outline-dark btn-sm" type="button" data-edit-service="' + escapeAttr(s.id) + '">Modifier</button>' +
            '<button class="btn btn-danger btn-sm" type="button" data-delete-service="' + escapeAttr(s.id) + '">Supprimer</button>' +
          "</div></td>" +
        "</tr>"
      );
    }).join("");
  }

  function openServiceForm(service) {
    var form = $("service-form");
    if (!form) return;
    form.classList.remove("is-hidden");
    $("service-form-title").textContent = service ? "Modifier le service" : "Nouveau service";
    $("service-id").value = service ? service.id : "";
    $("service-nom").value = service ? service.nom : "";
    $("service-icone").value = service ? (service.icone || "") : "";
    $("service-image").value = service ? (service.image || "") : "";
    $("service-description").value = service ? (service.description || "") : "";
    form.scrollIntoView({ behavior: "smooth", block: "nearest" });
    $("service-nom").focus();
  }

  function closeServiceForm() {
    var form = $("service-form");
    if (form) form.classList.add("is-hidden");
  }

  $("service-form").addEventListener("submit", function (event) {
    event.preventDefault();
    var editId = $("service-id").value;
    var data = {
      nom: $("service-nom").value.trim(),
      description: $("service-description").value.trim(),
      icone: $("service-icone").value.trim(),
      image: $("service-image").value.trim()
    };

    var services = D.getServices();
    if (editId) {
      services = services.map(function (s) {
        if (s.id === editId) return Object.assign({}, s, data);
        return s;
      });
    } else {
      data.id = D.uid();
      services.unshift(data);
    }
    D.saveServices(services);
    closeServiceForm();
    renderAll();
    D.showToast(editId ? "Service modifié avec succès." : "Service ajouté avec succès.");
  });

  document.querySelectorAll("[data-new-service]").forEach(function (btn) {
    btn.addEventListener("click", function () { openServiceForm(null); });
  });

  document.querySelectorAll("[data-cancel-service]").forEach(function (btn) {
    btn.addEventListener("click", closeServiceForm);
  });

  /* ---------- Paramètres du salon ---------- */
  function loadSettings() {
    var form = $("settings-form");
    if (!form) return;
    var s = D.getSettings();
    $("settings-phone").value = s.phone || "";
    $("settings-whatsapp").value = s.whatsapp || "";
    $("settings-address").value = s.address || "";
    $("settings-email").value = s.email || "";
    $("settings-horaires").value = s.horaires || "";
  }

  $("settings-form").addEventListener("submit", function (event) {
    event.preventDefault();
    var settings = {
      phone: $("settings-phone").value.trim(),
      whatsapp: $("settings-whatsapp").value.trim(),
      address: $("settings-address").value.trim(),
      email: $("settings-email").value.trim(),
      horaires: $("settings-horaires").value.trim()
    };
    D.saveSettings(settings);
    D.applySettingsToSite();
    D.showToast("Paramètres enregistrés.");
  });

  /* ---------- Rendu global ---------- */
  function renderAll() {
    renderDashboard();
    renderOrders();
    renderAppointments();
    renderProducts();
    renderServices();
  }

  /* ---------- Sélecteur d'image (chemin auto-rempli) ---------- */
  function initImagePickers() {
    document.querySelectorAll("[data-image-pick]").forEach(function (btn) {
      var target = document.getElementById(btn.dataset.imagePick);
      var picker = document.getElementById(btn.dataset.imagePick + "-file");
      if (!target || !picker) return;

      // Ouvre le sélecteur de fichier natif
      btn.addEventListener("click", function () { picker.click(); });

      // À la sélection -> le chemin est récupéré automatiquement dans le champ
      picker.addEventListener("change", function () {
        var file = picker.files && picker.files[0];
        if (!file) return;

        var isProduct = btn.dataset.imagePick.indexOf("product") === 0;
        var folder = isProduct ? "../images/produits/" : "../images/services/";
        var rel = file.webkitRelativePath || "";

        // Si le navigateur fournit un chemin relatif vers images/, on le garde,
        // sinon on remplit images/<dossier>/ + nom du fichier choisi.
        var path = (rel && rel.toLowerCase().indexOf("../images/") === 0) ? rel : folder + file.name;
        target.value = path;
        target.setAttribute("title", "Chemin enregistré : " + path);
        picker.value = "";
      });
    });
  }

  /* ---------- Initialisation ---------- */
  function init() {
    fillCategorySelect();
    initImagePickers();
    initTabs();
    loadSettings();
    renderAll();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() {
      checkAdminAccess(init);
    });
  } else {
    checkAdminAccess(init);
  }
})(window);