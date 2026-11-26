import { useState } from 'react';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import type { GameOutcome } from './types';

interface Connect4GameProps {
  onComplete: (outcome: GameOutcome) => void;
  onExit: () => void;
}

const ROWS = 6;
const COLS = 7;

type Token = 1 | 2 | null;
type Coord = [number, number];

function createEmptyGrid(): Token[][] {
  return Array.from({ length: ROWS }, () => Array<Token>(COLS).fill(null));
}

function findFourInRow(grid: Token[][]): {
  winner: 1 | 2 | null;
  coords: Coord[];
} {
  const dirs: [number, number][] = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1],
  ];

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const player = grid[r][c];
      if (!player) continue;

      for (const [dr, dc] of dirs) {
        const line: Coord[] = [[r, c]];
        for (let step = 1; step < 4; step++) {
          const nr = r + dr * step;
          const nc = c + dc * step;
          if (
            nr < 0 ||
            nr >= ROWS ||
            nc < 0 ||
            nc >= COLS ||
            grid[nr][nc] !== player
          ) {
            break;
          }
          line.push([nr, nc]);
        }
        if (line.length === 4) {
          return { winner: player, coords: line };
        }
      }
    }
  }
  return { winner: null, coords: [] };
}

export function Connect4Game({ onComplete, onExit }: Connect4GameProps) {
  const [grid, setGrid] = useState<Token[][]>(createEmptyGrid);
  const [turn, setTurn] = useState<1 | 2>(1);
  const [lastDrop, setLastDrop] = useState<{ r: number; c: number } | null>(null);
  const [winCoords, setWinCoords] = useState<Coord[]>([]);
  const [locked, setLocked] = useState(false);

  const dropInColumn = (col: number) => {
    if (locked) return;

    let targetRow = -1;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (grid[r][col] === null) {
        targetRow = r;
        break;
      }
    }
    if (targetRow === -1) return;

    const next = grid.map((row) => [...row]);
    next[targetRow][col] = turn;
    setGrid(next);
    setLastDrop({ r: targetRow, c: col });

    const { winner, coords } = findFourInRow(next);
    if (winner) {
      setWinCoords(coords);
      setLocked(true);
      const winnerName = winner === 1 ? 'Player 1' : 'Player 2';
      window.setTimeout(() => {
        onComplete({
          winnerName,
          summaryLine: `${winnerName} connected four discs in a row.`,
        });
      }, 750);
      return;
    }

    const boardFull = next[0].every((cell) => cell !== null);
    if (boardFull) {
      setLocked(true);
      window.setTimeout(() => {
        onComplete({
          winnerName: 'Draw',
          isDraw: true,
          summaryLine: 'Board is completely full with no four-in-a-row.',
        });
      }, 650);
      return;
    }

    setTurn(turn === 1 ? 2 : 1);
  };

  const resetBoard = () => {
    setGrid(createEmptyGrid());
    setTurn(1);
    setLastDrop(null);
    setWinCoords([]);
    setLocked(false);
  };

  const isWinCell = (r: number, c: number) =>
    winCoords.some(([wr, wc]) => wr === r && wc === c);

  return (
    <div className="px-4 pt-3 pb-24 space-y-4">
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
          onClick={resetBoard}
          className="min-h-[38px] px-3 rounded-xl bg-white border border-[#E7E5E0] text-xs font-medium text-[#18181B] flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Turn Indicator */}
      <div className="grid grid-cols-2 gap-3">
        <div
          className={`p-3 rounded-2xl border flex items-center gap-2.5 transition ${
            turn === 1 && !locked
              ? 'bg-[#4A5D4E] border-[#4A5D4E] text-white'
              : 'bg-white border-[#E7E5E0] text-[#18181B]'
          }`}
        >
          <span className="w-4 h-4 rounded-full bg-current/25 border border-current shrink-0" />
          <div className="text-sm font-semibold">Player 1</div>
        </div>

        <div
          className={`p-3 rounded-2xl border flex items-center gap-2.5 transition ${
            turn === 2 && !locked
              ? 'bg-[#C26D4A] border-[#C26D4A] text-white'
              : 'bg-white border-[#E7E5E0] text-[#18181B]'
          }`}
        >
          <span className="w-4 h-4 rounded-full bg-current/25 border border-current shrink-0" />
          <div className="text-sm font-semibold">Player 2</div>
        </div>
      </div>

      {/* 7x6 Connect 4 Board */}
      <div className="bg-[#18181B] rounded-3xl p-3 border border-[#E7E5E0] shadow-sm">
        <div className="grid grid-cols-7 gap-1.5">
          {Array.from({ length: COLS }).map((_, colIdx) => {
            const colFull = grid[0][colIdx] !== null;
            return (
              <button
                key={colIdx}
                type="button"
                disabled={locked || colFull}
                onClick={() => dropInColumn(colIdx)}
                aria-label={`Drop token in column ${colIdx + 1}`}
                className="flex flex-col gap-1.5 p-0.5 rounded-xl hover:bg-white/[0.06] active:scale-[0.98] transition disabled:cursor-default"
              >
                {Array.from({ length: ROWS }).map((__, rowIdx) => {
                  const val = grid[rowIdx][colIdx];
                  const isNewest =
                    lastDrop?.r === rowIdx && lastDrop?.c === colIdx;
                  const isWinner = isWinCell(rowIdx, colIdx);
                  return (
                    <div
                      key={rowIdx}
                      className="aspect-square w-full rounded-full bg-[#FAF8F5] flex items-center justify-center p-0.5 overflow-hidden"
                    >
                      {val !== null && (
                        <div
                          style={
                            isNewest
                              ? {
                                  animation:
                                    'connect4-drop 260ms cubic-bezier(0.22, 1, 0.36, 1)',
                                }
                              : undefined
                          }
                          className={`w-full h-full rounded-full transition-transform ${
                            val === 1 ? 'bg-[#4A5D4E]' : 'bg-[#C26D4A]'
                          } ${isWinner ? 'ring-2 ring-white scale-95' : ''}`}
                        />
                      )}
                    </div>
                  );
                })}
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-center text-xs text-[#71717A]">
        Tap any column to drop your disc.
      </p>

      <style>{`
        @keyframes connect4-drop {
          0% { transform: translateY(-220%); opacity: 0.7; }
          100% { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
