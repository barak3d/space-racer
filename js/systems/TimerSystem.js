// TimerSystem.js — טיימר ויזואלי

export default class TimerSystem {
  constructor() {
    this.duration = 30;
    this.timeLeft = 30;
    this.running = false;
    this.paused = false;
    this.onTimeout = null;
    this._lastTickSecond = -1;
    this.onTick = null; // callback for tick sound in last 10 seconds
  }

  start(duration, onTimeout, onTick) {
    this.duration = duration;
    this.timeLeft = duration;
    this.running = true;
    this.paused = false;
    this.onTimeout = onTimeout;
    this.onTick = onTick;
    this._lastTickSecond = Math.ceil(duration);
  }

  stop() {
    this.running = false;
    this.paused = false;
  }

  pause() {
    this.paused = true;
  }

  resume() {
    this.paused = false;
  }

  update(dt) {
    if (!this.running || this.paused) return;

    this.timeLeft -= dt;

    // Tick sound in last 10 seconds
    const sec = Math.ceil(this.timeLeft);
    if (sec !== this._lastTickSecond && sec <= 10 && sec > 0) {
      this._lastTickSecond = sec;
      if (this.onTick) this.onTick(sec);
    }

    if (this.timeLeft <= 0) {
      this.timeLeft = 0;
      this.running = false;
      if (this.onTimeout) this.onTimeout();
    }
  }

  getTimeLeft() {
    return Math.max(0, this.timeLeft);
  }

  getProgress() {
    if (this.duration === 0) return 0;
    return Math.max(0, Math.min(1, this.timeLeft / this.duration));
  }

  isExpired() {
    return this.timeLeft <= 0;
  }

  getColor() {
    const progress = this.getProgress();
    if (progress > 0.5) return '#39ff14';     // Green
    if (progress > 0.25) return '#ffd700';    // Yellow/Gold
    return '#ff0040';                          // Red
  }

  // Render as SVG timer ring (returns HTML string for DOM insertion)
  createTimerElement() {
    const div = document.createElement('div');
    div.className = 'timer-container';
    div.innerHTML = `
      <svg class="timer-ring" width="80" height="80" viewBox="0 0 80 80">
        <circle class="timer-bg" cx="40" cy="40" r="35"/>
        <circle class="timer-fill" cx="40" cy="40" r="35"
          stroke-dasharray="${2 * Math.PI * 35}"
          stroke-dashoffset="0"/>
      </svg>
      <div class="timer-text">${Math.ceil(this.timeLeft)}</div>
    `;
    this._timerEl = div;
    return div;
  }

  // Update the DOM timer element
  updateTimerElement() {
    if (!this._timerEl) return;

    const circumference = 2 * Math.PI * 35;
    const progress = this.getProgress();
    const offset = circumference * (1 - progress);
    const color = this.getColor();
    const seconds = Math.ceil(this.timeLeft);

    const fill = this._timerEl.querySelector('.timer-fill');
    const text = this._timerEl.querySelector('.timer-text');

    if (fill) {
      fill.style.strokeDashoffset = offset;
      fill.style.stroke = color;
      fill.style.filter = `drop-shadow(0 0 6px ${color})`;

      // Add warning/danger classes
      fill.classList.remove('warning', 'danger');
      if (progress <= 0.25) fill.classList.add('danger');
      else if (progress <= 0.5) fill.classList.add('warning');
    }

    if (text) {
      text.textContent = seconds;
      text.style.color = color;
    }
  }

  // Render on Canvas (alternative)
  renderCanvas(ctx, x, y, radius) {
    const progress = this.getProgress();
    const color = this.getColor();
    const seconds = Math.ceil(this.timeLeft);

    // Background ring
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Progress arc
    const startAngle = -Math.PI / 2;
    const endAngle = startAngle + progress * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(x, y, radius, startAngle, endAngle);
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Time text
    ctx.fillStyle = color;
    ctx.font = `bold ${radius * 0.7}px 'Noto Sans Hebrew', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(seconds, x, y);
  }
}
