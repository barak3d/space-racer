// MenuScene.js — מסך פתיחה

import UI from '../data/uiStrings.js';
import StarField from '../entities/StarField.js';
import audioManager from '../systems/AudioManager.js';
import gameState from '../systems/GameState.js';
import { GAME_SETTINGS, DIFFICULTY_LEVELS, STATION_THEMES } from '../config.js';
import cloudLeaderboard from '../systems/CloudLeaderboard.js';
import Alien from '../entities/Alien.js';
import alienEffects from '../systems/AlienEffects.js';

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
        <div class="game-title title-glow menu-title-spacer">
          ${UI.gameName}
        </div>
        <div class="game-subtitle">🚀 ⭐ 🛸</div>

        ${hasSavedGame ? `
          <div class="flex-col gap-md w-full menu-actions-container">
            <button class="btn btn-big pulse" id="btn-continue">
              ${UI.menu.continueRace} ▶
            </button>
            <div class="saved-game-info">
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

        <div class="flex-col gap-sm menu-secondary-buttons">
          <button class="btn btn-gold btn-small" id="btn-collection">
            ${UI.menu.myCollection}
          </button>
          <button class="btn btn-small menu-leaderboard-btn" id="btn-leaderboard">
            🏆 ${UI.leaderboard.button}
          </button>
          <button class="btn btn-small menu-reset-btn" id="btn-reset">
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

    // Preload all station music files for seamless transitions
    const musicFiles = STATION_THEMES.map(t => t.musicFile).filter(Boolean);
    audioManager.preloadMusic(musicFiles);

    audioManager.startBgMusic(STATION_THEMES[0]?.musicFile);
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
    overlay.className = 'scene active leaderboard-overlay';

    overlay.innerHTML = `
      <div class="leaderboard-container">
        <h2 class="leaderboard-title">🏆 ${UI.leaderboard.title}</h2>

        <div class="leaderboard-tabs">
          <button id="tab-local" class="btn btn-small tab-active">
            ${UI.leaderboard.tabLocal}
          </button>
          <button id="tab-global" class="btn btn-small" style="opacity:0.7;border-color:var(--neon-gold);color:var(--neon-gold);">
            ${UI.leaderboard.tabGlobal}
          </button>
        </div>

        <div class="grade-tabs">
          <button class="btn btn-tiny grade-tab tab-active" data-grade="all">
            ${UI.leaderboard.gradeAll}
          </button>
          <button class="btn btn-tiny grade-tab" data-grade="1" style="opacity:0.6;">
            ${DIFFICULTY_LEVELS[1].label}
          </button>
          <button class="btn btn-tiny grade-tab" data-grade="2" style="opacity:0.6;">
            ${DIFFICULTY_LEVELS[2].label}
          </button>
          <button class="btn btn-tiny grade-tab" data-grade="3" style="opacity:0.6;">
            ${DIFFICULTY_LEVELS[3].label}
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

    let currentTab = 'local';   // 'local' or 'global'
    const userGrade = gameState.state.difficultyLevel || null;
    let currentGrade = userGrade;     // null = all, 1/2/3

    // Pre-select the user's grade tab
    if (userGrade) {
      overlay.querySelectorAll('.grade-tab').forEach(b => {
        const isMatch = Number(b.dataset.grade) === userGrade;
        b.style.opacity = isMatch ? '1' : '0.6';
        b.classList.toggle('tab-active', isMatch);
      });
    }

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

    const refreshContent = () => {
      if (currentTab === 'local') showLocal();
      else showGlobal();
    };

    const showLocal = () => {
      currentTab = 'local';
      btnLocal.style.opacity = '1';
      btnLocal.classList.add('tab-active');
      btnGlobal.style.opacity = '0.7';
      btnGlobal.classList.remove('tab-active');
      contentEl.innerHTML = renderTable(gameState.getLeaderboard(currentGrade));
    };

    const showGlobal = async () => {
      currentTab = 'global';
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

      const scores = await cloudLeaderboard.getTopScores(20, currentGrade);
      // Guard: user may have closed the overlay while fetching scores from Firestore
      if (!overlay.isConnected) return;

      if (scores === null || scores.length === 0) {
        contentEl.innerHTML = renderTable([]);
      } else {
        contentEl.innerHTML = renderTable(scores);
      }
    };

    // Grade tab click handlers
    overlay.querySelectorAll('.grade-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        audioManager.play('click');
        const grade = btn.dataset.grade;
        currentGrade = grade === 'all' ? null : Number(grade);
        // Update grade tab styles
        overlay.querySelectorAll('.grade-tab').forEach(b => {
          b.style.opacity = b === btn ? '1' : '0.6';
          b.classList.toggle('tab-active', b === btn);
        });
        refreshContent();
      });
    });

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
    const playerName = state.playerName || '';
    const COLLECTION_CANVAS_SIZE = 56;

    import('../data/alienCollection.js').then(({ default: ALIENS }) => {
      const overlay = document.createElement('div');
      overlay.className = 'scene active';
      overlay.style.background = 'var(--overlay-bg)';
      overlay.style.zIndex = '50';
      overlay.style.overflow = 'auto';

      const wrapper = document.createElement('div');
      wrapper.style.cssText = 'max-width:500px;width:90%;text-align:center;';

      const title = document.createElement('h2');
      title.textContent = playerName
        ? `${UI.collection.title} — ${playerName}`
        : UI.collection.title;
      wrapper.appendChild(title);

      const subtitle = document.createElement('p');
      subtitle.className = 'game-subtitle';
      subtitle.textContent = `${UI.collection.collected} ${collected.length} ${UI.collection.of} ${ALIENS.length}`;
      wrapper.appendChild(subtitle);

      const grid = document.createElement('div');
      grid.className = 'collection-grid';

      for (const alien of ALIENS) {
        const unlocked = collected.includes(alien.id);
        const item = document.createElement('div');
        item.className = `collection-item${unlocked ? '' : ' locked'}`;

        if (unlocked) {
          item.addEventListener('click', () => {
            audioManager.play('click');
            alienEffects.trigger(alien.id, alien.color, item);
          });
        }

        const canvasWrapper = document.createElement('div');
        canvasWrapper.className = 'collection-canvas-wrapper';
        const canvas = Alien.createCanvas(alien, COLLECTION_CANVAS_SIZE);
        canvas.className = 'collection-alien-canvas';
        canvasWrapper.appendChild(canvas);
        if (!unlocked) {
          const lockBadge = document.createElement('div');
          lockBadge.className = 'collection-lock-badge';
          lockBadge.textContent = '🔒';
          canvasWrapper.appendChild(lockBadge);
        }
        item.appendChild(canvasWrapper);

        const nameEl = document.createElement('div');
        nameEl.className = 'collection-name';
        nameEl.textContent = alien.name;
        item.appendChild(nameEl);

        grid.appendChild(item);
      }

      wrapper.appendChild(grid);

      const backBtn = document.createElement('button');
      backBtn.className = 'btn btn-small mt-md';
      backBtn.textContent = UI.collection.back;
      backBtn.addEventListener('click', () => {
        audioManager.play('click');
        overlay.remove();
      });
      wrapper.appendChild(backBtn);

      overlay.appendChild(wrapper);
      this.game.overlay.appendChild(overlay);
    });
  }

  update(dt) {
    this.starField.update(dt);
    this.shipTime += dt;
  }

  render(ctx, w, h) {
    this.starField.render(ctx);

    // Draw decorative spaceship (game-style)
    const sx = w * 0.5;
    const sy = h * 0.35 + Math.sin(this.shipTime * 1.5) * 10;
    const s = 25;
    const color = '#00ffff';
    const rgb = { r: 0, g: 255, b: 255 };
    const mid = { r: 0, g: 179, b: 179 };
    const dark = { r: 0, g: 115, b: 115 };

    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(-Math.PI / 2); // Point upward

    // ── Engine flames (behind body) ──
    ctx.shadowBlur = 0;
    const flicker = Math.sin(this.shipTime * 12) * s * 0.08
                  + Math.sin(this.shipTime * 17) * s * 0.05;
    const flameLen = s * 0.4 + flicker + Math.random() * s * 0.15;
    const ex = -s * 0.55;

    const outerGrad = ctx.createLinearGradient(ex, 0, ex - flameLen, 0);
    outerGrad.addColorStop(0, 'rgba(255, 120, 20, 0.8)');
    outerGrad.addColorStop(0.5, 'rgba(255, 60, 10, 0.4)');
    outerGrad.addColorStop(1, 'rgba(255, 30, 0, 0)');
    ctx.fillStyle = outerGrad;
    ctx.beginPath();
    ctx.moveTo(ex, -s * 0.18);
    ctx.quadraticCurveTo(ex - flameLen * 0.6, -s * 0.06, ex - flameLen, 0);
    ctx.quadraticCurveTo(ex - flameLen * 0.6, s * 0.06, ex, s * 0.18);
    ctx.closePath();
    ctx.fill();

    const innerLen = flameLen * 0.55;
    const innerGrad = ctx.createLinearGradient(ex, 0, ex - innerLen, 0);
    innerGrad.addColorStop(0, 'rgba(255, 255, 220, 0.95)');
    innerGrad.addColorStop(0.4, 'rgba(255, 220, 80, 0.6)');
    innerGrad.addColorStop(1, 'rgba(255, 160, 30, 0)');
    ctx.fillStyle = innerGrad;
    ctx.beginPath();
    ctx.moveTo(ex, -s * 0.09);
    ctx.quadraticCurveTo(ex - innerLen * 0.5, -s * 0.02, ex - innerLen, 0);
    ctx.quadraticCurveTo(ex - innerLen * 0.5, s * 0.02, ex, s * 0.09);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = `rgba(${dark.r},${dark.g},${dark.b},0.9)`;
    ctx.fillRect(ex - 1, -s * 0.2, 3, s * 0.4);

    // ── Wings ──
    ctx.shadowColor = color;
    ctx.shadowBlur = 6;

    const wingGrad = ctx.createLinearGradient(0, -s * 0.3, 0, -s * 0.9);
    wingGrad.addColorStop(0, `rgba(${rgb.r},${rgb.g},${rgb.b},0.9)`);
    wingGrad.addColorStop(1, `rgba(${dark.r},${dark.g},${dark.b},0.7)`);
    ctx.fillStyle = wingGrad;
    ctx.beginPath();
    ctx.moveTo(s * 0.05, -s * 0.28);
    ctx.lineTo(-s * 0.2, -s * 0.75);
    ctx.lineTo(-s * 0.55, -s * 0.55);
    ctx.lineTo(-s * 0.45, -s * 0.22);
    ctx.closePath();
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.fillStyle = `rgba(255,255,255,${0.6 + Math.sin(this.shipTime * 2) * 0.3})`;
    ctx.beginPath();
    ctx.arc(-s * 0.2, -s * 0.73, 1.2, 0, Math.PI * 2);
    ctx.fill();

    const wingGrad2 = ctx.createLinearGradient(0, s * 0.3, 0, s * 0.9);
    wingGrad2.addColorStop(0, `rgba(${rgb.r},${rgb.g},${rgb.b},0.9)`);
    wingGrad2.addColorStop(1, `rgba(${dark.r},${dark.g},${dark.b},0.7)`);
    ctx.shadowBlur = 6;
    ctx.shadowColor = color;
    ctx.fillStyle = wingGrad2;
    ctx.beginPath();
    ctx.moveTo(s * 0.05, s * 0.28);
    ctx.lineTo(-s * 0.2, s * 0.75);
    ctx.lineTo(-s * 0.55, s * 0.55);
    ctx.lineTo(-s * 0.45, s * 0.22);
    ctx.closePath();
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.fillStyle = `rgba(255,255,255,${0.6 + Math.sin(this.shipTime * 2) * 0.3})`;
    ctx.beginPath();
    ctx.arc(-s * 0.2, s * 0.73, 1.2, 0, Math.PI * 2);
    ctx.fill();

    // ── Body (fuselage) ──
    ctx.shadowColor = color;
    ctx.shadowBlur = 12;

    const bodyGrad = ctx.createLinearGradient(0, -s * 0.35, 0, s * 0.35);
    bodyGrad.addColorStop(0, `rgba(${rgb.r},${rgb.g},${rgb.b},1)`);
    bodyGrad.addColorStop(0.45, `rgba(${mid.r},${mid.g},${mid.b},1)`);
    bodyGrad.addColorStop(1, `rgba(${dark.r},${dark.g},${dark.b},1)`);
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.moveTo(s * 1.1, 0);
    ctx.quadraticCurveTo(s * 0.6, -s * 0.28, -s * 0.15, -s * 0.32);
    ctx.lineTo(-s * 0.55, -s * 0.22);
    ctx.lineTo(-s * 0.55, s * 0.22);
    ctx.lineTo(-s * 0.15, s * 0.32);
    ctx.quadraticCurveTo(s * 0.6, s * 0.28, s * 1.1, 0);
    ctx.closePath();
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.moveTo(s * 1.05, 0);
    ctx.quadraticCurveTo(s * 0.55, -s * 0.25, -s * 0.1, -s * 0.3);
    ctx.stroke();

    // ── Cockpit ──
    const glassGrad = ctx.createRadialGradient(
      s * 0.4, -s * 0.04, 0,
      s * 0.35, 0, s * 0.22,
    );
    glassGrad.addColorStop(0, 'rgba(180, 220, 255, 0.7)');
    glassGrad.addColorStop(0.5, 'rgba(100, 180, 255, 0.35)');
    glassGrad.addColorStop(1, 'rgba(40, 80, 160, 0.2)');
    ctx.fillStyle = glassGrad;
    ctx.beginPath();
    ctx.ellipse(s * 0.35, 0, s * 0.2, s * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.beginPath();
    ctx.ellipse(s * 0.42, -s * 0.04, s * 0.07, s * 0.04, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // ── Racing stripe ──
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(s * 0.85, 0);
    ctx.lineTo(-s * 0.4, 0);
    ctx.stroke();

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
