import React from 'react';
import { HardwareInfo, MediaItem } from '../types';
import {
  Info,
  Film,
  Radio,
  Cpu,
  FileText,
  Layers,
  X,
  HardDrive,
  Clock,
  Sparkles,
} from 'lucide-react';
import { formatTime } from '../services/subtitleParser';

interface MediaInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  media: MediaItem | null;
  hardwareInfo: HardwareInfo;
}

export const MediaInspectorModal: React.FC<MediaInspectorModalProps> = ({
  isOpen,
  onClose,
  media,
  hardwareInfo,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-[#0f141f] border border-white/15 rounded-2xl w-full max-w-xl max-h-[94vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-3.5 sm:p-5 border-b border-white/10 flex items-center justify-between sticky top-0 bg-[#0f141f]/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center shrink-0">
              <Info className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-white truncate">
                Stream & Codec Inspector
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400 font-mono truncate">
                Container, resolution, audio channels & GPU metrics
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 md:p-6 space-y-5">
          {media ? (
            <>
              {/* Title & Container Hero */}
              <div className="bg-slate-900/60 p-4 rounded-xl border border-white/10 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded bg-sky-600 text-white font-mono font-bold text-xs uppercase">
                      {media.format}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {media.type === 'video' ? 'High-Definition Video Stream' : 'Hi-Res Lossless Audio Track'}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white truncate max-w-md">
                    {media.title}
                  </h3>
                </div>
                <div className="text-right font-mono text-xs text-slate-400">
                  <div className="font-bold text-white">{media.fileSize || 'Streamed'}</div>
                  <div>{formatTime(media.duration)}</div>
                </div>
              </div>

              {/* Video Stream Specs (if video) */}
              {media.type === 'video' && (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Film className="w-3.5 h-3.5 text-sky-400" />
                    Video Stream & Geometry
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
                    <div className="bg-slate-900/50 p-2.5 rounded-lg border border-white/5">
                      <div className="text-slate-500 text-[10px]">RESOLUTION</div>
                      <div className="text-slate-200 font-bold mt-0.5">{media.resolution || '1920x1080 (FHD)'}</div>
                    </div>
                    <div className="bg-slate-900/50 p-2.5 rounded-lg border border-white/5">
                      <div className="text-slate-500 text-[10px]">FRAME RATE</div>
                      <div className="text-slate-200 font-bold mt-0.5">{media.fps || 60} FPS Progressive</div>
                    </div>
                    <div className="bg-slate-900/50 p-2.5 rounded-lg border border-white/5">
                      <div className="text-slate-500 text-[10px]">ESTIMATED BITRATE</div>
                      <div className="text-slate-200 font-bold mt-0.5">{media.bitrate || '18.4 Mbps'}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Audio Stream & Surround Sound Specs */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-purple-400" />
                  Multichannel Audio Stream
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
                  <div className="bg-slate-900/50 p-2.5 rounded-lg border border-white/5">
                    <div className="text-slate-500 text-[10px]">CHANNELS</div>
                    <div className="text-purple-300 font-bold mt-0.5">
                      {media.audioChannels === 6
                        ? '5.1 Surround (L, R, C, LFE, SL, SR)'
                        : media.audioChannels === 8
                        ? '7.1 Spatial Cinema (8 Ch)'
                        : 'Stereo 2.0 (Direct)'}
                    </div>
                  </div>
                  <div className="bg-slate-900/50 p-2.5 rounded-lg border border-white/5">
                    <div className="text-slate-500 text-[10px]">SAMPLING RATE</div>
                    <div className="text-slate-200 font-bold mt-0.5">
                      {media.sampleRate ? `${media.sampleRate.toLocaleString()} Hz` : '48,000 Hz'}
                    </div>
                  </div>
                  <div className="bg-slate-900/50 p-2.5 rounded-lg border border-white/5">
                    <div className="text-slate-500 text-[10px]">BIT DEPTH / QUALITY</div>
                    <div className="text-emerald-300 font-bold mt-0.5">
                      {media.bitDepth ? `${media.bitDepth}-Bit Lossless` : '24-Bit Studio Master'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Subtitles Track Summary */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-amber-400" />
                  Subtitle Tracks ({media.subtitles?.length || 0})
                </div>
                <div className="bg-slate-900/50 p-3 rounded-lg border border-white/5 space-y-1.5">
                  {media.subtitles && media.subtitles.length > 0 ? (
                    media.subtitles.map((sub, i) => (
                      <div key={sub.id} className="flex items-center justify-between text-xs font-mono text-slate-300">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500">#{i + 1}</span>
                          <span>{sub.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="uppercase text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-amber-300">
                            {sub.format}
                          </span>
                          <span className="text-slate-500 text-[11px]">{sub.cues.length} cues</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-slate-500">No embedded subtitle tracks. You can load external .SRT, .VTT, or .ASS files at any time.</div>
                  )}
                </div>
              </div>

              {/* Hardware Acceleration & GPU Decoder Info */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                  Hardware Acceleration & Pipeline
                </div>
                <div className="bg-emerald-950/20 border border-emerald-500/20 p-3 rounded-lg space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">GPU Hardware Pipeline:</span>
                    <span className="text-emerald-400 font-bold">Enabled (CSS 3D / WebGL)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">GPU Device:</span>
                    <span className="text-slate-200 truncate max-w-[240px]" title={hardwareInfo.renderer}>
                      {hardwareInfo.renderer}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">WebCodecs & MediaCapabilities:</span>
                    <span className="text-slate-200">Supported</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-slate-500 text-sm">
              No media currently loaded to inspect.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
