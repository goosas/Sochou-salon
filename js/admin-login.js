/**
 * SOCHOU HAIR BEAUTY SALON - Page de connexion admin
 * ====================================================
 * Gère l'authentification et la redirection vers le dashboard.
 */

(function (window) {
  "use strict";

  const { login } = window.SochouAuth;
  const { getCurrentUser } = window.SochouAuth;

  document.addEventListener("DOMContentLoaded", function () {
    // Si déjà connecté, rediriger vers le dashboard
    const user = getCurrentUser();
    if (user) {
      window.location.href = "dashboard.html";
      return;
    }

    var form = document.getElementById("login-form");
    var errorEl = document.getElementById("login-error");
    var loginBtn = document.getElementById("login-btn");

    if (!form) return;

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      errorEl.textContent = "";

      var email = document.getElementById("login-email").value.trim();
      var password = document.getElementById("login-password").value;

      if (!email || !password) {
        errorEl.textContent = "Veuillez remplir tous les champs.";
        return;
      }

      loginBtn.disabled = true;
      loginBtn.textContent = "Connexion en cours...";

      login(email, password)
        .then(function () {
          window.location.href = "dashboard.html";
        })
        .catch(function (err) {
          var message = "Erreur de connexion.";
          if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
            message = "Email ou mot de passe incorrect.";
          } else if (err.code === "auth/invalid-email") {
            message = "Format d'email invalide.";
          } else if (err.code === "auth/too-many-requests") {
            message = "Trop de tentatives. Réessayez plus tard.";
          } else if (err.message) {
            message = err.message;
          }
          errorEl.textContent = message;
          loginBtn.disabled = false;
          loginBtn.textContent = "Se connecter";
        });
    });
  });
})(window);
