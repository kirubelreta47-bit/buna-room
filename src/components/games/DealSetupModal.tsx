import { useState } from 'react';
import { ArrowLeft, Handshake, Smile, Check, ArrowRight } from 'lucide-react';
import {
  DEAL_PRESETS,
  type DealConfig,
  type GameMetadata,
  type PlayMode,
} from './types';

interface DealSetupScreenProps {
  game: GameMetadata;
  initialConfig?: DealConfig | null;
  onCancel: () => void;
  onStartGame: (config: DealConfig) => void;
}

export function DealSetupScreen({
  game,
  initialConfig,
  onCancel,
  onStartGame,
}: DealSetupScreenProps) {
  const [step, setStep] = useState<'setup' | 'handshake'>('setup');
  const [mode, setMode] = useState<PlayMode>(initialConfig?.mode ?? 'fun');
  const [selectedPreset, setSelectedPreset] = useState<string>(
    initialConfig?.dealText &&
      DEAL_PRESETS.includes(initialConfig.dealText as (typeof DEAL_PRESETS)[number])
      ? initialConfig.dealText
      : DEAL_PRESETS[0]
  );
  const [isCustomDeal, setIsCustomDeal] = useState<boolean>(
    Boolean(
      initialConfig?.dealText &&
        !DEAL_PRESETS.includes(initialConfig.dealText as (typeof DEAL_PRESETS)[number])
    )
  );
  const [customDealText, setCustomDealText] = useState<string>(
    initialConfig?.dealText &&
      !DEAL_PRESETS.includes(initialConfig.dealText as (typeof DEAL_PRESETS)[number])
      ? initialConfig.dealText
      : ''
  );

  const [p1Accepted, setP1Accepted] = useState(false);
  const [p2Accepted, setP2Accepted] = useState(false);

  const resolvedDealText = isCustomDeal
    ? customDealText.trim() || 'Custom Friendly Deal'
    : selectedPreset;

  const buildConfig = (): DealConfig => ({
    mode,
    dealText: mode === 'fun' ? 'Just for Fun' : resolvedDealText,
    player1Name: 'Player 1',
    player2Name: 'Player 2',
  });

  const handleContinue = () => {
    if (mode === 'fun') {
      onStartGame(buildConfig());
      return;
    }
    setP1Accepted(false);
    setP2Accepted(false);
    setStep('handshake');
  };

  const handleToggleAccept = (player: 1 | 2) => {
    const nextP1 = player === 1 ? !p1Accepted : p1Accepted;
    const nextP2 = player === 2 ? !p2Accepted : p2Accepted;
    setP1Accepted(nextP1);
    setP2Accepted(nextP2);

    if (nextP1 && nextP2) {
      window.setTimeout(() => {
        onStartGame(buildConfig());
      }, 320);
    }
  };

  if (step === 'handshake') {
    return (
      <div className="px-4 pt-4 pb-24 flex flex-col min-h-[calc(100vh-8rem)]">
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={() => setStep('setup')}
            className="min-h-[40px] px-2 -ml-2 rounded-xl text-sm font-medium text-[#18181B] hover:bg-white flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <span className="text-xs font-medium text-[#71717A]">
            {game.title}
          </span>
        </div>

        <div className="bg-white rounded-3xl border border-[#E7E5E0] p-5 flex-1 flex flex-col justify-between">
          <div className="text-center pt-2">
            <div className="w-12 h-12 rounded-2xl bg-[#C26D4A]/12 text-[#C26D4A] mx-auto flex items-center justify-center mb-3">
              <Handshake className="w-6 h-6" />
            </div>
            <h2 className="font-display text-2xl font-semibold text-[#18181B]">
              Digital Handshake
            </h2>
            <p className="text-sm text-[#71717A] mt-1">
              Both players tap to lock in your honor-system deal before starting.
            </p>

            <div className="mt-5 p-4 rounded-2xl bg-[#FAF8F5] border border-[#E7E5E0]">
              <div className="text-xs font-medium text-[#71717A]">
                Agreed Friendly Deal
              </div>
              <div className="font-display text-lg font-semibold text-[#C26D4A] mt-1">
                {resolvedDealText}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 mt-6">
            <button
              type="button"
              onClick={() => handleToggleAccept(1)}
              className={`min-h-[60px] px-4 rounded-2xl border text-left flex items-center justify-between transition active:scale-[0.985] ${
                p1Accepted
                  ? 'bg-[#4A5D4E] border-[#4A5D4E] text-white'
                  : 'bg-white border-[#E7E5E0] text-[#18181B] hover:border-[#4A5D4E]'
              }`}
            >
              <div>
                <div className="text-sm font-semibold">Player 1</div>
                <div
                  className={`text-xs ${
                    p1Accepted ? 'text-white/80' : 'text-[#71717A]'
                  }`}
                >
                  {p1Accepted ? 'Deal accepted' : 'Tap to accept deal'}
                </div>
              </div>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  p1Accepted ? 'bg-white/20 text-white' : 'bg-[#FAF8F5] text-[#71717A]'
                }`}
              >
                <Check className="w-4 h-4" />
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleToggleAccept(2)}
              className={`min-h-[60px] px-4 rounded-2xl border text-left flex items-center justify-between transition active:scale-[0.985] ${
                p2Accepted
                  ? 'bg-[#C26D4A] border-[#C26D4A] text-white'
                  : 'bg-white border-[#E7E5E0] text-[#18181B] hover:border-[#C26D4A]'
              }`}
            >
              <div>
                <div className="text-sm font-semibold">Player 2</div>
                <div
                  className={`text-xs ${
                    p2Accepted ? 'text-white/85' : 'text-[#71717A]'
                  }`}
                >
                  {p2Accepted ? 'Deal accepted' : 'Tap to accept deal'}
                </div>
              </div>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  p2Accepted ? 'bg-white/20 text-white' : 'bg-[#FAF8F5] text-[#71717A]'
                }`}
              >
                <Check className="w-4 h-4" />
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pt-4 pb-24 space-y-5">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onCancel}
          className="min-h-[40px] px-2 -ml-2 rounded-xl text-sm font-medium text-[#18181B] hover:bg-white flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>All Games</span>
        </button>
        <span className="text-xs text-[#71717A]">{game.playersLabel}</span>
      </div>

      <div className="bg-white rounded-3xl border border-[#E7E5E0] p-5 space-y-5">
        <div>
          <div className="text-xs font-medium text-[#4A5D4E]">
            Mode &amp; Deal Setup
          </div>
          <h2 className="font-display text-2xl font-semibold text-[#18181B] mt-0.5">
            {game.title}
          </h2>
          <p className="text-sm text-[#71717A] mt-1">{game.subtitle}</p>
        </div>

        {/* Mode Selector */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setMode('fun')}
            className={`p-3.5 rounded-2xl border text-left transition ${
              mode === 'fun'
                ? 'bg-[#4A5D4E] border-[#4A5D4E] text-white'
                : 'bg-[#FAF8F5] border-[#E7E5E0] text-[#18181B]'
            }`}
          >
            <Smile className="w-5 h-5 mb-2" />
            <div className="text-sm font-semibold">Just for Fun</div>
            <div
              className={`text-xs mt-0.5 ${
                mode === 'fun' ? 'text-white/80' : 'text-[#71717A]'
              }`}
            >
              No stakes, jump right in
            </div>
          </button>

          <button
            type="button"
            onClick={() => setMode('deal')}
            className={`p-3.5 rounded-2xl border text-left transition ${
              mode === 'deal'
                ? 'bg-[#C26D4A] border-[#C26D4A] text-white'
                : 'bg-[#FAF8F5] border-[#E7E5E0] text-[#18181B]'
            }`}
          >
            <Handshake className="w-5 h-5 mb-2" />
            <div className="text-sm font-semibold">Friendly Deal</div>
            <div
              className={`text-xs mt-0.5 ${
                mode === 'deal' ? 'text-white/85' : 'text-[#71717A]'
              }`}
            >
              Honor-system stakes
            </div>
          </button>
        </div>

        {/* Friendly Deal Presets */}
        {mode === 'deal' && (
          <div className="space-y-2.5 pt-1">
            <div className="text-xs font-semibold text-[#18181B]">
              Choose what’s on the line
            </div>
            <div className="space-y-2">
              {DEAL_PRESETS.map((preset) => {
                const active = !isCustomDeal && selectedPreset === preset;
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      setIsCustomDeal(false);
                      setSelectedPreset(preset);
                    }}
                    className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border text-left text-sm font-medium flex items-center justify-between transition ${
                      active
                        ? 'bg-[#C26D4A]/10 border-[#C26D4A] text-[#8C4529]'
                        : 'bg-[#FAF8F5] border-[#E7E5E0] text-[#18181B]'
                    }`}
                  >
                    <span>{preset}</span>
                    {active && <Check className="w-4 h-4 text-[#C26D4A]" />}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => setIsCustomDeal(true)}
                className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border text-left text-sm font-medium flex items-center justify-between transition ${
                  isCustomDeal
                    ? 'bg-[#C26D4A]/10 border-[#C26D4A] text-[#8C4529]'
                    : 'bg-[#FAF8F5] border-[#E7E5E0] text-[#18181B]'
                }`}
              >
                <span>Custom Deal</span>
                {isCustomDeal && <Check className="w-4 h-4 text-[#C26D4A]" />}
              </button>

              {isCustomDeal && (
                <input
                  type="text"
                  maxLength={60}
                  autoFocus
                  placeholder="e.g., Loser buys 2 macchiatos"
                  value={customDealText}
                  onChange={(e) => setCustomDealText(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 rounded-xl bg-white border border-[#C26D4A] text-sm text-[#18181B] placeholder:text-[#A1A1AA] focus:outline-none focus:ring-2 focus:ring-[#C26D4A]/20"
                />
              )}
            </div>
          </div>
        )}

        <button
          type="button"
          disabled={mode === 'deal' && isCustomDeal && !customDealText.trim()}
          onClick={handleContinue}
          className={`w-full min-h-[50px] rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-45 active:scale-[0.985] transition ${
            mode === 'deal'
              ? 'bg-[#C26D4A] hover:bg-[#A65A3B]'
              : 'bg-[#4A5D4E] hover:bg-[#3B4B3F]'
          }`}
        >
          <span>
            {mode === 'deal' ? 'Continue to Handshake' : 'Start Game'}
          </span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
