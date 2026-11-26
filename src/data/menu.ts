export type MenuCategory = 'Hot Drinks' | 'Cold Drinks' | 'Snacks & Bites';

export interface MenuItem {
  id: string;
  name: string;
  amharicNote?: string;
  description: string;
  priceEtb: number;
  category: MenuCategory;
  popular?: boolean;
}

export const MENU_CATEGORIES: MenuCategory[] = [
  'Hot Drinks',
  'Cold Drinks',
  'Snacks & Bites',
];

export const SPIN_UNLOCK_THRESHOLD_ETB = 800;

export const PAYMENT_ACCOUNTS = [
  {
    id: 'cbe',
    provider: 'CBE',
    accountName: 'Buna Room Cafe',
    accountNumber: '1000123456789',
    note: 'Commercial Bank of Ethiopia',
  },
  {
    id: 'telebirr',
    provider: 'Telebirr',
    accountName: 'Buna Room Cafe',
    accountNumber: '0911223344',
    note: 'Instant mobile transfer',
  },
] as const;

export const MENU_ITEMS: MenuItem[] = [
  // Hot Drinks
  {
    id: 'macchiato',
    name: 'Macchiato',
    description: 'Rich Ethiopian espresso stained with velvety steamed milk.',
    priceEtb: 70,
    category: 'Hot Drinks',
    popular: true,
  },
  {
    id: 'buna',
    name: 'Buna',
    description: 'Traditional jebena-brewed dark roast, served hot in a finjal.',
    priceEtb: 50,
    category: 'Hot Drinks',
    popular: true,
  },
  {
    id: 'spiced-tea',
    name: 'Tea',
    description: 'Freshly steeped black tea with cinnamon and clove notes.',
    priceEtb: 40,
    category: 'Hot Drinks',
  },
  {
    id: 'special-tea',
    name: 'Special Tea',
    description: 'House ginger, lemon, and honey infusion brewed to order.',
    priceEtb: 60,
    category: 'Hot Drinks',
    popular: true,
  },
  {
    id: 'spris-hot',
    name: 'Hot Spris',
    description: 'Layered half-tea, half-buna classic poured gently over glass.',
    priceEtb: 60,
    category: 'Hot Drinks',
  },
  {
    id: 'hot-milk',
    name: 'Spiced Milk',
    description: 'Warm steamed milk with a pinch of cardamom.',
    priceEtb: 65,
    category: 'Hot Drinks',
  },

  // Cold Drinks
  {
    id: 'iced-coffee',
    name: 'Iced Coffee',
    description: 'Double espresso shaken over ice with cold milk and light syrup.',
    priceEtb: 140,
    category: 'Cold Drinks',
    popular: true,
  },
  {
    id: 'avocado-juice',
    name: 'Avocado Juice',
    description: 'Thick fresh-blended highland avocado served with lime.',
    priceEtb: 180,
    category: 'Cold Drinks',
    popular: true,
  },
  {
    id: 'spris-juice',
    name: 'Spris Juice',
    description: 'Layered mango, papaya, and avocado fresh fruit blend.',
    priceEtb: 190,
    category: 'Cold Drinks',
  },
  {
    id: 'iced-tea',
    name: 'Iced Lemon Tea',
    description: 'Chilled black tea shaken with fresh Addis lime and mint.',
    priceEtb: 90,
    category: 'Cold Drinks',
  },
  {
    id: 'bottled-water',
    name: 'Bottled Water',
    description: 'Chilled 500ml highland still spring water.',
    priceEtb: 40,
    category: 'Cold Drinks',
  },

  // Snacks & Bites
  {
    id: 'club-sandwich',
    name: 'Club Sandwich',
    description: 'Toasted triple-layer with egg, seasoned chicken, tomato, and house sauce.',
    priceEtb: 320,
    category: 'Snacks & Bites',
    popular: true,
  },
  {
    id: 'chechebsa',
    name: 'Chechebsa',
    description: 'Pan-tossed shredded flatbread with berbere spiced butter and honey.',
    priceEtb: 280,
    category: 'Snacks & Bites',
    popular: true,
  },
  {
    id: 'egg-sandwich',
    name: 'Spiced Egg Roll',
    description: 'Warm crusty roll with herb omelette, green chili, and onion.',
    priceEtb: 150,
    category: 'Snacks & Bites',
  },
  {
    id: 'cake-slice',
    name: 'Cake Slice',
    description: 'Daily baked sponge cake slice from the counter display.',
    priceEtb: 160,
    category: 'Snacks & Bites',
  },
  {
    id: 'pastry',
    name: 'Pastry',
    description: 'Flaky warm croissant or cinnamon danish baked each morning.',
    priceEtb: 90,
    category: 'Snacks & Bites',
  },
  {
    id: 'sambusa-pair',
    name: 'Lentil Sambusa (2 pcs)',
    description: 'Crisp golden pastry triangles filled with spiced red lentils.',
    priceEtb: 80,
    category: 'Snacks & Bites',
  },
];
