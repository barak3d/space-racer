// Alien.js — ציור חייזרים על Canvas

export default class Alien {
  constructor(alienData) {
    this.id = alienData.id;
    this.name = alienData.name;
    this.color = alienData.color;
    this.bodyColor = alienData.bodyColor;
    this.shape = alienData.shape;
    this.eyes = alienData.eyes || 2;
    this.hasAntenna = alienData.antenna;
    this.x = 0;
    this.y = 0;
    this.size = 40;
    this.time = Math.random() * Math.PI * 2;

    // Animation state
    this.collecting = false;
    this.collectProgress = 0;
    this.sparkles = [];
    this.bounceOffset = 0;
    this.visible = true;
  }

  update(dt) {
    this.time += dt * 2;
    this.bounceOffset = Math.sin(this.time) * 3;

    if (this.collecting) {
      this.collectProgress += dt * 2;
      if (this.collectProgress >= 1) {
        this.collecting = false;
        this.collectProgress = 0;
      }
      // Update sparkles
      for (let i = this.sparkles.length - 1; i >= 0; i--) {
        const s = this.sparkles[i];
        s.life -= dt * 2;
        s.x += s.vx * dt * 60;
        s.y += s.vy * dt * 60;
        if (s.life <= 0) this.sparkles.splice(i, 1);
      }
    }
  }

  draw(ctx, x, y, size) {
    if (!this.visible) return;

    const cx = x || this.x;
    const cy = (y || this.y) + this.bounceOffset;
    const s = size || this.size;

    ctx.save();

    // Collect animation: scale up then fade
    if (this.collecting) {
      const scale = 1 + this.collectProgress * 0.5;
      const alpha = 1 - this.collectProgress;
      ctx.globalAlpha = alpha;
      ctx.translate(cx, cy);
      ctx.scale(scale, scale);
      ctx.translate(-cx, -cy);
    }

    // Glow effect
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 15;

    // Draw body based on shape
    this._drawBody(ctx, cx, cy, s);

    // Draw eyes
    ctx.shadowBlur = 0;
    this._drawEyes(ctx, cx, cy, s);

    // Draw antenna
    if (this.hasAntenna) {
      this._drawAntenna(ctx, cx, cy, s);
    }

    ctx.restore();

    // Draw sparkles
    if (this.collecting) {
      this._drawSparkles(ctx, cx, cy);
    }
  }

