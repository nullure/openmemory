import { write_json } from "../utils/jsonl.ts"

export const write_summary_json = async (path: string, summary: unknown): Promise<void> => {
  await write_json(path, summary)
}
