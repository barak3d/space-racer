// PuzzleScene.js — מסך חידה

import UI from '../data/uiStrings.js';
import { PUZZLE_TYPES } from '../config.js';
import gameState from '../systems/GameState.js';
import { generatePuzzle } from '../systems/PuzzleGenerator.js';
import { calculateScore, getMaxScoreForPuzzle, getMedal } from '../systems/ScoreSystem.js';
import TimerSystem from '../systems/TimerSystem.js';
import audioManager from '../systems/AudioManager.js';
import { createStartOverButton } from '../ui/startOverHelper.js';

export default class PuzzleScene {
  constructor(game) {
    this.game = game;
    this.ui = null;
    this.timer = new TimerSystem();
    this.puzzle = null;
    this.answered = false;
    this.station = 1;
    this.puzzlesLeft = 3;
    this.startTime = 0;
  }

  enter(data = {}) {
    const state = gameState.getState();
    const level = state.difficultyLevel || 1;
    const puzzleType = data.puzzleType || 'addition';
    this.station = data.station || state.currentStation || 1;
    this.puzzlesLeft = data.puzzlesLeft || 3;
    this.answered = false;

    // Generate puzzle
    this.puzzle = generatePuzzle(puzzleType, level, this.station);
    if (!this.puzzle) {
      // Fallback to addition if type not available
      this.puzzle = generatePuzzle('addition', level, this.station);
    }

    const pt = PUZZLE_TYPES[puzzleType] || PUZZLE_TYPES.addition;

    this.ui = this.game.createSceneUI();

    // Build puzzle UI
    this.ui.innerHTML = `
      <div class="puzzle-card fade-in-up">
        <div class="puzzle-type-badge">
          <span>${pt.icon}</span>
          <span>${pt.name}</span>
        </div>

        <div id="timer-mount"></div>

        <div class="puzzle-question" dir="rtl">${this._formatQuestion(this.puzzle.question)}</div>

        <div class="answer-grid" id="answers">
          ${this.puzzle.options.map((opt, i) => `
            <button class="answer-btn" data-index="${i}">
              ${this._formatOption(opt)}
            </button>
          `).join('')}
        </div>

        <div id="feedback" class="mt-md text-center" style="min-height:2em;"></div>
      </div>
    `;

    // Mount timer
    const timerMount = this.ui.querySelector('#timer-mount');
    const timerEl = this.timer.createTimerElement();
    timerMount.appendChild(timerEl);

    // Start timer
    this.startTime = performance.now();
    this.timer.start(
      this.puzzle.timeLimit,
      () => this._onTimeout(),
      (sec) => { if (sec <= 5) audioManager.play('tick'); }
    );

    // Bind answers
    const answerBtns = this.ui.querySelectorAll('.answer-btn');
    answerBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        if (this.answered) return;
        const index = parseInt(btn.dataset.index);
        this._onAnswer(index);
      });
    });

    // Start-over button (top-left corner)
    const startOverBtn = createStartOverButton(this.game);
    startOverBtn.classList.add('start-over-corner');
    this.ui.appendChild(startOverBtn);
  }

  _formatOption(opt) {
    // Math expression options (e.g. "8 + 3") must render left-to-right
    if (typeof opt === 'string' && /\d[\s]*[\+\-×][\s]*\d/.test(opt)) {
      return `<span dir="ltr" style="unicode-bidi:bidi-override;">${opt}</span>`;
    }
    return opt;
  }

  _formatQuestion(question) {
    // Split multi-line questions (e.g., comparison: "מי גדול יותר?\n5 + 3  אוֹ  9 - 2")
    const lines = question.split('\n');
    return lines.map(line => {
      // Comparison lines: math expressions separated by Hebrew "אוֹ" (or)
      // Wrap each math expression in LTR individually, keep "אוֹ" as RTL
      if (/[\u0590-\u05FF]/.test(line) && /\d[\s]*[\+\-×]/.test(line)) {
        return line.replace(/(\d[\d\s\+\-×=]*\d)/g,
          '<span dir="ltr" style="unicode-bidi:bidi-override;display:inline-block;">$1</span>');
      }
      // Pure math expression or number sequence — force entire line LTR
      if (/[\d].*[\+\-×=]/.test(line) || /\d+\s*,\s*\d+/.test(line)) {
        return `<span dir="ltr" style="unicode-bidi:bidi-override;display:inline-block;">${line}</span>`;
      }
      // If line has numbers mixed with Hebrew, wrap numbers individually
      if (/\d/.test(line)) {
        return line.replace(/(\d+)/g, '<span class="number">$1</span>');
      }
      return line;
    }).join('<br>');
  }

  _onAnswer(selectedIndex) {
    if (this.answered) return;
    this.answered = true;
    this.timer.stop();

    const timeMs = performance.now() - this.startTime;
    const isCorrect = selectedIndex === this.puzzle.correctIndex;

    // Highlight buttons
    const buttons = this.ui.querySelectorAll('.answer-btn');
    buttons.forEach((btn, i) => {
      btn.disabled = true;
      if (i === this.puzzle.correctIndex) {
        btn.classList.add('correct');
      }
      if (i === selectedIndex && !isCorrect) {
        btn.classList.add('wrong');
        btn.classList.add('wrong-shake');
      }
    });

    // Feedback
    const feedback = this.ui.querySelector('#feedback');
    if (isCorrect) {
      feedback.innerHTML = `<span class="feedback-correct">${UI.puzzle.correct}</span>`;
      audioManager.play('correct');

      // Calculate score
      const score = calculateScore(this.timer.getTimeLeft(), this.puzzle.timeLimit, this.puzzle.difficulty, this.puzzle.type);
      const maxScore = getMaxScoreForPuzzle(this.puzzle.timeLimit, this.puzzle.difficulty, this.puzzle.type);
      const medal = getMedal(score, maxScore);

      gameState.addScore(score);
      if (medal) gameState.addMedal(medal);

      // Show boost animation
      const boostEl = document.createElement('div');
      boostEl.className = 'boost-popup boost-flash';
      boostEl.textContent = `+${score} ${UI.race.boost}`;
      boostEl.style.top = '30%';
      boostEl.style.left = '50%';
      boostEl.style.transform = 'translate(-50%, -50%)';
      this.ui.appendChild(boostEl);
    } else {
      feedback.innerHTML = `<span class="feedback-wrong">${UI.puzzle.wrong}</span>`;
      audioManager.play('wrong');
    }

    // Record puzzle
    gameState.recordPuzzle({
      type: this.puzzle.type,
      correct: isCorrect,
      timeMs: Math.round(timeMs),
    });

    // Move on after delay
    setTimeout(() => this._proceed(isCorrect), 1500);
  }

  _onTimeout() {
    if (this.answered) return;
    this.answered = true;

    const buttons = this.ui.querySelectorAll('.answer-btn');
    buttons.forEach((btn, i) => {
      btn.disabled = true;
      if (i === this.puzzle.correctIndex) {
        btn.classList.add('correct');
      }
    });

    const feedback = this.ui.querySelector('#feedback');
    feedback.innerHTML = `<span class="feedback-timeout">${UI.puzzle.timeout}</span>`;
    audioManager.play('wrong');

    gameState.recordPuzzle({
      type: this.puzzle.type,
      correct: false,
      timeMs: this.puzzle.timeLimit * 1000,
    });

    setTimeout(() => this._proceed(false), 1500);
  }

  _proceed(wasCorrect) {
    if (!this.ui) return; // guard: start-over may have fired during answer-feedback delay
    const newPuzzlesLeft = this.puzzlesLeft - 1;

    if (newPuzzlesLeft <= 0) {
      // Station complete — back to race
      this.game.switchScene('race', {
        fromStation: true,
        stationComplete: true,
        station: this.station,
        wasCorrect,
      });
    } else {
      // More puzzles at this station
      this.game.switchScene('station', {
        station: this.station,
        puzzlesLeft: newPuzzlesLeft,
      });
    }
  }

  update(dt) {
    if (!this.answered) {
      this.timer.update(dt);
      this.timer.updateTimerElement();
    }
  }

  render(ctx, w, h) {}

  exit() {
    this.timer.stop();
    this.game.removeSceneUI(this.ui);
    this.ui = null;
  }
}
