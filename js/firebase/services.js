/**
 * SOCHOU HAIR BEAUTY SALON - Gestion des Services
 * ================================================
 * CRUD sur la collection Firestore "service".
 */

(function (window) {
  "use strict";

  const { getDb, initFirebase } = window.SochouFirebase;

  const COLLECTION = "service";
  const pendingReads = {};

  /**
   * Récupère tous les services, triés par ordre.
   * @param {boolean} actifsUniquement - si vrai, ne retourne que les services actifs
   * @returns {Promise<Array>} tableau de { id, ...data }
   */
  function getServices(actifsUniquement) {
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
   * Récupère un service par son ID.
   * @returns {Promise<Object|null>}
   */
  function getService(id) {
    initFirebase();
    return getDb().collection(COLLECTION).doc(id).get().then(function (doc) {
      if (!doc.exists) return null;
      return { id: doc.id, ...doc.data() };
    });
  }

  /**
   * Ajoute un nouveau service.
   * @returns {Promise<string>} l'id du document créé
   */
  function addService(data) {
    initFirebase();
    const now = firebase.firestore.FieldValue.serverTimestamp();
    const docData = {
      nom: String(data.nom || "").trim(),
      description: String(data.description || "").trim(),
      prix: Number(data.prix) || 0,
      duree: String(data.duree || "").trim(),
      image: String(data.image || "").trim(),
      actif: Boolean(data.actif),
      ordre: Number(data.ordre) || 0,
      createdAt: now,
      updatedAt: now
    };
    return getDb().collection(COLLECTION).add(docData).then(function (ref) {
      return ref.id;
    });
  }

  /**
   * Met à jour un service existant.
   * @returns {Promise<void>}
   */
  function updateService(id, data) {
    initFirebase();
    const now = firebase.firestore.FieldValue.serverTimestamp();
    const docData = {
      nom: String(data.nom || "").trim(),
      description: String(data.description || "").trim(),
      prix: Number(data.prix) || 0,
      duree: String(data.duree || "").trim(),
      image: String(data.image || "").trim(),
      actif: Boolean(data.actif),
      ordre: Number(data.ordre) || 0,
      updatedAt: now
    };
    return getDb().collection(COLLECTION).doc(id).update(docData);
  }

  /**
   * Supprime un service.
   * @returns {Promise<void>}
   */
  function deleteService(id) {
    initFirebase();
    return getDb().collection(COLLECTION).doc(id).delete();
  }

  /**
   * Active ou désactive un service.
   * @returns {Promise<void>}
   */
  function toggleServiceActif(id, actif) {
    initFirebase();
    const now = firebase.firestore.FieldValue.serverTimestamp();
    return getDb().collection(COLLECTION).doc(id).update({
      actif: Boolean(actif),
      updatedAt: now
    });
  }

  // Exposition globale
  window.SochouServices = {
    getServices,
    getService,
    addService,
    updateService,
    deleteService,
    toggleServiceActif
  };
})(window);
