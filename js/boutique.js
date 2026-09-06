/* =========================================================
   SOCHOU HAIR BEAUTY SALON - Boutique
   Rendu du catalogue, détails produits et commandes
   ========================================================= */

/* ---------- Rendu du catalogue depuis la base locale ---------- */
(function renderCatalog() {
  if (!window.SochouData) return;

  var products = window.SochouData.getProducts();
  var grids = {
    cosmetiques: document.getElementById("grid-cosmetiques"),
    meches: document.getElementById("grid-meches"),
    perruques: document.getElementById("grid-perruques"),
    outils: document.getElementById("grid-outils")
  };

  products.forEach(function (product) {
    var grid = grids[product.categorie] || grids.cosmetiques;
    if (!grid) return;

    var name = window.SochouData.escapeHtml(product.nom);
    var desc = window.SochouData.escapeHtml(product.description);
    var price = window.SochouData.formatPrice(product.prix);
    var chars = (product.caracteristiques || []).join("|").replace(/"/g, "&quot;");
    var image = window.SochouData.resolveImagePath(product.image || "images/produits/huile de coco.jpeg");

    var card =
      '<article class="card product-card" data-nom="' + name + '" data-prix="' + product.prix + '" data-caracteristiques="' + chars + '">' +
        '<div class="card-media"><img src="' + image + '" alt="' + name + '"></div>' +
        '<div class="card-body">' +
          '<h3 class="product-name">' + name + '</h3>' +
          '<p class="product-price">Prix unitaire : <strong>' + price + ' FCFA</strong></p>' +
          '<p class="product-desc">' + desc + '</p>' +
          '<div class="product-actions">' +
            '<button class="btn btn-outline-dark" type="button" data-details>Détails</button>' +
            '<button class="btn btn-primary" type="button" data-commander>Commander</button>' +
          '</div>' +
        '</div>' +
      '</article>';

    grid.insertAdjacentHTML("beforeend", card);
  });
})();

const detailsModal = document.getElementById("details-modal");
const orderModal = document.getElementById("order-modal");

let currentCard = null;
let currentUnitPrice = 0;

const formatPrice = (value) => Number(value).toLocaleString("fr-FR");

const openModal = (modal) => {
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
};

const closeModal = (modal) => {
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
};

/* ---------- Modal Détails ---------- */
if (detailsModal) {
  const detailsImage = document.getElementById("details-image");
  const detailsTitle = document.getElementById("details-title");
  const detailsPrice = document.getElementById("details-price");
  const detailsList = document.getElementById("details-list");
  const detailsOrder = document.getElementById("details-order");

  const openDetails = (card) => {
    currentCard = card;
    const image = card.querySelector(".card-media img");
    const characteristics = card.dataset.caracteristiques
      ? card.dataset.caracteristiques.split("|")
      : [];

    detailsImage.src = image ? image.src : "";
    detailsImage.alt = card.dataset.nom;
    detailsTitle.textContent = card.dataset.nom;
    detailsPrice.textContent = `Prix unitaire : ${formatPrice(card.dataset.prix)} FCFA`;
    detailsList.innerHTML = characteristics
      .map((item) => `<li>${item}</li>`)
      .join("");

    openModal(detailsModal);
  };

  document.querySelectorAll("[data-details]").forEach((button) => {
    button.addEventListener("click", () => {
      const card = button.closest(".product-card");
      if (card) openDetails(card);
    });
  });

  if (detailsOrder) {
    detailsOrder.addEventListener("click", () => {
      closeModal(detailsModal);
      if (currentCard) loadOrder(currentCard);
    });
  }
}

/* ---------- Modal Commande ---------- */
if (orderModal) {
  const orderForm = document.getElementById("order-form");
  const orderArticle = document.getElementById("order-article");
  const orderPhone = document.getElementById("order-phone");
  const orderQuantity = document.getElementById("order-quantite");
  const orderTotal = document.getElementById("order-total");

  const updateTotal = () => {
    const quantity = Math.max(1, parseInt(orderQuantity.value, 10) || 1);
    const total = quantity * currentUnitPrice;
    orderTotal.value = `${formatPrice(total)} FCFA`;
  };

  const loadOrder = (card) => {
    currentUnitPrice = parseFloat(card.dataset.prix) || 0;
    orderArticle.value = card.dataset.nom;
    orderPhone.value = "";
    orderQuantity.value = 1;
    updateTotal();
    openModal(orderModal);
    setTimeout(() => orderPhone.focus(), 80);
  };

  document.querySelectorAll("[data-commander]").forEach((button) => {
    button.addEventListener("click", () => {
      const card = button.closest(".product-card");
      if (card) loadOrder(card);
    });
  });

  orderQuantity.addEventListener("input", updateTotal);

  orderForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const quantity = parseInt(orderQuantity.value, 10) || 1;

    if (window.SochouData) {
      window.SochouData.addOrder({
        id: window.SochouData.uid(),
        article: orderArticle.value,
        phone: orderPhone.value.trim(),
        quantite: quantity,
        total: quantity * currentUnitPrice,
        date: new Date().toISOString(),
        statut: "Nouvelle"
      });
    }

    orderForm.reset();
    closeModal(orderModal);

    if (window.SochouData && window.SochouData.showThankYou) {
      window.SochouData.showThankYou(
        "Merci pour votre commande !",
        "Nous avons bien reçu votre demande et nous vous contacterons très rapidement pour la finaliser. Nous espérons que nos produits vous apporteront entière satisfaction et restons à votre écoute."
      );
    }
  });
}

/* ---------- Fermeture commune (fond, bouton ×, touche Échap) ---------- */
const closeAllShopModals = () => {
  if (detailsModal && detailsModal.classList.contains("is-open")) {
    closeModal(detailsModal);
  }
  if (orderModal && orderModal.classList.contains("is-open")) {
    closeModal(orderModal);
  }
};

document.querySelectorAll("[data-shop-close]").forEach((element) => {
  element.addEventListener("click", closeAllShopModals);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeAllShopModals();
});