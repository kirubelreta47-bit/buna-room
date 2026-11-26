import type { QrTokenType } from '../utils/qrToken';

export interface LoyaltyCustomer {
  phone: string; // Normalized 10-digit Ethiopian number: 09XXXXXXXX or 07XXXXXXXX
  firstName: string;
  stamps: number; // 0..7
  totalStampsEarned: number;
  freeDrinksRedeemed: number;
  spinsCompleted: number;
  createdAt: string;
  updatedAt: string;
}

export interface NormalizedPhoneResult {
  valid: boolean;
  normalized: string;
  error?: string;
}

/**
 * Normalizes Ethiopian mobile numbers into a canonical 10-digit format:
 * - Strips spaces, dashes, parentheses
 * - +2519XXXXXXXX / 2519XXXXXXXX / 9XXXXXXXX -> 09XXXXXXXX
 * - +2517XXXXXXXX / 2517XXXXXXXX / 7XXXXXXXX -> 07XXXXXXXX
 */
export function normalizeEthiopianPhone(raw: string): NormalizedPhoneResult {
  const digitsAndPlus = raw.replace(/[\s\-().]/g, '');
  let digits = digitsAndPlus.startsWith('+')
    ? digitsAndPlus.slice(1)
    : digitsAndPlus;

  if (!/^\d+$/.test(digits)) {
    return {
      valid: false,
      normalized: '',
      error: 'Enter digits only (e.g., 0911 22 33 44).',
    };
  }

  if (digits.startsWith('251')) {
    digits = `0${digits.slice(3)}`;
  } else if (
    digits.length === 9 &&
    (digits.startsWith('9') || digits.startsWith('7'))
  ) {
    digits = `0${digits}`;
  }

  if (
    digits.length === 10 &&
    (digits.startsWith('09') || digits.startsWith('07'))
  ) {
    return { valid: true, normalized: digits };
  }

  return {
    valid: false,
    normalized: '',
    error: 'Use a valid Ethiopian number (09... or 07..., 10 digits).',
  };
}

export function formatPhoneDisplay(phone: string): string {
  if (phone.length !== 10) return phone;
  return `${phone.slice(0, 4)} ${phone.slice(4, 7)} ${phone.slice(7)}`;
}

/**
 * Clean async interface so localStorage can be swapped for Supabase later
 * without changing UI components.
 */
export interface LoyaltyStore {
  getCurrentPhone(): Promise<string | null>;
  setCurrentPhone(phone: string | null): Promise<void>;
  findByPhone(phone: string): Promise<LoyaltyCustomer | null>;
  createCustomer(phone: string, firstName: string): Promise<LoyaltyCustomer>;
  addStamps(phone: string, amount: number): Promise<LoyaltyCustomer>;
  redeemFreeDrink(phone: string): Promise<LoyaltyCustomer>;
  recordSpin(phone: string): Promise<LoyaltyCustomer>;
  isTokenUsed(phone: string, type: QrTokenType, bucket: number): Promise<boolean>;
  markTokenUsed(phone: string, type: QrTokenType, bucket: number): Promise<void>;
}

const CUSTOMERS_KEY = 'buna_room_customers_v1';
const ACTIVE_PHONE_KEY = 'buna_room_active_phone_v1';
const USED_TOKENS_KEY = 'buna_room_used_tokens_v1';
export const STAMPS_FOR_FREE_DRINK = 7;

function readCustomersMap(): Record<string, LoyaltyCustomer> {
  try {
    const raw = localStorage.getItem(CUSTOMERS_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, LoyaltyCustomer>;
  } catch {
    return {};
  }
}

function writeCustomersMap(map: Record<string, LoyaltyCustomer>): void {
  localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(map));
}

function readUsedTokens(): string[] {
  try {
    const raw = localStorage.getItem(USED_TOKENS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

function writeUsedTokens(tokens: string[]): void {
  // Keep only the latest 100 entries to prevent unbounded growth
  localStorage.setItem(USED_TOKENS_KEY, JSON.stringify(tokens.slice(-100)));
}

class LocalStorageLoyaltyStore implements LoyaltyStore {
  async getCurrentPhone(): Promise<string | null> {
    return localStorage.getItem(ACTIVE_PHONE_KEY);
  }

  async setCurrentPhone(phone: string | null): Promise<void> {
    if (phone) {
      localStorage.setItem(ACTIVE_PHONE_KEY, phone);
    } else {
      localStorage.removeItem(ACTIVE_PHONE_KEY);
    }
  }

  async findByPhone(phone: string): Promise<LoyaltyCustomer | null> {
    const map = readCustomersMap();
    return map[phone] ?? null;
  }

  async createCustomer(
    phone: string,
    firstName: string
  ): Promise<LoyaltyCustomer> {
    const map = readCustomersMap();
    const now = new Date().toISOString();
    const trimmedName = firstName.trim();

    const customer: LoyaltyCustomer = {
      phone,
      firstName: trimmedName,
      stamps: 0,
      totalStampsEarned: 0,
      freeDrinksRedeemed: 0,
      spinsCompleted: 0,
      createdAt: now,
      updatedAt: now,
    };

    map[phone] = customer;
    writeCustomersMap(map);
    await this.setCurrentPhone(phone);
    return customer;
  }

  async addStamps(phone: string, amount: number): Promise<LoyaltyCustomer> {
    const map = readCustomersMap();
    const existing = map[phone];
    if (!existing) {
      throw new Error('Customer record not found.');
    }

    const updated: LoyaltyCustomer = {
      ...existing,
      stamps: Math.min(STAMPS_FOR_FREE_DRINK, existing.stamps + amount),
      totalStampsEarned: existing.totalStampsEarned + amount,
      updatedAt: new Date().toISOString(),
    };

    map[phone] = updated;
    writeCustomersMap(map);
    return updated;
  }

  async redeemFreeDrink(phone: string): Promise<LoyaltyCustomer> {
    const map = readCustomersMap();
    const existing = map[phone];
    if (!existing) {
      throw new Error('Customer record not found.');
    }

    const updated: LoyaltyCustomer = {
      ...existing,
      stamps: 0,
      freeDrinksRedeemed: existing.freeDrinksRedeemed + 1,
      updatedAt: new Date().toISOString(),
    };

    map[phone] = updated;
    writeCustomersMap(map);
    return updated;
  }

  async recordSpin(phone: string): Promise<LoyaltyCustomer> {
    const map = readCustomersMap();
    const existing = map[phone];
    if (!existing) {
      throw new Error('Customer record not found.');
    }

    const updated: LoyaltyCustomer = {
      ...existing,
      spinsCompleted: existing.spinsCompleted + 1,
      updatedAt: new Date().toISOString(),
    };

    map[phone] = updated;
    writeCustomersMap(map);
    return updated;
  }

  async isTokenUsed(
    phone: string,
    type: QrTokenType,
    bucket: number
  ): Promise<boolean> {
    const key = `${phone}:${type}:${bucket}`;
    return readUsedTokens().includes(key);
  }

  async markTokenUsed(
    phone: string,
    type: QrTokenType,
    bucket: number
  ): Promise<void> {
    const key = `${phone}:${type}:${bucket}`;
    const existing = readUsedTokens();
    if (!existing.includes(key)) {
      writeUsedTokens([...existing, key]);
    }
  }
}

export const loyaltyStore: LoyaltyStore = new LocalStorageLoyaltyStore();
