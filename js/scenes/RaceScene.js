// RaceScene.js — מסך מירוץ ראשי

import UI from '../data/uiStrings.js';
import { COLORS, GAME_SETTINGS, DIFFICULTY_LEVELS, STATION_THEMES, PUZZLE_TYPES, GAME_MODES } from '../config.js';
import gameState from '../systems/GameState.js';
import audioManager from '../systems/AudioManager.js';
import StarField from '../entities/StarField.js';
import Spaceship from '../entities/Spaceship.js';
import Station from '../entities/Station.js';
import { createOpponents } from '../systems/AIOpponent.js';
import cloudLeaderboard from '../systems/CloudLeaderboard.js';
import { createStartOverButton } from '../ui/startOverHelper.js';

export default class RaceScene {
  constructor(game) {
    this.game = game;
    this.ui = null;
    this.starField = new StarField(800, 600);

    // Race objects
    this.playerShip = null;
    this.aiOpponents = [];
    this.aiShips = [];
    this.stations = [];

    // Race state
    this.phase = 'racing'; // racing, atStation, finished
    this.playerStation = 0;
    this.playerProgress = 0;
    this.playerAtStation = false;
    this.stationsCompleted = 0;

    // Track layout
    this.trackStartX = 0;
    this.trackEndX = 0;
    this.trackY = 0;

    // Auto-save timer
    this._saveTimer = 0;
    this._saveInterval = 3; // שמירה כל 3 שניות

    // Station entry time (for AI catch-up)
    this._stationEntryTime = 0;

    // Current visual theme
    this.currentTheme = STATION_THEMES[0];
  }

  enter(data = {}) {
    const state = gameState.getState();
    this.starField.resize(this.game.width, this.game.height);

    // Calculate track layout
    this._layoutTrack();

    if (data.fromStation) {
      // Returning from station/puzzle
      this._handleReturnFromStation(data);
      return;
    }

    if (data.resumeSaved) {
      // שחזור משחק שמור
      const saved = gameState.loadRaceState();
      if (saved) {
        this._restoreFromSaved(saved);
        return;
      }
      // אם אין שמירה — התחל חדש
    }

    // Fresh race start
    this._startFreshRace(state);
  }

  _startFreshRace(state) {
    this.phase = 'racing';
    this.playerStation = 0;
    this.playerProgress = 0;
    this.stationsCompleted = 0;
    this.playerAtStation = false;

    // Create player ship
    this.playerShip = new Spaceship(
      state.playerName || 'שַׂחְקָן',
      state.selectedColor || COLORS.cyan,
      this.trackStartX,
      this.trackY - 30,
    );

    // Create AI opponents
    this.aiOpponents = createOpponents();
    this.aiShips = this.aiOpponents.map((ai, i) => {
      const ship = new Spaceship(ai.name, ai.color, this.trackStartX, this.trackY + 20 + i * 30);
      return ship;
    });

    // Create stations with theme colors
    this.stations = [];
    for (let i = 1; i <= GAME_SETTINGS.totalStations; i++) {
      const x = this._stationX(i);
      const theme = STATION_THEMES[i - 1] || STATION_THEMES[0];
      this.stations.push(new Station(i, x, this.trackY, theme.accentColor));
    }

    // Apply initial theme
    this._applyTheme(0);

    // Build competition puzzle order if needed
    if (state.gameMode === GAME_MODES.competition) {
      const level = state.difficultyLevel || 1;
      const availableTypes = Object.values(PUZZLE_TYPES)
        .filter(pt => pt.availableFrom <= level)
        .map(pt => pt.id);
      const totalPuzzles = GAME_SETTINGS.totalStations * GAME_SETTINGS.puzzlesPerStation;
      const order = [];
      while (order.length < totalPuzzles) {
        // Fisher-Yates shuffle of available types
        const shuffled = [...availableTypes];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        order.push(...shuffled);
      }
      order.length = totalPuzzles;
      gameState.setCompetitionPuzzleOrder(order);
    }

    // סימון שהמירוץ התחיל
    gameState.state.inProgress = true;
    gameState.save();

    // Create HUD
    this._createHUD();

    // Start racing
    audioManager.play('boost');

    // שמירה ראשונית
    this._saveCurrentRaceState();
  }

