/* =========================================================
   SOCHOU HAIR BEAUTY SALON - Utilitaires UI partagés
   ========================================================= */
(function (window) {
  "use strict";

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

  /* ---------- API publique ---------- */
  window.SochouData = {
    showToast: showToast,
    showThankYou: showThankYou
  };
})(window);
