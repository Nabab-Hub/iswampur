/**
 * Pass parsing and extraction utilities.
 * Client and server safe (no Node.js-only imports).
 */

/**
 * Robustly extracts the clean passId (e.g. "pass_fa34521e7c69d96871c4fd1a")
 * or humanPassCode (e.g. "ISW-IPL26-F6B12D") from any raw scanned QR string,
 * full URL, JSON payload, or manual user input.
 */
export function extractPassIdOrCode(rawInput?: string | null): string {
  if (!rawInput) return '';
  const trimmed = String(rawInput).trim();
  if (!trimmed) return '';

  // 1. JSON payload support: e.g. {"passId":"pass_...","humanPassCode":"ISW-..."}
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed.passId && typeof parsed.passId === 'string') return parsed.passId.trim();
      if (parsed.humanPassCode && typeof parsed.humanPassCode === 'string') return parsed.humanPassCode.trim().toUpperCase();
      if (parsed.id && typeof parsed.id === 'string') return parsed.id.trim();
    } catch {}
  }

  // 2. Direct regex match for "pass_" prefix (e.g. pass_fa34521e7c69d96871c4fd1a)
  // Matches inside URLs, brackets, query params, etc.
  const passIdMatch = trimmed.match(/pass_[a-zA-Z0-9_-]+/i);
  if (passIdMatch) {
    return passIdMatch[0].trim();
  }

  // 3. Direct regex match for Human Pass Code pattern (e.g. ISW-IPL26-F6B12D or XXX-YYY-ZZZ)
  const humanCodeMatch = trimmed.match(/\b([A-Za-z0-9]{2,8}-[A-Za-z0-9]{2,10}-[A-Za-z0-9]{2,12})\b/);
  if (humanCodeMatch) {
    return humanCodeMatch[1].trim().toUpperCase();
  }

  // 4. If it's a URL or URL pathname (e.g. https://iswampur.vercel.app/verify/pass_... or /verify/...)
  if (trimmed.includes('/') || trimmed.includes('http')) {
    try {
      const cleanPath = trimmed.split('?')[0].split('#')[0];
      const segments = cleanPath.split('/').filter(Boolean);
      if (segments.length > 0) {
        // Look for 'verify' or 'passes' in the URL path
        const verifyIdx = segments.findIndex((s) => {
          const lower = s.toLowerCase();
          return lower === 'verify' || lower === 'passes';
        });
        if (verifyIdx !== -1 && segments[verifyIdx + 1]) {
          const nextSegment = segments[verifyIdx + 1].trim();
          if (nextSegment && nextSegment !== 'download') {
            return nextSegment;
          }
        }
        // Fallback: the last path segment that is not an action word
        const last = segments[segments.length - 1].trim();
        if (last && last.toLowerCase() !== 'verify' && last.toLowerCase() !== 'download') {
          return last;
        }
      }
    } catch {}
  }

  // Fallback: return the trimmed string
  return trimmed;
}