  _restoreFromSaved(saved) {
    const state = gameState.getState();

    this.phase = 'racing'; // חוזרים ישר למירוץ
    this.playerStation = saved.playerStation || 0;
    this.playerProgress = saved.playerProgress || 0;
    this.stationsCompleted = saved.stationsCompleted || 0;
    this.playerAtStation = false;

    // Create player ship at saved position
    this.playerShip = new Spaceship(
      state.playerName || 'שַׂחְקָן',
      state.selectedColor || COLORS.cyan,
      this.trackStartX,
      this.trackY - 30,
    );

    // Create AI opponents and restore their progress
    this.aiOpponents = createOpponents();
    this.aiShips = this.aiOpponents.map((ai, i) => {
      const ship = new Spaceship(ai.name, ai.color, this.trackStartX, this.trackY + 20 + i * 30);

      // Restore AI progress
      if (saved.aiProgress && saved.aiProgress[i]) {
        ai.station = saved.aiProgress[i].station || 0;
        ai.progress = saved.aiProgress[i].progress || 0;
        ai.totalProgress = saved.aiProgress[i].totalProgress || 0;
        ai.solvingStation = saved.aiProgress[i].solvingStation || false;
        ai.puzzlesSolved = saved.aiProgress[i].puzzlesSolved || 0;
        ai.puzzleAttempts = saved.aiProgress[i].puzzleAttempts || 0;
        ai.stationTimer = saved.aiProgress[i].stationTimer || 0;
        ai.finished = saved.aiProgress[i].finished || false;
      }
      return ship;
    });

    // Create stations with theme colors and mark completed ones
    this.stations = [];
    for (let i = 1; i <= GAME_SETTINGS.totalStations; i++) {
      const x = this._stationX(i);
      const theme = STATION_THEMES[i - 1] || STATION_THEMES[0];
      const station = new Station(i, x, this.trackY, theme.accentColor);
      if (i <= this.stationsCompleted) {
        station.setCompleted(true);
      }
      this.stations.push(station);
    }

    // Apply theme for current station
    this._applyTheme(this.stationsCompleted);

    // Position ships correctly
    const px = this._playerX();
    this.playerShip.setPositionImmediate(px, this.trackY - 30);

    this.aiOpponents.forEach((ai, i) => {
      const aiX = ai.getTrackPosition(this.trackStartX, this.trackEndX);
      this.aiShips[i].setPositionImmediate(aiX, this.trackY + 20 + i * 30);
    });

    this._createHUD();
    audioManager.play('boost');
  }

  // === שמירת מצב מירוץ ===
  _saveCurrentRaceState() {
    const raceData = {
      playerStation: this.playerStation,
      playerProgress: this.playerProgress,
      stationsCompleted: this.stationsCompleted,
      phase: this.phase,
      aiProgress: this.aiOpponents.map(ai => ({
        station: ai.station,
        progress: ai.progress,
        totalProgress: ai.totalProgress,
        solvingStation: ai.solvingStation,
        puzzlesSolved: ai.puzzlesSolved,
        puzzleAttempts: ai.puzzleAttempts,
        stationTimer: ai.stationTimer,
        finished: ai.finished,
      })),
      savedAt: Date.now(),
    };
    gameState.saveRaceState(raceData);
  }

  _layoutTrack() {
    const margin = 80;
    this.trackStartX = margin;
    this.trackEndX = this.game.width - margin;
    this.trackY = this.game.height * 0.5;
  }

  _stationX(stationNum) {
    const totalStations = GAME_SETTINGS.totalStations;
    const range = this.trackEndX - this.trackStartX;
    return this.trackStartX + (stationNum / (totalStations + 1)) * range;
  }

  _playerX() {
    if (this.playerStation === 0 && this.playerProgress === 0) {
      return this.trackStartX;
    }
    const currentStationX = this.playerStation > 0 ? this._stationX(this.playerStation) : this.trackStartX;
    const nextStationX = this._stationX(Math.min(this.playerStation + 1, GAME_SETTINGS.totalStations));
    return currentStationX + this.playerProgress * (nextStationX - currentStationX);
  }

  _getPlayerRaceProgress() {
    const segmentSize = 1 / (GAME_SETTINGS.totalStations + 1);

    if (this.playerAtStation || this.playerProgress >= 1) {
      return Math.min(1, this.playerStation * segmentSize);
    }

    return Math.min(1, (this.playerStation + this.playerProgress) * segmentSize);
  }

  _applyTheme(stationIndex) {
    const idx = Math.min(stationIndex, STATION_THEMES.length - 1);
    this.currentTheme = STATION_THEMES[idx];
    this.starField.setTheme(this.currentTheme);
    audioManager.setStationMusic(this.currentTheme);
  }

