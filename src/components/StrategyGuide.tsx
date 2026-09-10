import React from 'react';
import { X, Shield, Swords, Zap, ArrowRight, BookOpen, Footprints, Sparkles } from 'lucide-react';

interface StrategyGuideProps {
  onClose: () => void;
}

export const StrategyGuide: React.FC<StrategyGuideProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6">
      <div className="bg-stone-950 border-2 border-stone-700 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 text-stone-100 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-4 mb-5">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-mono text-amber-400">
                STRATEGY & COMBAT GUIDE
              </h2>
              <p className="text-xs text-stone-400">
                The Way of the Dojo &middot; Tactical Principles
              </p>
            </div>
          </div>
          <button
            id="btn-close-guide"
            onClick={onClose}
            className="p-2 rounded-xl bg-stone-900 border border-stone-800 hover:border-stone-600 text-stone-400 hover:text-stone-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section 1: The Combat Triangle */}
        <div className="mb-6">
          <h3 className="text-sm font-mono font-bold text-amber-400 flex items-center gap-2 mb-3">
            <Swords className="w-4 h-4" />
            <span>1. THE MARTIAL STRIKE TRIANGLE</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-stone-900/80 border border-stone-800 rounded-xl p-3.5">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                HIGH STRIKE
              </span>
              <p className="text-xs text-stone-300 mt-2">
                Fast head punch with swift recovery. Pushes opponent back slightly. Vulnerable to low sweeps.
              </p>
            </div>
            <div className="bg-stone-900/80 border border-stone-800 rounded-xl p-3.5">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-orange-500/20 text-orange-300 font-bold">
                MID KICK
              </span>
              <p className="text-xs text-stone-300 mt-2">
                Long-range side kick delivering maximum pushback. High stamina cost; easily parried if predictable.
              </p>
            </div>
            <div className="bg-stone-900/80 border border-stone-800 rounded-xl p-3.5">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-800/40 text-amber-200 font-bold">
                LOW SWEEP
              </span>
              <p className="text-xs text-stone-300 mt-2">
                Ducks low under high punches and trips advancing or rushing rivals for bonus knockdown damage!
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Defense & Parry */}
        <div className="mb-6">
          <h3 className="text-sm font-mono font-bold text-sky-400 flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4" />
            <span>2. DEFENSIVE BLOCKS & COUNTERS</span>
          </h3>
          <div className="bg-stone-900/80 border border-stone-800 rounded-xl p-4 text-xs text-stone-300 space-y-2">
            <p>
              Holding <strong>BLOCK</strong> absorbs incoming strikes of matching height. A high guard blocks High and Mid strikes, while a crouching low guard sweeps away low kicks.
            </p>
            <p className="text-sky-300">
              <strong>Parry Advantage:</strong> When you successfully block a strike, the attacker recoils with a brief stamina penalty, granting you a window for an immediate counter-attack!
            </p>
          </div>
        </div>

        {/* Section 3: Momentum Arrows & Spacing */}
        <div className="mb-6">
          <h3 className="text-sm font-mono font-bold text-amber-500 flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4" />
            <span>3. MOMENTUM ARROWS & VICTORY CONDITIONS</span>
          </h3>
          <div className="bg-stone-900/80 border border-stone-800 rounded-xl p-4 text-xs text-stone-300 space-y-2">
            <p>
              At the bottom of the screen lies the classic Karateka momentum track. Player 1 commands the Orange right-facing arrows (<span className="text-orange-400 font-bold">▶</span>); Player 2 commands the Blue left-facing arrows (<span className="text-sky-400 font-bold">◀</span>).
            </p>
            <div className="bg-stone-950 p-2.5 rounded-lg border border-stone-800 font-mono text-[11px] text-center my-2 text-stone-400">
              <span className="text-orange-400">▶ ▶ ▶ ▶ ▶ ▶ ▶ ▶</span>
              <span className="mx-2 text-stone-600">|</span>
              <span className="text-sky-400">◀ ◀ ◀ ◀ ◀ ◀ ◀ ◀</span>
            </div>
            <p>
              Landing clean hits advances your arrows and knocks your opponent backward. Win the round by pushing your opponent off the dojo mat edge or depleting their arrows!
            </p>
          </div>
        </div>

        {/* Section 4: Controls Cheat Sheet */}
        <div>
          <h3 className="text-sm font-mono font-bold text-stone-300 flex items-center gap-2 mb-3">
            <Footprints className="w-4 h-4" />
            <span>4. CONTROLS SUMMARY</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
            <div className="bg-stone-900/60 p-3 rounded-xl border border-stone-800">
              <span className="text-amber-400 font-bold">PLAYER 1 (OR MOBILE):</span>
              <ul className="mt-1.5 space-y-1 text-stone-400 text-[11px]">
                <li>[A] / [D] &mdash; Retreat / Advance</li>
                <li>[W] &mdash; Rush forward</li>
                <li>[J] &mdash; High Strike</li>
                <li>[K] &mdash; Mid Kick</li>
                <li>[L] &mdash; Low Sweep</li>
                <li>[Space] / [S] &mdash; Block & Parry</li>
                <li>[B] &mdash; Bow of Honor</li>
              </ul>
            </div>
            <div className="bg-stone-900/60 p-3 rounded-xl border border-stone-800">
              <span className="text-sky-400 font-bold">PLAYER 2 (HOTSEAT):</span>
              <ul className="mt-1.5 space-y-1 text-stone-400 text-[11px]">
                <li>[Arrow Left/Right] &mdash; Advance / Retreat</li>
                <li>[Arrow Up] &mdash; Rush forward</li>
                <li>[Num 1] / [U] &mdash; High Strike</li>
                <li>[Num 2] / [I] &mdash; Mid Kick</li>
                <li>[Num 3] / [O] &mdash; Low Sweep</li>
                <li>[Arrow Down] &mdash; Block & Parry</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer Button */}
        <div className="mt-6 pt-4 border-t border-stone-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold font-mono text-xs rounded-xl cursor-pointer transition-all shadow-md active:scale-95"
          >
            ENTER THE DOJO
          </button>
        </div>
      </div>
    </div>
  );
};
