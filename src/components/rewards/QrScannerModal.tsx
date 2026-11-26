import { useEffect, useRef, useState, type FormEvent } from 'react';
import jsQR from 'jsqr';
import { X, Camera, Keyboard, AlertCircle, CheckCircle2 } from 'lucide-react';
import {
  validateRotatingToken,
  type QrTokenType,
  type TokenValidationResult,
} from '../../utils/qrToken';

interface QrScannerModalProps {
  open: boolean;
  expectedType: QrTokenType;
  onClose: () => void;
  onValidScan: (result: Required<Pick<TokenValidationResult, 'type' | 'bucket' | 'code'>>) => Promise<string | null>;
}

export function QrScannerModal({
  open,
  expectedType,
  onClose,
  onValidScan,
}: QrScannerModalProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const scanLockedRef = useRef(false);

  const [cameraState, setCameraState] = useState<'starting' | 'active' | 'unavailable'>('starting');
  const [manualCode, setManualCode] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const processPayload = async (raw: string) => {
    if (scanLockedRef.current || processing) return;
    setErrorMsg(null);

    const validation = validateRotatingToken(raw, expectedType);
    if (!validation.valid || !validation.type || validation.bucket === undefined || !validation.code) {
      setErrorMsg(validation.reason ?? 'Invalid or expired code.');
      return;
    }

    scanLockedRef.current = true;
    setProcessing(true);
    try {
      const storeError = await onValidScan({
        type: validation.type,
        bucket: validation.bucket,
        code: validation.code,
      });
      if (storeError) {
        setErrorMsg(storeError);
        scanLockedRef.current = false;
      } else {
        setManualCode('');
      }
    } finally {
      setProcessing(false);
    }
  };

  useEffect(() => {
    if (!open) {
      scanLockedRef.current = false;
      setErrorMsg(null);
      setManualCode('');
      return;
    }

    let stopped = false;
    let stream: MediaStream | null = null;
    let rafId = 0;

    const startCamera = async () => {
      setCameraState('starting');
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraState('unavailable');
        return;
      }

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false,
        });
        if (stopped) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        await video.play();
        setCameraState('active');

        const scanFrame = () => {
          if (stopped) return;
          const v = videoRef.current;
          const c = canvasRef.current;
          if (v && c && v.readyState === v.HAVE_ENOUGH_DATA && !scanLockedRef.current) {
            const width = v.videoWidth;
            const height = v.videoHeight;
            if (width > 0 && height > 0) {
              c.width = width;
              c.height = height;
              const ctx = c.getContext('2d', { willReadFrequently: true });
              if (ctx) {
                ctx.drawImage(v, 0, 0, width, height);
                const imgData = ctx.getImageData(0, 0, width, height);
                const decoded = jsQR(imgData.data, width, height, {
                  inversionAttempts: 'dontInvert',
                });
                if (decoded?.data) {
                  void processPayload(decoded.data);
                }
              }
            }
          }
          rafId = requestAnimationFrame(scanFrame);
        };
        rafId = requestAnimationFrame(scanFrame);
      } catch {
        if (!stopped) {
          setCameraState('unavailable');
        }
      }
    };

    void startCamera();

    return () => {
      stopped = true;
      cancelAnimationFrame(rafId);
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [open, expectedType]);

  if (!open) return null;

  const isSpin = expectedType === 'SPIN';

  const handleManualSubmit = (e: FormEvent) => {
    e.preventDefault();
    void processPayload(manualCode);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/55 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-label={isSpin ? 'Scan 800+ Spin QR' : 'Scan Stamp QR'}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[#FAF8F5] rounded-t-3xl sm:rounded-3xl border border-[#E7E5E0] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 bg-white border-b border-[#E7E5E0] flex items-center justify-between">
          <div>
            <div
              className={`text-xs font-semibold ${
                isSpin ? 'text-[#C26D4A]' : 'text-[#4A5D4E]'
              }`}
            >
              {isSpin ? '800+ ETB Spin to Win' : 'Loyalty Punch Card'}
            </div>
            <h2 className="font-display text-lg font-semibold text-[#18181B]">
              {isSpin ? 'Scan Cashier Spin QR' : 'Scan Cashier Stamp QR'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close scanner"
            className="min-h-[40px] min-w-[40px] rounded-xl flex items-center justify-center text-[#71717A] hover:text-[#18181B]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Camera Viewport */}
          <div className="relative rounded-2xl overflow-hidden bg-[#18181B] aspect-[4/3] flex items-center justify-center">
            <video
              ref={videoRef}
              playsInline
              muted
              className={`w-full h-full object-cover ${
                cameraState === 'active' ? 'opacity-100' : 'opacity-0'
              }`}
            />
            <canvas ref={canvasRef} className="hidden" />

            {cameraState === 'active' && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="w-44 h-44 rounded-2xl border-2 border-white/90 shadow-[0_0_0_999px_rgba(0,0,0,0.42)]" />
              </div>
            )}

            {cameraState === 'starting' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white/80 gap-2 px-6 text-center">
                <Camera className="w-6 h-6" />
                <span className="text-xs">Opening camera…</span>
              </div>
            )}

            {cameraState === 'unavailable' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white/80 gap-2 px-6 text-center">
                <Camera className="w-6 h-6 text-white/60" />
                <p className="text-xs leading-relaxed">
                  Camera unavailable or permission declined. Type or paste the
                  cashier’s 6-character code below instead.
                </p>
              </div>
            )}
          </div>

          {errorMsg && (
            <div
              role="alert"
              className="rounded-xl bg-[#C26D4A]/10 border border-[#C26D4A]/30 px-3.5 py-2.5 flex items-start gap-2 text-xs text-[#8C4529]"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#C26D4A]" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Manual / Desktop Test Fallback */}
          <form
            onSubmit={handleManualSubmit}
            className="bg-white rounded-2xl border border-[#E7E5E0] p-3.5 space-y-2.5"
          >
            <label
              htmlFor="manual-qr-code"
              className="flex items-center gap-1.5 text-xs font-semibold text-[#18181B]"
            >
              <Keyboard className="w-3.5 h-3.5 text-[#71717A]" />
              <span>Test / Paste Code</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                id="manual-qr-code"
                type="text"
                autoCapitalize="characters"
                autoCorrect="off"
                spellCheck={false}
                placeholder="6-char code (from Counter)"
                value={manualCode}
                onChange={(e) => {
                  setManualCode(e.target.value.toUpperCase());
                  if (errorMsg) setErrorMsg(null);
                }}
                className="flex-1 min-h-[44px] px-3 rounded-xl bg-[#FAF8F5] border border-[#E7E5E0] text-sm font-mono-num uppercase tracking-wider text-[#18181B] placeholder:normal-case placeholder:tracking-normal placeholder:font-sans placeholder:text-[#A1A1AA] focus:outline-none focus:border-[#4A5D4E]"
              />
              <button
                type="submit"
                disabled={processing || !manualCode.trim()}
                className={`min-h-[44px] px-4 rounded-xl text-xs font-semibold text-white whitespace-nowrap shrink-0 disabled:opacity-45 active:scale-[0.97] transition flex items-center gap-1.5 ${
                  isSpin
                    ? 'bg-[#C26D4A] hover:bg-[#A65A3B]'
                    : 'bg-[#4A5D4E] hover:bg-[#3B4B3F]'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verify</span>
              </button>
            </div>
            <p className="text-[11px] text-[#71717A]">
              Tip: Open the top-right lock icon to view the live 60s Counter code
              on desktop.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
