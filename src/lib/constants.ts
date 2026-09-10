export const ARENA_MIN_X = 120;
export const ARENA_MAX_X = 880;
export const INITIAL_P1_X = 340;
export const INITIAL_P2_X = 660;

export const MAX_HEALTH = 12; // 12 arrows per fighter
export const MAX_STAMINA = 100;
export const STAMINA_REGEN = 1.2;

export const ACTION_DURATIONS: Record<string, number> = {
  idle: 0,
  walk_forward: 8,
  walk_backward: 8,
  run: 12,
  high_punch: 10,
  mid_kick: 14,
  low_kick: 16,
  block_high: 12,
  block_low: 12,
  bow: 24,
  hit_stagger: 12,
  knockdown: 35,
  victory: 50,
};

export const ACTION_STAMINA_COST: Record<string, number> = {
  high_punch: 14,
  mid_kick: 20,
  low_kick: 18,
  block_high: 8,
  block_low: 8,
  run: 4,
  bow: 0,
};

export const STRIKE_RANGES: Record<string, { min: number; max: number; damage: number; pushback: number; height: 'high' | 'mid' | 'low' }> = {
  high_punch: { min: 40, max: 95, damage: 2, pushback: 35, height: 'high' },
  mid_kick: { min: 60, max: 130, damage: 3, pushback: 55, height: 'mid' },
  low_kick: { min: 50, max: 110, damage: 2, pushback: 40, height: 'low' },
};

export const MOVE_SPEED = {
  walk: 4.5,
  run: 9.0,
  retreat: 3.5,
};
