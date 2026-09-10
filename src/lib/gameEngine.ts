import {
  GameState,
  FighterState,
  CombatAction,
  SparkEffect,
  PlayerId,
} from '../types/game';
import {
  ARENA_MIN_X,
  ARENA_MAX_X,
  INITIAL_P1_X,
  INITIAL_P2_X,
  MAX_HEALTH,
  MAX_STAMINA,
  STAMINA_REGEN,
  ACTION_DURATIONS,
  ACTION_STAMINA_COST,
  STRIKE_RANGES,
  MOVE_SPEED,
} from './constants';

export function createInitialFighter(id: PlayerId, x: number, facing: 1 | -1): FighterState {
  return {
    id,
    name: id === 'p1' ? 'White Crane' : 'Shadow Tiger',
    x,
    facing,
    stance: 'standing',
    action: 'idle',
    actionTimer: 0,
    health: MAX_HEALTH,
    stamina: MAX_STAMINA,
    score: 0,
    isGrounded: true,
    isHit: false,
    isBlocking: false,
    blockType: null,
    comboHits: 0,
  };
}

export function createInitialGameState(roomCode: string = 'DOJO'): GameState {
  return {
    roomCode,
    round: 1,
    maxRounds: 3,
    status: 'countdown',
    winner: null,
    roundTimer: 99,
    countdown: 3,
    fighters: {
      p1: createInitialFighter('p1', INITIAL_P1_X, 1),
      p2: createInitialFighter('p2', INITIAL_P2_X, -1),
    },
    sparks: [],
    lastActionTime: Date.now(),
    momentum: 0,
  };
}

export function resetRound(state: GameState): GameState {
  return {
    ...state,
    status: 'countdown',
    countdown: 3,
    roundTimer: 99,
    winner: null,
    sparks: [],
    fighters: {
      p1: {
        ...state.fighters.p1,
        x: INITIAL_P1_X,
        facing: 1,
        stance: 'standing',
        action: 'idle',
        actionTimer: 0,
        health: MAX_HEALTH,
        stamina: MAX_STAMINA,
        isHit: false,
        isBlocking: false,
        blockType: null,
      },
      p2: {
        ...state.fighters.p2,
        x: INITIAL_P2_X,
        facing: -1,
        stance: 'standing',
        action: 'idle',
        actionTimer: 0,
        health: MAX_HEALTH,
        stamina: MAX_STAMINA,
        isHit: false,
        isBlocking: false,
        blockType: null,
      },
    },
    momentum: 0,
  };
}

export interface StepResult {
  nextState: GameState;
  events: Array<{
    type: 'hit' | 'block' | 'round_start' | 'round_win' | 'match_win' | 'whoosh' | 'step';
    target?: PlayerId;
    damage?: number;
    x?: number;
    y?: number;
    pitch?: 'high' | 'mid' | 'low';
  }>;
}

export function applyPlayerAction(
  fighter: FighterState,
  action: CombatAction
): FighterState {
  // If fighter is stunned / knocked down, cannot act
  if (fighter.action === 'hit_stagger' || fighter.action === 'knockdown') {
    return fighter;
  }

  // If already executing an attack or bow, wait unless it's a movement stop
  if (
    ['high_punch', 'mid_kick', 'low_kick', 'bow'].includes(fighter.action) &&
    fighter.actionTimer > 0
  ) {
    return fighter;
  }

  const cost = ACTION_STAMINA_COST[action] || 0;
  if (cost > fighter.stamina) {
    // Insufficient stamina
    return fighter;
  }

  let newStance = fighter.stance;
  let isBlocking = false;
  let blockType: 'high' | 'low' | null = null;

  if (action === 'block_high') {
    isBlocking = true;
    blockType = 'high';
  } else if (action === 'block_low') {
    isBlocking = true;
    blockType = 'low';
    newStance = 'crouching';
  } else if (action === 'bow') {
    newStance = 'bowing';
  } else if (action === 'run') {
    newStance = 'running';
  } else {
    newStance = 'standing';
  }

  return {
    ...fighter,
    action,
    stance: newStance,
    actionTimer: ACTION_DURATIONS[action] || 0,
    stamina: Math.max(0, fighter.stamina - cost),
    isBlocking,
    blockType,
  };
}

