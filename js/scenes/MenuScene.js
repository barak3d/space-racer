// MenuScene.js — מסך פתיחה

import UI from '../data/uiStrings.js';
import StarField from '../entities/StarField.js';
import audioManager from '../systems/AudioManager.js';
import gameState from '../systems/GameState.js';
import { GAME_SETTINGS, DIFFICULTY_LEVELS } from '../config.js';
import cloudLeaderboard from '../systems/CloudLeaderboard.js';

export default class MenuScene {
  constructor(game) {
    this.game = game;
    this.ui = null;
    this.starField = new StarField(800, 600);
    this.shipX = 0;
    this.shipY = 0;
    this.shipTime = 0;
  }

  enter() {
    this.starField.resize(this.game.width, this.game.height);
    this.shipX = this.game.width * 0.5;
    this.shipY = this.game.height * 0.35;

    const hasSavedGame = gameState.hasGameInProgress();
    const state = gameState.getState();

    this.ui = this.game.createSceneUI();
    this.ui.innerHTML = `
      <div class="flex-col gap-lg" style="z-index:2; position:relative;">
        <div class="game-title title-glow" style="margin-top:8vh;">
          ${UI.gameName}
        </div>
        <div class="game-subtitle">🚀 ⭐ 🛸</div>

        ${hasSavedGame ? `
          <div class="flex-col gap-md w-full" style="max-width:320px;">
            <button class="btn btn-big pulse" id="btn-continue">
              ${UI.menu.continueRace} ▶
            </button>
            <div class="saved-game-info" style="font-size:0.85rem;color:var(--text-secondary);text-align:center;">
              ${state.playerName} · ${UI.race.station} ${state.currentStation}/${GAME_SETTINGS.totalStations} · ${UI.race.score}: ${state.score}
            </div>
            <button class="btn btn-green" id="btn-newgame">
              ${UI.menu.newGame} 🆕
            </button>
          </div>
        ` : `
          <button class="btn btn-big pulse" id="btn-start">
            ${UI.menu.startRace}
          </button>
        `}

        <div class="flex-col gap-sm" style="margin-top:8px;">
          <button class="btn btn-gold btn-small" id="btn-collection">
            ${UI.menu.myCollection}
          </button>
          <button class="btn btn-small" id="btn-leaderboard" style="border-color:var(--neon-gold);color:var(--neon-gold);
            box-shadow:0 0 10px rgba(255,215,0,0.2);font-size:0.9rem;">
            🏆 ${UI.leaderboard.button}
          </button>
          <button class="btn btn-small" id="btn-reset" style="border-color:var(--neon-red);color:var(--neon-red);
            box-shadow:0 0 10px rgba(255,0,64,0.2);font-size:0.8rem;min-height:40px;min-width:80px;opacity:0.7;">
            ${UI.menu.resetAll} 🗑️
          </button>
        </div>
      </div>
    `.trim();

    // כפתור התחל (משחק חדש כשאין שמור)
    const btnStart = this.ui.querySelector('#btn-start');
    if (btnStart) {
      btnStart.addEventListener('click', () => {
        audioManager.play('click');
        this.game.switchScene('setup');
      });
    }

    // כפתור המשך משחק שמור
    const btnContinue = this.ui.querySelector('#btn-continue');
    if (btnContinue) {
      btnContinue.addEventListener('click', () => {
        audioManager.play('boost');
        this.game.switchScene('race', { resumeSaved: true });
      });
    }

    // כפתור משחק חדש (כשיש שמור)
    const btnNew = this.ui.querySelector('#btn-newgame');
    if (btnNew) {
      btnNew.addEventListener('click', () => {
        audioManager.play('click');
        gameState.reset();
        this.game.switchScene('setup');
      });
    }

    // כפתור אוסף
    this.ui.querySelector('#btn-collection').addEventListener('click', () => {
      audioManager.play('click');
      this._showCollection();
    });

    // כפתור טבלת שיאים
    this.ui.querySelector('#btn-leaderboard').addEventListener('click', () => {
      audioManager.play('click');
      this._showLeaderboard();
    });

    // כפתור אפס הכל
    this.ui.querySelector('#btn-reset').addEventListener('click', () => {
      audioManager.play('click');
      this._showResetConfirm();
    });

    audioManager.startBgMusic();
  }

