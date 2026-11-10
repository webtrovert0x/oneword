export const MAX_WORD_LENGTH = 24;

export interface WordValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Mirrors BOTOneWord.sol validation rules for instant client feedback.
 * The smart contract enforces these exact rules on-chain.
 */
export function validateWordInput(word: string): WordValidationResult {
  if (word.length === 0) {
    return { valid: false, error: "Enter a word to contribute." };
  }

  if (/\s/.test(word)) {
    return { valid: false, error: "Spaces are not allowed. Submit exactly one word." };
  }

  const encoder = new TextEncoder();
  const bytes = encoder.encode(word);

  if (bytes.length > MAX_WORD_LENGTH) {
    return {
      valid: false,
      error: `Word cannot exceed ${MAX_WORD_LENGTH} characters.`,
    };
  }

  let hasAlphanumeric = false;
  for (let i = 0; i < bytes.length; i++) {
    const code = bytes[i];
    if (code < 0x21 || code > 0x7e) {
      return {
        valid: false,
        error: "Use printable ASCII letters, numbers, or punctuation only.",
      };
    }

    const isDigit = code >= 0x30 && code <= 0x39;
    const isUpper = code >= 0x41 && code <= 0x5a;
    const isLower = code >= 0x61 && code <= 0x7a;
    if (isDigit || isUpper || isLower) {
      hasAlphanumeric = true;
    }
  }

  if (!hasAlphanumeric) {
    return {
      valid: false,
      error: "Word cannot be punctuation-only. Include at least one letter or number.",
    };
  }

  return { valid: true };
}

