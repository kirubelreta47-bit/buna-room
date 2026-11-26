import { useEffect, useState } from 'react';
import { Disc3, QrCode, CheckCircle2, ArrowRight } from 'lucide-react';
import {
  loyaltyStore,
  STAMPS_FOR_FREE_DRINK,
  type LoyaltyCustomer,
} from '../../services/loyaltyStore';
import { SPIN_UNLOCK_THRESHOLD_ETB } from '../../data/menu';
import { TRANSLATIONS, type Language } from '../../i18n/translations';
import type { QrTokenType } from '../../utils/qrToken';
import { PunchCard } from './PunchCard';
import { PhoneAuthSheet } from './PhoneAuthSheet';
import { QrScannerModal } from './QrScannerModal';
import { SpinWheelModal, type SpinPrize } from './SpinWheelModal';
import { RedemptionTicket } from './RedemptionTicket';

interface RewardsViewProps {
  customer: LoyaltyCustomer | null;
  onCustomerChange: (customer: LoyaltyCustomer | null) => void;
  billTotalEtb: number;
  autoOpenSpinSignal: number;
  onConsumedAutoSpin: () => void;
  onSpinUsedForBill: () => void;
  onGoToMenu: () => void;
  language: Language;
  onNotify: (message: string) => void;
}

