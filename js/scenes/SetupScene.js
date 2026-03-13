// SetupScene.js — מסך הגדרות

import UI from '../data/uiStrings.js';
import { SHIP_COLORS, DIFFICULTY_LEVELS } from '../config.js';
import gameState from '../systems/GameState.js';
import audioManager from '../systems/AudioManager.js';

export default class SetupScene {
  constructor(game) {
    this.game = game;
    this.ui = null;
    this.selectedColor = SHIP_COLORS[0].color;
    this.selectedLevel = 1;
  }

  enter() {
    this.selectedColor = SHIP_COLORS[0].color;
    this.selectedLevel = 1;

    this.ui = this.game.createSceneUI();
    this.ui.innerHTML = `
      <div class="setup-container fade-in-up">
        <h2>${UI.gameName}</h2>

        <div class="setup-section">
          <h3>${UI.setup.enterName}</h3>
          <input type="text" class="input-field" id="name-input"
            placeholder="${UI.setup.namePlaceholder}" maxlength="20" autocomplete="off">
          <div class="setup-error" id="name-error"></div>
        </div>

        <div class="setup-section">
          <h3>${UI.setup.chooseColor}</h3>
          <div class="color-picker" id="color-picker">
            ${SHIP_COLORS.map((c, i) => `
              <div class="color-option ${i === 0 ? 'selected' : ''}"
                data-color="${c.color}"
                style="background:${c.color}; --option-color:${c.color};"
                title="${c.name}">
              </div>
            `).join('')}
          </div>
        </div>

        <div class="setup-section">
          <h3>${UI.setup.chooseLevel}</h3>
          <div class="level-picker" id="level-picker">
            ${Object.entries(DIFFICULTY_LEVELS).map(([key, lvl]) => `
              <div class="level-card ${key === '1' ? 'selected' : ''}" data-level="${key}">
                <div class="level-label">${lvl.label}</div>
                <div class="level-name">${lvl.name}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <button class="btn btn-big pulse" id="btn-go">
          ${UI.setup.startButton} 🚀
        </button>
      </div>
    `;

    // Color selection
    const colorOptions = this.ui.querySelectorAll('.color-option');
    colorOptions.forEach(opt => {
      opt.addEventListener('click', () => {
        audioManager.play('click');
        colorOptions.forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
        this.selectedColor = opt.dataset.color;
      });
    });

    // Level selection
    const levelCards = this.ui.querySelectorAll('.level-card');
    levelCards.forEach(card => {
      card.addEventListener('click', () => {
        audioManager.play('click');
        levelCards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        this.selectedLevel = parseInt(card.dataset.level);
      });
    });

    // Go button
    this.ui.querySelector('#btn-go').addEventListener('click', () => {
      const nameInput = this.ui.querySelector('#name-input');
      const name = nameInput.value.trim();

      if (!name) {
        const error = this.ui.querySelector('#name-error');
        error.textContent = UI.setup.nameRequired;
        nameInput.focus();
        audioManager.play('wrong');
        return;
      }

      audioManager.play('boost');

      gameState.reset();
      gameState.setPlayerName(name);
      gameState.setSelectedColor(this.selectedColor);
      gameState.setDifficultyLevel(this.selectedLevel);

      this.game.switchScene('race');
    });
  }

  update(dt) {}
  render(ctx, w, h) {}

  exit() {
    this.game.removeSceneUI(this.ui);
    this.ui = null;
  }
}
