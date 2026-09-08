import React, { useRef, useState } from 'react';
import {
  Film,
  FolderOpen,
  Cpu,
  Sparkles,
  Info,
  Sliders,
  Radio,
  FileText,
  Volume2,
  Download,
  Smartphone,
  Monitor,
  Settings,
  Headphones,
  MoreVertical,
  X,
  SlidersHorizontal,
} from 'lucide-react';
import { HardwareInfo, MediaItem } from '../types';
import { DEMO_MEDIA_ITEMS } from '../data/demoMedia';

interface HeaderProps {
  currentMedia: MediaItem | null;
  hardwareInfo: HardwareInfo;
  surroundMode: string;
  backgroundAudioEnabled?: boolean;
  onOpenFiles: (files: FileList) => void;
  onOpenSubtitleFile: (file: File) => void;
  onSelectDemo: (item: MediaItem) => void;
  onOpenSurroundPanel: () => void;
  onOpenSubtitleSettings: () => void;
  onOpenVideoSettings: () => void;
  onOpenInspector: () => void;
  onOpenInstallApp: () => void;
  onOpenSettings?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentMedia,
  hardwareInfo,
  surroundMode,
  backgroundAudioEnabled = true,
  onOpenFiles,
  onOpenSubtitleFile,
  onSelectDemo,
  onOpenSurroundPanel,
  onOpenSubtitleSettings,
  onOpenVideoSettings,
  onOpenInspector,
  onOpenInstallApp,
  onOpenSettings,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const subInputRef = useRef<HTMLInputElement>(null);
  const [showMobileTools, setShowMobileTools] = useState(false);

