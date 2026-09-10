import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Wifi, Copy, Check, QrCode, Swords, Bot, Users, Sparkles, RefreshCw } from 'lucide-react';
import { GameMode } from '../types/game';

interface WifiLobbyProps {
  gameMode: GameMode;
  roomCode: string;
  isHost: boolean;
  connectedPlayers: number;
  onSetGameMode: (mode: GameMode) => void;
  onCreateRoom: () => void;
  onJoinRoom: (code: string) => void;
  onStartAiMatch: () => void;
  onStartHotseatMatch: () => void;
  onBackToMainMenu?: () => void;
}

export const WifiLobby: React.FC<WifiLobbyProps> = ({
  gameMode,
  roomCode,
  isHost,
  connectedPlayers,
  onSetGameMode,
  onCreateRoom,
  onJoinRoom,
  onStartAiMatch,
  onStartHotseatMatch,
  onBackToMainMenu,
}) => {
  const [inputCode, setInputCode] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [lanIp, setLanIp] = useState<string>('');
  const [showQrModal, setShowQrModal] = useState(false);

  // Fetch local LAN network IP from server
  useEffect(() => {
    fetch('/api/network-info')
      .then((res) => res.json())
      .then((data) => {
        if (data.lanUrls && data.lanUrls.length > 0) {
          setLanIp(data.lanUrls[0]);
        }
      })
      .catch(() => {
        // Fallback to origin
      });
  }, []);

  // Compute join URL (ensuring URL matches current origin for instant QR scanning & sharing)
  const baseUrl = window.location.origin;
  const matchUrl = roomCode ? `${baseUrl}?room=${roomCode}` : '';

  // Generate QR code when roomCode is active
  useEffect(() => {
    if (matchUrl) {
      QRCode.toDataURL(matchUrl, {
        width: 240,
        margin: 1,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('QR code error:', err));
    }
  }, [matchUrl]);

  const handleCopyLink = () => {
    if (!matchUrl) return;
    navigator.clipboard.writeText(matchUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-stone-900/90 backdrop-blur border-2 border-stone-700 rounded-2xl p-6 text-stone-100 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-stone-800 pb-4 mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Wifi className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-mono tracking-wide text-amber-400">
              LOCAL WI-FI MULTIPLAYER
            </h2>
            <p className="text-xs text-stone-400">
              Low-latency real-time tactical matches on the same network
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode switcher tabs */}
          <div className="flex bg-stone-950 p-1 rounded-xl border border-stone-800 text-xs font-mono">
            <button
              id="mode-tab-wifi"
              onClick={() => onSetGameMode('wifi_multiplayer')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                gameMode === 'wifi_multiplayer'
                  ? 'bg-amber-500 text-stone-950 font-bold'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Wi-Fi Net
            </button>
            <button
              id="mode-tab-ai"
              onClick={onStartAiMatch}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                gameMode === 'vs_ai'
                  ? 'bg-amber-500 text-stone-950 font-bold'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Solo vs AI
            </button>
            <button
              id="mode-tab-hotseat"
              onClick={onStartHotseatMatch}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                gameMode === 'local_hotseat'
                  ? 'bg-amber-500 text-stone-950 font-bold'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Hotseat
            </button>
          </div>

          {onBackToMainMenu && (
            <button
              id="btn-lobby-main-menu"
              onClick={onBackToMainMenu}
              className="px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 hover:border-amber-500/40 text-stone-300 hover:text-amber-400 transition-colors text-xs font-mono font-bold cursor-pointer shrink-0"
              title="Return to Main Menu"
            >
              MAIN MENU
            </button>
          )}
        </div>
      </div>

      {gameMode === 'wifi_multiplayer' && (
        <div>
          {!roomCode ? (
            /* Creation / Joining Options */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Host Card */}
              <div className="bg-stone-950/70 border border-stone-800 rounded-xl p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-2 text-amber-400 mb-2 font-mono text-sm font-bold">
                    <Swords className="w-4 h-4" />
                    <span>HOST WI-FI MATCH</span>
                  </div>
                  <p className="text-xs text-stone-400 leading-relaxed mb-4">
                    Create a match room. A second player on your local Wi-Fi can scan your QR code or enter your room code to join.
                  </p>
                </div>
                <button
                  id="btn-create-room"
                  onClick={onCreateRoom}
                  className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 active:scale-95 text-stone-950 font-bold font-mono text-sm rounded-xl transition-all shadow-lg flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>CREATE ROOM</span>
                </button>
              </div>

              {/* Join Card */}
              <div className="bg-stone-950/70 border border-stone-800 rounded-xl p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-2 text-sky-400 mb-2 font-mono text-sm font-bold">
                    <Users className="w-4 h-4" />
                    <span>JOIN WITH CODE</span>
                  </div>
                  <p className="text-xs text-stone-400 leading-relaxed mb-3">
                    Enter the 4-6 character room code displayed on the host device.
                  </p>
                  <input
                    id="input-room-code"
                    type="text"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                    placeholder="ENTER CODE (E.G. DOJO)"
                    maxLength={8}
                    className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-center text-lg font-mono tracking-widest text-amber-400 focus:outline-none focus:border-amber-500 uppercase placeholder:text-stone-600 mb-4"
                  />
                </div>
                <button
                  id="btn-join-room"
                  onClick={() => inputCode.trim() && onJoinRoom(inputCode.trim())}
                  disabled={!inputCode.trim()}
                  className={`w-full py-3 px-4 font-bold font-mono text-sm rounded-xl transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                    inputCode.trim()
                      ? 'bg-sky-500 hover:bg-sky-400 text-stone-950 active:scale-95 shadow-lg'
                      : 'bg-stone-800 text-stone-500 cursor-not-allowed'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>JOIN MATCH</span>
                </button>
              </div>
            </div>
          ) : (
            /* Active Room Details & Wi-Fi Pairing Info */
            <div className="space-y-4">
              <div className="bg-stone-950 border border-amber-500/30 rounded-xl p-5">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-center sm:text-left">
                    <span className="text-xs font-mono uppercase tracking-wider text-stone-400">
                      ROOM CODE:
                    </span>
                    <div className="text-4xl font-extrabold font-mono tracking-widest text-amber-400 mt-1">
                      {roomCode}
                    </div>
                    <div className="text-xs text-stone-400 mt-2 flex items-center gap-2">
                      <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      <span>{connectedPlayers}/2 Players Connected</span>
                      {connectedPlayers < 2 && (
                        <span className="text-amber-300 font-mono">
                          (Waiting for Player 2 over Wi-Fi...)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* QR Code and Quick Link */}
                  {qrDataUrl && (
                    <div className="flex flex-col items-center">
                      <div
                        onClick={() => setShowQrModal(true)}
                        className="bg-white p-2 rounded-xl border border-stone-700 cursor-pointer hover:scale-105 transition-transform"
                        title="Click to enlarge QR Code"
                      >
                        <img src={qrDataUrl} alt="Join Match QR Code" className="w-28 h-28" />
                      </div>
                      <span className="text-[10px] font-mono text-stone-400 mt-1 flex items-center gap-1">
                        <QrCode className="w-3 h-3" /> Scan with mobile phone
                      </span>
                    </div>
                  )}
                </div>

                {/* Shareable URL Bar */}
                <div className="mt-4 pt-4 border-t border-stone-800 flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={matchUrl}
                    className="flex-1 bg-stone-900 text-stone-300 font-mono text-xs px-3 py-2 rounded-lg border border-stone-800 truncate"
                  />
                  <button
                    id="btn-copy-link"
                    onClick={handleCopyLink}
                    className="px-3 py-2 bg-stone-800 hover:bg-stone-700 text-amber-400 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'COPIED!' : 'COPY LINK'}</span>
                  </button>
                </div>
              </div>

              {/* Wi-Fi Instructions Help Note */}
              <div className="bg-stone-950/40 border border-stone-800 rounded-xl p-3.5 text-xs text-stone-400 flex items-start gap-3">
                <Wifi className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-stone-200">How Local Wi-Fi Matching Works:</strong>
                  <p className="mt-0.5 text-stone-400 leading-normal">
                    Both devices must be connected to the same Wi-Fi router. Player 2 can either scan the QR code above with their smartphone camera, open the copied link in their browser, or enter the room code <span className="text-amber-400 font-mono font-bold">{roomCode}</span>.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Alternative Practice Modes Info */}
      {gameMode === 'vs_ai' && (
        <div className="bg-stone-950/70 border border-stone-800 rounded-xl p-5 text-center">
          <Bot className="w-8 h-8 text-amber-400 mx-auto mb-2" />
          <h3 className="font-mono text-sm font-bold text-amber-400">SOLO DOJO TRAINING</h3>
          <p className="text-xs text-stone-400 mt-1 max-w-md mx-auto">
            Spar against the AI Martial Arts Master. Practice your distance spacing, high/mid/low strike combinations, and parry timings before challenging a friend on Wi-Fi!
          </p>
        </div>
      )}

      {gameMode === 'local_hotseat' && (
        <div className="bg-stone-950/70 border border-stone-800 rounded-xl p-5 text-center">
          <Users className="w-8 h-8 text-sky-400 mx-auto mb-2" />
          <h3 className="font-mono text-sm font-bold text-sky-400">PASS & PLAY / HOTSEAT</h3>
          <p className="text-xs text-stone-400 mt-1 max-w-md mx-auto">
            Play together on one computer keyboard! Player 1 uses WASD + JKL; Player 2 uses Arrow Keys + NumPad 1,2,3 or UI controls.
          </p>
        </div>
      )}

      {/* QR Code Enlarged Modal */}
      {showQrModal && qrDataUrl && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
          onClick={() => setShowQrModal(false)}
        >
          <div
            className="bg-stone-900 border border-stone-700 rounded-2xl p-6 max-w-xs w-full text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="font-mono font-bold text-amber-400 mb-2">SCAN TO JOIN</h4>
            <div className="bg-white p-3 rounded-xl inline-block mb-3">
              <img src={qrDataUrl} alt="QR Code" className="w-56 h-56" />
            </div>
            <p className="text-xs text-stone-400 font-mono mb-4">
              Connect to same Wi-Fi & scan with phone camera
            </p>
            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 font-mono text-xs font-bold rounded-lg cursor-pointer"
            >
              CLOSE
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
