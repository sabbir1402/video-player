import React, { useRef } from 'react';
import { SubtitleSettings, SubtitleTrack } from '../types';
import {
  FileText,
  Type,
  Palette,
  Clock,
  RotateCcw,
  X,
  Upload,
  Layers,
  MoveVertical,
} from 'lucide-react';

interface SubtitleSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SubtitleSettings;
  onChangeSettings: (newSettings: SubtitleSettings) => void;
  tracks: SubtitleTrack[];
  activeTrackId: string | null;
  onSelectTrack: (trackId: string | null) => void;
  onLoadSubtitleFile: (file: File) => void;
}

export const SubtitleSettingsModal: React.FC<SubtitleSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onChangeSettings,
  tracks,
  activeTrackId,
  onSelectTrack,
  onLoadSubtitleFile,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const fontFamilies = [
    { label: 'Plus Jakarta Sans (Clean)', value: "'Plus Jakarta Sans', sans-serif" },
    { label: 'JetBrains Mono (Technical)', value: "'JetBrains Mono', monospace" },
    { label: 'Impact (Cinema Classic)', value: 'Impact, sans-serif' },
    { label: 'Trebuchet MS (High Legibility)', value: "'Trebuchet MS', sans-serif" },
    { label: 'Georgia (Editorial Serif)', value: 'Georgia, serif' },
  ];

  const colorPresets = [
    { label: 'White', value: '#FFFFFF' },
    { label: 'Cinema Yellow', value: '#FACC15' },
    { label: 'Cyan', value: '#38BDF8' },
    { label: 'Amber', value: '#FB923C' },
    { label: 'Mint', value: '#4ADE80' },
  ];

  const handleAdjustSync = (deltaMs: number) => {
    onChangeSettings({
      ...settings,
      syncOffsetMs: settings.syncOffsetMs + deltaMs,
    });
  };

  const handleReset = () => {
    onChangeSettings({
      isEnabled: true,
      fontSize: 26,
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      textColor: '#FFFFFF',
      backgroundColor: '#000000',
      bgOpacity: 40,
      textShadow: 'outline',
      positionY: 8,
      syncOffsetMs: 0,
      letterSpacing: 0,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0f141f] border border-white/15 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 md:p-5 border-b border-white/10 flex items-center justify-between sticky top-0 bg-[#0f141f]/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Customizable Subtitles & Timing Engine
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Multi-format support (.SRT, .VTT, .ASS), typography, shadows & sync delay
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer text-xs flex items-center gap-1"
              title="Reset to Defaults"
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

        {/* Body */}
        <div className="p-4 md:p-6 space-y-6">
          {/* 1. Track Selection & File Upload */}
          <div className="bg-slate-900/60 p-4 rounded-xl border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Select Subtitle Track
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept=".srt,.vtt,.ass,.ssa"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    onLoadSubtitleFile(e.target.files[0]);
                  }
                }}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 border border-amber-500/30 text-xs font-semibold cursor-pointer transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                Upload .SRT / .VTT / .ASS
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => onSelectTrack(null)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                  activeTrackId === null
                    ? 'bg-sky-600 text-white font-bold'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Off (None)
              </button>
              {tracks.map((t) => (
                <button
                  key={t.id}
                  onClick={() => onSelectTrack(t.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors ${
                    activeTrackId === t.id
                      ? 'bg-amber-600 text-white font-bold shadow-md shadow-amber-950/50'
                      : 'bg-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  <span>{t.label}</span>
                  <span className="text-[10px] font-mono opacity-60 uppercase">[{t.format}]</span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Typography & Sizing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5 text-sky-400" />
                Font Family
              </label>
              <select
                value={settings.fontFamily}
                onChange={(e) => onChangeSettings({ ...settings, fontFamily: e.target.value })}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500 cursor-pointer"
              >
                {fontFamilies.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5 text-xs">
                <label className="font-semibold text-slate-300">Font Size</label>
                <span className="font-mono text-sky-400 font-bold">{settings.fontSize} px</span>
              </div>
              <input
                type="range"
                min="14"
                max="54"
                step="1"
                value={settings.fontSize}
                onChange={(e) =>
                  onChangeSettings({ ...settings, fontSize: parseInt(e.target.value) })
                }
                className="w-full h-2 bg-slate-800 accent-sky-400 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* 3. Colors & Outline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-amber-400" />
                Text Color
              </label>
              <div className="flex items-center gap-2">
                {colorPresets.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => onChangeSettings({ ...settings, textColor: c.value })}
                    style={{ backgroundColor: c.value }}
                    className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer ${
                      settings.textColor === c.value
                        ? 'border-white scale-110 shadow-lg'
                        : 'border-transparent opacity-80 hover:opacity-100'
                    }`}
                    title={c.label}
                  />
                ))}
                <input
                  type="color"
                  value={settings.textColor}
                  onChange={(e) => onChangeSettings({ ...settings, textColor: e.target.value })}
                  className="w-7 h-7 bg-transparent cursor-pointer rounded-full overflow-hidden"
                  title="Custom color"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-purple-400" />
                Text Shadow / Outline Style
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {(['outline', 'subtle', 'glow', 'none'] as const).map((style) => (
                  <button
                    key={style}
                    onClick={() => onChangeSettings({ ...settings, textShadow: style })}
                    className={`py-1.5 rounded-lg text-xs font-medium uppercase tracking-wider cursor-pointer transition-colors ${
                      settings.textShadow === style
                        ? 'bg-purple-600 text-white font-bold'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 4. Background Box Opacity & Position */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5 text-xs">
                <label className="font-semibold text-slate-300">Background Box Opacity</label>
                <span className="font-mono text-slate-400">{settings.bgOpacity}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={settings.bgOpacity}
                onChange={(e) =>
                  onChangeSettings({ ...settings, bgOpacity: parseInt(e.target.value) })
                }
                className="w-full h-2 bg-slate-800 accent-amber-400 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5 text-xs">
                <label className="font-semibold text-slate-300 flex items-center gap-1">
                  <MoveVertical className="w-3.5 h-3.5" />
                  Vertical Position (% from bottom)
                </label>
                <span className="font-mono text-slate-400">{settings.positionY}%</span>
              </div>
              <input
                type="range"
                min="2"
                max="30"
                step="1"
                value={settings.positionY}
                onChange={(e) =>
                  onChangeSettings({ ...settings, positionY: parseInt(e.target.value) })
                }
                className="w-full h-2 bg-slate-800 accent-sky-400 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* 5. Subtitle Sync Offset (Audio/Video delay calibration) */}
          <div className="bg-slate-900/60 p-4 rounded-xl border border-white/5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-sky-400" />
                Subtitle Sync Offset (Delay / Advance)
              </span>
              <span
                className={`text-xs font-mono font-bold ${
                  settings.syncOffsetMs > 0
                    ? 'text-emerald-400'
                    : settings.syncOffsetMs < 0
                    ? 'text-rose-400'
                    : 'text-slate-400'
                }`}
              >
                {settings.syncOffsetMs > 0 ? `+${settings.syncOffsetMs}` : settings.syncOffsetMs} ms
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleAdjustSync(-500)}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono cursor-pointer"
              >
                -500ms
              </button>
              <button
                onClick={() => handleAdjustSync(-50)}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono cursor-pointer"
              >
                -50ms
              </button>
              <button
                onClick={() => onChangeSettings({ ...settings, syncOffsetMs: 0 })}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                Reset Sync
              </button>
              <button
                onClick={() => handleAdjustSync(50)}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono cursor-pointer"
              >
                +50ms
              </button>
              <button
                onClick={() => handleAdjustSync(500)}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono cursor-pointer"
              >
                +500ms
              </button>
            </div>
          </div>

          {/* 6. Live Subtitle Preview Window */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Real-time Subtitle Visual Preview
            </label>
            <div className="h-28 bg-[#090b10] border border-white/10 rounded-xl flex items-center justify-center p-4 relative overflow-hidden bg-cover bg-center">
              {/* Background preview image */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/80" />

              {/* Subtitle text preview element */}
              <div
                className="relative z-10 text-center font-medium max-w-md transition-all"
                style={{
                  fontFamily: settings.fontFamily,
                  fontSize: `${Math.min(32, settings.fontSize)}px`,
                  color: settings.textColor,
                  backgroundColor:
                    settings.bgOpacity > 0
                      ? `${settings.backgroundColor}${Math.round(
                          (settings.bgOpacity / 100) * 255
                        )
                          .toString(16)
                          .padStart(2, '0')}`
                      : 'transparent',
                  textShadow:
                    settings.textShadow === 'outline'
                      ? '-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000, 0 3px 6px rgba(0,0,0,0.9)'
                      : settings.textShadow === 'subtle'
                      ? '0 2px 4px rgba(0,0,0,0.8)'
                      : settings.textShadow === 'glow'
                      ? '0 0 10px rgba(56, 189, 248, 0.8)'
                      : 'none',
                  padding: settings.bgOpacity > 0 ? '4px 14px' : '0px',
                  borderRadius: '6px',
                }}
              >
                "Sample Subtitle: Crystal clear high-definition rendering"
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
