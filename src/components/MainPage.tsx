import React, { useState } from 'react';
import { Wifi, Bot, Users, BookOpen, Volume2, VolumeX, Tv, Swords, Sparkles, ChevronRight } from 'lucide-react';
import { sounds } from '../lib/audio';

interface MainPageProps {
  isMuted: boolean;
  crtFilter: boolean;
  onToggleMute: () => void;
  onToggleCrt: () => void;
  onSelectWifiMatch: () => void;
  onSelectAiMatch: () => void;
  onSelectHotseatMatch: () => void;
  onOpenGuide: () => void;
}

export const MainPage: React.FC<MainPageProps> = ({
  isMuted,
  crtFilter,
  onToggleMute,
  onToggleCrt,
  onSelectWifiMatch,
  onSelectAiMatch,
  onSelectHotseatMatch,
  onOpenGuide,
}) => {
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);

  const handleMenuClick = (action: () => void) => {
    sounds.playWhoosh('high');
    action();
  };

  return (
    <div className="w-full max-w-[960px] mx-auto min-h-[580px] flex flex-col justify-between p-4 sm:p-8 bg-gradient-to-b from-stone-950 via-stone-900 to-stone-950 border-4 border-stone-800 rounded-3xl shadow-2xl relative overflow-hidden text-stone-100">
      {/* Background Decorative Graphic Elements */}
      <div className="absolute inset-0 pointer-events-none opacity-10 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:24px_24px]" />

      {/* Top Bar: Kanji Crest & Audio/Display Settings */}
      <div className="relative z-10 flex items-center justify-between border-b border-stone-800/80 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/40 flex items-center justify-center font-bold text-amber-400 font-mono text-xl shadow-inner">
            道
          </div>
          <div>
            <div className="text-[10px] font-mono tracking-widest text-amber-500 uppercase">
              MARTIAL ARTS STRATEGY ENGINE
            </div>
            <div className="text-xs font-mono text-stone-400">
              LOCAL NETWORK EDITION &middot; V2.0
            </div>
          </div>
        </div>

        {/* Global Toolbar */}
        <div className="flex items-center space-x-2">
          <button
            id="btn-main-sound"
            onClick={onToggleMute}
            className="px-3 py-1.5 rounded-xl bg-stone-900/90 border border-stone-800 hover:border-amber-500/50 text-stone-300 hover:text-amber-400 transition-all text-xs font-mono flex items-center gap-1.5 cursor-pointer shadow-sm"
            title="Toggle Sound"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
            <span className="hidden sm:inline">{isMuted ? 'MUTED' : 'AUDIO ON'}</span>
          </button>

          <button
            id="btn-main-crt"
            onClick={onToggleCrt}
            className={`px-3 py-1.5 rounded-xl border transition-all text-xs font-mono flex items-center gap-1.5 cursor-pointer shadow-sm ${
              crtFilter
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                : 'bg-stone-900/90 border-stone-800 text-stone-400 hover:text-stone-200'
            }`}
            title="Toggle CRT Scanline Effect"
          >
            <Tv className="w-4 h-4" />
            <span className="hidden sm:inline">CRT: {crtFilter ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>

      {/* Main Title Hero Section */}
      <div className="relative z-10 text-center my-6">
        {/* Decorative Badge */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono mb-4 tracking-wider">
          <Sparkles className="w-3.5 h-3.5 animate-spin" />
          <span>REAL-TIME LOCAL WI-FI COMBAT</span>
        </div>

        {/* Big Retro Arcade Heading */}
        <h1 className="text-3xl sm:text-5xl font-black font-mono tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-amber-400 to-amber-600 drop-shadow-[0_4px_16px_rgba(245,158,11,0.25)] uppercase mb-3">
          TWO-PLAYER STRATEGY DUEL
        </h1>

        <p className="max-w-xl mx-auto text-xs sm:text-sm font-sans text-stone-300 leading-relaxed">
          The tactical martial arts duel inspired by legendary retro arcade classics.
          Control distance, read your rival's stance, and advance your momentum arrows to claim victory.
        </p>
      </div>

      {/* Primary Action Buttons Menu */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4 my-2">
        {/* Option 1: Local Wi-Fi Real-time Match */}
        <button
          id="btn-menu-wifi"
          onMouseEnter={() => setHoveredButton('wifi')}
          onMouseLeave={() => setHoveredButton(null)}
          onClick={() => handleMenuClick(onSelectWifiMatch)}
          className="group relative p-5 bg-gradient-to-b from-stone-900/90 to-stone-950/90 hover:from-amber-950/30 hover:to-stone-900/90 border-2 border-stone-800 hover:border-amber-500/70 rounded-2xl text-left transition-all duration-200 cursor-pointer shadow-lg hover:shadow-amber-500/10 flex flex-col justify-between min-h-[170px]"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <Wifi className="w-6 h-6 animate-pulse" />
            </div>
            <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              FEATURED
            </span>
          </div>
          <div>
            <h3 className="font-mono font-bold text-base text-amber-400 group-hover:text-amber-300 flex items-center gap-1.5">
              <span>LOCAL WI-FI MATCH</span>
              <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </h3>
            <p className="text-xs text-stone-400 mt-1 leading-normal">
              Host or join a real-time 2-player match across 2 phones, tablets, or computers on your Wi-Fi network with instant QR code pairing.
            </p>
          </div>
        </button>

        {/* Option 2: Solo Dojo vs AI Master */}
        <button
          id="btn-menu-ai"
          onMouseEnter={() => setHoveredButton('ai')}
          onMouseLeave={() => setHoveredButton(null)}
          onClick={() => handleMenuClick(onSelectAiMatch)}
          className="group relative p-5 bg-gradient-to-b from-stone-900/90 to-stone-950/90 hover:from-sky-950/30 hover:to-stone-900/90 border-2 border-stone-800 hover:border-sky-500/70 rounded-2xl text-left transition-all duration-200 cursor-pointer shadow-lg hover:shadow-sky-500/10 flex flex-col justify-between min-h-[170px]"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform">
              <Bot className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
              SOLO PRACTICE
            </span>
          </div>
          <div>
            <h3 className="font-mono font-bold text-base text-sky-400 group-hover:text-sky-300 flex items-center gap-1.5">
              <span>SOLO VS AI SENSEI</span>
              <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </h3>
            <p className="text-xs text-stone-400 mt-1 leading-normal">
              Sharpen your spacing, high/mid/low mixups, and defensive parries against the adaptive AI Dojo Master.
            </p>
          </div>
        </button>

        {/* Option 3: Local Hotseat (Same Device) */}
        <button
          id="btn-menu-hotseat"
          onMouseEnter={() => setHoveredButton('hotseat')}
          onMouseLeave={() => setHoveredButton(null)}
          onClick={() => handleMenuClick(onSelectHotseatMatch)}
          className="group relative p-5 bg-gradient-to-b from-stone-900/90 to-stone-950/90 hover:from-emerald-950/30 hover:to-stone-900/90 border-2 border-stone-800 hover:border-emerald-500/70 rounded-2xl text-left transition-all duration-200 cursor-pointer shadow-lg hover:shadow-emerald-500/10 flex flex-col justify-between min-h-[170px]"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              1 KEYBOARD
            </span>
          </div>
          <div>
            <h3 className="font-mono font-bold text-base text-emerald-400 group-hover:text-emerald-300 flex items-center gap-1.5">
              <span>PASS & PLAY / HOTSEAT</span>
              <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </h3>
            <p className="text-xs text-stone-400 mt-1 leading-normal">
              Two players share one computer keyboard. Player 1 uses WASD + JKL, and Player 2 uses Arrow keys + NumPad.
            </p>
          </div>
        </button>
      </div>

      {/* Secondary Row: How to Play & Combat Mechanics Guide */}
      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-stone-800/80">
        <button
          id="btn-open-guide"
          onClick={() => handleMenuClick(onOpenGuide)}
          className="w-full sm:w-auto px-4 py-2.5 bg-stone-900 hover:bg-stone-800 border border-stone-700 hover:border-stone-500 rounded-xl text-xs font-mono text-stone-300 hover:text-amber-400 flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-sm"
        >
          <BookOpen className="w-4 h-4 text-amber-400" />
          <span>HOW TO PLAY & COMBAT STRATEGY GUIDE</span>
        </button>

        {/* Bottom Momentum Preview Indicator */}
        <div className="flex items-center space-x-2 text-[11px] font-mono text-stone-500">
          <span className="text-amber-500 font-bold">▶▶▶ P1 ADVANCE</span>
          <span className="text-stone-600">&bull;</span>
          <span className="text-sky-500 font-bold">P2 ADVANCE ◀◀◀</span>
        </div>
      </div>
    </div>
  );
};
