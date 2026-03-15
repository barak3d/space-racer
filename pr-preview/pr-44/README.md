# מֵרוֹץ הַכּוֹכָבִים — Space Racer ⭐🚀

An educational, interactive space-themed racing game for Hebrew-speaking students in grades 1–3.  
Play it live on [GitHub Pages](https://barak3d.github.io/space-racer/).

---

## Features

- 🚀 Space racing with AI opponents
- 🧮 Math & language puzzles (addition, subtraction, multiplication, word completion)
- 🏆 Local **and** global leaderboard
- 👾 Alien collection
- 🔊 Sound effects & background music
- 📱 Progressive Web App (works offline after first load)

---

## Global Leaderboard Setup

The game uses **Firebase Firestore** for the global leaderboard. The integration is opt-in — the game works fully in local-only mode without any configuration.

### About Firebase Web API Keys

Firebase **web** API keys are not secrets. [Google explicitly states](https://firebase.google.com/support/guides/security-checklist) that they are safe to include in client-side code — they are project *identifiers*, not passwords. Access control is enforced by **Firestore Security Rules** and optionally by restricting the key to your domain in Google Cloud Console.

This is the same model used by every Firebase-powered web app (and the Firebase documentation explicitly covers it). The key on its own grants no permissions beyond what your Firestore rules allow.

### Setup Steps

**1. Create a Firebase project**

Go to [https://console.firebase.google.com](https://console.firebase.google.com) and create a new project (the free **Spark plan** is sufficient). Click **Add app → Web (`</>`)**, register it, and copy the `firebaseConfig` object.

**2. Fill in `js/firebaseConfig.js`**

Paste your values into the `FIREBASE_CONFIG` object in `js/firebaseConfig.js`.

**3. Create the Firestore database**

In your Firebase project, go to **Firestore Database → Create database** → start in **production mode**.

**4. Set Firestore Security Rules**

In the **Rules** tab, replace the default rules with the following and click **Publish**:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /leaderboard/{document} {
      allow read: if true;
      allow create: if request.resource.data.score is int
                    && request.resource.data.score >= 0
                    && request.resource.data.score <= 9999999
                    && request.resource.data.playerName is string
                    && request.resource.data.playerName.size() >= 1
                    && request.resource.data.playerName.size() <= 30
                    && request.resource.data.difficulty is int
                    && request.resource.data.difficulty in [1, 2, 3]
                    && request.resource.data.accuracy is int
                    && request.resource.data.accuracy >= 0
                    && request.resource.data.accuracy <= 100;
      // No updates or deletes allowed
      allow update, delete: if false;
    }
  }
}
```

These rules ensure only valid, in-range data can be written, and nothing can be modified or deleted once stored.

**5. Restrict the API key to your domain (recommended)**

Even though Firebase web API keys are safe to expose, restricting them to your domain adds an extra layer of defence:

1. Go to [Google Cloud Console → APIs & Services → Credentials](https://console.cloud.google.com/apis/credentials)
2. Click the API key named **"Browser key (auto created by Firebase)"**
3. Under **Application restrictions** select **HTTP referrers (web sites)**
4. Add your GitHub Pages URL, e.g.:
   - `https://barak3d.github.io/space-racer/*`
   - `http://localhost:*` (for local development)
5. Click **Save**

With this in place, the API key will be silently rejected if used from any other website.

**6. (Optional) Enable Firebase App Check**

[App Check with reCAPTCHA v3](https://firebase.google.com/docs/app-check/web/recaptcha-provider) adds a cryptographic attestation to every Firestore request, making automated bot submissions significantly harder. It's free and invisible to users.

**7. Deploy**

Deploy the updated `js/firebaseConfig.js` to GitHub Pages — the global leaderboard will be live immediately.

---

## Local Development

No build tools are required. Just open `index.html` in a browser (or serve the directory with any static server):

```bash
npx serve .
# or
python -m http.server 8080
```

---

## Project Structure

```
space-racer/
├── index.html
├── manifest.json
├── sw.js                        # Service Worker (PWA offline support)
├── js/
│   ├── firebaseConfig.js        # ← Fill in your Firebase config here
│   ├── main.js
│   ├── config.js
│   ├── data/                    # UI strings, alien collection, Hebrew words
│   ├── entities/                # Canvas entities (starfield, spaceship, …)
│   ├── scenes/                  # Game scenes (menu, setup, race, puzzle, …)
│   └── systems/
│       ├── CloudLeaderboard.js  # Firebase Firestore integration
│       ├── GameState.js         # Local state (localStorage)
│       └── …
└── css/
```
