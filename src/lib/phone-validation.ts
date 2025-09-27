// Phone validation and toll fraud protection

// Blocked area codes - premium rate, toll fraud risk, non-geographic
const BLOCKED_AREA_CODES = new Set([
  '900', '976', // Premium rate
  '880', '881', '882', '883', // Paid services
  '500', '700', // Non-geographic
  '911', // Emergency (shouldn't be used)
  '555', // Fictional/testing (except 555-0100 to 555-0199)
  '800', '888', '877', '866', '855', '844', '833', // Toll-free (can't receive SMS)
]);

// Valid US area codes (NPA) - must be 2-9 for first digit, 0-9 for second, 0-9 for third
// But not X11 (N11 codes like 411, 511, 611, 711, 811, 911)
function isValidAreaCode(areaCode: string): boolean {
  // Special handling for 555 - only allow for testing (555-0100 to 555-0199)
  if (areaCode === '555') {
    return false; // Block 555 for production use
  }

  if (BLOCKED_AREA_CODES.has(areaCode)) {
    return false;
  }

  // Check format: [2-9][0-9][0-9] but not X11
  const firstDigit = parseInt(areaCode[0]);
  const lastTwoDigits = areaCode.slice(1);

  if (firstDigit < 2 || firstDigit > 9) {
    return false;
  }

  // Block N11 codes
  if (lastTwoDigits === '11') {
    return false;
  }

  return true;
}

// Valid exchange code (NXX) - must be 2-9 for first digit, 0-9 for second and third
function isValidExchangeCode(exchange: string): boolean {
  const firstDigit = parseInt(exchange[0]);
  return firstDigit >= 2 && firstDigit <= 9;
}

export interface PhoneValidationResult {
  isValid: boolean;
  formattedNumber?: string;
  e164Number?: string;
  error?: string;
}

export function validateAndFormatUSPhone(phoneNumber: string): PhoneValidationResult {
  // Remove all non-digit characters
  const digitsOnly = phoneNumber.replace(/\D/g, '');

  // Must be exactly 10 digits (US without country code) or 11 digits (with country code 1)
  if (digitsOnly.length === 11) {
    // Must start with 1 for US country code
    if (!digitsOnly.startsWith('1')) {
      return {
        isValid: false,
        error: 'Invalid country code. Only US numbers (+1) are supported.'
      };
    }
    // Remove the country code for validation
    const withoutCountryCode = digitsOnly.slice(1);
    return validateTenDigitNumber(withoutCountryCode);
  } else if (digitsOnly.length === 10) {
    return validateTenDigitNumber(digitsOnly);
  } else {
    return {
      isValid: false,
      error: 'Please enter a valid 10-digit US phone number.'
    };
  }
}

function validateTenDigitNumber(tenDigits: string): PhoneValidationResult {
  const areaCode = tenDigits.slice(0, 3);
  const exchange = tenDigits.slice(3, 6);
  const lineNumber = tenDigits.slice(6, 10);

  // Validate area code
  if (!isValidAreaCode(areaCode)) {
    return {
      isValid: false,
      error: `Area code ${areaCode} is not allowed. Please use a valid US mobile number.`
    };
  }

  // Validate exchange code
  if (!isValidExchangeCode(exchange)) {
    return {
      isValid: false,
      error: 'Invalid phone number format. Please use a valid US mobile number.'
    };
  }

  // Format for display
  const formattedNumber = `(${areaCode}) ${exchange}-${lineNumber}`;
  const e164Number = `+1${tenDigits}`;

  return {
    isValid: true,
    formattedNumber,
    e164Number
  };
}

// Rate limiting helper - tracks attempts per phone number
class RateLimiter {
  private attempts: Map<string, { count: number; resetTime: number }> = new Map();
  private readonly maxAttempts = 3;
  private readonly windowMs = 15 * 60 * 1000; // 15 minutes

  canAttempt(identifier: string): boolean {
    const now = Date.now();
    const record = this.attempts.get(identifier);

    if (!record) {
      this.attempts.set(identifier, { count: 1, resetTime: now + this.windowMs });
      return true;
    }

    if (now > record.resetTime) {
      // Reset window
      this.attempts.set(identifier, { count: 1, resetTime: now + this.windowMs });
      return true;
    }

    if (record.count >= this.maxAttempts) {
      return false;
    }

    record.count++;
    return true;
  }

  getRemainingTime(identifier: string): number {
    const record = this.attempts.get(identifier);
    if (!record) return 0;

    const now = Date.now();
    if (now > record.resetTime) return 0;

    return Math.ceil((record.resetTime - now) / 1000 / 60); // minutes
  }
}

export const rateLimiter = new RateLimiter();