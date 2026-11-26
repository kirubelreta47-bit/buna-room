import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Grid3X3,
  Handshake,
  HelpCircle,
  Loader2,
  Smile,
  Users,
} from 'lucide-react';
import {
  DEAL_PRESETS,
  type DealConfig,
  type GameMetadata,
  type GameOutcome,
  type PlayMode,
} from './types';
import { GameWinnerView } from './GameWinnerView';
import { LiveTableTicTacToe } from './LiveTableTicTacToe';
import { LiveTriviaBlitz } from './LiveTriviaBlitz';

type TvtGameType = 'live-trivia' | 'live-ttt';

interface OpponentTableInfo {
  tableNumber: number;
  guestsCount: number;
  vibe: string;
}

const ACTIVE_TABLES: OpponentTableInfo[] = [
  { tableNumber: 2, guestsCount: 3, vibe: 'Window seats · Ready to play' },
  { tableNumber: 3, guestsCount: 2, vibe: 'Near counter · Up for trivia' },
  { tableNumber: 4, guestsCount: 4, vibe: 'Corner booth · Looking for a match' },
];

type TvtStage = 'pick-table' | 'pick-game' | 'pick-deal' | 'waiting' | 'playing' | 'winner';

interface TableVsTableViewProps {
  yourTableNumber: number;
  onNotify: (message: string) => void;
}

