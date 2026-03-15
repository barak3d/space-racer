// ResultsScene.js — מסך תוצאות + תגמולים

import UI from '../data/uiStrings.js';
import { COLORS } from '../config.js';
import { default as gameState } from '../systems/GameState.js';
import audioManager from '../systems/AudioManager.js';
import ALIENS, { checkAlienUnlock } from '../data/alienCollection.js';
import Alien from '../entities/Alien.js';
import StarField from '../entities/StarField.js';

export default class ResultsScene {
  constructor(game) {
    this.game = game;
    this.ui = null;
    this.starField = new StarField(800, 600);
    this.data = {};
    this.confettiPieces = [];
    this.newAliens = [];
  }

  enter(data = {}) {
    this.data = data;
    this.starField.resize(this.game.width, this.game.height);

    // Check for newly unlocked aliens
    this._checkNewAliens();

    // Play appropriate sound
    const position = data.position || 1;
    if (position === 1) {
      audioManager.play('victory');
      this._createConfetti();
    }

    this._createUI(position);
  }

  _checkNewAliens() {
    this.newAliens = [];
    const state = gameState.getState();
    const collected = state.aliensCollected || [];

    for (const alienData of ALIENS) {
      if (!collected.includes(alienData.id) && checkAlienUnlock(alienData, state)) {
        this.newAliens.push(alienData);
        gameState.addAlien(alienData.id);
      }
    }
  }

  _createConfetti() {
    const colors = [COLORS.cyan, COLORS.magenta, COLORS.green, COLORS.gold, '#ff69b4', '#ffffff'];
    for (let i = 0; i < 50; i++) {
      this.confettiPieces.push({
        x: Math.random() * this.game.width,
        y: -20 - Math.random() * 200,
        size: 4 + Math.random() * 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        speed: 80 + Math.random() * 150,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 400,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 2 + Math.random() * 3,
      });
    }
  }

