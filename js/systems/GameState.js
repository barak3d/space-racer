// GameState.js — ניהול מצב משחק (localStorage)

const STORAGE_KEY = 'starRace_gameState';
const RACE_STORAGE_KEY = 'starRace_raceState';

const DEFAULT_STATE = {
  playerName: '',
  selectedColor: '#00ffff',
  difficultyLevel: 1,
  currentStation: 1,
  currentStationPuzzlesCompleted: 0,
  score: 0,
  medals: { gold: 0, silver: 0, bronze: 0 },
  aliensCollected: [],
  puzzleHistory: [],
  bestScores: [],
  streak: 0,
  inProgress: false, // האם יש משחק פעיל?
};

class GameState {
  constructor() {
    this.state = { ...DEFAULT_STATE };
    this.load();
  }

  getState() {
    return this.state;
  }

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.warn('Failed to save game state:', e);
    }
  }

  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        this.state = { ...DEFAULT_STATE, ...parsed };
      }
    } catch (e) {
      console.warn('Failed to load game state:', e);
    }
  }

  reset() {
    // Keep persistent data: aliensCollected, bestScores
    const persistent = {
      aliensCollected: [...(this.state.aliensCollected || [])],
      bestScores: [...(this.state.bestScores || [])],
    };
    this.state = { ...DEFAULT_STATE, ...persistent };
    try { localStorage.removeItem(RACE_STORAGE_KEY); } catch (e) { /* ignore */ }
    this.save();
  }

  // מחיקה מוחלטת — כולל אוסף וניקוד
  fullReset() {
    this.state = { ...DEFAULT_STATE };
    try { localStorage.removeItem(RACE_STORAGE_KEY); } catch (e) { /* ignore */ }
    this.save();
  }

  // === שמירת מצב מירוץ ===
  // שומר את כל הנתונים הדרושים כדי לחזור למירוץ באמצע
  saveRaceState(raceData) {
    try {
      localStorage.setItem(RACE_STORAGE_KEY, JSON.stringify(raceData));
      this.state.inProgress = true;
      this.save();
    } catch (e) {
      console.warn('Failed to save race state:', e);
    }
  }

  loadRaceState() {
    try {
      const raw = localStorage.getItem(RACE_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn('Failed to load race state:', e);
    }
    return null;
  }

  clearRaceState() {
    try {
      localStorage.removeItem(RACE_STORAGE_KEY);
    } catch (e) { /* ignore */ }
    this.state.inProgress = false;
    this.save();
  }

  hasGameInProgress() {
    return this.state.inProgress && this.loadRaceState() !== null;
  }

  // Setters
  setPlayerName(name) {
    this.state.playerName = name;
    this.save();
  }

  setSelectedColor(color) {
    this.state.selectedColor = color;
    this.save();
  }

  setDifficultyLevel(level) {
    this.state.difficultyLevel = level;
    this.save();
  }

  setCurrentStation(station) {
    this.state.currentStation = station;
    this.state.currentStationPuzzlesCompleted = 0;
    this.save();
  }

  // Score
  addScore(points) {
    this.state.score += points;
    this.save();
  }

  // Medals
  addMedal(type) {
    if (this.state.medals[type] !== undefined) {
      this.state.medals[type]++;
      this.save();
    }
  }

  // Aliens
  addAlien(id) {
    if (!this.state.aliensCollected.includes(id)) {
      this.state.aliensCollected.push(id);
      this.save();
    }
  }

  // Puzzle history
  recordPuzzle(result) {
    this.state.puzzleHistory.push(result);
    this.state.currentStationPuzzlesCompleted++;
    if (result.correct) {
      this.state.streak++;
    } else {
      this.state.streak = 0;
    }
    this.save();
  }

  // Streak
  incrementStreak() {
    this.state.streak++;
    this.save();
  }

  resetStreak() {
    this.state.streak = 0;
    this.save();
  }

  // Best scores — rich objects { score, playerName, difficulty, date, accuracy }
  addBestScore(entry) {
    // Backward compat: if a plain number is passed, wrap it
    if (typeof entry === 'number') {
      entry = { score: entry };
    }
    this.state.bestScores.push(entry);
    this.state.bestScores.sort((a, b) => {
      const scoreA = typeof a === 'number' ? a : (a.score || 0);
      const scoreB = typeof b === 'number' ? b : (b.score || 0);
      return scoreB - scoreA;
    });
    this.state.bestScores = this.state.bestScores.slice(0, 10);
    this.save();
  }

  getBestScore() {
    if (this.state.bestScores.length === 0) return 0;
    const first = this.state.bestScores[0];
    return typeof first === 'number' ? first : (first.score || 0);
  }

  getLeaderboard() {
    return this.state.bestScores.map(entry => {
      if (typeof entry === 'number') {
        return { score: entry };
      }
      return entry;
    });
  }

  // Stats
  getAccuracy() {
    const h = this.state.puzzleHistory;
    if (h.length === 0) return 0;
    const correct = h.filter(p => p.correct).length;
    return (correct / h.length) * 100;
  }

  getAverageTime() {
    const h = this.state.puzzleHistory;
    if (h.length === 0) return 0;
    const totalMs = h.reduce((sum, p) => sum + (p.timeMs || 0), 0);
    return totalMs / h.length;
  }

  getLongestStreak() {
    const h = this.state.puzzleHistory;
    let max = 0;
    let current = 0;
    for (const p of h) {
      if (p.correct) {
        current++;
        max = Math.max(max, current);
      } else {
        current = 0;
      }
    }
    return max;
  }

  getTypeCount(type, correctOnly = true) {
    return this.state.puzzleHistory.filter(
      p => p.type === type && (!correctOnly || p.correct)
    ).length;
  }
}

const gameState = new GameState();
export default gameState;
export { GameState };
