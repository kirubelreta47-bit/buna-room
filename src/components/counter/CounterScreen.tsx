import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { ArrowLeft, Copy, Check, RefreshCw } from 'lucide-react';
import {
  generateRotatingToken,
  getSecondsRemainingInWindow,
  getWindowProgressFraction,
} from '../../utils/qrToken';
import { TRANSLATIONS, type Language } from '../../i18n/translations';

interface CounterScreenProps {
  language: Language;
  onBack: () => void;
  onNotify: (message: string) => void;
}

export function CounterScreen({
  language,
  onBack,
  onNotify,
}: CounterScreenProps) {
  const t = TRANSLATIONS[language];
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNowMs(Date.now());
    }, 250);
    return () => window.clearInterval(interval);
  }, []);

  const token = generateRotatingToken('STAMP', nowMs);
  const secondsLeft = getSecondsRemainingInWindow(nowMs);
  const progress = getWindowProgressFraction(nowMs);

  useEffect(() => {
    let active = true;
    QRCode.toDataURL(token.payload, {
      width: 280,
      margin: 2,
      color: {
        dark: '#18181B',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'M',
    })
      .then((url) => {
        if (active) setQrDataUrl(url);
      })
      .catch(() => {
        if (active) setQrDataUrl('');
      });
    return () => {
      active = false;
    };
  }, [token.payload]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(token.code);
      setCopied(true);
      onNotify(`Copied live Stamp code`);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      onNotify(`Code: ${token.code}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col">
      {/* Top Bar */}
      <div className="h-14 px-4 border-b border-[#E7E5E0] bg-white flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="min-h-[40px] px-2.5 -ml-2 rounded-xl text-sm font-medium text-[#18181B] hover:bg-[#FAF8F5] flex items-center gap-1.5 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.counter.backToCafe}</span>
        </button>
        <span className="text-xs font-semibold text-[#71717A]">
          {t.counter.cashierCounter}
        </span>
      </div>

      <div className="flex-1 px-4 py-6 flex flex-col justify-center">
        <div className="bg-white rounded-3xl border border-[#E7E5E0] p-6 flex flex-col items-center text-center">
          <div className="text-xs font-semibold mb-1 text-[#4A5D4E]">
            {t.counter.stampLabel}
          </div>
          <h1 className="font-display text-xl font-semibold text-[#18181B] mb-5">
            {t.counter.scanForStampTitle}
          </h1>

          {/* Crisp QR Frame */}
          <div className="p-3 rounded-2xl border border-[#E7E5E0] bg-white mb-5">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="Rotating Stamp QR code"
                className="w-56 h-56 block"
              />
            ) : (
              <div className="w-56 h-56 flex items-center justify-center text-xs text-[#71717A]">
                Generating QR…
              </div>
            )}
          </div>

          {/* 6-character Rotating Code */}
          <div className="text-xs text-[#71717A] mb-1.5">
            {t.counter.manualCodeLabel}
          </div>
          <div className="flex items-center gap-2 mb-5">
            <div className="px-4 py-2 rounded-xl bg-[#FAF8F5] border border-[#E7E5E0] font-mono-num text-2xl font-semibold tracking-[0.22em] text-[#18181B]">
              {token.code}
            </div>
            <button
              type="button"
              onClick={handleCopyCode}
              aria-label="Copy 6-character rotating code"
              className="min-h-[48px] min-w-[48px] rounded-xl border border-[#E7E5E0] bg-white hover:bg-[#FAF8F5] text-[#18181B] flex items-center justify-center transition"
            >
              {copied ? (
                <Check className="w-4 h-4 text-[#4A5D4E]" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* 60-Second Countdown Bar */}
          <div className="w-full max-w-xs">
            <div className="flex items-center justify-between text-xs text-[#71717A] mb-1.5">
              <span className="flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{t.counter.autoRotates}</span>
              </span>
              <span className="font-mono-num font-semibold text-[#18181B]">
                {secondsLeft}s
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-[#E7E5E0] overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-200 ${
                  secondsLeft <= 10 ? 'bg-[#C26D4A]' : 'bg-[#4A5D4E]'
                }`}
                style={{ width: `${Math.max(2, progress * 100)}%` }}
              />
            </div>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-[#71717A] leading-relaxed">
          {t.counter.helperNote}
        </p>
      </div>
    </div>
  );
}
