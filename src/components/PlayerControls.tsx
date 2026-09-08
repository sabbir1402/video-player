import React, { useState, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Volume1,
  Maximize2,
  Minimize2,
  Pipette,
  Radio,
  FileText,
  Sliders,
  Settings,
  Crop,
  Gauge,
  Repeat,
  Tv,
  ListVideo,
} from 'lucide-react';
import { formatTime } from '../services/subtitleParser';
import { MediaItem, SubtitleSettings, SurroundSettings, VideoEnhancements } from '../types';

interface PlayerControlsProps {
  media: MediaItem | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  buffered: number;
  volume: number;
  isMuted: boolean;
  playbackRate: number;
  isLooping: boolean;
  isFullscreen: boolean;
  isTheaterMode: boolean;
  subtitleSettings: SubtitleSettings;
  surroundSettings: SurroundSettings;
  videoEnhancements: VideoEnhancements;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  onStepFrame: (seconds: number) => void;
  onVolumeChange: (vol: number) => void;
  onToggleMute: () => void;
  onPlaybackRateChange: (rate: number) => void;
  onToggleLoop: () => void;
  onToggleFullscreen: () => void;
  onTogglePiP: () => void;
  onToggleTheaterMode: () => void;
  onToggleSubtitles: () => void;
  onSelectSubtitleTrack: (trackId: string | null) => void;
  onOpenSubtitleSettings: () => void;
  onOpenSurroundPanel: () => void;
  onOpenVideoSettings: () => void;
  onTogglePlaylist: () => void;
  onOpenSettings?: () => void;
  backgroundAudioEnabled?: boolean;
}