  const handleMediaFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onOpenFiles(e.target.files);
    }
  };

  const handleSubFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onOpenSubtitleFile(e.target.files[0]);
    }
  };

  return (
    <header className="h-14 sm:h-16 px-3 sm:px-4 md:px-6 bg-[#0c1017]/95 backdrop-blur-md border-b border-white/10 flex items-center justify-between select-none z-30 shrink-0">
      {/* Brand & Format Badges */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-sky-500 to-cyan-400 p-[1px] shadow-lg shadow-sky-500/20 shrink-0">
            <div className="w-full h-full bg-[#090b10] rounded-[11px] flex items-center justify-center">
              <Film className="w-4 h-4 sm:w-5 sm:h-5 text-sky-400" />
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-white flex items-center">
                Omni<span className="text-sky-400">Player</span>
              </span>
              <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30 shrink-0">
                PRO
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400 font-mono hidden sm:block truncate">
              MKV • AVI • FLAC • 5.1/7.1 SURROUND
            </p>
          </div>
        </div>

        {/* Quick format capability pills (Visible on wide Windows screens) */}
        <div className="hidden xl:flex items-center gap-1.5 ml-3 text-[11px] font-mono">
          <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 flex items-center gap-1">
            <Cpu className="w-3 h-3 text-emerald-400" />
            HW ACCEL
          </span>
          <span className="px-2 py-0.5 rounded bg-purple-950/60 border border-purple-500/30 text-purple-300 flex items-center gap-1">
            <Radio className="w-3 h-3 text-purple-400" />
            {surroundMode === 'surround51' ? '5.1 SURROUND' : surroundMode === 'surround71' ? '7.1 SPATIAL' : 'SPATIAL'}
          </span>
          {currentMedia && (
            <span className="px-2 py-0.5 rounded bg-slate-800/80 border border-white/10 text-slate-300 uppercase font-semibold">
              {currentMedia.format}
            </span>
          )}
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Hidden inputs */}
        <input
          ref={fileInputRef}
          type="file"
          id="media-file-input"
          multiple
          accept="video/*,audio/*,.mkv,.avi,.flac,.mp4,.webm,.mov,.wav,.mp3,.ogg,.aac"
          className="hidden"
          onChange={handleMediaFileChange}
        />
        <input
          ref={subInputRef}
          type="file"
          id="subtitle-file-input"
          accept=".srt,.vtt,.ass,.ssa"
          className="hidden"
          onChange={handleSubFileChange}
        />

        {/* Open Local File (Touch target >= 40px) */}
        <button
          id="btn-open-file"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs sm:text-sm shadow-md shadow-sky-600/25 transition-all cursor-pointer"
          title="Open local media (MKV, AVI, FLAC, MP4, WebM, WAV, MP3...)"
        >
          <FolderOpen className="w-4 h-4" />
          <span className="hidden xs:inline sm:inline">Open</span>
        </button>

        {/* Demo Media Selector */}
        <div className="relative group">
          <button
            id="btn-demo-selector"
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-white/10 transition-all cursor-pointer"
            title="Choose demo media"
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">Demos</span>
          </button>

          {/* Dropdown Menu */}
          <div className="absolute right-0 mt-2 w-72 max-w-[85vw] bg-[#121620] border border-white/15 rounded-xl shadow-2xl p-2 hidden group-hover:block group-focus-within:block z-50 animate-in fade-in slide-in-from-top-1">
            <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              High-Resolution Demos
            </div>
            {DEMO_MEDIA_ITEMS.map((item) => (
              <button
                key={item.id}
                id={`demo-item-${item.id}`}
                onClick={() => onSelectDemo(item)}
                className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center gap-2.5 hover:bg-white/10 transition-colors cursor-pointer ${
                  currentMedia?.id === item.id ? 'bg-sky-600/20 text-sky-300 font-semibold border border-sky-500/30' : 'text-slate-200'
                }`}
              >
                <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center shrink-0 text-slate-400 overflow-hidden">
                  {item.thumbnail ? (
                    <img src={item.thumbnail} alt="" className="w-full h-full object-cover" />
                  ) : item.type === 'video' ? (
                    <Film className="w-4 h-4 text-sky-400" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-emerald-400" />
                  )}
                </div>
                <div className="truncate">
                  <div className="truncate font-medium text-slate-100">{item.title}</div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-2">
                    <span className="uppercase text-sky-400 font-mono font-bold">{item.format}</span>
                    <span>{item.resolution || (item.format === 'flac' ? '24-Bit / 96kHz' : 'Lossless')}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* --- DESKTOP PRO BUTTONS (Visible on Windows / large screens >= lg: 1024px) --- */}
        <div className="hidden lg:flex items-center gap-1.5">
          {/* Load Subtitles */}
          <button
            id="btn-open-subs"
            onClick={() => subInputRef.current?.click()}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-white/10 transition-all cursor-pointer"
            title="Load external subtitle file (.SRT, .VTT, .ASS)"
          >
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden xl:inline">Subtitles</span>
          </button>

          {/* Install App Button for Android & Windows */}
          <button
            id="btn-install-app"
            onClick={onOpenInstallApp}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold shadow-sm transition-all cursor-pointer"
            title="Install OmniPlayer on Android or Windows"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden xl:inline">Install</span>
          </button>

          {/* Surround Sound Panel Toggle */}
          <button
            id="btn-header-surround"
            onClick={onOpenSurroundPanel}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 transition-colors cursor-pointer"
            title="Open 5.1/7.1 Surround Sound & Audio Matrix Laboratory"
          >
            <Radio className="w-4 h-4 text-purple-400" />
          </button>

          {/* Subtitle Styling */}
          <button
            id="btn-header-subs-settings"
            onClick={onOpenSubtitleSettings}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 transition-colors cursor-pointer"
            title="Customizable Subtitle Styling & Sync Offset"
          >
            <FileText className="w-4 h-4 text-amber-400" />
          </button>

          {/* Video & Hardware Enhancement */}
          <button
            id="btn-header-video-settings"
            onClick={onOpenVideoSettings}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 transition-colors cursor-pointer"
            title="Hardware Acceleration & Video Display Enhancer"
          >
            <Sliders className="w-4 h-4 text-emerald-400" />
          </button>

          {/* Technical Media Inspector */}
          <button
            id="btn-header-inspector"
            onClick={onOpenInspector}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 transition-colors cursor-pointer"
            title="Inspect Codecs, Resolution, Bitrate & Hardware Decoder Info"
          >
            <Info className="w-4 h-4 text-sky-400" />
          </button>

          {/* Comprehensive Settings Modal Toggle */}
          {onOpenSettings && (
            <button
              id="btn-header-settings"
              onClick={onOpenSettings}
              className="flex items-center gap-1.5 p-2 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 transition-colors cursor-pointer relative"
              title="Player & Audio Settings (Background Playback, Surround & GPU)"
            >
              <Settings className="w-4 h-4 text-sky-400" />
              <span className="hidden xl:inline text-xs font-semibold">Settings</span>
              {backgroundAudioEnabled && (
                <span
                  className="w-2 h-2 rounded-full bg-emerald-400 absolute top-1 right-1"
                  title="Background Audio Active"
                />
              )}
            </button>
          )}
        </div>

        {/* --- MOBILE & TABLET QUICK TOOLS BUTTON (Visible on < lg: screens) --- */}
        <div className="relative lg:hidden">
          <button
            id="btn-mobile-tools-menu"
            onClick={() => setShowMobileTools(!showMobileTools)}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 transition-colors cursor-pointer relative"
            title="Open Pro Audio, Video & Player Tools"
          >
            <SlidersHorizontal className="w-4 h-4 text-sky-400" />
            {backgroundAudioEnabled && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 absolute top-1 right-1" />
            )}
          </button>

          {/* Mobile Tools Popover */}
          {showMobileTools && (
            <>
              <div
                className="fixed inset-0 bg-black/60 z-40"
                onClick={() => setShowMobileTools(false)}
              />
              <div className="absolute right-0 mt-2 w-64 bg-[#121620] border border-white/15 rounded-2xl shadow-2xl p-2.5 z-50 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-2 mb-1 border-b border-white/10 px-1">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Player Tools</span>
                  <button
                    onClick={() => setShowMobileTools(false)}
                    className="p-1 text-slate-400 hover:text-white rounded"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-1 text-xs">
                  <button
                    onClick={() => {
                      onOpenInstallApp();
                      setShowMobileTools(false);
                    }}
                    className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-white/10 flex items-center gap-2.5 text-emerald-300 font-medium transition-colors"
                  >
                    <Download className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Install App (Win/Android)</span>
                  </button>

                  <button
                    onClick={() => {
                      onOpenSurroundPanel();
                      setShowMobileTools(false);
                    }}
                    className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-white/10 flex items-center gap-2.5 text-purple-300 font-medium transition-colors"
                  >
                    <Radio className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>5.1 / 7.1 Surround Sound</span>
                  </button>

                  <button
                    onClick={() => {
                      onOpenVideoSettings();
                      setShowMobileTools(false);
                    }}
                    className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-white/10 flex items-center gap-2.5 text-slate-200 font-medium transition-colors"
                  >
                    <Sliders className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Video & Hardware Enhancer</span>
                  </button>

                  <button
                    onClick={() => {
                      onOpenSubtitleSettings();
                      setShowMobileTools(false);
                    }}
                    className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-white/10 flex items-center gap-2.5 text-amber-300 font-medium transition-colors"
                  >
                    <FileText className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Subtitle Styling & Sync</span>
                  </button>

                  <button
                    onClick={() => {
                      subInputRef.current?.click();
                      setShowMobileTools(false);
                    }}
                    className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-white/10 flex items-center gap-2.5 text-slate-300 font-medium transition-colors"
                  >
                    <FolderOpen className="w-4 h-4 text-sky-400 shrink-0" />
                    <span>Load External Subtitles (.SRT)</span>
                  </button>

                  <button
                    onClick={() => {
                      onOpenInspector();
                      setShowMobileTools(false);
                    }}
                    className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-white/10 flex items-center gap-2.5 text-sky-300 font-medium transition-colors"
                  >
                    <Info className="w-4 h-4 text-sky-400 shrink-0" />
                    <span>Stream Codec Inspector</span>
                  </button>

                  {onOpenSettings && (
                    <button
                      onClick={() => {
                        onOpenSettings();
                        setShowMobileTools(false);
                      }}
                      className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-white/10 flex items-center gap-2.5 text-slate-200 font-medium transition-colors border-t border-white/10 mt-1 pt-2"
                    >
                      <Settings className="w-4 h-4 text-sky-400 shrink-0" />
                      <span>Player & Audio Settings</span>
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
