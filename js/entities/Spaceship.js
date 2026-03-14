// Spaceship.js — ציור חללית (Canvas) + אנימציות

// ── Color helpers ────────────────────────────────────────────
function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
  };
}

function rgba(r, g, b, a) {
  return `rgba(${r},${g},${b},${a})`;
}

function shadeColor({ r, g, b }, factor) {
  return {
    r: Math.min(255, Math.round(r * factor)),
    g: Math.min(255, Math.round(g * factor)),
    b: Math.min(255, Math.round(b * factor)),
  };
}

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
    this.trailMaxLength = 20;
    this.speed = 1;
    this.hoverAmplitude = 4;
    this.size = 20;

    // Pre-compute color palette from ship color
    const rgb = hexToRgb(this.color);
    this._rgb = rgb;
    this._dark = shadeColor(rgb, 0.45);
    this._mid = shadeColor(rgb, 0.7);
    this._bright = shadeColor(rgb, 1.3);

    // Particle pool for exhaust sparks
    this._sparks = [];
  }

  update(dt) {
    this.time += dt * 3;

    // Smooth movement toward target
    // Higher values make ships snap to their target position faster.
    const followRate = 8;
    const followSpeed = 1 - Math.exp(-followRate * dt);
    this.x += (this.targetX - this.x) * followSpeed;
    this.y += (this.targetY - this.y) * followSpeed;

    // Hover effect
    const hoverY = Math.sin(this.time) * this.hoverAmplitude;

    // Trail
    this.trail.push({ x: this.x, y: this.y + hoverY + this.size });
    if (this.trail.length > this.trailMaxLength) {
      this.trail.shift();
    }

    // Update exhaust sparks
    this._updateSparks(dt, hoverY);

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

  // ── Spark / particle system ──────────────────────────────
  _updateSparks(dt, hoverY) {
    const maxSparks = this.boosting ? 12 : 4;
    const spawnRate = this.boosting ? 0.8 : 0.3;
    const s = this.size;

    // Spawn new sparks from engine position
    if (Math.random() < spawnRate) {
      this._sparks.push({
        x: this.x - s * 0.5,
        y: this.y + hoverY + (Math.random() - 0.5) * s * 0.4,
        vx: -(1.5 + Math.random() * 2) * (this.boosting ? 2.5 : 1),
        vy: (Math.random() - 0.5) * 1.2,
        life: 1,
        decay: 1.5 + Math.random(),
        radius: 1 + Math.random() * 1.5,
      });
    }

    // Update & cull
    const cullThreshold = maxSparks * 2;
    for (let i = this._sparks.length - 1; i >= 0; i--) {
      const p = this._sparks[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay * dt;
      if (p.life <= 0 || this._sparks.length > cullThreshold) {
        this._sparks.splice(i, 1);
      }
    }
  }

  // ── Main draw ────────────────────────────────────────────
  draw(ctx) {
    const hover = Math.sin(this.time) * this.hoverAmplitude;
    const dx = this.x;
    const dy = this.y + hover;
    const s = this.size;

    // Draw trail
    this._drawTrail(ctx);

    // Draw exhaust sparks (behind ship)
    this._drawSparks(ctx);

    ctx.save();
    ctx.translate(dx, dy);

    // Draw engine flames first (behind the body)
    this._drawFlames(ctx, s);

    // Draw wings
    this._drawWings(ctx, s);

    // Draw main fuselage
    this._drawBody(ctx, s);

    // Draw cockpit
    this._drawCockpit(ctx, s);

    // Draw accent stripe
    this._drawStripe(ctx, s);

    ctx.restore();

    // Name label
    this._drawLabel(ctx, dx, dy, s);
  }

  // ── Fuselage ─────────────────────────────────────────────
  _drawBody(ctx, s) {
    const { _rgb: c, _dark: dk, _mid: md } = this;

    // Outer glow
    ctx.shadowColor = this.color;
    ctx.shadowBlur = this.boosting ? 25 : 12;

    // Main body gradient (top-lit metallic look)
    const bodyGrad = ctx.createLinearGradient(0, -s * 0.35, 0, s * 0.35);
    bodyGrad.addColorStop(0, rgba(c.r, c.g, c.b, 1));
    bodyGrad.addColorStop(0.45, rgba(md.r, md.g, md.b, 1));
    bodyGrad.addColorStop(1, rgba(dk.r, dk.g, dk.b, 1));

    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    // Sleek pointed fuselage with curved profile
    ctx.moveTo(s * 1.1, 0);                    // Nose tip
    ctx.quadraticCurveTo(s * 0.6, -s * 0.28, -s * 0.15, -s * 0.32); // Top curve
    ctx.lineTo(-s * 0.55, -s * 0.22);          // Rear top
    ctx.lineTo(-s * 0.55, s * 0.22);           // Rear bottom
    ctx.lineTo(-s * 0.15, s * 0.32);           // Bottom curve start
    ctx.quadraticCurveTo(s * 0.6, s * 0.28, s * 1.1, 0); // Bottom curve
    ctx.closePath();
    ctx.fill();

    // Subtle edge highlight along the top
    ctx.shadowBlur = 0;
    ctx.strokeStyle = rgba(255, 255, 255, 0.25);
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.moveTo(s * 1.05, 0);
    ctx.quadraticCurveTo(s * 0.55, -s * 0.25, -s * 0.1, -s * 0.3);
    ctx.stroke();
  }

  // ── Wings ────────────────────────────────────────────────
  _drawWings(ctx, s) {
    const { _rgb: c, _dark: dk } = this;

    ctx.shadowColor = this.color;
    ctx.shadowBlur = 6;

    // --- Top wing ---
    const wingGrad = ctx.createLinearGradient(0, -s * 0.3, 0, -s * 0.9);
    wingGrad.addColorStop(0, rgba(c.r, c.g, c.b, 0.9));
    wingGrad.addColorStop(1, rgba(dk.r, dk.g, dk.b, 0.7));

    ctx.fillStyle = wingGrad;
    ctx.beginPath();
    ctx.moveTo(s * 0.05, -s * 0.28);           // Root leading edge
    ctx.lineTo(-s * 0.2, -s * 0.75);           // Tip
    ctx.lineTo(-s * 0.55, -s * 0.55);          // Trailing edge outer
    ctx.lineTo(-s * 0.45, -s * 0.22);          // Trailing edge root
    ctx.closePath();
    ctx.fill();

    // Wing tip glow dot
    ctx.shadowBlur = 0;
    ctx.fillStyle = rgba(255, 255, 255, 0.6 + Math.sin(this.time * 2) * 0.3);
    ctx.beginPath();
    ctx.arc(-s * 0.2, -s * 0.73, 1.2, 0, Math.PI * 2);
    ctx.fill();

    // --- Bottom wing ---
    const wingGrad2 = ctx.createLinearGradient(0, s * 0.3, 0, s * 0.9);
    wingGrad2.addColorStop(0, rgba(c.r, c.g, c.b, 0.9));
    wingGrad2.addColorStop(1, rgba(dk.r, dk.g, dk.b, 0.7));

    ctx.shadowBlur = 6;
    ctx.shadowColor = this.color;
    ctx.fillStyle = wingGrad2;
    ctx.beginPath();
    ctx.moveTo(s * 0.05, s * 0.28);
    ctx.lineTo(-s * 0.2, s * 0.75);
    ctx.lineTo(-s * 0.55, s * 0.55);
    ctx.lineTo(-s * 0.45, s * 0.22);
    ctx.closePath();
    ctx.fill();

    // Wing tip glow dot
    ctx.shadowBlur = 0;
    ctx.fillStyle = rgba(255, 255, 255, 0.6 + Math.sin(this.time * 2) * 0.3);
    ctx.beginPath();
    ctx.arc(-s * 0.2, s * 0.73, 1.2, 0, Math.PI * 2);
    ctx.fill();
  }

  // ── Cockpit ──────────────────────────────────────────────
  _drawCockpit(ctx, s) {
    ctx.shadowBlur = 0;

    // Glass dome gradient
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

    // Bright specular highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.beginPath();
    ctx.ellipse(s * 0.42, -s * 0.04, s * 0.07, s * 0.04, -0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  // ── Racing stripe ────────────────────────────────────────
  _drawStripe(ctx, s) {
    ctx.shadowBlur = 0;
    ctx.strokeStyle = rgba(255, 255, 255, 0.15);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(s * 0.85, 0);
    ctx.lineTo(-s * 0.4, 0);
    ctx.stroke();
  }

  // ── Engine flames ────────────────────────────────────────
  _drawFlames(ctx, s) {
    ctx.shadowBlur = 0;
    const boost = this.boosting;

    // Flame length with flicker
    const baseLen = boost ? s * 1.0 : s * 0.4;
    const flicker = Math.sin(this.time * 12) * s * 0.08
                  + Math.sin(this.time * 17) * s * 0.05;
    const flameLen = baseLen + flicker + Math.random() * s * 0.15;

    const ex = -s * 0.55;  // Engine exit x

    // Outer flame (red-orange, wide)
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

    // Inner flame (white-yellow, narrow, shorter)
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

    // Engine nozzle ring
    const { _dark: dk } = this;
    ctx.fillStyle = rgba(dk.r, dk.g, dk.b, 0.9);
    ctx.fillRect(ex - 1, -s * 0.2, 3, s * 0.4);
  }

  // ── Exhaust sparks ───────────────────────────────────────
  _drawSparks(ctx) {
    if (this._sparks.length === 0) return;
    const { _rgb: c } = this;

    ctx.save();
    for (const p of this._sparks) {
      const a = Math.max(0, p.life);
      ctx.globalAlpha = a * 0.8;
      ctx.fillStyle = rgba(
        Math.min(255, c.r + 100),
        Math.min(255, c.g + 80),
        Math.min(255, c.b + 60),
        1,
      );
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius * a, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // ── Trail ────────────────────────────────────────────────
  _drawTrail(ctx) {
    if (this.trail.length < 2) return;
    const { _rgb: c } = this;

    for (let i = 1; i < this.trail.length; i++) {
      const t = i / this.trail.length;
      const alpha = t * 0.35;
      const width = t * 3;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = this.color;
      ctx.lineWidth = width;
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 4;
      ctx.beginPath();
      ctx.moveTo(this.trail[i - 1].x, this.trail[i - 1].y);
      ctx.lineTo(this.trail[i].x, this.trail[i].y);
      ctx.stroke();
      ctx.restore();

      // Sparkle dots along trail at intervals
      if (i % 3 === 0) {
        ctx.save();
        ctx.globalAlpha = alpha * 0.6;
        ctx.fillStyle = rgba(
          Math.min(255, c.r + 80),
          Math.min(255, c.g + 80),
          Math.min(255, c.b + 80),
          1,
        );
        ctx.beginPath();
        ctx.arc(this.trail[i].x, this.trail[i].y, width * 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
  }

  // ── Name label ───────────────────────────────────────────
  _drawLabel(ctx, dx, dy, s) {
    ctx.save();
    ctx.fillStyle = this.color;
    ctx.font = "bold 11px 'Noto Sans Hebrew', sans-serif";
    ctx.textAlign = 'center';
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 8;
    ctx.fillText(this.name, dx, dy - s - 8);
    ctx.restore();
  }
}
