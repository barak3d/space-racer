// AlienEffects.js — אפקטים מיוחדים בלחיצה על חייזרים

/**
 * Full-screen canvas overlay that renders particle effects
 * when aliens are clicked. Each alien has a unique effect.
 */
class AlienEffects {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.particles = [];
    this.animationId = null;
    this.lastTime = 0;
    this._boundLoop = this._loop.bind(this);
  }

  /** Create (or reuse) the overlay canvas */
  _ensureCanvas() {
    if (this.canvas && this.canvas.parentNode) return;
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'alien-effects-canvas';
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.ctx = this.canvas.getContext('2d');
    document.body.appendChild(this.canvas);

    const onResize = () => {
      if (!this.canvas) return;
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);
    this._resizeHandler = onResize;
  }

  /** Remove the canvas when no particles remain */
  _cleanup() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
    if (this._resizeHandler) {
      window.removeEventListener('resize', this._resizeHandler);
      this._resizeHandler = null;
    }
    this.canvas = null;
    this.ctx = null;
  }

  /** Main animation loop */
  _loop(timestamp) {
    if (!this.ctx) return;
    const dt = Math.min((timestamp - this.lastTime) / 1000, 0.05);
    this.lastTime = timestamp;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      p.update(p, dt);
      p.draw(this.ctx, p);
    }

    if (this.particles.length > 0) {
      this.animationId = requestAnimationFrame(this._boundLoop);
    } else {
      this._cleanup();
    }
  }

  /** Start the effect loop if not already running */
  _startLoop() {
    if (this.animationId) return;
    this.lastTime = performance.now();
    this.animationId = requestAnimationFrame(this._boundLoop);
  }

  /**
   * Trigger the effect for a given alien ID.
   * @param {number} alienId — alien id (1-20)
   * @param {string} color — alien color
   * @param {HTMLElement} el — the clicked element (for position)
   */
  trigger(alienId, color, el) {
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const w = window.innerWidth;
    const h = window.innerHeight;

    this._ensureCanvas();
    const generator = this._effects[alienId] || this._effects[1];
    generator.call(this, cx, cy, w, h, color);
    this._startLoop();
  }

  // ——— helpers ———

  _rand(min, max) { return min + Math.random() * (max - min); }
  _randInt(min, max) { return Math.floor(this._rand(min, max + 1)); }

  _hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
  }

  _addParticle(p) {
    this.particles.push(p);
  }

  // ——— 20 unique effects ———

  get _effects() {
    return {
      // 1 — זוֹהֲרִי — Fireworks
      1: (cx, cy, w, h, color) => {
        const count = 40;
        for (let i = 0; i < count; i++) {
          const angle = (i / count) * Math.PI * 2 + this._rand(-0.15, 0.15);
          const speed = this._rand(150, 350);
          const size = this._rand(2, 5);
          const hue = this._rand(0, 360);
          this._addParticle({
            x: cx, y: cy,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size,
            life: this._rand(0.8, 1.5),
            maxLife: 1.5,
            color: `hsl(${hue}, 100%, 70%)`,
            trail: [],
            update(p, dt) {
              p.trail.push({ x: p.x, y: p.y });
              if (p.trail.length > 5) p.trail.shift();
              p.x += p.vx * dt;
              p.y += p.vy * dt;
              p.vy += 200 * dt; // gravity
              p.vx *= 0.98;
            },
            draw(ctx, p) {
              const alpha = Math.max(0, p.life / p.maxLife);
              // trail
              for (let t = 0; t < p.trail.length; t++) {
                const ta = (t / p.trail.length) * alpha * 0.4;
                ctx.beginPath();
                ctx.arc(p.trail[t].x, p.trail[t].y, p.size * 0.5, 0, Math.PI * 2);
                ctx.fillStyle = p.color.replace('70%', '50%');
                ctx.globalAlpha = ta;
                ctx.fill();
              }
              ctx.globalAlpha = alpha;
              ctx.beginPath();
              ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
              ctx.fillStyle = p.color;
              ctx.shadowColor = p.color;
              ctx.shadowBlur = 10;
              ctx.fill();
              ctx.shadowBlur = 0;
              ctx.globalAlpha = 1;
            },
          });
        }
      },

      // 2 — נִיצְנוּץ — Sparkle shower
      2: (cx, cy, w, h, color) => {
        for (let i = 0; i < 35; i++) {
          const delay = this._rand(0, 0.5);
          this._addParticle({
            x: this._rand(0, w),
            y: this._rand(-30, -10),
            size: this._rand(3, 7),
            life: this._rand(1.5, 2.5) + delay,
            maxLife: 2.5 + delay,
            delay,
            rotation: this._rand(0, Math.PI * 2),
            rotSpeed: this._rand(-5, 5),
            speed: this._rand(80, 200),
            color,
            update(p, dt) {
              if (p.delay > 0) { p.delay -= dt; return; }
              p.y += p.speed * dt;
              p.x += Math.sin(p.y * 0.02) * 40 * dt;
              p.rotation += p.rotSpeed * dt;
            },
            draw(ctx, p) {
              if (p.delay > 0) return;
              const alpha = Math.max(0, p.life / p.maxLife);
              ctx.save();
              ctx.translate(p.x, p.y);
              ctx.rotate(p.rotation);
              ctx.globalAlpha = alpha;
              // 4-pointed star
              ctx.beginPath();
              for (let s = 0; s < 4; s++) {
                const a = (s / 4) * Math.PI * 2;
                ctx.moveTo(0, 0);
                ctx.lineTo(Math.cos(a) * p.size, Math.sin(a) * p.size);
              }
              ctx.strokeStyle = p.color;
              ctx.shadowColor = p.color;
              ctx.shadowBlur = 8;
              ctx.lineWidth = 2;
              ctx.stroke();
              ctx.shadowBlur = 0;
              ctx.globalAlpha = 1;
              ctx.restore();
            },
          });
        }
      },

      // 3 — חִישְׁבּוֹן — Matrix digits rain
      3: (cx, cy, w, h, color) => {
        for (let i = 0; i < 40; i++) {
          const col = this._rand(0, w);
          this._addParticle({
            x: col,
            y: this._rand(-50, -10),
            life: this._rand(1.5, 3),
            maxLife: 3,
            speed: this._rand(150, 300),
            char: String(this._randInt(0, 9)),
            size: this._rand(14, 22),
            color,
            timer: 0,
            update(p, dt) {
              p.y += p.speed * dt;
              p.timer += dt;
              if (p.timer > 0.15) {
                p.char = String(Math.floor(Math.random() * 10));
                p.timer = 0;
              }
            },
            draw(ctx, p) {
              const alpha = Math.max(0, p.life / p.maxLife);
              ctx.globalAlpha = alpha;
              ctx.font = `bold ${p.size}px monospace`;
              ctx.fillStyle = p.color;
              ctx.shadowColor = p.color;
              ctx.shadowBlur = 10;
              ctx.fillText(p.char, p.x, p.y);
              ctx.shadowBlur = 0;
              ctx.globalAlpha = 1;
            },
          });
        }
      },

      // 4 — כּוֹכָבִית — Shooting stars
      4: (cx, cy, w, h, color) => {
        for (let i = 0; i < 12; i++) {
          const startX = this._rand(0, w);
          const startY = this._rand(0, h * 0.3);
          const angle = this._rand(0.3, 0.8);
          const speed = this._rand(400, 700);
          this._addParticle({
            x: startX, y: startY,
            vx: Math.cos(angle) * speed * (Math.random() > 0.5 ? 1 : -1),
            vy: Math.sin(angle) * speed,
            life: this._rand(0.6, 1.2),
            maxLife: 1.2,
            size: this._rand(2, 4),
            trail: [],
            color,
            delay: this._rand(0, 0.8),
            update(p, dt) {
              if (p.delay > 0) { p.delay -= dt; return; }
              p.trail.push({ x: p.x, y: p.y });
              if (p.trail.length > 12) p.trail.shift();
              p.x += p.vx * dt;
              p.y += p.vy * dt;
            },
            draw(ctx, p) {
              if (p.delay > 0) return;
              const alpha = Math.max(0, p.life / p.maxLife);
              // trail
              for (let t = 0; t < p.trail.length; t++) {
                const ta = (t / p.trail.length) * alpha;
                ctx.globalAlpha = ta * 0.6;
                ctx.beginPath();
                ctx.arc(p.trail[t].x, p.trail[t].y, p.size * 0.5, 0, Math.PI * 2);
                ctx.fillStyle = '#fff';
                ctx.fill();
              }
              ctx.globalAlpha = alpha;
              ctx.beginPath();
              ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
              ctx.fillStyle = p.color;
              ctx.shadowColor = p.color;
              ctx.shadowBlur = 15;
              ctx.fill();
              ctx.shadowBlur = 0;
              ctx.globalAlpha = 1;
            },
          });
        }
      },

      // 5 — סַהֲרוֹן — Snowfall
      5: (cx, cy, w, h, color) => {
        for (let i = 0; i < 50; i++) {
          this._addParticle({
            x: this._rand(0, w),
            y: this._rand(-50, -10),
            size: this._rand(2, 6),
            life: this._rand(2, 4),
            maxLife: 4,
            speed: this._rand(40, 100),
            wobblePhase: this._rand(0, Math.PI * 2),
            wobbleSpeed: this._rand(1, 3),
            delay: this._rand(0, 1),
            color,
            update(p, dt) {
              if (p.delay > 0) { p.delay -= dt; return; }
              p.y += p.speed * dt;
              p.wobblePhase += p.wobbleSpeed * dt;
              p.x += Math.sin(p.wobblePhase) * 30 * dt;
            },
            draw(ctx, p) {
              if (p.delay > 0) return;
              const alpha = Math.max(0, Math.min(1, p.life / p.maxLife));
              ctx.globalAlpha = alpha * 0.8;
              ctx.beginPath();
              ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
              ctx.fillStyle = '#fff';
              ctx.shadowColor = p.color;
              ctx.shadowBlur = 8;
              ctx.fill();
              ctx.shadowBlur = 0;
              ctx.globalAlpha = 1;
            },
          });
        }
      },

      // 6 — מְהִירוֹן — Fire burst
      6: (cx, cy, w, h, color) => {
        for (let i = 0; i < 45; i++) {
          const angle = this._rand(-Math.PI, 0); // upward
          const speed = this._rand(100, 300);
          this._addParticle({
            x: cx + this._rand(-30, 30),
            y: cy,
            vx: Math.cos(angle) * speed * 0.5,
            vy: Math.sin(angle) * speed,
            life: this._rand(0.6, 1.5),
            maxLife: 1.5,
            size: this._rand(4, 10),
            color,
            update(p, dt) {
              p.x += p.vx * dt;
              p.y += p.vy * dt;
              p.vy -= 50 * dt; // float up
              p.size *= 0.97;
            },
            draw(ctx, p) {
              const alpha = Math.max(0, p.life / p.maxLife);
              const hue = 20 + (1 - alpha) * 30; // orange → red
              ctx.globalAlpha = alpha;
              ctx.beginPath();
              ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
              ctx.fillStyle = `hsl(${hue}, 100%, ${50 + alpha * 20}%)`;
              ctx.shadowColor = `hsl(${hue}, 100%, 60%)`;
              ctx.shadowBlur = 15;
              ctx.fill();
              ctx.shadowBlur = 0;
              ctx.globalAlpha = 1;
            },
          });
        }
      },

      // 7 — חַכְמוֹלִי — Floating bubbles
      7: (cx, cy, w, h, color) => {
        for (let i = 0; i < 25; i++) {
          const size = this._rand(8, 25);
          this._addParticle({
            x: cx + this._rand(-100, 100),
            y: cy + this._rand(-20, 40),
            size,
            life: this._rand(1.5, 3),
            maxLife: 3,
            vy: this._rand(-80, -30),
            wobblePhase: this._rand(0, Math.PI * 2),
            color,
            update(p, dt) {
              p.y += p.vy * dt;
              p.wobblePhase += 2 * dt;
              p.x += Math.sin(p.wobblePhase) * 25 * dt;
            },
            draw(ctx, p) {
              const alpha = Math.max(0, p.life / p.maxLife) * 0.7;
              ctx.globalAlpha = alpha;
              ctx.beginPath();
              ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
              ctx.strokeStyle = p.color;
              ctx.lineWidth = 2;
              ctx.shadowColor = p.color;
              ctx.shadowBlur = 5;
              ctx.stroke();
              // highlight
              ctx.beginPath();
              ctx.arc(p.x - p.size * 0.3, p.y - p.size * 0.3, p.size * 0.2, 0, Math.PI * 2);
              ctx.fillStyle = '#fff';
              ctx.fill();
              ctx.shadowBlur = 0;
              ctx.globalAlpha = 1;
            },
          });
        }
      },

      // 8 — פַּחְסָנִית — Floating hearts
      8: (cx, cy, w, h, color) => {
        for (let i = 0; i < 20; i++) {
          this._addParticle({
            x: cx + this._rand(-120, 120),
            y: cy + this._rand(-20, 40),
            size: this._rand(8, 18),
            life: this._rand(1.5, 2.5),
            maxLife: 2.5,
            vy: this._rand(-120, -40),
            wobblePhase: this._rand(0, Math.PI * 2),
            color,
            update(p, dt) {
              p.y += p.vy * dt;
              p.wobblePhase += 3 * dt;
              p.x += Math.sin(p.wobblePhase) * 30 * dt;
            },
            draw(ctx, p) {
              const alpha = Math.max(0, p.life / p.maxLife);
              ctx.save();
              ctx.globalAlpha = alpha;
              ctx.translate(p.x, p.y);
              const s = p.size;
              ctx.beginPath();
              ctx.moveTo(0, s * 0.3);
              ctx.bezierCurveTo(-s, -s * 0.3, -s * 0.5, -s, 0, -s * 0.5);
              ctx.bezierCurveTo(s * 0.5, -s, s, -s * 0.3, 0, s * 0.3);
              ctx.fillStyle = p.color;
              ctx.shadowColor = p.color;
              ctx.shadowBlur = 10;
              ctx.fill();
              ctx.shadowBlur = 0;
              ctx.restore();
              ctx.globalAlpha = 1;
            },
          });
        }
      },

      // 9 — בּוּעָתִי — Rising neon rings
      9: (cx, cy, w, h, color) => {
        for (let i = 0; i < 15; i++) {
          this._addParticle({
            x: cx + this._rand(-60, 60),
            y: cy,
            size: this._rand(5, 15),
            maxSize: this._rand(20, 40),
            life: this._rand(1.2, 2.5),
            maxLife: 2.5,
            vy: this._rand(-100, -40),
            color,
            update(p, dt) {
              p.y += p.vy * dt;
              p.size += (p.maxSize - p.size) * 2 * dt;
            },
            draw(ctx, p) {
              const alpha = Math.max(0, p.life / p.maxLife) * 0.6;
              ctx.globalAlpha = alpha;
              ctx.beginPath();
              ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
              ctx.strokeStyle = p.color;
              ctx.lineWidth = 2;
              ctx.shadowColor = p.color;
              ctx.shadowBlur = 12;
              ctx.stroke();
              ctx.shadowBlur = 0;
              ctx.globalAlpha = 1;
            },
          });
        }
      },

      // 10 — פִּיקְסֶל — Pixel explosion
      10: (cx, cy, w, h, color) => {
        for (let i = 0; i < 50; i++) {
          const angle = this._rand(0, Math.PI * 2);
          const speed = this._rand(100, 400);
          const size = this._rand(3, 8);
          this._addParticle({
            x: cx, y: cy,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size,
            life: this._rand(0.5, 1.2),
            maxLife: 1.2,
            color: `hsl(${this._rand(340, 380) % 360}, 100%, 60%)`,
            update(p, dt) {
              p.x += p.vx * dt;
              p.y += p.vy * dt;
              p.vx *= 0.96;
              p.vy *= 0.96;
            },
            draw(ctx, p) {
              const alpha = Math.max(0, p.life / p.maxLife);
              ctx.globalAlpha = alpha;
              ctx.fillStyle = p.color;
              ctx.shadowColor = p.color;
              ctx.shadowBlur = 5;
              ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
              ctx.shadowBlur = 0;
              ctx.globalAlpha = 1;
            },
          });
        }
      },

      // 11 — שְׁבִיטוֹן — Comet swirl
      11: (cx, cy, w, h, color) => {
        for (let i = 0; i < 8; i++) {
          const orbitRadius = this._rand(40, 120);
          const startAngle = (i / 8) * Math.PI * 2;
          this._addParticle({
            x: cx, y: cy,
            angle: startAngle,
            orbitRadius,
            angularSpeed: this._rand(3, 6),
            life: this._rand(1.5, 2.5),
            maxLife: 2.5,
            size: this._rand(3, 6),
            trail: [],
            cx, cy,
            color,
            update(p, dt) {
              p.angle += p.angularSpeed * dt;
              p.orbitRadius += 30 * dt;
              p.trail.push({ x: p.x, y: p.y });
              if (p.trail.length > 10) p.trail.shift();
              p.x = p.cx + Math.cos(p.angle) * p.orbitRadius;
              p.y = p.cy + Math.sin(p.angle) * p.orbitRadius;
            },
            draw(ctx, p) {
              const alpha = Math.max(0, p.life / p.maxLife);
              for (let t = 0; t < p.trail.length; t++) {
                ctx.globalAlpha = (t / p.trail.length) * alpha * 0.3;
                ctx.beginPath();
                ctx.arc(p.trail[t].x, p.trail[t].y, p.size * 0.5, 0, Math.PI * 2);
                ctx.fillStyle = '#fff';
                ctx.fill();
              }
              ctx.globalAlpha = alpha;
              ctx.beginPath();
              ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
              ctx.fillStyle = '#fff';
              ctx.shadowColor = p.color;
              ctx.shadowBlur = 15;
              ctx.fill();
              ctx.shadowBlur = 0;
              ctx.globalAlpha = 1;
            },
          });
        }
      },

      // 12 — עֶנָנִי — Raindrops
      12: (cx, cy, w, h, color) => {
        for (let i = 0; i < 60; i++) {
          this._addParticle({
            x: this._rand(0, w),
            y: this._rand(-80, -10),
            life: this._rand(1, 2.5),
            maxLife: 2.5,
            speed: this._rand(250, 450),
            length: this._rand(8, 20),
            delay: this._rand(0, 0.8),
            color,
            update(p, dt) {
              if (p.delay > 0) { p.delay -= dt; return; }
              p.y += p.speed * dt;
            },
            draw(ctx, p) {
              if (p.delay > 0) return;
              const alpha = Math.max(0, p.life / p.maxLife) * 0.6;
              ctx.globalAlpha = alpha;
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(p.x, p.y - p.length);
              ctx.strokeStyle = p.color;
              ctx.lineWidth = 1.5;
              ctx.shadowColor = p.color;
              ctx.shadowBlur = 4;
              ctx.stroke();
              ctx.shadowBlur = 0;
              ctx.globalAlpha = 1;
            },
          });
        }
      },

      // 13 — גָּלַקְסִי — Galaxy spiral
      13: (cx, cy, w, h, color) => {
        for (let i = 0; i < 60; i++) {
          const armAngle = (i % 3) * ((Math.PI * 2) / 3);
          const dist = this._rand(10, 150);
          const spiralAngle = armAngle + dist * 0.03;
          this._addParticle({
            x: cx, y: cy,
            targetX: cx + Math.cos(spiralAngle) * dist,
            targetY: cy + Math.sin(spiralAngle) * dist,
            progress: 0,
            life: this._rand(1.5, 3),
            maxLife: 3,
            size: this._rand(1.5, 4),
            rotation: 0,
            rotSpeed: this._rand(1, 2.5),
            color: i % 5 === 0 ? '#fff' : color,
            cx, cy,
            update(p, dt) {
              p.progress = Math.min(1, p.progress + dt * 0.8);
              p.rotation += p.rotSpeed * dt;
              const cos = Math.cos(p.rotation);
              const sin = Math.sin(p.rotation);
              const dx = p.targetX - p.cx;
              const dy = p.targetY - p.cy;
              p.x = p.cx + (cos * dx - sin * dy) * p.progress;
              p.y = p.cy + (sin * dx + cos * dy) * p.progress;
            },
            draw(ctx, p) {
              const alpha = Math.max(0, p.life / p.maxLife) * 0.8;
              ctx.globalAlpha = alpha;
              ctx.beginPath();
              ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
              ctx.fillStyle = p.color;
              ctx.shadowColor = p.color;
              ctx.shadowBlur = 6;
              ctx.fill();
              ctx.shadowBlur = 0;
              ctx.globalAlpha = 1;
            },
          });
        }
      },

      // 14 — קְרִינָה — Lightning bolts
      14: (cx, cy, w, h, color) => {
        for (let b = 0; b < 5; b++) {
          const startX = cx + this._rand(-100, 100);
          const segments = [];
          let sx = startX, sy = 0;
          const endY = h;
          const steps = this._randInt(6, 10);
          for (let s = 0; s <= steps; s++) {
            segments.push({ x: sx, y: sy });
            sx += this._rand(-40, 40);
            sy += endY / steps;
          }
          this._addParticle({
            segments,
            life: this._rand(0.3, 0.7),
            maxLife: 0.7,
            delay: b * 0.15,
            color,
            update(p, dt) {
              if (p.delay > 0) { p.delay -= dt; return; }
            },
            draw(ctx, p) {
              if (p.delay > 0) return;
              const alpha = Math.max(0, p.life / p.maxLife);
              ctx.globalAlpha = alpha;
              ctx.beginPath();
              ctx.moveTo(p.segments[0].x, p.segments[0].y);
              for (let s = 1; s < p.segments.length; s++) {
                ctx.lineTo(p.segments[s].x, p.segments[s].y);
              }
              ctx.strokeStyle = p.color;
              ctx.lineWidth = 3;
              ctx.shadowColor = p.color;
              ctx.shadowBlur = 20;
              ctx.stroke();
              // bright core
              ctx.lineWidth = 1;
              ctx.strokeStyle = '#fff';
              ctx.stroke();
              ctx.shadowBlur = 0;
              ctx.globalAlpha = 1;
            },
          });
        }
      },

      // 15 — סַדְרָן — Diamond cascade
      15: (cx, cy, w, h, color) => {
        for (let i = 0; i < 30; i++) {
          this._addParticle({
            x: cx + this._rand(-150, 150),
            y: this._rand(-30, -10),
            size: this._rand(5, 12),
            life: this._rand(1.5, 2.5),
            maxLife: 2.5,
            speed: this._rand(80, 180),
            rotation: this._rand(0, Math.PI * 2),
            rotSpeed: this._rand(-4, 4),
            delay: this._rand(0, 0.5),
            color,
            update(p, dt) {
              if (p.delay > 0) { p.delay -= dt; return; }
              p.y += p.speed * dt;
              p.rotation += p.rotSpeed * dt;
            },
            draw(ctx, p) {
              if (p.delay > 0) return;
              const alpha = Math.max(0, p.life / p.maxLife);
              ctx.save();
              ctx.translate(p.x, p.y);
              ctx.rotate(p.rotation);
              ctx.globalAlpha = alpha;
              // diamond shape
              ctx.beginPath();
              ctx.moveTo(0, -p.size);
              ctx.lineTo(p.size * 0.6, 0);
              ctx.lineTo(0, p.size);
              ctx.lineTo(-p.size * 0.6, 0);
              ctx.closePath();
              ctx.fillStyle = p.color;
              ctx.shadowColor = p.color;
              ctx.shadowBlur = 10;
              ctx.fill();
              ctx.strokeStyle = '#fff';
              ctx.lineWidth = 1;
              ctx.stroke();
              ctx.shadowBlur = 0;
              ctx.restore();
              ctx.globalAlpha = 1;
            },
          });
        }
      },

      // 16 — אוֹתִיּוֹן — Letter confetti (Hebrew letters)
      16: (cx, cy, w, h, color) => {
        const letters = 'אבגדהוזחטיכלמנסעפצקרשת';
        for (let i = 0; i < 30; i++) {
          const angle = this._rand(0, Math.PI * 2);
          const speed = this._rand(100, 300);
          this._addParticle({
            x: cx, y: cy,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            char: letters[this._randInt(0, letters.length - 1)],
            size: this._rand(14, 24),
            life: this._rand(1, 2),
            maxLife: 2,
            rotation: this._rand(0, Math.PI * 2),
            rotSpeed: this._rand(-5, 5),
            color: `hsl(${this._rand(20, 50)}, 100%, 60%)`,
            update(p, dt) {
              p.x += p.vx * dt;
              p.y += p.vy * dt;
              p.vy += 120 * dt;
              p.rotation += p.rotSpeed * dt;
            },
            draw(ctx, p) {
              const alpha = Math.max(0, p.life / p.maxLife);
              ctx.save();
              ctx.translate(p.x, p.y);
              ctx.rotate(p.rotation);
              ctx.globalAlpha = alpha;
              ctx.font = `bold ${p.size}px sans-serif`;
              ctx.fillStyle = p.color;
              ctx.shadowColor = p.color;
              ctx.shadowBlur = 8;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText(p.char, 0, 0);
              ctx.shadowBlur = 0;
              ctx.restore();
              ctx.globalAlpha = 1;
            },
          });
        }
      },

      // 17 — כְּפוּלִי — Mirror split (particles fly left & right symmetrically)
      17: (cx, cy, w, h, color) => {
        for (let i = 0; i < 20; i++) {
          const angle = this._rand(0, Math.PI);
          const speed = this._rand(100, 250);
          const size = this._rand(3, 7);
          const life = this._rand(1, 2);
          // Left particle
          this._addParticle({
            x: cx, y: cy,
            vx: -Math.cos(angle) * speed,
            vy: -Math.sin(angle) * speed,
            size, life, maxLife: life,
            color,
            update(p, dt) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 80 * dt; },
            draw(ctx, p) {
              const alpha = Math.max(0, p.life / p.maxLife);
              ctx.globalAlpha = alpha;
              ctx.beginPath();
              ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
              ctx.fillStyle = p.color;
              ctx.shadowColor = p.color;
              ctx.shadowBlur = 8;
              ctx.fill();
              ctx.shadowBlur = 0;
              ctx.globalAlpha = 1;
            },
          });
          // Right particle (mirrored)
          this._addParticle({
            x: cx, y: cy,
            vx: Math.cos(angle) * speed,
            vy: -Math.sin(angle) * speed,
            size, life, maxLife: life,
            color,
            update(p, dt) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 80 * dt; },
            draw(ctx, p) {
              const alpha = Math.max(0, p.life / p.maxLife);
              ctx.globalAlpha = alpha;
              ctx.beginPath();
              ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
              ctx.fillStyle = p.color;
              ctx.shadowColor = p.color;
              ctx.shadowBlur = 8;
              ctx.fill();
              ctx.shadowBlur = 0;
              ctx.globalAlpha = 1;
            },
          });
        }
      },

      // 18 — נוֹבָה — Nova explosion (expanding ring + sparks)
      18: (cx, cy, w, h, color) => {
        // Expanding ring
        this._addParticle({
          x: cx, y: cy,
          size: 5,
          life: 1.2,
          maxLife: 1.2,
          maxSize: Math.max(w, h) * 0.4,
          color,
          update(p, dt) {
            const t = 1 - (p.life / p.maxLife);
            p.size = 5 + t * p.maxSize;
          },
          draw(ctx, p) {
            const alpha = Math.max(0, p.life / p.maxLife) * 0.5;
            ctx.globalAlpha = alpha;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.strokeStyle = p.color;
            ctx.lineWidth = 4;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 20;
            ctx.stroke();
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1;
          },
        });
        // Sparks
        for (let i = 0; i < 30; i++) {
          const angle = this._rand(0, Math.PI * 2);
          const speed = this._rand(200, 500);
          this._addParticle({
            x: cx, y: cy,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: this._rand(2, 5),
            life: this._rand(0.5, 1),
            maxLife: 1,
            color,
            update(p, dt) {
              p.x += p.vx * dt;
              p.y += p.vy * dt;
              p.vx *= 0.95;
              p.vy *= 0.95;
            },
            draw(ctx, p) {
              const alpha = Math.max(0, p.life / p.maxLife);
              ctx.globalAlpha = alpha;
              ctx.beginPath();
              ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
              ctx.fillStyle = p.color;
              ctx.shadowColor = '#fff';
              ctx.shadowBlur = 8;
              ctx.fill();
              ctx.shadowBlur = 0;
              ctx.globalAlpha = 1;
            },
          });
        }
      },

      // 19 — טַבַּעְתִּי — Expanding rings (concentric)
      19: (cx, cy, w, h, color) => {
        for (let i = 0; i < 6; i++) {
          this._addParticle({
            x: cx, y: cy,
            size: 0,
            life: this._rand(1.5, 2.5),
            maxLife: 2.5,
            maxSize: this._rand(60, 150),
            delay: i * 0.2,
            color,
            update(p, dt) {
              if (p.delay > 0) { p.delay -= dt; return; }
              const t = 1 - (p.life / p.maxLife);
              p.size = t * p.maxSize;
            },
            draw(ctx, p) {
              if (p.delay > 0) return;
              const alpha = Math.max(0, p.life / p.maxLife) * 0.6;
              ctx.globalAlpha = alpha;
              ctx.beginPath();
              ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
              ctx.strokeStyle = p.color;
              ctx.lineWidth = 2;
              ctx.shadowColor = p.color;
              ctx.shadowBlur = 10;
              ctx.stroke();
              ctx.shadowBlur = 0;
              ctx.globalAlpha = 1;
            },
          });
        }
      },

      // 20 — אַלּוּפִי — Gold confetti celebration
      20: (cx, cy, w, h, color) => {
        const colors = ['#ffd700', '#ffaa00', '#fff', '#ff6600', '#ffd700'];
        for (let i = 0; i < 60; i++) {
          const angle = this._rand(0, Math.PI * 2);
          const speed = this._rand(150, 400);
          this._addParticle({
            x: cx, y: cy,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 100,
            size: this._rand(4, 10),
            life: this._rand(1, 2.5),
            maxLife: 2.5,
            rotation: this._rand(0, Math.PI * 2),
            rotSpeed: this._rand(-8, 8),
            color: colors[this._randInt(0, colors.length - 1)],
            isSquare: Math.random() > 0.5,
            update(p, dt) {
              p.x += p.vx * dt;
              p.y += p.vy * dt;
              p.vy += 200 * dt;
              p.rotation += p.rotSpeed * dt;
              p.vx *= 0.98;
            },
            draw(ctx, p) {
              const alpha = Math.max(0, p.life / p.maxLife);
              ctx.save();
              ctx.translate(p.x, p.y);
              ctx.rotate(p.rotation);
              ctx.globalAlpha = alpha;
              ctx.fillStyle = p.color;
              ctx.shadowColor = p.color;
              ctx.shadowBlur = 5;
              if (p.isSquare) {
                ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
              } else {
                ctx.beginPath();
                ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
                ctx.fill();
              }
              ctx.shadowBlur = 0;
              ctx.restore();
              ctx.globalAlpha = 1;
            },
          });
        }
      },
    };
  }
}

/** Singleton instance */
const alienEffects = new AlienEffects();
export default alienEffects;
