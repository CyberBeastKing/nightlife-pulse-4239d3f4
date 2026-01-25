/**
 * Password security utilities using Have I Been Pwned API
 * Uses k-anonymity model - only sends first 5 chars of SHA-1 hash
 */

async function sha1Hash(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
}

export interface PasswordCheckResult {
  isCompromised: boolean;
  occurrences: number;
  error?: string;
}

/**
 * Check if a password has been exposed in known data breaches
 * Uses HIBP k-anonymity API - never sends full password or hash
 */
export async function checkPasswordBreach(password: string): Promise<PasswordCheckResult> {
  try {
    const hash = await sha1Hash(password);
    const prefix = hash.substring(0, 5);
    const suffix = hash.substring(5);

    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: {
        'Add-Padding': 'true', // Adds padding to prevent timing attacks
      },
    });

    if (!response.ok) {
      // Don't block user on API failure - log but allow password
      console.warn('HIBP API unavailable:', response.status);
      return { isCompromised: false, occurrences: 0 };
    }

    const text = await response.text();
    const lines = text.split('\n');

    for (const line of lines) {
      const [hashSuffix, count] = line.split(':');
      if (hashSuffix.trim() === suffix) {
        return {
          isCompromised: true,
          occurrences: parseInt(count.trim(), 10) || 1,
        };
      }
    }

    return { isCompromised: false, occurrences: 0 };
  } catch (error) {
    console.warn('Password breach check failed:', error);
    // Don't block user on network errors
    return { isCompromised: false, occurrences: 0, error: 'Check unavailable' };
  }
}

/**
 * Format a user-friendly message about password breach
 */
export function getBreachMessage(occurrences: number): string {
  if (occurrences > 1000000) {
    return 'This password has appeared in over 1 million data breaches. Please choose a different password.';
  } else if (occurrences > 100000) {
    return 'This password has been exposed in hundreds of thousands of data breaches. Please choose a different password.';
  } else if (occurrences > 1000) {
    return 'This password has been found in thousands of data breaches. Please choose a different password.';
  }
  return 'This password has been exposed in known data breaches. Please choose a different password.';
}
