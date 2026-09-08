/**
 * SOCHOU HAIR BEAUTY SALON - Configuration Firebase
 * ==================================================
 * Initialise Firebase avec la configuration du projet.
 * Les clés du SDK web Firebase ne sont pas des secrets.
 * La protection réelle vient des règles Firestore et de l'authentification.
 */

// Configuration Firebase du projet Sochou Salon
const firebaseConfig = {
  apiKey: "AIzaSyBlPz0_gU-IREQlNtjt78gvGXMK9nPLfl0",
  authDomain: "sochou-salon.firebaseapp.com",
  projectId: "sochou-salon",
  storageBucket: "sochou-salon.firebasestorage.app",
  messagingSenderId: "876828642540",
  appId: "1:876828642540:web:9ef1c90cf9c1f4073e69c9"
};

// Initialisation de Firebase (sera chargée via le SDK)
let app = null;
let db = null;
let auth = null;

/**
 * Vérifie si le SDK Firebase est chargé.
 * @returns {boolean}
 */
function isFirebaseSdkLoaded() {
  return typeof firebase !== "undefined" && typeof firebase.initializeApp === "function";
}

/**
 * Initialise Firebase si ce n'est pas déjà fait.
 * Retourne { app, db, auth }
 */
function initFirebase() {
  if (app) return { app, db, auth };

  if (!isFirebaseSdkLoaded()) {
    console.error("[SochouFirebase] SDK Firebase non chargé. Vérifiez que les scripts Firebase sont inclus dans la page.");
    throw new Error("Firebase SDK non chargé. Incluez les scripts Firebase dans votre HTML.");
  }

  try {
    app = firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    auth = firebase.auth();
    console.log("[SochouFirebase] Firebase initialisé avec succès.");
    return { app, db, auth };
  } catch (error) {
    console.error("[SochouFirebase] Erreur lors de l'initialisation de Firebase:", error);
    throw error;
  }
}

/**
 * Récupère l'instance Firestore (après init).
 */
function getDb() {
  if (!db) initFirebase();
  return db;
}

/**
 * Récupère l'instance Auth (après init).
 */
function getAuth() {
  if (!auth) initFirebase();
  return auth;
}

// Exposition globale
window.SochouFirebase = {
  initFirebase,
  getDb,
  getAuth,
  isFirebaseSdkLoaded,
  firebaseConfig
};
