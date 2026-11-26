import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Zap } from 'lucide-react';
import type { GameOutcome } from './types';

interface ReactionDuelGameProps {
  onComplete: (outcome: GameOutcome) => void;
  onExit: () => void;
}

type RoundPhase = 'ready' | 'waiting' | 'go' | 'round-result';

export function ReactionDuelGame({
  onComplete,
  onExit,
}: ReactionDuelGameProps) {
  const [round, setRound] = useState(1);
  const [p1Score, setP1Score] = useState(0);
  const [p2Score, setP2Score] = useState(0);
  const [phase, setPhase] = useState<RoundPhase>('ready');
  const [roundBanner, setRoundBanner] = useState<string>('Place phone flat between you');
  const [roundReactionMs, setRoundReactionMs] = useState<number | null>(null);

  const goTimeRef = useRef<number>(0);
  const waitTimerRef = useRef<number | null>(null);
  const roundResolvedRef = useRef(false);

  const clearWaitTimer = () => {
    if (waitTimerRef.current !== null) {
      window.clearTimeout(waitTimerRef.current);
      waitTimerRef.current = null;
    }
  };

  useEffect(() => {
    return () => clearWaitTimer();
  }, []);

  const startRound = () => {
    clearWaitTimer();
    roundResolvedRef.current = false;
    setRoundReactionMs(null);
    setPhase('waiting');
    setRoundBanner('Wait for the olive flash…');

    // Random delay between 2000ms and 5000ms
    const delayMs = 2000 + Math.floor(Math.random() * 3000);
    waitTimerRef.current = window.setTimeout(() => {
      goTimeRef.current = performance.now();
      setPhase('go');
      setRoundBanner('TAP NOW!');
    }, delayMs);
  };

  const finishRound = (winner: 1 | 2, reason: string, ms: number | null) => {
    if (roundResolvedRef.current) return;
    roundResolvedRef.current = true;
    clearWaitTimer();

    const nextP1 = winner === 1 ? p1Score + 1 : p1Score;
    const nextP2 = winner === 2 ? p2Score + 1 : p2Score;
    setP1Score(nextP1);
    setP2Score(nextP2);
    setRoundReactionMs(ms);
    setPhase('round-result');
    setRoundBanner(reason);

    // Best of 3: first to 2 points wins
    if (nextP1 >= 2 || nextP2 >= 2) {
      const matchWinner = nextP1 >= 2 ? 'Player 1' : 'Player 2';
      window.setTimeout(() => {
        onComplete({
          winnerName: matchWinner,
          summaryLine: `${matchWinner} won the Best-of-3 Reaction Duel.`,
          scoreDetail: `Player 1 (${nextP1}) — Player 2 (${nextP2})`,
        });
      }, 1100);
    }
  };

  const handleTap = (player: 1 | 2) => {
    if (phase === 'waiting') {
      const other: 1 | 2 = player === 1 ? 2 : 1;
      finishRound(
        other,
        `Player ${player} tapped early! Point to Player ${other}.`,
        null
      );
      return;
    }

    if (phase === 'go') {
      const elapsed = Math.round(performance.now() - goTimeRef.current);
      finishRound(
        player,
        `Player ${player} was fastest (${elapsed} ms)!`,
        elapsed
      );
    }
  };

  const isGo = phase === 'go';

  return (
    <div className="px-4 pt-3 pb-24 flex flex-col gap-3">
      {/* Compact Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => {
            clearWaitTimer();
            onExit();
          }}
          className="min-h-[40px] px-2 -ml-2 rounded-xl text-sm font-medium text-[#18181B] hover:bg-white flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quit</span>
        </button>
        <div className="text-xs font-semibold font-mono-num text-[#71717A]">
          Round {round} · Best of 3
        </div>
      </div>

      {/* Split-Screen Arena */}
      <div className="rounded-3xl overflow-hidden border border-[#E7E5E0] bg-white flex flex-col h-[520px] select-none">
        {/* PLAYER 2 ZONE (Top, rotated 180deg) */}
        <button
          type="button"
          onPointerDown={() => handleTap(2)}
          disabled={phase === 'ready' || phase === 'round-result'}
          className={`flex-1 flex flex-col items-center justify-center p-6 rotate-180 transition-colors active:opacity-90 ${
            isGo
              ? 'bg-[#4A5D4E] text-white'
              : phase === 'waiting'
                ? 'bg-[#FAF8F5] text-[#18181B]'
                : 'bg-white text-[#18181B]'
          }`}
        >
          <div className="text-xs font-semibold text-current/70">Player 2</div>
          <div className="font-display text-3xl font-bold font-mono-num mt-1">
            {p2Score}
          </div>
          <div className="mt-2 text-sm font-semibold">
            {isGo
              ? 'TAP NOW!'
              : phase === 'waiting'
                ? 'Hold steady…'
                : 'Ready'}
          </div>
        </button>

        {/* Center Control Strip */}
        <div className="px-4 py-3 bg-[#18181B] text-white flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-xs font-medium text-white/90 truncate">
              {roundBanner}
            </div>
            {roundReactionMs !== null && (
              <div className="text-[11px] text-[#E59A78] font-mono-num">
                Reaction: {roundReactionMs} ms
              </div>
            )}
          </div>

          {phase === 'ready' && (
            <button
              type="button"
              onClick={startRound}
              className="min-h-[38px] px-3.5 rounded-xl bg-[#4A5D4E] hover:bg-[#5A705E] text-white text-xs font-semibold flex items-center gap-1.5 shrink-0"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Start Round 1</span>
            </button>
          )}

          {phase === 'round-result' && p1Score < 2 && p2Score < 2 && (
            <button
              type="button"
              onClick={() => {
                setRound((r) => r + 1);
                startRound();
              }}
              className="min-h-[38px] px-3.5 rounded-xl bg-[#C26D4A] hover:bg-[#A65A3B] text-white text-xs font-semibold shrink-0"
            >
              Next Round
            </button>
          )}
        </div>

        {/* PLAYER 1 ZONE (Bottom, normal orientation) */}
        <button
          type="button"
          onPointerDown={() => handleTap(1)}
          disabled={phase === 'ready' || phase === 'round-result'}
          className={`flex-1 flex flex-col items-center justify-center p-6 transition-colors active:opacity-90 ${
            isGo
              ? 'bg-[#4A5D4E] text-white'
              : phase === 'waiting'
                ? 'bg-[#FAF8F5] text-[#18181B]'
                : 'bg-white text-[#18181B]'
          }`}
        >
          <div className="text-xs font-semibold text-current/70">Player 1</div>
          <div className="font-display text-3xl font-bold font-mono-num mt-1">
            {p1Score}
          </div>
          <div className="mt-2 text-sm font-semibold">
            {isGo
              ? 'TAP NOW!'
              : phase === 'waiting'
                ? 'Hold steady…'
                : 'Ready'}
          </div>
        </button>
      </div>
    </div>
  );
}
