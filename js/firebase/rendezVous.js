/**
 * SOCHOU HAIR BEAUTY SALON - Gestion des Rendez-vous
 * ===================================================
 * CRUD sur la collection Firestore "rendez-vous".
 */

(function (window) {
  "use strict";

  const { getDb, initFirebase } = window.SochouFirebase;

  const COLLECTION = "rendez-vous";

  const STATUTS_AUTORISÉS = ["en_attente", "confirme", "annule", "termine"];

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
   * Récupère tous les rendez-vous, triés par date de création décroissante.
   * @param {string|null} filtreStatut - filtre optionnel par statut
   * @returns {Promise<Array>}
   */
  function getRendezVous(filtreStatut) {
    initFirebase();
    let query = getDb().collection(COLLECTION).orderBy("createdAt", "desc");

    if (filtreStatut && STATUTS_AUTORISÉS.indexOf(filtreStatut) !== -1) {
      query = getDb().collection(COLLECTION)
        .where("statut", "==", filtreStatut)
        .orderBy("createdAt", "desc");
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
   * Récupère un rendez-vous par son ID.
   * @returns {Promise<Object|null>}
   */
  function getRendezVousById(id) {
    initFirebase();
    return getDb().collection(COLLECTION).doc(id).get().then(function (doc) {
      if (!doc.exists) return null;
      return { id: doc.id, ...doc.data() };
    });
  }

  /**
   * Crée une demande de rendez-vous depuis le formulaire public.
   * Le statut est toujours forcé à "en_attente".
   * @returns {Promise<string>} l'id du document créé
   */
  function createRendezVous(data) {
    initFirebase();
    const now = firebase.firestore.FieldValue.serverTimestamp();
    const docData = {
      nomClient: String(data.nomClient || "").trim().substring(0, 100),
      telephone: String(data.telephone || "").trim().substring(0, 20),
      service: String(data.service || "").trim().substring(0, 100),
      date: String(data.date || "").trim(),
      heure: String(data.heure || "").trim().substring(0, 10),
      message: String(data.message || "").trim().substring(0, 500),
      statut: "en_attente",
      createdAt: now
    };
    return getDb().collection(COLLECTION).add(docData).then(function (ref) {
      return ref.id;
    });
  }

  /**
   * Met à jour un rendez-vous (admin).
   * @returns {Promise<void>}
   */
  function updateRendezVous(id, data) {
    initFirebase();
    const docData = {
      nomClient: String(data.nomClient || "").trim().substring(0, 100),
      telephone: String(data.telephone || "").trim().substring(0, 20),
      service: String(data.service || "").trim().substring(0, 100),
      date: String(data.date || "").trim(),
      heure: String(data.heure || "").trim().substring(0, 10),
      message: String(data.message || "").trim().substring(0, 500),
      statut: sanitizeStatut(data.statut)
    };
    return getDb().collection(COLLECTION).doc(id).update(docData);
  }

  /**
   * Change le statut d'un rendez-vous.
   * @returns {Promise<void>}
   */
  function setStatut(id, statut) {
    initFirebase();
    return getDb().collection(COLLECTION).doc(id).update({
      statut: sanitizeStatut(statut)
    });
  }

  /**
   * Supprime un rendez-vous.
   * @returns {Promise<void>}
   */
  function deleteRendezVous(id) {
    initFirebase();
    return getDb().collection(COLLECTION).doc(id).delete();
  }

  /**
   * Compte les rendez-vous par statut (pour le dashboard).
   * @returns {Promise<Object>}
   */
  function countByStatut() {
    initFirebase();
    const counts = { en_attente: 0, confirme: 0, annule: 0, termine: 0 };
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
  window.SochouRendezVous = {
    getRendezVous,
    getRendezVousById,
    createRendezVous,
    updateRendezVous,
    setStatut,
    deleteRendezVous,
    countByStatut,
    STATUTS_AUTORISÉS
  };
})(window);
