import type { CountMinSketch } from "./sketch_engine.ts"
import { extract_identity, extract_preference, type extracted_belief } from "./extract.ts"
import { extract_entities } from "./entities.ts"

export const ingest_text = (
  user_id: string,
  text: string,
  sketch: CountMinSketch,
): extracted_belief[] => {
  const beliefs: extracted_belief[] = []
  const pref = extract_preference(user_id, text)
  if (pref) beliefs.push(pref)
  const ident = extract_identity(user_id, text)
  if (ident) beliefs.push(ident)
  for (const belief of beliefs) sketch.update(belief.object)
  for (const entity of extract_entities(text)) sketch.update(entity)
  return beliefs
}
