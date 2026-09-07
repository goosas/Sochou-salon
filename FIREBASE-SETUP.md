# Configuration Firebase - SOCHOU HAIR BEAUTY SALON

## 1. Créer le projet Firebase

1. Allez sur [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Créez un nouveau projet (ex: `sochou-salon`)
3. Activez **Firestore Database** en mode production
4. Activez **Authentication** → méthode **Email/Mot de passe**

## 2. Récupérer la configuration

1. Dans les paramètres du projet, ajoutez une application **Web**
2. Récupérez l'objet de configuration
3. Copiez les valeurs dans `js/firebase/config.js` :

```javascript
const firebaseConfig = {
  apiKey: "votre-vraie-cle",
  authDomain: "votre-projet.firebaseapp.com",
  projectId: "votre-projet-id",
  storageBucket: "votre-projet.appspot.com",
  messagingSenderId: "123456789",
  appId: "votre-app-id"
};
```

## 3. Créer l'administrateur

Dans Firebase Console > Authentication > Utilisateurs :
- Ajoutez un utilisateur email/mot de passe pour l'admin

## 4. Déployer les règles Firestore

Copiez le contenu du fichier `firestore.rules` dans :
Firebase Console > Firestore > Règles

## 5. Initialiser les données

Connectez-vous à `/pages/admin/login.html` et utilisez l'interface pour :
1. Remplir les **Informations du salon**
2. Ajouter les **Services**
3. Ajouter les **Réalisations Galerie**

---

## Structure des collections Firestore

### Collection : `service`
```
Document ID auto
├── nom: string
├── description: string
├── prix: number
├── duree: string
├── image: string (chemin relatif)
├── actif: boolean
├── ordre: number
├── createdAt: timestamp
└── updatedAt: timestamp
```

### Collection : `galerie`
```
Document ID auto
├── titre: string
├── description: string
├── image: string (chemin relatif)
├── categorie: string
├── date: timestamp | null
├── ordre: number
├── actif: boolean
├── createdAt: timestamp
└── updatedAt: timestamp
```

### Collection : `rendez-vous`
```
Document ID auto
├── nomClient: string
├── telephone: string
├── service: string
├── date: string
├── heure: string
├── message: string
├── statut: "en_attente" | "confirme" | "annule" | "termine"
└── createdAt: timestamp
```

### Collection : `informations_generales`
```
Document ID: "salon" (fixe)
├── nom: string
├── slogan: string
├── description: string
├── logo: string (chemin relatif)
├── telephone: string
├── whatsapp: string
├── email: string
├── adresse: string
├── horaires: object { "Lundi": "8h-18h", ... }
├── facebook: string
├── instagram: string
├── localisation: string
└── updatedAt: timestamp
```

---

## ⚠️ Notes importantes

- **Firebase Storage n'est PAS utilisé** dans ce projet
- Les images restent dans le dossier `images/` du projet
- Firestore ne stocke que les **chemins relatifs** des images
- Le fichier `images-manifest.json` liste les images disponibles pour le sélecteur
- Si vous ajoutez de nouvelles images, mettez à jour `images-manifest.json`
