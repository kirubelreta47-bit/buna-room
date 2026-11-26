import { useCallback, useEffect, useRef, useState } from 'react';
import { MENU_ITEMS, SPIN_UNLOCK_THRESHOLD_ETB } from './data/menu';
import {
  loyaltyStore,
  STAMPS_FOR_FREE_DRINK,
  type LoyaltyCustomer,
} from './services/loyaltyStore';
import type { Language } from './i18n/translations';
import { Header } from './components/Header';
import { BottomNav, type AppTab } from './components/BottomNav';
import { MenuView } from './components/menu/MenuView';
import { BillBar } from './components/menu/BillBar';
import { BillSplitterDrawer } from './components/menu/BillSplitterDrawer';
import { RewardsView } from './components/rewards/RewardsView';
import { PlayView } from './components/games/PlayView';
import { LoungeView } from './components/lounge/LoungeView';
import { CounterScreen } from './components/counter/CounterScreen';

const LANG_STORAGE_KEY = 'buna_room_lang_v1';

function loadInitialLanguage(): Language {
  try {
    const saved = localStorage.getItem(LANG_STORAGE_KEY);
    if (saved === 'am' || saved === 'en') return saved;
  } catch {
    // Ignore storage errors
  }
  return 'en';
}

function parseTableFromUrl(): number {
  try {
    const params = new URLSearchParams(window.location.search);
    const raw = Number(params.get('table'));
    if (Number.isInteger(raw) && raw >= 1 && raw <= 4) {
      return raw;
    }
  } catch {
    // Fallback to Table 1
  }
  return 1;
}

function isCounterPath(): boolean {
  try {
    return window.location.pathname.replace(/\/+$/, '') === '/counter';
  } catch {
    return false;
  }
}

