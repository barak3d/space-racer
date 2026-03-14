// AudioManager.js — ניהול סאונד עם Web Audio API (סינתזה בלבד, ללא קבצים חיצוניים)

class AudioManager {
  constructor() {
    this.ctx = null;
    this.muted = this._loadMutedState();
    this.initialized = false;
    this.sounds = {};
    this.bgMusic = null;
    this.bgMusicGain = null;
    this._currentMusicNotes = null;
    this._currentMusicTempo = 1.0;

    // Bind toggle button
    const btn = document.getElementById('sound-toggle');
    if (btn) {
      btn.textContent = this.muted ? '🔇' : '🔊';
      btn.addEventListener('click', () => this.toggleMute());
    }
  }

  _ensureContext() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    this.initialized = true;
  }

  toggleMute() {
    this._ensureContext();
    this.muted = !this.muted;
    this._saveMutedState();
    const btn = document.getElementById('sound-toggle');
    if (btn) {
      btn.textContent = this.muted ? '🔇' : '🔊';
    }
    if (this.bgMusicGain) {
      this.bgMusicGain.gain.value = this.muted ? 0 : 0.15;
    }
  }

  play(soundName) {
    if (this.muted) return;
    this._ensureContext();

    switch (soundName) {
      case 'correct': this._playCorrect(); break;
      case 'wrong': this._playWrong(); break;
      case 'boost': this._playBoost(); break;
      case 'countdown': this._playCountdown(); break;
      case 'victory': this._playVictory(); break;
      case 'alien-collect': this._playAlienCollect(); break;
      case 'click': this._playClick(); break;
      case 'tick': this._playTick(); break;
      case 'whoosh': this._playWhoosh(); break;
    }
  }

  startBgMusic() {
    if (!this.ctx) this._ensureContext();
    if (this.bgMusic) return;

    // Create a simple ambient space loop using oscillators
    this.bgMusicGain = this.ctx.createGain();
    this.bgMusicGain.gain.value = this.muted ? 0 : 0.15;
    this.bgMusicGain.connect(this.ctx.destination);

    this._loopAmbient();
  }

  stopBgMusic() {
    if (this.bgMusic) {
      try { this.bgMusic.stop(); } catch (e) { /* ignore */ }
      this.bgMusic = null;
    }
  }

  setStationMusic(theme) {
    this.stopBgMusic();
    if (!theme) return;

    this._currentMusicNotes = theme.musicNotes || null;
    this._currentMusicTempo = theme.musicTempo || 1.0;

    // Restart ambient loop with new notes/tempo
    if (!this.muted && this.bgMusicGain) {
      this._loopAmbient();
    }
  }

  _loopAmbient() {
    if (!this.ctx || this.ctx.state === 'closed') return;

    const now = this.ctx.currentTime;

    // Use dynamic notes/tempo from current theme, or default C major
    const notes = this._currentMusicNotes || [130.81, 164.81, 196.00, 261.63];
    const tempo = this._currentMusicTempo || 1.0;
    const duration = 8 / tempo;

    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.value = freq;

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.03, now + 1);
      gain.gain.setValueAtTime(0.03, now + duration - 2);
      gain.gain.linearRampToValueAtTime(0, now + duration);

      osc.connect(gain);
      gain.connect(this.bgMusicGain);

      osc.start(now + i * 0.2);
      osc.stop(now + duration + 0.5);

      if (i === 0) {
        this.bgMusic = osc;
        osc.onended = () => {
          if (!this.muted) this._loopAmbient();
        };
      }
    });
  }

  _playCorrect() {
    const now = this.ctx.currentTime;
    // Happy ascending chime
    [523.25, 659.25, 783.99].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.3, now + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.4);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 0.5);
    });
  }

  _playWrong() {
    const now = this.ctx.currentTime;
    // Descending buzz
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.linearRampToValueAtTime(100, now + 0.3);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.5);
  }

  _playBoost() {
    const now = this.ctx.currentTime;
    // Rising whoosh
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.3);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.6);

    // White noise for whoosh texture
    this._playNoiseBurst(now, 0.3, 0.1);
  }

  _playCountdown() {
    const now = this.ctx.currentTime;
    // Single beep
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  _playVictory() {
    const now = this.ctx.currentTime;
    // Fanfare: ascending arpegio
    const notes = [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = i < 4 ? 'triangle' : 'sine';
      osc.frequency.value = freq;
      const start = now + i * 0.15;
      gain.gain.setValueAtTime(0.2, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + (i === 5 ? 1 : 0.3));
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(start);
      osc.stop(start + (i === 5 ? 1.1 : 0.4));
    });
  }

  _playAlienCollect() {
    const now = this.ctx.currentTime;
    // Sparkle sound: quick high notes
    [1318.5, 1568, 2093, 2637].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const start = now + i * 0.08;
      gain.gain.setValueAtTime(0.15, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.2);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(start);
      osc.stop(start + 0.25);
    });
  }

  _playClick() {
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 600;
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.1);
  }

  _playTick() {
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 1000;
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.06);
  }

  _playWhoosh() {
    const now = this.ctx.currentTime;
    this._playNoiseBurst(now, 0.4, 0.15);
  }

  _loadMutedState() {
    try {
      const stored = localStorage.getItem('starRace_musicMuted');
      return stored === null ? true : stored === 'true';
    } catch (e) {
      return true;
    }
  }

  _saveMutedState() {
    try {
      localStorage.setItem('starRace_musicMuted', String(this.muted));
    } catch (e) { /* ignore */ }
  }

  _playNoiseBurst(startTime, duration, volume) {
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.5;
    }
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    // High-pass filter to make it more "airy"
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 2000;

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    source.start(startTime);
    source.stop(startTime + duration + 0.1);
  }
}

// Singleton
const audioManager = new AudioManager();
export default audioManager;
