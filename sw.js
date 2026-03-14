// Service Worker — מירוץ הכוכבים — משחק אופליין

const CACHE_NAME = 'star-race-v4';

const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/style.css',
  './css/animations.css',
  './css/game.css',
  './css/responsive.css',
  './js/main.js',
  './js/config.js',
  './js/data/uiStrings.js',
  './js/data/alienCollection.js',
  './js/data/hebrewWords.js',
  './js/entities/Alien.js',
  './js/entities/StarField.js',
  './js/entities/Spaceship.js',
  './js/entities/Station.js',
  './js/systems/GameState.js',
  './js/systems/PuzzleGenerator.js',
  './js/systems/ScoreSystem.js',
  './js/systems/TimerSystem.js',
  './js/systems/AudioManager.js',
  './js/systems/AIOpponent.js',
  './js/systems/CloudLeaderboard.js',
  './js/ui/startOverHelper.js',
  './js/firebaseConfig.js',
  './js/scenes/MenuScene.js',
  './js/scenes/SetupScene.js',
  './js/scenes/RaceScene.js',
  './js/scenes/StationScene.js',
  './js/scenes/PuzzleScene.js',
  './js/scenes/ResultsScene.js',
];

// Install: cache all assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) => {
      return Promise.all(
        names
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch: cache-first strategy
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).then((response) => {
        // Cache new requests dynamically
        if (response.ok && event.request.method === 'GET') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
        }
        return response;
      });
    }).catch(() => {
      // Fallback for navigation requests
      if (event.request.mode === 'navigate') {
        return caches.match('./index.html');
      }
    })
  );
});