export function updateGameState(state: GameState, deltaSec: number = 0.033): StepResult {
  const events: StepResult['events'] = [];
  const nextState: GameState = JSON.parse(JSON.stringify(state));

  // 1. Handle countdown
  if (nextState.status === 'countdown') {
    nextState.countdown -= deltaSec;
    if (nextState.countdown <= 0) {
      nextState.status = 'fighting';
      nextState.countdown = 0;
      events.push({ type: 'round_start' });
    }
    return { nextState, events };
  }

  if (nextState.status !== 'fighting') {
    // Tick sparks even if round is over
    nextState.sparks = nextState.sparks
      .map((s) => ({ ...s, timer: s.timer - 1 }))
      .filter((s) => s.timer > 0);
    return { nextState, events };
  }

  // 2. Round timer
  nextState.roundTimer = Math.max(0, nextState.roundTimer - deltaSec);
  if (nextState.roundTimer <= 0) {
    // Time out: whoever has more health wins, or draw
    if (nextState.fighters.p1.health > nextState.fighters.p2.health) {
      return handleRoundEnd(nextState, 'p1', events);
    } else if (nextState.fighters.p2.health > nextState.fighters.p1.health) {
      return handleRoundEnd(nextState, 'p2', events);
    } else {
      return handleRoundEnd(nextState, 'draw', events);
    }
  }

  // 3. Process fighters movement & timers
  const p1 = nextState.fighters.p1;
  const p2 = nextState.fighters.p2;

  // Always face opponent
  if (p1.x < p2.x) {
    p1.facing = 1;
    p2.facing = -1;
  } else {
    p1.facing = -1;
    p2.facing = 1;
  }

  [p1, p2].forEach((f) => {
    // Stamina regen
    f.stamina = Math.min(MAX_STAMINA, f.stamina + STAMINA_REGEN);

    if (f.actionTimer > 0) {
      f.actionTimer--;
      if (f.actionTimer === 0) {
        if (f.action === 'hit_stagger' || f.action === 'bow') {
          f.action = 'idle';
          f.stance = 'standing';
        } else if (f.action === 'block_high' || f.action === 'block_low') {
          f.action = 'idle';
          f.isBlocking = false;
          f.blockType = null;
          f.stance = 'standing';
        } else if (['high_punch', 'mid_kick', 'low_kick'].includes(f.action)) {
          f.action = 'idle';
        }
      }
    }

    // Movement execution
    const opponent = f.id === 'p1' ? p2 : p1;
    const dist = Math.abs(f.x - opponent.x);
    const minSeparation = 45;

    if (f.action === 'walk_forward') {
      const step = MOVE_SPEED.walk * f.facing;
      const targetX = f.x + step;
      if (dist > minSeparation || (f.facing === 1 ? targetX < opponent.x : targetX > opponent.x)) {
        f.x = Math.max(ARENA_MIN_X, Math.min(ARENA_MAX_X, targetX));
      }
    } else if (f.action === 'walk_backward') {
      const step = -MOVE_SPEED.retreat * f.facing;
      f.x = Math.max(ARENA_MIN_X, Math.min(ARENA_MAX_X, f.x + step));
    } else if (f.action === 'run') {
      const step = MOVE_SPEED.run * f.facing;
      const targetX = f.x + step;
      if (dist > minSeparation || (f.facing === 1 ? targetX < opponent.x : targetX > opponent.x)) {
        f.x = Math.max(ARENA_MIN_X, Math.min(ARENA_MAX_X, targetX));
      }
    }
  });

  // 4. Hit Detection (Active attack frame around mid-duration)
  checkCombatStrike(p1, p2, nextState, events);
  checkCombatStrike(p2, p1, nextState, events);

  // 5. Update Sparks
  nextState.sparks = nextState.sparks
    .map((s) => ({ ...s, timer: s.timer - 1 }))
    .filter((s) => s.timer > 0);

  // 6. Check Win Condition for the round
  if (p1.health <= 0 || p1.x <= ARENA_MIN_X) {
    return handleRoundEnd(nextState, 'p2', events);
  }
  if (p2.health <= 0 || p2.x >= ARENA_MAX_X) {
    return handleRoundEnd(nextState, 'p1', events);
  }

  return { nextState, events };
}

