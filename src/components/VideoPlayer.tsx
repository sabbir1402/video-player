import React, { useEffect, useRef, useState } from 'react';
import {
  MediaItem,
  SubtitleCue,
  SubtitleSettings,
  VideoEnhancements,
  HardwareInfo,
} from '../types';
import { getActiveCues } from '../services/subtitleParser';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  Maximize2,
  Cpu,
  Disc,
  Music,
  Radio,
  Tv,
} from 'lucide-react';

interface VideoPlayerProps {
  media: MediaItem | null;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  videoEnhancements: VideoEnhancements;
  subtitleSettings: SubtitleSettings;
  activeCues: SubtitleCue[];
  hardwareInfo: HardwareInfo;
  isPlaying: boolean;
  backgroundAudioEnabled?: boolean;
  onTogglePlay: () => void;
  onToggleFullscreen?: () => void;
  onDropFiles: (files: FileList) => void;
  onTimeUpdate: () => void;
  onLoadedMetadata: () => void;
  onEnded: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  media,
  videoRef,
  videoEnhancements,
  subtitleSettings,
  activeCues,
  hardwareInfo,
  isPlaying,
  backgroundAudioEnabled = true,
  onTogglePlay,
  onToggleFullscreen,
  onDropFiles,
  onTimeUpdate,
  onLoadedMetadata,
  onEnded,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [osdMessage, setOsdMessage] = useState<string | null>(null);
  const osdTimerRef = useRef<number | null>(null);

