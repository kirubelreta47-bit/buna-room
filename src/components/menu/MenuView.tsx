import { useState } from 'react';
import {
  Plus,
  Minus,
  Coffee,
  Flame,
  CupSoda,
  GlassWater,
  Sandwich,
  CakeSlice,
  Croissant,
  Utensils,
  Sparkles,
} from 'lucide-react';
import {
  MENU_CATEGORIES,
  MENU_ITEMS,
  SPIN_UNLOCK_THRESHOLD_ETB,
  type MenuCategory,
  type MenuItem,
} from '../../data/menu';
import { TRANSLATIONS, type Language } from '../../i18n/translations';

interface MenuViewProps {
  quantities: Record<string, number>;
  onIncrement: (itemId: string) => void;
  onDecrement: (itemId: string) => void;
  language: Language;
}

const HERO_IMAGE_SRC = '/src/assets/images/addis_buna_hero_1795697565728.jpg';

interface CategoryTheme {
  tileBg: string;
  tileText: string;
  tabActive: string;
  headerDot: string;
  priceActive: string;
}

const CATEGORY_THEMES: Record<MenuCategory, CategoryTheme> = {
  'Hot Drinks': {
    tileBg: 'bg-[#6F4E37]/12',
    tileText: 'text-[#5C3D28]',
    tabActive: 'bg-[#6F4E37] text-white',
    headerDot: 'bg-[#6F4E37]',
    priceActive: 'text-[#5C3D28]',
  },
  'Cold Drinks': {
    tileBg: 'bg-[#4A5D4E]/12',
    tileText: 'text-[#3B4B3F]',
    tabActive: 'bg-[#4A5D4E] text-white',
    headerDot: 'bg-[#4A5D4E]',
    priceActive: 'text-[#3B4B3F]',
  },
  'Snacks & Bites': {
    tileBg: 'bg-[#A67B5B]/18',
    tileText: 'text-[#7A5230]',
    tabActive: 'bg-[#8C6239] text-white',
    headerDot: 'bg-[#8C6239]',
    priceActive: 'text-[#7A5230]',
  },
};

function getItemIcon(item: MenuItem) {
  switch (item.id) {
    case 'macchiato':
    case 'buna':
    case 'spris-hot':
      return Coffee;
    case 'spiced-tea':
    case 'special-tea':
    case 'hot-milk':
      return Flame;
    case 'bottled-water':
      return GlassWater;
    case 'iced-coffee':
    case 'avocado-juice':
    case 'spris-juice':
    case 'iced-tea':
      return CupSoda;
    case 'club-sandwich':
    case 'egg-sandwich':
      return Sandwich;
    case 'cake-slice':
      return CakeSlice;
    case 'pastry':
      return Croissant;
    default:
      return Utensils;
  }
}

