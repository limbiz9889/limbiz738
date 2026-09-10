import React from 'react';
import { CombatAction, PlayerId } from '../types/game';
import { ChevronLeft, ChevronRight, Shield, Zap, Sparkles, Footprints } from 'lucide-react';

interface TouchControlsProps {
  playerRole: PlayerId | 'hotseat_p1' | 'hotseat_p2' | 'all';
  onAction: (action: CombatAction, player?: PlayerId) => void;
  disabled?: boolean;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  playerRole,
  onAction,
  disabled = false,
}) => {
  const isP1 = playerRole === 'p1' || playerRole === 'hotseat_p1' || playerRole === 'all';
  const targetPlayer: PlayerId | undefined =
    playerRole === 'hotseat_p2' ? 'p2' : playerRole === 'hotseat_p1' ? 'p1' : undefined;

  const trigger = (action: CombatAction) => {
    if (disabled) return;
    onAction(action, targetPlayer);
  };

  return (
    <div className="w-full max-w-[960px] mx-auto mt-3 select-none">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center bg-stone-950/80 border border-stone-800/80 rounded-2xl p-4 backdrop-blur">
        {/* Directional Pad / Footwork */}
        <div className="flex items-center justify-around sm:justify-start sm:space-x-3">
          <button
            id="btn-move-left"
            onClick={() => trigger('walk_backward')}
            disabled={disabled}
            className="flex-1 sm:flex-initial h-14 min-w-16 px-4 bg-stone-900 hover:bg-stone-800 active:bg-amber-600 active:text-stone-950 border border-stone-700 rounded-xl flex flex-col items-center justify-center text-xs font-mono font-bold transition-all text-stone-300 disabled:opacity-40 cursor-pointer shadow-md"
          >
            <ChevronLeft className="w-5 h-5 mb-0.5" />
            <span>RETREAT</span>
          </button>

          <button
            id="btn-run"
            onClick={() => trigger('run')}
            disabled={disabled}
            className="flex-1 sm:flex-initial h-14 min-w-16 px-4 bg-amber-500/10 hover:bg-amber-500/20 active:bg-amber-500 active:text-stone-950 border border-amber-500/30 rounded-xl flex flex-col items-center justify-center text-xs font-mono font-bold transition-all text-amber-400 disabled:opacity-40 cursor-pointer shadow-md"
          >
            <Zap className="w-5 h-5 mb-0.5" />
            <span>RUSH</span>
          </button>

          <button
            id="btn-move-right"
            onClick={() => trigger('walk_forward')}
            disabled={disabled}
            className="flex-1 sm:flex-initial h-14 min-w-16 px-4 bg-stone-900 hover:bg-stone-800 active:bg-amber-600 active:text-stone-950 border border-stone-700 rounded-xl flex flex-col items-center justify-center text-xs font-mono font-bold transition-all text-stone-300 disabled:opacity-40 cursor-pointer shadow-md"
          >
            <ChevronRight className="w-5 h-5 mb-0.5" />
            <span>ADVANCE</span>
          </button>

          <button
            id="btn-bow"
            onClick={() => trigger('bow')}
            disabled={disabled}
            className="h-14 min-w-14 px-3 bg-stone-900/60 hover:bg-stone-800 active:bg-stone-700 border border-stone-800 rounded-xl flex flex-col items-center justify-center text-[10px] font-mono font-semibold text-stone-400 disabled:opacity-40 cursor-pointer"
            title="Bow with honor"
          >
            <Sparkles className="w-4 h-4 mb-0.5 text-stone-400" />
            <span>BOW</span>
          </button>
        </div>

        {/* Combat Attack & Defense Buttons */}
        <div className="grid grid-cols-4 gap-2">
          {/* High Strike */}
          <button
            id="btn-high-punch"
            onClick={() => trigger('high_punch')}
            disabled={disabled}
            className="h-14 bg-gradient-to-b from-amber-600/90 to-amber-700/90 hover:from-amber-500 hover:to-amber-600 active:scale-95 border border-amber-400/40 rounded-xl flex flex-col items-center justify-center text-xs font-mono font-bold text-white shadow-lg transition-all disabled:opacity-40 cursor-pointer"
          >
            <span className="text-[10px] text-amber-200 uppercase tracking-tighter">HIGH</span>
            <span>STRIKE</span>
          </button>

          {/* Mid Kick */}
          <button
            id="btn-mid-kick"
            onClick={() => trigger('mid_kick')}
            disabled={disabled}
            className="h-14 bg-gradient-to-b from-orange-600/90 to-orange-700/90 hover:from-orange-500 hover:to-orange-600 active:scale-95 border border-orange-400/40 rounded-xl flex flex-col items-center justify-center text-xs font-mono font-bold text-white shadow-lg transition-all disabled:opacity-40 cursor-pointer"
          >
            <span className="text-[10px] text-orange-200 uppercase tracking-tighter">MID</span>
            <span>KICK</span>
          </button>

          {/* Low Sweep */}
          <button
            id="btn-low-kick"
            onClick={() => trigger('low_kick')}
            disabled={disabled}
            className="h-14 bg-gradient-to-b from-amber-800/90 to-stone-800 hover:from-amber-700 hover:to-stone-700 active:scale-95 border border-amber-600/30 rounded-xl flex flex-col items-center justify-center text-xs font-mono font-bold text-amber-100 shadow-lg transition-all disabled:opacity-40 cursor-pointer"
          >
            <span className="text-[10px] text-amber-300 uppercase tracking-tighter">LOW</span>
            <span>SWEEP</span>
          </button>

          {/* Block / Parry */}
          <button
            id="btn-block"
            onClick={() => trigger('block_high')}
            disabled={disabled}
            className="h-14 bg-gradient-to-b from-sky-600/90 to-sky-700/90 hover:from-sky-500 hover:to-sky-600 active:scale-95 border border-sky-400/40 rounded-xl flex flex-col items-center justify-center text-xs font-mono font-bold text-white shadow-lg transition-all disabled:opacity-40 cursor-pointer"
          >
            <Shield className="w-4 h-4 mb-0.5 text-sky-200" />
            <span>BLOCK</span>
          </button>
        </div>
      </div>

      {/* Keyboard Shortcuts Hint Bar */}
      <div className="hidden sm:flex items-center justify-between text-[11px] font-mono text-stone-500 px-3 py-1.5 mt-1">
        <span>
          <strong className="text-amber-400">P1 Keys:</strong> [A/D] Move &middot; [W] Rush &middot; [J] High &middot; [K] Mid &middot; [L] Low &middot; [Space/S] Block &middot; [B] Bow
        </span>
        {playerRole === 'hotseat_p1' && (
          <span>
            <strong className="text-sky-400">P2 Keys:</strong> [Arrow Left/Right] Move &middot; [Arrow Up] Rush &middot; [Num 1] High &middot; [Num 2] Mid &middot; [Num 3] Low &middot; [Arrow Down] Block
          </span>
        )}
      </div>
    </div>
  );
};
