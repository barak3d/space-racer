// main.js — אתחול וניהול סצנות

import { COLORS, GAME_SETTINGS } from './config.js';

class Game {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.overlay = null;
    this.currentScene = null;
    this.scenes = {};
    this.width = 0;
    this.height = 0;
    this.dpr = window.devicePixelRatio || 1;
    this.lastTime = 0;
    this.running = false;
    this._boundLoop = this._gameLoop.bind(this);
  }

  async init() {
    // Setup canvas
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.overlay = document.getElementById('ui-overlay');

    this._resize();
    window.addEventListener('resize', () => this._resize());
    window.addEventListener('orientationchange', () => {
      setTimeout(() => this._resize(), 100);
    });

    // Import scenes lazily
    const [
      { default: MenuScene },
      { default: SetupScene },
      { default: RaceScene },
      { default: StationScene },
      { default: PuzzleScene },
      { default: ResultsScene },
    ] = await Promise.all([
      import('./scenes/MenuScene.js'),
      import('./scenes/SetupScene.js'),
      import('./scenes/RaceScene.js'),
      import('./scenes/StationScene.js'),
      import('./scenes/PuzzleScene.js'),
      import('./scenes/ResultsScene.js'),
    ]);

    this.scenes = {
      menu: new MenuScene(this),
      setup: new SetupScene(this),
      race: new RaceScene(this),
      station: new StationScene(this),
      puzzle: new PuzzleScene(this),
      results: new ResultsScene(this),
    };

    // Start game loop
    this.running = true;
    this.lastTime = performance.now();
    requestAnimationFrame(this._boundLoop);

    // Start with menu
    this.switchScene('menu');
  }

  _resize() {
    this.dpr = window.devicePixelRatio || 1;
    const container = document.getElementById('game-container');
    this.width = container.clientWidth;
    this.height = container.clientHeight;

    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.canvas.style.width = this.width + 'px';
    this.canvas.style.height = this.height + 'px';

    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    if (this.currentScene && this.currentScene.onResize) {
      this.currentScene.onResize(this.width, this.height);
    }
  }

  _gameLoop(timestamp) {
    if (!this.running) return;

    const dt = Math.min((timestamp - this.lastTime) / 1000, 0.1); // cap delta
    this.lastTime = timestamp;

    // Clear canvas
    this.ctx.fillStyle = COLORS.background;
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Update and render current scene
    if (this.currentScene) {
      if (this.currentScene.update) {
        this.currentScene.update(dt);
      }
      if (this.currentScene.render) {
        this.currentScene.render(this.ctx, this.width, this.height);
      }
    }

    requestAnimationFrame(this._boundLoop);
  }

  switchScene(sceneName, data = {}) {
    const newScene = this.scenes[sceneName];
    if (!newScene) {
      console.error(`Scene "${sceneName}" not found`);
      return;
    }

    // Exit old scene
    if (this.currentScene) {
      if (this.currentScene.exit) {
        this.currentScene.exit();
      }
      // Remove old scene UI
      const oldUI = this.overlay.querySelector('.scene.active');
      if (oldUI) {
        oldUI.classList.remove('active');
        setTimeout(() => oldUI.remove(), 600);
      }
    }

    // Enter new scene
    this.currentScene = newScene;
    if (newScene.enter) {
      newScene.enter(data);
    }
  }

  // Helper to create a DOM scene container
  createSceneUI() {
    const div = document.createElement('div');
    div.className = 'scene';
    this.overlay.appendChild(div);
    // Trigger animation on next frame
    requestAnimationFrame(() => {
      div.classList.add('active');
    });
    return div;
  }

  // Remove scene UI container
  removeSceneUI(element) {
    if (element) {
      element.classList.remove('active');
      setTimeout(() => {
        if (element.parentNode) {
          element.parentNode.removeChild(element);
        }
      }, 600);
    }
  }
}

// Initialize when DOM is ready
const game = new Game();

document.addEventListener('DOMContentLoaded', () => {
  game.init().catch(err => {
    console.error('Game initialization failed:', err);
  });
});

export default game;
