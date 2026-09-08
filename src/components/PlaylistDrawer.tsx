import React, { useState } from 'react';
import { MediaItem } from '../types';
import { formatTime } from '../services/subtitleParser';
import {
  ListVideo,
  X,
  Play,
  Trash2,
  Plus,
  Radio,
  Film,
  Music,
  Search,
  Sparkles,
} from 'lucide-react';

interface PlaylistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  playlist: MediaItem[];
  currentMediaId: string | null;
  onSelectMedia: (item: MediaItem) => void;
  onRemoveMedia: (id: string) => void;
  onOpenFiles: () => void;
  onLoadDemos: () => void;
}

export const PlaylistDrawer: React.FC<PlaylistDrawerProps> = ({
  isOpen,
  onClose,
  playlist,
  currentMediaId,
  onSelectMedia,
  onRemoveMedia,
  onOpenFiles,
  onLoadDemos,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filtered = playlist.filter((m) =>
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.format.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-[#0c1017]/95 backdrop-blur-xl border-l border-white/10 z-50 flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ListVideo className="w-5 h-5 text-sky-400" />
          <h3 className="font-bold text-white text-sm">Media Playlist & Queue</h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
            {playlist.length}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Search & Actions Bar */}
      <div className="p-3 border-b border-white/5 space-y-2">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search MKV, AVI, FLAC, titles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/80 border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenFiles}
            className="flex-1 py-1.5 rounded-lg bg-sky-600/20 hover:bg-sky-600/30 text-sky-400 border border-sky-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Media Files
          </button>
          <button
            onClick={onLoadDemos}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors"
            title="Reload Built-in High-Res Demos"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Demos
          </button>
        </div>
      </div>

      {/* Playlist Items */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filtered.length > 0 ? (
          filtered.map((item) => {
            const isCurrent = currentMediaId === item.id;
            return (
              <div
                key={item.id}
                className={`group flex items-center justify-between p-2 rounded-xl transition-all ${
                  isCurrent
                    ? 'bg-sky-600/20 border border-sky-500/40 shadow-sm'
                    : 'hover:bg-white/5 border border-transparent'
                }`}
              >
                <div
                  onClick={() => onSelectMedia(item)}
                  className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-lg bg-slate-800 shrink-0 flex items-center justify-center overflow-hidden relative">
                    {item.thumbnail ? (
                      <img src={item.thumbnail} alt="" className="w-full h-full object-cover" />
                    ) : item.type === 'video' ? (
                      <Film className="w-4 h-4 text-sky-400" />
                    ) : (
                      <Music className="w-4 h-4 text-emerald-400" />
                    )}

                    {isCurrent && (
                      <div className="absolute inset-0 bg-sky-600/60 flex items-center justify-center">
                        <Play className="w-3.5 h-3.5 text-white fill-white" />
                      </div>
                    )}
                  </div>

                  <div className="truncate flex-1">
                    <div
                      className={`text-xs font-medium truncate ${
                        isCurrent ? 'text-sky-300 font-bold' : 'text-slate-200'
                      }`}
                    >
                      {item.title}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                      <span className="uppercase text-sky-400 font-bold">{item.format}</span>
                      <span>•</span>
                      <span>{item.resolution || (item.format === 'flac' ? '24-Bit / 96kHz' : 'UHD')}</span>
                      <span>•</span>
                      <span>{formatTime(item.duration)}</span>
                    </div>
                  </div>
                </div>

                {/* Remove button */}
                <button
                  onClick={() => onRemoveMedia(item.id)}
                  className="p-1.5 rounded-md text-slate-500 hover:text-rose-400 hover:bg-slate-800 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                  title="Remove from playlist"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 text-slate-500 text-xs">
            No media found matching query.
          </div>
        )}
      </div>
    </div>
  );
};
