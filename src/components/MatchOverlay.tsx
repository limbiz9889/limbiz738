import React from 'react';
import { GameState, PlayerId, GameMode } from '../types/game';
import { Volume2, VolumeX, Tv, Wifi, RotateCcw, Award } from 'lucide-react';
import { MAX_STAMINA } from '../lib/constants';

interface MatchOverlayProps {
  gameState: GameState;
  gameMode: GameMode;
  playerRole: PlayerId | 'hotseat' | null;
  ping: number | null;
  isMuted: boolean;
  crtFilter: boolean;
  onToggleMute: () => void;
  onToggleCrt: () => void;
  onRematch: () => void;
  onLeaveMatch: () => void;
  onGoToMainMenu?: () => void;
}

export const MatchOverlay: React.FC<MatchOverlayProps> = ({
  gameState,
  gameMode,
  playerRole,
  ping,
  isMuted,
  crtFilter,
  onToggleMute,
  onToggleCrt,
  onRematch,
  onLeaveMatch,
  onGoToMainMenu,
}) => {
  const p1 = gameState.fighters.p1;
  const p2 = gameState.fighters.p2;

  const p1StaminaPct = Math.round((p1.stamina / MAX_STAMINA) * 100);
  const p2StaminaPct = Math.round((p2.stamina / MAX_STAMINA) * 100);

  return (
    <div className="w-full max-w-[960px] mx-auto mb-2 text-stone-100">
      {/* Top Bar: Fighter Names, Scores, Timer, & Settings */}
      <div className="flex items-center justify-between bg-stone-950/90 border border-stone-800 rounded-2xl px-5 py-3 shadow-lg">
        {/* P1 Stats */}
        <div className="flex items-center space-x-3 w-1/3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center font-mono font-bold text-amber-400 text-sm">
            P1
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs font-bold text-amber-400 truncate">
                {p1.name}
              </span>
              {playerRole === 'p1' && (
                <span className="text-[9px] font-mono bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded">
                  YOU
                </span>
              )}
            </div>
            {/* Stamina Bar */}
            <div className="w-full bg-stone-800 h-1.5 rounded-full mt-1 overflow-hidden">
              <div
                className="h-full bg-amber-500 transition-all duration-75"
                style={{ width: `${p1StaminaPct}%` }}
              />
            </div>
          </div>
          <div className="text-xl font-mono font-black text-amber-400">
            {p1.score}
          </div>
        </div>

        {/* Center Round & Clock */}
        <div className="flex flex-col items-center justify-center px-4">
          <span className="text-[10px] font-mono tracking-widest text-stone-400 uppercase">
            ROUND {gameState.round} / {gameState.maxRounds}
          </span>
          <div className="text-2xl font-black font-mono tracking-wider text-amber-300">
            {Math.ceil(gameState.roundTimer)}
          </div>
          {ping !== null && gameMode === 'wifi_multiplayer' && (
            <div className="flex items-center gap-1 text-[9px] font-mono text-emerald-400 mt-0.5">
              <Wifi className="w-2.5 h-2.5" />
              <span>{ping}ms</span>
            </div>
          )}
        </div>

        {/* P2 Stats */}
        <div className="flex items-center space-x-3 w-1/3 justify-end text-right">
          <div className="text-xl font-mono font-black text-sky-400">
            {p2.score}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-end space-x-2">
              {playerRole === 'p2' && (
                <span className="text-[9px] font-mono bg-sky-500/20 text-sky-300 px-1.5 py-0.5 rounded">
                  YOU
                </span>
              )}
              <span className="font-mono text-xs font-bold text-sky-400 truncate">
                {gameMode === 'vs_ai' ? 'AI Sensei' : p2.name}
              </span>
            </div>
            {/* Stamina Bar */}
            <div className="w-full bg-stone-800 h-1.5 rounded-full mt-1 overflow-hidden flex justify-end">
              <div
                className="h-full bg-sky-500 transition-all duration-75"
                style={{ width: `${p2StaminaPct}%` }}
              />
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center font-mono font-bold text-sky-400 text-sm">
            P2
          </div>
        </div>
      </div>

      {/* Quick Settings Toolbar */}
      <div className="flex items-center justify-between px-2 pt-2 text-xs font-mono text-stone-400">
        <div className="flex items-center space-x-2">
          <button
            onClick={onToggleMute}
            className="p-1.5 rounded-lg bg-stone-900 border border-stone-800 hover:text-stone-200 transition-colors flex items-center gap-1 cursor-pointer"
            title="Toggle Sound"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-amber-400" />}
            <span className="text-[10px]">{isMuted ? 'MUTED' : 'SOUND ON'}</span>
          </button>

          <button
            onClick={onToggleCrt}
            className={`p-1.5 rounded-lg border transition-colors flex items-center gap-1 cursor-pointer ${
              crtFilter
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
            }`}
            title="Toggle CRT Scanline Effect"
          >
            <Tv className="w-3.5 h-3.5" />
            <span className="text-[10px]">CRT FX: {crtFilter ? 'ON' : 'OFF'}</span>
          </button>
        </div>

        <div className="flex items-center space-x-2">
          {gameMode === 'wifi_multiplayer' && (
            <button
              onClick={onLeaveMatch}
              className="px-2.5 py-1 rounded-lg bg-stone-900 border border-stone-800 hover:text-stone-200 transition-colors text-[10px] cursor-pointer"
            >
              WI-FI LOBBY
            </button>
          )}
          {onGoToMainMenu && (
            <button
              id="btn-overlay-main-menu"
              onClick={onGoToMainMenu}
              className="px-2.5 py-1 rounded-lg bg-stone-900 border border-stone-800 hover:border-amber-500/40 text-amber-400 hover:text-amber-300 transition-colors text-[10px] font-bold cursor-pointer"
            >
              MAIN MENU
            </button>
          )}
        </div>
      </div>

      {/* End of Match Victory / Rematch Modal */}
      {gameState.status === 'match_over' && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-stone-950 border-2 border-amber-500/50 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Award className="w-9 h-9 animate-bounce" />
            </div>

            <h3 className="text-2xl font-black font-mono tracking-wider text-amber-400 uppercase">
              {gameState.winner === 'p1' ? 'WHITE CRANE VICTORIOUS!' : 'SHADOW TIGER VICTORIOUS!'}
            </h3>
            <p className="text-xs text-stone-400 mt-2 font-mono">
              Final Score: {p1.score} - {p2.score}
            </p>

            <div className="flex flex-col sm:flex-row gap-2 mt-6">
              <button
                id="btn-match-rematch"
                onClick={onRematch}
                className="flex-1 py-3 px-4 bg-amber-500 hover:bg-amber-400 text-stone-950 font-mono font-bold text-xs rounded-xl transition-all shadow-lg flex items-center justify-center space-x-1.5 cursor-pointer active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
                <span>REMATCH</span>
              </button>

              {gameMode === 'wifi_multiplayer' ? (
                <button
                  id="btn-match-exit"
                  onClick={onLeaveMatch}
                  className="flex-1 py-3 px-4 bg-stone-900 hover:bg-stone-800 text-stone-300 font-mono font-bold text-xs rounded-xl border border-stone-700 transition-all cursor-pointer"
                >
                  WI-FI LOBBY
                </button>
              ) : (
                <button
                  id="btn-match-exit"
                  onClick={onGoToMainMenu || onLeaveMatch}
                  className="flex-1 py-3 px-4 bg-stone-900 hover:bg-stone-800 text-stone-300 font-mono font-bold text-xs rounded-xl border border-stone-700 transition-all cursor-pointer"
                >
                  MAIN MENU
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
