import { useEffect, useState } from 'react';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import type { GameOutcome } from './types';

interface LiveTableTicTacToeProps {
  playerLabel: string;
  opponentLabel: string;
  onComplete: (outcome: GameOutcome) => void;
  onExit: () => void;
}

type CellValue = 'X' | 'O' | null;

const WIN_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function checkWinner(board: CellValue[]): {
  winner: 'X' | 'O' | null;
  line: number[] | null;
} {
  for (const line of WIN_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line };
    }
  }
  return { winner: null, line: null };
}

function pickOpponentMove(board: CellValue[]): number {
  const empty = board
    .map((v, i) => (v === null ? i : -1))
    .filter((i) => i !== -1);
  if (empty.length === 0) return -1;

  // 1. Win if possible ('O')
  for (const idx of empty) {
    const test = [...board];
    test[idx] = 'O';
    if (checkWinner(test).winner === 'O') return idx;
  }

  // 2. Block 'X' from winning (85% of the time so matches feel winnable & lively)
  if (Math.random() < 0.85) {
    for (const idx of empty) {
      const test = [...board];
      test[idx] = 'X';
      if (checkWinner(test).winner === 'X') return idx;
    }
  }

  // 3. Prefer center, then corners, then random
  if (board[4] === null && Math.random() < 0.7) return 4;
  const corners = [0, 2, 6, 8].filter((c) => board[c] === null);
  if (corners.length > 0 && Math.random() < 0.65) {
    return corners[Math.floor(Math.random() * corners.length)];
  }
  return empty[Math.floor(Math.random() * empty.length)];
}

export function LiveTableTicTacToe({
  playerLabel,
  opponentLabel,
  onComplete,
  onExit,
}: LiveTableTicTacToeProps) {
  const [board, setBoard] = useState<CellValue[]>(Array(9).fill(null));
  const [turn, setTurn] = useState<'X' | 'O'>('X');
  const [winningLine, setWinningLine] = useState<number[] | null>(null);
  const [locked, setLocked] = useState(false);

  const finalizeIfEnded = (next: CellValue[]): boolean => {
    const { winner, line } = checkWinner(next);
    if (winner) {
      setWinningLine(line);
      setLocked(true);
      const winnerName = winner === 'X' ? playerLabel : opponentLabel;
      window.setTimeout(() => {
        onComplete({
          winnerName,
          summaryLine: `${winnerName} (${winner}) connected 3 in a row.`,
        });
      }, 650);
      return true;
    }

    if (next.every((cell) => cell !== null)) {
      setLocked(true);
      window.setTimeout(() => {
        onComplete({
          winnerName: 'Draw',
          isDraw: true,
          summaryLine: 'All 9 squares filled with no 3-in-a-row.',
        });
      }, 650);
      return true;
    }

    return false;
  };

  // Simulated opponent plays automatically every 1 second on 'O' turn
  useEffect(() => {
    if (locked || turn !== 'O') return;

    const timer = window.setTimeout(() => {
      const move = pickOpponentMove(board);
      if (move === -1) return;
      const next = [...board];
      next[move] = 'O';
      setBoard(next);
      const ended = finalizeIfEnded(next);
      if (!ended) {
        setTurn('X');
      }
    }, 1000);

    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turn, locked, board]);

  const handleCellTap = (idx: number) => {
    if (locked || turn !== 'X' || board[idx] !== null) return;
    const next = [...board];
    next[idx] = 'X';
    setBoard(next);
    const ended = finalizeIfEnded(next);
    if (!ended) {
      setTurn('O');
    }
  };

  const handleResetBoard = () => {
    setBoard(Array(9).fill(null));
    setTurn('X');
    setWinningLine(null);
    setLocked(false);
  };

  return (
    <div className="px-4 pt-3 pb-24 space-y-5">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onExit}
          className="min-h-[40px] px-2 -ml-2 rounded-xl text-sm font-medium text-[#18181B] hover:bg-white flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quit</span>
        </button>

        <button
          type="button"
          onClick={handleResetBoard}
          className="min-h-[38px] px-3 rounded-xl bg-white border border-[#E7E5E0] text-xs font-medium text-[#18181B] flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Turn Indicator */}
      <div className="grid grid-cols-2 gap-3">
        <div
          className={`p-3.5 rounded-2xl border transition ${
            turn === 'X' && !locked
              ? 'bg-[#4A5D4E] border-[#4A5D4E] text-white'
              : 'bg-white border-[#E7E5E0] text-[#18181B]'
          }`}
        >
          <div className="text-xs opacity-80 truncate">{playerLabel}</div>
          <div className="font-display text-lg font-bold flex items-center justify-between mt-0.5">
            <span>X</span>
            {turn === 'X' && !locked && (
              <span className="text-[11px] font-sans font-medium opacity-90">
                Your turn
              </span>
            )}
          </div>
        </div>

        <div
          className={`p-3.5 rounded-2xl border transition ${
            turn === 'O' && !locked
              ? 'bg-[#C26D4A] border-[#C26D4A] text-white'
              : 'bg-white border-[#E7E5E0] text-[#18181B]'
          }`}
        >
          <div className="text-xs opacity-80 truncate">{opponentLabel}</div>
          <div className="font-display text-lg font-bold flex items-center justify-between mt-0.5">
            <span>O</span>
            {turn === 'O' && !locked && (
              <span className="text-[11px] font-sans font-medium opacity-90">
                Thinking…
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 3x3 Board */}
      <div className="bg-white rounded-3xl border border-[#E7E5E0] p-4">
        <div className="grid grid-cols-3 gap-2.5 aspect-square">
          {board.map((cell, idx) => {
            const isWinCell = winningLine?.includes(idx) ?? false;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleCellTap(idx)}
                disabled={locked || turn !== 'X' || cell !== null}
                aria-label={`Row ${Math.floor(idx / 3) + 1} Column ${(idx % 3) + 1}${cell ? `: ${cell}` : ''}`}
                className={`rounded-2xl border text-4xl font-display font-bold flex items-center justify-center transition active:scale-[0.96] ${
                  isWinCell
                    ? cell === 'X'
                      ? 'bg-[#4A5D4E] border-[#4A5D4E] text-white'
                      : 'bg-[#C26D4A] border-[#C26D4A] text-white'
                    : cell === 'X'
                      ? 'bg-[#4A5D4E]/10 border-[#4A5D4E]/30 text-[#4A5D4E]'
                      : cell === 'O'
                        ? 'bg-[#C26D4A]/10 border-[#C26D4A]/30 text-[#C26D4A]'
                        : 'bg-[#FAF8F5] border-[#E7E5E0] hover:border-[#4A5D4E]/50'
                }`}
              >
                {cell}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