export default function App() {
  const [tableNumber] = useState<number>(() => parseTableFromUrl());
  const [language, setLanguage] = useState<Language>(() => loadInitialLanguage());
  const [counterMode, setCounterMode] = useState<boolean>(() => isCounterPath());
  const [activeTab, setActiveTab] = useState<AppTab>('menu');

  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [splitterOpen, setSplitterOpen] = useState(false);

  const [customer, setCustomer] = useState<LoyaltyCustomer | null>(null);
  const [hasLoungeUnread, setHasLoungeUnread] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  // Track automatic 800+ ETB Spin unlock & auto-open when visiting Rewards
  const [autoOpenSpinSignal, setAutoOpenSpinSignal] = useState(0);
  const [billSpinClaimedForOrder, setBillSpinClaimedForOrder] = useState(false);
  const prevTotalRef = useRef(0);

  const showToast = useCallback((message: string) => {
    if (toastTimerRef.current !== null) {
      window.clearTimeout(toastTimerRef.current);
    }
    setToast(message);
    toastTimerRef.current = window.setTimeout(() => {
      setToast(null);
      toastTimerRef.current = null;
    }, 2800);
  }, []);

  useEffect(() => {
    let mounted = true;
    const loadCustomer = async () => {
      const phone = await loyaltyStore.getCurrentPhone();
      if (!phone) return;
      const found = await loyaltyStore.findByPhone(phone);
      if (mounted && found) {
        setCustomer(found);
      }
    };
    void loadCustomer();

    const handlePopState = () => {
      setCounterMode(isCounterPath());
    };
    window.addEventListener('popstate', handlePopState);
    return () => {
      mounted = false;
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const totalItemCount = Object.values(quantities).reduce((sum, q) => sum + q, 0);
  const totalEtb = MENU_ITEMS.reduce(
    (sum, item) => sum + item.priceEtb * (quantities[item.id] ?? 0),
    0
  );

  useEffect(() => {
    const prev = prevTotalRef.current;
    prevTotalRef.current = totalEtb;

    if (prev < SPIN_UNLOCK_THRESHOLD_ETB && totalEtb >= SPIN_UNLOCK_THRESHOLD_ETB) {
      setBillSpinClaimedForOrder(false);
      setAutoOpenSpinSignal((n) => n + 1);
      showToast(
        language === 'am'
          ? '800+ ብር ተሞልቷል! Spin to Win በሽልማት ገጽ ተከፍቷል'
          : '800+ ETB reached! Spin to Win unlocked on Rewards'
      );
    } else if (totalEtb < SPIN_UNLOCK_THRESHOLD_ETB && prev >= SPIN_UNLOCK_THRESHOLD_ETB) {
      setBillSpinClaimedForOrder(false);
      setAutoOpenSpinSignal(0);
    }
  }, [totalEtb, language, showToast]);

  const handleToggleLanguage = () => {
    const next: Language = language === 'en' ? 'am' : 'en';
    setLanguage(next);
    try {
      localStorage.setItem(LANG_STORAGE_KEY, next);
    } catch {
      // Ignore
    }
    showToast(next === 'am' ? 'ቋንቋ ወደ አማርኛ ተቀይሯል' : 'Language switched to English');
  };

  const handleOpenCounter = () => {
    setCounterMode(true);
    try {
      const url = new URL(window.location.href);
      url.pathname = '/counter';
      window.history.pushState({}, '', url.toString());
    } catch {
      // Ignore
    }
  };

  const handleCloseCounter = () => {
    setCounterMode(false);
    try {
      const url = new URL(window.location.href);
      url.pathname = '/';
      window.history.pushState({}, '', url.toString());
    } catch {
      // Ignore
    }
  };

  const handleIncrement = (itemId: string) => {
    setQuantities((prev) => ({
      ...prev,
      [itemId]: (prev[itemId] ?? 0) + 1,
    }));
  };

  const handleDecrement = (itemId: string) => {
    setQuantities((prev) => {
      const current = prev[itemId] ?? 0;
      if (current <= 1) {
        const next = { ...prev };
        delete next[itemId];
        return next;
      }
      return { ...prev, [itemId]: current - 1 };
    });
  };

  const handleClearBill = () => {
    setQuantities({});
    setBillSpinClaimedForOrder(false);
    setAutoOpenSpinSignal(0);
    showToast(language === 'am' ? 'ሂሳቡ ጸድቷል' : 'Bill cleared');
  };

  const handleOpenSpinFromBill = () => {
    setActiveTab('rewards');
    setAutoOpenSpinSignal((n) => n + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const hasRewardReady =
    Boolean(customer && customer.stamps >= STAMPS_FOR_FREE_DRINK) ||
    (totalEtb >= SPIN_UNLOCK_THRESHOLD_ETB && !billSpinClaimedForOrder);

  return (
    <div className="min-h-screen bg-[#F2EFEA] flex justify-center">
      <div className="w-full max-w-md min-h-screen bg-[#FAF8F5] relative flex flex-col sm:border-x sm:border-[#E7E5E0]">
        {counterMode ? (
          <CounterScreen
            language={language}
            onBack={handleCloseCounter}
            onNotify={showToast}
          />
        ) : (
          <>
            <Header
              language={language}
              onToggleLanguage={handleToggleLanguage}
              onOpenCounter={handleOpenCounter}
            />

            <main className="flex-1">
              {activeTab === 'menu' && (
                <MenuView
                  quantities={quantities}
                  onIncrement={handleIncrement}
                  onDecrement={handleDecrement}
                  language={language}
                />
              )}

              {activeTab === 'rewards' && (
                <RewardsView
                  customer={customer}
                  onCustomerChange={setCustomer}
                  billTotalEtb={
                    billSpinClaimedForOrder ? 0 : totalEtb
                  }
                  autoOpenSpinSignal={autoOpenSpinSignal}
                  onConsumedAutoSpin={() => setAutoOpenSpinSignal(0)}
                  onSpinUsedForBill={() => setBillSpinClaimedForOrder(true)}
                  onGoToMenu={() => {
                    setActiveTab('menu');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  language={language}
                  onNotify={showToast}
                />
              )}

              {activeTab === 'play' && (
                <PlayView
                  language={language}
                  tableNumber={tableNumber}
                  onNotify={showToast}
                />
              )}

              {activeTab === 'lounge' && (
                <LoungeView
                  tableNumber={tableNumber}
                  onNotify={showToast}
                  onUnreadChange={setHasLoungeUnread}
                />
              )}
            </main>

            {activeTab === 'menu' && (
              <BillBar
                itemCount={totalItemCount}
                totalEtb={totalEtb}
                language={language}
                onOpenSplitter={() => setSplitterOpen(true)}
              />
            )}

            <BottomNav
              activeTab={activeTab}
              onSelectTab={(tab) => {
                setActiveTab(tab);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              language={language}
              hasRewardReady={hasRewardReady}
              hasLoungeUnread={hasLoungeUnread}
            />

            <BillSplitterDrawer
              open={splitterOpen}
              onClose={() => setSplitterOpen(false)}
              quantities={quantities}
              onIncrement={handleIncrement}
              onDecrement={handleDecrement}
              onClearBill={handleClearBill}
              onOpenSpinFromBill={handleOpenSpinFromBill}
              language={language}
              onNotify={showToast}
            />
          </>
        )}

        {/* Toast Banner */}
        {toast && (
          <div
            role="status"
            aria-live="polite"
            className="fixed top-16 left-1/2 -translate-x-1/2 z-[60] px-4 py-2.5 rounded-xl bg-[#18181B] text-white text-xs font-medium shadow-lg shadow-black/15 whitespace-nowrap max-w-[90vw] truncate"
          >
            {toast}
          </div>
        )}
      </div>
    </div>
  );
}