  _showResetConfirm() {
    const overlay = document.createElement('div');
    overlay.className = 'scene active';
    overlay.style.background = 'var(--overlay-bg)';
    overlay.style.zIndex = '50';

    overlay.innerHTML = `
      <div class="flex-col gap-lg" style="max-width:400px;width:90%;text-align:center;">
        <h2 style="color:var(--neon-red);">⚠️ ${UI.menu.resetAll}</h2>
        <p style="color:var(--text-secondary);font-size:1rem;line-height:1.6;">
          ${UI.menu.resetConfirm}
        </p>
        <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
          <button class="btn" id="btn-reset-cancel" style="border-color:var(--text-secondary);color:var(--text-secondary);">
            ${UI.misc.no}, ${UI.collection.back}
          </button>
          <button class="btn" id="btn-reset-confirm" style="border-color:var(--neon-red);color:var(--neon-red);
            box-shadow:0 0 10px rgba(255,0,64,0.3);">
            ${UI.misc.yes}, ${UI.menu.resetAll}
          </button>
        </div>
      </div>
    `;

    this.game.overlay.appendChild(overlay);

    overlay.querySelector('#btn-reset-cancel').addEventListener('click', () => {
      audioManager.play('click');
      overlay.remove();
    });

    overlay.querySelector('#btn-reset-confirm').addEventListener('click', () => {
      audioManager.play('wrong');
      gameState.fullReset();
      overlay.remove();

      // רענן את מסך התפריט
      this.game.switchScene('menu');
    });
  }

  _showLeaderboard() {
    const overlay = document.createElement('div');
    overlay.className = 'scene active';
    overlay.style.background = 'var(--overlay-bg)';
    overlay.style.zIndex = '50';
    overlay.style.overflow = 'auto';

    overlay.innerHTML = `
      <div style="max-width:580px;width:92%;text-align:center;">
        <h2 style="color:var(--neon-gold);text-shadow:0 0 20px var(--neon-gold);">🏆 ${UI.leaderboard.title}</h2>

        <div class="leaderboard-tabs" style="display:flex;gap:8px;justify-content:center;margin-bottom:16px;">
          <button id="tab-local" class="btn btn-small tab-active" style="flex:1;max-width:200px;">
            ${UI.leaderboard.tabLocal}
          </button>
          <button id="tab-global" class="btn btn-small" style="flex:1;max-width:200px;opacity:0.7;border-color:var(--neon-gold);color:var(--neon-gold);">
            ${UI.leaderboard.tabGlobal}
          </button>
        </div>

        <div id="leaderboard-content"></div>

        <button class="btn btn-small mt-md" id="btn-back-leaderboard">${UI.collection.back}</button>
      </div>
    `;

    this.game.overlay.appendChild(overlay);

    const contentEl = overlay.querySelector('#leaderboard-content');
    const btnLocal = overlay.querySelector('#tab-local');
    const btnGlobal = overlay.querySelector('#tab-global');

    const renderTable = (entries) => {
      if (!entries || entries.length === 0) {
        return `<p style="color:var(--text-secondary);font-size:1.1rem;margin:40px 0;line-height:1.8;">${UI.leaderboard.noScores}</p>`;
      }
      let html = `<div class="leaderboard-table">
        <div class="leaderboard-header">
          <span>#</span>
          <span>${UI.leaderboard.player}</span>
          <span>${UI.leaderboard.score}</span>
          <span>${UI.leaderboard.level}</span>
          <span>${UI.leaderboard.date}</span>
        </div>`;
      entries.forEach((entry, i) => {
        const rank = i + 1;
        const rankClass = rank === 1 ? 'first' : rank === 2 ? 'second' : rank === 3 ? 'third' : '';
        const score = entry.score || 0;
        const name = entry.playerName || '—';
        const levelLabel = entry.difficultyLabel || (entry.difficulty
          ? (DIFFICULTY_LEVELS[entry.difficulty] ? DIFFICULTY_LEVELS[entry.difficulty].label : `${entry.difficulty}`)
          : '—');
        const date = entry.date || '—';
        html += `<div class="leaderboard-row ${rankClass}">
          <span class="leaderboard-rank ${rankClass}">${rank}</span>
          <span class="leaderboard-name">${name}</span>
          <span class="leaderboard-score">${score.toLocaleString()}</span>
          <span class="leaderboard-level">${levelLabel}</span>
          <span class="leaderboard-date">${date}</span>
        </div>`;
      });
      html += `</div>`;
      return html;
    };

    const showLocal = () => {
      btnLocal.style.opacity = '1';
      btnLocal.classList.add('tab-active');
      btnGlobal.style.opacity = '0.7';
      btnGlobal.classList.remove('tab-active');
      contentEl.innerHTML = renderTable(gameState.getLeaderboard());
    };

    const showGlobal = async () => {
      btnGlobal.style.opacity = '1';
      btnGlobal.classList.add('tab-active');
      btnLocal.style.opacity = '0.7';
      btnLocal.classList.remove('tab-active');

      if (!cloudLeaderboard.isConfigured()) {
        contentEl.innerHTML = `<p style="color:var(--text-secondary);font-size:1rem;margin:32px 0;line-height:1.8;">
          ${UI.leaderboard.globalNotConfigured}
        </p>`;
        return;
      }

      contentEl.innerHTML = `<p style="color:var(--text-secondary);font-size:1rem;margin:32px 0;">
        ${UI.leaderboard.globalLoading}
      </p>`;

      const scores = await cloudLeaderboard.getTopScores();
      // Guard: user may have closed the overlay while fetching scores from Firestore
      if (!overlay.isConnected) return;

      if (scores === null) {
        contentEl.innerHTML = `<p style="color:var(--neon-red);font-size:1rem;margin:32px 0;">
          ${UI.leaderboard.globalError}
        </p>`;
      } else {
        contentEl.innerHTML = renderTable(scores);
      }
    };

    btnLocal.addEventListener('click', () => { audioManager.play('click'); showLocal(); });
    btnGlobal.addEventListener('click', () => { audioManager.play('click'); showGlobal(); });

    overlay.querySelector('#btn-back-leaderboard').addEventListener('click', () => {
      audioManager.play('click');
      overlay.remove();
    });

    // Default: show local tab
    showLocal();
  }

