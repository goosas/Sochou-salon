/**
 * SOCHOU HAIR BEAUTY SALON - Gestion des images
 * ==============================================
 * Utilitaire pour manipuler les chemins d'images
 * et sélectionner parmi les images existantes du projet.
 *
 * Aucune utilisation de Firebase Storage.
 */

(function (window) {
  "use strict";

  let manifestCache = null;

  /**
   * Charge le manifeste des images depuis images-manifest.json.
   * Le résultat est mis en cache après le premier appel.
   * @returns {Promise<Object>}
   */
  function loadManifest() {
    if (manifestCache) {
      return Promise.resolve(manifestCache);
    }
    return fetch("/images-manifest.json")
      .then(function (response) {
        if (!response.ok) throw new Error("Impossible de charger images-manifest.json");
        return response.json();
      })
      .then(function (data) {
        manifestCache = data;
        return data;
      });
  }

  /**
   * Récupère la liste des images d'un dossier donné.
   * @param {string} dossier - "logo", "services", "galerie", "hero", "produits"
   * @returns {Promise<Array>}
   */
  function getImagesByDossier(dossier) {
    return loadManifest().then(function (manifest) {
      return manifest[dossier] || [];
    });
  }

  /**
   * Récupère toutes les images de tous les dossiers.
   * @returns {Promise<Object>}
   */
  function getAllImages() {
    return loadManifest();
  }

  /**
   * Valide qu'un chemin d'image est relatif et sécurisé.
   * Rejette les chemins absolus et les tentatives de traversée.
   * @returns {string} chemin nettoyé ou chaîne vide
   */
  function sanitizePath(chemin) {
    if (!chemin) return "";
    let path = String(chemin).trim();
    // Rejeter les chemins absolus Windows ou Unix
    if (path.indexOf(":") !== -1 || path.indexOf("..") !== -1) return "";
    // Normaliser les barres obliques
    path = path.replace(/\\/g, "/");
    // S'assurer que le chemin commence par "images/"
    if (path.indexOf("../images/") !== 0) return "";
    return path;
  }

  /**
   * Extrait le nom de fichier depuis un chemin.
   * @returns {string}
   */
  function getFileName(chemin) {
    if (!chemin) return "";
    const parts = chemin.split("/");
    return parts[parts.length - 1] || "";
  }

  /**
   * Construit un chemin d'image valide.
   * @param {string} dossier - ex: "services"
   * @param {string} fichier - ex: "tresse.png"
   * @returns {string}
   */
  function buildPath(dossier, fichier) {
    const d = String(dossier || "").trim().replace(/^\/+|\/+$/g, "");
    const f = String(fichier || "").trim().replace(/^\/+/, "");
    return "images/" + d + "/" + f;
  }

  // Exposition globale
  window.SochouImages = {
    loadManifest,
    getImagesByDossier,
    getAllImages,
    sanitizePath,
    getFileName,
    buildPath
  };
})(window);
