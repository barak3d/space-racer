// firebaseConfig.js — Firebase project configuration
//
// ─── SECURITY NOTICE ──────────────────────────────────────────────────────────
// Firebase Web API keys are NOT secrets. Google explicitly designs them to be
// included in client-side code (see https://firebase.google.com/support/guides/security-checklist).
// They are project *identifiers* — similar to a username, not a password.
// Access control is enforced by Firestore Security Rules (see step 6 below)
// and, optionally, by restricting the key to your domain (step 8).
//
// You must still follow the hardening steps below to prevent:
//   • Writes from domains other than yours  →  step 8 (domain restriction)
//   • Invalid or oversized data in Firestore → step 6 (Firestore rules)
//   • Bot submissions at scale              →  step 7 (rate limiting / App Check)
// ──────────────────────────────────────────────────────────────────────────────
//
// To enable the global online leaderboard:
//
// 1. Go to https://console.firebase.google.com and create a new project
//    (the free Spark plan is sufficient).
//
// 2. In your project, click "Add app" → Web (</>), register it, and copy the
//    firebaseConfig values from the SDK snippet into the FIREBASE_CONFIG object
//    below.
//
// 3. Go to "Firestore Database" → "Create database" → start in production mode.
//
// 4. In the Firestore "Rules" tab paste the rules below and click "Publish":
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
//                        && request.resource.data.playerName.size() >= 1
//                        && request.resource.data.playerName.size() <= 30
//                        && request.resource.data.difficulty is int
//                        && request.resource.data.difficulty in [1, 2, 3]
//                        && request.resource.data.accuracy is int
//                        && request.resource.data.accuracy >= 0
//                        && request.resource.data.accuracy <= 100;
//          // No updates or deletes allowed
//          allow update, delete: if false;
//        }
//      }
//    }
//
// 5. IMPORTANT — restrict the API key to your domain:
//    a. Go to https://console.cloud.google.com → "APIs & Services" → "Credentials"
//    b. Click the API key named "Browser key (auto created by Firebase)"
//    c. Under "Application restrictions" select "HTTP referrers (web sites)"
//    d. Add your GitHub Pages URL, e.g.:
//         https://barak3d.github.io/space-racer/*
//         http://localhost:*  (for local development)
//    e. Click "Save"
//    This ensures the key cannot be used from any other website even if copied.
//
// 6. (Optional but recommended) Enable Firebase App Check with reCAPTCHA v3:
//    a. In the Firebase console → "App Check" → register your web app
//    b. Use the reCAPTCHA v3 provider (free, invisible to users)
//    This adds a cryptographic attestation to every Firestore request, making
//    automated bot submissions significantly harder.
//    See: https://firebase.google.com/docs/app-check/web/recaptcha-provider
//
// Leave all values as empty strings to run in local-only mode (no cloud sync).

const FIREBASE_CONFIG = {
  // Domain-restricted API key (restricted to https://barak3d.github.io/* in Google Cloud Console)
  apiKey: "AIzaSyBDqvv82aBViHmSDu2dgQ3JGNbNTqflMqE",
  authDomain: "space-racer-7d447.firebaseapp.com",
  projectId: "space-racer-7d447",
  storageBucket: "space-racer-7d447.firebasestorage.app",
  messagingSenderId: "836177941752",
  appId: "1:836177941752:web:8bffb1aa3f8c86ac19970d",
};

export default FIREBASE_CONFIG;