function checkCombatStrike(
  attacker: FighterState,
  defender: FighterState,
  state: GameState,
  events: StepResult['events']
) {
  const strikeInfo = STRIKE_RANGES[attacker.action];
  if (!strikeInfo) return;

  // Trigger strike check at frame 4 of the attack
  const duration = ACTION_DURATIONS[attacker.action] || 10;
  const strikeFrame = Math.floor(duration / 2);

  if (attacker.actionTimer === strikeFrame) {
    const dist = Math.abs(attacker.x - defender.x);

    // Play whoosh sound
    events.push({
      type: 'whoosh',
      pitch: strikeInfo.height,
    });

    // Check distance in range
    if (dist >= strikeInfo.min && dist <= strikeInfo.max) {
      // Check block defense
      let isBlocked = false;
      if (defender.isBlocking) {
        if (strikeInfo.height === 'high' && defender.blockType === 'high') {
          isBlocked = true;
        } else if (strikeInfo.height === 'mid' && (defender.blockType === 'high' || defender.blockType === 'low')) {
          isBlocked = true;
        } else if (strikeInfo.height === 'low' && defender.blockType === 'low') {
          isBlocked = true;
        }
      }

      const impactX = (attacker.x + defender.x) / 2;
      const impactY = strikeInfo.height === 'high' ? 190 : strikeInfo.height === 'mid' ? 220 : 255;

      if (isBlocked) {
        // Blocked!
        events.push({
          type: 'block',
          target: defender.id,
          x: impactX,
          y: impactY,
        });

        state.sparks.push({
          id: Math.random().toString(),
          x: impactX,
          y: impactY,
          size: 24,
          timer: 8,
          type: 'block',
        });

        // Small pushback on defender, small stagger on attacker
        defender.x = Math.max(ARENA_MIN_X, Math.min(ARENA_MAX_X, defender.x + 12 * attacker.facing));
        attacker.stamina = Math.max(0, attacker.stamina - 10);
      } else {
        // Clean Hit!
        let damage = strikeInfo.damage;
        let pushback = strikeInfo.pushback;

        // Running target vulnerability
        if (defender.stance === 'running') {
          damage += 1;
          pushback += 20;
        }

        defender.health = Math.max(0, defender.health - damage);
        defender.action = 'hit_stagger';
        defender.actionTimer = ACTION_DURATIONS.hit_stagger;
        defender.x = Math.max(ARENA_MIN_X, Math.min(ARENA_MAX_X, defender.x + pushback * attacker.facing));

        // Shift momentum
        if (attacker.id === 'p1') {
          state.momentum = Math.min(10, state.momentum + damage);
        } else {
          state.momentum = Math.max(-10, state.momentum - damage);
        }

        events.push({
          type: 'hit',
          target: defender.id,
          damage,
          x: impactX,
          y: impactY,
        });

        state.sparks.push({
          id: Math.random().toString(),
          x: impactX,
          y: impactY,
          size: 38,
          timer: 12,
          type: 'hit',
        });
      }
    }
  }
}

function handleRoundEnd(
  state: GameState,
  roundWinner: PlayerId | 'draw',
  events: StepResult['events']
): StepResult {
  state.status = 'round_over';
  state.winner = roundWinner;

  if (roundWinner === 'p1') {
    state.fighters.p1.score++;
    state.fighters.p1.action = 'victory';
    state.fighters.p2.action = 'knockdown';
  } else if (roundWinner === 'p2') {
    state.fighters.p2.score++;
    state.fighters.p2.action = 'victory';
    state.fighters.p1.action = 'knockdown';
  }

  const p1Wins = state.fighters.p1.score;
  const p2Wins = state.fighters.p2.score;
  const targetWins = Math.ceil(state.maxRounds / 2);

  if (p1Wins >= targetWins || p2Wins >= targetWins) {
    state.status = 'match_over';
    state.winner = p1Wins >= targetWins ? 'p1' : 'p2';
    events.push({
      type: 'match_win',
      target: state.winner,
    });
  } else {
    events.push({
      type: 'round_win',
      target: roundWinner === 'draw' ? undefined : roundWinner,
    });
  }

  return { nextState: state, events };
}

// Tactical AI Master
export function getTacticalAiAction(ai: FighterState, player: FighterState): CombatAction {
  const dist = Math.abs(ai.x - player.x);

  // If currently executing an action, wait
  if (ai.actionTimer > 0 && ai.action !== 'walk_forward' && ai.action !== 'walk_backward') {
    return ai.action;
  }

  // React to incoming player attacks with intelligent block/parry
  if (['high_punch', 'mid_kick', 'low_kick'].includes(player.action) && dist <= 120) {
    const roll = Math.random();
    if (roll < 0.7) {
      // 70% chance to predict or block
      if (player.action === 'low_kick') {
        return 'block_low';
      } else {
        return 'block_high';
      }
    }
  }

  // If low stamina, retreat to recover
  if (ai.stamina < 30) {
    return 'walk_backward';
  }

  // Close in if far
  if (dist > 150) {
    if (dist > 260 && Math.random() < 0.4) {
      return 'run';
    }
    return 'walk_forward';
  }

  // In strike range: 60 - 130
  if (dist >= 50 && dist <= 125) {
    const choice = Math.random();
    if (choice < 0.35) {
      return 'mid_kick';
    } else if (choice < 0.65) {
      return 'high_punch';
    } else if (choice < 0.85) {
      return 'low_kick';
    } else {
      return 'walk_backward'; // Tactical spacing step
    }
  }

  // Too close: retreat or low sweep
  if (dist < 50) {
    return Math.random() < 0.5 ? 'low_kick' : 'walk_backward';
  }

  return 'idle';
}
