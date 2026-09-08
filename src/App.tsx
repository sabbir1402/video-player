/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  HardwareInfo,
  MediaItem,
  SubtitleCue,
  SubtitleSettings,
  SubtitleTrack,
  SurroundSettings,
  VideoEnhancements,
} from './types';
import { DEMO_MEDIA_ITEMS } from './data/demoMedia';
import { audioEngine, EQ_PRESETS } from './services/audioEngine';
import { getActiveCues, parseSubtitleFile } from './services/subtitleParser';
import { createMediaItemFromFile, detectHardwareAcceleration } from './services/mediaDetector';
import { Header } from './components/Header';
import { VideoPlayer } from './components/VideoPlayer';
import { PlayerControls } from './components/PlayerControls';
import { AudioVisualizer } from './components/AudioVisualizer';
import { SurroundSoundPanel } from './components/SurroundSoundPanel';
import { SubtitleSettingsModal } from './components/SubtitleSettingsModal';
import { VideoSettingsModal } from './components/VideoSettingsModal';
import { MediaInspectorModal } from './components/MediaInspectorModal';
import { PlaylistDrawer } from './components/PlaylistDrawer';

export default function App() {
  // Playlist & Current Media
  const [playlist, setPlaylist] = useState<MediaItem[]>(DEMO_MEDIA_ITEMS);
  const [currentMedia, setCurrentMedia] = useState<MediaItem | null>(DEMO_MEDIA_ITEMS[0]);

  // Video Element Ref
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Playback State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [isLooping, setIsLooping] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isTheaterMode, setIsTheaterMode] = useState(false);

  // Hardware Acceleration Info
  const [hardwareInfo, setHardwareInfo] = useState<HardwareInfo>({
    isHardwareAccelerated: true,
    renderer: 'Hardware GPU (Direct3D / Metal / WebGL 2.0)',
    vendor: 'Generic',
    maxTextureSize: 16384,
    webglSupported: true,
    webCodecsSupported: true,
    audioMaxChannels: 6,
  });

  // Video Enhancements
  const [videoEnhancements, setVideoEnhancements] = useState<VideoEnhancements>({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    hue: 0,
    sharpness: 15,
    deinterlace: false,
    hdrToneMap: false,
    aspectRatio: 'original',
    hardwareAccelerated: true,
  });

  // Surround Sound & Multichannel Settings
  const [surroundSettings, setSurroundSettings] = useState<SurroundSettings>({
    mode: 'surround51',
    bassBoost: 4,
    dialogueBoost: 3,
    lfeCutoff: 120,
    surroundSpread: 75,
    roomReverb: 12,
    speakerGains: {
      L: 1.0,
      R: 1.0,
      C: 1.1,
      LFE: 1.25,
      SL: 0.95,
      SR: 0.95,
      BL: 0.8,
      BR: 0.8,
    },
    eqPreset: 'cinema',
    eqBands: [...EQ_PRESETS.cinema],
  });

  // Subtitle Settings & Active Tracks
  const [subtitleSettings, setSubtitleSettings] = useState<SubtitleSettings>({
    isEnabled: true,
    fontSize: 24,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    textColor: '#FFFFFF',
    backgroundColor: '#000000',
    bgOpacity: 40,
    textShadow: 'outline',
    positionY: 8,
    syncOffsetMs: 0,
    letterSpacing: 0,
  });

  const [activeTrackId, setActiveTrackId] = useState<string | null>(
    DEMO_MEDIA_ITEMS[0].subtitles?.[0]?.id || null
  );

  // Active cues calculated dynamically
  const [activeCues, setActiveCues] = useState<SubtitleCue[]>([]);

  // Modals & Drawers
  const [isSurroundOpen, setIsSurroundOpen] = useState(false);
  const [isSubSettingsOpen, setIsSubSettingsOpen] = useState(false);
  const [isVideoSettingsOpen, setIsVideoSettingsOpen] = useState(false);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [isPlaylistOpen, setIsPlaylistOpen] = useState(false);

  // Initialize hardware acceleration detection on mount
  useEffect(() => {
    const hw = detectHardwareAcceleration();
    setHardwareInfo(hw);
  }, []);

  // Update audio engine settings whenever surroundSettings change
  useEffect(() => {
    audioEngine.applySurroundSettings(surroundSettings);
  }, [surroundSettings]);

  // Hook up Web Audio API on video element
  const initAudioIfNeeded = useCallback(() => {
    if (videoRef.current) {
      const success = audioEngine.init(videoRef.current);
      if (success) {
        audioEngine.applySurroundSettings(surroundSettings);
      }
      audioEngine.resumeContext().catch(() => {});
    }
  }, [surroundSettings]);

  // Play / Pause Toggle
  const togglePlay = useCallback(async () => {
    if (!videoRef.current) return;

    initAudioIfNeeded();

    if (videoRef.current.paused) {
      try {
        await videoRef.current.play();
        setIsPlaying(true);
      } catch (err) {
        console.warn('Playback play failed:', err);
      }
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, [initAudioIfNeeded]);

  // Seek time
  const handleSeek = (time: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = time;
    setCurrentTime(time);
  };

  // Step Frame / Seconds
  const handleStepFrame = (seconds: number) => {
    if (!videoRef.current) return;
    const target = Math.max(0, Math.min(duration, videoRef.current.currentTime + seconds));
    videoRef.current.currentTime = target;
    setCurrentTime(target);
  };

  // Volume Change
  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (videoRef.current) {
      videoRef.current.volume = newVol;
      videoRef.current.muted = newVol === 0;
    }
    setIsMuted(newVol === 0);
  };

  // Toggle Mute
  const handleToggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    videoRef.current.muted = nextMuted;
  };

  // Playback Rate
  const handlePlaybackRateChange = (rate: number) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
  };

  // Toggle Loop
  const handleToggleLoop = () => {
    const nextLoop = !isLooping;
    setIsLooping(nextLoop);
    if (videoRef.current) {
      videoRef.current.loop = nextLoop;
    }
  };

  // Fullscreen
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(() => {});
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch(() => {});
    }
  };

  // Picture in Picture
  const handleTogglePiP = async () => {
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (document.pictureInPictureEnabled) {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (err) {
      console.warn('PiP error:', err);
    }
  };

  // Time & Subtitle update
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const cur = videoRef.current.currentTime;
    setCurrentTime(cur);

    // Update buffered
    if (videoRef.current.buffered.length > 0) {
      setBuffered(videoRef.current.buffered.end(videoRef.current.buffered.length - 1));
    }

    // Update active subtitles
    if (subtitleSettings.isEnabled && currentMedia?.subtitles && activeTrackId) {
      const track = currentMedia.subtitles.find((t) => t.id === activeTrackId);
      if (track) {
        const cues = getActiveCues(track.cues, cur, subtitleSettings.syncOffsetMs);
        setActiveCues(cues);
      } else {
        setActiveCues([]);
      }
    } else {
      setActiveCues([]);
    }
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration || 0);
    videoRef.current.volume = volume;
    videoRef.current.playbackRate = playbackRate;
    videoRef.current.loop = isLooping;

    // Default subtitles selection if available
    if (currentMedia?.subtitles && currentMedia.subtitles.length > 0 && !activeTrackId) {
      const defaultSub = currentMedia.subtitles.find((s) => s.isDefault) || currentMedia.subtitles[0];
      setActiveTrackId(defaultSub.id);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    // Auto-advance to next in playlist if not looping
    if (!isLooping && playlist.length > 1) {
      const idx = playlist.findIndex((m) => m.id === currentMedia?.id);
      if (idx !== -1 && idx < playlist.length - 1) {
        handleSelectMedia(playlist[idx + 1]);
      }
    }
  };

  // Select a media item
  const handleSelectMedia = (item: MediaItem) => {
    setCurrentMedia(item);
    setCurrentTime(0);
    setBuffered(0);
    setIsPlaying(false);

    if (item.subtitles && item.subtitles.length > 0) {
      const def = item.subtitles.find((s) => s.isDefault) || item.subtitles[0];
      setActiveTrackId(def.id);
    } else {
      setActiveTrackId(null);
    }

    // Auto play on select
    setTimeout(() => {
      if (videoRef.current) {
        initAudioIfNeeded();
        videoRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(() => {});
      }
    }, 150);
  };

  // File Upload Handler (MKV, AVI, FLAC, MP4, etc.)
  const handleOpenFiles = async (files: FileList) => {
    const newItems: MediaItem[] = [];
    for (let i = 0; i < files.length; i++) {
      const item = await createMediaItemFromFile(files[i]);
      newItems.push(item);
    }

    if (newItems.length > 0) {
      setPlaylist((prev) => [...newItems, ...prev]);
      handleSelectMedia(newItems[0]);
    }
  };

  // External Subtitle File Handler (.SRT, .VTT, .ASS)
  const handleOpenSubtitleFile = async (file: File) => {
    try {
      const text = await file.text();
      const track = parseSubtitleFile(text, file.name);

      if (currentMedia) {
        const updatedSubs = [...(currentMedia.subtitles || []), track];
        const updatedMedia = {
          ...currentMedia,
          subtitles: updatedSubs,
        };

        setCurrentMedia(updatedMedia);
        setActiveTrackId(track.id);
        setSubtitleSettings((prev) => ({ ...prev, isEnabled: true }));

        // Also update playlist item
        setPlaylist((prev) =>
          prev.map((m) => (m.id === currentMedia.id ? updatedMedia : m))
        );
      }
    } catch (err) {
      console.error('Failed to parse subtitle file:', err);
    }
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when typing in text input
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      switch (e.code) {
        case 'Space':
        case 'KeyK':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          handleStepFrame(-5);
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleStepFrame(5);
          break;
        case 'ArrowUp':
          e.preventDefault();
          handleVolumeChange(Math.min(1, volume + 0.05));
          break;
        case 'ArrowDown':
          e.preventDefault();
          handleVolumeChange(Math.max(0, volume - 0.05));
          break;
        case 'KeyM':
          e.preventDefault();
          handleToggleMute();
          break;
        case 'KeyF':
          e.preventDefault();
          handleToggleFullscreen();
          break;
        case 'KeyC':
          e.preventDefault();
          setSubtitleSettings((prev) => ({ ...prev, isEnabled: !prev.isEnabled }));
          break;
        case 'KeyS':
          e.preventDefault();
          setIsSurroundOpen((prev) => !prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, volume, isMuted, isFullscreen]);

  // Fullscreen change listener
  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  return (
    <div className="flex flex-col h-screen w-screen bg-[#07090e] text-[#e2e8f0] overflow-hidden select-none font-sans">
      {/* 1. Top Navigation Bar */}
      <Header
        currentMedia={currentMedia}
        hardwareInfo={hardwareInfo}
        surroundMode={surroundSettings.mode}
        onOpenFiles={handleOpenFiles}
        onOpenSubtitleFile={handleOpenSubtitleFile}
        onSelectDemo={handleSelectMedia}
        onOpenSurroundPanel={() => setIsSurroundOpen(true)}
        onOpenSubtitleSettings={() => setIsSubSettingsOpen(true)}
        onOpenVideoSettings={() => setIsVideoSettingsOpen(true)}
        onOpenInspector={() => setIsInspectorOpen(true)}
      />

      {/* 2. Primary Playback & Display Stage */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Main Video/Audio Screen */}
        <div className="flex-1 flex flex-col min-w-0 relative bg-black">
          <div className="flex-1 relative overflow-hidden flex items-center justify-center">
            <VideoPlayer
              media={currentMedia}
              videoRef={videoRef}
              videoEnhancements={videoEnhancements}
              subtitleSettings={subtitleSettings}
              activeCues={activeCues}
              hardwareInfo={hardwareInfo}
              isPlaying={isPlaying}
              onTogglePlay={togglePlay}
              onDropFiles={(files: FileList) => {
                const fileList = Array.from(files) as File[];
                const subFile = fileList.find((f) =>
                  /\.(srt|vtt|ass|ssa)$/i.test(f.name)
                );
                if (subFile) {
                  handleOpenSubtitleFile(subFile);
                } else {
                  handleOpenFiles(files);
                }
              }}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={handleEnded}
            />
          </div>

          {/* Player Scrubber & Controls */}
          <PlayerControls
            media={currentMedia}
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            buffered={buffered}
            volume={volume}
            isMuted={isMuted}
            playbackRate={playbackRate}
            isLooping={isLooping}
            isFullscreen={isFullscreen}
            isTheaterMode={isTheaterMode}
            subtitleSettings={subtitleSettings}
            surroundSettings={surroundSettings}
            videoEnhancements={videoEnhancements}
            onTogglePlay={togglePlay}
            onSeek={handleSeek}
            onStepFrame={handleStepFrame}
            onVolumeChange={handleVolumeChange}
            onToggleMute={handleToggleMute}
            onPlaybackRateChange={handlePlaybackRateChange}
            onToggleLoop={handleToggleLoop}
            onToggleFullscreen={handleToggleFullscreen}
            onTogglePiP={handleTogglePiP}
            onToggleTheaterMode={() => setIsTheaterMode(!isTheaterMode)}
            onToggleSubtitles={() =>
              setSubtitleSettings((prev) => ({ ...prev, isEnabled: !prev.isEnabled }))
            }
            onSelectSubtitleTrack={(id) => {
              setActiveTrackId(id);
              setSubtitleSettings((prev) => ({ ...prev, isEnabled: !!id }));
            }}
            onOpenSubtitleSettings={() => setIsSubSettingsOpen(true)}
            onOpenSurroundPanel={() => setIsSurroundOpen(true)}
            onOpenVideoSettings={() => setIsVideoSettingsOpen(true)}
            onTogglePlaylist={() => setIsPlaylistOpen(!isPlaylistOpen)}
          />
        </div>

        {/* Optional Right/Bottom Audio Visualizer & Surround Monitor */}
        {!isTheaterMode && (
          <div className="w-full md:w-80 lg:w-96 border-t md:border-t-0 md:border-l border-white/10 p-3 bg-[#0a0d14] flex flex-col gap-3 overflow-y-auto shrink-0">
            <AudioVisualizer
              isPlaying={isPlaying}
              surroundSettings={surroundSettings}
              mediaType={currentMedia?.type || 'video'}
            />

            {/* Current Media Quick Card */}
            {currentMedia && (
              <div className="bg-[#0f141f] rounded-xl border border-white/10 p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                    STREAM CODEC METRICS
                  </span>
                  <button
                    onClick={() => setIsInspectorOpen(true)}
                    className="text-[11px] text-sky-400 hover:underline cursor-pointer font-medium"
                  >
                    Full Specs
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="bg-slate-900/80 p-2 rounded-lg border border-white/5">
                    <div className="text-[10px] text-slate-500">FORMAT</div>
                    <div className="text-sky-400 font-bold uppercase">{currentMedia.format} Container</div>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded-lg border border-white/5">
                    <div className="text-[10px] text-slate-500">RESOLUTION</div>
                    <div className="text-slate-200 font-bold truncate">
                      {currentMedia.resolution || 'UHD Standard'}
                    </div>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded-lg border border-white/5">
                    <div className="text-[10px] text-slate-500">AUDIO CHANNELS</div>
                    <div className="text-purple-300 font-bold">
                      {currentMedia.audioChannels === 6 ? '5.1 Surround' : 'Stereo 2.0'}
                    </div>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded-lg border border-white/5">
                    <div className="text-[10px] text-slate-500">SAMPLE RATE</div>
                    <div className="text-emerald-300 font-bold">
                      {currentMedia.sampleRate ? `${currentMedia.sampleRate / 1000} kHz` : '48 kHz'}
                    </div>
                  </div>
                </div>

                {/* Subtitle Status */}
                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <span className={`w-2 h-2 rounded-full ${subtitleSettings.isEnabled && activeTrackId ? 'bg-amber-400' : 'bg-slate-600'}`} />
                    <span>Subtitles:</span>
                    <span className="font-semibold text-amber-300">
                      {subtitleSettings.isEnabled && activeTrackId
                        ? currentMedia.subtitles?.find((s) => s.id === activeTrackId)?.label || 'Active'
                        : 'Disabled'}
                    </span>
                  </div>
                  <button
                    onClick={() => setIsSubSettingsOpen(true)}
                    className="text-[11px] text-amber-400 hover:underline cursor-pointer"
                  >
                    Adjust
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals & Panels */}
      <SurroundSoundPanel
        isOpen={isSurroundOpen}
        onClose={() => setIsSurroundOpen(false)}
        settings={surroundSettings}
        onChangeSettings={setSurroundSettings}
      />

      <SubtitleSettingsModal
        isOpen={isSubSettingsOpen}
        onClose={() => setIsSubSettingsOpen(false)}
        settings={subtitleSettings}
        onChangeSettings={setSubtitleSettings}
        tracks={currentMedia?.subtitles || []}
        activeTrackId={activeTrackId}
        onSelectTrack={(id) => {
          setActiveTrackId(id);
          setSubtitleSettings((prev) => ({ ...prev, isEnabled: !!id }));
        }}
        onLoadSubtitleFile={handleOpenSubtitleFile}
      />

      <VideoSettingsModal
        isOpen={isVideoSettingsOpen}
        onClose={() => setIsVideoSettingsOpen(false)}
        enhancements={videoEnhancements}
        onChangeEnhancements={setVideoEnhancements}
        hardwareInfo={hardwareInfo}
      />

      <MediaInspectorModal
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
        media={currentMedia}
        hardwareInfo={hardwareInfo}
      />

      <PlaylistDrawer
        isOpen={isPlaylistOpen}
        onClose={() => setIsPlaylistOpen(false)}
        playlist={playlist}
        currentMediaId={currentMedia?.id || null}
        onSelectMedia={handleSelectMedia}
        onRemoveMedia={(id) => setPlaylist((prev) => prev.filter((m) => m.id !== id))}
        onOpenFiles={() => {
          document.getElementById('media-file-input')?.click();
        }}
        onLoadDemos={() => setPlaylist(DEMO_MEDIA_ITEMS)}
      />
    </div>
  );
}
