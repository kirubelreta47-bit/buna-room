import { Lock, Languages } from 'lucide-react';
import { TRANSLATIONS, type Language } from '../i18n/translations';

interface HeaderProps {
  language: Language;
  onToggleLanguage: () => void;
  onOpenCounter: () => void;
}

export function Header({
  language,
  onToggleLanguage,
  onOpenCounter,
}: HeaderProps) {
  const t = TRANSLATIONS[language];

  return (
    <header className="sticky top-0 z-30 h-14 px-4 bg-[#FAF8F5]/92 backdrop-blur-md border-b border-[#E7E5E0] flex items-center justify-between gap-3">
      <div className="font-display text-[1.2rem] font-semibold tracking-tight text-[#18181B] whitespace-nowrap shrink-0">
        {t.brandName}
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={onToggleLanguage}
          aria-label={t.header.switchLangAria}
          className="min-h-[38px] px-2.5 py-1.5 rounded-lg border border-[#E7E5E0] bg-white text-xs font-semibold text-[#18181B] hover:border-[#4A5D4E]/50 active:scale-[0.98] transition flex items-center gap-1.5 whitespace-nowrap shrink-0"
        >
          <Languages className="w-3.5 h-3.5 text-[#4A5D4E]" />
          <span className={language === 'en' ? 'text-[#4A5D4E]' : 'text-[#71717A]'}>
            EN
          </span>
          <span className="text-[#D6D3CD]">/</span>
          <span className={language === 'am' ? 'text-[#4A5D4E]' : 'text-[#71717A]'}>
            አማ
          </span>
        </button>

        <button
          type="button"
          onClick={onOpenCounter}
          title={t.header.cashierCounterTitle}
          aria-label={t.header.cashierCounterTitle}
          className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-[#71717A] hover:text-[#18181B] hover:bg-[#E7E5E0]/50 active:scale-[0.96] transition"
        >
          <Lock className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