  _drawBody(ctx, cx, cy, s) {
    const r = s / 2;
    ctx.fillStyle = this.bodyColor;
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 2;

    switch (this.shape) {
      case 'round':
        ctx.beginPath();
        ctx.ellipse(cx, cy, r, r * 1.1, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        break;

      case 'star': {
        const spikes = 5;
        const outerR = r;
        const innerR = r * 0.5;
        ctx.beginPath();
        for (let i = 0; i < spikes * 2; i++) {
          const radius = i % 2 === 0 ? outerR : innerR;
          const angle = (i * Math.PI) / spikes - Math.PI / 2;
          const px = cx + Math.cos(angle) * radius;
          const py = cy + Math.sin(angle) * radius;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;
      }

      case 'square':
        ctx.beginPath();
        const half = r * 0.8;
        ctx.roundRect(cx - half, cy - half, half * 2, half * 2, 6);
        ctx.fill();
        ctx.stroke();
        break;

      case 'triangle':
        ctx.beginPath();
        ctx.moveTo(cx, cy - r);
        ctx.lineTo(cx + r, cy + r * 0.7);
        ctx.lineTo(cx - r, cy + r * 0.7);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;

      case 'diamond':
        ctx.beginPath();
        ctx.moveTo(cx, cy - r);
        ctx.lineTo(cx + r * 0.7, cy);
        ctx.lineTo(cx, cy + r);
        ctx.lineTo(cx - r * 0.7, cy);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;

      case 'crescent':
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#0a0020';
        ctx.beginPath();
        ctx.arc(cx + r * 0.35, cy - r * 0.1, r * 0.75, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'flat':
        // Flying saucer disc
        ctx.beginPath();
        ctx.ellipse(cx, cy, r, r * 0.45, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // Dome on top
        ctx.beginPath();
        ctx.ellipse(cx, cy - r * 0.1, r * 0.5, r * 0.4, 0, Math.PI, 0);
        ctx.fill();
        ctx.stroke();
        break;

      case 'comet': {
        // Tail
        const tailGrad = ctx.createLinearGradient(cx - r * 1.4, cy, cx, cy);
        tailGrad.addColorStop(0, 'rgba(0,0,0,0)');
        tailGrad.addColorStop(1, this.color);
        ctx.fillStyle = tailGrad;
        ctx.beginPath();
        ctx.moveTo(cx - r * 1.4, cy);
        ctx.lineTo(cx - r * 0.5, cy - r * 0.35);
        ctx.lineTo(cx - r * 0.5, cy + r * 0.35);
        ctx.closePath();
        ctx.fill();
        // Head
        ctx.fillStyle = this.bodyColor;
        ctx.strokeStyle = this.color;
        ctx.beginPath();
        ctx.arc(cx + r * 0.1, cy, r * 0.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        break;
      }

      case 'cloud': {
        // Puffy cloud shape from overlapping circles
        const cloudParts = [
          [0, 0, r * 0.55],
          [-r * 0.45, r * 0.2, r * 0.38],
          [r * 0.45, r * 0.2, r * 0.38],
          [-r * 0.25, -r * 0.28, r * 0.32],
          [r * 0.25, -r * 0.28, r * 0.32],
        ];
        ctx.beginPath();
        for (const [dx, dy, pr] of cloudParts) {
          ctx.moveTo(cx + dx + pr, cy + dy);
          ctx.arc(cx + dx, cy + dy, pr, 0, Math.PI * 2);
        }
        ctx.fill();
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 1.5;
        for (const [dx, dy, pr] of cloudParts) {
          ctx.beginPath();
          ctx.arc(cx + dx, cy + dy, pr, 0, Math.PI * 2);
          ctx.stroke();
        }
        break;
      }

      case 'spiral': {
        // Two spiral arms
        for (let arm = 0; arm < 2; arm++) {
          const startAngle = arm * Math.PI;
          ctx.beginPath();
          for (let i = 0; i <= 40; i++) {
            const t = i / 40;
            const angle = startAngle + t * Math.PI * 2.5;
            const radius = t * r * 0.85;
            const px = cx + Math.cos(angle) * radius;
            const py = cy + Math.sin(angle) * radius;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.strokeStyle = this.color;
          ctx.lineWidth = 3;
          ctx.stroke();
        }
        // Bright centre
        ctx.fillStyle = this.bodyColor;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, r * 0.25, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        break;
      }

      case 'ring': {
        // Main sphere
        ctx.beginPath();
        ctx.arc(cx, cy, r * 0.48, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // Ring / orbit band
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(cx, cy, r * 0.95, r * 0.28, -Math.PI / 7, 0, Math.PI * 2);
        ctx.stroke();
        break;
      }

      case 'trophy': {
        // Cup body
        ctx.beginPath();
        ctx.moveTo(cx - r * 0.58, cy - r * 0.65);
        ctx.lineTo(cx + r * 0.58, cy - r * 0.65);
        ctx.quadraticCurveTo(cx + r * 0.68, cy + r * 0.1, cx, cy + r * 0.5);
        ctx.quadraticCurveTo(cx - r * 0.68, cy + r * 0.1, cx - r * 0.58, cy - r * 0.65);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        // Base
        ctx.fillStyle = this.bodyColor;
        ctx.strokeStyle = this.color;
        ctx.beginPath();
        ctx.roundRect(cx - r * 0.38, cy + r * 0.48, r * 0.76, r * 0.25, 3);
        ctx.fill();
        ctx.stroke();
        // Handles
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(cx - r * 0.7, cy - r * 0.18, r * 0.22, Math.PI * 0.5, Math.PI * 1.5);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx + r * 0.7, cy - r * 0.18, r * 0.22, -Math.PI * 0.5, Math.PI * 0.5);
        ctx.stroke();
        break;
      }

      case 'burst': {
        // Sun-burst rays
        const rayCount = 8;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 3;
        for (let i = 0; i < rayCount; i++) {
          const angle = (i * Math.PI * 2) / rayCount;
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(angle) * r * 0.42, cy + Math.sin(angle) * r * 0.42);
          ctx.lineTo(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
          ctx.stroke();
        }
        ctx.fillStyle = this.bodyColor;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, r * 0.42, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        break;
      }

      case 'double': {
        // Twin connected bodies
        const off = r * 0.38;
        for (const dx of [-off, off]) {
          ctx.beginPath();
          ctx.arc(cx + dx, cy, r * 0.54, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }
        break;
      }

      default:
        // Fallback: circle
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    }
  }

  _drawEyes(ctx, cx, cy, s) {
    const eyeR = s * 0.08;
    const eyeY = cy - s * 0.05;

    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;

    if (this.eyes === 1) {
      // Cyclops
      ctx.beginPath();
      ctx.arc(cx, eyeY, eyeR * 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(cx, eyeY, eyeR * 0.7, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.eyes === 2) {
      const gap = s * 0.15;
      for (const dx of [-gap, gap]) {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(cx + dx, eyeY, eyeR, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(cx + dx, eyeY, eyeR * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (this.eyes >= 3) {
      const gap = s * 0.12;
      const positions = [
        [-gap, eyeY - s * 0.06],
        [gap, eyeY - s * 0.06],
        [0, eyeY + s * 0.06],
      ];
      if (this.eyes === 4) {
        positions.push([0, eyeY - s * 0.15]);
      }
      for (const [dx, dy] of positions) {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(cx + dx, dy, eyeR * 0.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(cx + dx, dy, eyeR * 0.4, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Smile
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy + s * 0.1, s * 0.12, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();
  }

  _drawAntenna(ctx, cx, cy, s) {
    const baseY = cy - s / 2;
    const tipY = baseY - s * 0.35;
    const wobble = Math.sin(this.time * 3) * 3;

    ctx.strokeStyle = this.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, baseY);
    ctx.quadraticCurveTo(cx + wobble, baseY - s * 0.2, cx + wobble * 0.5, tipY);
    ctx.stroke();

    // Antenna ball
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(cx + wobble * 0.5, tipY, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  _drawSparkles(ctx, cx, cy) {
    for (const s of this.sparkles) {
      ctx.save();
      ctx.globalAlpha = s.life;
      ctx.fillStyle = s.color;
      ctx.shadowColor = s.color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size * s.life, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // Fraction of the canvas size used as the alien drawing size (leaves a small margin)
  static get THUMBNAIL_SIZE_RATIO() { return 0.75; }

  // Create a small canvas thumbnail for this alien (used in UI/HTML contexts)
  static createCanvas(alienData, size = 60) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    const alien = new Alien(alienData);
    alien.draw(ctx, size / 2, size / 2, size * Alien.THUMBNAIL_SIZE_RATIO);
    return canvas;
  }

  playCollectAnimation() {
    this.collecting = true;
    this.collectProgress = 0;

    // Generate sparkles
    const colors = [this.color, '#ffffff', '#ffd700', '#ff69b4'];
    for (let i = 0; i < 12; i++) {
      const angle = (Math.PI * 2 * i) / 12;
      this.sparkles.push({
        x: this.x,
        y: this.y,
        vx: Math.cos(angle) * (1 + Math.random()),
        vy: Math.sin(angle) * (1 + Math.random()),
        size: 3 + Math.random() * 4,
        life: 1,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
  }

  // Draw as a card in the collection screen
  drawCard(ctx, x, y, size, unlocked) {
    ctx.save();

    if (!unlocked) {
      ctx.globalAlpha = 0.3;
    }

    // Card background
    ctx.fillStyle = unlocked ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.3)';
    ctx.strokeStyle = unlocked ? this.color : 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x - size * 0.6, y - size * 0.8, size * 1.2, size * 1.6, 8);
    ctx.fill();
    ctx.stroke();

    if (unlocked) {
      // Draw alien
      this.draw(ctx, x, y - size * 0.1, size * 0.6);

      // Name
      ctx.fillStyle = this.color;
      ctx.font = `bold ${size * 0.25}px 'Noto Sans Hebrew', sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(this.name, x, y + size * 0.55);
    } else {
      // Lock icon
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.font = `${size * 0.5}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🔒', x, y);
    }

    ctx.restore();
  }
}
