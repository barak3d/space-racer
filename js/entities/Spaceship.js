// Spaceship.js — ציור חללית (Canvas) + אנימציות

export default class Spaceship {
  constructor(name, color, x, y) {
    this.name = name;
    this.color = color;
    this.x = x;
    this.y = y;
    this.targetX = x;
    this.targetY = y;
    this.time = Math.random() * Math.PI * 2;
    this.boosting = false;
    this.boostTime = 0;
    this.trail = [];
    this.trailMaxLength = 15;
    this.speed = 1;
    this.hoverAmplitude = 4;
    this.size = 20;
  }

  update(dt) {
    this.time += dt * 3;

    // Smooth movement toward target
    const followSpeed = 1 - Math.exp(-8 * dt);
    this.x += (this.targetX - this.x) * followSpeed;
    this.y += (this.targetY - this.y) * followSpeed;

    // Hover effect
    const hoverY = Math.sin(this.time) * this.hoverAmplitude;

    // Trail
    this.trail.push({ x: this.x, y: this.y + hoverY + this.size });
    if (this.trail.length > this.trailMaxLength) {
      this.trail.shift();
    }

    // Boost timer
    if (this.boosting) {
      this.boostTime += dt;
      if (this.boostTime > 2) {
        this.boosting = false;
        this.boostTime = 0;
      }
    }
  }

  setBoost(active) {
    if (this.boosting === active) return;
    this.boosting = active;
    this.boostTime = 0;
  }

  setPosition(x, y) {
    this.targetX = x;
    this.targetY = y;
  }

  setPositionImmediate(x, y) {
    this.x = x;
    this.y = y;
    this.targetX = x;
    this.targetY = y;
  }

  getPosition() {
    return { x: this.x, y: this.y };
  }

  draw(ctx) {
    const hover = Math.sin(this.time) * this.hoverAmplitude;
    const dx = this.x;
    const dy = this.y + hover;

    // Draw trail
    this._drawTrail(ctx);

    ctx.save();
    ctx.translate(dx, dy);

    // Ship body glow
    ctx.shadowColor = this.color;
    ctx.shadowBlur = this.boosting ? 30 : 15;

    // Ship body (pointing right →)
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.moveTo(this.size, 0);             // Nose (right)
    ctx.lineTo(-this.size * 0.7, -this.size * 0.6); // Top-left
    ctx.lineTo(-this.size * 0.3, 0);               // Indent
    ctx.lineTo(-this.size * 0.7, this.size * 0.6);  // Bottom-left
    ctx.closePath();
    ctx.fill();

    // Cockpit
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.beginPath();
    ctx.ellipse(this.size * 0.2, 0, this.size * 0.25, this.size * 0.15, 0, 0, Math.PI * 2);
    ctx.fill();

    // Engine flame
    ctx.shadowBlur = 0;
    const flameLen = this.boosting
      ? this.size * (0.8 + Math.random() * 0.6)
      : this.size * (0.3 + Math.random() * 0.2);

    const gradient = ctx.createLinearGradient(-this.size * 0.3, 0, -this.size * 0.3 - flameLen, 0);
    gradient.addColorStop(0, 'rgba(255, 200, 50, 0.9)');
    gradient.addColorStop(0.4, 'rgba(255, 100, 0, 0.6)');
    gradient.addColorStop(1, 'rgba(255, 50, 0, 0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(-this.size * 0.3, -this.size * 0.2);
    ctx.lineTo(-this.size * 0.3 - flameLen, 0);
    ctx.lineTo(-this.size * 0.3, this.size * 0.2);
    ctx.closePath();
    ctx.fill();

    ctx.restore();

    // Name label
    ctx.save();
    ctx.fillStyle = this.color;
    ctx.font = "bold 11px 'Noto Sans Hebrew', sans-serif";
    ctx.textAlign = 'center';
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 8;
    ctx.fillText(this.name, dx, dy - this.size - 8);
    ctx.restore();
  }

  _drawTrail(ctx) {
    if (this.trail.length < 2) return;

    for (let i = 1; i < this.trail.length; i++) {
      const alpha = (i / this.trail.length) * 0.4;
      const width = (i / this.trail.length) * 3;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = this.color;
      ctx.lineWidth = width;
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 5;
      ctx.beginPath();
      ctx.moveTo(this.trail[i - 1].x, this.trail[i - 1].y);
      ctx.lineTo(this.trail[i].x, this.trail[i].y);
      ctx.stroke();
      ctx.restore();
    }
  }
}
