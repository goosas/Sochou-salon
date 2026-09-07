/**
 * SOCHOU HAIR BEAUTY SALON - Authentification Firebase
 * ====================================================
 * Gère la connexion/déconnexion de l'administrateur.
 */

(function (window) {
  "use strict";

  const { getAuth, initFirebase } = window.SochouFirebase;

  /**
   * Observe les changements d'état d'authentification.
   * @param {Function} onConnecté - appelé avec l'utilisateur Firebase
   * @param {Function} onDéconnecté - appelé quand l'utilisateur se déconnecte
   * @returns {Function} fonction de désabonnement
   */
  function onAuthStateChanged(onConnecté, onDéconnecté) {
    initFirebase();
    const auth = getAuth();
    return auth.onAuthStateChanged(function (user) {
      if (user) {
        onConnecté(user);
      } else {
        onDéconnecté();
      }
    });
  }

  /**
   * Connecte un administrateur avec email/mot de passe.
   * @returns {Promise<User>}
   */
  function login(email, password) {
    initFirebase();
    const auth = getAuth();
    return auth.signInWithEmailAndPassword(email, password);
  }

  /**
   * Déconnecte l'utilisateur actuel.
   * @returns {Promise<void>}
   */
  function logout() {
    const auth = getAuth();
    return auth.signOut();
  }

  /**
   * Récupère l'utilisateur actuellement connecté (ou null).
   */
  function getCurrentUser() {
    try {
      const auth = getAuth();
      return auth.currentUser;
    } catch (e) {
      return null;
    }
  }

  // Exposition globale
  window.SochouAuth = {
    onAuthStateChanged,
    login,
    logout,
    getCurrentUser
  };
})(window);
