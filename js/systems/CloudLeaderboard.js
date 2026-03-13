// CloudLeaderboard.js — לוח שיאים גלובלי (Firebase Firestore)
//
// Lazily imports the Firebase Modular SDK from the Google CDN only when a
// valid project config is present. Falls back silently to local-only mode
// when no config is supplied or when the network request fails.

import FIREBASE_CONFIG from '../firebaseConfig.js';

const FIREBASE_SDK = 'https://www.gstatic.com/firebasejs/10.12.0';
const COLLECTION_NAME = 'leaderboard';
const GLOBAL_LEADERBOARD_LIMIT = 20;

let _initPromise = null;
let _db = null;
let _available = false;

function isConfigured() {
  return !!(FIREBASE_CONFIG.apiKey && FIREBASE_CONFIG.projectId);
}

// Initialises Firebase once; subsequent calls return the same promise.
function _ensureInitialized() {
  if (_initPromise) return _initPromise;
  _initPromise = (async () => {
    if (!isConfigured()) return false;
    try {
      const [{ initializeApp }, { getFirestore }] = await Promise.all([
        import(`${FIREBASE_SDK}/firebase-app.js`),
        import(`${FIREBASE_SDK}/firebase-firestore.js`),
      ]);
      const app = initializeApp(FIREBASE_CONFIG);
      _db = getFirestore(app);
      _available = true;
    } catch (e) {
      console.warn('Cloud leaderboard: Firebase init failed —', e.message);
    }
    return _available;
  })();
  return _initPromise;
}

// Submit a score entry to Firestore. Fires-and-forgets (safe to call without await).
async function submitScore(entry) {
  const ready = await _ensureInitialized();
  if (!ready) return false;

  try {
    const { collection, addDoc, serverTimestamp } =
      await import(`${FIREBASE_SDK}/firebase-firestore.js`);

    // Validate and clamp all fields client-side so they satisfy Firestore rules.
    // The server rules are the authoritative enforcement layer; these checks
    // avoid unnecessary rejected writes.
    const score = Math.max(0, Math.min(9999999, Math.trunc(Number(entry.score) || 0)));
    const playerName = String(entry.playerName || '').slice(0, 30).trim() || '—';
    const difficulty = [1, 2, 3].includes(Number(entry.difficulty))
      ? Number(entry.difficulty) : 1;
    const difficultyLabel = String(entry.difficultyLabel || '').slice(0, 10);
    const accuracy = Math.max(0, Math.min(100, Math.trunc(Number(entry.accuracy) || 0)));

    // Validate date format DD/MM/YYYY before storing
    const dateRaw = String(entry.date || '');
    const date = /^\d{2}\/\d{2}\/\d{4}$/.test(dateRaw) ? dateRaw : '';

    await addDoc(collection(_db, COLLECTION_NAME), {
      score,
      playerName,
      difficulty,
      difficultyLabel,
      date,
      accuracy,
      // Use a server-generated timestamp to prevent client-side manipulation
      timestamp: serverTimestamp(),
    });
    return true;
  } catch (e) {
    console.warn('Cloud leaderboard: submitScore failed —', e.message);
    return false;
  }
}

// Fetch the top global scores. Returns null when not available.
// When difficulty is provided, results are filtered client-side to avoid
// requiring a Firestore composite index.
async function getTopScores(limitCount = GLOBAL_LEADERBOARD_LIMIT, difficulty = null) {
  const ready = await _ensureInitialized();
  if (!ready) return null;

  try {
    const { collection, query, orderBy, limit, getDocs } =
      await import(`${FIREBASE_SDK}/firebase-firestore.js`);

    // Fetch more results when filtering so we still return enough after
    // removing non-matching entries. Cap at 100 to keep reads bounded.
    const fetchLimit = difficulty !== null ? Math.min(limitCount * 5, 100) : limitCount;

    const q = query(
      collection(_db, COLLECTION_NAME),
      orderBy('score', 'desc'),
      limit(fetchLimit),
    );
    const snapshot = await getDocs(q);
    let results = snapshot.docs.map(doc => doc.data());

    if (difficulty !== null) {
      results = results.filter(entry => entry.difficulty === difficulty).slice(0, limitCount);
    }

    return results;
  } catch (e) {
    console.warn('Cloud leaderboard: getTopScores failed —', e.message);
    return null;
  }
}

export default { submitScore, getTopScores, isConfigured };
