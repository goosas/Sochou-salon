/**
 * SOCHOU HAIR BEAUTY SALON - Gestion des Commandes
 * =================================================
 * CRUD sur la collection Firestore "commande".
 */

(function (window) {
  "use strict";

  const { getDb, initFirebase } = window.SochouFirebase;

  const COLLECTION = "commande";

  const STATUTS_AUTORISÉS = ["en_attente", "confirme", "annule", "livree"];

  /**
   * Valide et nettoie un statut.
   * @returns {string} statut validé ou "en_attente" par défaut
   */
  function sanitizeStatut(statut) {
    if (STATUTS_AUTORISÉS.indexOf(statut) !== -1) {
      return statut;
    }
    return "en_attente";
  }

  /**
   * Récupère toutes les commandes, triées par date de création décroissante.
   * @param {string|null} filtreStatut - filtre optionnel par statut
   * @returns {Promise<Array>}
   */
  function getCommandes(filtreStatut) {
    initFirebase();
    let query;

    if (filtreStatut && STATUTS_AUTORISÉS.indexOf(filtreStatut) !== -1) {
      query = getDb().collection(COLLECTION)
        .where("statut", "==", filtreStatut)
        .orderBy("createdAt", "desc");
    } else {
      query = getDb().collection(COLLECTION).orderBy("createdAt", "desc");
    }

    return query.get().then(function (snapshot) {
      const results = [];
      snapshot.forEach(function (doc) {
        results.push({ id: doc.id, ...doc.data() });
      });
      return results;
    });
  }

  /**
   * Récupère une commande par son ID.
   * @returns {Promise<Object|null>}
   */
  function getCommandeById(id) {
    initFirebase();
    return getDb().collection(COLLECTION).doc(id).get().then(function (doc) {
      if (!doc.exists) return null;
      return { id: doc.id, ...doc.data() };
    });
  }

  /**
   * Crée une commande depuis le formulaire public (boutique).
   * Le statut est toujours forcé à "en_attente".
   * @returns {Promise<string>} l'id du document créé
   */
  function createCommande(data) {
    initFirebase();
    const now = firebase.firestore.FieldValue.serverTimestamp();
    const docData = {
      nomClient: String(data.nomClient || "").trim().substring(0, 100),
      telephone: String(data.telephone || "").trim().substring(0, 20),
      produit: String(data.produit || "").trim().substring(0, 200),
      quantite: Math.max(1, Number(data.quantite) || 1),
      prixUnitaire: Number(data.prixUnitaire) || 0,
      total: Number(data.total) || 0,
      message: String(data.message || "").trim().substring(0, 500),
      statut: "en_attente",
      createdAt: now
    };
    return getDb().collection(COLLECTION).add(docData).then(function (ref) {
      return ref.id;
    });
  }

  /**
   * Met à jour une commande (admin).
   * @returns {Promise<void>}
   */
  function updateCommande(id, data) {
    initFirebase();
    const docData = {
      nomClient: String(data.nomClient || "").trim().substring(0, 100),
      telephone: String(data.telephone || "").trim().substring(0, 20),
      produit: String(data.produit || "").trim().substring(0, 200),
      quantite: Math.max(1, Number(data.quantite) || 1),
      prixUnitaire: Number(data.prixUnitaire) || 0,
      total: Number(data.total) || 0,
      message: String(data.message || "").trim().substring(0, 500),
      statut: sanitizeStatut(data.statut)
    };
    return getDb().collection(COLLECTION).doc(id).update(docData);
  }

  /**
   * Change le statut d'une commande.
   * @returns {Promise<void>}
   */
  function setStatut(id, statut) {
    initFirebase();
    return getDb().collection(COLLECTION).doc(id).update({
      statut: sanitizeStatut(statut)
    });
  }

  /**
   * Supprime une commande.
   * @returns {Promise<void>}
   */
  function deleteCommande(id) {
    initFirebase();
    return getDb().collection(COLLECTION).doc(id).delete();
  }

  /**
   * Compte les commandes par statut (pour le dashboard).
   * @returns {Promise<Object>}
   */
  function countByStatut() {
    initFirebase();
    const counts = { en_attente: 0, confirme: 0, annule: 0, livree: 0 };
    return getDb().collection(COLLECTION).get().then(function (snapshot) {
      snapshot.forEach(function (doc) {
        const data = doc.data();
        if (counts.hasOwnProperty(data.statut)) {
          counts[data.statut]++;
        }
      });
      return counts;
    });
  }

  // Exposition globale
  window.SochouCommandes = {
    getCommandes,
    getCommandeById,
    createCommande,
    updateCommande,
    setStatut,
    deleteCommande,
    countByStatut,
    STATUTS_AUTORISÉS
  };
})(window);
