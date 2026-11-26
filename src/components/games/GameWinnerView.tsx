import { Trophy, RotateCcw, ArrowLeft, Handshake } from 'lucide-react';
import type { DealConfig, GameMetadata, GameOutcome } from './types';

interface GameWinnerViewProps {
  game: GameMetadata;
  deal: DealConfig;
  outcome: GameOutcome;
  onRematch: () => void;
  onExit: () => void;
}

export function GameWinnerView({
  game,
  deal,
  outcome,
  onRematch,
  onExit,
}: GameWinnerViewProps) {
  return (
    <div className="px-4 pt-6 pb-24">
      <div className="bg-white rounded-3xl border border-[#E7E5E0] p-6 text-center space-y-5">
        <div
          className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center ${
            outcome.isDraw
              ? 'bg-[#FAF8F5] border border-[#E7E5E0] text-[#71717A]'
              : 'bg-[#C26D4A]/12 text-[#C26D4A]'
          }`}
        >
          <Trophy className="w-7 h-7" />
        </div>

        <div>
          <div className="text-xs font-semibold text-[#71717A]">
            {game.title} · Final Result
          </div>
          <h2 className="font-display text-3xl font-bold text-[#18181B] mt-1">
            {outcome.isDraw ? 'It’s a Draw!' : `${outcome.winnerName} Wins!`}
          </h2>
          <p className="text-sm text-[#52525B] mt-1.5">{outcome.summaryLine}</p>
          {outcome.scoreDetail && (
            <div className="mt-2 text-xs font-mono-num font-semibold text-[#4A5D4E]">
              {outcome.scoreDetail}
            </div>
          )}
        </div>

        {deal.mode === 'deal' && (
          <div className="rounded-2xl bg-[#C26D4A]/10 border border-[#C26D4A]/30 p-4 text-left">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#8C4529]">
              <Handshake className="w-4 h-4 shrink-0" />
              <span>Agreed Honor-System Deal</span>
            </div>
            <div className="font-display text-lg font-semibold text-[#18181B] mt-1">
              {deal.dealText}
            </div>
            <p className="text-xs text-[#71717A] mt-1">
              {outcome.isDraw
                ? 'Draw means no one owes anything — run it back to break the tie.'
                : 'Shake on it and settle at the table or counter.'}
            </p>
          </div>
        )}

        <div className="space-y-2.5 pt-1">
          <button
            type="button"
            onClick={onRematch}
            className="w-full min-h-[50px] rounded-xl bg-[#4A5D4E] hover:bg-[#3B4B3F] text-white text-sm font-semibold flex items-center justify-center gap-2 active:scale-[0.985] transition"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Run It Back (Rematch)</span>
          </button>

          <button
            type="button"
            onClick={onExit}
            className="w-full min-h-[46px] rounded-xl bg-[#FAF8F5] border border-[#E7E5E0] text-[#18181B] text-sm font-medium flex items-center justify-center gap-1.5 hover:bg-[#F2EFEA] transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Games</span>
          </button>
        </div>
      </div>
    </div>
  );
}
