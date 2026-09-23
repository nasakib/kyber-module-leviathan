// Web Audio API Procedural Synthesizer for VectorForge: The Coordinate Engine

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private bgOsc: OscillatorNode | null = null;
  private bgGain: GainNode | null = null;

  public init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    this.startBackgroundHum();
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.bgGain && this.ctx) {
      this.bgGain.gain.setValueAtTime(muted ? 0 : 0.03, this.ctx.currentTime);
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  private startBackgroundHum() {
    if (!this.ctx || this.bgOsc || this.isMuted) return;

    try {
      this.bgOsc = this.ctx.createOscillator();
      this.bgGain = this.ctx.createGain();

      this.bgOsc.type = 'sine';
      this.bgOsc.frequency.setValueAtTime(65.41, this.ctx.currentTime); // C2 low ambient hum

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(150, this.ctx.currentTime);

      this.bgGain.gain.setValueAtTime(0.03, this.ctx.currentTime);

      this.bgOsc.connect(filter);
      filter.connect(this.bgGain);
      this.bgGain.connect(this.ctx.destination);

      this.bgOsc.start();
    } catch {
      // Audio fallback
    }
  }

  // Laser firing ignition snap
  public playBeamSnap() {
    if (!this.ctx || this.isMuted) return;
    this.init();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1800, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.22);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.22);
  }

  // Interactive slider tweak micro-tone
  public playSliderTick() {
    if (!this.ctx || this.isMuted) return;
    this.init();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.04);

    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.04);
  }

  // Harmonic chime when an energy target is struck in sequence
  public playTargetHit(index: number = 0) {
    if (!this.ctx || this.isMuted) return;
    this.init();

    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // Pentatonic scale degrees: C, D, E, G, A, C...
    const scale = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50, 1174.66, 1318.51];
    const baseFreq = scale[index % scale.length];

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(baseFreq, now);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(baseFreq * 2, now); // Octave overtone

    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.35);
    osc2.stop(now + 0.35);
  }

  // Obstacle impact thud
  public playObstacleClang() {
    if (!this.ctx || this.isMuted) return;
    this.init();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(55, now + 0.18);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.18);
  }

  // Level cleared victory fanfare (cyberpunk synth arpeggio)
  public playVictoryFanfare() {
    if (!this.ctx || this.isMuted) return;
    this.init();

    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98]; // C major triad upward flourish
    const now = this.ctx.currentTime;

    notes.forEach((freq, i) => {
      if (!this.ctx) return;
      const noteTime = now + i * 0.08;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.22, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 0.4);
    });
  }

  // Error / Warning tone for singular matrices or illegal states
  public playErrorBuzz() {
    if (!this.ctx || this.isMuted) return;
    this.init();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.setValueAtTime(130, now + 0.1);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  // Futuristic frequency rise tone
  public playLaserCharge() {
    if (!this.ctx || this.isMuted) return;
    this.init();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(900, now + 0.15);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  // 1. Rotary dial detent tick: crisp 1200Hz mechanical impulse
  public playDetentTick() {
    if (!this.ctx || this.isMuted) return;
    this.init();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.025);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.025);
  }

  // 2. Heavy metal rocker switch click: dual-frequency snap (120Hz click + 2200Hz metallic release)
  public playSwitchClick() {
    if (!this.ctx || this.isMuted) return;
    this.init();

    const now = this.ctx.currentTime;
    // Low thud
    const oscLow = this.ctx.createOscillator();
    const gainLow = this.ctx.createGain();
    oscLow.type = 'square';
    oscLow.frequency.setValueAtTime(120, now);
    oscLow.frequency.exponentialRampToValueAtTime(40, now + 0.04);
    gainLow.gain.setValueAtTime(0.2, now);
    gainLow.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    oscLow.connect(gainLow);
    gainLow.connect(this.ctx.destination);
    oscLow.start(now);
    oscLow.stop(now + 0.04);

    // High metallic ping
    const oscHigh = this.ctx.createOscillator();
    const gainHigh = this.ctx.createGain();
    oscHigh.type = 'triangle';
    oscHigh.frequency.setValueAtTime(2200, now);
    oscHigh.frequency.exponentialRampToValueAtTime(800, now + 0.06);
    gainHigh.gain.setValueAtTime(0.12, now);
    gainHigh.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
    oscHigh.connect(gainHigh);
    gainHigh.connect(this.ctx.destination);
    oscHigh.start(now);
    oscHigh.stop(now + 0.06);
  }

  // 3. Acoustic resonance hum: clarifies as deltaOmega -> 0
  public playResonanceHum(deltaOmega: number) {
    if (!this.ctx || this.isMuted) return;
    this.init();

    const absDiff = Math.abs(deltaOmega);
    const closeness = Math.max(0, 1 - Math.min(absDiff / 4, 1)); // 0 to 1
    const baseFreq = 220; // A3
    const detune = absDiff * 15; // detuning in Hz

    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(baseFreq, now);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(baseFreq + detune, now);

    const volume = 0.02 + closeness * 0.12;
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.15);
    osc2.stop(now + 0.15);
  }

  // 4. Academic promotion: ascending synth harp glissando
  public playAcademicPromotion() {
    if (!this.ctx || this.isMuted) return;
    this.init();

    const notes = [440, 554.37, 659.25, 830.61, 880, 1108.73, 1318.51, 1760]; // A major 9th glissando
    const now = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const noteTime = now + idx * 0.06;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.18, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.5);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 0.5);
    });
  }
}

export const soundEngine = new SoundEngine();
