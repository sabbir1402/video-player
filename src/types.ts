export type MediaFormat =
  | 'mkv'
  | 'avi'
  | 'flac'
  | 'mp4'
  | 'webm'
  | 'mov'
  | 'mp3'
  | 'wav'
  | 'ogg'
  | 'aac'
  | 'unknown';

export interface SubtitleCue {
  id: number;
  startTime: number; // in seconds
  endTime: number;   // in seconds
  text: string;
}

export interface SubtitleTrack {
  id: string;
  label: string;
  lang: string;
  format: 'srt' | 'vtt' | 'ass' | 'custom';
  cues: SubtitleCue[];
  isDefault?: boolean;
}

export interface SubtitleSettings {
  isEnabled: boolean;
  fontSize: number; // in px, default 24
  fontFamily: string;
  textColor: string;
  backgroundColor: string;
  bgOpacity: number; // 0 to 100
  textShadow: 'none' | 'subtle' | 'outline' | 'glow';
  positionY: number; // percentage from bottom (e.g. 8%)
  syncOffsetMs: number; // millisecond adjustment
  letterSpacing: number; // px
}

export type SurroundMode =
  | 'stereo'
  | 'surround51'
  | 'surround71'
  | 'spatial_headphones'
  | 'dialogue_boost';

export interface SurroundSettings {
  mode: SurroundMode;
  bassBoost: number; // 0 to 12 dB
  dialogueBoost: number; // 0 to 12 dB
  lfeCutoff: number; // 60 to 160 Hz
  surroundSpread: number; // 0 to 100%
  roomReverb: number; // 0 to 100%
  speakerGains: {
    L: number;
    R: number;
    C: number;
    LFE: number;
    SL: number;
    SR: number;
    BL?: number;
    BR?: number;
  };
  eqPreset: 'flat' | 'cinema' | 'action' | 'dialogue' | 'bass_heavy' | 'music_flac' | 'custom';
  eqBands: number[]; // 10 bands (-12dB to +12dB)
}

export interface VideoEnhancements {
  brightness: number; // 50 to 150 %
  contrast: number; // 50 to 150 %
  saturation: number; // 0 to 200 %
  hue: number; // -180 to 180 deg
  sharpness: number; // 0 to 100 %
  deinterlace: boolean;
  hdrToneMap: boolean;
  aspectRatio: 'original' | '16:9' | '21:9' | '4:3' | 'fill';
  hardwareAccelerated: boolean;
}

export interface MediaItem {
  id: string;
  title: string;
  artist?: string;
  album?: string;
  format: MediaFormat;
  type: 'video' | 'audio';
  src: string; // blob or remote URL
  duration: number; // in seconds
  fileSize?: string;
  resolution?: string; // e.g. "3840x2160 (4K UHD)"
  fps?: number;
  audioChannels: 2 | 6 | 8; // 2=stereo, 6=5.1 surround, 8=7.1 surround
  sampleRate?: number; // e.g. 48000, 96000 (Hi-Res)
  bitDepth?: number; // e.g. 16, 24-bit Hi-Res
  bitrate?: string; // e.g. "28.4 Mbps"
  thumbnail?: string;
  subtitles?: SubtitleTrack[];
  isDemo?: boolean;
}

export interface HardwareInfo {
  isHardwareAccelerated: boolean;
  renderer: string;
  vendor: string;
  maxTextureSize: number;
  webglSupported: boolean;
  webCodecsSupported: boolean;
  audioMaxChannels: number;
}
