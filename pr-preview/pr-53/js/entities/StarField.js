// StarField.js — רקע כוכבים עם פרלקס + ערפיליות צבעוניות

export default class StarField {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.layers = [];
    this.tintColor = '#ffffff';
    this.nebulaColor = 'rgba(100, 100, 255, 0.05)';
    this._createLayers();
  }

  _createLayers() {
    this.layers = [
      this._createStarLayer(80, 0.3, 1.0, 0.4),   // Far: many, small, slow, dim
      this._createStarLayer(40, 0.8, 1.8, 0.7),    // Medium
      this._createStarLayer(20, 1.5, 2.5, 1.0),    // Near: fewer, bigger, fast, bright
    ];
  }

  _createStarLayer(count, minSize, maxSize, brightness) {
    const stars = [];
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: minSize + Math.random() * (maxSize - minSize),
        brightness,
        twinkleOffset: Math.random() * Math.PI * 2,
        twinkleSpeed: 1 + Math.random() * 3,
      });
    }
    return { stars, speed: brightness * 30 }; // speed proportional to brightness/nearness
  }

  setTheme(theme) {
    this.tintColor = theme.starTint || '#ffffff';
    this.nebulaColor = theme.nebulaColor || 'rgba(100, 100, 255, 0.05)';
  }

  resize(width, height) {
    const scaleX = width / this.width;
    const scaleY = height / this.height;
    this.width = width;
    this.height = height;
    for (const layer of this.layers) {
      for (const star of layer.stars) {
        star.x *= scaleX;
        star.y *= scaleY;
      }
    }
  }

  update(dt) {
    for (const layer of this.layers) {
      for (const star of layer.stars) {
        star.y += layer.speed * dt;
        star.twinkleOffset += star.twinkleSpeed * dt;

        // Wrap around
        if (star.y > this.height + 5) {
          star.y = -5;
          star.x = Math.random() * this.width;
        }
      }
    }
  }

  render(ctx) {
    // Draw nebula blobs (soft glowing ellipses in the background)
    ctx.save();
    ctx.globalAlpha = 1;
    ctx.fillStyle = this.nebulaColor;
    ctx.filter = 'blur(60px)';
    ctx.beginPath();
    ctx.ellipse(this.width * 0.3, this.height * 0.4, 200, 120, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(this.width * 0.7, this.height * 0.6, 150, 100, -0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(this.width * 0.5, this.height * 0.2, 120, 80, 0.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Draw stars with theme tint
    for (const layer of this.layers) {
      for (const star of layer.stars) {
        const twinkle = 0.5 + 0.5 * Math.sin(star.twinkleOffset);
        const alpha = star.brightness * twinkle;
        const glow = star.size * (1 + twinkle * 0.5);

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.shadowColor = this.tintColor;
        ctx.shadowBlur = glow * 3;
        ctx.fillStyle = this.tintColor;
        ctx.beginPath();
        ctx.arc(star.x, star.y, glow, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
  }
}
