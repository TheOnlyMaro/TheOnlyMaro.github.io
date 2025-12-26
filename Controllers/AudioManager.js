export class AudioManager {
  constructor() {
    // Create context but don't assume it's ready
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    
    // Master Volume
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.3; 
    this.masterGain.connect(this.ctx.destination);
    
    this.enabled = false;
    this.isMusicPlaying = false;
    
    // Storage for the drone sounds
    this.musicNodes = []; 
  }

  // Call this on the FIRST click
  async init() {
    // 1. Resume the context (Browser requires this on user gesture)
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
    
    this.enabled = true;
    console.log("🔊 Audio Engine Started. State:", this.ctx.state);

    // 2. Start music only if it's not already running
    if (!this.isMusicPlaying) {
      this.startAmbientMusic();
    }
  }

  startAmbientMusic() {
    if (!this.enabled) return;

    console.log("🎵 Starting Ambient Music...");

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // Settings for "Sci-Fi Drone"
    osc1.frequency.value = 50; 
    osc2.frequency.value = 52; // Slight offset creates the "wub wub" beat
    
    osc1.type = 'sine';
    osc2.type = 'sine';

    gain.gain.value = 0.2; // Volume

    // Connect them up
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.masterGain);

    // Start NOW
    const now = this.ctx.currentTime;
    osc1.start(now);
    osc2.start(now);

    // Store them so they don't get garbage collected (The Fix)
    this.musicNodes.push(osc1, osc2, gain);
    this.isMusicPlaying = true;
  }

  playJump() {
    if (!this.enabled) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.connect(gain);
    gain.connect(this.masterGain);

    // Jump Sound
    osc.type = 'square';
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  playPortalShoot(type) {
    if (!this.enabled) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.connect(gain);
    gain.connect(this.masterGain);

    // Laser Sound
    osc.type = 'sawtooth';
    const startFreq = type === 'blue' ? 880 : 600; 
    osc.frequency.setValueAtTime(startFreq, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.2);

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.2);
  }

  playStep() {
    if (!this.enabled) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.connect(gain);
    gain.connect(this.masterGain);

    // Step Sound (Click)
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(100, this.ctx.currentTime);
    
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }
}

export const audioManager = new AudioManager();