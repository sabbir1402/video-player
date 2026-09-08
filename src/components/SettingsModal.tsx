import React, { useState, useEffect } from 'react';
import {
  BackgroundAudioSettings,
  SurroundSettings,
  VideoEnhancements,
  HardwareInfo,
  MediaItem,
} from '../types';
import {
  Settings,
  Headphones,
  Music,
  Radio,
  Sliders,
  Cpu,
  X,
  CheckCircle,
  Sparkles,
  Volume2,
  Tv,
  Eye,
  Activity,
  Layers,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  backgroundAudioSettings: BackgroundAudioSettings;
  onChangeBackgroundAudio: (settings: BackgroundAudioSettings) => void;
  surroundSettings: SurroundSettings;
  onChangeSurroundSettings: (settings: SurroundSettings) => void;
  videoEnhancements: VideoEnhancements;
  onChangeVideoEnhancements: (enhancements: VideoEnhancements) => void;
  hardwareInfo: HardwareInfo;
  currentMedia: MediaItem | null;
  isPlaying: boolean;
  onOpenSurroundLab: () => void;
  onOpenVideoLab: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  backgroundAudioSettings,
  onChangeBackgroundAudio,
  surroundSettings,
  onChangeSurroundSettings,
  videoEnhancements,
  onChangeVideoEnhancements,
  hardwareInfo,
  currentMedia,
  isPlaying,
  onOpenSurroundLab,
  onOpenVideoLab,
}) => {
  const [activeTab, setActiveTab] = useState<'audio' | 'video' | 'system'>('audio');
  const [isTabHidden, setIsTabHidden] = useState<boolean>(document.hidden);

  useEffect(() => {
    const handleVis = () => {
      setIsTabHidden(document.hidden);
    };
    document.addEventListener('visibilitychange', handleVis);
    return () => document.removeEventListener('visibilitychange', handleVis);
  }, []);

  if (!isOpen) return null;

  const isCurrentAudioOnly =
    currentMedia?.type === 'audio' ||
    currentMedia?.format === 'flac' ||
    currentMedia?.format === 'wav' ||
    currentMedia?.format === 'mp3';

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div
        id="settings-modal-dialog"
        className="bg-[#0c1018] border border-white/15 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="p-4 md:p-5 border-b border-white/10 flex items-center justify-between bg-[#101420]/90">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                OmniPlayer Settings
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Audio background playback, multichannel sound & GPU pipeline
              </p>
            </div>
          </div>
          <button
            id="btn-close-settings-modal"
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/10 bg-[#090d14] px-4">
          <button
            id="tab-settings-audio"
            onClick={() => setActiveTab('audio')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 cursor-pointer transition-all ${
              activeTab === 'audio'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Headphones className="w-4 h-4" />
            <span>Audio & Background Playback</span>
          </button>
          <button
            id="tab-settings-video"
            onClick={() => setActiveTab('video')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 cursor-pointer transition-all ${
              activeTab === 'video'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Tv className="w-4 h-4" />
            <span>Video & Hardware</span>
          </button>
          <button
            id="tab-settings-system"
            onClick={() => setActiveTab('system')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 cursor-pointer transition-all ${
              activeTab === 'system'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>System & MediaSession</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-4 md:p-6 overflow-y-auto space-y-6 flex-1 text-slate-200">
          {activeTab === 'audio' && (
            <>
              {/* PRIMARY FEATURE: Background Audio Playback Toggle Card */}
              <div className="rounded-xl bg-gradient-to-br from-sky-950/40 via-slate-900/80 to-purple-950/30 border border-sky-500/30 p-4 sm:p-5 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-32 h-32 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />

                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/40 flex items-center justify-center shrink-0 mt-0.5 shadow-inner">
                      <Headphones className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base font-bold text-white">
                          Background Audio Playback
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold tracking-wide border ${
                            backgroundAudioSettings.enabled
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                        >
                          {backgroundAudioSettings.enabled ? 'ACTIVE' : 'DISABLED'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-lg">
                        Enable continuous audio playback even when the browser tab is not active,
                        the window is minimized, or your screen is locked.
                      </p>
                    </div>
                  </div>

                  {/* Main Toggle Switch */}
                  <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                    <input
                      type="checkbox"
                      id="toggle-background-audio-main"
                      checked={backgroundAudioSettings.enabled}
                      onChange={(e) =>
                        onChangeBackgroundAudio({
                          ...backgroundAudioSettings,
                          enabled: e.target.checked,
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-12 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
                  </label>
                </div>

                {/* Sub-options for Background Audio */}
                {backgroundAudioSettings.enabled && (
                  <div className="mt-4 pt-4 border-t border-white/10 space-y-3.5">
                    {/* Specific FLAC / Audio-only toggle */}
                    <div className="flex items-start justify-between gap-3 p-3 rounded-lg bg-slate-900/70 border border-white/5">
                      <div className="flex items-start gap-2.5">
                        <input
                          type="checkbox"
                          id="toggle-only-audio-tracks-input"
                          checked={backgroundAudioSettings.onlyAudioTracks}
                          onChange={(e) =>
                            onChangeBackgroundAudio({
                              ...backgroundAudioSettings,
                              onlyAudioTracks: e.target.checked,
                            })
                          }
                          className="mt-0.5 rounded border-slate-700 bg-slate-800 text-sky-500 focus:ring-sky-500 w-4 h-4 cursor-pointer"
                        />
                        <div>
                          <label
                            htmlFor="toggle-only-audio-tracks-input"
                            className="text-xs font-semibold text-white block cursor-pointer flex items-center gap-1.5"
                          >
                            <span>Specifically for FLAC & audio-only tracks</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 font-mono font-bold">
                              RECOMMENDED
                            </span>
                          </label>
                          <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                            {backgroundAudioSettings.onlyAudioTracks
                              ? 'Automatically pauses heavy 4K/MKV video rendering when you switch tabs to conserve GPU and battery, while FLAC, WAV, and audio tracks continue playing flawlessly.'
                              : 'All media tracks (both audio and video audio streams) will keep playing in the background when the tab is inactive.'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Resume on Tab Focus */}
                    <div className="flex items-start justify-between gap-3 p-3 rounded-lg bg-slate-900/70 border border-white/5">
                      <div className="flex items-start gap-2.5">
                        <input
                          type="checkbox"
                          id="toggle-resume-on-focus-input"
                          checked={backgroundAudioSettings.resumeOnFocus}
                          onChange={(e) =>
                            onChangeBackgroundAudio({
                              ...backgroundAudioSettings,
                              resumeOnFocus: e.target.checked,
                            })
                          }
                          className="mt-0.5 rounded border-slate-700 bg-slate-800 text-sky-500 focus:ring-sky-500 w-4 h-4 cursor-pointer"
                        />
                        <div>
                          <label
                            htmlFor="toggle-resume-on-focus-input"
                            className="text-xs font-semibold text-white block cursor-pointer"
                          >
                            Auto-resume video when returning to tab
                          </label>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            If a video was paused due to switching tabs, automatically resume playback when you focus back on OmniPlayer.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Live Tab & Media State Diagnostic */}
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-sky-950/20 border border-sky-500/20 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                          <span
                            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                              isTabHidden ? 'bg-amber-400' : 'bg-emerald-400'
                            }`}
                          />
                          <span
                            className={`relative inline-flex rounded-full h-2 w-2 ${
                              isTabHidden ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                          />
                        </span>
                        <span className="font-mono text-slate-300">
                          {isTabHidden ? 'Browser Tab: INACTIVE / BACKGROUND' : 'Browser Tab: ACTIVE'}
                        </span>
                      </div>
                      <span className="text-[11px] text-sky-400 font-mono font-semibold">
                        {currentMedia
                          ? `${currentMedia.format.toUpperCase()} (${isCurrentAudioOnly ? 'Audio Track' : 'Video'})`
                          : 'No Track'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Multichannel Surround Sound Mode Quick Access */}
              <div className="bg-slate-900/60 border border-white/10 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Multichannel Audio Architecture
                    </span>
                  </div>
                  <button
                    id="btn-open-surround-laboratory"
                    onClick={() => {
                      onClose();
                      onOpenSurroundLab();
                    }}
                    className="text-xs text-sky-400 hover:text-sky-300 font-semibold cursor-pointer transition-colors"
                  >
                    Open 5.1/7.1 Equalizer Lab →
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'stereo', label: 'Stereo (2.0)', desc: 'Standard hi-fi' },
                    { id: 'surround51', label: '5.1 Cinema Surround', desc: 'L/R/C/LFE/Surrounds' },
                    { id: 'surround71', label: '7.1 Studio Spatial', desc: '360° Soundfield' },
                    { id: 'spatial_headphones', label: '3D Headphones', desc: 'HRTF binaural' },
                    { id: 'dialogue_boost', label: 'Dialogue Clarity', desc: '+4dB Vocal Center' },
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() =>
                        onChangeSurroundSettings({
                          ...surroundSettings,
                          mode: mode.id as any,
                        })
                      }
                      className={`p-2.5 rounded-lg text-left border transition-all cursor-pointer ${
                        surroundSettings.mode === mode.id
                          ? 'bg-purple-600/20 border-purple-500 text-white shadow-sm'
                          : 'bg-slate-800/60 border-white/5 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div className="text-xs font-bold">{mode.label}</div>
                      <div className="text-[10px] text-slate-400 truncate">{mode.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === 'video' && (
            <div className="space-y-4">
              {/* GPU Hardware Acceleration */}
              <div className="bg-slate-900/60 border border-white/10 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">Hardware GPU Compositor</div>
                    <div className="text-xs text-slate-400">
                      {hardwareInfo.renderer}
                    </div>
                  </div>
                </div>
                <span className="text-xs px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold border border-emerald-500/30">
                  GPU ACTIVE
                </span>
              </div>

              {/* Aspect Ratio */}
              <div className="bg-slate-900/60 border border-white/10 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Aspect Ratio & Framing
                  </span>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenVideoLab();
                    }}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer"
                  >
                    Open Video Enhancer Lab →
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {['original', '16:9', '21:9', '4:3', 'fill'].map((ar) => (
                    <button
                      key={ar}
                      onClick={() =>
                        onChangeVideoEnhancements({
                          ...videoEnhancements,
                          aspectRatio: ar as any,
                        })
                      }
                      className={`py-2 px-3 rounded-lg text-xs font-mono font-semibold border transition-all cursor-pointer ${
                        videoEnhancements.aspectRatio === ar
                          ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                          : 'bg-slate-800/60 border-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      {ar.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* HDR Tone Mapping & Deinterlace */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/60 border border-white/10 cursor-pointer">
                  <div>
                    <span className="text-xs font-bold text-white block">HDR Tone Mapping</span>
                    <span className="text-[11px] text-slate-400">Expanded dynamic color range</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={videoEnhancements.hdrToneMap}
                    onChange={(e) =>
                      onChangeVideoEnhancements({
                        ...videoEnhancements,
                        hdrToneMap: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-emerald-500 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/60 border border-white/10 cursor-pointer">
                  <div>
                    <span className="text-xs font-bold text-white block">Deinterlace Filter</span>
                    <span className="text-[11px] text-slate-400">Scanline comb artifact removal</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={videoEnhancements.deinterlace}
                    onChange={(e) =>
                      onChangeVideoEnhancements({
                        ...videoEnhancements,
                        deinterlace: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-emerald-500 cursor-pointer"
                  />
                </label>
              </div>
            </div>
          )}

          {activeTab === 'system' && (
            <div className="space-y-4 text-xs">
              <div className="bg-slate-900/60 border border-white/10 rounded-xl p-4 space-y-2.5">
                <div className="font-bold text-white text-sm flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-sky-400" />
                  <span>Media Session & OS Media Control Integration</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  OmniPlayer automatically integrates with the W3C MediaSession API. This grants native OS-level media integration:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-slate-400 font-mono text-[11px]">
                  <li>Windows 10 / 11 Flyout Media Controls & Lock Screen Widget</li>
                  <li>Android Quick Settings Media Notification & Lock Screen Album Art</li>
                  <li>Keyboard Media Keys (Play, Pause, Previous, Next, Seek)</li>
                  <li>Background Process Priority preventing browser audio thread hibernation</li>
                </ul>
              </div>

              <div className="bg-slate-900/60 border border-white/10 rounded-xl p-4 space-y-2">
                <div className="font-bold text-white text-sm">FLAC / Lossless Audio Fidelity</div>
                <p className="text-slate-300 leading-relaxed">
                  Free Lossless Audio Codec (FLAC) streams decode up to 96kHz / 24-bit studio master quality without compression loss. In background mode, our Web Audio graph ensures uninterrupted stream synchronization.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-white/10 bg-[#0a0e16] flex items-center justify-between">
          <div className="text-xs text-slate-400 font-mono">
            Settings automatically saved to browser storage
          </div>
          <button
            id="btn-done-settings"
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold cursor-pointer transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
