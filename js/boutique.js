/* =========================================================
   SOCHOU HAIR BEAUTY SALON - Boutique
   Détails produits et commandes (chargement dynamique depuis Firestore)
   ========================================================= */

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

  // Délégation d'événements pour les boutons Détails
  document.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-details]");
    if (btn) {
      const card = btn.closest(".product-card");
      if (card) openDetails(card);
    }
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

  // Délégation d'événements pour les boutons Commander
  document.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-commander]");
    if (btn) {
      const card = btn.closest(".product-card");
      if (card) loadOrder(card);
    }
  });

  orderQuantity.addEventListener("input", updateTotal);

  orderForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const quantity = parseInt(orderQuantity.value, 10) || 1;
    const total = quantity * currentUnitPrice;
    const submitBtn = orderForm.querySelector("button[type='submit']");

    const data = {
      nomClient: "Client boutique",
      telephone: orderPhone.value.trim(),
      produit: orderArticle.value,
      quantite: quantity,
      prixUnitaire: currentUnitPrice,
      total: total,
      message: ""
    };

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Envoi en cours...";
    }

    if (window.SochouCommandes) {
      window.SochouCommandes.createCommande(data).then(() => {
        orderForm.reset();
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "Lancer ma commande";
        }
        closeModal(orderModal);
        if (window.SochouData && window.SochouData.showThankYou) {
          window.SochouData.showThankYou(
            "Merci pour votre commande !",
            "Nous avons bien reçu votre demande et nous vous contacterons très rapidement pour la finaliser."
          );
        }
      }).catch((err) => {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "Lancer ma commande";
        }
        closeModal(orderModal);
        if (window.SochouData && window.SochouData.showToast) {
          window.SochouData.showToast("Erreur lors de l'envoi : " + err.message, "error");
        }
      });
    } else {
      orderForm.reset();
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Lancer ma commande";
      }
      closeModal(orderModal);
      if (window.SochouData && window.SochouData.showThankYou) {
        window.SochouData.showThankYou(
          "Merci pour votre commande !",
          "Nous avons bien reçu votre demande et nous vous contacterons très rapidement pour la finaliser."
        );
      }
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