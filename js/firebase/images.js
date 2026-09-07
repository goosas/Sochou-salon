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
    if (path.indexOf(":") !== -1) return "";
    // Normaliser les barres obliques
    path = path.replace(/\\/g, "/");
    // Rejeter les tentatives de traversée
    if (path.indexOf("..") !== -1) return "";
    // S'assurer que le chemin commence par "images/"
    if (path.indexOf("images/") !== 0) return "";
    return path;
  }

  /**
   * Calcule le préfixe à appliquer aux chemins relatifs
   * selon la profondeur de la page courante.
   * Exemples :
   *   /index.html            -> ""
   *   /pages/services.html   -> "../"
   *   /pages/admin/xxx.html  -> "../../"
   * @returns {string}
   */
  function getPageDepthPrefix() {
    const pathname = window.location ? window.location.pathname : "/";
    const lastSlash = pathname.lastIndexOf("/");
    let dir = lastSlash > 0 ? pathname.substring(1, lastSlash) : "";
    dir = dir.split("/")[0] === "" ? "" : dir;
    if (!dir) return "";
    const depth = dir.split("/").filter(function (s) { return s.length > 0; }).length;
    let prefix = "";
    for (let i = 0; i < depth; i++) prefix += "../";
    return prefix;
  }

  /**
   * Transforme un chemin d'image stocké en Firestore (relatif à la racine,
   * ex: "images/services/tresse.png") en chemin exploitable dans le src d'une
   * balise <img>, quel que soit le niveau de profondeur de la page courante.
   * @param {string} chemin - chemin relatif racine, déjà préfixé, ou URL absolue
   * @returns {string}
   */
  function resolveImagePath(chemin) {
    if (!chemin) return "";
    let p = String(chemin).trim();
    // URLs absolues / protocol-relative / data: => inchangées
    if (p.indexOf("http://") === 0 || p.indexOf("https://") === 0 ||
        p.indexOf("//") === 0 || p.indexOf("data:") === 0) {
      return p;
    }
    // Chemin déjà racine-absolu => inchangé
    if (p.indexOf("/") === 0) return p;
    // Retirer les préfixes ../ éventuels pour repartir sur un chemin relatif racine
    while (p.indexOf("../") === 0) p = p.substring(3);
    p = p.replace(/^\/+/, "");
    // Chemin simple (nom de fichier seul) => relatif à la page courante
    if (p.indexOf("/") === -1) return p;
    // Chemin relatif racine => préfixer selon la profondeur de la page
    return getPageDepthPrefix() + p;
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
    buildPath,
    getPageDepthPrefix,
    resolveImagePath
  };
})(window);