  _showCollection() {
    const state = gameState.getState();
    const collected = state.aliensCollected || [];

    import('../data/alienCollection.js').then(({ default: ALIENS }) => {
      const overlay = document.createElement('div');
      overlay.className = 'scene active';
      overlay.style.background = 'var(--overlay-bg)';
      overlay.style.zIndex = '50';
      overlay.style.overflow = 'auto';

      let html = `<div style="max-width:500px;width:90%;text-align:center;">
        <h2>${UI.collection.title}</h2>
        <p class="game-subtitle">${UI.collection.collected} ${collected.length} ${UI.collection.of} ${ALIENS.length}</p>
        <div class="collection-grid">`;

      for (const alien of ALIENS) {
        const unlocked = collected.includes(alien.id);
        html += `<div class="collection-item ${unlocked ? '' : 'locked'}">
          <div style="width:40px;height:40px;border-radius:50%;background:${unlocked ? alien.color : '#333'};
            box-shadow:${unlocked ? `0 0 10px ${alien.color}` : 'none'};margin:0 auto;"></div>
          <div class="collection-name">${unlocked ? alien.name : '🔒'}</div>
        </div>`;
      }

      html += `</div>
        <button class="btn btn-small mt-md" id="btn-back-collection">${UI.collection.back}</button>
      </div>`;

      overlay.innerHTML = html;
      this.game.overlay.appendChild(overlay);

      overlay.querySelector('#btn-back-collection').addEventListener('click', () => {
        audioManager.play('click');
        overlay.remove();
      });
    });
  }

  update(dt) {
    this.starField.update(dt);
    this.shipTime += dt;
  }

  render(ctx, w, h) {
    this.starField.render(ctx);

    // Draw decorative spaceship
    const sx = w * 0.5;
    const sy = h * 0.35 + Math.sin(this.shipTime * 1.5) * 10;

    ctx.save();
    ctx.translate(sx, sy);

    // Ship body
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 20;
    ctx.fillStyle = '#00ffff';
    ctx.beginPath();
    ctx.moveTo(0, -25);
    ctx.lineTo(15, 15);
    ctx.lineTo(5, 10);
    ctx.lineTo(5, 25);
    ctx.lineTo(-5, 25);
    ctx.lineTo(-5, 10);
    ctx.lineTo(-15, 15);
    ctx.closePath();
    ctx.fill();

    // Engine glow
    const flicker = 0.7 + Math.random() * 0.3;
    ctx.shadowColor = '#ff6600';
    ctx.shadowBlur = 15 * flicker;
    ctx.fillStyle = `rgba(255, 102, 0, ${0.6 * flicker})`;
    ctx.beginPath();
    ctx.moveTo(-4, 25);
    ctx.lineTo(4, 25);
    ctx.lineTo(0, 25 + 15 * flicker);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  exit() {
    this.game.removeSceneUI(this.ui);
    this.ui = null;
  }

  onResize(w, h) {
    this.starField.resize(w, h);
  }
}
