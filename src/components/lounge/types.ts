export interface LoungeGuest {
  id: string;
  tableNumber: number;
  nickname: string;
  spotClue: string;
  respondsWithWaveBack: boolean;
}

export type WavePresetId =
  | 'friendly-hey'
  | 'treat-drink'
  | 'game-excuse'
  | 'direct-swap';

export interface SentWaveRecord {
  guestId: string;
  presetId: WavePresetId;
  presetTitle: string;
  message: string;
  status: 'sent' | 'waved-back';
}

export interface EphemeralChatMessage {
  id: string;
  sender: 'you' | 'them';
  text: string;
  timeLabel: string;
}

export const DEMO_LOUNGE_GUESTS: LoungeGuest[] = [
  {
    id: 'hana',
    tableNumber: 2,
    nickname: 'Hana',
    spotClue: 'Window seat',
    respondsWithWaveBack: true,
  },
  {
    id: 'dawit',
    tableNumber: 3,
    nickname: 'Dawit',
    spotClue: 'Black hoodie',
    respondsWithWaveBack: false,
  },
  {
    id: 'maya',
    tableNumber: 4,
    nickname: 'Maya',
    spotClue: 'Corner table',
    respondsWithWaveBack: true,
  },
];

export interface WavePresetCard {
  id: WavePresetId;
  title: string;
  buildMessage: (tableNumber: number) => string;
  badgeText?: string;
}

export const WAVE_PRESETS: WavePresetCard[] = [
  {
    id: 'friendly-hey',
    title: 'Friendly Hey',
    buildMessage: (table) => `Hey from Table ${table} — nice vibe.`,
  },
  {
    id: 'treat-drink',
    title: 'Treat a Drink',
    buildMessage: () => 'Can I cover your next tea or macchiato?',
    badgeText: 'Cafe Treat',
  },
  {
    id: 'game-excuse',
    title: 'Game Excuse',
    buildMessage: () => 'Winner buys coffee? Quick Tic-Tac-Toe.',
  },
  {
    id: 'direct-swap',
    title: 'Direct Swap',
    buildMessage: () => 'Too shy to walk over — swap Telegram or IG?',
  },
];

export const QUICK_REPLY_BUBBLES = [
  'Coffee’s on me next round!',
  'Come say hi anytime',
  'Down for a quick game!',
  'Nice spot — studying or chilling?',
];
