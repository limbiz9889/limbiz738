import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  GameState,
  GameMode,
  PlayerId,
  CombatAction,
  ServerMessage,
} from './types/game';
import {
  createInitialGameState,
  updateGameState,
  applyPlayerAction,
  getTacticalAiAction,
  resetRound,
} from './lib/gameEngine';
import { sounds } from './lib/audio';
import { MainPage } from './components/MainPage';
import { StrategyGuide } from './components/StrategyGuide';
import { GameCanvas } from './components/GameCanvas';
import { WifiLobby } from './components/WifiLobby';
import { TouchControls } from './components/TouchControls';
import { MatchOverlay } from './components/MatchOverlay';
import { ArrowLeft, Wifi } from 'lucide-react';

export type AppView = 'main_menu' | 'wifi_lobby' | 'game';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('main_menu');
  const [showGuide, setShowGuide] = useState(false);
  const [gameMode, setGameMode] = useState<GameMode>('wifi_multiplayer');
  const [roomCode, setRoomCode] = useState<string>('');
  const [playerRole, setPlayerRole] = useState<PlayerId | 'hotseat' | null>(null);
  const [connectedPlayers, setConnectedPlayers] = useState<number>(0);
  const [gameState, setGameState] = useState<GameState>(() => createInitialGameState());
  const [ping, setPing] = useState<number | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [crtFilter, setCrtFilter] = useState(true);

  const wsRef = useRef<WebSocket | null>(null);
  const lastStateRef = useRef<GameState>(gameState);
  lastStateRef.current = gameState;

  // Sound triggers on state changes
  const playSoundForEvent = useCallback((type: string, pitch?: 'high' | 'mid' | 'low') => {
    switch (type) {
      case 'hit':
        sounds.playHit(false);
        break;
      case 'block':
        sounds.playBlock();
        break;
      case 'whoosh':
        sounds.playWhoosh(pitch || 'mid');
        break;
      case 'round_start':
        sounds.playRoundStart();
        break;
      case 'round_win':
      case 'match_win':
        sounds.playVictory();
        break;
      case 'step':
        sounds.playStep();
        break;
      case 'bow':
        sounds.playBow();
        break;
    }
  }, []);

  // 1. WebSocket Connection Management
  const connectWebSocket = useCallback((code: string) => {
    if (wsRef.current) {
      wsRef.current.close();
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const ws = new WebSocket(`${protocol}//${host}/ws`);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          type: 'join',
          roomCode: code,
          playerName: 'Warrior',
        })
      );

      // Start ping heartbeat
      const pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
        } else {
          clearInterval(pingInterval);
        }
      }, 3000);
    };

    ws.onmessage = (event) => {
      try {
        const msg: ServerMessage = JSON.parse(event.data);

        if (msg.type === 'room_joined') {
          setPlayerRole(msg.player);
          setRoomCode(msg.roomCode);
          setGameState(msg.state);
          setConnectedPlayers(msg.player === 'p2' ? 2 : 1);
          if (msg.player === 'p2') {
            setCurrentView('game');
          }
        } else if (msg.type === 'player_connected') {
          setConnectedPlayers(2);
          sounds.playRoundStart();
          setCurrentView('game'); // Automatically launch into the match when P2 connects!
        } else if (msg.type === 'player_disconnected') {
          setConnectedPlayers(1);
        } else if (msg.type === 'game_update') {
          setGameState(msg.state);
          if (msg.state.status === 'countdown' || msg.state.status === 'fighting') {
            setCurrentView('game');
          }
        } else if (msg.type === 'combat_event') {
          playSoundForEvent(msg.event);
        } else if (msg.type === 'pong') {
          const latency = Math.max(1, Math.round(Date.now() - msg.clientTimestamp));
          setPing(latency);
        }
      } catch (e) {
        console.error('Failed to parse WS message:', e);
      }
    };

    ws.onclose = () => {
      // closed
    };
  }, [playSoundForEvent]);

  // 2. Check URL parameters on mount for instant room join
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    if (roomParam) {
      setGameMode('wifi_multiplayer');
      setRoomCode(roomParam.toUpperCase());
      connectWebSocket(roomParam.toUpperCase());
      setCurrentView('wifi_lobby');
    }
  }, [connectWebSocket]);

  // Create Room via API
  const handleCreateRoom = async () => {
    try {
      const res = await fetch('/api/rooms/create', { method: 'POST' });
      const data = await res.json();
      if (data.roomCode) {
        setRoomCode(data.roomCode);
        connectWebSocket(data.roomCode);
      }
    } catch {
      // Fallback local room code
      const fallback = 'DOJO' + Math.floor(10 + Math.random() * 90);
      setRoomCode(fallback);
      connectWebSocket(fallback);
    }
  };

  const joinWifiRoom = (code: string) => {
    setRoomCode(code);
    connectWebSocket(code);
  };

  // Solo vs AI Match
  const handleStartAiMatch = () => {
    if (wsRef.current) wsRef.current.close();
    setGameMode('vs_ai');
    setPlayerRole('p1');
    setRoomCode('');
    setGameState(createInitialGameState('AI_DOJO'));
    setCurrentView('game');
    sounds.playRoundStart();
  };

  // Hotseat Match
  const handleStartHotseatMatch = () => {
    if (wsRef.current) wsRef.current.close();
    setGameMode('local_hotseat');
    setPlayerRole('hotseat');
    setRoomCode('');
    setGameState(createInitialGameState('HOTSEAT'));
    setCurrentView('game');
    sounds.playRoundStart();
  };

  // Dispatch Action
  const dispatchAction = useCallback(
    (action: CombatAction, target?: PlayerId) => {
      if (gameMode === 'wifi_multiplayer') {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ type: 'action', action }));
        }
      } else {
        // Local mode (AI or Hotseat)
        const role = target || (playerRole === 'hotseat' ? 'p1' : (playerRole as PlayerId) || 'p1');
        setGameState((prev) => {
          const fighter = prev.fighters[role];
          if (!fighter) return prev;
          const updatedFighter = applyPlayerAction(fighter, action);
          return {
            ...prev,
            fighters: {
              ...prev.fighters,
              [role]: updatedFighter,
            },
          };
        });
      }
    },
    [gameMode, playerRole]
  );

  // Rematch
  const handleRematch = () => {
    if (gameMode === 'wifi_multiplayer') {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'rematch' }));
      }
    } else {
      setGameState(createInitialGameState(roomCode || 'DOJO'));
      sounds.playRoundStart();
    }
  };

  // Leave / Reset to lobby
  const handleLeaveMatch = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setRoomCode('');
    setPlayerRole(null);
    setConnectedPlayers(0);
    setGameState(createInitialGameState());
    setCurrentView('wifi_lobby');
  };

  const handleReturnToMainMenu = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setRoomCode('');
    setPlayerRole(null);
    setConnectedPlayers(0);
    setGameState(createInitialGameState());
    setCurrentView('main_menu');
  };

  // Local Game Loop for AI and Hotseat Modes
  useEffect(() => {
    if (gameMode === 'wifi_multiplayer' || currentView !== 'game') return;

    let lastTick = Date.now();
    let roundResetTimer = 0;

    const interval = setInterval(() => {
      const now = Date.now();
      const deltaSec = (now - lastTick) / 1000;
      lastTick = now;

      setGameState((prev) => {
        let current = prev;

        // If playing vs AI, execute AI tactical decision
        if (gameMode === 'vs_ai' && current.status === 'fighting') {
          const aiAction = getTacticalAiAction(current.fighters.p2, current.fighters.p1);
          if (aiAction && aiAction !== current.fighters.p2.action) {
            current = {
              ...current,
              fighters: {
                ...current.fighters,
                p2: applyPlayerAction(current.fighters.p2, aiAction),
              },
            };
          }
        }

        const { nextState, events } = updateGameState(current, deltaSec);

        events.forEach((ev) => {
          playSoundForEvent(ev.type, ev.pitch);
        });

        // Round transition
        if (nextState.status === 'round_over') {
          roundResetTimer += deltaSec;
          if (roundResetTimer >= 3.5) {
            roundResetTimer = 0;
            const resetted = resetRound(nextState);
            resetted.round++;
            sounds.playRoundStart();
            return resetted;
          }
        }

        return nextState;
      });
    }, 33);

    return () => clearInterval(interval);
  }, [gameMode, currentView, playSoundForEvent]);

  // Keyboard controls listener
  useEffect(() => {
    if (currentView !== 'game') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent scrolling on arrow keys or space when playing
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }

      // Player 1 controls
      if (playerRole === 'p1' || playerRole === 'hotseat' || !playerRole) {
        switch (e.code) {
          case 'KeyA':
            dispatchAction('walk_backward', 'p1');
            break;
          case 'KeyD':
            dispatchAction('walk_forward', 'p1');
            break;
          case 'KeyW':
            dispatchAction('run', 'p1');
            break;
          case 'KeyJ':
            dispatchAction('high_punch', 'p1');
            break;
          case 'KeyK':
            dispatchAction('mid_kick', 'p1');
            break;
          case 'KeyL':
            dispatchAction('low_kick', 'p1');
            break;
          case 'KeyS':
          case 'Space':
            dispatchAction('block_high', 'p1');
            break;
          case 'KeyB':
            dispatchAction('bow', 'p1');
            sounds.playBow();
            break;
        }
      }

      // Player 2 controls (Hotseat mode)
      if (playerRole === 'hotseat') {
        switch (e.code) {
          case 'ArrowLeft':
            dispatchAction('walk_forward', 'p2');
            break;
          case 'ArrowRight':
            dispatchAction('walk_backward', 'p2');
            break;
          case 'ArrowUp':
            dispatchAction('run', 'p2');
            break;
          case 'Numpad1':
          case 'KeyU':
            dispatchAction('high_punch', 'p2');
            break;
          case 'Numpad2':
          case 'KeyI':
            dispatchAction('mid_kick', 'p2');
            break;
          case 'Numpad3':
          case 'KeyO':
            dispatchAction('low_kick', 'p2');
            break;
          case 'ArrowDown':
            dispatchAction('block_high', 'p2');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dispatchAction, playerRole, currentView]);

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col justify-between p-3 sm:p-6 font-sans">
      {/* 1. VIEW: MAIN PAGE (TITLE & MODE SELECTION) */}
      {currentView === 'main_menu' && (
        <div className="my-auto">
          <MainPage
            isMuted={isMuted}
            crtFilter={crtFilter}
            onToggleMute={() => setIsMuted(sounds.toggleMute())}
            onToggleCrt={() => setCrtFilter(!crtFilter)}
            onSelectWifiMatch={() => {
              setGameMode('wifi_multiplayer');
              setCurrentView('wifi_lobby');
            }}
            onSelectAiMatch={handleStartAiMatch}
            onSelectHotseatMatch={handleStartHotseatMatch}
            onOpenGuide={() => setShowGuide(true)}
          />
        </div>
      )}

      {/* 2. VIEW: WI-FI LOBBY & QR PAIRING */}
      {currentView === 'wifi_lobby' && (
        <div className="w-full max-w-[960px] mx-auto my-auto space-y-4">
          <div className="flex items-center justify-between">
            <button
              id="btn-back-to-menu"
              onClick={handleReturnToMainMenu}
              className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 border border-stone-700 hover:border-stone-500 rounded-xl text-xs font-mono text-stone-300 hover:text-amber-400 flex items-center space-x-1.5 transition-all cursor-pointer shadow-md"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>BACK TO MAIN MENU</span>
            </button>

            {roomCode && (
              <button
                id="btn-enter-arena"
                onClick={() => setCurrentView('game')}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-mono font-bold text-xs rounded-xl transition-all shadow-lg flex items-center gap-1.5 cursor-pointer"
              >
                <span>ENTER ARENA</span>
                <span className="text-[10px] bg-stone-950/20 px-1.5 py-0.5 rounded">
                  {connectedPlayers}/2
                </span>
              </button>
            )}
          </div>

          <WifiLobby
            gameMode={gameMode}
            roomCode={roomCode}
            isHost={playerRole === 'p1'}
            connectedPlayers={connectedPlayers}
            onSetGameMode={(mode) => {
              setGameMode(mode);
              if (mode === 'vs_ai') handleStartAiMatch();
              else if (mode === 'local_hotseat') handleStartHotseatMatch();
              else handleLeaveMatch();
            }}
            onCreateRoom={handleCreateRoom}
            onJoinRoom={joinWifiRoom}
            onStartAiMatch={handleStartAiMatch}
            onStartHotseatMatch={handleStartHotseatMatch}
            onBackToMainMenu={handleReturnToMainMenu}
          />
        </div>
      )}

      {/* 3. VIEW: ACTIVE DUEL GAME ARENA */}
      {currentView === 'game' && (
        <div className="w-full max-w-[960px] mx-auto flex-1 flex flex-col justify-between">
          {/* Header */}
          <header className="w-full flex items-center justify-between py-2 border-b border-stone-800 mb-2">
            <div className="flex items-center space-x-3">
              <button
                id="btn-header-menu"
                onClick={handleReturnToMainMenu}
                className="w-8 h-8 rounded-lg bg-stone-900 border border-stone-800 hover:border-amber-500/50 flex items-center justify-center font-mono font-bold text-amber-400 text-sm hover:scale-105 transition-all cursor-pointer"
                title="Return to Main Menu"
              >
                武
              </button>
              <div>
                <h1 className="text-base sm:text-lg font-black font-mono tracking-wider text-stone-100 uppercase">
                  TWO-PLAYER STRATEGY DUEL
                </h1>
                <p className="text-[11px] font-mono text-stone-400">
                  {gameMode === 'wifi_multiplayer'
                    ? 'Local Wi-Fi Real-Time Match'
                    : gameMode === 'vs_ai'
                    ? 'Solo Dojo vs AI Sensei'
                    : '1-Keyboard Hotseat Duel'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowGuide(true)}
                className="hidden sm:inline-flex px-2.5 py-1 rounded-lg bg-stone-900 border border-stone-800 hover:text-amber-400 text-[11px] font-mono transition-colors cursor-pointer"
              >
                GUIDE
              </button>
              {gameMode === 'wifi_multiplayer' && roomCode && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-stone-900 border border-stone-800 text-xs font-mono">
                  <Wifi className="w-3 h-3 text-amber-400" />
                  <span className="text-stone-400">ROOM:</span>
                  <span className="text-amber-400 font-bold">{roomCode}</span>
                </div>
              )}
            </div>
          </header>

          {/* Main Game Stage */}
          <main className="w-full flex-1 flex flex-col justify-center">
            {/* Match HUD Overlay */}
            <MatchOverlay
              gameState={gameState}
              gameMode={gameMode}
              playerRole={playerRole}
              ping={ping}
              isMuted={isMuted}
              crtFilter={crtFilter}
              onToggleMute={() => setIsMuted(sounds.toggleMute())}
              onToggleCrt={() => setCrtFilter(!crtFilter)}
              onRematch={handleRematch}
              onLeaveMatch={handleLeaveMatch}
              onGoToMainMenu={handleReturnToMainMenu}
            />

            {/* Retro Canvas Match Arena */}
            <GameCanvas
              gameState={gameState}
              crtFilter={crtFilter}
              onCanvasClick={() => {
                dispatchAction('high_punch');
              }}
            />

            {/* On-Screen Touch / Button Gamepad */}
            <TouchControls
              playerRole={playerRole === 'p2' ? 'p2' : 'p1'}
              onAction={dispatchAction}
              disabled={gameState.status !== 'fighting'}
            />
          </main>
        </div>
      )}

      {/* Global Strategy Guide Modal */}
      {showGuide && <StrategyGuide onClose={() => setShowGuide(false)} />}
    </div>
  );
}