  const showOsd = (msg: string) => {
    setOsdMessage(msg);
    if (osdTimerRef.current) clearTimeout(osdTimerRef.current);
    osdTimerRef.current = window.setTimeout(() => {
      setOsdMessage(null);
    }, 1200);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onDropFiles(e.dataTransfer.files);
    }
  };

  const lastTouchTimeRef = useRef<number>(0);

  const handleTouchStage = (e: React.TouchEvent) => {
    const now = Date.now();
    if (now - lastTouchTimeRef.current < 320) {
      // Double tap detected: toggle fullscreen
      lastTouchTimeRef.current = 0;
      handleDoubleClick();
    } else {
      lastTouchTimeRef.current = now;
    }
  };

  const handleDoubleClick = () => {
    if (onToggleFullscreen) {
      onToggleFullscreen();
    } else if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Determine aspect ratio class / style
  const getAspectRatioStyle = () => {
    switch (videoEnhancements.aspectRatio) {
      case '16:9':
        return 'aspect-video object-contain';
      case '21:9':
        return 'aspect-[21/9] object-contain';
      case '4:3':
        return 'aspect-[4/3] object-contain';
      case 'fill':
        return 'w-full h-full object-fill';
      default:
        return 'w-full h-full object-contain';
    }
  };

  // Compute CSS video filters (Hardware accelerated compositor)
  const filterString = `
    brightness(${videoEnhancements.brightness}%)
    contrast(${videoEnhancements.contrast}%)
    saturate(${videoEnhancements.saturation}%)
    hue-rotate(${videoEnhancements.hue}deg)
    ${videoEnhancements.sharpness > 0 ? `contrast(${100 + videoEnhancements.sharpness * 0.4}%)` : ''}
    ${videoEnhancements.hdrToneMap ? 'contrast(115%) saturate(120%) brightness(105%)' : ''}
  `.trim();

  // Subtitle text shadow styling
  const getSubShadowStyle = () => {
    switch (subtitleSettings.textShadow) {
      case 'none':
        return 'none';
      case 'subtle':
        return '0 2px 4px rgba(0,0,0,0.8)';
      case 'glow':
        return '0 0 10px rgba(56, 189, 248, 0.8), 0 0 20px rgba(0,0,0,0.9)';
      case 'outline':
      default:
        return '-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000, 0 3px 6px rgba(0,0,0,0.9)';
    }
  };

  return (
    <div
      ref={containerRef}
      id="video-player-container"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative w-full h-full bg-black flex items-center justify-center overflow-hidden select-none group transition-all ${
        isDragging ? 'ring-4 ring-sky-500/80 bg-sky-950/30' : ''
      }`}
    >
      {/* SVG filter for hardware sharpness */}
      <svg className="hidden">
        <filter id="hw-unsharp-mask">
          <feConvolveMatrix
            order="3"
            kernelMatrix="0 -1 0 -1 5 -1 0 -1 0"
            preserveAlpha="true"
          />
        </filter>
      </svg>

      {/* Main Media Player Element */}
      {media ? (
        <>
          {media.type === 'video' ? (
            <div
              className="relative w-full h-full flex items-center justify-center"
              onTouchEnd={handleTouchStage}
            >
              <video
                ref={videoRef}
                id="main-html5-video"
                src={media.src}
                playsInline
                crossOrigin="anonymous"
                onClick={onTogglePlay}
                onDoubleClick={handleDoubleClick}
                onTimeUpdate={onTimeUpdate}
                onLoadedMetadata={onLoadedMetadata}
                onEnded={onEnded}
                className={`${getAspectRatioStyle()} max-h-full cursor-pointer will-change-transform transform-gpu`}
                style={{
                  filter: filterString,
                  transform: 'translate3d(0,0,0)', // forces GPU hardware acceleration layer
                }}
              />

              {/* Deinterlace Scanline Simulation Overlay */}
              {videoEnhancements.deinterlace && (
                <div className="absolute inset-0 pointer-events-none bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.15),rgba(0,0,0,0.15)_1px,transparent_1px,transparent_2px)] mix-blend-overlay" />
              )}
            </div>
          ) : (
            /* Audio Player Showcase View (e.g. FLAC / WAV Studio Master) */
            <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-gradient-to-b from-[#0e131d] via-[#090b10] to-black text-center relative overflow-hidden">
              {/* Background ambient glow */}
              <div className="absolute w-96 h-96 rounded-full bg-sky-500/10 blur-3xl pointer-events-none -top-20 -left-20 animate-pulse" />
              <div className="absolute w-96 h-96 rounded-full bg-purple-500/10 blur-3xl pointer-events-none -bottom-20 -right-20 animate-pulse" />

              {/* Media element for Web Audio graph processing & continuous background audio playback */}
              <audio
                ref={videoRef as any}
                id="main-html5-audio"
                src={media.src}
                playsInline
                crossOrigin="anonymous"
                onTimeUpdate={onTimeUpdate}
                onLoadedMetadata={onLoadedMetadata}
                onEnded={onEnded}
                preload="auto"
                style={{
                  position: 'absolute',
                  width: '1px',
                  height: '1px',
                  opacity: 0.001,
                  pointerEvents: 'none',
                  clip: 'rect(0, 0, 0, 0)',
                }}
              />

              {/* Album Art / Vinyl Spinning Graphic */}
              <div
                onClick={onTogglePlay}
                className="relative group/art cursor-pointer mb-6 transform transition-transform hover:scale-105"
              >
                <div
                  className={`w-48 h-48 md:w-56 md:h-56 rounded-2xl md:rounded-full bg-slate-900 border-4 border-slate-800 shadow-2xl shadow-sky-950/50 flex items-center justify-center overflow-hidden relative ${
                    isPlaying ? 'animate-[spin_12s_linear_infinite]' : ''
                  }`}
                >
                  {media.thumbnail ? (
                    <img
                      src={media.thumbnail}
                      alt={media.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Disc className="w-24 h-24 text-sky-400 opacity-60" />
                  )}

                  {/* Vinyl center hole */}
                  <div className="absolute w-10 h-10 rounded-full bg-black border-2 border-sky-400/50 flex items-center justify-center shadow-inner">
                    <div className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                  </div>
                </div>

                {/* Hover Play/Pause overlay */}
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover/art:opacity-100 transition-opacity">
                  {isPlaying ? (
                    <Pause className="w-12 h-12 text-white" />
                  ) : (
                    <Play className="w-12 h-12 text-white fill-white ml-1" />
                  )}
                </div>
              </div>

              {/* Title & Hi-Res Format Specs */}
              <div className="max-w-xl z-10">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-bold font-mono text-xs border border-sky-500/30">
                    {media.format.toUpperCase()} LOSSLESS
                  </span>
                  <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold font-mono text-xs border border-purple-500/30 flex items-center gap-1">
                    <Radio className="w-3 h-3" />
                    {media.audioChannels === 6 ? '5.1 SURROUND' : 'STUDIO MASTER'}
                  </span>
                  {media.sampleRate && (
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold font-mono text-xs border border-emerald-500/30">
                      {media.sampleRate / 1000} kHz / {media.bitDepth || 24}-Bit
                    </span>
                  )}
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-white mb-1 truncate px-4">
                  {media.title}
                </h2>
                <p className="text-sm text-slate-400 truncate">
                  {media.artist || 'High-Resolution Audio Stream'} • {media.album || 'Lossless Reference'}
                </p>

                {backgroundAudioEnabled && (
                  <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-white/10 text-[11px] text-slate-300 backdrop-blur-md">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Background Playback Ready • Stays Active on Tab Switch</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Subtitle Renderer Overlay */}
          {subtitleSettings.isEnabled && activeCues.length > 0 && (
            <div
              id="subtitles-overlay-container"
              className="absolute left-0 right-0 pointer-events-none flex flex-col items-center justify-end z-20 px-3 sm:px-8 transition-all"
              style={{
                bottom: `${subtitleSettings.positionY}%`,
              }}
            >
              {activeCues.map((cue) => (
                <div
                  key={cue.id}
                  id={`subtitle-cue-${cue.id}`}
                  className="max-w-4xl text-center leading-relaxed transition-all duration-100"
                  style={{
                    fontFamily: subtitleSettings.fontFamily,
                    fontSize: `clamp(13px, 3.8vw, ${subtitleSettings.fontSize}px)`,
                    color: subtitleSettings.textColor,
                    backgroundColor:
                      subtitleSettings.bgOpacity > 0
                        ? `${subtitleSettings.backgroundColor}${Math.round(
                            (subtitleSettings.bgOpacity / 100) * 255
                          )
                            .toString(16)
                            .padStart(2, '0')}`
                        : 'transparent',
                    textShadow: getSubShadowStyle(),
                    letterSpacing: `${subtitleSettings.letterSpacing}px`,
                    padding: subtitleSettings.bgOpacity > 0 ? '4px 12px' : '2px 6px',
                    borderRadius: subtitleSettings.bgOpacity > 0 ? '8px' : '0px',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {cue.text}
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        /* Empty State / Drag & Drop Prompt */
        <div className="flex flex-col items-center justify-center text-center p-4 sm:p-8 max-w-lg z-10">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-br from-sky-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center mb-4 sm:mb-5 shadow-2xl">
            <Tv className="w-8 h-8 sm:w-10 sm:h-10 text-sky-400" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
            No Media Selected
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mb-4 sm:mb-6 leading-relaxed max-w-sm sm:max-w-md">
            Drag & drop any video or audio file here, or click Open in the top bar. Hardware-accelerated playback for MKV, AVI, FLAC, MP4, WebM, and more.
          </p>
          <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center text-[11px] sm:text-xs font-mono text-slate-400">
            <span className="px-2 py-0.5 sm:py-1 bg-slate-900/80 rounded border border-white/10">.MKV</span>
            <span className="px-2 py-0.5 sm:py-1 bg-slate-900/80 rounded border border-white/10">.AVI</span>
            <span className="px-2 py-0.5 sm:py-1 bg-slate-900/80 rounded border border-white/10">.FLAC</span>
            <span className="px-2 py-0.5 sm:py-1 bg-slate-900/80 rounded border border-white/10">.MP4</span>
            <span className="px-2 py-0.5 sm:py-1 bg-slate-900/80 rounded border border-white/10">.SRT/.VTT</span>
          </div>
        </div>
      )}

      {/* Dragging Overlay */}
      {isDragging && (
        <div className="absolute inset-0 bg-sky-950/80 backdrop-blur-sm flex flex-col items-center justify-center z-40 border-4 border-dashed border-sky-400">
          <Tv className="w-16 h-16 text-sky-400 animate-bounce mb-3" />
          <p className="text-lg font-bold text-white">Drop Media or Subtitle Files</p>
          <p className="text-xs text-sky-300 font-mono mt-1">
            MKV, AVI, FLAC, MP4, SRT, VTT supported
          </p>
        </div>
      )}

      {/* Hardware Accel & Codec Badge in Corner */}
      <div className="absolute top-2 sm:top-4 left-2 sm:left-4 z-20 flex items-center gap-1.5 sm:gap-2 opacity-75 group-hover:opacity-100 transition-opacity pointer-events-none">
        {media && (
          <div className="flex items-center gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg bg-black/75 backdrop-blur-md border border-white/10 text-[10px] sm:text-xs font-mono text-slate-200">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold uppercase text-sky-400">{media.format}</span>
            <span className="text-slate-400">•</span>
            <span>{media.resolution || 'UHD'}</span>
          </div>
        )}
      </div>

      {/* On-Screen Display (OSD) Notification */}
      {osdMessage && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-5 py-3 rounded-2xl bg-black/85 backdrop-blur-lg border border-white/20 text-white font-bold text-sm z-30 shadow-2xl flex items-center gap-2 animate-in fade-in zoom-in-95">
          <span>{osdMessage}</span>
        </div>
      )}
    </div>
  );
};
