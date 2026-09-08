import React from 'react';
import { HardwareInfo, VideoEnhancements } from '../types';
import {
  Sliders,
  Cpu,
  Sun,
  Contrast,
  Crop,
  RotateCcw,
  X,
  CheckCircle,
  Eye,
  Tv,
} from 'lucide-react';

interface VideoSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  enhancements: VideoEnhancements;
  onChangeEnhancements: (enhancements: VideoEnhancements) => void;
  hardwareInfo: HardwareInfo;
}

export const VideoSettingsModal: React.FC<VideoSettingsModalProps> = ({
  isOpen,
  onClose,
  enhancements,
  onChangeEnhancements,
  hardwareInfo,
}) => {
  if (!isOpen) return null;

  const handleReset = () => {
    onChangeEnhancements({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      hue: 0,
      sharpness: 0,
      deinterlace: false,
      hdrToneMap: false,
      aspectRatio: 'original',
      hardwareAccelerated: true,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0f141f] border border-white/15 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 md:p-5 border-b border-white/10 flex items-center justify-between sticky top-0 bg-[#0f141f]/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Hardware Acceleration & Video Enhancer
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                GPU hardware rendering pipeline, aspect ratio & color grading
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer text-xs flex items-center gap-1"
              title="Reset Picture Settings"
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

        {/* Content */}
        <div className="p-4 md:p-6 space-y-6">
          {/* 1. Hardware Acceleration Diagnostics Card */}
          <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900/60 to-slate-900/40 p-4 rounded-xl border border-emerald-500/30">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                Hardware Acceleration Engine: ACTIVE
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                GPU COMPOSITOR ON
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div className="bg-black/30 p-2.5 rounded-lg border border-white/5">
                <div className="text-slate-500 text-[10px] uppercase">GPU Graphics Renderer</div>
                <div className="text-slate-200 truncate font-semibold mt-0.5" title={hardwareInfo.renderer}>
                  {hardwareInfo.renderer}
                </div>
              </div>
              <div className="bg-black/30 p-2.5 rounded-lg border border-white/5">
                <div className="text-slate-500 text-[10px] uppercase">Texture & 4K/8K Engine</div>
                <div className="text-slate-200 font-semibold mt-0.5">
                  Up to {hardwareInfo.maxTextureSize}px (Full 4K/8K HDR Ready)
                </div>
              </div>
            </div>
          </div>

          {/* 2. Aspect Ratio & Display Modes */}
          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2.5 flex items-center gap-1.5">
              <Crop className="w-3.5 h-3.5 text-sky-400" />
              Aspect Ratio & Frame Geometry
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { id: 'original', label: 'Original', desc: 'Auto Container' },
                { id: '16:9', label: '16:9 Widescreen', desc: 'Standard HDTV' },
                { id: '21:9', label: '21:9 CinemaScope', desc: 'Anamorphic Ultrawide' },
                { id: '4:3', label: '4:3 Classic', desc: 'Legacy TV' },
                { id: 'fill', label: 'Fill Window', desc: 'Stretch / Zoom' },
              ].map((ar) => {
                const active = enhancements.aspectRatio === ar.id;
                return (
                  <button
                    key={ar.id}
                    onClick={() =>
                      onChangeEnhancements({ ...enhancements, aspectRatio: ar.id as any })
                    }
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      active
                        ? 'bg-sky-600/20 border-sky-500 text-white font-bold shadow-md shadow-sky-950/40'
                        : 'bg-slate-900/60 border-white/5 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="text-xs">{ar.label}</div>
                    <div className="text-[10px] text-slate-500">{ar.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Picture Controls (Brightness, Contrast, Saturation, Sharpness) */}
          <div className="space-y-4 bg-slate-900/40 p-4 rounded-xl border border-white/5">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
              Hardware Color Correction & Clarity
            </span>

            {/* Brightness & Contrast */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-300 flex items-center gap-1">
                    <Sun className="w-3 h-3 text-amber-400" /> Brightness
                  </span>
                  <span className="font-mono text-slate-400">{enhancements.brightness}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="150"
                  value={enhancements.brightness}
                  onChange={(e) =>
                    onChangeEnhancements({ ...enhancements, brightness: parseInt(e.target.value) })
                  }
                  className="w-full h-1.5 bg-slate-800 accent-amber-400 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-300 flex items-center gap-1">
                    <Contrast className="w-3 h-3 text-sky-400" /> Contrast
                  </span>
                  <span className="font-mono text-slate-400">{enhancements.contrast}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="150"
                  value={enhancements.contrast}
                  onChange={(e) =>
                    onChangeEnhancements({ ...enhancements, contrast: parseInt(e.target.value) })
                  }
                  className="w-full h-1.5 bg-slate-800 accent-sky-400 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* Saturation & Sharpness */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-300">Color Saturation</span>
                  <span className="font-mono text-slate-400">{enhancements.saturation}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={enhancements.saturation}
                  onChange={(e) =>
                    onChangeEnhancements({ ...enhancements, saturation: parseInt(e.target.value) })
                  }
                  className="w-full h-1.5 bg-slate-800 accent-emerald-400 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-300">Hardware Sharpness Unsharp Mask</span>
                  <span className="font-mono text-slate-400">{enhancements.sharpness}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={enhancements.sharpness}
                  onChange={(e) =>
                    onChangeEnhancements({ ...enhancements, sharpness: parseInt(e.target.value) })
                  }
                  className="w-full h-1.5 bg-slate-800 accent-purple-400 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* 4. Advanced Toggles: HDR Tone Mapping & Deinterlacing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() =>
                onChangeEnhancements({ ...enhancements, hdrToneMap: !enhancements.hdrToneMap })
              }
              className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-colors cursor-pointer ${
                enhancements.hdrToneMap
                  ? 'bg-amber-600/20 border-amber-500/40 text-white'
                  : 'bg-slate-900/60 border-white/5 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className={`w-5 h-5 shrink-0 mt-0.5 ${enhancements.hdrToneMap ? 'text-amber-400' : 'text-slate-500'}`} />
              <div>
                <div className="text-xs font-bold">HDR Dynamic Tone Mapping</div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Boosts dynamic range and highlights in dark cinema scenes.
                </div>
              </div>
            </button>

            <button
              onClick={() =>
                onChangeEnhancements({ ...enhancements, deinterlace: !enhancements.deinterlace })
              }
              className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-colors cursor-pointer ${
                enhancements.deinterlace
                  ? 'bg-sky-600/20 border-sky-500/40 text-white'
                  : 'bg-slate-900/60 border-white/5 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Tv className={`w-5 h-5 shrink-0 mt-0.5 ${enhancements.deinterlace ? 'text-sky-400' : 'text-slate-500'}`} />
              <div>
                <div className="text-xs font-bold">Deinterlacing Simulation</div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Eliminates comb lines on legacy interlaced AVI / DV video.
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
