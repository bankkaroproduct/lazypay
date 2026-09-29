/**
 * Name + mobile validation for the lead step.
 *
 * Goal: block obvious junk (9999999999, 1234567890, "test", "asdf") without
 * rejecting real people. Each rule returns the first human-readable error, or
 * "" when the value is fine.
 */

/** Strip spaces, dashes, brackets and a leading +91 / 91 / 0 so users can paste freely. */
export function normalizePhone(input: string): string {
  let d = input.replace(/\D/g, "");
  if (d.length === 12 && d.startsWith("91")) d = d.slice(2);
  else if (d.length === 11 && d.startsWith("0")) d = d.slice(1);
  return d;
}

/**
 * Well-known dummy numbers people type to get past a form. Extend per
 * deployment with NEXT_PUBLIC_BLOCKED_PHONES (comma-separated) — no code change.
 */
const BLOCKED_PHONES = new Set([
  "9999999999", "8888888888", "7777777777", "6666666666",
  "9876543210", "9123456789", "9012345678",
  "9999912345", "9999900000", "9000000000", "8000000000", "7000000000", "6000000000",
  ...(process.env.NEXT_PUBLIC_BLOCKED_PHONES || "").split(",").map((x) => x.trim()).filter(Boolean),
]);

/** True if the number is a 1–5 digit block repeated (9898989898, 9876987698, 9812398123). */
function isRepeatingBlock(d: string): boolean {
  for (let p = 1; p <= 5; p++) {
    let ok = true;
    for (let i = p; i < d.length && ok; i++) ok = d[i] === d[i - p];
    if (ok) return true;
  }
  return false;
}

/** Longest run of +1 or -1 steps (e.g. "123456" or "98765"), in digits. */
function longestSequence(d: string): number {
  let best = 1, up = 1, down = 1;
  for (let i = 1; i < d.length; i++) {
    const diff = Number(d[i]) - Number(d[i - 1]);
    up = diff === 1 ? up + 1 : 1;
    down = diff === -1 ? down + 1 : 1;
    best = Math.max(best, up, down);
  }
  return best;
}

export function validatePhone(input: string): string {
  const d = normalizePhone(input);
  if (!d) return "Enter your mobile number.";
  if (d.length !== 10) return "Mobile number must be exactly 10 digits.";
  // Indian mobile numbers (TRAI) start with 6, 7, 8 or 9.
  if (!/^[6-9]/.test(d)) return "Indian mobile numbers start with 6, 7, 8 or 9.";

  const invalid = "This doesn't look like a real mobile number.";
  if (BLOCKED_PHONES.has(d)) return invalid;
  // 5+ of the same digit in a row: 9999999999, 9999999990, 9999912345
  if (/(\d)\1{4,}/.test(d)) return invalid;
  // 6+ step run: 9123456789, 9876543210, 7012345678
  if (longestSequence(d) >= 6) return invalid;
  // Short block repeated: 9898989898, 9876987698, 9812398123
  if (isRepeatingBlock(d)) return invalid;
  // Only 1–2 distinct digits (9889898898). 3–4 is left alone — real numbers can be that plain.
  if (new Set(d).size < 3) return invalid;
  return "";
}

/** Names people type to skip a form. Compared after lowercasing and trimming. */
const BLOCKED_NAMES = new Set([
  "test", "testing", "tester", "asdf", "asdfgh", "qwerty", "abc", "abcd", "xyz",
  "na", "n/a", "none", "null", "undefined", "nil", "user", "name", "admin",
  "demo", "sample", "fake", "dummy", "aaa", "xxx", "hello", "hi",
]);

/** Collapse runs of whitespace and trim, e.g. "  Ravi   Kumar " → "Ravi Kumar". */
export const cleanName = (input: string) => input.replace(/\s+/g, " ").trim();

export function validateName(input: string): string {
  const n = cleanName(input);
  if (!n) return "Enter your name.";
  if (n.length < 2) return "Name is too short.";
  if (n.length > 50) return "Name is too long (50 characters max).";
  // Letters, spaces, dots, apostrophes and hyphens only — no digits or emoji.
  if (!/^[A-Za-z][A-Za-z .'-]*$/.test(n)) return "Use letters only — no numbers or symbols.";
  if ((n.match(/[A-Za-z]/g) || []).length < 2) return "Enter your full name.";
  if (BLOCKED_NAMES.has(n.toLowerCase())) return "Please enter your real name.";
  // "aaaa", "Rrrrr"
  if (/([A-Za-z])\1{2,}/i.test(n)) return "Please enter your real name.";
  // Keyboard-mash: a 5+ letter word with no vowels (e.g. "sdfgh", "bcdfg")
  if (n.split(" ").some((w) => w.length >= 5 && !/[aeiouy]/i.test(w))) return "Please enter your real name.";
  return "";
}