  _createUI(position) {
    this.ui = this.game.createSceneUI();
    this.ui.classList.add('scene-scrollable');

    const container = document.createElement('div');
    container.className = 'results-container fade-in-up';

    // Title
    const title = document.createElement('h2');
    title.textContent = UI.results.title;
    container.appendChild(title);

    // Position display
    const placeDiv = document.createElement('div');
    placeDiv.className = `results-place ${position === 1 ? 'first' : position === 2 ? 'second' : 'third'}`;
    const placeTexts = { 1: '🏆', 2: '🥈', 3: '🥉' };
    placeDiv.textContent = placeTexts[position] || '🏆';
    container.appendChild(placeDiv);

    const placeLabel = document.createElement('div');
    placeLabel.className = 'game-subtitle';
    const placeNames = { 1: UI.results.first, 2: UI.results.second, 3: UI.results.third };
    placeLabel.textContent = `${UI.results.yourPlace} ${placeNames[position] || placeNames[1]}`;
    container.appendChild(placeLabel);

    // Stats grid
    const state = gameState.getState();
    const stats = document.createElement('div');
    stats.className = 'results-stats stagger';

    const accuracy = gameState.getAccuracy();
    const avgTime = gameState.getAverageTime();
    const longestStreak = gameState.getLongestStreak();

    this._addStat(stats, state.score || this.data.finalScore || 0, UI.results.score);
    this._addStat(stats, `${Math.round(accuracy)}%`, UI.results.accuracy);
    this._addStat(stats, `${(avgTime / 1000).toFixed(1)}s`, UI.results.avgTime);
    this._addStat(stats, longestStreak, UI.results.longestStreak);
    container.appendChild(stats);

    // Leaderboard
    if (data.competitors && data.competitors.length > 0) {
      const leaderboard = document.createElement('div');
      leaderboard.className = 'results-leaderboard fade-in-up';

      const lbTitle = document.createElement('h3');
      lbTitle.textContent = UI.results.leaderboard;
      leaderboard.appendChild(lbTitle);

      const playerScore = state.score || data.finalScore || 0;
      const entries = [
        { name: state.playerName || 'שַׂחְקָן', score: playerScore, isPlayer: true },
        ...data.competitors.map(c => ({ name: c.name, score: c.score, isPlayer: false })),
      ].sort((a, b) => b.score - a.score);

      const medals = ['🏆', '🥈', '🥉'];
      entries.forEach((entry, i) => {
        const row = document.createElement('div');
        row.className = `leaderboard-row${entry.isPlayer ? ' leaderboard-player' : ''}`;
        row.innerHTML = `<span class="leaderboard-medal">${medals[i] || ''}</span>`
          + `<span class="leaderboard-name">${entry.name}</span>`
          + `<span class="leaderboard-score">${entry.score}</span>`;
        leaderboard.appendChild(row);
      });

      container.appendChild(leaderboard);
    }

    // New aliens
    if (this.newAliens.length > 0) {
      const aliensSection = document.createElement('div');
      aliensSection.className = 'new-aliens-section';

      const aliensTitle = document.createElement('h3');
      aliensTitle.textContent = UI.results.newAliens;
      aliensSection.appendChild(aliensTitle);

      for (const alienData of this.newAliens) {
        const alienCard = document.createElement('div');
        alienCard.className = 'new-alien-card alien-bounce';

        const canvas = Alien.createCanvas(alienData, 70);
        canvas.className = 'new-alien-canvas';
        alienCard.appendChild(canvas);

        const name = document.createElement('div');
        name.className = 'new-alien-name';
        name.style.color = alienData.color;
        name.textContent = alienData.name;
        alienCard.appendChild(name);

        const desc = document.createElement('div');
        desc.className = 'new-alien-desc';
        desc.textContent = alienData.description;
        alienCard.appendChild(desc);

        aliensSection.appendChild(alienCard);
      }
      container.appendChild(aliensSection);
    } else {
      const noAliens = document.createElement('p');
      noAliens.className = 'results-no-aliens';
      noAliens.textContent = UI.results.noNewAliens;
      container.appendChild(noAliens);
    }

    // Encouragement
    const encouragement = document.createElement('p');
    encouragement.className = 'results-encouragement';
    encouragement.textContent = position === 1 ? UI.results.greatJob : UI.results.tryHarder;
    container.appendChild(encouragement);

    // Buttons
    const buttonsDiv = document.createElement('div');
    buttonsDiv.className = 'results-buttons';

    const playAgainBtn = document.createElement('button');
    playAgainBtn.className = 'btn btn-big';
    playAgainBtn.textContent = UI.results.playAgain;
    playAgainBtn.addEventListener('click', () => {
      audioManager.play('click');
      gameState.reset();
      this.game.switchScene('setup');
    });
    buttonsDiv.appendChild(playAgainBtn);

    const menuBtn = document.createElement('button');
    menuBtn.className = 'btn btn-gold';
    menuBtn.textContent = UI.results.backToMenu;
    menuBtn.addEventListener('click', () => {
      audioManager.play('click');
      gameState.reset();
      this.game.switchScene('menu');
    });
    buttonsDiv.appendChild(menuBtn);

    container.appendChild(buttonsDiv);
    this.ui.appendChild(container);
  }

  _addStat(parent, value, label) {
    const card = document.createElement('div');
    card.className = 'stat-card fade-in-up';

    const valDiv = document.createElement('div');
    valDiv.className = 'stat-value';
    valDiv.textContent = value;
    card.appendChild(valDiv);

    const labelDiv = document.createElement('div');
    labelDiv.className = 'stat-label';
    labelDiv.textContent = label;
    card.appendChild(labelDiv);

    parent.appendChild(card);
  }

  update(dt) {
    this.starField.update(dt * 0.3);

    // Update confetti
    for (let i = this.confettiPieces.length - 1; i >= 0; i--) {
      const p = this.confettiPieces[i];
      p.y += p.speed * dt;
      p.x += Math.sin(p.wobble) * 30 * dt;
      p.wobble += p.wobbleSpeed * dt;
      p.rotation += p.rotationSpeed * dt;

      if (p.y > this.game.height + 20) {
        this.confettiPieces.splice(i, 1);
      }
    }
  }

  render(ctx, w, h) {
    this.starField.render(ctx);

    // Draw confetti
    for (const p of this.confettiPieces) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 5;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx.restore();
    }
  }

  exit() {
    this.game.removeSceneUI(this.ui);
    this.ui = null;
    this.confettiPieces = [];
    this.newAliens = [];
  }

  onResize(w, h) {
    this.starField.resize(w, h);
  }
}