export function MenuView({
  quantities,
  onIncrement,
  onDecrement,
  language,
}: MenuViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory | 'All'>('All');
  const [heroError, setHeroError] = useState(false);
  const t = TRANSLATIONS[language];
  const currency = language === 'am' ? 'ብር' : 'ETB';

  const visibleCategories =
    selectedCategory === 'All' ? MENU_CATEGORIES : [selectedCategory];

  const popularItems = MENU_ITEMS.filter((i) => i.popular);
  const totalEtb = MENU_ITEMS.reduce(
    (sum, item) => sum + item.priceEtb * (quantities[item.id] ?? 0),
    0
  );
  const spinUnlocked = totalEtb >= SPIN_UNLOCK_THRESHOLD_ETB;
  const spinProgressPct = Math.min(
    100,
    (totalEtb / SPIN_UNLOCK_THRESHOLD_ETB) * 100
  );

  const renderItemCard = (item: MenuItem) => {
    const qty = quantities[item.id] ?? 0;
    const theme = CATEGORY_THEMES[item.category];
    const Icon = getItemIcon(item);

    return (
      <div
        key={item.id}
        className={`rounded-2xl border p-3.5 flex items-center justify-between gap-3 transition-all ${
          qty > 0
            ? 'bg-[#6F4E37]/[0.06] border-[#6F4E37] shadow-xs'
            : 'bg-white border-[#E7E5E0] hover:border-[#D6D3CD]'
        }`}
      >
        <button
          type="button"
          onClick={() => onIncrement(item.id)}
          className="flex-1 flex items-center gap-3 text-left min-w-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6F4E37] rounded-xl"
        >
          {/* Minimalist Coffee-Toned Icon Tile */}
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
              qty > 0
                ? 'bg-[#4E342E] text-white'
                : `${theme.tileBg} ${theme.tileText}`
            }`}
          >
            <Icon className="w-5 h-5" strokeWidth={2} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-2 flex-wrap">
              <h3 className="text-[15px] font-semibold text-[#18181B] leading-snug">
                {item.name}
              </h3>
              {item.popular && (
                <span className="text-[11px] font-semibold text-[#8C6239]">
                  ★ {t.menu.houseFavorite}
                </span>
              )}
            </div>

            <p className="text-xs text-[#71717A] leading-relaxed mt-0.5 line-clamp-1">
              {item.description}
            </p>

            <div
              className={`mt-1 text-[13px] font-bold font-mono-num ${
                qty > 0 ? 'text-[#4E342E]' : theme.priceActive
              }`}
            >
              {item.priceEtb} {currency}
            </div>
          </div>
        </button>

        <div className="shrink-0 flex items-center">
          {qty === 0 ? (
            <button
              type="button"
              onClick={() => onIncrement(item.id)}
              aria-label={`Add ${item.name} to bill`}
              className={`min-h-[42px] min-w-[42px] rounded-xl border border-[#E7E5E0] bg-[#FAF8F5] ${theme.tileText} hover:border-[#6F4E37] active:scale-[0.94] transition flex items-center justify-center`}
            >
              <Plus className="w-4 h-4" strokeWidth={2.4} />
            </button>
          ) : (
            <div className="flex items-center gap-1 bg-white border border-[#6F4E37]/40 rounded-xl p-0.5">
              <button
                type="button"
                onClick={() => onDecrement(item.id)}
                aria-label={`Remove one ${item.name}`}
                className="min-h-[36px] min-w-[36px] rounded-lg text-[#18181B] hover:bg-[#FAF8F5] active:scale-[0.94] transition flex items-center justify-center"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-6 text-center text-sm font-bold text-[#4E342E] font-mono-num">
                {qty}
              </span>
              <button
                type="button"
                onClick={() => onIncrement(item.id)}
                aria-label={`Add one more ${item.name}`}
                className="min-h-[36px] min-w-[36px] rounded-lg bg-[#4E342E] text-white hover:bg-[#3E2723] active:scale-[0.94] transition flex items-center justify-center"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="px-4 pt-4 pb-32 space-y-5">
      {/* Editorial Coffeehouse Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden border border-[#E7E5E0] bg-[#EAE5DC] aspect-[16/9]">
        {!heroError ? (
          <img
            src={HERO_IMAGE_SRC}
            alt="Ethiopian macchiato and traditional jebena buna on travertine stone"
            referrerPolicy="no-referrer"
            onError={() => setHeroError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#4E342E] to-[#2B1B17] flex items-center justify-center">
            <Coffee className="w-10 h-10 text-white/70" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/78 via-black/25 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <div className="text-[11px] font-medium text-[#E6CCB2] mb-0.5">
            {t.menu.heroTag}
          </div>
          <h1 className="font-display text-xl font-semibold leading-tight text-balance">
            {t.menu.heroHeadline}
          </h1>
        </div>
      </div>

      {/* Slim Coffee-Toned 800+ Spin Teaser / Live Progress */}
      <div
        className={`rounded-2xl border px-3.5 py-2.5 flex items-center gap-3 transition-colors ${
          spinUnlocked
            ? 'bg-[#6F4E37]/12 border-[#6F4E37]/45'
            : 'bg-white border-[#E7E5E0]'
        }`}
      >
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
            spinUnlocked
              ? 'bg-[#4E342E] text-white'
              : 'bg-[#6F4E37]/12 text-[#6F4E37]'
          }`}
        >
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 text-xs">
            <span
              className={`font-semibold truncate ${
                spinUnlocked ? 'text-[#4E342E]' : 'text-[#18181B]'
              }`}
            >
              {spinUnlocked
                ? t.menu.spinUnlockedShort
                : t.menu.spinProgressBanner(
                    Math.max(0, SPIN_UNLOCK_THRESHOLD_ETB - totalEtb)
                  )}
            </span>
            <span className="font-mono-num font-semibold text-[#71717A] shrink-0">
              {totalEtb}/{SPIN_UNLOCK_THRESHOLD_ETB}
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-[#E7E5E0] overflow-hidden mt-1.5">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                spinUnlocked ? 'bg-[#6F4E37]' : 'bg-[#4A5D4E]'
              }`}
              style={{ width: `${Math.max(4, spinProgressPct)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Category Filter Bar */}
      <div
        role="tablist"
        aria-label="Menu categories"
        className="flex items-center gap-2 overflow-x-auto pb-1 -mx-4 px-4"
      >
        {(['All', ...MENU_CATEGORIES] as const).map((cat) => {
          const active = selectedCategory === cat;
          const label =
            cat === 'All' ? t.menu.allCategory : t.menu.categories[cat];
          const activeCls =
            cat === 'All'
              ? 'bg-[#3E2723] text-white'
              : CATEGORY_THEMES[cat].tabActive;

          return (
            <button
              key={cat}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setSelectedCategory(cat)}
              className={`min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                active
                  ? activeCls
                  : 'bg-white text-[#52525B] border border-[#E7E5E0] hover:text-[#18181B]'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Quick-Spot House Favorites Horizontal Strip */}
      {selectedCategory === 'All' && (
        <section>
          <div className="flex items-baseline justify-between mb-2.5">
            <h2 className="font-display text-base font-semibold text-[#18181B] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#6F4E37]" />
              <span>{t.menu.houseFavorite}</span>
            </h2>
            <span className="text-xs text-[#71717A]">Tap to add</span>
          </div>

          <div className="flex gap-2.5 overflow-x-auto pb-1 -mx-4 px-4">
            {popularItems.map((item) => {
              const qty = quantities[item.id] ?? 0;
              const theme = CATEGORY_THEMES[item.category];
              const Icon = getItemIcon(item);

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onIncrement(item.id)}
                  className={`w-36 shrink-0 rounded-2xl border p-3 text-left transition active:scale-[0.97] ${
                    qty > 0
                      ? 'bg-[#4E342E] border-[#4E342E] text-white'
                      : 'bg-white border-[#E7E5E0] hover:border-[#6F4E37]/60 text-[#18181B]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2.5">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        qty > 0
                          ? 'bg-white/20 text-white'
                          : `${theme.tileBg} ${theme.tileText}`
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    {qty > 0 && (
                      <span className="text-xs font-bold font-mono-num bg-white text-[#4E342E] px-2 py-0.5 rounded-lg">
                        ×{qty}
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-semibold leading-tight truncate">
                    {item.name}
                  </div>
                  <div
                    className={`text-xs font-bold font-mono-num mt-1 ${
                      qty > 0 ? 'text-white/90' : theme.priceActive
                    }`}
                  >
                    {item.priceEtb} {currency}
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Coffee-Toned Menu Category Sections */}
      <div className="space-y-6">
        {visibleCategories.map((category) => {
          const items = MENU_ITEMS.filter((i) => i.category === category);
          const theme = CATEGORY_THEMES[category];

          return (
            <section key={category}>
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${theme.headerDot}`}
                  />
                  <h2 className="font-display text-lg font-semibold text-[#18181B]">
                    {t.menu.categories[category]}
                  </h2>
                </div>
                <span className="text-xs text-[#71717A] tabular-nums">
                  {t.menu.itemsCount(items.length)}
                </span>
              </div>

              <div className="space-y-2.5">{items.map(renderItemCard)}</div>
            </section>
          );
        })}
      </div>

      <p className="pt-2 text-center text-xs text-[#71717A]">
        {t.menu.footerNote}
      </p>
    </div>
  );
}
