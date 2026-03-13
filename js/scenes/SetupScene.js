// SetupScene.js — מסך הגדרות

import UI from '../data/uiStrings.js';
import { SHIP_COLORS, DIFFICULTY_LEVELS, GAME_MODES, PUZZLE_TYPES } from '../config.js';
import gameState from '../systems/GameState.js';
import audioManager from '../systems/AudioManager.js';

export default class SetupScene {
  constructor(game) {
    this.game = game;
    this.ui = null;
    this.selectedColor = SHIP_COLORS[0].color;
    this.selectedLevel = 1;
    this.selectedMode = GAME_MODES.practice;
    this.selectedPracticeType = null;
    this.editingProfile = false;
  }

  enter() {
    const state = gameState.getState();
    this.selectedMode = GAME_MODES.practice;
    this.selectedPracticeType = null;
    this.editingProfile = false;

    if (gameState.hasPlayerProfile()) {
      this.selectedColor = state.selectedColor || SHIP_COLORS[0].color;
      this.selectedLevel = state.difficultyLevel || 1;
    } else {
      this.selectedColor = SHIP_COLORS[0].color;
      this.selectedLevel = 1;
    }

    this._render();
  }

  _render() {
    if (this.ui) {
      this.game.removeSceneUI(this.ui);
    }
    this.ui = this.game.createSceneUI();

    const state = gameState.getState();
    const hasProfile = gameState.hasPlayerProfile() && !this.editingProfile;
    const isPractice = this.selectedMode === GAME_MODES.practice;

    this.ui.innerHTML = `
      <div class="setup-container fade-in-up">
        <h2>${UI.gameName}</h2>

        ${hasProfile ? `
          <div class="setup-section">
            <div class="player-profile-card">
              <div class="profile-playing-as">${UI.setup.playingAs}</div>
              <div class="profile-name-display">${state.playerName}</div>
              <div class="profile-grade-display">${DIFFICULTY_LEVELS[state.difficultyLevel]?.name || ''}</div>
              <button class="btn btn-small profile-change-btn" id="btn-change-player">
                ✏️ ${UI.setup.changePlayer}
              </button>
            </div>
          </div>
        ` : `
          <div class="setup-section">
            <h3>${UI.setup.enterName}</h3>
            <input type="text" class="input-field" id="name-input"
              placeholder="${UI.setup.namePlaceholder}" maxlength="20" autocomplete="off"
              value="${this.editingProfile ? (state.playerName || '') : ''}">
            <div class="setup-error" id="name-error"></div>
          </div>

          <div class="setup-section">
            <h3>${UI.setup.chooseLevel}</h3>
            <div class="level-picker" id="level-picker">
              ${Object.entries(DIFFICULTY_LEVELS).map(([key, lvl]) => `
                <div class="level-card ${parseInt(key) === this.selectedLevel ? 'selected' : ''}" data-level="${key}">
                  <div class="level-label">${lvl.label}</div>
                  <div class="level-name">${lvl.name}</div>
                </div>
              `).join('')}
            </div>
          </div>
        `}

        <div class="setup-section">
          <h3>${UI.setup.chooseColor}</h3>
          <div class="color-picker" id="color-picker">
            ${SHIP_COLORS.map((c) => `
              <div class="color-option ${c.color === this.selectedColor ? 'selected' : ''}"
                data-color="${c.color}"
                style="background:${c.color}; --option-color:${c.color};"
                title="${c.name}">
              </div>
            `).join('')}
          </div>
        </div>

        <div class="setup-section">
          <h3>${UI.setup.chooseMode}</h3>
          <div class="mode-picker" id="mode-picker">
            <div class="mode-card ${this.selectedMode === GAME_MODES.practice ? 'selected' : ''}" data-mode="${GAME_MODES.practice}">
              <div class="mode-icon">🎯</div>
              <div class="mode-name">${UI.setup.modePractice}</div>
              <div class="mode-desc">${UI.setup.modePracticeDesc}</div>
            </div>
            <div class="mode-card ${this.selectedMode === GAME_MODES.competition ? 'selected' : ''}" data-mode="${GAME_MODES.competition}">
              <div class="mode-icon">🏆</div>
              <div class="mode-name">${UI.setup.modeCompetition}</div>
              <div class="mode-desc">${UI.setup.modeCompetitionDesc}</div>
            </div>
          </div>
        </div>

        <div class="setup-section" id="practice-type-section" style="${isPractice ? '' : 'display:none;'}">
          <h3>${UI.setup.choosePracticeType}</h3>
          <div class="practice-type-picker" id="practice-type-picker">
            ${Object.values(PUZZLE_TYPES).map(pt => {
              const disabled = pt.availableFrom > this.selectedLevel;
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

        <button class="btn btn-big pulse" id="btn-go">
          ${UI.setup.startButton} 🚀
        </button>
      </div>
    `;

    this._bindEvents(hasProfile);
  }

