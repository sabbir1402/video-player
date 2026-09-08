import React, { useEffect, useRef, useState } from 'react';
import { audioEngine } from '../services/audioEngine';
import { SurroundSettings } from '../types';
import { Activity, BarChart2, Radio, Disc3 } from 'lucide-react';

interface AudioVisualizerProps {
  isPlaying: boolean;
  surroundSettings: SurroundSettings;
  mediaType: 'video' | 'audio';
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  isPlaying,
  surroundSettings,
  mediaType,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [visMode, setVisMode] = useState<'spectrum' | 'surround_matrix' | 'waveform'>('spectrum');
  const [levels, setLevels] = useState<{ [key: string]: number }>({
    L: 0,
    R: 0,
    C: 0,
    LFE: 0,
    SL: 0,
    SR: 0,
    BL: 0,
    BR: 0,
  });

  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    let active = true;

    const render = () => {
      if (!active) return;

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const width = canvas.width;
          const height = canvas.height;

          // Clear
          ctx.clearRect(0, 0, width, height);

          if (visMode === 'spectrum') {
            const freqData = new Uint8Array(64);
            audioEngine.getMasterFrequencyData(freqData);

            const barWidth = width / 48;
            const barSpacing = 2;

            for (let i = 0; i < 48; i++) {
              const value = isPlaying ? freqData[i] || 0 : Math.sin(Date.now() / 300 + i) * 10 + 15;
              const barHeight = Math.max(4, (value / 255) * (height - 8));

              // Gradient
              const grad = ctx.createLinearGradient(0, height, 0, height - barHeight);
              grad.addColorStop(0, '#0284c7'); // sky-600
              grad.addColorStop(0.6, '#38bdf8'); // sky-400
              grad.addColorStop(1, '#c084fc'); // purple-400

              ctx.fillStyle = grad;
              ctx.beginPath();
              ctx.roundRect(
                i * (barWidth + barSpacing) + 4,
                height - barHeight - 2,
                barWidth,
                barHeight,
                [2, 2, 0, 0]
              );
              ctx.fill();
            }
          } else if (visMode === 'waveform') {
            const waveData = new Uint8Array(128);
            audioEngine.getMasterTimeDomainData(waveData);

            ctx.lineWidth = 2;
            ctx.strokeStyle = '#38bdf8';
            ctx.beginPath();

            const sliceWidth = width / 128;
            let x = 0;

            for (let i = 0; i < 128; i++) {
              const v = waveData[i] / 128.0;
              const y = isPlaying ? (v * height) / 2 : height / 2;

              if (i === 0) {
                ctx.moveTo(x, y);
              } else {
                ctx.lineTo(x, y);
              }
              x += sliceWidth;
            }

            ctx.lineTo(width, height / 2);
            ctx.stroke();
          }
        }
      }

      // Update multi-channel levels
      if (isPlaying) {
        setLevels({
          L: audioEngine.getChannelLevel('L'),
          R: audioEngine.getChannelLevel('R'),
          C: audioEngine.getChannelLevel('C'),
          LFE: audioEngine.getChannelLevel('LFE'),
          SL: audioEngine.getChannelLevel('SL'),
          SR: audioEngine.getChannelLevel('SR'),
          BL: audioEngine.getChannelLevel('BL'),
          BR: audioEngine.getChannelLevel('BR'),
        });
      } else {
        setLevels({ L: 0, R: 0, C: 0, LFE: 0, SL: 0, SR: 0, BL: 0, BR: 0 });
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      active = false;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isPlaying, visMode]);

  return (
    <div className="bg-[#0f141f] rounded-xl border border-white/10 p-3.5 shadow-lg flex flex-col gap-3">
      {/* Top Header of visualizer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded bg-sky-500/20 text-sky-400">
            <Radio className="w-3.5 h-3.5" />
          </span>
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Surround Audio Analyzer
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-950/70 border border-purple-500/30 text-purple-300">
            {surroundSettings.mode.toUpperCase()}
          </span>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1 bg-slate-900/80 p-0.5 rounded-lg border border-white/10 text-[11px]">
          <button
            id="btn-vis-spectrum"
            onClick={() => setVisMode('spectrum')}
            className={`px-2 py-0.5 rounded-md flex items-center gap-1 cursor-pointer transition-colors ${
              visMode === 'spectrum' ? 'bg-sky-600 text-white font-medium' : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart2 className="w-3 h-3" />
            Spectrum
          </button>
          <button
            id="btn-vis-matrix"
            onClick={() => setVisMode('surround_matrix')}
            className={`px-2 py-0.5 rounded-md flex items-center gap-1 cursor-pointer transition-colors ${
              visMode === 'surround_matrix' ? 'bg-sky-600 text-white font-medium' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Disc3 className="w-3 h-3" />
            5.1 Matrix
          </button>
          <button
            id="btn-vis-waveform"
            onClick={() => setVisMode('waveform')}
            className={`px-2 py-0.5 rounded-md flex items-center gap-1 cursor-pointer transition-colors ${
              visMode === 'waveform' ? 'bg-sky-600 text-white font-medium' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-3 h-3" />
            Oscilloscope
          </button>
        </div>
      </div>

      {/* Visual Canvas or 5.1 Matrix Layout */}
      {visMode === 'surround_matrix' ? (
        <div className="h-24 bg-[#090b10] rounded-lg border border-white/5 p-2 flex items-center justify-around relative overflow-hidden">
          {/* Surround 3D Room Grid */}
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:12px_12px] opacity-40 pointer-events-none" />

          {/* Center Listener Indicator */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
            <div className="w-6 h-6 rounded-full bg-slate-800 border border-sky-400/50 flex items-center justify-center text-[10px] text-sky-300 font-bold shadow-[0_0_12px_rgba(56,189,248,0.3)]">
              Ω
            </div>
            <span className="text-[9px] text-slate-400 font-mono mt-0.5">SWEET SPOT</span>
          </div>

          {/* Speakers layout: L, C, R, LFE, SL, SR */}
          <div className="w-full h-full flex justify-between items-center relative z-10 px-3">
            {/* Front Left & Rear Left */}
            <div className="flex flex-col justify-between h-full py-1">
              <SpeakerVU name="L (Front Left)" level={levels.L} />
              <SpeakerVU name="SL (Surround L)" level={levels.SL} />
            </div>

            {/* Center & LFE Subwoofer */}
            <div className="flex flex-col justify-between h-full py-1">
              <SpeakerVU name="C (Center Dialogue)" level={levels.C} isCenter />
              <SpeakerVU name="LFE (Subwoofer)" level={levels.LFE} isSub />
            </div>

            {/* Front Right & Rear Right */}
            <div className="flex flex-col justify-between h-full py-1">
              <SpeakerVU name="R (Front Right)" level={levels.R} />
              <SpeakerVU name="SR (Surround R)" level={levels.SR} />
            </div>
          </div>
        </div>
      ) : (
        <div className="h-24 bg-[#090b10] rounded-lg border border-white/5 p-2 flex items-center justify-center overflow-hidden">
          <canvas
            ref={canvasRef}
            width={480}
            height={90}
            className="w-full h-full object-contain"
          />
        </div>
      )}

      {/* Quick 6-Channel Meter Bar */}
      <div className="grid grid-cols-6 gap-1.5 pt-1 border-t border-white/5">
        {[
          { key: 'L', label: 'L', name: 'Left' },
          { key: 'C', label: 'C', name: 'Center' },
          { key: 'R', label: 'R', name: 'Right' },
          { key: 'LFE', label: 'LFE', name: 'Subwoofer' },
          { key: 'SL', label: 'SL', name: 'Surr Left' },
          { key: 'SR', label: 'SR', name: 'Surr Right' },
        ].map((ch) => {
          const val = levels[ch.key] || 0;
          return (
            <div key={ch.key} className="flex flex-col items-center gap-1">
              <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                <div
                  className={`h-full transition-all duration-75 ${
                    ch.key === 'LFE'
                      ? 'bg-amber-400'
                      : ch.key === 'C'
                      ? 'bg-emerald-400'
                      : 'bg-sky-400'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(5, val * 100))}%` }}
                />
              </div>
              <span className="text-[9px] font-mono text-slate-400 font-bold">{ch.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const SpeakerVU: React.FC<{ name: string; level: number; isCenter?: boolean; isSub?: boolean }> = ({
  name,
  level,
  isCenter,
  isSub,
}) => {
  const glow = level > 0.4;
  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-4 h-4 rounded-md border text-[9px] font-bold flex items-center justify-center transition-all ${
          isSub
            ? glow
              ? 'bg-amber-500 text-black border-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.6)]'
              : 'bg-amber-950/40 text-amber-400 border-amber-600/30'
            : isCenter
            ? glow
              ? 'bg-emerald-500 text-black border-emerald-300 shadow-[0_0_10px_rgba(52,211,153,0.6)]'
              : 'bg-emerald-950/40 text-emerald-400 border-emerald-600/30'
            : glow
            ? 'bg-sky-500 text-black border-sky-300 shadow-[0_0_10px_rgba(56,189,248,0.6)]'
            : 'bg-sky-950/40 text-sky-400 border-sky-600/30'
        }`}
      >
        {isSub ? 'SUB' : name.split(' ')[0]}
      </div>
      <div className="text-[10px] text-slate-300 font-mono hidden md:block">{name}</div>
    </div>
  );
};