export const PlayerControls: React.FC<PlayerControlsProps> = ({
  media,
  isPlaying,
  currentTime,
  duration,
  buffered,
  volume,
  isMuted,
  playbackRate,
  isLooping,
  isFullscreen,
  isTheaterMode,
  subtitleSettings,
  surroundSettings,
  videoEnhancements,
  onTogglePlay,
  onSeek,
  onStepFrame,
  onVolumeChange,
  onToggleMute,
  onPlaybackRateChange,
  onToggleLoop,
  onToggleFullscreen,
  onTogglePiP,
  onToggleTheaterMode,
  onToggleSubtitles,
  onSelectSubtitleTrack,
  onOpenSubtitleSettings,
  onOpenSurroundPanel,
  onOpenVideoSettings,
  onTogglePlaylist,
  onOpenSettings,
  backgroundAudioEnabled = true,
}) => {
  const progressBarRef = useRef<HTMLDivElement>(null);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverPos, setHoverPos] = useState<number>(0);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showSubMenu, setShowSubMenu] = useState(false);
  const [showAudioMenu, setShowAudioMenu] = useState(false);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferedPercent = duration > 0 ? (buffered / duration) * 100 : 0;

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || duration <= 0) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const targetTime = Math.max(0, Math.min(duration, pos * duration));
    onSeek(targetTime);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || duration <= 0) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const clamped = Math.max(0, Math.min(1, pos));
    setHoverPos(e.clientX - rect.left);
    setHoverTime(clamped * duration);
  };

  const handleMouseLeave = () => {
    setHoverTime(null);
  };

  const speeds = [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0, 3.0];

  return (
    <div
      id="player-controls-root"
      className="bg-[#0b0e14]/95 backdrop-blur-md border-t border-white/10 px-4 py-2.5 flex flex-col gap-2 select-none z-20 shrink-0"
    >
      {/* 1. Precision Timeline Scrubber */}
      <div
        ref={progressBarRef}
        id="timeline-progress-bar"
        onClick={handleProgressClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative w-full h-3 group cursor-pointer flex items-center py-1"
      >
        {/* Track background */}
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden relative group-hover:h-2 transition-all">
          {/* Buffered track */}
          <div
            className="absolute top-0 left-0 h-full bg-slate-700/60 transition-all duration-200"
            style={{ width: `${bufferedPercent}%` }}
          />
          {/* Played track with gradient */}
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-sky-500 to-sky-400 rounded-full transition-all duration-75"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Scrubber thumb */}
        <div
          className="absolute w-3.5 h-3.5 bg-white rounded-full shadow-md shadow-black/60 border border-sky-400 scale-0 group-hover:scale-100 transition-transform -translate-x-1/2 pointer-events-none"
          style={{ left: `${progressPercent}%` }}
        />

        {/* Hover Time Tooltip */}
        {hoverTime !== null && (
          <div
            className="absolute -top-7 px-2 py-0.5 rounded bg-slate-900 border border-white/15 text-[11px] font-mono text-white shadow-lg pointer-events-none -translate-x-1/2"
            style={{ left: `${hoverPos}px` }}
          >
            {formatTime(hoverTime)}
          </div>
        )}
      </div>

      {/* 2. Main Control Bar */}
      <div className="flex items-center justify-between gap-2">
        {/* Left: Playback, Steps, Volume & Time */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Play/Pause Button */}
          <button
            id="btn-play-pause"
            onClick={onTogglePlay}
            className="w-10 h-10 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 flex items-center justify-center shadow-lg shadow-sky-500/20 transition-transform active:scale-95 cursor-pointer shrink-0"
            title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-slate-950 text-slate-950" />
            ) : (
              <Play className="w-5 h-5 fill-slate-950 text-slate-950 ml-0.5" />
            )}
          </button>

          {/* Step backward 5s or 1 frame */}
          <button
            id="btn-step-back"
            onClick={() => onStepFrame(-5)}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Step Back 5 Seconds (←)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Step forward 5s or 1 frame */}
          <button
            id="btn-step-forward"
            onClick={() => onStepFrame(5)}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Step Forward 5 Seconds (→)"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          {/* Volume Control */}
          <div className="flex items-center gap-1.5 group/vol">
            <button
              id="btn-volume-mute"
              onClick={onToggleMute}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : volume < 0.5 ? (
                <Volume1 className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              id="volume-slider"
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="w-16 md:w-20 h-1.5 bg-slate-800 accent-sky-400 rounded-lg cursor-pointer transition-all"
              title={`Volume: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
            />
          </div>

          {/* Time Counter */}
          <div className="text-xs font-mono text-slate-300 ml-1">
            <span className="text-white font-semibold">{formatTime(currentTime)}</span>
            <span className="text-slate-500 mx-1">/</span>
            <span className="text-slate-400">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Right: Subtitles, Surround Sound, Speed, Playlist, Fullscreen */}
        <div className="flex items-center gap-1 md:gap-1.5">
          {/* Subtitle Selector / Toggle */}
          <div className="relative">
            <button
              id="btn-subtitle-toggle"
              onClick={onToggleSubtitles}
              onContextMenu={(e) => {
                e.preventDefault();
                setShowSubMenu(!showSubMenu);
              }}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                subtitleSettings.isEnabled
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-white/5'
              }`}
              title="Toggle Subtitles (Right click for tracks & styling)"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>CC</span>
            </button>

            {/* Subtitle Quick Track Menu on click */}
            {showSubMenu && (
              <div className="absolute bottom-full right-0 mb-2 w-64 bg-[#121620] border border-white/15 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in">
                <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-white/10 px-2">
                  <span className="text-xs font-bold text-slate-200">Subtitles</span>
                  <button
                    onClick={onOpenSubtitleSettings}
                    className="text-[11px] text-sky-400 hover:underline cursor-pointer"
                  >
                    Custom Styling
                  </button>
                </div>
                <button
                  onClick={() => {
                    onSelectSubtitleTrack(null);
                    setShowSubMenu(false);
                  }}
                  className="w-full text-left px-2 py-1.5 rounded text-xs text-slate-300 hover:bg-white/10 transition-colors"
                >
                  None (Off)
                </button>
                {media?.subtitles?.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => {
                      onSelectSubtitleTrack(sub.id);
                      setShowSubMenu(false);
                    }}
                    className="w-full text-left px-2 py-1.5 rounded text-xs text-amber-300 hover:bg-white/10 transition-colors font-medium flex items-center justify-between"
                  >
                    <span className="truncate">{sub.label}</span>
                    <span className="text-[10px] text-slate-500 uppercase font-mono">{sub.format}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 5.1/7.1 Surround Sound Mode Button */}
          <button
            id="btn-surround-quick"
            onClick={onOpenSurroundPanel}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              surroundSettings.mode !== 'stereo'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-white/5'
            }`}
            title="5.1/7.1 Surround Sound Engine"
          >
            <Radio className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {surroundSettings.mode === 'surround51'
                ? '5.1 SURROUND'
                : surroundSettings.mode === 'surround71'
                ? '7.1 SPATIAL'
                : 'SURROUND'}
            </span>
          </button>

          {/* Playback Rate / Speed Selector */}
          <div className="relative">
            <button
              id="btn-speed-selector"
              onClick={() => setShowSpeedMenu(!showSpeedMenu)}
              className="px-2 py-1.5 rounded-lg bg-slate-800/80 text-slate-300 hover:text-white border border-white/5 text-xs font-mono font-medium transition-colors cursor-pointer"
              title="Playback Speed"
            >
              {playbackRate}x
            </button>

            {showSpeedMenu && (
              <div className="absolute bottom-full right-0 mb-2 w-28 bg-[#121620] border border-white/15 rounded-xl shadow-2xl p-1 z-50 animate-in fade-in">
                {speeds.map((s) => (
                  <button
                    key={s}
                    id={`speed-option-${s}`}
                    onClick={() => {
                      onPlaybackRateChange(s);
                      setShowSpeedMenu(false);
                    }}
                    className={`w-full text-center px-2 py-1 rounded text-xs font-mono transition-colors ${
                      playbackRate === s
                        ? 'bg-sky-600 text-white font-bold'
                        : 'text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Repeat / Loop Toggle */}
          <button
            id="btn-toggle-loop"
            onClick={onToggleLoop}
            className={`p-2 rounded-lg text-xs transition-colors cursor-pointer ${
              isLooping ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' : 'text-slate-400 hover:text-white'
            }`}
            title={isLooping ? 'Looping Enabled' : 'Enable Loop'}
          >
            <Repeat className="w-4 h-4" />
          </button>

          {/* Video Enhancements / Hardware Accel button */}
          <button
            id="btn-video-enhancements"
            onClick={onOpenVideoSettings}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Hardware Video Enhancer (Aspect Ratio, Brightness, Sharpness)"
          >
            <Crop className="w-4 h-4" />
          </button>

          {/* Picture in Picture */}
          <button
            id="btn-pip"
            onClick={onTogglePiP}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer hidden sm:block"
            title="Picture-in-Picture"
          >
            <Tv className="w-4 h-4" />
          </button>

          {/* Player & Audio Settings Modal */}
          {onOpenSettings && (
            <button
              id="btn-player-settings"
              onClick={onOpenSettings}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer relative"
              title="Player & Audio Settings (Background Playback & Sound)"
            >
              <Settings className="w-4 h-4" />
              {backgroundAudioEnabled && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 absolute top-1.5 right-1.5" />
              )}
            </button>
          )}

          {/* Playlist Drawer Toggle */}
          <button
            id="btn-toggle-playlist"
            onClick={onTogglePlaylist}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Open Playlist / Queue"
          >
            <ListVideo className="w-4 h-4" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            id="btn-toggle-fullscreen"
            onClick={onToggleFullscreen}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Fullscreen (F)"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
