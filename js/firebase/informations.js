/**
 * SOCHOU HAIR BEAUTY SALON - Générales du Salon
 * ==============================================
 * Gestion du document unique "informations_generales/salon".
 */

(function (window) {
  "use strict";

  const { getDb, initFirebase } = window.SochouFirebase;

  const COLLECTION = "informations_generales";
  const DOC_ID = "salon";

  /**
   * Récupère les informations générales du salon.
   * @returns {Promise<Object|null>}
   */
  function getInformationsGenerales() {
    initFirebase();
    return getDb().collection(COLLECTION).doc(DOC_ID).get().then(function (doc) {
      if (!doc.exists) return null;
      return { id: doc.id, ...doc.data() };
    });
  }

  /**
   * Crée ou remplace les informations générales.
   * @returns {Promise<void>}
   */
  function setInformationsGenerales(data) {
    initFirebase();
    const now = firebase.firestore.FieldValue.serverTimestamp();
    const docData = {
      nom: String(data.nom || "").trim(),
      slogan: String(data.slogan || "").trim(),
      description: String(data.description || "").trim(),
      logo: String(data.logo || "").trim(),
      telephone: String(data.telephone || "").trim(),
      whatsapp: String(data.whatsapp || "").trim(),
      email: String(data.email || "").trim(),
      adresse: String(data.adresse || "").trim(),
      horaires: data.horaires || {},
      facebook: String(data.facebook || "").trim(),
      instagram: String(data.instagram || "").trim(),
      localisation: String(data.localisation || "").trim(),
      updatedAt: now
    };
    return getDb().collection(COLLECTION).doc(DOC_ID).set(docData);
  }

  /**
   * Met à jour partiellement les informations générales.
   * @returns {Promise<void>}
   */
  function updateInformationsGenerales(data) {
    initFirebase();
    const now = firebase.firestore.FieldValue.serverTimestamp();
    const docData = { updatedAt: now };

    const champs = [
      "nom", "slogan", "description", "logo", "telephone",
      "whatsapp", "email", "adresse", "horaires",
      "facebook", "instagram", "localisation"
    ];

    champs.forEach(function (champ) {
      if (data[champ] !== undefined) {
        if (champ === "horaires") {
          docData[champ] = data[champ];
        } else {
          docData[champ] = String(data[champ]).trim();
        }
      }
    });

    return getDb().collection(COLLECTION).doc(DOC_ID).set(docData, { merge: true });
  }

  /**
   * Ajoute ou met à jour un champ supplémentaire dans les informations.
   * @param {string} cle - nom du champ
   * @param {string} valeur - valeur du champ
   * @returns {Promise<void>}
   */
  function upsertChampSupplementaire(cle, valeur) {
    initFirebase();
    const now = firebase.firestore.FieldValue.serverTimestamp();
    const docData = { updatedAt: now };
    docData["supplementaires." + cle] = String(valeur || "").trim();
    return getDb().collection(COLLECTION).doc(DOC_ID).set(docData, { merge: true });
  }

  /**
   * Supprime un champ supplémentaire des informations.
   * @param {string} cle - nom du champ à supprimer
   * @returns {Promise<void>}
   */
  function deleteChampSupplementaire(cle) {
    initFirebase();
    const now = firebase.firestore.FieldValue.serverTimestamp();
    const docData = {
      updatedAt: now,
      ["supplementaires." + cle]: firebase.firestore.FieldValue.delete()
    };
    return getDb().collection(COLLECTION).doc(DOC_ID).set(docData, { merge: true });
  }

  // Exposition globale
  window.SochouInformations = {
    getInformationsGenerales,
    setInformationsGenerales,
    updateInformationsGenerales,
    upsertChampSupplementaire,
    deleteChampSupplementaire
  };
})(window);
