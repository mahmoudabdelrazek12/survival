export class SoundSynthesizer {
  private static ctx: AudioContext | null = null;
  private static engineOsc: OscillatorNode | null = null;
  private static engineGain: GainNode | null = null;
  private static masterGain: GainNode | null = null;
  private static sfxGain: GainNode | null = null;
  private static windNoiseNode: AudioNode | null = null;
  private static windGain: GainNode | null = null;
  private static isInitialized = false;

  private static masterVolume = 0.8;
  private static sfxVolume = 0.8;
  private static engineVolume = 0.5;

  public static init(): void {
    if (this.isInitialized) return;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();

      // Master Gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // SFX Gain
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      // Engine Oscillator & Filter
      this.setupEngineSynth();
      this.setupDesertWind();

      this.isInitialized = true;
    } catch (e) {
      console.warn('Web Audio could not initialize automatically', e);
    }
  }

  public static resumeContext(): void {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    if (!this.isInitialized) {
      this.init();
    }
  }

  private static setupEngineSynth(): void {
    if (!this.ctx || !this.masterGain) return;

    try {
      this.engineOsc = this.ctx.createOscillator();
      this.engineGain = this.ctx.createGain();

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, this.ctx.currentTime);

      this.engineOsc.type = 'sawtooth';
      this.engineOsc.frequency.setValueAtTime(45, this.ctx.currentTime);

      this.engineGain.gain.setValueAtTime(0, this.ctx.currentTime);

      this.engineOsc.connect(filter);
      filter.connect(this.engineGain);
      this.engineGain.connect(this.masterGain);

      this.engineOsc.start();
    } catch (e) {
      console.warn('Failed to start engine synth', e);
    }
  }

  private static setupDesertWind(): void {
    if (!this.ctx || !this.masterGain) return;

    try {
      // Buffer of pink-ish noise for ambient desert breeze
      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        data[i] = (b0 + b1 + b2) * 0.04;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const bandpass = this.ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.setValueAtTime(380, this.ctx.currentTime);
      bandpass.Q.setValueAtTime(1.8, this.ctx.currentTime);

      this.windGain = this.ctx.createGain();
      this.windGain.gain.setValueAtTime(0.08, this.ctx.currentTime);

      noise.connect(bandpass);
      bandpass.connect(this.windGain);
      this.windGain.connect(this.masterGain);

      noise.start();
      this.windNoiseNode = noise;
    } catch (e) {
      // Ignore background wind error gracefully
    }
  }

  public static updateEngine(speedFraction: number, isAccelerating: boolean, isBoosting: boolean): void {
    if (!this.ctx || !this.engineOsc || !this.engineGain) return;

    const basePitch = 45;
    const targetPitch = basePitch + (speedFraction * 130) + (isBoosting ? 60 : 0);
    const targetVolume = (isAccelerating || speedFraction > 0.05) ? (0.08 + speedFraction * 0.18) * this.engineVolume : (0.03 * this.engineVolume);

    const now = this.ctx.currentTime;
    this.engineOsc.frequency.setTargetAtTime(targetPitch, now, 0.08);
    this.engineGain.gain.setTargetAtTime(targetVolume, now, 0.08);
  }

  public static stopEngine(): void {
    if (this.engineGain && this.ctx) {
      this.engineGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.05);
    }
  }

  public static playShoot(type: string): void {
    if (!this.ctx || !this.sfxGain) return;
    this.resumeContext();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    gain.connect(this.sfxGain);
    osc.connect(gain);

    if (type === 'vulcan') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(260 + Math.random() * 40, now);
      osc.frequency.exponentialRampToValueAtTime(70, now + 0.08);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.start(now);
      osc.stop(now + 0.09);
    } else if (type === 'plasma') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.18);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.start(now);
      osc.stop(now + 0.19);
    } else if (type === 'flak') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(35, now + 0.25);

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.start(now);
      osc.stop(now + 0.26);
    } else if (type === 'missile') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.linearRampToValueAtTime(450, now + 0.2);

      gain.gain.setValueAtTime(0.28, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.start(now);
      osc.stop(now + 0.23);
    } else if (type === 'flamethrower') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(100 + Math.random() * 80, now);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

      osc.start(now);
      osc.stop(now + 0.08);
    }
  }

  public static playExplosion(intensity: 'small' | 'large' = 'small'): void {
    if (!this.ctx || !this.sfxGain) return;
    this.resumeContext();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(intensity === 'large' ? 180 : 320, now);
    filter.frequency.linearRampToValueAtTime(40, now + (intensity === 'large' ? 0.6 : 0.3));

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(intensity === 'large' ? 80 : 130, now);
    osc.frequency.exponentialRampToValueAtTime(20, now + (intensity === 'large' ? 0.6 : 0.3));

    const duration = intensity === 'large' ? 0.7 : 0.35;
    gain.gain.setValueAtTime(intensity === 'large' ? 0.5 : 0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + duration + 0.05);
  }

  public static playPickup(type: string): void {
    if (!this.ctx || !this.sfxGain) return;
    this.resumeContext();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.connect(gain);
    gain.connect(this.sfxGain);

    if (type === 'coin') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, now); // B5
      osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.start(now);
      osc.stop(now + 0.23);
    } else if (type === 'fuel') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(240, now);
      osc.frequency.linearRampToValueAtTime(480, now + 0.15);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.start(now);
      osc.stop(now + 0.19);
    } else if (type === 'repair') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.setValueAtTime(659.25, now + 0.06);
      osc.frequency.setValueAtTime(783.99, now + 0.12);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);
      osc.start(now);
      osc.stop(now + 0.27);
    } else {
      // scrap or ammo
      osc.type = 'square';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(660, now + 0.05);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      osc.start(now);
      osc.stop(now + 0.15);
    }
  }

  public static playClick(): void {
    if (!this.ctx || !this.sfxGain) return;
    this.resumeContext();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  public static playZombieGrowl(): void {
    if (!this.ctx || !this.sfxGain) return;
    this.resumeContext();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(240, now);
    filter.frequency.linearRampToValueAtTime(100, now + 0.4);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(90 + Math.random() * 25, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.4);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.45);
  }

  public static playMissileSiren(): void {
    if (!this.ctx || !this.sfxGain) return;
    this.resumeContext();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.linearRampToValueAtTime(950, now + 0.3);
    osc.frequency.linearRampToValueAtTime(400, now + 0.6);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.75);
  }

  public static playMissileImpact(): void {
    if (!this.ctx || !this.sfxGain) return;
    this.resumeContext();
    const now = this.ctx.currentTime;

    // Sub-bass heavy rumble
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(65, now);
    osc.frequency.exponentialRampToValueAtTime(15, now + 1.2);

    gain.gain.setValueAtTime(0.7, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 1.25);
  }

  public static playWarning(): void {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.setValueAtTime(600, now + 0.08);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.17);
  }

  public static setVolumes(master: number, sfx: number, engine: number): void {
    this.masterVolume = master;
    this.sfxVolume = sfx;
    this.engineVolume = engine;

    if (this.ctx && this.masterGain && this.sfxGain) {
      this.masterGain.gain.setValueAtTime(master, this.ctx.currentTime);
      this.sfxGain.gain.setValueAtTime(sfx, this.ctx.currentTime);
    }
  }
}