export function TableVsTableView({
  yourTableNumber,
  onNotify,
}: TableVsTableViewProps) {
  const [stage, setStage] = useState<TvtStage>('pick-table');
  const [opponentTable, setOpponentTable] = useState<number | null>(null);
  const [gameType, setGameType] = useState<TvtGameType>('live-trivia');
  const [mode, setMode] = useState<PlayMode>('fun');
  const [selectedPreset, setSelectedPreset] = useState<string>(DEAL_PRESETS[0]);
  const [isCustomDeal, setIsCustomDeal] = useState(false);
  const [customDealText, setCustomDealText] = useState('');
  const [acceptedBanner, setAcceptedBanner] = useState(false);
  const [outcome, setOutcome] = useState<GameOutcome | null>(null);
  const [matchNonce, setMatchNonce] = useState(0);

  const resolvedDealText = isCustomDeal
    ? customDealText.trim() || 'Custom Friendly Deal'
    : selectedPreset;

  const dealConfig: DealConfig = {
    mode,
    dealText: mode === 'fun' ? 'Just for Fun' : resolvedDealText,
    player1Name: `Table ${yourTableNumber}`,
    player2Name: `Table ${opponentTable ?? 2}`,
  };

  const gameMeta: GameMetadata =
    gameType === 'live-trivia'
      ? {
          id: 'trivia',
          title: `Live Trivia Blitz vs Table ${opponentTable ?? 2}`,
          subtitle: '5 general knowledge questions · 10s timer',
          playersLabel: `Table ${yourTableNumber} vs Table ${opponentTable ?? 2}`,
          durationLabel: '~2 min',
        }
      : {
          id: 'tic-tac-toe',
          title: `Live Tic-Tac-Toe vs Table ${opponentTable ?? 2}`,
          subtitle: 'Responsive table-to-table match',
          playersLabel: `Table ${yourTableNumber} vs Table ${opponentTable ?? 2}`,
          durationLabel: '~1 min',
        };

  // Simulated 2-second handshake after sending challenge
  useEffect(() => {
    if (stage !== 'waiting' || !opponentTable) return;
    setAcceptedBanner(false);

    const acceptTimer = window.setTimeout(() => {
      setAcceptedBanner(true);
      onNotify(
        mode === 'deal'
          ? `Table ${opponentTable} accepted your deal!`
          : `Table ${opponentTable} joined the match!`
      );
    }, 2000);

    const launchTimer = window.setTimeout(() => {
      setMatchNonce((n) => n + 1);
      setStage('playing');
    }, 2700);

    return () => {
      window.clearTimeout(acceptTimer);
      window.clearTimeout(launchTimer);
    };
  }, [stage, opponentTable, mode, onNotify]);

  const handleResetToLobby = () => {
    setStage('pick-table');
    setOpponentTable(null);
    setOutcome(null);
    setAcceptedBanner(false);
  };

  if (stage === 'waiting' && opponentTable) {
    return (
      <div className="bg-white rounded-3xl border border-[#E7E5E0] p-6 text-center space-y-5">
        <div
          className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center ${
            acceptedBanner
              ? 'bg-[#4A5D4E] text-white'
              : 'bg-[#FAF8F5] border border-[#E7E5E0] text-[#C26D4A]'
          }`}
        >
          {acceptedBanner ? (
            <Check className="w-7 h-7" />
          ) : (
            <Loader2 className="w-6 h-6 animate-spin" />
          )}
        </div>

        <div>
          <div className="text-xs font-semibold text-[#C26D4A]">
            Table {yourTableNumber} → Table {opponentTable}
          </div>
          <h2 className="font-display text-2xl font-semibold text-[#18181B] mt-1">
            {acceptedBanner
              ? `Table ${opponentTable} accepted your deal!`
              : `Sending challenge to Table ${opponentTable}…`}
          </h2>
          <p className="text-sm text-[#71717A] mt-1.5">
            {acceptedBanner
              ? 'Launching live match now…'
              : mode === 'deal'
                ? `Proposed deal: ${resolvedDealText}`
                : 'Mode: Just for Fun'}
          </p>
        </div>

        {!acceptedBanner && (
          <button
            type="button"
            onClick={handleResetToLobby}
            className="text-xs text-[#71717A] hover:text-[#18181B] underline underline-offset-4"
          >
            Cancel challenge
          </button>
        )}
      </div>
    );
  }

  if (stage === 'playing' && opponentTable) {
    if (gameType === 'live-trivia') {
      return (
        <LiveTriviaBlitz
          key={matchNonce}
          yourTableNumber={yourTableNumber}
          opponentTableNumber={opponentTable}
          onComplete={(res) => {
            setOutcome(res);
            setStage('winner');
          }}
          onExit={handleResetToLobby}
        />
      );
    }

    return (
      <LiveTableTicTacToe
        key={matchNonce}
        playerLabel={`Table ${yourTableNumber} (You)`}
        opponentLabel={`Table ${opponentTable}`}
        onComplete={(res) => {
          setOutcome(res);
          setStage('winner');
        }}
        onExit={handleResetToLobby}
      />
    );
  }

  if (stage === 'winner' && outcome) {
    return (
      <GameWinnerView
        game={gameMeta}
        deal={dealConfig}
        outcome={outcome}
        onRematch={() => {
          setOutcome(null);
          setMatchNonce((n) => n + 1);
          setStage('playing');
        }}
        onExit={handleResetToLobby}
      />
    );
  }

  if (stage === 'pick-deal' && opponentTable) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => setStage('pick-game')}
          className="min-h-[38px] px-2 -ml-2 rounded-xl text-sm font-medium text-[#18181B] hover:bg-white flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="bg-white rounded-3xl border border-[#E7E5E0] p-5 space-y-5">
          <div>
            <div className="text-xs font-medium text-[#4A5D4E]">
              Table {yourTableNumber} vs Table {opponentTable}
            </div>
            <h2 className="font-display text-xl font-semibold text-[#18181B] mt-0.5">
              Choose Stakes
            </h2>
            <p className="text-xs text-[#71717A] mt-1">
              {gameType === 'live-trivia' ? 'Live Trivia Blitz' : 'Live Tic-Tac-Toe'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setMode('fun')}
              className={`p-3.5 rounded-2xl border text-left transition ${
                mode === 'fun'
                  ? 'bg-[#4A5D4E] border-[#4A5D4E] text-white'
                  : 'bg-[#FAF8F5] border-[#E7E5E0] text-[#18181B]'
              }`}
            >
              <Smile className="w-5 h-5 mb-2" />
              <div className="text-sm font-semibold">Just for Fun</div>
              <div
                className={`text-xs mt-0.5 ${
                  mode === 'fun' ? 'text-white/80' : 'text-[#71717A]'
                }`}
              >
                No stakes
              </div>
            </button>

            <button
              type="button"
              onClick={() => setMode('deal')}
              className={`p-3.5 rounded-2xl border text-left transition ${
                mode === 'deal'
                  ? 'bg-[#C26D4A] border-[#C26D4A] text-white'
                  : 'bg-[#FAF8F5] border-[#E7E5E0] text-[#18181B]'
              }`}
            >
              <Handshake className="w-5 h-5 mb-2" />
              <div className="text-sm font-semibold">Friendly Deal</div>
              <div
                className={`text-xs mt-0.5 ${
                  mode === 'deal' ? 'text-white/85' : 'text-[#71717A]'
                }`}
              >
                Honor-system
              </div>
            </button>
          </div>

          {mode === 'deal' && (
            <div className="space-y-2">
              {DEAL_PRESETS.map((preset) => {
                const active = !isCustomDeal && selectedPreset === preset;
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      setIsCustomDeal(false);
                      setSelectedPreset(preset);
                    }}
                    className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border text-left text-sm font-medium flex items-center justify-between transition ${
                      active
                        ? 'bg-[#C26D4A]/10 border-[#C26D4A] text-[#8C4529]'
                        : 'bg-[#FAF8F5] border-[#E7E5E0] text-[#18181B]'
                    }`}
                  >
                    <span>{preset}</span>
                    {active && <Check className="w-4 h-4 text-[#C26D4A]" />}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => setIsCustomDeal(true)}
                className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border text-left text-sm font-medium flex items-center justify-between transition ${
                  isCustomDeal
                    ? 'bg-[#C26D4A]/10 border-[#C26D4A] text-[#8C4529]'
                    : 'bg-[#FAF8F5] border-[#E7E5E0] text-[#18181B]'
                }`}
              >
                <span>Custom Deal</span>
                {isCustomDeal && <Check className="w-4 h-4 text-[#C26D4A]" />}
              </button>

              {isCustomDeal && (
                <input
                  type="text"
                  maxLength={60}
                  autoFocus
                  placeholder="e.g., Losing table covers 2 teas"
                  value={customDealText}
                  onChange={(e) => setCustomDealText(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 rounded-xl bg-white border border-[#C26D4A] text-sm text-[#18181B] placeholder:text-[#A1A1AA] focus:outline-none"
                />
              )}
            </div>
          )}

          <button
            type="button"
            disabled={mode === 'deal' && isCustomDeal && !customDealText.trim()}
            onClick={() => setStage('waiting')}
            className={`w-full min-h-[50px] rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-45 active:scale-[0.985] transition ${
              mode === 'deal'
                ? 'bg-[#C26D4A] hover:bg-[#A65A3B]'
                : 'bg-[#4A5D4E] hover:bg-[#3B4B3F]'
            }`}
          >
            <span>Send Challenge to Table {opponentTable}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  if (stage === 'pick-game' && opponentTable) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => setStage('pick-table')}
          className="min-h-[38px] px-2 -ml-2 rounded-xl text-sm font-medium text-[#18181B] hover:bg-white flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Change Table</span>
        </button>

        <div className="bg-white rounded-3xl border border-[#E7E5E0] p-5 space-y-4">
          <div>
            <div className="text-xs font-medium text-[#4A5D4E]">
              Challenging Table {opponentTable}
            </div>
            <h2 className="font-display text-xl font-semibold text-[#18181B] mt-0.5">
              Pick a Live Game
            </h2>
          </div>

          <div className="space-y-3">
            <button
              type="button"
              onClick={() => {
                setGameType('live-trivia');
                setStage('pick-deal');
              }}
              className="w-full p-4 rounded-2xl bg-[#FAF8F5] border border-[#E7E5E0] hover:border-[#4A5D4E] text-left flex items-start gap-3.5 active:scale-[0.99] transition"
            >
              <div className="w-11 h-11 rounded-xl bg-white border border-[#E7E5E0] text-[#4A5D4E] flex items-center justify-center shrink-0">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-[15px] font-semibold text-[#18181B]">
                  Live Trivia Blitz
                </div>
                <p className="text-xs text-[#71717A] mt-0.5 leading-relaxed">
                  5 general knowledge questions · 10-second timer · live score
                  race against Table {opponentTable}.
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setGameType('live-ttt');
                setStage('pick-deal');
              }}
              className="w-full p-4 rounded-2xl bg-[#FAF8F5] border border-[#E7E5E0] hover:border-[#4A5D4E] text-left flex items-start gap-3.5 active:scale-[0.99] transition"
            >
              <div className="w-11 h-11 rounded-xl bg-white border border-[#E7E5E0] text-[#C26D4A] flex items-center justify-center shrink-0">
                <Grid3X3 className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-[15px] font-semibold text-[#18181B]">
                  Live Tic-Tac-Toe
                </div>
                <p className="text-xs text-[#71717A] mt-0.5 leading-relaxed">
                  Fast turn-by-turn 3×3 duel directly against Table{' '}
                  {opponentTable}.
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-[#E7E5E0] px-4 py-3 flex items-center justify-between text-xs">
        <span className="text-[#71717A]">Playing from</span>
        <span className="font-semibold text-[#4A5D4E] font-mono-num">
          Table {yourTableNumber}
        </span>
      </div>

      <div className="space-y-3">
        {ACTIVE_TABLES.map((tbl) => (
          <button
            key={tbl.tableNumber}
            type="button"
            onClick={() => {
              setOpponentTable(tbl.tableNumber);
              setStage('pick-game');
            }}
            className="w-full bg-white rounded-2xl border border-[#E7E5E0] hover:border-[#4A5D4E]/60 p-4 text-left flex items-center justify-between gap-3 active:scale-[0.99] transition"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-[#FAF8F5] border border-[#E7E5E0] text-[#4A5D4E] flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[15px] font-semibold text-[#18181B]">
                    Table {tbl.tableNumber}
                  </span>
                  <span className="text-[11px] font-semibold text-[#4A5D4E]">
                    · Active Now
                  </span>
                </div>
                <div className="text-xs text-[#71717A] mt-0.5 truncate">
                  {tbl.guestsCount} guests · {tbl.vibe}
                </div>
              </div>
            </div>

            <span className="text-xs font-semibold text-[#C26D4A] whitespace-nowrap shrink-0">
              Challenge →
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
