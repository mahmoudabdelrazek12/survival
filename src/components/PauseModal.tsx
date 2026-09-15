import React from 'react';
import { Play, RotateCcw, Settings, Home, Terminal, Shield } from 'lucide-react';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onOpenSettings: () => void;
  onOpenAdmin: () => void;
  onQuitToMenu: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onOpenSettings,
  onOpenAdmin,
  onQuitToMenu,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md font-gaming">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-sm p-6 shadow-2xl flex flex-col gap-4 text-center">
        <h2 className="font-heading text-4xl font-bold tracking-wider text-neutral-100">
          GAME PAUSED
        </h2>
        <p className="text-xs text-neutral-400">Expedition suspended. Press ESC or RESUME to continue driving.</p>

        <div className="flex flex-col gap-2 pt-2">
          <button
            onClick={onResume}
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-neutral-950 font-bold text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-neutral-950" /> RESUME EXPEDITION
          </button>

          <button
            onClick={onRestart}
            className="w-full py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" /> RESTART RUN
          </button>

          <button
            onClick={onOpenSettings}
            className="w-full py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Settings className="w-4 h-4" /> SETTINGS & AUDIO
          </button>

          <button
            onClick={onOpenAdmin}
            className="w-full py-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Terminal className="w-4 h-4" /> DEV / ADMIN CHEAT PANEL
          </button>

          <button
            onClick={onQuitToMenu}
            className="w-full py-2.5 bg-neutral-950 hover:bg-neutral-800 text-neutral-400 hover:text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Home className="w-4 h-4" /> ABANDON RUN TO GARAGE
          </button>
        </div>
      </div>
    </div>
  );
};
