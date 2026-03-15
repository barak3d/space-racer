// startOverHelper.js — כפתור "חזרה להתחלה" משותף לכל מסכי המשחק

import UI from '../data/uiStrings.js';
import gameState from '../systems/GameState.js';
import audioManager from '../systems/AudioManager.js';

/**
 * Creates a small home button that triggers the start-over confirmation dialog.
 * @param {object} game — the Game instance (for switchScene / overlay)
 * @returns {HTMLButtonElement}
 */
export function createStartOverButton(game) {
  const btn = document.createElement('button');
  btn.className = 'start-over-btn';
  btn.textContent = UI.startOver.button;
  btn.setAttribute('aria-label', UI.startOver.title);
  btn.addEventListener('click', () => {
    audioManager.play('click');
    showStartOverConfirm(game);
  });
  return btn;
}

/**
 * Shows a confirmation overlay dialog before starting over.
 * Reuses the same pattern as MenuScene._showResetConfirm().
 * On confirm: clears race state, resets game, returns to setup.
 * @param {object} game
 */
export function showStartOverConfirm(game) {
  const overlay = document.createElement('div');
  overlay.className = 'scene active';
  overlay.style.background = 'var(--overlay-bg)';
  overlay.style.zIndex = '50';

  overlay.innerHTML = `
    <div class="flex-col gap-lg" style="max-width:400px;width:90%;text-align:center;">
      <h2 style="color:var(--neon-gold);">🏠 ${UI.startOver.title}</h2>
      <p style="color:var(--text-secondary);font-size:1rem;line-height:1.6;">
        ${UI.startOver.message}
      </p>
      <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
        <button class="btn" id="btn-startover-cancel" style="border-color:var(--text-secondary);color:var(--text-secondary);">
          ${UI.startOver.cancel}
        </button>
        <button class="btn" id="btn-startover-confirm" style="border-color:var(--neon-gold);color:var(--neon-gold);
          box-shadow:0 0 10px rgba(255,215,0,0.3);">
          ${UI.startOver.confirm}
        </button>
      </div>
    </div>
  `;

  game.overlay.appendChild(overlay);

  overlay.querySelector('#btn-startover-cancel').addEventListener('click', () => {
    audioManager.play('click');
    overlay.remove();
  });

  overlay.querySelector('#btn-startover-confirm').addEventListener('click', () => {
    audioManager.play('click');
    gameState.clearRaceState();
    gameState.reset();
    overlay.remove();
    game.switchScene('setup');
  });
}
