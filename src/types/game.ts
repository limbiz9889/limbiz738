export type PlayerId = 'p1' | 'p2';

export type Stance = 'standing' | 'crouching' | 'bowing' | 'running';

export type CombatAction =
  | 'idle'
  | 'walk_forward'
  | 'walk_backward'
  | 'run'
  | 'high_punch'
  | 'mid_kick'
  | 'low_kick'
  | 'block_high'
  | 'block_low'
  | 'bow'
  | 'hit_stagger'
  | 'knockdown'
  | 'victory';

export interface FighterState {
  id: PlayerId;
  name: string;
  x: number; // 0 to 1000
  facing: 1 | -1; // 1 = facing right, -1 = facing left
  stance: Stance;
  action: CombatAction;
  actionTimer: number; // Ticks remaining in current action
  health: number; // 0 to 10 (represented by arrows in classic Karateka meter)
  stamina: number; // 0 to 100
  score: number; // Rounds won
  isGrounded: boolean;
  isHit: boolean;
  isBlocking: boolean;
  blockType: 'high' | 'low' | null;
  comboHits: number;
}

export interface SparkEffect {
  id: string;
  x: number;
  y: number;
  size: number;
  timer: number;
  type: 'hit' | 'block' | 'critical';
}

export type GameStatus = 'waiting' | 'ready' | 'countdown' | 'fighting' | 'round_over' | 'match_over';

export interface GameState {
  roomCode: string;
  round: number;
  maxRounds: number;
  status: GameStatus;
  winner: PlayerId | 'draw' | null;
  roundTimer: number;
  countdown: number;
  fighters: {
    p1: FighterState;
    p2: FighterState;
  };
  sparks: SparkEffect[];
  lastActionTime: number;
  momentum: number; // -10 to +10 (-10 max P2 advantage, +10 max P1 advantage)
}

export type ClientCommand =
  | { type: 'join'; roomCode: string; playerName?: string }
  | { type: 'ready' }
  | { type: 'action'; action: CombatAction }
  | { type: 'rematch' }
  | { type: 'ping'; timestamp: number };

export type ServerMessage =
  | { type: 'room_joined'; player: PlayerId; roomCode: string; state: GameState }
  | { type: 'player_connected'; player: PlayerId }
  | { type: 'player_disconnected'; player: PlayerId }
  | { type: 'game_update'; state: GameState }
  | { type: 'combat_event'; event: 'hit' | 'block' | 'round_start' | 'round_win' | 'match_win'; target: PlayerId; damage?: number; x?: number; y?: number }
  | { type: 'pong'; clientTimestamp: number; serverTimestamp: number }
  | { type: 'error'; message: string };

export type GameMode = 'wifi_multiplayer' | 'local_hotseat' | 'vs_ai';