  _handleReturnFromStation(data) {
    this.phase = 'racing';

    // Advance AI by the time the player spent at the station
    const state = gameState.getState();
    const level = state.difficultyLevel || 1;
    if (this._stationEntryTime > 0) {
      const timeInStation = (Date.now() - this._stationEntryTime) / 1000;
      const playerRaceProgress = this._getPlayerRaceProgress();
      this.aiOpponents.forEach((ai, i) => {
        ai.advanceByTime(timeInStation, playerRaceProgress, level);
      });
      this._stationEntryTime = 0;
    }

    if (data.stationComplete) {
      // Mark station as completed
      this.stationsCompleted++;
      if (this.stations[this.playerStation - 1]) {
        this.stations[this.playerStation - 1].setCompleted(true);
        this.stations[this.playerStation - 1].setActive(false);
      }

      // Apply theme for the new zone
      this._applyTheme(this.stationsCompleted);

      // Check if race is over
      if (this.stationsCompleted >= GAME_SETTINGS.totalStations) {
        this._finishRace();
        return;
      }

      // Boost after station
      if (this.playerShip) {
        this.playerShip.setBoost(true);
        audioManager.play('boost');
      }

      this.playerProgress = 0;
      gameState.setCurrentStation(this.playerStation + 1);
    }

    // Update AI ship positions after advancing
    this.aiOpponents.forEach((ai, i) => {
      const aiX = ai.getTrackPosition(this.trackStartX, this.trackEndX);
      this.aiShips[i].setPositionImmediate(aiX, this.trackY + 20 + i * 30);
    });

    this._createHUD();
    this._saveCurrentRaceState();
  }

  _createHUD() {
    // Remove old HUD
    if (this.ui) {
      this.game.removeSceneUI(this.ui);
    }

    this.ui = this.game.createSceneUI();
    this.ui.style.pointerEvents = 'none';

    const state = gameState.getState();

    this.ui.innerHTML = `
      <div class="hud" id="race-hud">
        <div class="hud-item">
          <span>${UI.race.score}:</span>
          <span class="hud-value" id="hud-score">${state.score}</span>
        </div>
        <div class="hud-item">
          <span class="hud-station" id="hud-station">
            ${UI.race.station} ${Math.min(this.stationsCompleted + 1, GAME_SETTINGS.totalStations)} / ${GAME_SETTINGS.totalStations}
          </span>
        </div>
        <div class="hud-item">
          <span id="hud-position" class="hud-position first">#1</span>
        </div>
        <div class="hud-item" id="hud-startover"></div>
      </div>
      <div class="race-track-info" id="racer-info">
        <div class="racer-info">
          <div class="racer-dot" style="background:${state.selectedColor};--dot-color:${state.selectedColor}"></div>
          <span>${state.playerName || 'שַׂחְקָן'}</span>
        </div>
        ${this.aiOpponents.map(ai => `
          <div class="racer-info">
            <div class="racer-dot" style="background:${ai.color};--dot-color:${ai.color}"></div>
            <span>${ai.name}</span>
          </div>
        `).join('')}
      </div>
    `;

    // Mount start-over button into HUD
    const startOverMount = this.ui.querySelector('#hud-startover');
    if (startOverMount) {
      startOverMount.appendChild(createStartOverButton(this.game));
    }
  }

  _getPlayerPosition() {
    const playerProg = this._getPlayerRaceProgress();
    let position = 1;
    for (const ai of this.aiOpponents) {
      if (ai.getProgress() > playerProg) position++;
    }
    return position;
  }

  _finishRace() {
    this.phase = 'finished';
    const position = this._getPlayerPosition();
    const state = gameState.getState();
    const difficulty = state.difficultyLevel || 1;
    const levelInfo = DIFFICULTY_LEVELS[difficulty];

    // Build rich leaderboard entry
    const now = new Date();
    const dateStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
    const entry = {
      score: state.score,
      playerName: state.playerName || 'שַׂחְקָן',
      difficulty,
      difficultyLabel: levelInfo ? levelInfo.label : `${difficulty}`,
      date: dateStr,
      accuracy: Math.round(gameState.getAccuracy()),
      gameMode: state.gameMode || GAME_MODES.practice,
    };

    gameState.addBestScore(entry);
    gameState.clearRaceState(); // מירוץ הסתיים — מחיקת שמירה

    // Submit to global cloud leaderboard only in competition mode (fire-and-forget)
    if (state.gameMode === GAME_MODES.competition) {
      cloudLeaderboard.submitScore(entry);
    }

    setTimeout(() => {
      this.game.switchScene('results', {
        position,
        finalScore: state.score,
      });
    }, 1500);
  }

  update(dt) {
    this.starField.update(dt * 0.5);

    // Update all ships
    if (this.playerShip) this.playerShip.update(dt);
    this.aiShips.forEach(s => s.update(dt));
    this.stations.forEach(s => s.update(dt));

    if (this.phase === 'racing') {
      this._updateRacing(dt);
    }
  }

