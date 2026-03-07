export const extract_temporal_markers = (text: string): string[] => {
  const patterns: RegExp[] = [
    /\b(yesterday|today|tomorrow)\b/gi,
    /\b(last\s+week|next\s+month)\b/gi,
    /\b\d{4}-\d{2}-\d{2}\b/g,
    /\b\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?\b/g,
    /\b(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+\d{1,2}(?:,\s*\d{4})?\b/gi,
    /\b(?:before|after)\s+(?:[a-z0-9]+(?:\s+[a-z0-9]+){0,3})\b/gi,
  ]
  const out: string[] = []
  const seen = new Set<string>()
  for (const pattern of patterns) {
    for (const match of text.matchAll(pattern)) {
      const raw = (match[0] ?? "").trim()
      if (!raw) continue
      const marker = raw.toLowerCase().replace(/\s+/g, " ")
      if (seen.has(marker)) continue
      seen.add(marker)
      out.push(marker)
    }
  }
  return out
}

export const temporal_classifier_boost = (markers: string[]): number =>
  markers.length * 1.25

export const temporal_salience_boost = (markers: string[]): number =>
  Math.min(1.5, markers.length * 0.3)

