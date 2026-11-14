// Процедурные звуки через Web Audio API.
// Никаких внешних ассетов — всё синтезируется.

class SoundManager {
  private ctx: AudioContext | null = null;
  private sfxVolume = 0.6;
  private musicVolume = 0.35;
  private musicNode: OscillatorNode | null = null;
  private musicGain: GainNode | null = null;

  private ensureCtx(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      try {
        const Ctor = window.AudioContext || (window as any).webkitAudioContext;
        this.ctx = new Ctor();
      } catch {
        return null;
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  setVolumes(sfx: number, music: number) {
    this.sfxVolume = sfx;
    this.musicVolume = music;
    if (this.musicGain) this.musicGain.gain.value = music * 0.15;
  }

  private playNoise(duration: number, freq: number, filterType: BiquadFilterType = 'lowpass', gain = 0.5) {
    const ctx = this.ensureCtx();
    if (!ctx || this.sfxVolume <= 0) return;
    const buffer = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.5;
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = filterType;
    filter.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.value = gain * this.sfxVolume;
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    src.connect(filter);
    filter.connect(g);
    g.connect(ctx.destination);
    src.start();
    src.stop(ctx.currentTime + duration);
  }

  private playTone(freq: number, duration: number, type: OscillatorType = 'sine', gain = 0.3) {
    const ctx = this.ensureCtx();
    if (!ctx || this.sfxVolume <= 0) return;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.value = gain * this.sfxVolume;
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  }

  click() { this.playTone(520, 0.06, 'square', 0.12); }
  hover() { this.playTone(880, 0.04, 'sine', 0.06); }
  paper() { this.playNoise(0.25, 2200, 'highpass', 0.35); }
  flip() { this.playNoise(0.4, 1400, 'bandpass', 0.4); }
  stamp() { this.playTone(140, 0.12, 'square', 0.25); }
  crumple() { this.playNoise(0.3, 3000, 'highpass', 0.5); }
  win() {
    this.playTone(523, 0.15, 'sine', 0.25);
    setTimeout(() => this.playTone(659, 0.15, 'sine', 0.25), 150);
    setTimeout(() => this.playTone(784, 0.25, 'sine', 0.25), 300);
  }
  lose() {
    this.playTone(392, 0.2, 'sine', 0.2);
    setTimeout(() => this.playTone(294, 0.35, 'sine', 0.2), 200);
  }

  startMusic() {
    const ctx = this.ensureCtx();
    if (!ctx || this.musicNode) return;
    // Простой дрон — мягкий фон
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 130.81; // C3
    gain.gain.value = this.musicVolume * 0.12;
    // лёгкая модуляция
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 0.12;
    lfoGain.gain.value = 0.03;
    lfo.connect(lfoGain);
    lfoGain.connect(gain.gain);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    lfo.start();
    this.musicNode = osc;
    this.musicGain = gain;
  }

  stopMusic() {
    if (this.musicNode) {
      try { this.musicNode.stop(); } catch {}
      this.musicNode = null;
    }
    if (this.musicGain) {
      try { this.musicGain.disconnect(); } catch {}
      this.musicGain = null;
    }
  }
}

export const soundManager = new SoundManager();