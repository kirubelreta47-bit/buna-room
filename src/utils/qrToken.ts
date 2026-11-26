export type QrTokenType = 'STAMP' | 'SPIN';

export interface RotatingQrToken {
  type: QrTokenType;
  code: string;
  payload: string;
  bucket: number;
  expiresAtMs: number;
}

export interface TokenValidationResult {
  valid: boolean;
  type?: QrTokenType;
  bucket?: number;
  code?: string;
  reason?: string;
}

const WINDOW_SECONDS = 60;
const GRACE_SECONDS = 10;
const CAFE_SALT = 'BUNA_ROOM_ADDIS_2026_V1';
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function hashStringToUint32(input: string, seed = 2166136261): number {
  let h = seed >>> 0;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  // Final avalanche mix
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b) >>> 0;
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35) >>> 0;
  h ^= h >>> 16;
  return h >>> 0;
}

export function getTimeBucket(nowMs = Date.now()): number {
  return Math.floor(nowMs / (WINDOW_SECONDS * 1000));
}

export function getSecondsRemainingInWindow(nowMs = Date.now()): number {
  const elapsedInWindowMs = nowMs % (WINDOW_SECONDS * 1000);
  const remainingMs = WINDOW_SECONDS * 1000 - elapsedInWindowMs;
  return Math.max(0, Math.ceil(remainingMs / 1000));
}

export function getWindowProgressFraction(nowMs = Date.now()): number {
  const elapsedInWindowMs = nowMs % (WINDOW_SECONDS * 1000);
  return Math.max(0, Math.min(1, 1 - elapsedInWindowMs / (WINDOW_SECONDS * 1000)));
}

export function computeCodeForBucket(type: QrTokenType, bucket: number): string {
  const raw = `${CAFE_SALT}:${type}:${bucket}`;
  let h1 = hashStringToUint32(raw, 2166136261);
  let h2 = hashStringToUint32(`${bucket}:${type}:${CAFE_SALT}`, 3735928559);

  let code = '';
  for (let i = 0; i < 6; i++) {
    const val = i < 3 ? h1 : h2;
    const shift = (i % 3) * 5;
    const idx = (val >>> shift) % ALPHABET.length;
    code += ALPHABET[idx];
    if (i < 3) {
      h1 = hashStringToUint32(`${h1}:${i}`, h1);
    } else {
      h2 = hashStringToUint32(`${h2}:${i}`, h2);
    }
  }
  return code;
}

export function generateRotatingToken(
  type: QrTokenType,
  nowMs = Date.now()
): RotatingQrToken {
  const bucket = getTimeBucket(nowMs);
  const code = computeCodeForBucket(type, bucket);
  return {
    type,
    code,
    payload: `BUNA:${type}:${code}`,
    bucket,
    expiresAtMs: (bucket + 1) * WINDOW_SECONDS * 1000,
  };
}

/**
 * Validates either a scanned QR payload ("BUNA:STAMP:ABC123")
 * or a manually typed 6-character code ("ABC123").
 * Accepts the active 60s window plus a brief 10s grace period on the previous window.
 */
export function validateRotatingToken(
  rawInput: string,
  expectedType?: QrTokenType,
  nowMs = Date.now()
): TokenValidationResult {
  const cleaned = rawInput.trim().toUpperCase().replace(/\s+/g, '');
  if (!cleaned) {
    return { valid: false, reason: 'Please enter or scan a code.' };
  }

  let parsedType: QrTokenType | undefined;
  let candidateCode = cleaned;

  if (cleaned.startsWith('BUNA:')) {
    const parts = cleaned.split(':');
    if (parts.length !== 3) {
      return { valid: false, reason: 'Unrecognized QR format.' };
    }
    if (parts[1] !== 'STAMP' && parts[1] !== 'SPIN') {
      return { valid: false, reason: 'Invalid QR token type.' };
    }
    parsedType = parts[1];
    candidateCode = parts[2];
  } else {
    candidateCode = cleaned.replace(/-/g, '');
  }

  if (expectedType && parsedType && parsedType !== expectedType) {
    return {
      valid: false,
      reason:
        expectedType === 'STAMP'
          ? 'This is a Spin QR code. Scan a Stamp QR instead.'
          : 'This is a Stamp QR code. Ask the cashier for the 800+ Spin QR.',
    };
  }

  const currentBucket = getTimeBucket(nowMs);
  const secondsIntoCurrentBucket = (nowMs % (WINDOW_SECONDS * 1000)) / 1000;
  const bucketsToCheck =
    secondsIntoCurrentBucket <= GRACE_SECONDS
      ? [currentBucket, currentBucket - 1]
      : [currentBucket];

  const typesToCheck: QrTokenType[] = expectedType
    ? [expectedType]
    : parsedType
      ? [parsedType]
      : ['STAMP', 'SPIN'];

  for (const type of typesToCheck) {
    for (const bucket of bucketsToCheck) {
      const expectedCode = computeCodeForBucket(type, bucket);
      if (candidateCode === expectedCode) {
        return {
          valid: true,
          type,
          bucket,
          code: expectedCode,
        };
      }
    }
  }

  // Helpful feedback if user entered the other type's valid code manually
  if (expectedType && !parsedType) {
    const otherType: QrTokenType = expectedType === 'STAMP' ? 'SPIN' : 'STAMP';
    for (const bucket of bucketsToCheck) {
      if (candidateCode === computeCodeForBucket(otherType, bucket)) {
        return {
          valid: false,
          reason:
            expectedType === 'STAMP'
              ? 'That code is for Spin to Win. Ask the cashier for the Stamp code.'
              : 'That code is for a Loyalty Stamp. Ask the cashier for the 800+ Spin code.',
        };
      }
    }
  }

  return {
    valid: false,
    reason: 'Code expired or invalid. Ask the cashier to show the live screen.',
  };
}
