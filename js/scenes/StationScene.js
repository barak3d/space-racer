// StationScene.js — מסך תחנה — בחירת סוג חידה

import UI from '../data/uiStrings.js';
import { PUZZLE_TYPES, GAME_SETTINGS, STATION_THEMES, GAME_MODES } from '../config.js';
import gameState from '../systems/GameState.js';
import audioManager from '../systems/AudioManager.js';

export default class StationScene {
  constructor(game) {
    this.game = game;
    this.ui = null;
    this.stationNum = 1;
    this.puzzlesLeft = GAME_SETTINGS.puzzlesPerStation;
    this.autoAdvanceTimer_ = null;
  }

  enter(data = {}) {
    const state = gameState.getState();
    this.stationNum = data.station || state.currentStation || 1;
    this.puzzlesLeft = data.puzzlesLeft !== undefined
      ? data.puzzlesLeft
      : GAME_SETTINGS.puzzlesPerStation - (state.currentStationPuzzlesCompleted || 0);

    if (this.puzzlesLeft <= 0) {
      // Station complete — go back to race
      this.game.switchScene('race', { fromStation: true, stationComplete: true });
      return;
    }

    if (state.gameMode === GAME_MODES.competition) {
      this._enterCompetitionMode(data, state);
    } else {
      this._enterPracticeMode(data, state);
    }
  }

  _enterPracticeMode(data, state) {
    // If a practice type was chosen at setup, skip the selection and go straight to the puzzle
    if (state.practiceType) {
      this.ui = this.game.createSceneUI();
      const theme = STATION_THEMES[this.stationNum - 1] || STATION_THEMES[0];
      const puzzleType = PUZZLE_TYPES[state.practiceType] || PUZZLE_TYPES.addition;

      const stationLabel = UI.station.stationOf
        .replace('{current}', this.stationNum)
        .replace('{total}', GAME_SETTINGS.totalStations);

      this.ui.innerHTML = `
        <div class="flex-col gap-lg fade-in-up" style="max-width:550px;width:90%;">
          <div class="station-header">
            <div class="station-zone-name" style="color:${theme.accentColor};text-shadow:0 0 12px ${theme.accentColor}">${theme.name}</div>
            <div class="station-number" style="border-color:${theme.accentColor};box-shadow:0 0 15px ${theme.accentColor};color:${theme.accentColor}">${this.stationNum}</div>
            <h2>${UI.station.title}</h2>
            <div class="game-subtitle">${stationLabel}</div>
          </div>

          <div class="competition-puzzle-preview">
            <div class="preview-label">${UI.station.practiceSelected}</div>
            <div class="preview-icon">${puzzleType.icon}</div>
            <div class="preview-name">${puzzleType.name}</div>
          </div>

          <div class="puzzles-remaining">
            ${UI.station.puzzlesLeft} <strong>${this.puzzlesLeft}</strong>
          </div>
        </div>
      `;

      // Auto-advance to puzzle after 1 second
      this.autoAdvanceTimer_ = setTimeout(() => {
        this.autoAdvanceTimer_ = null;
        this.game.switchScene('puzzle', {
          puzzleType: state.practiceType,
          station: this.stationNum,
          puzzlesLeft: this.puzzlesLeft,
        });
      }, 1000);
      return;
    }

    const level = state.difficultyLevel || 1;
    const theme = STATION_THEMES[this.stationNum - 1] || STATION_THEMES[0];

    this.ui = this.game.createSceneUI();

    const stationLabel = UI.station.stationOf
      .replace('{current}', this.stationNum)
      .replace('{total}', GAME_SETTINGS.totalStations);

    this.ui.innerHTML = `
      <div class="flex-col gap-lg fade-in-up" style="max-width:550px;width:90%;">
        <div class="station-header">
          <div class="station-zone-name" style="color:${theme.accentColor};text-shadow:0 0 12px ${theme.accentColor}">${theme.name}</div>
          <div class="station-number" style="border-color:${theme.accentColor};box-shadow:0 0 15px ${theme.accentColor};color:${theme.accentColor}">${this.stationNum}</div>
          <h2>${UI.station.title}</h2>
          <div class="game-subtitle">${stationLabel}</div>
        </div>

        <h3>${UI.station.choosePuzzle}</h3>

        <div class="grid-2x3 stagger" id="puzzle-types">
          ${Object.values(PUZZLE_TYPES).map(pt => {
            const disabled = pt.availableFrom > level;
            return `
              <button class="puzzle-type-card ${disabled ? 'disabled' : ''}"
                data-type="${pt.id}" ${disabled ? 'disabled' : ''}>
                <span class="puzzle-type-icon">${pt.icon}</span>
                <span class="puzzle-type-name">${pt.name}</span>
                ${disabled ? `<span style="font-size:0.7rem;color:var(--text-dim)">${UI.station.notAvailable}</span>` : ''}
              </button>
            `;
          }).join('')}
        </div>

        <div class="puzzles-remaining">
          ${UI.station.puzzlesLeft} <strong>${this.puzzlesLeft}</strong>
        </div>
      </div>
    `;

    // Bind puzzle type buttons
    const buttons = this.ui.querySelectorAll('.puzzle-type-card:not(.disabled)');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        audioManager.play('click');
        const type = btn.dataset.type;
        this.game.switchScene('puzzle', {
          puzzleType: type,
          station: this.stationNum,
          puzzlesLeft: this.puzzlesLeft,
        });
      });
    });
  }

  _enterCompetitionMode(data, state) {
    const nextType = gameState.getNextCompetitionPuzzle();
    const puzzleType = PUZZLE_TYPES[nextType] || PUZZLE_TYPES.addition;
    const theme = STATION_THEMES[this.stationNum - 1] || STATION_THEMES[0];

    this.ui = this.game.createSceneUI();

    const stationLabel = UI.station.stationOf
      .replace('{current}', this.stationNum)
      .replace('{total}', GAME_SETTINGS.totalStations);

    this.ui.innerHTML = `
      <div class="flex-col gap-lg fade-in-up" style="max-width:550px;width:90%;">
        <div class="station-header">
          <div class="station-zone-name" style="color:${theme.accentColor};text-shadow:0 0 12px ${theme.accentColor}">${theme.name}</div>
          <div class="station-number" style="border-color:${theme.accentColor};box-shadow:0 0 15px ${theme.accentColor};color:${theme.accentColor}">${this.stationNum}</div>
          <h2>${UI.station.title}</h2>
          <div class="game-subtitle">${stationLabel}</div>
        </div>

        <div class="competition-puzzle-preview">
          <div class="preview-label">${UI.station.autoSelected}</div>
          <div class="preview-icon">${puzzleType.icon}</div>
          <div class="preview-name">${puzzleType.name}</div>
        </div>

        <div class="puzzles-remaining">
          ${UI.station.puzzlesLeft} <strong>${this.puzzlesLeft}</strong>
        </div>
      </div>
    `;

    // Auto-advance to puzzle after 1 second
    this.autoAdvanceTimer_ = setTimeout(() => {
      this.autoAdvanceTimer_ = null;
      this.game.switchScene('puzzle', {
        puzzleType: nextType,
        station: this.stationNum,
        puzzlesLeft: this.puzzlesLeft,
      });
    }, 1000);
  }

  update(dt) {}
  render(ctx, w, h) {}

  exit() {
    if (this.autoAdvanceTimer_) {
      clearTimeout(this.autoAdvanceTimer_);
      this.autoAdvanceTimer_ = null;
    }
    this.game.removeSceneUI(this.ui);
    this.ui = null;
  }
}
