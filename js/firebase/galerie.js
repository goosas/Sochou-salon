/**
 * SOCHOU HAIR BEAUTY SALON - Gestion de la Galerie
 * =================================================
 * CRUD sur la collection Firestore "galerie".
 */

(function (window) {
  "use strict";

  const { getDb, initFirebase } = window.SochouFirebase;

  const COLLECTION = "galerie";
  const pendingReads = {};

  /**
   * Récupère toutes les réalisations, triées par ordre.
   * @param {boolean} actifsUniquement - si vrai, ne retourne que les éléments actifs
   * @returns {Promise<Array>} tableau de { id, ...data }
   */
  function getGalerie(actifsUniquement) {
    const cacheKey = actifsUniquement ? "actifs" : "tous";
    if (pendingReads[cacheKey]) return pendingReads[cacheKey];

    initFirebase();
    let query = getDb().collection(COLLECTION).orderBy("ordre", "asc");

    if (actifsUniquement) {
      query = query.where("actif", "==", true);
    }

    pendingReads[cacheKey] = query.get().then(function (snapshot) {
      const results = [];
      snapshot.forEach(function (doc) {
        results.push({ id: doc.id, ...doc.data() });
      });
      return results;
    }).then(function (results) {
      delete pendingReads[cacheKey];
      return results;
    }, function (error) {
      delete pendingReads[cacheKey];
      throw error;
    });
    return pendingReads[cacheKey];
  }

  /**
   * Récupère une réalisation par son ID.
   * @returns {Promise<Object|null>}
   */
  function getRealisation(id) {
    initFirebase();
    return getDb().collection(COLLECTION).doc(id).get().then(function (doc) {
      if (!doc.exists) return null;
      return { id: doc.id, ...doc.data() };
    });
  }

  /**
   * Ajoute une réalisation à la galerie.
   * @returns {Promise<string>} l'id du document créé
   */
  function addRealisation(data) {
    initFirebase();
    const now = firebase.firestore.FieldValue.serverTimestamp();
    const docData = {
      titre: String(data.titre || "").trim(),
      description: String(data.description || "").trim(),
      image: String(data.image || "").trim(),
      categorie: String(data.categorie || "").trim(),
      ordre: Number(data.ordre) || 0,
      actif: Boolean(data.actif),
      date: data.date || null,
      createdAt: now,
      updatedAt: now
    };
    return getDb().collection(COLLECTION).add(docData).then(function (ref) {
      return ref.id;
    });
  }

  /**
   * Met à jour une réalisation existante.
   * @returns {Promise<void>}
   */
  function updateRealisation(id, data) {
    initFirebase();
    const now = firebase.firestore.FieldValue.serverTimestamp();
    const docData = {
      titre: String(data.titre || "").trim(),
      description: String(data.description || "").trim(),
      image: String(data.image || "").trim(),
      categorie: String(data.categorie || "").trim(),
      ordre: Number(data.ordre) || 0,
      actif: Boolean(data.actif),
      date: data.date || null,
      updatedAt: now
    };
    return getDb().collection(COLLECTION).doc(id).update(docData);
  }

  /**
   * Supprime une réalisation.
   * @returns {Promise<void>}
   */
  function deleteRealisation(id) {
    initFirebase();
    return getDb().collection(COLLECTION).doc(id).delete();
  }

  /**
   * Active ou désactive une réalisation.
   * @returns {Promise<void>}
   */
  function toggleRealisationActif(id, actif) {
    initFirebase();
    const now = firebase.firestore.FieldValue.serverTimestamp();
    return getDb().collection(COLLECTION).doc(id).update({
      actif: Boolean(actif),
      updatedAt: now
    });
  }

  // Exposition globale
  window.SochouGalerie = {
    getGalerie,
    getRealisation,
    addRealisation,
    updateRealisation,
    deleteRealisation,
    toggleRealisationActif
  };
})(window);
