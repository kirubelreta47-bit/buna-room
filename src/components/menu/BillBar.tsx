import { ChevronUp, Sparkles } from 'lucide-react';
import { SPIN_UNLOCK_THRESHOLD_ETB } from '../../data/menu';
import { TRANSLATIONS, type Language } from '../../i18n/translations';

interface BillBarProps {
  itemCount: number;
  totalEtb: number;
  language: Language;
  onOpenSplitter: () => void;
}

export function BillBar({
  itemCount,
  totalEtb,
  language,
  onOpenSplitter,
}: BillBarProps) {
  if (itemCount === 0) return null;

  const t = TRANSLATIONS[language];
  const spinUnlocked = totalEtb >= SPIN_UNLOCK_THRESHOLD_ETB;
  const remaining = Math.max(0, SPIN_UNLOCK_THRESHOLD_ETB - totalEtb);

  return (
    <div className="fixed bottom-[64px] left-1/2 -translate-x-1/2 w-full max-w-md px-4 pb-2 z-30 pointer-events-none">
      <button
        type="button"
        onClick={onOpenSplitter}
        className="pointer-events-auto w-full min-h-[54px] px-4 py-2.5 rounded-2xl bg-[#18181B] text-white shadow-lg shadow-black/15 flex items-center justify-between gap-3 active:scale-[0.985] transition-transform"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="w-7 h-7 rounded-lg bg-white/14 text-xs font-semibold flex items-center justify-center font-mono-num shrink-0">
            {itemCount}
          </span>
          <div className="text-left min-w-0">
            <div className="text-sm font-semibold leading-tight flex items-center gap-1.5">
              <span>{t.menu.splitBillAndPay}</span>
              {spinUnlocked && (
                <Sparkles className="w-3.5 h-3.5 text-[#E59A78] shrink-0" />
              )}
            </div>
            <div className="text-[11px] text-white/70 truncate mt-0.5">
              {spinUnlocked
                ? t.menu.spinUnlockedShort
                : t.menu.etbAwayFromSpin(remaining)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[15px] font-semibold font-mono-num">
            {totalEtb} {language === 'am' ? 'ብር' : 'ETB'}
          </span>
          <ChevronUp className="w-4 h-4 text-white/70" />
        </div>
      </button>
    </div>
  );
}
