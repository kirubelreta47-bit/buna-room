import { useState } from 'react';
import { X, Disc3 } from 'lucide-react';
import { RedemptionTicket } from './RedemptionTicket';
import { TRANSLATIONS, type Language } from '../../i18n/translations';

export interface SpinPrize {
  id: 'tea-water' | 'bonus-stamps' | 'pastry' | 'macchiato-juice';
  label: string;
  shortLabel: string;
  subtitle: string;
  weight: number; // sums to 100
  color: string;
  textColor: string;
  bonusStamps?: number;
}

export const SPIN_PRIZES: SpinPrize[] = [
  {
    id: 'tea-water',
    label: 'Free Tea or Water',
    shortLabel: 'Free Tea / Water',
    subtitle: 'One complimentary spiced tea or bottled water',
    weight: 45,
    color: '#4A5D4E',
    textColor: '#FFFFFF',
  },
  {
    id: 'bonus-stamps',
    label: '+2 Bonus Stamps',
    shortLabel: '+2 Stamps',
    subtitle: 'Added straight to your loyalty punch card',
    weight: 30,
    color: '#FAF8F5',
    textColor: '#18181B',
    bonusStamps: 2,
  },
  {
    id: 'pastry',
    label: 'Free Pastry',
    shortLabel: 'Free Pastry',
    subtitle: 'One fresh counter pastry on the house',
    weight: 15,
    color: '#C26D4A',
    textColor: '#FFFFFF',
  },
  {
    id: 'macchiato-juice',
    label: 'Free Macchiato or Juice',
    shortLabel: 'Macchiato / Juice',
    subtitle: 'One complimentary macchiato or fresh juice',
    weight: 10,
    color: '#18181B',
    textColor: '#FFFFFF',
  },
];

interface SpinWheelModalProps {
  open: boolean;
  firstName?: string | null;
  language: Language;
  onComplete: (prize: SpinPrize) => Promise<void> | void;
  onClose: () => void;
}

interface WheelSegment {
  prize: SpinPrize;
  startDeg: number;
  endDeg: number;
  midDeg: number;
}

