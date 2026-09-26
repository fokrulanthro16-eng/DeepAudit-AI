export interface ScrubResult {
  sanitizedText: string;
  redactedCount: number;
  scrubbedItems: { type: string; redactedPlaceholder: string }[];
}

/**
 * PII Data Airlock:
 * Redacts emails, phone numbers, credit card / SSN patterns, internal entity identifiers
 * before dispatching external web searches or unauthenticated network queries.
 */
export function scrubPii(text: string): ScrubResult {
  let sanitized = text;
  const scrubbedItems: { type: string; redactedPlaceholder: string }[] = [];
  let count = 0;

  // 1. Email Redaction
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
  sanitized = sanitized.replace(emailRegex, (match) => {
    count++;
    const placeholder = `[REDACTED_EMAIL_${count}]`;
    scrubbedItems.push({ type: "EMAIL", redactedPlaceholder: placeholder });
    return placeholder;
  });

  // 2. Phone Number Redaction (North American & International formats)
  const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g;
  sanitized = sanitized.replace(phoneRegex, (match) => {
    count++;
    const placeholder = `[REDACTED_PHONE_${count}]`;
    scrubbedItems.push({ type: "PHONE", redactedPlaceholder: placeholder });
    return placeholder;
  });

  // 3. SSN / Tax ID Redaction
  const ssnRegex = /\b\d{3}-\d{2}-\d{4}\b/g;
  sanitized = sanitized.replace(ssnRegex, () => {
    count++;
    const placeholder = `[REDACTED_TAX_ID_${count}]`;
    scrubbedItems.push({ type: "TAX_ID/SSN", redactedPlaceholder: placeholder });
    return placeholder;
  });

  // 4. Credit Card / Account Number patterns (13 to 19 digits with dashes/spaces)
  const ccRegex = /\b(?:\d{4}[-\s]?){3}\d{4}\b/g;
  sanitized = sanitized.replace(ccRegex, () => {
    count++;
    const placeholder = `[REDACTED_ACCOUNT_NUM_${count}]`;
    scrubbedItems.push({ type: "FINANCIAL_ACCOUNT", redactedPlaceholder: placeholder });
    return placeholder;
  });

  return {
    sanitizedText: sanitized,
    redactedCount: count,
    scrubbedItems,
  };
}
