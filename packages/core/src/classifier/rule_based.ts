import { ALL_SECTORS, type SectorId } from "../types/sector.ts"
import type { SectorPrediction } from "./types.ts"

type rule = {
  sector: SectorId
  regex: RegExp
  weight: number
}

const rules: rule[] = [
  { sector: "semantic", regex: /\bmy name is\b/g, weight: 2 },
  { sector: "semantic", regex: /\bi am\b/g, weight: 1 },
  { sector: "semantic", regex: /\bi'm\b/g, weight: 1 },
  { sector: "semantic", regex: /\bi (?:don't|do not) like\b/g, weight: 2 },
  { sector: "semantic", regex: /\bi like\b/g, weight: 1.5 },
  { sector: "semantic", regex: /\bi love\b/g, weight: 1.5 },
  { sector: "semantic", regex: /\bmy birthday is\b/g, weight: 2 },
  { sector: "semantic", regex: /\bmy age is\b/g, weight: 2 },

  { sector: "emotional", regex: /\b(i am|i'm|feel|feeling|felt)\s+(sad|happy|angry|upset|anxious|excited|depressed|stressed|tired|scared)\b/g, weight: 2 },
  { sector: "emotional", regex: /\bsad\b|\bhappy\b|\bangry\b|\bupset\b/g, weight: 1 },

  { sector: "episodic", regex: /\b(yesterday|today|tomorrow|tonight|morning|evening|night|last|next|week|month|year)\b/g, weight: 1.5 },
  { sector: "episodic", regex: /\b\d{1,2}:\d{2}\b/g, weight: 1.5 },
  { sector: "episodic", regex: /\b\d{4}\b/g, weight: 1 },
  { sector: "episodic", regex: /\b\d{1,2}\/\d{1,2}\b/g, weight: 1 },
  { sector: "episodic", regex: /\b(deployed|fixed|met|shipped|released|launched|debugged|attended)\b/g, weight: 1 },

  { sector: "reflective", regex: /\b(i struggle with|i learn better|i tend to|i notice that|this approach worked|i realized|i found that)\b/g, weight: 1.5 },
  { sector: "reflective", regex: /\b(friend|friends|family|mother|father|sister|brother|wife|husband|partner|team|coworker|boss|manager|colleague|roommate|neighbor|we|us|our)\b/g, weight: 0.75 },

  { sector: "procedural", regex: /\b(usually|often|always|habit|habits|routinely|regularly|tend to|every day|daily|every night)\b/g, weight: 2 },
  { sector: "procedural", regex: /\bi (?:code|run|exercise|work|study|sleep|wake|cook|read|drive)\b/g, weight: 1.5 },
]

const init_scores = (): Record<SectorId, number> => {
  const scores = {} as Record<SectorId, number>
  for (const sector of ALL_SECTORS) scores[sector] = 0
  return scores
}

const sort_predictions = (entries: SectorPrediction[]): SectorPrediction[] => {
  const order = new Map<SectorId, number>()
  for (let i = 0; i < ALL_SECTORS.length; i += 1) order.set(ALL_SECTORS[i], i)
  return entries.slice().sort((a, b) => {
    if (a.score !== b.score) return b.score - a.score
    return (order.get(a.sector) ?? 0) - (order.get(b.sector) ?? 0)
  })
}

const normalize_top2 = (entries: SectorPrediction[]): SectorPrediction[] => {
  const sum = entries.reduce((acc, e) => acc + e.prob, 0)
  if (sum > 0) return entries.map((e) => ({ ...e, prob: e.prob / sum }))
  return entries.map((e) => ({ ...e, prob: 0.5 }))
}

export const classify_memory = (text: string): SectorPrediction[] => {
  const scores = init_scores()
  const lower = text.toLowerCase()
  for (const rule of rules) {
    const matches = lower.match(rule.regex)
    if (matches && matches.length) scores[rule.sector] += matches.length * rule.weight
  }
  const entries = ALL_SECTORS.map((sector) => ({
    sector,
    score: scores[sector],
    prob: 0,
  }))
  const maxScore = Math.max(...entries.map((e) => e.score))
  if (maxScore < 1) {
    const semantic = entries.find((e) => e.sector === "semantic")
    if (semantic) semantic.score = Math.max(semantic.score, Math.max(0.1, maxScore * 0.9))
  }
  const maxScore2 = Math.max(...entries.map((e) => e.score))
  const exps = entries.map((e) => Math.exp(e.score - maxScore2))
  const sumExp = exps.reduce((acc, v) => acc + v, 0)
  for (let i = 0; i < entries.length; i += 1) {
    entries[i] = { ...entries[i], prob: sumExp === 0 ? 0 : exps[i] / sumExp }
  }
  const sorted = sort_predictions(entries)
  return normalize_top2(sorted.slice(0, 2))
}
