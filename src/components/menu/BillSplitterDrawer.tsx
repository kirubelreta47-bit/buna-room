import { useState } from 'react';
import {
  X,
  Minus,
  Plus,
  Users,
  Copy,
  Check,
  Trash2,
  Gift,
  Disc3,
} from 'lucide-react';
import {
  MENU_ITEMS,
  PAYMENT_ACCOUNTS,
  SPIN_UNLOCK_THRESHOLD_ETB,
} from '../../data/menu';
import { TRANSLATIONS, type Language } from '../../i18n/translations';

interface BillSplitterDrawerProps {
  open: boolean;
  onClose: () => void;
  quantities: Record<string, number>;
  onIncrement: (itemId: string) => void;
  onDecrement: (itemId: string) => void;
  onClearBill: () => void;
  onOpenSpinFromBill: () => void;
  language: Language;
  onNotify: (message: string) => void;
}

function formatEtbShare(amount: number): string {
  if (Number.isInteger(amount)) return `${amount}`;
  return amount.toFixed(2);
}

async function copyTextSafe(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fallback below
  }
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

export function BillSplitterDrawer({
  open,
  onClose,
  quantities,
  onIncrement,
  onDecrement,
  onClearBill,
  onOpenSpinFromBill,
  language,
  onNotify,
}: BillSplitterDrawerProps) {
  const [splitCount, setSplitCount] = useState(1);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!open) return null;

  const t = TRANSLATIONS[language];
  const currency = language === 'am' ? 'ብር' : 'ETB';
  const selectedItems = MENU_ITEMS.filter((item) => (quantities[item.id] ?? 0) > 0);
  const totalEtb = selectedItems.reduce(
    (sum, item) => sum + item.priceEtb * (quantities[item.id] ?? 0),
    0
  );
  const perPersonEtb = totalEtb / splitCount;
  const remainingForSpin = Math.max(0, SPIN_UNLOCK_THRESHOLD_ETB - totalEtb);
  const progressPct = Math.min(100, (totalEtb / SPIN_UNLOCK_THRESHOLD_ETB) * 100);
  const spinUnlocked = totalEtb >= SPIN_UNLOCK_THRESHOLD_ETB;

  const handleCopyAccount = async (id: string, provider: string, accountNumber: string) => {
    const ok = await copyTextSafe(accountNumber);
    if (ok) {
      setCopiedId(id);
      onNotify(`${t.menu.copied} ${provider} ${accountNumber}`);
      setTimeout(() => {
        setCopiedId((prev) => (prev === id ? null : prev));
      }, 2000);
    } else {
      onNotify(`${accountNumber}`);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-label={t.menu.billTitle}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md max-h-[88vh] bg-[#FAF8F5] rounded-t-3xl border-t border-[#E7E5E0] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag Handle & Header */}
        <div className="pt-2.5 pb-3 px-5 bg-white border-b border-[#E7E5E0]">
          <div className="w-10 h-1 rounded-full bg-[#D6D3CD] mx-auto mb-3" />
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-semibold text-[#18181B]">
                {t.menu.billTitle}
              </h2>
              <p className="text-xs text-[#71717A]">{t.menu.billSubtitle}</p>
            </div>
            <div className="flex items-center gap-1">
              {selectedItems.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    onClearBill();
                    onClose();
                  }}
                  aria-label="Clear bill"
                  className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-[#71717A] hover:text-[#C26D4A] hover:bg-[#FAF8F5] transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                aria-label="Close bill splitter"
                className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-[#71717A] hover:text-[#18181B] hover:bg-[#FAF8F5] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* 800+ ETB Spin Progress */}
          <div
            className={`rounded-2xl p-4 border ${
              spinUnlocked
                ? 'bg-[#C26D4A]/10 border-[#C26D4A]/35'
                : 'bg-white border-[#E7E5E0]'
            }`}
          >
            <div className="flex items-start justify-between gap-3 mb-2.5">
              <div className="flex items-start gap-2.5">
                <Gift
                  className={`w-4 h-4 mt-0.5 shrink-0 ${
                    spinUnlocked ? 'text-[#C26D4A]' : 'text-[#4A5D4E]'
                  }`}
                />
                <p
                  className={`text-[13px] leading-snug font-medium ${
                    spinUnlocked ? 'text-[#8C4529]' : 'text-[#18181B]'
                  }`}
                >
                  {spinUnlocked
                    ? t.menu.spinUnlockedBanner
                    : t.menu.spinProgressBanner(remainingForSpin)}
                </p>
              </div>
              <span className="text-xs font-semibold font-mono-num text-[#71717A] shrink-0">
                {totalEtb}/{SPIN_UNLOCK_THRESHOLD_ETB}
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-[#E7E5E0] overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  spinUnlocked ? 'bg-[#C26D4A]' : 'bg-[#4A5D4E]'
                }`}
                style={{ width: `${progressPct}%` }}
              />
            </div>

            {spinUnlocked && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenSpinFromBill();
                }}
                className="mt-3 w-full min-h-[42px] rounded-xl bg-[#C26D4A] hover:bg-[#A65A3B] text-white text-xs font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition"
              >
                <Disc3 className="w-4 h-4" />
                <span>{t.menu.openSpinNow}</span>
              </button>
            )}
          </div>

          {/* Itemized Summary */}
          <div className="bg-white rounded-2xl border border-[#E7E5E0] px-4 py-1">
            {selectedItems.length === 0 ? (
              <div className="py-8 text-center text-sm text-[#71717A]">
                {t.menu.emptyBill}
              </div>
            ) : (
              selectedItems.map((item) => {
                const qty = quantities[item.id] ?? 0;
                const subtotal = item.priceEtb * qty;
                return (
                  <div
                    key={item.id}
                    className="py-3 flex items-center justify-between gap-3 border-b border-[#E7E5E0] last:border-b-0"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-[#18181B] truncate">
                        {item.name}
                      </div>
                      <div className="text-xs text-[#71717A] font-mono-num">
                        {item.priceEtb} {t.menu.each}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="flex items-center gap-1 border border-[#E7E5E0] rounded-lg p-0.5">
                        <button
                          type="button"
                          onClick={() => onDecrement(item.id)}
                          aria-label={`Decrease ${item.name}`}
                          className="w-7 h-7 rounded-md flex items-center justify-center text-[#18181B] hover:bg-[#FAF8F5]"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-5 text-center text-xs font-semibold font-mono-num">
                          {qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => onIncrement(item.id)}
                          aria-label={`Increase ${item.name}`}
                          className="w-7 h-7 rounded-md flex items-center justify-center text-[#18181B] hover:bg-[#FAF8F5]"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="w-16 text-right text-sm font-semibold font-mono-num text-[#18181B]">
                        {subtotal} {currency}
                      </span>
                    </div>
                  </div>
                );
              })
            )}

            {selectedItems.length > 0 && (
              <div className="py-3.5 border-t border-[#E7E5E0] flex items-center justify-between">
                <span className="text-sm font-semibold text-[#18181B]">
                  {t.menu.total}
                </span>
                <span className="text-base font-bold font-mono-num text-[#18181B]">
                  {totalEtb} {currency}
                </span>
              </div>
            )}
          </div>

          {/* Split Between Stepper */}
          <div className="bg-white rounded-2xl border border-[#E7E5E0] p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4 text-[#4A5D4E]" />
                <div>
                  <div className="text-sm font-semibold text-[#18181B]">
                    {t.menu.splitBetween}
                  </div>
                  <div className="text-xs text-[#71717A]">
                    {t.menu.splitRange}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setSplitCount((c) => Math.max(1, c - 1))}
                  disabled={splitCount <= 1}
                  aria-label="Decrease split count"
                  className="min-h-[40px] min-w-[40px] rounded-xl border border-[#E7E5E0] flex items-center justify-center text-[#18181B] disabled:opacity-35 active:scale-[0.95] transition"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center text-base font-semibold font-mono-num">
                  {splitCount}
                </span>
                <button
                  type="button"
                  onClick={() => setSplitCount((c) => Math.min(10, c + 1))}
                  disabled={splitCount >= 10}
                  aria-label="Increase split count"
                  className="min-h-[40px] min-w-[40px] rounded-xl border border-[#E7E5E0] flex items-center justify-center text-[#18181B] disabled:opacity-35 active:scale-[0.95] transition"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="mt-4 pt-3.5 border-t border-[#E7E5E0] flex items-baseline justify-between">
              <span className="text-xs font-medium text-[#71717A]">
                {splitCount === 1
                  ? t.menu.fullBill
                  : t.menu.exactShare(splitCount)}
              </span>
              <span className="text-xl font-bold font-mono-num text-[#4A5D4E]">
                {formatEtbShare(perPersonEtb)} {currency}
              </span>
            </div>
          </div>

          {/* Pay Info Section */}
          <div>
            <div className="mb-2">
              <h3 className="font-display text-base font-semibold text-[#18181B]">
                {t.menu.payInfoTitle}
              </h3>
              <p className="text-xs text-[#71717A]">
                {t.menu.payInfoSubtitle}
              </p>
            </div>

            <div className="space-y-2.5">
              {PAYMENT_ACCOUNTS.map((acct) => {
                const isCopied = copiedId === acct.id;
                return (
                  <div
                    key={acct.id}
                    className="bg-white rounded-2xl border border-[#E7E5E0] p-3.5 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-[#71717A]">
                        {acct.provider} · {acct.accountName}
                      </div>
                      <div className="text-[15px] font-semibold font-mono-num text-[#18181B] mt-0.5 tracking-wide">
                        {acct.accountNumber}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handleCopyAccount(
                          acct.id,
                          acct.provider,
                          acct.accountNumber
                        )
                      }
                      className={`min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap shrink-0 active:scale-[0.96] transition ${
                        isCopied
                          ? 'bg-[#4A5D4E] text-white'
                          : 'bg-[#FAF8F5] border border-[#E7E5E0] text-[#18181B] hover:border-[#4A5D4E]'
                      }`}
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>{t.menu.copied}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>{t.menu.copy}</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
