import React, { useState } from 'react';
import {
  Download,
  Smartphone,
  Monitor,
  CheckCircle2,
  ExternalLink,
  X,
  Sparkles,
  Zap,
  Volume2,
  Film,
  HardDrive,
  Copy,
  Check,
} from 'lucide-react';
import { BeforeInstallPromptEvent } from '../hooks/usePWAInstall';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  isInstallable: boolean;
  isInstalled: boolean;
  isAndroid: boolean;
  isWindows: boolean;
  onInstall: () => Promise<boolean>;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({
  isOpen,
  onClose,
  isInstallable,
  isInstalled,
  isAndroid,
  isWindows,
  onInstall,
}) => {
  // Default active tab: if user is on Android, default to Android; else if Windows, Windows; else Android
  const [activeTab, setActiveTab] = useState<'android' | 'windows' | 'ios'>(
    isAndroid ? 'android' : isWindows ? 'windows' : 'android'
  );
  const [copied, setCopied] = useState(false);
  const [installing, setInstalling] = useState(false);

  if (!isOpen) return null;

  const handleDirectInstall = async () => {
    setInstalling(true);
    try {
      const res = await onInstall();
      if (res) {
        onClose();
      }
    } finally {
      setInstalling(false);
    }
  };

  const downloadWindowsShortcut = () => {
    const url = window.location.href;
    const shortcutContent = `[InternetShortcut]\nURL=${url}\nIconIndex=0\nIconFile=${url}favicon.ico\n`;
    const blob = new Blob([shortcutContent], { type: 'application/internet-shortcut' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'OmniPlayer Pro.url';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyAppUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#0e121a] border border-white/15 rounded-2xl w-full max-w-xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 md:p-5 border-b border-white/10 flex items-center justify-between sticky top-0 bg-[#0e121a]/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 p-0.5 shadow-lg shadow-sky-500/20">
              <div className="w-full h-full bg-[#090b10] rounded-[10px] flex items-center justify-center">
                <Download className="w-5 h-5 text-sky-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  Install OmniPlayer Pro
                </h2>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold">
                  OFFLINE READY
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Native standalone multimedia app for Android and Windows
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Operating System Tabs */}
        <div className="px-4 pt-3 pb-0 flex gap-2 border-b border-white/10 bg-slate-900/40">
          <button
            onClick={() => setActiveTab('android')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-all border-b-2 cursor-pointer ${
              activeTab === 'android'
                ? 'border-sky-500 text-sky-400 bg-sky-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Android (Phone / Tablet / TV)</span>
          </button>

          <button
            onClick={() => setActiveTab('windows')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-all border-b-2 cursor-pointer ${
              activeTab === 'windows'
                ? 'border-sky-500 text-sky-400 bg-sky-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span>Windows (10 / 11 Desktop)</span>
          </button>

          <button
            onClick={() => setActiveTab('ios')}
            className={`flex items-center gap-2 px-3 py-2.5 text-xs font-semibold rounded-t-lg transition-all border-b-2 cursor-pointer ${
              activeTab === 'ios'
                ? 'border-sky-500 text-sky-400 bg-sky-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>iOS / Other</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-4 md:p-6 space-y-5">
          {/* Quick status if already installed */}
          {isInstalled && (
            <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-3 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div className="text-xs text-emerald-300 font-medium">
                OmniPlayer is already installed and running in native standalone window mode!
              </div>
            </div>
          )}

          {/* Android Tab */}
          {activeTab === 'android' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Direct Install CTA */}
              <div className="bg-gradient-to-br from-emerald-950/40 via-slate-900/60 to-sky-950/40 border border-emerald-500/30 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px] uppercase font-mono">
                      1-Click Android PWA
                    </span>
                    <span className="text-xs text-slate-300 font-medium">Chrome / Edge / Samsung</span>
                  </div>
                  <div className="text-sm font-bold text-white">
                    Add to Android Home Screen & App Drawer
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Launches full-screen like a native APK with zero browser address bar
                  </div>
                </div>

                {isInstallable ? (
                  <button
                    onClick={handleDirectInstall}
                    disabled={installing}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0"
                  >
                    <Download className="w-4 h-4" />
                    {installing ? 'Prompting...' : 'Install on Android'}
                  </button>
                ) : (
                  <button
                    onClick={copyAppUrl}
                    className="w-full sm:w-auto px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-white/10 transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'URL Copied!' : 'Copy Link for Android'}
                  </button>
                )}
              </div>

              {/* Step-by-Step Android Guide */}
              <div className="bg-slate-900/50 rounded-xl border border-white/10 p-4 space-y-3">
                <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-sky-400" />
                  Manual Installation Steps on Android
                </div>

                <div className="space-y-2.5 text-xs text-slate-300">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                      1
                    </span>
                    <div>
                      Open this URL in <strong>Google Chrome</strong>, <strong>Microsoft Edge</strong>, or <strong>Samsung Internet</strong> on your Android phone or tablet.
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                      2
                    </span>
                    <div>
                      Tap the <strong>three dots menu (⋮)</strong> in the top-right or bottom-right corner.
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                      3
                    </span>
                    <div>
                      Select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                      4
                    </span>
                    <div>
                      OmniPlayer will appear on your Android Home Screen and App Drawer with custom high-res icons and standalone window controls.
                    </div>
                  </div>
                </div>
              </div>

              {/* Android Features */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="bg-slate-900/40 p-2.5 rounded-lg border border-white/5 flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>GPU HW Acceleration</span>
                </div>
                <div className="bg-slate-900/40 p-2.5 rounded-lg border border-white/5 flex items-center gap-2">
                  <Volume2 className="w-3.5 h-3.5 text-purple-400" />
                  <span>5.1 Audio Matrix Engine</span>
                </div>
                <div className="bg-slate-900/40 p-2.5 rounded-lg border border-white/5 flex items-center gap-2">
                  <Film className="w-3.5 h-3.5 text-sky-400" />
                  <span>MKV, AVI & FLAC Native</span>
                </div>
                <div className="bg-slate-900/40 p-2.5 rounded-lg border border-white/5 flex items-center gap-2">
                  <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Offline Cache Storage</span>
                </div>
              </div>
            </div>
          )}

          {/* Windows Tab */}
          {activeTab === 'windows' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Direct Install CTA */}
              <div className="bg-gradient-to-br from-sky-950/40 via-slate-900/60 to-indigo-950/40 border border-sky-500/30 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 font-bold text-[10px] uppercase font-mono">
                      Windows 10 / 11 Native
                    </span>
                    <span className="text-xs text-slate-300 font-medium">Desktop Standalone</span>
                  </div>
                  <div className="text-sm font-bold text-white">
                    Install OmniPlayer to Windows Taskbar
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Pins to Windows Start Menu, Taskbar, and supports Windows media keys
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  {isInstallable ? (
                    <button
                      onClick={handleDirectInstall}
                      disabled={installing}
                      className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-lg shadow-sky-600/30 transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0"
                    >
                      <Download className="w-4 h-4" />
                      {installing ? 'Installing...' : 'Install on Windows'}
                    </button>
                  ) : (
                    <button
                      onClick={downloadWindowsShortcut}
                      className="px-3 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-lg shadow-sky-600/30 transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
                      title="Download Windows Desktop Launcher (.url)"
                    >
                      <Download className="w-4 h-4" />
                      Get Windows Shortcut
                    </button>
                  )}
                </div>
              </div>

              {/* Step-by-Step Windows Guide */}
              <div className="bg-slate-900/50 rounded-xl border border-white/10 p-4 space-y-3">
                <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Monitor className="w-3.5 h-3.5 text-sky-400" />
                  Direct Windows Browser Installation Steps
                </div>

                <div className="space-y-2.5 text-xs text-slate-300">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                      1
                    </span>
                    <div>
                      In <strong>Microsoft Edge</strong> or <strong>Google Chrome</strong> on Windows, look at the right side of the address bar for the <strong>App Install icon</strong> (computer monitor with down-arrow) or tap the browser menu (<strong>⋯</strong>).
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                      2
                    </span>
                    <div>
                      Click <strong>"Install OmniPlayer Pro"</strong> (or <strong>Apps</strong> &gt; <strong>Install this site as an app</strong>).
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                      3
                    </span>
                    <div>
                      Check the box to <strong>"Pin to taskbar"</strong> and <strong>"Pin to Start"</strong>.
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                      4
                    </span>
                    <div>
                      OmniPlayer runs in its own borderless window with dedicated process priority, DirectX GPU decoding, and keyboard shortcuts!
                    </div>
                  </div>
                </div>
              </div>

              {/* Windows Integration Highlights */}
              <div className="bg-slate-900/30 p-3 rounded-xl border border-white/5 space-y-1.5 text-xs">
                <div className="font-semibold text-slate-200">Windows Desktop Features:</div>
                <ul className="list-disc list-inside text-slate-400 space-y-1 font-mono text-[11px]">
                  <li>DirectX 12 / WebGL 2.0 4K 60FPS video compositing</li>
                  <li>Multi-monitor fullscreen and mini-player Picture-in-Picture</li>
                  <li>Space / Arrows / F / M keyboard hotkey handling</li>
                  <li>Low latency Web Audio multichannel spatial processor</li>
                </ul>
              </div>
            </div>
          )}

          {/* iOS / Other Tab */}
          {activeTab === 'ios' && (
            <div className="space-y-4 animate-in fade-in duration-150 text-xs text-slate-300">
              <div className="bg-slate-900/50 rounded-xl border border-white/10 p-4 space-y-3">
                <div className="font-bold text-white text-sm">
                  Install on iPhone, iPad, or macOS Safari
                </div>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">1</span>
                    <div>Tap the <strong>Share</strong> button in the Safari toolbar (the box with an arrow pointing upward).</div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">2</span>
                    <div>Scroll down and tap <strong>Add to Home Screen</strong>.</div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">3</span>
                    <div>Confirm by tapping <strong>Add</strong> in the top right.</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 flex items-center justify-between bg-slate-900/30 text-xs text-slate-400">
          <div className="flex items-center gap-1.5 font-mono">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>PWA v1.2 • Cross-Platform Engine</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