export function RewardsView({
  customer,
  onCustomerChange,
  billTotalEtb,
  autoOpenSpinSignal,
  onConsumedAutoSpin,
  onSpinUsedForBill,
  onGoToMenu,
  language,
  onNotify,
}: RewardsViewProps) {
  const t = TRANSLATIONS[language];
  const [pendingAction, setPendingAction] = useState<
    | { type: 'scan-stamp' }
    | { type: 'save-bonus-stamps'; amount: number }
    | null
  >(null);
  const [authSheetOpen, setAuthSheetOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [spinWheelOpen, setSpinWheelOpen] = useState(false);
  const [redemptionOpen, setRedemptionOpen] = useState(false);

  const unlockedByBill = billTotalEtb >= SPIN_UNLOCK_THRESHOLD_ETB;
  const remainingForSpin = Math.max(0, SPIN_UNLOCK_THRESHOLD_ETB - billTotalEtb);
  const spinProgressPct = Math.min(
    100,
    (billTotalEtb / SPIN_UNLOCK_THRESHOLD_ETB) * 100
  );

  // Automatically open Spin Wheel when customer spends 800+ ETB
  useEffect(() => {
    if (autoOpenSpinSignal > 0 && unlockedByBill) {
      setSpinWheelOpen(true);
      onConsumedAutoSpin();
    }
  }, [autoOpenSpinSignal, unlockedByBill, onConsumedAutoSpin]);

  const handleRequestStampScan = () => {
    if (!customer) {
      setPendingAction({ type: 'scan-stamp' });
      setAuthSheetOpen(true);
      return;
    }
    if (customer.stamps >= STAMPS_FOR_FREE_DRINK) {
      setRedemptionOpen(true);
      return;
    }
    setScannerOpen(true);
  };

  const handleAuthenticated = async (loggedIn: LoyaltyCustomer) => {
    onCustomerChange(loggedIn);
    setAuthSheetOpen(false);
    onNotify(
      language === 'am'
        ? `እንኳን ደህና መጡ፣ ${loggedIn.firstName}`
        : `Welcome back, ${loggedIn.firstName}`
    );

    const action = pendingAction;
    setPendingAction(null);
    if (!action) return;

    if (action.type === 'scan-stamp') {
      if (loggedIn.stamps >= STAMPS_FOR_FREE_DRINK) {
        setRedemptionOpen(true);
      } else {
        setScannerOpen(true);
      }
    } else if (action.type === 'save-bonus-stamps') {
      const updated = await loyaltyStore.addStamps(loggedIn.phone, action.amount);
      onCustomerChange(updated);
      onNotify(
        `+${action.amount} bonus stamps saved to ${loggedIn.firstName}’s card!`
      );
    }
  };

  const handleValidStampScan = async (result: {
    type: QrTokenType;
    bucket: number;
    code: string;
  }): Promise<string | null> => {
    if (!customer) return 'Please sign in first.';
    const alreadyUsed = await loyaltyStore.isTokenUsed(
      customer.phone,
      'STAMP',
      result.bucket
    );
    if (alreadyUsed) {
      return 'This 60-second code was already scanned on your card. Wait for the next code.';
    }
    await loyaltyStore.markTokenUsed(customer.phone, 'STAMP', result.bucket);
    const updated = await loyaltyStore.addStamps(customer.phone, 1);
    onCustomerChange(updated);
    setScannerOpen(false);
    if (updated.stamps >= STAMPS_FOR_FREE_DRINK) {
      onNotify('7 stamps complete! Your Free Drink is ready.');
      setRedemptionOpen(true);
    } else {
      onNotify(`Stamp added! (${updated.stamps}/${STAMPS_FOR_FREE_DRINK})`);
    }
    return null;
  };

  const handleSpinComplete = async (prize: SpinPrize) => {
    onSpinUsedForBill();

    if (customer) {
      let updated = await loyaltyStore.recordSpin(customer.phone);
      if (prize.bonusStamps) {
        updated = await loyaltyStore.addStamps(customer.phone, prize.bonusStamps);
        onNotify(`+${prize.bonusStamps} bonus stamps added!`);
      } else {
        onNotify(`Claimed: ${prize.label}`);
      }
      onCustomerChange(updated);
      setSpinWheelOpen(false);
      return;
    }

    setSpinWheelOpen(false);
    if (prize.bonusStamps) {
      setPendingAction({
        type: 'save-bonus-stamps',
        amount: prize.bonusStamps,
      });
      setAuthSheetOpen(true);
    } else {
      onNotify(`Claimed: ${prize.label}`);
    }
  };

  const handleClaimFreeDrink = async () => {
    if (!customer) return;
    const updated = await loyaltyStore.redeemFreeDrink(customer.phone);
    onCustomerChange(updated);
    setRedemptionOpen(false);
    onNotify('Free drink claimed! Card reset for your next round.');
  };

  const handleSwitchNumber = async () => {
    await loyaltyStore.setCurrentPhone(null);
    onCustomerChange(null);
    setPendingAction(null);
    setAuthSheetOpen(true);
  };

  return (
    <div className="px-4 pt-4 pb-24 space-y-5">
      <div>
        <h1 className="font-display text-2xl font-semibold text-[#18181B]">
          {t.rewards.title}
        </h1>
        <p className="text-sm text-[#71717A] mt-0.5">{t.rewards.subtitle}</p>
      </div>

      {/* Simple 800+ ETB Spin to Win Card */}
      <div
        className={`rounded-3xl border p-5 space-y-4 ${
          unlockedByBill
            ? 'bg-[#C26D4A]/10 border-[#C26D4A]/45'
            : 'bg-white border-[#E7E5E0]'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-semibold text-[#18181B]">
              {t.rewards.spinCardTitle}
            </h2>
            <p className="text-xs text-[#52525B] mt-1 leading-relaxed">
              {unlockedByBill
                ? t.rewards.spinUnlockedByBill(billTotalEtb)
                : t.rewards.spinRuleSimple}
            </p>
          </div>
          <span className="text-xs font-semibold font-mono-num text-[#71717A] shrink-0">
            {billTotalEtb}/{SPIN_UNLOCK_THRESHOLD_ETB}
          </span>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="h-2 w-full rounded-full bg-[#E7E5E0] overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                unlockedByBill ? 'bg-[#C26D4A]' : 'bg-[#4A5D4E]'
              }`}
              style={{ width: `${spinProgressPct}%` }}
            />
          </div>
          {!unlockedByBill && (
            <p className="text-[11px] text-[#71717A] mt-1.5">
              {t.rewards.spinNeedMore(remainingForSpin)}
            </p>
          )}
        </div>

        {/* Single Clear CTA */}
        {unlockedByBill ? (
          <button
            type="button"
            onClick={() => setSpinWheelOpen(true)}
            className="w-full min-h-[50px] rounded-xl bg-[#C26D4A] hover:bg-[#A65A3B] text-white text-sm font-semibold flex items-center justify-center gap-2 active:scale-[0.985] transition"
          >
            <Disc3 className="w-4 h-4" />
            <span>{t.rewards.spinNowBtn}</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onGoToMenu}
            className="w-full min-h-[46px] rounded-xl bg-[#FAF8F5] border border-[#E7E5E0] hover:border-[#4A5D4E] text-[#18181B] text-xs font-semibold flex items-center justify-center gap-1.5 active:scale-[0.985] transition"
          >
            <span>{t.rewards.goToMenuBtn}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Prizes */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-2 border-t border-[#E7E5E0]/70 text-xs text-[#18181B]">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#4A5D4E] shrink-0" />
            <span>{t.rewards.prizes.teaWater}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#4A5D4E] shrink-0" />
            <span>{t.rewards.prizes.bonusStamps}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#C26D4A] shrink-0" />
            <span>{t.rewards.prizes.pastry}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#C26D4A] shrink-0" />
            <span>{t.rewards.prizes.macchiatoJuice}</span>
          </div>
        </div>
      </div>

      {/* 7-Stamp Punch Card */}
      <PunchCard
        customer={customer}
        language={language}
        onOpenRedemption={() => setRedemptionOpen(true)}
      />

      {/* Scan Stamp QR Button */}
      <button
        type="button"
        onClick={handleRequestStampScan}
        className="w-full min-h-[54px] px-4 rounded-2xl bg-[#4A5D4E] hover:bg-[#3B4B3F] text-white text-sm font-semibold flex items-center justify-between active:scale-[0.985] transition"
      >
        <span className="flex items-center gap-3">
          <QrCode className="w-5 h-5" />
          <span>{t.rewards.scanStampQr}</span>
        </span>
        <span className="text-xs font-normal text-white/80">
          {t.rewards.plusOneStamp}
        </span>
      </button>

      {/* Subtle Switch Number link */}
      {customer && (
        <div className="pt-1 text-center">
          <button
            type="button"
            onClick={handleSwitchNumber}
            className="text-xs text-[#71717A] hover:text-[#18181B] underline underline-offset-4 py-2 px-3"
          >
            {t.rewards.switchNumber(customer.firstName)}
          </button>
        </div>
      )}

      {/* Lazy Phone Sign-In Sheet (Only for Stamp Card or saving +2 Bonus Stamps) */}
      <PhoneAuthSheet
        open={authSheetOpen}
        reasonText={
          pendingAction?.type === 'save-bonus-stamps'
            ? 'Enter your phone to save your +2 bonus stamps onto a punch card.'
            : 'Enter your phone once to keep your drink stamps saved.'
        }
        onClose={() => {
          setAuthSheetOpen(false);
          setPendingAction(null);
        }}
        onAuthenticated={handleAuthenticated}
      />

      {/* Stamp QR Scanner Modal */}
      <QrScannerModal
        open={scannerOpen}
        expectedType="STAMP"
        onClose={() => setScannerOpen(false)}
        onValidScan={handleValidStampScan}
      />

      {/* 800+ Spin Wheel Modal (No Login Required!) */}
      <SpinWheelModal
        open={spinWheelOpen}
        firstName={customer?.firstName}
        language={language}
        onComplete={handleSpinComplete}
        onClose={() => setSpinWheelOpen(false)}
      />

      {/* 7-Stamp Free Drink Live Ticket */}
      {customer && (
        <RedemptionTicket
          open={redemptionOpen}
          variant="free-drink"
          firstName={customer.firstName}
          title={t.rewards.freeDrinkTitle}
          subtitle={t.rewards.freeDrinkSub}
          claimButtonLabel={t.rewards.cashierTapClaim}
          requireCashierConfirm
          onClaim={handleClaimFreeDrink}
          onClose={() => setRedemptionOpen(false)}
        />
      )}
    </div>
  );
}