  _bindEvents(hasProfile) {
    // Change player button
    const btnChange = this.ui.querySelector('#btn-change-player');
    if (btnChange) {
      btnChange.addEventListener('click', () => {
        audioManager.play('click');
        this.editingProfile = true;
        this._render();
      });
    }

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

    // Level selection (only shown when editing)
    const levelCards = this.ui.querySelectorAll('.level-card');
    levelCards.forEach(card => {
      card.addEventListener('click', () => {
        audioManager.play('click');
        levelCards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        this.selectedLevel = parseInt(card.dataset.level);
        // Refresh practice type section to reflect level-based availability
        this._refreshPracticeTypes();
      });
    });

    // Mode selection
    const modeCards = this.ui.querySelectorAll('.mode-card');
    modeCards.forEach(card => {
      card.addEventListener('click', () => {
        audioManager.play('click');
        modeCards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        this.selectedMode = card.dataset.mode;
        const section = this.ui.querySelector('#practice-type-section');
        if (section) {
          section.style.display = this.selectedMode === GAME_MODES.practice ? '' : 'none';
        }
      });
    });

    // Practice type selection
    this._bindPracticeTypeEvents();

    // Go button
    this.ui.querySelector('#btn-go').addEventListener('click', () => {
      this._onStart(hasProfile);
    });
  }

  _bindPracticeTypeEvents() {
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
  }

  _refreshPracticeTypes() {
    const picker = this.ui.querySelector('#practice-type-picker');
    if (!picker) return;

    // Rebuild practice type buttons based on new level
    picker.innerHTML = Object.values(PUZZLE_TYPES).map(pt => {
      const disabled = pt.availableFrom > this.selectedLevel;
      const selected = this.selectedPracticeType === pt.id;
      // Deselect if the current type becomes unavailable
      if (disabled && this.selectedPracticeType === pt.id) {
        this.selectedPracticeType = null;
      }
      return `
        <button class="puzzle-type-card ${disabled ? 'disabled' : ''} ${selected && !disabled ? 'selected' : ''}"
          data-type="${pt.id}" ${disabled ? 'disabled' : ''}>
          <span class="puzzle-type-icon">${pt.icon}</span>
          <span class="puzzle-type-name">${pt.name}</span>
          ${disabled ? `<span style="font-size:0.7rem;color:var(--text-dim)">${UI.station.notAvailable}</span>` : ''}
        </button>
      `;
    }).join('');

    this._bindPracticeTypeEvents();
  }

  _onStart(hasProfile) {
    let name;
    let level;

    if (hasProfile) {
      const state = gameState.getState();
      name = state.playerName;
      level = state.difficultyLevel;
    } else {
      const nameInput = this.ui.querySelector('#name-input');
      name = nameInput ? nameInput.value.trim() : '';

      if (!name) {
        const error = this.ui.querySelector('#name-error');
        if (error) error.textContent = UI.setup.nameRequired;
        if (nameInput) nameInput.focus();
        audioManager.play('wrong');
        return;
      }

      level = this.selectedLevel;
    }

    if (this.selectedMode === GAME_MODES.practice && !this.selectedPracticeType) {
      const error = this.ui.querySelector('#practice-type-error');
      if (error) error.textContent = UI.setup.practiceTypeRequired;
      audioManager.play('wrong');
      return;
    }

    audioManager.play('boost');

    gameState.reset();
    gameState.setPlayerName(name);
    gameState.setSelectedColor(this.selectedColor);
    gameState.setDifficultyLevel(level);
    gameState.setGameMode(this.selectedMode);

    if (this.selectedMode === GAME_MODES.practice) {
      gameState.setPracticeType(this.selectedPracticeType);
    }

    this.game.switchScene('race');
  }

  update(dt) {}
  render(ctx, w, h) {}

  exit() {
    this.game.removeSceneUI(this.ui);
    this.ui = null;
  }
}
