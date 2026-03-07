const normalize_entity = (value: string): string =>
  value
    .trim()
    .replace(/^[^\p{L}\p{N}@#]+|[^\p{L}\p{N}@#]+$/gu, "")
    .toLowerCase()
    .replace(/\s+/g, " ")

const push_entity = (out: string[], seen: Set<string>, raw: string): void => {
  const normalized = normalize_entity(raw)
  if (!normalized) return
  if (seen.has(normalized)) return
  seen.add(normalized)
  out.push(normalized)
}

const extract_mentions = (text: string, out: string[], seen: Set<string>): void => {
  for (const match of text.matchAll(/(^|[\s(])@([a-zA-Z0-9_][a-zA-Z0-9_.-]*)/g)) {
    const handle = `@${(match[2] ?? "").toLowerCase()}`
    push_entity(out, seen, handle)
  }
}

const stop_labels = new Set([
  "the",
  "a",
  "an",
  "and",
  "or",
  "but",
  "if",
  "when",
  "today",
  "yesterday",
  "tomorrow",
  "last",
  "next",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
])

const extract_single_capitalized_labels = (text: string, out: string[], seen: Set<string>): void => {
  for (const match of text.matchAll(/\b[A-Z][a-z]{2,}\b/g)) {
    const candidate = normalize_entity(match[0] ?? "")
    if (!candidate || stop_labels.has(candidate)) continue
    push_entity(out, seen, candidate)
  }
}

const extract_person_names = (text: string, out: string[], seen: Set<string>): void => {
  for (const match of text.matchAll(/\b(?:met|with|from|to|and)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b/g)) {
    push_entity(out, seen, match[1] ?? "")
  }
  for (const match of text.matchAll(/\b([A-Z][a-z]+)\s+([A-Z][a-z]+)\b/g)) {
    push_entity(out, seen, `${match[1] ?? ""} ${match[2] ?? ""}`)
  }
}

const extract_hashtags = (text: string, out: string[], seen: Set<string>): void => {
  for (const match of text.matchAll(/(^|[\s(])#([a-zA-Z0-9_][a-zA-Z0-9_-]*)/g)) {
    const tag = `#${(match[2] ?? "").toLowerCase()}`
    push_entity(out, seen, tag)
  }
}

const extract_capitalized_phrases = (text: string, out: string[], seen: Set<string>): void => {
  const phrase_pattern =
    /\b(?:[A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2}|[A-Z]{2,}(?:\s+[A-Z]{2,}){0,2}|[A-Z][a-z]+[A-Z][A-Za-z0-9]*)\b/g
  for (const match of text.matchAll(phrase_pattern)) {
    push_entity(out, seen, match[0] ?? "")
  }
}

const extract_repeated_labels = (text: string, out: string[], seen: Set<string>): void => {
  const counts = new Map<string, number>()
  for (const match of text.matchAll(/\b[A-Z][A-Za-z0-9_-]{2,}\b/g)) {
    const label = normalize_entity(match[0] ?? "")
    if (!label) continue
    counts.set(label, (counts.get(label) ?? 0) + 1)
  }
  for (const [label, count] of counts.entries()) {
    if (count < 2) continue
    push_entity(out, seen, label)
  }
}

export const extract_entities = (text: string): string[] => {
  const out: string[] = []
  const seen = new Set<string>()
  extract_mentions(text, out, seen)
  extract_hashtags(text, out, seen)
  extract_person_names(text, out, seen)
  extract_single_capitalized_labels(text, out, seen)
  extract_capitalized_phrases(text, out, seen)
  extract_repeated_labels(text, out, seen)
  return out
}

export const relational_classifier_boost = (entities: string[]): number =>
  Math.min(3, entities.length * 0.75)

export const relational_salience_boost = (entities: string[]): number =>
  Math.min(1.5, entities.length * 0.25)
