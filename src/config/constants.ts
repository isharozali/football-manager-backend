// Domain constants kept in one place for consistency and easy tweaking

export const TEAM_INITIAL_BUDGET = 5000000;
export const TEAM_MIN_PLAYERS = 15;
export const TEAM_MAX_PLAYERS = 25;
export const TRANSFER_BUY_DISCOUNT = 0.95; // Buy at 95% of asking price
export const PLAYER_DEFAULT_PRICE = 100000;

export const INITIAL_SQUAD_COMPOSITION = {
  GK: 3,
  DEF: 6,
  MID: 6,
  ATT: 5,
} as const;
