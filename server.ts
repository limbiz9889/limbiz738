import express from 'express';
import http from 'http';
import path from 'path';
import os from 'os';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer as createViteServer } from 'vite';
import {
  GameState,
  PlayerId,
  ClientCommand,
  ServerMessage,
} from './src/types/game';
import {
  createInitialGameState,
  updateGameState,
  applyPlayerAction,
  resetRound,
} from './src/lib/gameEngine';

const PORT = 3000;
const app = express();
app.use(express.json());

// In-memory Room State
interface Room {
  code: string;
  p1: WebSocket | null;
  p2: WebSocket | null;
  gameState: GameState;
  interval: NodeJS.Timeout | null;
  lastTick: number;
}

const rooms = new Map<string, Room>();

// Helper to broadcast to room players
function broadcastToRoom(room: Room, message: ServerMessage) {
  const payload = JSON.stringify(message);
  if (room.p1 && room.p1.readyState === WebSocket.OPEN) {
    room.p1.send(payload);
  }
  if (room.p2 && room.p2.readyState === WebSocket.OPEN) {
    room.p2.send(payload);
  }
}

function startRoomGameLoop(room: Room) {
  if (room.interval) clearInterval(room.interval);
  room.lastTick = Date.now();

  room.interval = setInterval(() => {
    const now = Date.now();
    const deltaSec = (now - room.lastTick) / 1000;
    room.lastTick = now;

    const { nextState, events } = updateGameState(room.gameState, deltaSec);
    room.gameState = nextState;

    // Send combat events if any
    events.forEach((ev) => {
      broadcastToRoom(room, {
        type: 'combat_event',
        event: ev.type as any,
        target: ev.target,
        damage: ev.damage,
        x: ev.x,
        y: ev.y,
      });
    });

    // Handle transition after round_over
    if (nextState.status === 'round_over' && !nextState.countdown) {
      nextState.countdown = 3.5; // wait 3.5s before resetting
    } else if (nextState.status === 'round_over' && nextState.countdown > 0) {
      nextState.countdown -= deltaSec;
      if (nextState.countdown <= 0) {
        room.gameState = resetRound(nextState);
        room.gameState.round++;
      }
    }

    // Broadcast tick state
    broadcastToRoom(room, {
      type: 'game_update',
      state: room.gameState,
    });
  }, 33); // ~30 fps server tick
}

// 1. API Endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', activeRooms: rooms.size });
});

// Network info to help discover local Wi-Fi IP address
app.get('/api/network-info', (req, res) => {
  const nets = os.networkInterfaces();
  const lanUrls: string[] = [];

  for (const name of Object.keys(nets)) {
    const netList = nets[name];
    if (!netList) continue;
    for (const net of netList) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      if (net.family === 'IPv4' && !net.internal) {
        lanUrls.push(`http://${net.address}:${PORT}`);
      }
    }
  }

  res.json({
    lanUrls,
    appUrl: process.env.APP_URL || '',
  });
});

// Create Room Endpoint
app.post('/api/rooms/create', (req, res) => {
  const words = ['DOJO', 'TIGER', 'CRANE', 'BUSHIDO', 'SHINOBI', 'FIST', 'KICK', 'DRAGON', 'VIPER', 'LOTUS'];
  const randWord = words[Math.floor(Math.random() * words.length)];
  const randNum = Math.floor(10 + Math.random() * 90);
  const code = `${randWord}${randNum}`;

  const room: Room = {
    code,
    p1: null,
    p2: null,
    gameState: createInitialGameState(code),
    interval: null,
    lastTick: Date.now(),
  };

  rooms.set(code, room);
  res.json({ roomCode: code });
});

// Get Room Status
app.get('/api/rooms/:code', (req, res) => {
  const code = req.params.code.toUpperCase();
  const room = rooms.get(code);
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  res.json({
    roomCode: room.code,
    players: (room.p1 ? 1 : 0) + (room.p2 ? 1 : 0),
    status: room.gameState.status,
  });
});

// 2. Start HTTP & WebSocket Server
async function startServer() {
  const server = http.createServer(app);
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws: WebSocket) => {
    let currentRoom: Room | null = null;
    let playerRole: PlayerId | null = null;

    ws.on('message', (data: string) => {
      try {
        const cmd: ClientCommand = JSON.parse(data.toString());

        if (cmd.type === 'join') {
          const code = cmd.roomCode.toUpperCase();
          let room = rooms.get(code);

          if (!room) {
            // Auto-create room if not found
            room = {
              code,
              p1: null,
              p2: null,
              gameState: createInitialGameState(code),
              interval: null,
              lastTick: Date.now(),
            };
            rooms.set(code, room);
          }

          currentRoom = room;

          // Assign slot
          if (!room.p1 || room.p1.readyState !== WebSocket.OPEN) {
            room.p1 = ws;
            playerRole = 'p1';
            if (cmd.playerName) room.gameState.fighters.p1.name = cmd.playerName;
          } else if (!room.p2 || room.p2.readyState !== WebSocket.OPEN) {
            room.p2 = ws;
            playerRole = 'p2';
            if (cmd.playerName) room.gameState.fighters.p2.name = cmd.playerName;
            // Both players joined! Start match
            room.gameState.status = 'countdown';
            room.gameState.countdown = 3;
            startRoomGameLoop(room);
          } else {
            ws.send(JSON.stringify({ type: 'error', message: 'Room is already full!' }));
            return;
          }

          ws.send(
            JSON.stringify({
              type: 'room_joined',
              player: playerRole,
              roomCode: room.code,
              state: room.gameState,
            })
          );

          broadcastToRoom(room, {
            type: 'player_connected',
            player: playerRole,
          });
        } else if (cmd.type === 'action' && currentRoom && playerRole) {
          const fighter = currentRoom.gameState.fighters[playerRole];
          if (fighter) {
            currentRoom.gameState.fighters[playerRole] = applyPlayerAction(
              fighter,
              cmd.action
            );
          }
        } else if (cmd.type === 'rematch' && currentRoom) {
          currentRoom.gameState = createInitialGameState(currentRoom.code);
          currentRoom.gameState.status = 'countdown';
          currentRoom.gameState.countdown = 3;
          startRoomGameLoop(currentRoom);
          broadcastToRoom(currentRoom, {
            type: 'game_update',
            state: currentRoom.gameState,
          });
        } else if (cmd.type === 'ping') {
          ws.send(
            JSON.stringify({
              type: 'pong',
              clientTimestamp: cmd.timestamp,
              serverTimestamp: Date.now(),
            })
          );
        }
      } catch (err) {
        console.error('WS Error:', err);
      }
    });

    ws.on('close', () => {
      if (currentRoom && playerRole) {
        if (playerRole === 'p1') currentRoom.p1 = null;
        if (playerRole === 'p2') currentRoom.p2 = null;

        broadcastToRoom(currentRoom, {
          type: 'player_disconnected',
          player: playerRole,
        });

        // If both disconnected, cleanup loop
        if (!currentRoom.p1 && !currentRoom.p2) {
          if (currentRoom.interval) clearInterval(currentRoom.interval);
          rooms.delete(currentRoom.code);
        }
      }
    });
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Two-Player Strategy Server running on port ${PORT}`);
  });
}

startServer();
