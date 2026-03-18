// PracticeTypeScene.js — מסך בחירת סוג תרגול

import UI from '../data/uiStrings.js';
import { PUZZLE_TYPES } from '../config.js';
import gameState from '../systems/GameState.js';
import audioManager from '../systems/AudioManager.js';

export default class PracticeTypeScene {
  constructor(game) {
    this.game = game;
    this.ui = null;
    this.selectedPracticeType = null;
  }

  enter() {
    this.selectedPracticeType = null;
    this._render();
  }

  _render() {
    if (this.ui) {
      this.game.removeSceneUI(this.ui);
    }
    this.ui = this.game.createSceneUI();

    const state = gameState.getState();
    const level = state.difficultyLevel || 1;

    this.ui.innerHTML = `
      <div class="setup-container fade-in-up">
        <h2>${UI.gameName}</h2>

        <div class="setup-section">
          <h3>${UI.setup.choosePracticeType}</h3>
          <div class="practice-type-picker" id="practice-type-picker">
            ${Object.values(PUZZLE_TYPES).map(pt => {
              const disabled = pt.availableFrom > level;
              const selected = this.selectedPracticeType === pt.id;
              return `
                <button class="puzzle-type-card ${disabled ? 'disabled' : ''} ${selected ? 'selected' : ''}"
                  data-type="${pt.id}" ${disabled ? 'disabled' : ''}>
                  <span class="puzzle-type-icon">${pt.icon}</span>
                  <span class="puzzle-type-name">${pt.name}</span>
                  ${disabled ? `<span style="font-size:0.7rem;color:var(--text-dim)">${UI.station.notAvailable}</span>` : ''}
                </button>
              `;
            }).join('')}
          </div>
          <div class="setup-error" id="practice-type-error"></div>
        </div>

        <div class="setup-nav-buttons">
          <button class="btn" id="btn-back">← ${UI.collection.back}</button>
          <button class="btn btn-big pulse" id="btn-go">${UI.setup.startButton} 🚀</button>
        </div>
      </div>
    `;

    this._bindEvents();
  }

  _bindEvents() {
    const ptButtons = this.ui.querySelectorAll('#practice-type-picker .puzzle-type-card:not(.disabled)');
    ptButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        audioManager.play('click');
        ptButtons.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        this.selectedPracticeType = btn.dataset.type;
        const err = this.ui.querySelector('#practice-type-error');
        if (err) err.textContent = '';
      });
    });

    this.ui.querySelector('#btn-back').addEventListener('click', () => {
      audioManager.play('click');
      this.game.switchScene('setup');
    });

    this.ui.querySelector('#btn-go').addEventListener('click', () => {
      this._onStart();
    });
  }

  _onStart() {
    if (!this.selectedPracticeType) {
      const error = this.ui.querySelector('#practice-type-error');
      if (error) error.textContent = UI.setup.practiceTypeRequired;
      audioManager.play('wrong');
      return;
    }

    audioManager.play('boost');
    gameState.setPracticeType(this.selectedPracticeType);
    this.game.switchScene('race');
  }

  update(dt) {}
  render(ctx, w, h) {}

  exit() {
    this.game.removeSceneUI(this.ui);
    this.ui = null;
  }
}
