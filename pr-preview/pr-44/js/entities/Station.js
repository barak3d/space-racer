// Station.js — תחנת חלל (ציור + אנימציה)

export default class Station {
  constructor(index, x, y, themeColor = '#00ffff') {
    this.index = index; // 1-based station number
    this.x = x;
    this.y = y;
    this.themeColor = themeColor;
    this.active = false;
    this.completed = false;
    this.time = Math.random() * Math.PI * 2;
    this.radius = 22;
    this.lights = [];

    // Create blinking lights
    for (let i = 0; i < 6; i++) {
      this.lights.push({
        angle: (Math.PI * 2 * i) / 6,
        phase: Math.random() * Math.PI * 2,
        speed: 1 + Math.random() * 2,
      });
    }
  }

  update(dt) {
    this.time += dt * 2;
  }

  setActive(active) {
    this.active = active;
  }

  setCompleted(completed) {
    this.completed = completed;
  }

  /**
   * Parse a hex color to rgba string with given alpha.
   */
  _colorWithAlpha(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  draw(ctx) {
    ctx.save();

    const r = this.radius;
    const pulseR = this.active ? r + Math.sin(this.time * 3) * 4 : r;
    const tc = this.themeColor;

    // Outer glow for active
    if (this.active) {
      ctx.shadowColor = tc;
      ctx.shadowBlur = 30;
      ctx.fillStyle = this._colorWithAlpha(tc, 0.1);
      ctx.beginPath();
      ctx.arc(this.x, this.y, pulseR + 15, 0, Math.PI * 2);
      ctx.fill();
    }

    // Station body (hexagonal)
    const color = this.completed
      ? 'rgba(57, 255, 20, 0.3)'
      : this.active
        ? this._colorWithAlpha(tc, 0.3)
        : 'rgba(255, 255, 255, 0.1)';
    const borderColor = this.completed
      ? '#39ff14'
      : this.active
        ? tc
        : 'rgba(255, 255, 255, 0.3)';

    ctx.shadowColor = borderColor;
    ctx.shadowBlur = this.active ? 20 : 8;

    ctx.fillStyle = color;
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 2;

    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI * 2 * i) / 6 - Math.PI / 6;
      const px = this.x + Math.cos(angle) * pulseR;
      const py = this.y + Math.sin(angle) * pulseR;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Blinking lights
    ctx.shadowBlur = 0;
    for (const light of this.lights) {
      const brightness = 0.3 + 0.7 * Math.max(0, Math.sin(this.time * light.speed + light.phase));
      const lx = this.x + Math.cos(light.angle) * (pulseR - 4);
      const ly = this.y + Math.sin(light.angle) * (pulseR - 4);

      ctx.fillStyle = this.completed
        ? `rgba(57, 255, 20, ${brightness})`
        : this.active
          ? this._colorWithAlpha(tc, brightness)
          : `rgba(255, 255, 255, ${brightness * 0.4})`;
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(lx, ly, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Station number
    ctx.shadowBlur = 0;
    ctx.fillStyle = this.completed ? '#39ff14' : this.active ? tc : 'rgba(255, 255, 255, 0.6)';
    ctx.font = "bold 14px 'Noto Sans Hebrew', sans-serif";
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (this.completed) {
      ctx.fillText('✓', this.x, this.y);
    } else {
      ctx.fillText(this.index, this.x, this.y);
    }

    ctx.restore();
  }
}
