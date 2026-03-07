const punctuation_re = /[^\p{L}\p{N}\s]+/gu
const whitespace_re = /\s+/g

export const normalize_text = (input: string): string => {
  return input
    .toLowerCase()
    .replace(punctuation_re, " ")
    .replace(whitespace_re, " ")
    .trim()
}

export const tokenize = (input: string): string[] => {
  const normalized = normalize_text(input)
  return normalized ? normalized.split(" ") : []
}

export const estimate_tokens = (input: string): number => {
  if (!input.trim()) return 0
  return Math.ceil(input.trim().split(/\s+/g).length * 1.33)
}
