export type GameId =
  | 'reaction-duel'
  | 'tic-tac-toe'
  | 'connect-4'
  | 'trivia'
  | 'bill-roulette';

export type PlayMode = 'fun' | 'deal';

export interface DealConfig {
  mode: PlayMode;
  dealText: string;
  player1Name: string;
  player2Name: string;
}

export interface GameOutcome {
  winnerName: string; // e.g. 'Player 1', 'Draw', or friend's name for Bill Roulette
  isDraw?: boolean;
  summaryLine: string;
  scoreDetail?: string;
}

export const DEAL_PRESETS = [
  'Bragging Rights',
  'One Round of Drinks',
  "Cover Today's Order",
] as const;

export interface GameMetadata {
  id: GameId;
  title: string;
  subtitle: string;
  playersLabel: string;
  durationLabel: string;
}

export const SAME_TABLE_GAMES: GameMetadata[] = [
  {
    id: 'reaction-duel',
    title: 'Reaction Duel',
    subtitle: 'Phone flat on table. Wait for the olive flash, tap fastest. Best of 3.',
    playersLabel: '2 Players · Simultaneous',
    durationLabel: '~1 min',
  },
  {
    id: 'tic-tac-toe',
    title: 'Tic-Tac-Toe',
    subtitle: 'Classic 3×3 quick pass-and-play match between sips.',
    playersLabel: '2 Players · Pass & Play',
    durationLabel: '~1 min',
  },
  {
    id: 'connect-4',
    title: 'Connect 4',
    subtitle: 'Drop tokens into the 7×6 board to line up four in a row.',
    playersLabel: '2 Players · Pass & Play',
    durationLabel: '~3 min',
  },
  {
    id: 'trivia',
    title: 'Pass-the-Phone Trivia',
    subtitle: '5 timed 10-second questions each. Privacy handoff, then compare scores.',
    playersLabel: '2 Players · 10s Timer',
    durationLabel: '~2 min',
  },
  {
    id: 'bill-roulette',
    title: 'Bill Roulette',
    subtitle: 'Add 2–8 friends at the table and spin the wheel to decide who pays.',
    playersLabel: '2–8 Players · Spin',
    durationLabel: '~30 sec',
  },
];
