export type extracted_belief = {
  subject: string
  predicate: "likes" | "dislikes" | "name"
  object: string
}

const trim_object = (value: string): string => value.trim().replace(/[.!?]+$/, "").trim()

export const extract_preference = (user_id: string, text: string): extracted_belief | null => {
  const neg = text.match(/\bi (?:don't|do not) like\s+(.+)/i)
  if (neg) {
    const object = trim_object(neg[1] ?? "")
    if (!object) return null
    return {
      subject: user_id,
      predicate: "dislikes",
      object,
    }
  }
  const match = text.match(/\bi like\s+(.+)/i)
  if (!match) return null
  const object = trim_object(match[1] ?? "")
  if (!object) return null
  return {
    subject: user_id,
    predicate: "likes",
    object,
  }
}

export const extract_identity = (user_id: string, text: string): extracted_belief | null => {
  const match = text.match(/\bmy name is\s+(.+)/i)
  if (!match) return null
  const object = trim_object(match[1] ?? "")
  if (!object) return null
  return {
    subject: user_id,
    predicate: "name",
    object,
  }
}
