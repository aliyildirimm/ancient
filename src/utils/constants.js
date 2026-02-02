export const SPEED = 2;
export const JUMP_SPEED = 0.1;
export const ROTATION_SPEED = 2;
export const MAX_AIR_JUMPS = 3;

export const GRID_WIDTH = 2;
export const GRID_DEPTH = 2;
export const GRID_HEIGHT = 0.5;

export const BUILDING_WIDTH = 2;
export const BUILDING_DEPTH = 2;
export const BUILDING_HEIGHTS = [2, 4, 6];

// Animation constants
export const ARM_SWING_AMPLITUDE = Math.PI / 4;      // ±45°
export const LEG_SWING_AMPLITUDE = Math.PI / 6;      // ±30°
export const IDLE_SWAY_AMPLITUDE = Math.PI / 36;     // ±5°

export const WALK_ANIMATION_FREQUENCY = 3;            // Base frequency (rad/sec)
export const IDLE_ANIMATION_FREQUENCY = 0.5;          // Slow sway (rad/sec)
export const JUMP_PULL_UP_DURATION = 0.1;             // Seconds
