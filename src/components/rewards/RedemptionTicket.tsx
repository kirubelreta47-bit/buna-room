import { useEffect, useState } from 'react';
import { CheckCircle2, Clock, Gift, X } from 'lucide-react';

interface RedemptionTicketProps {
  open: boolean;
  variant: 'free-drink' | 'spin-win';
  firstName: string;
  title: string;
  subtitle: string;
  claimButtonLabel: string;
  requireCashierConfirm?: boolean;
  onClaim: () => Promise<void> | void;
  onClose?: () => void;
}

function formatLiveTime(date: Date): string {
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}

export function RedemptionTicket({
  open,
  variant,
  firstName,
  title,
  subtitle,
  claimButtonLabel,
  requireCashierConfirm = true,
  onClaim,
  onClose,
}: RedemptionTicketProps) {
  const [now, setNow] = useState(() => new Date());
  const [confirmArmed, setConfirmArmed] = useState(false);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    if (!open) {
      setConfirmArmed(false);
      return;
    }
    const id = window.setInterval(() => setNow(new Date()), 250);
    return () => window.clearInterval(id);
  }, [open]);

  if (!open) return null;

  const isFreeDrink = variant === 'free-drink';

  const handleTapClaim = async () => {
    if (requireCashierConfirm && !confirmArmed) {
      setConfirmArmed(true);
      return;
    }
    setClaiming(true);
    try {
      await onClaim();
      setConfirmArmed(false);
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="w-full max-w-sm rounded-3xl overflow-hidden border border-white/20 shadow-2xl">
        {/* Animated Live Anti-Screenshot Banner */}
        <div
          className={`relative p-6 text-white text-center animate-ticket-bg ${
            isFreeDrink
              ? 'bg-gradient-to-br from-[#4A5D4E] via-[#344638] to-[#5F7363]'
              : 'bg-gradient-to-br from-[#C26D4A] via-[#9E5233] to-[#D48361]'
          }`}
        >
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close ticket"
              className="absolute top-3 right-3 min-h-[38px] min-w-[38px] rounded-full bg-black/20 hover:bg-black/30 flex items-center justify-center text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <div className="w-12 h-12 rounded-2xl bg-white/15 mx-auto flex items-center justify-center mb-3">
            <Gift className="w-6 h-6 text-white" />
          </div>

          <div className="text-xs font-semibold tracking-[0.14em] uppercase text-white/85">
            {isFreeDrink ? 'FREE DRINK — SHOW CASHIER' : '800+ SPIN WINNER — SHOW CASHIER'}
          </div>

          <h2 className="font-display text-3xl font-bold mt-2 leading-tight">
            {title}
          </h2>
          <p className="text-sm text-white/85 mt-1">{subtitle}</p>

          {/* Guest First Name */}
          <div className="mt-6 pt-5 border-t border-white/20">
            <div className="text-[11px] text-white/75">Guest Name</div>
            <div className="font-display text-4xl font-bold tracking-tight mt-0.5 break-words">
              {firstName}
            </div>
          </div>

          {/* Live Ticking Anti-Screenshot Clock */}
          <div className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-black/25 border border-white/15">
            <Clock className="w-4 h-4 text-white/80" />
            <span className="font-mono-num text-xl font-semibold tracking-wider">
              {formatLiveTime(now)}
            </span>
          </div>
          <div className="text-[11px] text-white/70 mt-1.5">
            Live verification clock · Screenshots are invalid
          </div>
        </div>

        {/* Bottom Cashier Claim Action */}
        <div className="bg-white p-5 space-y-2.5">
          <button
            type="button"
            disabled={claiming}
            onClick={handleTapClaim}
            className={`w-full min-h-[50px] rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 active:scale-[0.98] transition ${
              confirmArmed
                ? 'bg-[#18181B] hover:bg-black'
                : isFreeDrink
                  ? 'bg-[#4A5D4E] hover:bg-[#3B4B3F]'
                  : 'bg-[#C26D4A] hover:bg-[#A65A3B]'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>
              {confirmArmed ? 'Tap Again to Confirm Claim' : claimButtonLabel}
            </span>
          </button>

          {confirmArmed && (
            <button
              type="button"
              onClick={() => setConfirmArmed(false)}
              className="w-full py-1.5 text-xs font-medium text-[#71717A] hover:text-[#18181B]"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