  _updateRacing(dt) {
    const state = gameState.getState();
    const level = state.difficultyLevel || 1;

    // Move player toward next station
    if (!this.playerAtStation) {
      this.playerProgress += dt * 0.35;

      if (this.playerProgress >= 1) {
        this.playerProgress = 1;
        this.playerStation++;
        this.playerAtStation = true;

        // Activate station
        if (this.stations[this.playerStation - 1]) {
          this.stations[this.playerStation - 1].setActive(true);
        }

        // שמירה לפני מעבר לתחנה
        this._saveCurrentRaceState();

        // Record time entering station (for AI catch-up)
        this._stationEntryTime = Date.now();

        // Go to station scene
        gameState.setCurrentStation(this.playerStation);
        setTimeout(() => {
          this.game.switchScene('station', {
            station: this.playerStation,
            puzzlesLeft: GAME_SETTINGS.puzzlesPerStation,
          });
        }, 500);
        return;
      }

      // Update player ship position
      const px = this._playerX();
      this.playerShip.setPosition(px, this.trackY - 30);
    }

    // Update AI
    const playerRaceProgress = this._getPlayerRaceProgress();
    this.aiOpponents.forEach((ai, i) => {
      ai.update(dt, playerRaceProgress, level);
      const aiX = ai.getTrackPosition(this.trackStartX, this.trackEndX);
      this.aiShips[i].setPosition(aiX, this.trackY + 20 + i * 30);
      this.aiShips[i].setBoost(ai.isBoosting());
    });

    // Update HUD
    this._updateHUD();

    // שמירה אוטומטית כל כמה שניות
    this._saveTimer += dt;
    if (this._saveTimer >= this._saveInterval) {
      this._saveTimer = 0;
      this._saveCurrentRaceState();
    }
  }

  _updateHUD() {
    if (!this.ui) return;
    const state = gameState.getState();

    const scoreEl = this.ui.querySelector('#hud-score');
    if (scoreEl) scoreEl.textContent = state.score;

    const stationEl = this.ui.querySelector('#hud-station');
    if (stationEl) {
      stationEl.textContent = `${UI.race.station} ${Math.min(this.stationsCompleted + 1, GAME_SETTINGS.totalStations)} / ${GAME_SETTINGS.totalStations}`;
    }

    const posEl = this.ui.querySelector('#hud-position');
    if (posEl) {
      const pos = this._getPlayerPosition();
      posEl.textContent = `#${pos}`;
      posEl.className = `hud-position ${pos === 1 ? 'first' : pos === 2 ? 'second' : 'third'}`;
    }
  }

  render(ctx, w, h) {
    // Dynamic background gradient based on current theme
    const theme = this.currentTheme || STATION_THEMES[0];
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, theme.bgGradient[0]);
    grad.addColorStop(1, theme.bgGradient[1]);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // StarField (with nebula + tinted stars)
    this.starField.render(ctx);

    // Draw track line
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(this.trackStartX, this.trackY);
    ctx.lineTo(this.trackEndX, this.trackY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // Draw stations
    this.stations.forEach(s => s.draw(ctx));

    // Draw finish line
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.5)';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(this.trackEndX, this.trackY - 50);
    ctx.lineTo(this.trackEndX, this.trackY + 60);
    ctx.stroke();

    ctx.fillStyle = '#ffd700';
    ctx.font = "bold 12px 'Noto Sans Hebrew', sans-serif";
    ctx.textAlign = 'center';
    ctx.fillText('🏁', this.trackEndX, this.trackY - 55);
    ctx.restore();

    // Draw AI ships
    this.aiShips.forEach(s => s.draw(ctx));

    // Draw player ship
    if (this.playerShip) this.playerShip.draw(ctx);

  }

  exit() {
    this.game.removeSceneUI(this.ui);
    this.ui = null;
    this.playerAtStation = false;
  }

  onResize(w, h) {
    this.starField.resize(w, h);
    this._layoutTrack();

    // Reposition stations
    this.stations.forEach((s, i) => {
      s.x = this._stationX(i + 1);
      s.y = this.trackY;
    });

    // Reposition ships
    if (this.playerShip) {
      const px = this._playerX();
      this.playerShip.setPositionImmediate(px, this.trackY - 30);
    }
    this.aiOpponents.forEach((ai, i) => {
      const aiX = ai.getTrackPosition(this.trackStartX, this.trackEndX);
      this.aiShips[i].setPositionImmediate(aiX, this.trackY + 20 + i * 30);
    });
  }
}
