import { SurroundMode, SurroundSettings } from '../types';

export const EQ_FREQUENCIES = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];

export const EQ_PRESETS: Record<string, number[]> = {
  flat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  cinema: [4, 3, 1, -1, -1, 1, 3, 4, 3, 2],
  action: [6, 4, 2, 0, -1, 0, 2, 4, 5, 4],
  dialogue: [-3, -2, -1, 1, 3, 5, 4, 2, 0, -1],
  bass_heavy: [8, 7, 5, 3, 1, 0, 0, 0, 0, 0],
  music_flac: [3, 2, 0, -1, 0, 1, 2, 3, 4, 4],
};

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private mediaElement: HTMLMediaElement | null = null;

  // Master Gain & Analyser
  private masterGain: GainNode | null = null;
  private masterAnalyser: AnalyserNode | null = null;

  // 10-Band Graphic EQ
  private eqFilters: BiquadFilterNode[] = [];

  // Dialogue & Bass enhancements
  private dialogueFilter: BiquadFilterNode | null = null;
  private lfeLowpass: BiquadFilterNode | null = null;
  private lfeGain: GainNode | null = null;

  // Surround Sound Matrix & Channel Processors
  private splitter: ChannelSplitterNode | null = null;
  private merger: ChannelMergerNode | null = null;

  // Virtual speaker gains
  private speakerGainNodes: { [key: string]: GainNode } = {};
  // Per-channel analysers for VU meters (L, R, C, LFE, SL, SR)
  private channelAnalysers: { [key: string]: AnalyserNode } = {};

  // Reverb simulation
  private reverbConvolver: ConvolverNode | null = null;
  private reverbGain: GainNode | null = null;

  // Surround delay and phase inverter for rear channels
  private surroundDelay: DelayNode | null = null;
  private surroundLowpass: BiquadFilterNode | null = null;
  private surroundGain: GainNode | null = null;

  // Spatial Panner for 3D Headphone mode
  private pannerNode: PannerNode | null = null;

  private isInitialized = false;

  public init(mediaEl: HTMLMediaElement): boolean {
    if (this.isInitialized && this.mediaElement === mediaEl) {
      return true;
    }

    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return false;

      this.ctx = new AudioContextClass();
      this.mediaElement = mediaEl;

      // Handle element connection safely
      try {
        this.sourceNode = this.ctx.createMediaElementSource(mediaEl);
      } catch (e) {
        console.warn('Media element source already created or error:', e);
        return false;
      }

      this.buildAudioGraph();
      this.isInitialized = true;
      return true;
    } catch (err) {
      console.error('Failed to initialize Web Audio Engine:', err);
      return false;
    }
  }

  private buildAudioGraph() {
    if (!this.ctx || !this.sourceNode) return;

    // 1. Master Gain & Master Analyser
    this.masterGain = this.ctx.createGain();
    this.masterAnalyser = this.ctx.createAnalyser();
    this.masterAnalyser.fftSize = 256;
    this.masterAnalyser.smoothingTimeConstant = 0.8;

    // 2. 10-Band Graphic Equalizer
    this.eqFilters = EQ_FREQUENCIES.map((freq, index) => {
      const filter = this.ctx!.createBiquadFilter();
      if (index === 0) {
        filter.type = 'lowshelf';
      } else if (index === EQ_FREQUENCIES.length - 1) {
        filter.type = 'highshelf';
      } else {
        filter.type = 'peaking';
        filter.Q.value = 1.4;
      }
      filter.frequency.value = freq;
      filter.gain.value = 0;
      return filter;
    });

    // 3. Dialogue Enhancer (peaking at 2.5kHz - voice presence)
    this.dialogueFilter = this.ctx.createBiquadFilter();
    this.dialogueFilter.type = 'peaking';
    this.dialogueFilter.frequency.value = 2500;
    this.dialogueFilter.Q.value = 1.0;
    this.dialogueFilter.gain.value = 0;

    // 4. LFE Subwoofer Channel Processor (< 120Hz lowpass)
    this.lfeLowpass = this.ctx.createBiquadFilter();
    this.lfeLowpass.type = 'lowpass';
    this.lfeLowpass.frequency.value = 120;
    this.lfeLowpass.Q.value = 1.2;

    this.lfeGain = this.ctx.createGain();
    this.lfeGain.gain.value = 1.0;

    // 5. Surround / Rear Channel Delay & Filter (Haas effect + high-cut for cinema ambiance)
    this.surroundDelay = this.ctx.createDelay();
    this.surroundDelay.delayTime.value = 0.020; // 20ms delay

    this.surroundLowpass = this.ctx.createBiquadFilter();
    this.surroundLowpass.type = 'lowpass';
    this.surroundLowpass.frequency.value = 7000;

    this.surroundGain = this.ctx.createGain();
    this.surroundGain.gain.value = 0.8;

    // 6. 3D Spatial Panner Node (for 3D Spatial Headphones)
    if (this.ctx.createPanner) {
      this.pannerNode = this.ctx.createPanner();
      this.pannerNode.panningModel = 'HRTF';
      this.pannerNode.distanceModel = 'inverse';
      this.pannerNode.positionX.value = 0;
      this.pannerNode.positionY.value = 0;
      this.pannerNode.positionZ.value = -1;
    }

    // 7. Synthetic Room Reverb
    this.reverbGain = this.ctx.createGain();
    this.reverbGain.gain.value = 0.0;
    this.setupSyntheticImpulseResponse();

    // 8. Speaker Channel Gains & Analysers for 5.1/7.1 simulation (L, R, C, LFE, SL, SR, BL, BR)
    const channels = ['L', 'R', 'C', 'LFE', 'SL', 'SR', 'BL', 'BR'];
    channels.forEach((ch) => {
      const g = this.ctx!.createGain();
      g.gain.value = 1.0;
      this.speakerGainNodes[ch] = g;

      const a = this.ctx!.createAnalyser();
      a.fftSize = 64;
      a.smoothingTimeConstant = 0.6;
      this.channelAnalysers[ch] = a;
      g.connect(a);
    });

    // Connect EQ chain: source -> eq[0] -> eq[1] ... -> eq[9] -> dialogueFilter
    let prevNode: AudioNode = this.sourceNode;
    for (const filter of this.eqFilters) {
      prevNode.connect(filter);
      prevNode = filter;
    }
    prevNode.connect(this.dialogueFilter);

    // From dialogueFilter, connect to:
    // a) Subwoofer branch (LFE)
    this.dialogueFilter.connect(this.lfeLowpass);
    this.lfeLowpass.connect(this.lfeGain);
    this.lfeGain.connect(this.speakerGainNodes['LFE']);

    // b) Left and Right Front Speakers
    this.dialogueFilter.connect(this.speakerGainNodes['L']);
    this.dialogueFilter.connect(this.speakerGainNodes['R']);

    // c) Center channel
    this.dialogueFilter.connect(this.speakerGainNodes['C']);

    // d) Surround Rear branch (delay + lowpass)
    this.dialogueFilter.connect(this.surroundDelay);
    this.surroundDelay.connect(this.surroundLowpass);
    this.surroundLowpass.connect(this.surroundGain);
    this.surroundGain.connect(this.speakerGainNodes['SL']);
    this.surroundGain.connect(this.speakerGainNodes['SR']);
    this.surroundGain.connect(this.speakerGainNodes['BL']);
    this.surroundGain.connect(this.speakerGainNodes['BR']);

    // e) Reverb branch
    if (this.reverbConvolver) {
      this.dialogueFilter.connect(this.reverbConvolver);
      this.reverbConvolver.connect(this.reverbGain);
      this.reverbGain.connect(this.masterGain);
    }

    // Connect all speaker gains to masterGain
    this.speakerGainNodes['L'].connect(this.masterGain);
    this.speakerGainNodes['R'].connect(this.masterGain);
    this.speakerGainNodes['C'].connect(this.masterGain);
    this.speakerGainNodes['LFE'].connect(this.masterGain);
    this.speakerGainNodes['SL'].connect(this.masterGain);
    this.speakerGainNodes['SR'].connect(this.masterGain);
    this.speakerGainNodes['BL'].connect(this.masterGain);
    this.speakerGainNodes['BR'].connect(this.masterGain);

    // Master -> Master Analyser -> Destination
    this.masterGain.connect(this.masterAnalyser);
    this.masterAnalyser.connect(this.ctx.destination);
  }

  private setupSyntheticImpulseResponse() {
    if (!this.ctx) return;
    try {
      const rate = this.ctx.sampleRate;
      const length = rate * 1.5; // 1.5 sec room tail
      const decay = 2.0;
      const impulse = this.ctx.createBuffer(2, length, rate);
      const left = impulse.getChannelData(0);
      const right = impulse.getChannelData(1);

      for (let i = 0; i < length; i++) {
        const n = length - i;
        left[i] = (Math.random() * 2 - 1) * Math.pow(n / length, decay);
        right[i] = (Math.random() * 2 - 1) * Math.pow(n / length, decay);
      }

      this.reverbConvolver = this.ctx.createConvolver();
      this.reverbConvolver.buffer = impulse;
    } catch (e) {
      console.warn('Impulse response error:', e);
    }
  }

  public async resumeContext(): Promise<void> {
    if (this.ctx && this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
  }

  public applySurroundSettings(settings: SurroundSettings) {
    if (!this.ctx) return;

    // Apply 10-band EQ
    settings.eqBands.forEach((gainVal, idx) => {
      if (this.eqFilters[idx]) {
        this.eqFilters[idx].gain.setTargetAtTime(gainVal, this.ctx!.currentTime, 0.05);
      }
    });

    // Dialogue boost
    if (this.dialogueFilter) {
      const dGain = settings.mode === 'dialogue_boost' ? settings.dialogueBoost + 4 : settings.dialogueBoost;
      this.dialogueFilter.gain.setTargetAtTime(dGain, this.ctx.currentTime, 0.05);
    }

    // LFE Subwoofer cutoff & gain
    if (this.lfeLowpass && this.lfeGain) {
      this.lfeLowpass.frequency.setTargetAtTime(settings.lfeCutoff, this.ctx.currentTime, 0.05);
      // Map bassBoost dB to linear gain: +0dB = 1.0, +12dB = ~4.0
      const linearBass = Math.pow(10, settings.bassBoost / 20);
      this.lfeGain.gain.setTargetAtTime(linearBass, this.ctx.currentTime, 0.05);
    }

    // Room Reverb
    if (this.reverbGain) {
      this.reverbGain.gain.setTargetAtTime((settings.roomReverb / 100) * 0.4, this.ctx.currentTime, 0.05);
    }

    // Surround spread & mode routing
    const spread = settings.surroundSpread / 100;
    const isStereo = settings.mode === 'stereo';
    const is51 = settings.mode === 'surround51';
    const is71 = settings.mode === 'surround71';
    const isSpatial = settings.mode === 'spatial_headphones';

    // Channel gains calculation
    const gL = settings.speakerGains.L;
    const gR = settings.speakerGains.R;
    const gC = isStereo ? 0 : settings.speakerGains.C;
    const gLFE = settings.speakerGains.LFE;
    const gSL = isStereo ? 0 : settings.speakerGains.SL * (0.5 + 0.5 * spread);
    const gSR = isStereo ? 0 : settings.speakerGains.SR * (0.5 + 0.5 * spread);
    const gBL = is71 ? (settings.speakerGains.BL ?? 1.0) * spread : 0;
    const gBR = is71 ? (settings.speakerGains.BR ?? 1.0) * spread : 0;

    const setGain = (ch: string, val: number) => {
      if (this.speakerGainNodes[ch]) {
        this.speakerGainNodes[ch].gain.setTargetAtTime(val, this.ctx!.currentTime, 0.05);
      }
    };

    setGain('L', gL);
    setGain('R', gR);
    setGain('C', gC);
    setGain('LFE', gLFE);
    setGain('SL', gSL);
    setGain('SR', gSR);
    setGain('BL', gBL);
    setGain('BR', gBR);

    // In spatial headphones mode, tweak delay and frequency
    if (this.surroundDelay && this.surroundGain) {
      if (isSpatial) {
        this.surroundDelay.delayTime.setTargetAtTime(0.028, this.ctx.currentTime, 0.05);
        this.surroundGain.gain.setTargetAtTime(1.1, this.ctx.currentTime, 0.05);
      } else {
        this.surroundDelay.delayTime.setTargetAtTime(0.018, this.ctx.currentTime, 0.05);
        this.surroundGain.gain.setTargetAtTime(0.85, this.ctx.currentTime, 0.05);
      }
    }
  }

  public getMasterFrequencyData(array: Uint8Array): void {
    if (this.masterAnalyser) {
      this.masterAnalyser.getByteFrequencyData(array);
    }
  }

  public getMasterTimeDomainData(array: Uint8Array): void {
    if (this.masterAnalyser) {
      this.masterAnalyser.getByteTimeDomainData(array);
    }
  }

  /**
   * Returns instantaneous normalized RMS/Peak level (0 to 1) for a speaker channel
   */
  public getChannelLevel(channel: string): number {
    const analyser = this.channelAnalysers[channel];
    if (!analyser) return 0;
    const buffer = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(buffer);
    let sum = 0;
    for (let i = 0; i < buffer.length; i++) {
      sum += buffer[i];
    }
    const avg = sum / (buffer.length || 1);
    return Math.min(1, avg / 180);
  }

  public destroy() {
    if (this.ctx && this.ctx.state !== 'closed') {
      try {
        this.ctx.close();
      } catch (e) {
        console.warn('Error closing audio context:', e);
      }
    }
    this.isInitialized = false;
    this.ctx = null;
    this.sourceNode = null;
  }
}

export const audioEngine = new AudioEngine();
