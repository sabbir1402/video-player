import React from 'react';
import {
  BackgroundAudioSettings,
  SurroundMode,
  SurroundSettings,
} from '../types';
import { EQ_FREQUENCIES, EQ_PRESETS } from '../services/audioEngine';
import {
  Radio,
  Volume2,
  Headphones,
  Sliders,
  RotateCcw,
  Sparkles,
  Layers,
  X,
  Zap,
} from 'lucide-react';

interface SurroundSoundPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SurroundSettings;
  onChangeSettings: (newSettings: SurroundSettings) => void;
  backgroundAudioSettings?: BackgroundAudioSettings;
  onChangeBackgroundAudio?: (settings: BackgroundAudioSettings) => void;
}

export const SurroundSoundPanel: React.FC<SurroundSoundPanelProps> = ({
  isOpen,
  onClose,
  settings,
  onChangeSettings,
  backgroundAudioSettings,
  onChangeBackgroundAudio,
}) => {
  if (!isOpen) return null;

  const handleModeChange = (mode: SurroundMode) => {
    onChangeSettings({
      ...settings,
      mode,
    });
  };

  const handleEqBandChange = (index: number, val: number) => {
    const nextBands = [...settings.eqBands];
    nextBands[index] = val;
    onChangeSettings({
      ...settings,
      eqPreset: 'custom',
      eqBands: nextBands,
    });
  };

  const handleEqPresetSelect = (presetKey: string) => {
    if (EQ_PRESETS[presetKey]) {
      onChangeSettings({
        ...settings,
        eqPreset: presetKey as any,
        eqBands: [...EQ_PRESETS[presetKey]],
      });
    }
  };

  const handleSpeakerGainChange = (channel: string, gain: number) => {
    onChangeSettings({
      ...settings,
      speakerGains: {
        ...settings.speakerGains,
        [channel]: gain,
      },
    });
  };

  const handleReset = () => {
    onChangeSettings({
      mode: 'surround51',
      bassBoost: 4,
      dialogueBoost: 3,
      lfeCutoff: 120,
      surroundSpread: 75,
      roomReverb: 15,
      speakerGains: {
        L: 1.0,
        R: 1.0,
        C: 1.1,
        LFE: 1.2,
        SL: 0.9,
        SR: 0.9,
        BL: 0.8,
        BR: 0.8,
      },
      eqPreset: 'cinema',
      eqBands: [...EQ_PRESETS.cinema],
    });
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0f141f] border border-white/15 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Modal Header */}
        <div className="p-4 md:p-5 border-b border-white/10 flex items-center justify-between sticky top-0 bg-[#0f141f]/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Surround Sound & Spatial Audio Engine
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Multichannel 5.1 / 7.1 matrix decoding, LFE Subwoofer crossover & 10-band EQ
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer text-xs flex items-center gap-1"
              title="Reset to Cinema Defaults"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-4 md:p-6 space-y-6">
          {/* Background Audio Playback Setting */}
          {backgroundAudioSettings && onChangeBackgroundAudio && (
            <div className="rounded-xl bg-gradient-to-r from-sky-950/40 via-slate-900/60 to-purple-950/30 border border-sky-500/30 p-4 shadow-md">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center shrink-0 mt-0.5">
                    <Headphones className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">
                        Background Audio Playback
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold tracking-wide border ${
                          backgroundAudioSettings.enabled
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {backgroundAudioSettings.enabled ? 'ACTIVE' : 'OFF'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      Continue playing audio when switching tabs, minimizing your browser, or locking your device screen.
                    </p>
                  </div>
                </div>

                {/* Main Toggle */}
                <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                  <input
                    type="checkbox"
                    id="toggle-bg-audio-surround-panel"
                    checked={backgroundAudioSettings.enabled}
                    onChange={(e) =>
                      onChangeBackgroundAudio({
                        ...backgroundAudioSettings,
                        enabled: e.target.checked,
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
                </label>
              </div>

              {backgroundAudioSettings.enabled && (
                <div className="mt-3.5 pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-200">
                    <input
                      type="checkbox"
                      id="toggle-only-audio-tracks-surround"
                      checked={backgroundAudioSettings.onlyAudioTracks}
                      onChange={(e) =>
                        onChangeBackgroundAudio({
                          ...backgroundAudioSettings,
                          onlyAudioTracks: e.target.checked,
                        })
                      }
                      className="rounded border-slate-700 bg-slate-800 text-sky-500 focus:ring-sky-500 w-4 h-4 cursor-pointer"
                    />
                    <span className="font-semibold text-sky-300">
                      Specifically for FLAC & audio-only tracks
                    </span>
                  </label>
                  <span className="text-[11px] text-slate-400">
                    {backgroundAudioSettings.onlyAudioTracks
                      ? 'Videos pause on tab blur to save resources'
                      : 'All media audio continues in background'}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* 1. Surround Mode Selection */}
          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2.5">
              Playback Soundstage Profile
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                {
                  id: 'surround51',
                  label: '5.1 Surround',
                  desc: 'Dolby Pro Logic II',
                  icon: Radio,
                },
                {
                  id: 'surround71',
                  label: '7.1 Spatial',
                  desc: '8-Channel Cinema',
                  icon: Layers,
                },
                {
                  id: 'spatial_headphones',
                  label: '3D Headphones',
                  desc: 'Binaural HRTF',
                  icon: Headphones,
                },
                {
                  id: 'stereo',
                  label: 'Pure Stereo',
                  desc: 'Direct Passthrough',
                  icon: Volume2,
                },
              ].map((m) => {
                const Icon = m.icon;
                const active = settings.mode === m.id;
                return (
                  <button
                    key={m.id}
                    id={`btn-mode-${m.id}`}
                    onClick={() => handleModeChange(m.id as SurroundMode)}
                    className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                      active
                        ? 'bg-purple-600/20 border-purple-500 text-white shadow-lg shadow-purple-950/40'
                        : 'bg-slate-900/60 border-white/5 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? 'text-purple-400' : 'text-slate-400'}`} />
                    <span className="text-xs font-bold">{m.label}</span>
                    <span className="text-[10px] text-slate-500 leading-tight">{m.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Bass Boost, LFE Subwoofer & Dialogue Enhancement */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-900/40 p-4 rounded-xl border border-white/5">
            {/* LFE Subwoofer & Bass */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-amber-400 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  Subwoofer LFE Bass Boost
                </span>
                <span className="font-mono font-bold text-amber-300">+{settings.bassBoost} dB</span>
              </div>
              <input
                type="range"
                min="0"
                max="12"
                step="0.5"
                value={settings.bassBoost}
                onChange={(e) =>
                  onChangeSettings({ ...settings, bassBoost: parseFloat(e.target.value) })
                }
                className="w-full h-2 bg-slate-800 accent-amber-400 rounded-lg cursor-pointer"
              />

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-400">LFE Crossover Cutoff</span>
                <span className="font-mono text-slate-300">{settings.lfeCutoff} Hz</span>
              </div>
              <input
                type="range"
                min="60"
                max="160"
                step="5"
                value={settings.lfeCutoff}
                onChange={(e) =>
                  onChangeSettings({ ...settings, lfeCutoff: parseInt(e.target.value) })
                }
                className="w-full h-1.5 bg-slate-800 accent-amber-500 rounded-lg cursor-pointer"
              />
            </div>

            {/* Dialogue Clarity & Surround Spread */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Center Dialogue Clarity
                </span>
                <span className="font-mono font-bold text-emerald-300">+{settings.dialogueBoost} dB</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                step="0.5"
                value={settings.dialogueBoost}
                onChange={(e) =>
                  onChangeSettings({ ...settings, dialogueBoost: parseFloat(e.target.value) })
                }
                className="w-full h-2 bg-slate-800 accent-emerald-400 rounded-lg cursor-pointer"
              />

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-400">Surround Sound Spread</span>
                <span className="font-mono text-slate-300">{settings.surroundSpread}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={settings.surroundSpread}
                onChange={(e) =>
                  onChangeSettings({ ...settings, surroundSpread: parseInt(e.target.value) })
                }
                className="w-full h-1.5 bg-slate-800 accent-purple-400 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* 3. Speaker Channel Balance (L, R, Center, Subwoofer, Surround Rear) */}
          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
              Virtual Speaker Channel Gains
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {[
                { ch: 'L', label: 'Front L' },
                { ch: 'C', label: 'Center' },
                { ch: 'R', label: 'Front R' },
                { ch: 'LFE', label: 'Sub (LFE)' },
                { ch: 'SL', label: 'Surr Left' },
                { ch: 'SR', label: 'Surr Right' },
              ].map(({ ch, label }) => {
                const gain = (settings.speakerGains as any)[ch] || 1.0;
                return (
                  <div key={ch} className="bg-slate-900/70 p-2 rounded-lg border border-white/5 text-center">
                    <div className="text-[11px] font-bold text-slate-300">{label}</div>
                    <div className="text-[10px] font-mono text-sky-400 mb-1">
                      {(gain * 100).toFixed(0)}%
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.05"
                      value={gain}
                      onChange={(e) => handleSpeakerGainChange(ch, parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 accent-sky-400 rounded-lg cursor-pointer"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. 10-Band Graphic Equalizer */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-sky-400" />
                10-Band Graphic Equalizer
              </label>

              {/* EQ Presets */}
              <div className="flex items-center gap-1">
                {Object.keys(EQ_PRESETS).map((p) => (
                  <button
                    key={p}
                    onClick={() => handleEqPresetSelect(p)}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider cursor-pointer transition-colors ${
                      settings.eqPreset === p
                        ? 'bg-sky-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {p.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Equalizer Sliders Container */}
            <div className="bg-slate-900/80 p-3 rounded-xl border border-white/5 flex items-end justify-between gap-1.5 h-40">
              {EQ_FREQUENCIES.map((freq, idx) => {
                const gainVal = settings.eqBands[idx] || 0;
                const freqLabel = freq >= 1000 ? `${freq / 1000}k` : `${freq}`;
                return (
                  <div key={freq} className="flex-1 flex flex-col items-center h-full justify-between">
                    <span className="text-[9px] font-mono text-slate-400">
                      {gainVal > 0 ? `+${gainVal}` : gainVal}
                    </span>
                    <input
                      type="range"
                      min="-12"
                      max="12"
                      step="0.5"
                      value={gainVal}
                      onChange={(e) => handleEqBandChange(idx, parseFloat(e.target.value))}
                      className="h-24 w-1.5 bg-slate-800 accent-sky-400 rounded-lg cursor-pointer [writing-mode:vertical-lr] [direction:rtl]"
                    />
                    <span className="text-[10px] font-mono text-slate-300 font-bold">{freqLabel}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
