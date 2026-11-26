import { useState } from 'react';
import {
  Zap,
  Grid3X3,
  CircleDot,
  HelpCircle,
  Disc3,
  ChevronRight,
} from 'lucide-react';
import {
  SAME_TABLE_GAMES,
  type DealConfig,
  type GameId,
  type GameMetadata,
  type GameOutcome,
} from './types';
import { TRANSLATIONS, type Language } from '../../i18n/translations';
import { DealSetupScreen } from './DealSetupModal';
import { GameWinnerView } from './GameWinnerView';
import { ReactionDuelGame } from './ReactionDuelGame';
import { TicTacToeGame } from './TicTacToeGame';
import { Connect4Game } from './Connect4Game';
import { TriviaGame } from './TriviaGame';
import { BillRouletteGame } from './BillRouletteGame';
import { TableVsTableView } from './TableVsTableView';

type PlaySubTab = 'same-table' | 'table-vs-table';
type Stage = 'lobby' | 'setup' | 'playing' | 'winner';

const GAME_ICONS: Record<GameId, typeof Zap> = {
  'reaction-duel': Zap,
  'tic-tac-toe': Grid3X3,
  'connect-4': CircleDot,
  trivia: HelpCircle,
  'bill-roulette': Disc3,
};

interface PlayViewProps {
  language: Language;
  tableNumber: number;
  onNotify: (message: string) => void;
}

export function PlayView({ language, tableNumber, onNotify }: PlayViewProps) {
  const t = TRANSLATIONS[language];
  const [subTab, setSubTab] = useState<PlaySubTab>('same-table');
  const [stage, setStage] = useState<Stage>('lobby');
  const [selectedGame, setSelectedGame] = useState<GameMetadata | null>(null);
  const [dealConfig, setDealConfig] = useState<DealConfig | null>(null);
  const [outcome, setOutcome] = useState<GameOutcome | null>(null);
  const [matchNonce, setMatchNonce] = useState(0);

  const getLocalizedGame = (game: GameMetadata): GameMetadata => {
    const localized = t.play.games[game.id];
    return {
      ...game,
      title: localized.title,
      subtitle: localized.subtitle,
      playersLabel: localized.players,
    };
  };

  const handleSelectGame = (game: GameMetadata) => {
    setSelectedGame(getLocalizedGame(game));
    setDealConfig(null);
    setOutcome(null);
    setStage('setup');
  };

  const handleStartGame = (config: DealConfig) => {
    setDealConfig(config);
    setOutcome(null);
    setMatchNonce((n) => n + 1);
    setStage('playing');
  };

  const handleGameComplete = (result: GameOutcome) => {
    setOutcome(result);
    setStage('winner');
  };

  const handleRematch = () => {
    setOutcome(null);
    setMatchNonce((n) => n + 1);
    setStage('playing');
  };

  const handleExitToLobby = () => {
    setStage('lobby');
    setSelectedGame(null);
    setOutcome(null);
  };

  if (subTab === 'same-table' && stage === 'setup' && selectedGame) {
    return (
      <DealSetupScreen
        game={selectedGame}
        initialConfig={dealConfig}
        onCancel={handleExitToLobby}
        onStartGame={handleStartGame}
      />
    );
  }

  if (subTab === 'same-table' && stage === 'playing' && selectedGame) {
    switch (selectedGame.id) {
      case 'reaction-duel':
        return (
          <ReactionDuelGame
            key={matchNonce}
            onComplete={handleGameComplete}
            onExit={handleExitToLobby}
          />
        );
      case 'tic-tac-toe':
        return (
          <TicTacToeGame
            key={matchNonce}
            onComplete={handleGameComplete}
            onExit={handleExitToLobby}
          />
        );
      case 'connect-4':
        return (
          <Connect4Game
            key={matchNonce}
            onComplete={handleGameComplete}
            onExit={handleExitToLobby}
          />
        );
      case 'trivia':
        return (
          <TriviaGame
            key={matchNonce}
            onComplete={handleGameComplete}
            onExit={handleExitToLobby}
          />
        );
      case 'bill-roulette':
        return (
          <BillRouletteGame
            key={matchNonce}
            onComplete={handleGameComplete}
            onExit={handleExitToLobby}
          />
        );
    }
  }

  if (
    subTab === 'same-table' &&
    stage === 'winner' &&
    selectedGame &&
    dealConfig &&
    outcome
  ) {
    return (
      <GameWinnerView
        game={selectedGame}
        deal={dealConfig}
        outcome={outcome}
        onRematch={handleRematch}
        onExit={handleExitToLobby}
      />
    );
  }

  return (
    <div className="px-4 pt-4 pb-24 space-y-5">
      <div>
        <h1 className="font-display text-2xl font-semibold text-[#18181B]">
          {t.play.title}
        </h1>
        <p className="text-sm text-[#71717A] mt-0.5">{t.play.subtitle}</p>
      </div>

      {/* Mode Toggle: Same Table (1 Phone) vs Table vs. Table */}
      <div
        role="tablist"
        aria-label="Play modes"
        className="grid grid-cols-2 gap-1 p-1 bg-[#EAE6DF] rounded-2xl"
      >
        <button
          type="button"
          role="tab"
          aria-selected={subTab === 'same-table'}
          onClick={() => setSubTab('same-table')}
          className={`min-h-[42px] px-3 py-2 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
            subTab === 'same-table'
              ? 'bg-white text-[#18181B] shadow-sm'
              : 'text-[#52525B] hover:text-[#18181B]'
          }`}
        >
          {t.play.sameTableTab}
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={subTab === 'table-vs-table'}
          onClick={() => setSubTab('table-vs-table')}
          className={`min-h-[42px] px-3 py-2 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
            subTab === 'table-vs-table'
              ? 'bg-white text-[#18181B] shadow-sm'
              : 'text-[#52525B] hover:text-[#18181B]'
          }`}
        >
          {t.play.tableVsTableTab}
        </button>
      </div>

      {subTab === 'same-table' ? (
        <div className="space-y-3">
          {SAME_TABLE_GAMES.map((rawGame) => {
            const game = getLocalizedGame(rawGame);
            const Icon = GAME_ICONS[game.id];
            return (
              <button
                key={game.id}
                type="button"
                onClick={() => handleSelectGame(rawGame)}
                className="w-full bg-white rounded-2xl border border-[#E7E5E0] hover:border-[#4A5D4E]/50 p-4 text-left flex items-center justify-between gap-3 active:scale-[0.99] transition"
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-[#FAF8F5] border border-[#E7E5E0] text-[#4A5D4E] flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-[15px] font-semibold text-[#18181B]">
                      {game.title}
                    </h2>
                    <p className="text-xs text-[#71717A] leading-relaxed mt-0.5">
                      {game.subtitle}
                    </p>
                    <div className="text-[11px] text-[#71717A] mt-1.5">
                      {game.playersLabel} · {game.durationLabel}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#A1A1AA] shrink-0" />
              </button>
            );
          })}
        </div>
      ) : (
        <TableVsTableView yourTableNumber={tableNumber} onNotify={onNotify} />
      )}
    </div>
  );
}