const SEGMENTS: WheelSegment[] = (() => {
  let cursor = 0;
  return SPIN_PRIZES.map((prize) => {
    const sweep = (prize.weight / 100) * 360;
    const seg: WheelSegment = {
      prize,
      startDeg: cursor,
      endDeg: cursor + sweep,
      midDeg: cursor + sweep / 2,
    };
    cursor += sweep;
    return seg;
  });
})();

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function describeArcSlice(
  cx: number,
  cy: number,
  r: number,
  startDeg: number,
  endDeg: number
): string {
  const start = polarToCartesian(cx, cy, r, endDeg);
  const end = polarToCartesian(cx, cy, r, startDeg);
  const largeArcFlag = endDeg - startDeg <= 180 ? '0' : '1';
  return [
    `M ${cx} ${cy}`,
    `L ${start.x} ${start.y}`,
    `A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,
    'Z',
  ].join(' ');
}

function pickWeightedSegment(): WheelSegment {
  const roll = Math.random() * 100;
  let acc = 0;
  for (const seg of SEGMENTS) {
    acc += seg.prize.weight;
    if (roll <= acc) return seg;
  }
  return SEGMENTS[0];
}

export function SpinWheelModal({
  open,
  firstName,
  language,
  onComplete,
  onClose,
}: SpinWheelModalProps) {
  const [rotationDeg, setRotationDeg] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [wonPrize, setWonPrize] = useState<SpinPrize | null>(null);

  if (!open) return null;

  const t = TRANSLATIONS[language];
  const displayGuestName =
    firstName?.trim() || (language === 'am' ? 'የጠረጴዛ እንግዳ' : 'Table Guest');

  const getTranslatedPrize = (prize: SpinPrize) => {
    switch (prize.id) {
      case 'tea-water':
        return { title: t.rewards.prizes.teaWater, sub: t.rewards.prizes.teaWaterSub };
      case 'bonus-stamps':
        return { title: t.rewards.prizes.bonusStamps, sub: t.rewards.prizes.bonusStampsSub };
      case 'pastry':
        return { title: t.rewards.prizes.pastry, sub: t.rewards.prizes.pastrySub };
      case 'macchiato-juice':
        return {
          title: t.rewards.prizes.macchiatoJuice,
          sub: t.rewards.prizes.macchiatoJuiceSub,
        };
    }
  };

  const handleSpin = () => {
    if (spinning || wonPrize) return;
    const chosen = pickWeightedSegment();
    const span = chosen.endDeg - chosen.startDeg;
    const safeMargin = Math.min(8, span * 0.2);
    const offsetInside =
      chosen.startDeg + safeMargin + Math.random() * Math.max(1, span - safeMargin * 2);

    const extraSpins = 360 * 6;
    const targetMod = (360 - offsetInside) % 360;
    const currentMod = rotationDeg % 360;
    const delta = (targetMod - currentMod + 360) % 360;
    const nextRotation = rotationDeg + extraSpins + delta;

    setSpinning(true);
    setRotationDeg(nextRotation);

    window.setTimeout(() => {
      setSpinning(false);
      setWonPrize(chosen.prize);
    }, 4300);
  };

  if (wonPrize) {
    const isBonusStamps = Boolean(wonPrize.bonusStamps);
    const translated = getTranslatedPrize(wonPrize);
    const claimLabel = isBonusStamps
      ? firstName
        ? language === 'am'
          ? '+2 ማህተም ወደ ካርዴ ጨምር'
          : 'Add +2 Stamps to My Card'
        : t.rewards.saveStampsToCard
      : t.rewards.cashierTapClaim;

    return (
      <RedemptionTicket
        open
        variant="spin-win"
        firstName={displayGuestName}
        title={translated.title}
        subtitle={translated.sub}
        claimButtonLabel={claimLabel}
        requireCashierConfirm={!isBonusStamps}
        onClaim={async () => {
          await onComplete(wonPrize);
          setWonPrize(null);
          setRotationDeg(0);
        }}
      />
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={t.rewards.spinCardTitle}
    >
      <div className="w-full max-w-md bg-[#FAF8F5] rounded-t-3xl sm:rounded-3xl border border-[#E7E5E0] overflow-hidden">
        <div className="px-5 py-4 bg-white border-b border-[#E7E5E0] flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-semibold text-[#18181B]">
              {t.rewards.spinCardTitle}
            </h2>
            <p className="text-xs text-[#71717A] mt-0.5">
              {t.rewards.spinRuleSimple}
            </p>
          </div>
          {!spinning && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close spin wheel"
              className="min-h-[40px] min-w-[40px] rounded-xl flex items-center justify-center text-[#71717A] hover:text-[#18181B]"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="p-6 flex flex-col items-center">
          {/* Wheel + Pointer */}
          <div className="relative w-72 h-72 mb-6">
            <div
              aria-hidden="true"
              className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-20 w-0 h-0 border-l-[11px] border-l-transparent border-r-[11px] border-r-transparent border-t-[18px] border-t-[#18181B] drop-shadow"
            />

            <svg
              viewBox="0 0 300 300"
              className="w-full h-full drop-shadow-md"
              style={{
                transform: `rotate(${rotationDeg}deg)`,
                transition: spinning
                  ? 'transform 4.2s cubic-bezier(0.12, 0.85, 0.18, 1)'
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
              {SEGMENTS.map((seg) => {
                const labelPos = polarToCartesian(150, 150, 94, seg.midDeg);
                return (
                  <g key={seg.prize.id}>
                    <path
                      d={describeArcSlice(150, 150, 142, seg.startDeg, seg.endDeg)}
                      fill={seg.prize.color}
                      stroke="#E7E5E0"
                      strokeWidth="1.5"
                    />
                    <text
                      x={labelPos.x}
                      y={labelPos.y}
                      fill={seg.prize.textColor}
                      fontSize="11"
                      fontWeight="700"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      transform={`rotate(${seg.midDeg}, ${labelPos.x}, ${labelPos.y})`}
                    >
                      {seg.prize.shortLabel}
                    </text>
                  </g>
                );
              })}
              <circle
                cx="150"
                cy="150"
                r="24"
                fill="#FFFFFF"
                stroke="#E7E5E0"
                strokeWidth="3"
              />
              <circle cx="150" cy="150" r="8" fill="#4A5D4E" />
            </svg>
          </div>

          {/* Prize Odds Legend */}
          <div className="w-full grid grid-cols-2 gap-2 mb-5 text-xs">
            {SPIN_PRIZES.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-white border border-[#E7E5E0]"
              >
                <span className="truncate font-medium text-[#18181B]">
                  {p.shortLabel}
                </span>
                <span className="font-mono-num text-[#71717A] shrink-0">
                  {p.weight}%
                </span>
              </div>
            ))}
          </div>

          <button
            type="button"
            disabled={spinning}
            onClick={handleSpin}
            className="w-full min-h-[50px] rounded-xl bg-[#C26D4A] hover:bg-[#A65A3B] disabled:opacity-60 text-white text-sm font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition"
          >
            <Disc3 className={`w-4 h-4 ${spinning ? 'animate-spin' : ''}`} />
            <span>
              {spinning
                ? language === 'am'
                  ? 'እየተሽከረከረ ነው…'
                  : 'Spinning…'
                : t.rewards.spinNowBtn}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
