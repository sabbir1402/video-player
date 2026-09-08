import React, { useState } from 'react';
import { MediaItem, RecentlyPlayedItem } from '../types';
import { formatTime, formatRelativeTime } from '../services/subtitleParser';
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
  Clock,
  History,
  ListPlus,
  Check,
  RotateCcw,
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
  recentlyPlayed: RecentlyPlayedItem[];
  onClearRecentlyPlayed: () => void;
  onRemoveRecentMedia: (id: string) => void;
  onAddToPlaylist: (item: MediaItem) => void;
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
  recentlyPlayed,
  onClearRecentlyPlayed,
  onRemoveRecentMedia,
  onAddToPlaylist,
}) => {
  const [activeTab, setActiveTab] = useState<'queue' | 'recent'>('queue');
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);

  if (!isOpen) return null;

  const filteredQueue = playlist.filter(
    (m) =>
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.format.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRecent = recentlyPlayed.filter(
    (m) =>
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.format.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isItemInQueue = (id: string) => playlist.some((p) => p.id === id);

  return (
    <>
      {/* Mobile Touch Backdrop */}
      <div
        id="playlist-backdrop-mobile"
        className="fixed inset-0 bg-black/70 backdrop-blur-xs z-40 sm:hidden animate-in fade-in"
        onClick={onClose}
      />
      <div
        id="playlist-drawer-panel"
        className="fixed inset-y-0 right-0 w-full sm:w-96 max-w-full bg-[#0c1017]/98 backdrop-blur-xl border-l border-white/10 z-50 flex flex-col shadow-2xl animate-in slide-in-from-right duration-200"
      >
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#101420]/80">
        <div className="flex items-center gap-2">
          <ListVideo className="w-5 h-5 text-sky-400" />
          <h3 className="font-bold text-white text-sm">Media Library</h3>
        </div>
        <button
          id="btn-close-playlist-drawer"
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs: Queue vs Recently Played */}
      <div className="flex border-b border-white/10 bg-[#090d14] px-2 pt-1">
        <button
          id="tab-playlist-queue"
          onClick={() => setActiveTab('queue')}
          className={`flex items-center gap-2 py-2.5 px-3 text-xs font-semibold border-b-2 cursor-pointer transition-all flex-1 justify-center ${
            activeTab === 'queue'
              ? 'border-sky-500 text-sky-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ListVideo className="w-3.5 h-3.5" />
          <span>Queue</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
              activeTab === 'queue'
                ? 'bg-sky-500/20 text-sky-300'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            {playlist.length}
          </span>
        </button>

        <button
          id="tab-playlist-recent"
          onClick={() => setActiveTab('recent')}
          className={`flex items-center gap-2 py-2.5 px-3 text-xs font-semibold border-b-2 cursor-pointer transition-all flex-1 justify-center ${
            activeTab === 'recent'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Recently Played</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
              activeTab === 'recent'
                ? 'bg-amber-500/20 text-amber-300'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            {recentlyPlayed.length}
          </span>
        </button>
      </div>

      {/* Search & Actions Bar */}
      <div className="p-3 border-b border-white/5 space-y-2 bg-[#090c13]/50">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="input-search-playlist"
            type="text"
            placeholder={
              activeTab === 'queue'
                ? 'Search queue (MKV, FLAC, titles)...'
                : 'Search recently played history...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/80 border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
          />
        </div>

        {activeTab === 'queue' ? (
          <div className="flex items-center gap-2">
            <button
              id="btn-add-media-files"
              onClick={onOpenFiles}
              className="flex-1 py-1.5 rounded-lg bg-sky-600/20 hover:bg-sky-600/30 text-sky-400 border border-sky-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Media Files
            </button>
            <button
              id="btn-reload-demos"
              onClick={onLoadDemos}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors"
              title="Reload Built-in High-Res Demos"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Demos
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between text-xs px-1">
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-mono">
              <Clock className="w-3 h-3 text-amber-400" />
              <span>Saved locally in browser</span>
            </div>

            {recentlyPlayed.length > 0 && (
              <div>
                {confirmClear ? (
                  <div className="flex items-center gap-1.5 animate-in fade-in duration-150">
                    <span className="text-[11px] text-rose-300">Clear all?</span>
                    <button
                      onClick={() => {
                        onClearRecentlyPlayed();
                        setConfirmClear(false);
                      }}
                      className="px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold cursor-pointer"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => setConfirmClear(false)}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] cursor-pointer"
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    id="btn-clear-recently-played"
                    onClick={() => setConfirmClear(true)}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-rose-400 cursor-pointer transition-colors"
                    title="Clear Recently Played History"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear History</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Content: Active Tab Content */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {activeTab === 'queue' ? (
          <>
            {filteredQueue.length > 0 ? (
              filteredQueue.map((item) => {
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
                No media in queue matching query.
              </div>
            )}

            {/* Quick jump to recently played if available */}
            {recentlyPlayed.length > 0 && (
              <div className="mt-4 pt-3 border-t border-white/5 px-2">
                <button
                  onClick={() => setActiveTab('recent')}
                  className="w-full py-2 px-3 rounded-lg bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/20 text-amber-300 text-xs font-semibold flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <History className="w-3.5 h-3.5 text-amber-400" />
                    <span>View Recently Played History</span>
                  </div>
                  <span className="font-mono text-[11px] bg-amber-500/20 px-1.5 py-0.5 rounded">
                    {recentlyPlayed.length}
                  </span>
                </button>
              </div>
            )}
          </>
        ) : (
          /* RECENTLY PLAYED TAB */
          <>
            {filteredRecent.length > 0 ? (
              filteredRecent.map((item) => {
                const isCurrent = currentMediaId === item.id;
                const inQueue = isItemInQueue(item.id);

                return (
                  <div
                    key={item.id}
                    className={`group flex items-center justify-between p-2.5 rounded-xl transition-all border ${
                      isCurrent
                        ? 'bg-amber-950/25 border-amber-500/40 shadow-sm'
                        : 'bg-slate-900/40 hover:bg-white/5 border-white/5'
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

                        {isCurrent ? (
                          <div className="absolute inset-0 bg-amber-600/70 flex items-center justify-center">
                            <Play className="w-3.5 h-3.5 text-white fill-white" />
                          </div>
                        ) : (
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <Play className="w-3.5 h-3.5 text-white fill-white" />
                          </div>
                        )}
                      </div>

                      <div className="truncate flex-1">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-xs font-semibold truncate ${
                              isCurrent ? 'text-amber-300 font-bold' : 'text-slate-200'
                            }`}
                          >
                            {item.title}
                          </span>
                          {isCurrent && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold tracking-wider uppercase">
                              Active
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                          <span className="uppercase text-amber-400 font-bold">{item.format}</span>
                          <span>•</span>
                          <span>{formatTime(item.duration)}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-slate-400">
                            <Clock className="w-2.5 h-2.5 text-slate-500" />
                            {formatRelativeTime(item.lastPlayedAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      {/* Add to Queue or In Queue indicator */}
                      {!inQueue ? (
                        <button
                          onClick={() => onAddToPlaylist(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-sky-300 hover:bg-sky-500/10 transition-colors cursor-pointer"
                          title="Add to queue"
                        >
                          <ListPlus className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <span
                          className="p-1.5 text-emerald-400"
                          title="Already in queue"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </span>
                      )}

                      {/* Remove from history button */}
                      <button
                        onClick={() => onRemoveRecentMedia(item.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Remove from history"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 px-4 space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-800/80 border border-white/10 flex items-center justify-center mx-auto text-slate-400">
                  <History className="w-6 h-6 text-slate-500" />
                </div>
                <div className="text-xs font-semibold text-slate-300">
                  No recently played files yet
                </div>
                <p className="text-[11px] text-slate-500 max-w-xs mx-auto leading-relaxed">
                  Media files you open, stream, or listen to will appear here and persist in your browser for fast resumption.
                </p>
                <button
                  onClick={onLoadDemos}
                  className="mt-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Load Sample Media
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
    </>
  );
};

