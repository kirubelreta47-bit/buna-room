import { useState, type FormEvent } from 'react';
import { X, ArrowRight, Phone, User } from 'lucide-react';
import {
  loyaltyStore,
  normalizeEthiopianPhone,
  formatPhoneDisplay,
  type LoyaltyCustomer,
} from '../../services/loyaltyStore';

interface PhoneAuthSheetProps {
  open: boolean;
  reasonText: string;
  onClose: () => void;
  onAuthenticated: (customer: LoyaltyCustomer) => void;
}

export function PhoneAuthSheet({
  open,
  reasonText,
  onClose,
  onAuthenticated,
}: PhoneAuthSheetProps) {
  const [phoneInput, setPhoneInput] = useState('');
  const [step, setStep] = useState<'phone' | 'name'>('phone');
  const [normalizedPhone, setNormalizedPhone] = useState('');
  const [firstName, setFirstName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const resetAndClose = () => {
    setPhoneInput('');
    setStep('phone');
    setNormalizedPhone('');
    setFirstName('');
    setError(null);
    onClose();
  };

  const handlePhoneSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const result = normalizeEthiopianPhone(phoneInput);
    if (!result.valid) {
      setError(result.error ?? 'Enter a valid Ethiopian phone number.');
      return;
    }

    setSubmitting(true);
    try {
      const existing = await loyaltyStore.findByPhone(result.normalized);
      if (existing) {
        await loyaltyStore.setCurrentPhone(existing.phone);
        setPhoneInput('');
        setStep('phone');
        onAuthenticated(existing);
      } else {
        setNormalizedPhone(result.normalized);
        setStep('name');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateAccount = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanedName = firstName.trim();
    if (cleanedName.length < 2) {
      setError('Please enter your first name (at least 2 letters).');
      return;
    }

    setSubmitting(true);
    try {
      const created = await loyaltyStore.createCustomer(
        normalizedPhone,
        cleanedName
      );
      setPhoneInput('');
      setFirstName('');
      setStep('phone');
      onAuthenticated(created);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-label="Quick Phone Sign-In"
      onClick={resetAndClose}
    >
      <div
        className="w-full max-w-md bg-[#FAF8F5] rounded-t-3xl border-t border-[#E7E5E0] p-5 pb-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 rounded-full bg-[#D6D3CD] mx-auto mb-4" />

        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h2 className="font-display text-xl font-semibold text-[#18181B]">
              {step === 'phone' ? 'Unlock Your Card' : 'Welcome to Buna Room'}
            </h2>
            <p className="text-xs text-[#71717A] mt-0.5">{reasonText}</p>
          </div>
          <button
            type="button"
            onClick={resetAndClose}
            aria-label="Close sign in"
            className="min-h-[40px] min-w-[40px] rounded-xl flex items-center justify-center text-[#71717A] hover:text-[#18181B]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 'phone' ? (
          <form onSubmit={handlePhoneSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="eth-phone"
                className="block text-xs font-semibold text-[#18181B] mb-1.5"
              >
                Phone number (No OTP, no password)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#71717A] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="eth-phone"
                  type="tel"
                  inputMode="tel"
                  autoFocus
                  autoComplete="tel"
                  placeholder="0911 22 33 44 or +251 9..."
                  value={phoneInput}
                  onChange={(e) => {
                    setPhoneInput(e.target.value);
                    if (error) setError(null);
                  }}
                  className="w-full min-h-[48px] pl-10 pr-4 rounded-xl bg-white border border-[#E7E5E0] text-base font-mono-num text-[#18181B] placeholder:text-[#A1A1AA] placeholder:font-sans focus:outline-none focus:border-[#4A5D4E] focus:ring-2 focus:ring-[#4A5D4E]/15"
                />
              </div>
              <p className="text-[11px] text-[#71717A] mt-1.5">
                Supports 09…, 07…, 9…, 7…, or +251 formats automatically.
              </p>
            </div>

            {error && (
              <p role="alert" className="text-xs font-medium text-[#C26D4A]">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting || !phoneInput.trim()}
              className="w-full min-h-[48px] rounded-xl bg-[#4A5D4E] hover:bg-[#3B4B3F] disabled:opacity-45 text-white text-sm font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleCreateAccount} className="space-y-4">
            <div className="px-3.5 py-2.5 rounded-xl bg-white border border-[#E7E5E0] flex items-center justify-between text-xs">
              <span className="text-[#71717A]">Saved number</span>
              <div className="flex items-center gap-2">
                <span className="font-mono-num font-semibold text-[#18181B]">
                  {formatPhoneDisplay(normalizedPhone)}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setStep('phone');
                    setError(null);
                  }}
                  className="text-[#4A5D4E] font-medium hover:underline"
                >
                  Edit
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="first-name"
                className="block text-xs font-semibold text-[#18181B] mb-1.5"
              >
                Your First Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#71717A] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="first-name"
                  type="text"
                  autoFocus
                  autoComplete="given-name"
                  maxLength={24}
                  placeholder="e.g., Dawit, Meron, Abel"
                  value={firstName}
                  onChange={(e) => {
                    setFirstName(e.target.value);
                    if (error) setError(null);
                  }}
                  className="w-full min-h-[48px] pl-10 pr-4 rounded-xl bg-white border border-[#E7E5E0] text-base text-[#18181B] placeholder:text-[#A1A1AA] focus:outline-none focus:border-[#4A5D4E] focus:ring-2 focus:ring-[#4A5D4E]/15"
                />
              </div>
              <p className="text-[11px] text-[#71717A] mt-1.5">
                Shown on your Free Drink &amp; Spin tickets at the counter.
              </p>
            </div>

            {error && (
              <p role="alert" className="text-xs font-medium text-[#C26D4A]">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting || !firstName.trim()}
              className="w-full min-h-[48px] rounded-xl bg-[#4A5D4E] hover:bg-[#3B4B3F] disabled:opacity-45 text-white text-sm font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition"
            >
              <span>Start My Card</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
