/**
 * SOCHOU HAIR BEAUTY SALON - Gestion des Produits (Boutique)
 * ==========================================================
 * CRUD sur la collection Firestore "produit".
 */

(function (window) {
  "use strict";

  const { getDb, initFirebase } = window.SochouFirebase;

  const COLLECTION = "produit";
  const pendingReads = {};

  /**
   * Récupère tous les produits.
   * @param {boolean} actifsUniquement - si vrai, ne retourne que les produits actifs
   * @returns {Promise<Array>}
   */
  function getProduits(actifsUniquement) {
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
   * Récupère un produit par son ID.
   * @returns {Promise<Object|null>}
   */
  function getProduit(id) {
    initFirebase();
    return getDb().collection(COLLECTION).doc(id).get().then(function (doc) {
      if (!doc.exists) return null;
      return { id: doc.id, ...doc.data() };
    });
  }

  /**
   * Ajoute un nouveau produit.
   * @returns {Promise<string>} l'id du document créé
   */
  function addProduit(data) {
    initFirebase();
    const now = firebase.firestore.FieldValue.serverTimestamp();
    const docData = {
      nom: String(data.nom || "").trim(),
      description: String(data.description || "").trim(),
      prix: Number(data.prix) || 0,
      image: String(data.image || "").trim(),
      categorie: String(data.categorie || "").trim(),
      caracteristiques: String(data.caracteristiques || "").trim(),
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
   * Met à jour un produit existant.
   * @returns {Promise<void>}
   */
  function updateProduit(id, data) {
    initFirebase();
    const now = firebase.firestore.FieldValue.serverTimestamp();
    const docData = {
      nom: String(data.nom || "").trim(),
      description: String(data.description || "").trim(),
      prix: Number(data.prix) || 0,
      image: String(data.image || "").trim(),
      categorie: String(data.categorie || "").trim(),
      caracteristiques: String(data.caracteristiques || "").trim(),
      actif: Boolean(data.actif),
      ordre: Number(data.ordre) || 0,
      updatedAt: now
    };
    return getDb().collection(COLLECTION).doc(id).update(docData);
  }

  /**
   * Supprime un produit.
   * @returns {Promise<void>}
   */
  function deleteProduit(id) {
    initFirebase();
    return getDb().collection(COLLECTION).doc(id).delete();
  }

  /**
   * Active ou désactive un produit.
   * @returns {Promise<void>}
   */
  function toggleProduitActif(id, actif) {
    initFirebase();
    const now = firebase.firestore.FieldValue.serverTimestamp();
    return getDb().collection(COLLECTION).doc(id).update({
      actif: Boolean(actif),
      updatedAt: now
    });
  }

  // Exposition globale
  window.SochouProduits = {
    getProduits,
    getProduit,
    addProduit,
    updateProduit,
    deleteProduit,
    toggleProduitActif
  };
})(window);
