import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  EyeOff,
  Eye,
  X,
  Send,
  MessageCircle,
  Grid3X3,
  AtSign,
  Coffee,
  Sparkles,
  Check,
} from 'lucide-react';
import {
  DEMO_LOUNGE_GUESTS,
  QUICK_REPLY_BUBBLES,
  WAVE_PRESETS,
  type EphemeralChatMessage,
  type LoungeGuest,
  type SentWaveRecord,
  type WavePresetCard,
} from './types';
import { LiveTableTicTacToe } from '../games/LiveTableTicTacToe';
import { GameWinnerView } from '../games/GameWinnerView';
import type { DealConfig, GameMetadata, GameOutcome } from '../games/types';

interface LoungeViewProps {
  tableNumber: number;
  onNotify: (message: string) => void;
  onUnreadChange?: (hasUnread: boolean) => void;
}

interface IncomingWaveBanner {
  fromGuestId: string;
  tableNumber: number;
  nickname: string;
  spotClue: string;
  message: string;
}

function nowTimeLabel(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function LoungeView({
  tableNumber,
  onNotify,
  onUnreadChange,
}: LoungeViewProps) {
  const [optedIn, setOptedIn] = useState(false);
  const [myNickname, setMyNickname] = useState('');
  const [mySpotClue, setMySpotClue] = useState('');

  // Opt-In modal state
  const [optInModalOpen, setOptInModalOpen] = useState(false);
  const [draftNickname, setDraftNickname] = useState('');
  const [draftSpotClue, setDraftSpotClue] = useState('');
  const [optInError, setOptInError] = useState<string | null>(null);
  const [pendingGuestAfterOptIn, setPendingGuestAfterOptIn] =
    useState<LoungeGuest | null>(null);

  // Wave bottom sheet + wave state (max 1 wave per person)
  const [waveTarget, setWaveTarget] = useState<LoungeGuest | null>(null);
  const [sentWaves, setSentWaves] = useState<Record<string, SentWaveRecord>>({});

  // Ephemeral 1-on-1 chat state
  const [activeChatGuestId, setActiveChatGuestId] = useState<string | null>(null);
  const [chatThreads, setChatThreads] = useState<
    Record<string, EphemeralChatMessage[]>
  >({});
  const [handleInputOpen, setHandleInputOpen] = useState(false);
  const [socialHandle, setSocialHandle] = useState('');

  // Incoming demo wave banner
  const [incomingBanner, setIncomingBanner] =
    useState<IncomingWaveBanner | null>(null);

  // Quick Tic-Tac-Toe launch from Game Excuse
  const [tttOpponent, setTttOpponent] = useState<LoungeGuest | null>(null);
  const [tttOutcome, setTttOutcome] = useState<GameOutcome | null>(null);
  const [tttNonce, setTttNonce] = useState(0);

  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  useEffect(() => {
    onUnreadChange?.(Boolean(incomingBanner));
  }, [incomingBanner, onUnreadChange]);

  const handleToggleSwitch = () => {
    if (optedIn) {
      // Leave room & clear ephemeral data cleanly
      setOptedIn(false);
      setMyNickname('');
      setMySpotClue('');
      setSentWaves({});
      setChatThreads({});
      setActiveChatGuestId(null);
      setIncomingBanner(null);
      onNotify('You are now hidden in Cafe Lounge.');
      return;
    }

    setDraftNickname(myNickname);
    setDraftSpotClue(mySpotClue);
    setOptInError(null);
    setOptInModalOpen(true);
  };

  const handleConfirmOptIn = (e: FormEvent) => {
    e.preventDefault();
    const nick = draftNickname.trim();
    const clue = draftSpotClue.trim();
    if (nick.length < 2) {
      setOptInError('Enter a short nickname (at least 2 letters).');
      return;
    }
    if (clue.length < 2) {
      setOptInError('Add a quick spot clue (e.g., "Window seat" or "Green hoodie").');
      return;
    }

    setMyNickname(nick);
    setMySpotClue(clue);
    setOptedIn(true);
    setOptInModalOpen(false);
    onNotify(`Checked in at Table ${tableNumber} as ${nick}`);

    if (pendingGuestAfterOptIn) {
      const target = pendingGuestAfterOptIn;
      setPendingGuestAfterOptIn(null);
      setWaveTarget(target);
    }
  };

  const handleTapGuest = (guest: LoungeGuest) => {
    const existing = sentWaves[guest.id];
    if (existing?.status === 'waved-back') {
      setActiveChatGuestId(guest.id);
      return;
    }
    if (existing?.status === 'sent') {
      // Already sent (1 wave cap per person)
      return;
    }

    if (!optedIn) {
      setPendingGuestAfterOptIn(guest);
      setOptInError(null);
      setOptInModalOpen(true);
      return;
    }

    setWaveTarget(guest);
  };

  const handleSendWave = (preset: WavePresetCard) => {
    if (!waveTarget) return;
    if (sentWaves[waveTarget.id]) return;

    const guest = waveTarget;
    const msgText = preset.buildMessage(tableNumber);

    setSentWaves((prev) => ({
      ...prev,
      [guest.id]: {
        guestId: guest.id,
        presetId: preset.id,
        presetTitle: preset.title,
        message: msgText,
        status: 'sent',
      },
    }));
    setWaveTarget(null);

    if (guest.respondsWithWaveBack) {
      const timerId = window.setTimeout(() => {
        setSentWaves((prev) => {
          const current = prev[guest.id];
          if (!current) return prev;
          return {
            ...prev,
            [guest.id]: { ...current, status: 'waved-back' },
          };
        });

        const autoReplyText =
          preset.id === 'game-excuse'
            ? `You’re on! Loser buys coffee — tap Play Tic-Tac-Toe whenever ready.`
            : preset.id === 'treat-drink'
              ? `That’s super kind! Thank you — say hi from Table ${tableNumber}.`
              : `Hey Table ${tableNumber}! Glad you waved.`;

        setChatThreads((prev) => ({
          ...prev,
          [guest.id]: [
            {
              id: `w-${Date.now()}-1`,
              sender: 'you',
              text: msgText,
              timeLabel: nowTimeLabel(),
            },
            {
              id: `w-${Date.now()}-2`,
              sender: 'them',
              text: autoReplyText,
              timeLabel: nowTimeLabel(),
            },
          ],
        }));

        onNotify(`${guest.nickname} waved back!`);
      }, 2000);

      timersRef.current.push(timerId);
    }
    // Dawit quietly stays in "Wave Sent" with zero rejection alert
  };

  const handleTriggerDemoIncomingWave = () => {
    setIncomingBanner({
      fromGuestId: 'hana',
      tableNumber: 2,
      nickname: 'Hana',
      spotClue: 'Window seat',
      message: 'Can I cover your next macchiato?',
    });
  };

  const handleAcceptIncomingWave = () => {
    if (!incomingBanner) return;
    const banner = incomingBanner;
    setIncomingBanner(null);

    if (!optedIn) {
      setMyNickname((prev) => prev || 'Guest');
      setMySpotClue((prev) => prev || `Table ${tableNumber}`);
      setOptedIn(true);
    }

    setSentWaves((prev) => ({
      ...prev,
      [banner.fromGuestId]: {
        guestId: banner.fromGuestId,
        presetId: 'treat-drink',
        presetTitle: 'Treat a Drink',
        message: banner.message,
        status: 'waved-back',
      },
    }));

    setChatThreads((prev) => ({
      ...prev,
      [banner.fromGuestId]: [
        {
          id: `in-${Date.now()}-1`,
          sender: 'them',
          text: banner.message,
          timeLabel: nowTimeLabel(),
        },
        {
          id: `in-${Date.now()}-2`,
          sender: 'you',
          text: `Waved back from Table ${tableNumber}!`,
          timeLabel: nowTimeLabel(),
        },
      ],
    }));

    setActiveChatGuestId(banner.fromGuestId);
    onNotify(`Connected with ${banner.nickname}`);
  };

  const handleIgnoreIncomingWave = () => {
    setIncomingBanner(null);
  };

  const appendQuickMessage = (guestId: string, text: string) => {
    setChatThreads((prev) => ({
      ...prev,
      [guestId]: [
        ...(prev[guestId] ?? []),
        {
          id: `m-${Date.now()}`,
          sender: 'you',
          text,
          timeLabel: nowTimeLabel(),
        },
      ],
    }));
  };

  const handleShareSocialHandle = (e: FormEvent) => {
    e.preventDefault();
    if (!activeChatGuestId) return;
    const cleaned = socialHandle.trim() || '@buna_guest';
    const formatted = cleaned.startsWith('@') ? cleaned : `@${cleaned}`;
    appendQuickMessage(
      activeChatGuestId,
      `Here’s my Telegram / IG handle: ${formatted}`
    );
    setSocialHandle('');
    setHandleInputOpen(false);
  };

  // Active Game Excuse Tic-Tac-Toe screen
  if (tttOpponent) {
    const deal: DealConfig = {
      mode: 'deal',
      dealText: 'Winner buys coffee!',
      player1Name: myNickname || `Table ${tableNumber}`,
      player2Name: tttOpponent.nickname,
    };
    const meta: GameMetadata = {
      id: 'tic-tac-toe',
      title: `Cafe Match vs ${tttOpponent.nickname}`,
      subtitle: `Table ${tableNumber} vs Table ${tttOpponent.tableNumber}`,
      playersLabel: '2 Players',
      durationLabel: '~1 min',
    };

    if (tttOutcome) {
      return (
        <GameWinnerView
          game={meta}
          deal={deal}
          outcome={tttOutcome}
          onRematch={() => {
            setTttOutcome(null);
            setTttNonce((n) => n + 1);
          }}
          onExit={() => {
            setTttOutcome(null);
            setTttOpponent(null);
          }}
        />
      );
    }

    return (
      <LiveTableTicTacToe
        key={tttNonce}
        playerLabel={myNickname || `Table ${tableNumber}`}
        opponentLabel={`${tttOpponent.nickname} (Table ${tttOpponent.tableNumber})`}
        onComplete={(res) => setTttOutcome(res)}
        onExit={() => {
          setTttOutcome(null);
          setTttOpponent(null);
        }}
      />
    );
  }

  const activeChatGuest = activeChatGuestId
    ? DEMO_LOUNGE_GUESTS.find((g) => g.id === activeChatGuestId) ?? null
    : null;
  const activeChatWave = activeChatGuestId
    ? sentWaves[activeChatGuestId] ?? null
    : null;

  return (
    <div className="px-4 pt-4 pb-24 space-y-5">
      <div>
        <h1 className="font-display text-2xl font-semibold text-[#18181B]">
          Cafe Lounge
        </h1>
        <p className="text-sm text-[#71717A] mt-0.5">
          A quiet, opt-in way to say hello or share a coffee across the room.
        </p>
      </div>

      {/* Incoming Wave Private Banner (from Demo: Receive a Wave) */}
      {incomingBanner && (
        <div
          role="region"
          aria-label="Incoming cafe wave"
          className="rounded-3xl bg-white border-2 border-[#C26D4A]/45 p-4 shadow-sm space-y-3"
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-xs font-semibold text-[#C26D4A]">
                Private Wave · Table {incomingBanner.tableNumber}
              </div>
              <div className="text-sm font-semibold text-[#18181B] mt-0.5">
                {incomingBanner.nickname} — {incomingBanner.spotClue}
              </div>
              <p className="text-xs text-[#52525B] mt-1">
                “{incomingBanner.message}”
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={handleIgnoreIncomingWave}
              className="min-h-[42px] rounded-xl bg-[#FAF8F5] border border-[#E7E5E0] text-xs font-semibold text-[#52525B] hover:text-[#18181B] transition"
            >
              Ignore
            </button>
            <button
              type="button"
              onClick={handleAcceptIncomingWave}
              className="min-h-[42px] rounded-xl bg-[#4A5D4E] hover:bg-[#3B4B3F] text-white text-xs font-semibold transition"
            >
              Wave Back
            </button>
          </div>
        </div>
      )}

      {/* Privacy & Visibility Card ("Invisible by Default") */}
      <div className="bg-white rounded-3xl border border-[#E7E5E0] p-5 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                optedIn
                  ? 'bg-[#4A5D4E] text-white'
                  : 'bg-[#FAF8F5] border border-[#E7E5E0] text-[#71717A]'
              }`}
            >
              {optedIn ? (
                <Eye className="w-5 h-5" />
              ) : (
                <EyeOff className="w-5 h-5" />
              )}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-[#18181B]">
                Open to Say Hi
              </div>
              <div className="text-xs text-[#71717A] truncate">
                {optedIn
                  ? `Visible at Table ${tableNumber} · ${myNickname}`
                  : 'You are hidden by default'}
              </div>
            </div>
          </div>

          {/* Toggle Switch */}
          <button
            type="button"
            role="switch"
            aria-checked={optedIn}
            aria-label="Open to Say Hi"
            onClick={handleToggleSwitch}
            className={`relative w-12 h-7 rounded-full transition-colors shrink-0 ${
              optedIn ? 'bg-[#4A5D4E]' : 'bg-[#D6D3CD]'
            }`}
          >
            <span
              className={`block w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                optedIn ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <p className="text-xs text-[#71717A] leading-relaxed">
          {optedIn
            ? `Your table sees: Table ${tableNumber} • ${myNickname} (“${mySpotClue}”). Flip off anytime to vanish immediately.`
            : 'Nobody in the cafe can see you until you flip this switch. Preset waves only — no cold DMs.'}
        </p>
      </div>

      {/* Room List */}
      <div className="space-y-2.5">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-lg font-semibold text-[#18181B]">
            In the Room Now
          </h2>
          <span className="text-xs text-[#71717A] tabular-nums">
            {DEMO_LOUNGE_GUESTS.length + (optedIn ? 1 : 0)} checked in
          </span>
        </div>

        {/* User's own checked-in entry */}
        {optedIn && (
          <div className="bg-[#4A5D4E]/[0.06] rounded-2xl border border-[#4A5D4E]/30 p-4 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-xs font-semibold text-[#4A5D4E]">
                Table {tableNumber} · You
              </div>
              <div className="text-[15px] font-semibold text-[#18181B] mt-0.5 truncate">
                {myNickname}{' '}
                <span className="font-normal text-[#71717A]">
                  (“{mySpotClue}”)
                </span>
              </div>
            </div>
            <span className="text-xs font-medium text-[#4A5D4E] shrink-0">
              Checked in
            </span>
          </div>
        )}

        {/* Simulated Students */}
        {DEMO_LOUNGE_GUESTS.map((guest) => {
          const wave = sentWaves[guest.id];
          const isConnected = wave?.status === 'waved-back';
          const isSent = wave?.status === 'sent';

          return (
            <button
              key={guest.id}
              type="button"
              onClick={() => handleTapGuest(guest)}
              className={`w-full rounded-2xl border p-4 text-left flex items-center justify-between gap-3 transition active:scale-[0.99] ${
                isConnected
                  ? 'bg-white border-[#4A5D4E]'
                  : 'bg-white border-[#E7E5E0] hover:border-[#4A5D4E]/50'
              }`}
            >
              <div className="min-w-0">
                <div className="text-xs font-medium text-[#71717A]">
                  Table {guest.tableNumber}
                </div>
                <div className="text-[15px] font-semibold text-[#18181B] mt-0.5 truncate">
                  {guest.nickname}{' '}
                  <span className="font-normal text-[#71717A]">
                    (“{guest.spotClue}”)
                  </span>
                </div>
                {isSent && (
                  <div className="text-[11px] text-[#71717A] mt-1">
                    Sent: {wave.presetTitle}
                  </div>
                )}
                {isConnected && (
                  <div className="text-[11px] font-medium text-[#4A5D4E] mt-1 flex items-center gap-1">
                    <MessageCircle className="w-3 h-3" />
                    <span>Waved back · Tap to open chat</span>
                  </div>
                )}
              </div>

              <div className="shrink-0">
                {isConnected ? (
                  <span className="px-3 py-1.5 rounded-xl bg-[#4A5D4E] text-white text-xs font-semibold">
                    Open Chat
                  </span>
                ) : isSent ? (
                  <span className="px-3 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#E7E5E0] text-[#71717A] text-xs font-medium">
                    Wave Sent
                  </span>
                ) : (
                  <span className="px-3 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#E7E5E0] text-[#18181B] text-xs font-semibold">
                    Say Hi
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Subtle Pitch Helper Button */}
      <div className="pt-2 text-center">
        <button
          type="button"
          onClick={handleTriggerDemoIncomingWave}
          className="text-xs font-medium text-[#71717A] hover:text-[#18181B] underline underline-offset-4 py-2 px-3"
        >
          Demo: Receive a Wave
        </button>
      </div>

      {/* OPT-IN MODAL */}
      {optInModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/45 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-label="Join Cafe Lounge"
          onClick={() => {
            setOptInModalOpen(false);
            setPendingGuestAfterOptIn(null);
          }}
        >
          <div
            className="w-full max-w-md bg-[#FAF8F5] rounded-t-3xl sm:rounded-3xl border border-[#E7E5E0] p-5 pb-7"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 rounded-full bg-[#D6D3CD] mx-auto mb-4 sm:hidden" />
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <div className="text-xs font-semibold text-[#4A5D4E]">
                  Table {tableNumber} · Cafe Lounge
                </div>
                <h2 className="font-display text-xl font-semibold text-[#18181B] mt-0.5">
                  Check In to Say Hi
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setOptInModalOpen(false);
                  setPendingGuestAfterOptIn(null);
                }}
                aria-label="Close check in"
                className="min-h-[40px] min-w-[40px] rounded-xl flex items-center justify-center text-[#71717A]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmOptIn} className="space-y-4">
              <div>
                <label
                  htmlFor="lounge-nickname"
                  className="block text-xs font-semibold text-[#18181B] mb-1.5"
                >
                  Nickname
                </label>
                <input
                  id="lounge-nickname"
                  type="text"
                  autoFocus
                  maxLength={20}
                  placeholder="e.g., Abel, Saron"
                  value={draftNickname}
                  onChange={(e) => {
                    setDraftNickname(e.target.value);
                    setOptInError(null);
                  }}
                  className="w-full min-h-[46px] px-3.5 rounded-xl bg-white border border-[#E7E5E0] text-sm text-[#18181B] placeholder:text-[#A1A1AA] focus:outline-none focus:border-[#4A5D4E]"
                />
              </div>

              <div>
                <label
                  htmlFor="lounge-spot"
                  className="block text-xs font-semibold text-[#18181B] mb-1.5"
                >
                  Spot Clue
                </label>
                <input
                  id="lounge-spot"
                  type="text"
                  maxLength={28}
                  placeholder="e.g., Window seat or Green hoodie"
                  value={draftSpotClue}
                  onChange={(e) => {
                    setDraftSpotClue(e.target.value);
                    setOptInError(null);
                  }}
                  className="w-full min-h-[46px] px-3.5 rounded-xl bg-white border border-[#E7E5E0] text-sm text-[#18181B] placeholder:text-[#A1A1AA] focus:outline-none focus:border-[#4A5D4E]"
                />
              </div>

              {optInError && (
                <p role="alert" className="text-xs font-medium text-[#C26D4A]">
                  {optInError}
                </p>
              )}

              <button
                type="submit"
                className="w-full min-h-[48px] rounded-xl bg-[#4A5D4E] hover:bg-[#3B4B3F] text-white text-sm font-semibold active:scale-[0.985] transition"
              >
                Appear at Table {tableNumber}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* PRESET WAVE BOTTOM SHEET (Only 4 preset cards, 1 wave per person) */}
      {waveTarget && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-label={`Send a wave to ${waveTarget.nickname}`}
          onClick={() => setWaveTarget(null)}
        >
          <div
            className="w-full max-w-md bg-[#FAF8F5] rounded-t-3xl border-t border-[#E7E5E0] p-5 pb-7 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 rounded-full bg-[#D6D3CD] mx-auto" />
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-medium text-[#71717A]">
                  Table {waveTarget.tableNumber} · “{waveTarget.spotClue}”
                </div>
                <h2 className="font-display text-xl font-semibold text-[#18181B] mt-0.5">
                  Wave to {waveTarget.nickname}
                </h2>
                <p className="text-xs text-[#71717A] mt-0.5">
                  Choose 1 preset icebreaker. No cold messages allowed.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setWaveTarget(null)}
                aria-label="Close wave options"
                className="min-h-[40px] min-w-[40px] rounded-xl flex items-center justify-center text-[#71717A]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {WAVE_PRESETS.map((preset) => {
                const isTreat = Boolean(preset.badgeText);
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSendWave(preset)}
                    className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between gap-3 active:scale-[0.99] transition ${
                      isTreat
                        ? 'bg-[#C26D4A]/[0.07] border-[#C26D4A]/40 hover:border-[#C26D4A]'
                        : 'bg-white border-[#E7E5E0] hover:border-[#4A5D4E]'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-[#18181B]">
                          {preset.title}
                        </span>
                        {preset.badgeText && (
                          <span className="text-[11px] font-semibold text-[#C26D4A] flex items-center gap-1">
                            <Coffee className="w-3 h-3" />
                            <span>{preset.badgeText}</span>
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-[#52525B] mt-1">
                        “{preset.buildMessage(tableNumber)}”
                      </p>
                    </div>
                    <Send className="w-4 h-4 text-[#4A5D4E] shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* EPHEMERAL 1-ON-1 CAFE CHAT MODAL */}
      {activeChatGuest && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-label={`Ephemeral chat with ${activeChatGuest.nickname}`}
          onClick={() => {
            setActiveChatGuestId(null);
            setHandleInputOpen(false);
          }}
        >
          <div
            className="w-full max-w-md max-h-[85vh] bg-[#FAF8F5] rounded-t-3xl border-t border-[#E7E5E0] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-5 py-4 bg-white border-b border-[#E7E5E0] flex items-center justify-between">
              <div>
                <div className="text-xs font-medium text-[#4A5D4E]">
                  Table {activeChatGuest.tableNumber} · “{activeChatGuest.spotClue}”
                </div>
                <h2 className="font-display text-lg font-semibold text-[#18181B]">
                  {activeChatGuest.nickname}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveChatGuestId(null);
                  setHandleInputOpen(false);
                }}
                aria-label="Close chat"
                className="min-h-[40px] min-w-[40px] rounded-xl flex items-center justify-center text-[#71717A]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Ephemeral Notice */}
            <div className="px-5 py-2 bg-[#EAE6DF]/60 border-b border-[#E7E5E0] text-[11px] font-medium text-[#52525B] flex items-center justify-center gap-1.5">
              <Sparkles className="w-3 h-3 text-[#C26D4A]" />
              <span>Clears automatically when you leave</span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2.5">
              {(chatThreads[activeChatGuest.id] ?? []).map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.sender === 'you' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      msg.sender === 'you'
                        ? 'bg-[#4A5D4E] text-white'
                        : 'bg-white border border-[#E7E5E0] text-[#18181B]'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-[#71717A] mt-0.5 px-1 font-mono-num">
                    {msg.timeLabel}
                  </span>
                </div>
              ))}
            </div>

            {/* Action Area: Game Excuse Launch + Quick Replies + Share Handle */}
            <div className="p-4 bg-white border-t border-[#E7E5E0] space-y-3">
              {activeChatWave?.presetId === 'game-excuse' && (
                <button
                  type="button"
                  onClick={() => {
                    const opp = activeChatGuest;
                    setActiveChatGuestId(null);
                    setTttOutcome(null);
                    setTttNonce((n) => n + 1);
                    setTttOpponent(opp);
                  }}
                  className="w-full min-h-[44px] rounded-xl bg-[#C26D4A] hover:bg-[#A65A3B] text-white text-xs font-semibold flex items-center justify-center gap-2 active:scale-[0.985] transition"
                >
                  <Grid3X3 className="w-4 h-4" />
                  <span>Play Tic-Tac-Toe with {activeChatGuest.nickname}</span>
                </button>
              )}

              {/* Quick Reply Bubbles */}
              <div className="flex flex-wrap gap-1.5">
                {QUICK_REPLY_BUBBLES.map((bubble) => (
                  <button
                    key={bubble}
                    type="button"
                    onClick={() =>
                      appendQuickMessage(activeChatGuest.id, bubble)
                    }
                    className="px-3 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#E7E5E0] hover:border-[#4A5D4E] text-xs font-medium text-[#18181B] transition"
                  >
                    {bubble}
                  </button>
                ))}
              </div>

              {/* Share Telegram / IG Handle */}
              {handleInputOpen ? (
                <form
                  onSubmit={handleShareSocialHandle}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    autoFocus
                    maxLength={32}
                    placeholder="@your_telegram_or_ig"
                    value={socialHandle}
                    onChange={(e) => setSocialHandle(e.target.value)}
                    className="flex-1 min-h-[42px] px-3 rounded-xl bg-[#FAF8F5] border border-[#E7E5E0] text-xs text-[#18181B] focus:outline-none focus:border-[#4A5D4E]"
                  />
                  <button
                    type="submit"
                    className="min-h-[42px] px-3.5 rounded-xl bg-[#4A5D4E] text-white text-xs font-semibold flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Send</span>
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setHandleInputOpen(true)}
                  className="w-full min-h-[44px] rounded-xl bg-[#FAF8F5] border border-[#E7E5E0] hover:border-[#4A5D4E] text-xs font-semibold text-[#18181B] flex items-center justify-center gap-2 transition"
                >
                  <AtSign className="w-4 h-4 text-[#4A5D4E]" />
                  <span>Share Telegram / IG Handle</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
