const WORDS = [
  "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
  "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen",
  "nineteen", "twenty",
] as const;

/** Editorial counts: "fifteen", not "15" — but digits once words would get silly. */
export function numberWord(value: number): string {
  return Number.isInteger(value) && value >= 0 && value < WORDS.length ? WORDS[value] : String(value);
}

/** "Four categories", "One line" — a count generated from data, ready to open a sentence. */
export function sentenceCount(value: number, singular: string, plural: string): string {
  const word = numberWord(value);
  return `${word.charAt(0).toUpperCase()}${word.slice(1)} ${value === 1 ? singular : plural}`;
}
