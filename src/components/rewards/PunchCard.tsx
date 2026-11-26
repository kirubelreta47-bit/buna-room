import { Coffee, Gift, Lock } from 'lucide-react';
import {
  STAMPS_FOR_FREE_DRINK,
  formatPhoneDisplay,
  type LoyaltyCustomer,
} from '../../services/loyaltyStore';
import { TRANSLATIONS, type Language } from '../../i18n/translations';

interface PunchCardProps {
  customer: LoyaltyCustomer | null;
  language: Language;
  onOpenRedemption: () => void;
}

export function PunchCard({
  customer,
  language,
  onOpenRedemption,
}: PunchCardProps) {
  const t = TRANSLATIONS[language];
  const stamps = customer?.stamps ?? 0;
  const isLocked = !customer;
  const isReady = stamps >= STAMPS_FOR_FREE_DRINK;
  const remaining = Math.max(0, STAMPS_FOR_FREE_DRINK - stamps);

  return (
    <div className="bg-white rounded-3xl border border-[#E7E5E0] p-5">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-5">
        <div>
          <div className="text-xs font-medium text-[#71717A]">
            {t.rewards.cardHeader}
          </div>
          <h2 className="font-display text-xl font-semibold text-[#18181B] mt-0.5">
            {isLocked
              ? t.rewards.yourCard
              : t.rewards.namedCard(customer.firstName)}
          </h2>
          {customer && (
            <div className="text-xs text-[#71717A] font-mono-num mt-0.5">
              {formatPhoneDisplay(customer.phone)}
            </div>
          )}
        </div>

        <div className="text-right shrink-0">
          <div className="text-2xl font-bold font-mono-num text-[#4A5D4E] leading-none">
            {stamps}
            <span className="text-sm font-medium text-[#71717A]">
              /{STAMPS_FOR_FREE_DRINK}
            </span>
          </div>
          <div className="text-[11px] text-[#71717A] mt-1">
            {isLocked
              ? t.rewards.preview
              : isReady
                ? t.rewards.freeDrinkReady
                : t.rewards.moreToGo(remaining)}
          </div>
        </div>
      </div>

      {/* 7 Stamp Slots + Free Cup 8th Slot */}
      <div className="grid grid-cols-4 gap-2.5">
        {Array.from({ length: STAMPS_FOR_FREE_DRINK }).map((_, idx) => {
          const filled = idx < stamps;
          return (
            <div
              key={idx}
              className={`aspect-square rounded-2xl border flex flex-col items-center justify-center transition-all ${
                filled
                  ? 'bg-[#4A5D4E] border-[#4A5D4E] text-white animate-stamp-pop'
                  : isLocked
                    ? 'bg-[#FAF8F5] border-dashed border-[#D6D3CD] text-[#A1A1AA]'
                    : 'bg-[#FAF8F5] border-[#E7E5E0] text-[#A1A1AA]'
              }`}
            >
              {filled ? (
                <Coffee className="w-5 h-5" strokeWidth={2.2} />
              ) : (
                <span className="text-xs font-mono-num font-semibold">
                  {idx + 1}
                </span>
              )}
            </div>
          );
        })}

        {/* 8th slot: Free Drink */}
        <button
          type="button"
          disabled={!isReady}
          onClick={onOpenRedemption}
          className={`aspect-square rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all ${
            isReady
              ? 'bg-[#C26D4A] border-[#C26D4A] text-white shadow-md shadow-[#C26D4A]/25 active:scale-[0.96]'
              : 'bg-[#C26D4A]/[0.07] border-dashed border-[#C26D4A]/40 text-[#C26D4A] cursor-default'
          }`}
        >
          <Gift className="w-5 h-5" />
          <span className="text-[10px] font-semibold leading-none">
            {t.rewards.freeBadge}
          </span>
        </button>
      </div>

      {/* Footer note / CTA */}
      <div className="mt-5 pt-4 border-t border-[#E7E5E0]">
        {isLocked ? (
          <div className="flex items-center gap-2 text-xs text-[#71717A]">
            <Lock className="w-3.5 h-3.5 shrink-0" />
            <span>{t.rewards.lockedNote}</span>
          </div>
        ) : isReady ? (
          <button
            type="button"
            onClick={onOpenRedemption}
            className="w-full min-h-[46px] rounded-xl bg-[#C26D4A] hover:bg-[#A65A3B] text-white text-sm font-semibold active:scale-[0.98] transition flex items-center justify-center gap-2"
          >
            <Gift className="w-4 h-4" />
            <span>{t.rewards.claimFreeDrinkBtn}</span>
          </button>
        ) : (
          <div className="flex items-center justify-between text-xs text-[#71717A]">
            <span>{t.rewards.scanPromptNote}</span>
            {customer.freeDrinksRedeemed > 0 && (
              <span className="font-mono-num shrink-0 ml-2 text-[#4A5D4E] font-medium">
                {t.rewards.claimedCount(customer.freeDrinksRedeemed)}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
