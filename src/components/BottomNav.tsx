import { Coffee, Award, Gamepad2, Users } from 'lucide-react';
import { TRANSLATIONS, type Language } from '../i18n/translations';

export type AppTab = 'menu' | 'rewards' | 'play' | 'lounge';

interface BottomNavProps {
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  language: Language;
  hasRewardReady?: boolean;
  hasLoungeUnread?: boolean;
}

export function BottomNav({
  activeTab,
  onSelectTab,
  language,
  hasRewardReady = false,
  hasLoungeUnread = false,
}: BottomNavProps) {
  const t = TRANSLATIONS[language];

  const tabs: { id: AppTab; label: string; icon: typeof Coffee }[] = [
    { id: 'menu', label: t.nav.menu, icon: Coffee },
    { id: 'rewards', label: t.nav.rewards, icon: Award },
    { id: 'play', label: t.nav.play, icon: Gamepad2 },
    { id: 'lounge', label: t.nav.lounge, icon: Users },
  ];

  return (
    <nav
      aria-label="Primary navigation"
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-40 bg-white/95 backdrop-blur-md border-t border-[#E7E5E0] pb-safe"
    >
      <div className="grid grid-cols-4 h-15">
        {tabs.map(({ id, label, icon: Icon }) => {
          const active = activeTab === id;
          const showDot =
            (id === 'rewards' && hasRewardReady) ||
            (id === 'lounge' && hasLoungeUnread);
          return (
            <button
              key={id}
              type="button"
              onClick={() => onSelectTab(id)}
              aria-current={active ? 'page' : undefined}
              className={`relative flex flex-col items-center justify-center gap-1 min-h-[48px] transition-colors ${
                active
                  ? 'text-[#4A5D4E]'
                  : 'text-[#71717A] hover:text-[#18181B]'
              }`}
            >
              {active && (
                <span
                  aria-hidden="true"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[2.5px] rounded-b-full bg-[#4A5D4E]"
                />
              )}
              <span className="relative">
                <Icon
                  className="w-[21px] h-[21px]"
                  strokeWidth={active ? 2.25 : 1.75}
                />
                {showDot && (
                  <span
                    aria-label="Notification dot"
                    className="absolute -top-0.5 -right-1.5 w-2 h-2 rounded-full bg-[#C26D4A]"
                  />
                )}
              </span>
              <span
                className={`text-[11px] leading-none whitespace-nowrap ${
                  active ? 'font-semibold' : 'font-medium'
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
