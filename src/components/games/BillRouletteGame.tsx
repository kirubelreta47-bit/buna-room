import { useState } from 'react';
import { ArrowLeft, Plus, X, Disc3 } from 'lucide-react';
import type { GameOutcome } from './types';

interface BillRouletteGameProps {
  onComplete: (outcome: GameOutcome) => void;
  onExit: () => void;
}

const SLICE_COLORS = [
  '#4A5D4E',
  '#FAF8F5',
  '#C26D4A',
  '#18181B',
  '#6E8272',
  '#EAE5DC',
  '#D98664',
  '#3F3F46',
];

function getTextColor(bg: string): string {
  return bg === '#FAF8F5' || bg === '#EAE5DC' ? '#18181B' : '#FFFFFF';
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function describeSlice(
  cx: number,
  cy: number,
  r: number,
  startDeg: number,
  endDeg: number
): string {
  const start = polarToCartesian(cx, cy, r, endDeg);
  const end = polarToCartesian(cx, cy, r, startDeg);
  const largeArc = endDeg - startDeg <= 180 ? '0' : '1';
  return [
    `M ${cx} ${cy}`,
    `L ${start.x} ${start.y}`,
    `A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`,
    'Z',
  ].join(' ');
}

export function BillRouletteGame({
  onComplete,
  onExit,
}: BillRouletteGameProps) {
  const [names, setNames] = useState<string[]>(['Abel', 'Meron', 'Dawit']);
  const [newName, setNewName] = useState('');
  const [rotationDeg, setRotationDeg] = useState(0);
  const [spinning, setSpinning] = useState(false);

  const handleAddName = () => {
    const trimmed = newName.trim();
    if (!trimmed || names.length >= 8) return;
    setNames((prev) => [...prev, trimmed]);
    setNewName('');
  };

  const handleRemoveName = (idx: number) => {
    if (names.length <= 2) return;
    setNames((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSpin = () => {
    if (spinning || names.length < 2) return;

    const count = names.length;
    const sweep = 360 / count;
    const chosenIdx = Math.floor(Math.random() * count);
    const sliceStart = chosenIdx * sweep;
    const margin = Math.min(8, sweep * 0.18);
    const angleInsideSlice =
      sliceStart + margin + Math.random() * Math.max(1, sweep - margin * 2);

    const extraSpins = 360 * 6;
    const targetMod = (360 - angleInsideSlice) % 360;
    const currentMod = rotationDeg % 360;
    const delta = (targetMod - currentMod + 360) % 360;
    const nextRotation = rotationDeg + extraSpins + delta;

    setSpinning(true);
    setRotationDeg(nextRotation);

    const chosenName = names[chosenIdx];
    window.setTimeout(() => {
      setSpinning(false);
      onComplete({
        winnerName: chosenName,
        summaryLine: `The wheel landed on ${chosenName} to cover this round’s bill!`,
        scoreDetail: `${count} friends in the spin`,
      });
    }, 4100);
  };

  const sweep = 360 / names.length;

  return (
    <div className="px-4 pt-3 pb-24 space-y-5">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onExit}
          disabled={spinning}
          className="min-h-[40px] px-2 -ml-2 rounded-xl text-sm font-medium text-[#18181B] hover:bg-white flex items-center gap-1.5 disabled:opacity-40"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quit</span>
        </button>
        <span className="text-xs font-mono-num text-[#71717A]">
          {names.length}/8 Friends
        </span>
      </div>

      {/* Wheel Card */}
      <div className="bg-white rounded-3xl border border-[#E7E5E0] p-5 flex flex-col items-center">
        <div className="relative w-68 h-68 mb-5">
          <div
            aria-hidden="true"
            className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-20 w-0 h-0 border-l-[11px] border-l-transparent border-r-[11px] border-r-transparent border-t-[18px] border-t-[#18181B]"
          />

          <svg
            viewBox="0 0 300 300"
            className="w-full h-full drop-shadow-sm"
            style={{
              transform: `rotate(${rotationDeg}deg)`,
              transition: spinning
                ? 'transform 4s cubic-bezier(0.12, 0.85, 0.18, 1)'
                : 'none',
            }}
          >
            <circle
              cx="150"
              cy="150"
              r="146"
              fill="#FFFFFF"
              stroke="#E7E5E0"
              strokeWidth="4"
            />
            {names.map((name, idx) => {
              const startDeg = idx * sweep;
              const endDeg = startDeg + sweep;
              const midDeg = startDeg + sweep / 2;
              const bg = SLICE_COLORS[idx % SLICE_COLORS.length];
              const fg = getTextColor(bg);
              const pos = polarToCartesian(150, 150, 94, midDeg);
              const label = name.length > 10 ? `${name.slice(0, 9)}…` : name;

              return (
                <g key={`${name}-${idx}`}>
                  <path
                    d={describeSlice(150, 150, 142, startDeg, endDeg)}
                    fill={bg}
                    stroke="#E7E5E0"
                    strokeWidth="1.5"
                  />
                  <text
                    x={pos.x}
                    y={pos.y}
                    fill={fg}
                    fontSize="12"
                    fontWeight="700"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${midDeg}, ${pos.x}, ${pos.y})`}
                  >
                    {label}
                  </text>
                </g>
              );
            })}
            <circle
              cx="150"
              cy="150"
              r="22"
              fill="#FFFFFF"
              stroke="#E7E5E0"
              strokeWidth="3"
            />
            <circle cx="150" cy="150" r="7" fill="#C26D4A" />
          </svg>
        </div>

        <button
          type="button"
          disabled={spinning || names.length < 2}
          onClick={handleSpin}
          className="w-full min-h-[50px] rounded-xl bg-[#C26D4A] hover:bg-[#A65A3B] disabled:opacity-50 text-white text-sm font-semibold flex items-center justify-center gap-2 active:scale-[0.985] transition"
        >
          <Disc3 className={`w-4 h-4 ${spinning ? 'animate-spin' : ''}`} />
          <span>{spinning ? 'Spinning…' : 'Spin Who Pays'}</span>
        </button>
      </div>

      {/* Friends List Editor */}
      <div className="bg-white rounded-2xl border border-[#E7E5E0] p-4 space-y-3">
        <div className="text-xs font-semibold text-[#18181B]">
          Friends at the table (2–8)
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            maxLength={18}
            disabled={spinning || names.length >= 8}
            placeholder="Add friend’s name…"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddName();
              }
            }}
            className="flex-1 min-h-[44px] px-3 rounded-xl bg-[#FAF8F5] border border-[#E7E5E0] text-sm text-[#18181B] placeholder:text-[#A1A1AA] focus:outline-none focus:border-[#4A5D4E]"
          />
          <button
            type="button"
            disabled={spinning || !newName.trim() || names.length >= 8}
            onClick={handleAddName}
            aria-label="Add friend"
            className="min-h-[44px] min-w-[44px] rounded-xl bg-[#4A5D4E] text-white disabled:opacity-40 flex items-center justify-center"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="divide-y divide-[#E7E5E0]">
          {names.map((name, idx) => (
            <div
              key={`${name}-${idx}`}
              className="py-2 flex items-center justify-between gap-2"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className="w-3 h-3 rounded-full border border-[#E7E5E0] shrink-0"
                  style={{
                    backgroundColor: SLICE_COLORS[idx % SLICE_COLORS.length],
                  }}
                />
                <span className="text-sm font-medium text-[#18181B] truncate">
                  {name}
                </span>
              </div>

              <button
                type="button"
                disabled={spinning || names.length <= 2}
                onClick={() => handleRemoveName(idx)}
                aria-label={`Remove ${name}`}
                className="min-h-[34px] min-w-[34px] rounded-lg flex items-center justify-center text-[#71717A] hover:text-[#C26D4A] disabled:opacity-25"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
