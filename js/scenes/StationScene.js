// StationScene.js — מסך תחנה — בחירת סוג חידה

import UI from '../data/uiStrings.js';
import { PUZZLE_TYPES, GAME_SETTINGS, STATION_THEMES } from '../config.js';
import gameState from '../systems/GameState.js';
import audioManager from '../systems/AudioManager.js';

export default class StationScene {
  constructor(game) {
    this.game = game;
    this.ui = null;
    this.stationNum = 1;
    this.puzzlesLeft = GAME_SETTINGS.puzzlesPerStation;
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

  update(dt) {}
  render(ctx, w, h) {}

  exit() {
    this.game.removeSceneUI(this.ui);
    this.ui = null;
  }
}
