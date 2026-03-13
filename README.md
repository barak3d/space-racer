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

The game uses **Firebase Firestore** for the global leaderboard so players can compete across devices. The integration is opt-in — the game works fully in local-only mode without any configuration.

### Steps

1. Go to [https://console.firebase.google.com](https://console.firebase.google.com) and create a new project (the free **Spark plan** is sufficient).
2. In your project, click **Add app → Web (`</>`)**, register it, and copy the `firebaseConfig` object.
3. Open `js/firebaseConfig.js` and paste your values into the `FIREBASE_CONFIG` object.
4. In your Firebase project, go to **Firestore Database → Create database** → start in **production mode**.
5. In the **Rules** tab, replace the default rules with:

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
                    && request.resource.data.playerName.size() <= 30;
    }
  }
}
```

6. Click **Publish** to save the rules.
7. Deploy the updated `js/firebaseConfig.js` to GitHub Pages — the global leaderboard will be live immediately.

> **Note:** Firebase web API keys are safe to commit publicly. Security is enforced by Firestore rules, not by keeping the key secret.

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
