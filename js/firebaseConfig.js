// firebaseConfig.js — Firebase project configuration
//
// To enable the global online leaderboard:
// 1. Go to https://console.firebase.google.com
// 2. Click "Add project" and follow the steps (free Spark plan is enough)
// 3. In your new project, click "Add app" → Web (</>)
// 4. Copy the firebaseConfig values from the SDK snippet into the object below
// 5. Go to "Firestore Database" → "Create database" → Start in production mode
// 6. In the Firestore "Rules" tab, replace the default rules with:
//
//    rules_version = '2';
//    service cloud.firestore {
//      match /databases/{database}/documents {
//        match /leaderboard/{document} {
//          allow read: if true;
//          allow create: if request.resource.data.score is int
//                        && request.resource.data.score >= 0
//                        && request.resource.data.score <= 9999999
//                        && request.resource.data.playerName is string
//                        && request.resource.data.playerName.size() <= 30;
//        }
//      }
//    }
//
// Leave all values as empty strings to disable cloud sync (local-only mode).

const FIREBASE_CONFIG = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
};

export default FIREBASE_CONFIG;
