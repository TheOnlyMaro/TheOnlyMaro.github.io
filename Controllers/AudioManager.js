export class AudioManager {
  constructor() {
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.3; 
    this.masterGain.connect(this.ctx.destination);
    
    // --- NEW: Separate Channels ---
    this.ambientGain = this.ctx.createGain();
    this.sfxGain = this.ctx.createGain();
    
    // Connect channels to Master
    this.ambientGain.connect(this.masterGain);
    this.sfxGain.connect(this.masterGain);
    
    // Default Levels (0.0 to 1.0)
    this.ambientGain.gain.value = 0.5; 
    this.sfxGain.gain.value = 0.8;

    this.enabled = false;
    this.isMusicPlaying = false;
    this.musicNodes = []; 
  }

  // --- NEW: Volume Setters (0 to 100 input) ---
  setAmbientVolume(value) {
    // Convert 0-100 to 0.0-1.0
    const gain = Math.max(0, Math.min(100, value)) / 100;
    this.ambientGain.gain.value = gain;
  }

  setSFXVolume(value) {
    const gain = Math.max(0, Math.min(100, value)) / 100;
    this.sfxGain.gain.value = gain;
  }
  // -------------------------------------------

  isMusicLoopActive() {
    if (this.ctx.state !== 'running') return false;
    if (!this.isMusicPlaying) return false;
    if (this.musicNodes.length === 0) return false;
    return true;
  }

  async init() {
    if (this.ctx.state === 'suspended') {
        try { await this.ctx.resume(); } catch (e) {}
    }
    this.enabled = true;

    if (!this.isMusicLoopActive()) {
        this.startAmbientMusic();
    }
  }

  startAmbientMusic() {
    this.stopMusic();

    const bufferSize = this.ctx.sampleRate * 5; 
    const buffer = this.ctx.createBuffer(2, bufferSize, this.ctx.sampleRate);
    
    for (let channel = 0; channel < 2; channel++) {
        const data = buffer.getChannelData(channel);
        let lastOut = 0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            lastOut = (lastOut + (0.02 * white)) / 1.02;
            data[i] = lastOut * 3.5;
        }
    }

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = buffer;
    noiseSource.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 150; 

    // Connect to AMBIENT GAIN instead of Master
    noiseSource.connect(filter);
    filter.connect(this.ambientGain); 

    noiseSource.start();
    this.musicNodes = [noiseSource, filter];
    this.isMusicPlaying = true;
  }

  stopMusic() {
    this.musicNodes.forEach(node => {
      try { if(node.stop) node.stop(); node.disconnect(); } catch(e){}
    });
    this.musicNodes = [];
    this.isMusicPlaying = false;
  }

  // --- SFX (Connect to this.sfxGain) ---

  playJump() {
    if (!this.enabled) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.sfxGain); // <--- Changed
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
    gain.connect(this.sfxGain); // <--- Changed
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
    gain.connect(this.sfxGain); // <--- Changed
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(100, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  playDeath() {
    if (!this.enabled) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.sfxGain); // <--- Changed
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(400, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(10, this.ctx.currentTime + 0.8);
    gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.8);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.8);
  }
}

export const audioManager = new AudioManager();