import { resolve } from "node:path"
import { compare_benchmarks, regenerate_report, run_benchmark } from "./runner.ts"
import { fetch_benchmark_datasets } from "./datasets/fetch.ts"
import {
  default_fairness_config,
  default_llm_judge_config,
  default_mem0_config,
  default_openmemory_config,
  default_zep_config,
  type benchmark_compare_config,
  type benchmark_run_config,
  type dataset_config,
} from "./config.ts"
import type { benchmark_adapter_name, benchmark_dataset_name } from "./adapters/types.ts"

type cli_flags = Record<string, string>

type cli_command =
  | { command: "run"; flags: cli_flags }
  | { command: "compare"; flags: cli_flags }
  | { command: "report"; flags: cli_flags }
  | { command: "fetch"; flags: cli_flags }

const parse_flags = (argv: string[]): cli_flags => {
  const out: cli_flags = {}
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i]
    if (!token.startsWith("--")) continue
    if (token.includes("=")) {
      const [key, value] = token.slice(2).split("=", 2)
      out[key] = value ?? ""
      continue
    }
    const key = token.slice(2)
    const next = argv[i + 1]
    if (!next || next.startsWith("--")) {
      out[key] = "true"
      continue
    }
    out[key] = next
    i += 1
  }
  return out
}

export const parse_cli_args = (argv: string[]): cli_command => {
  const tokens = argv[0] === "benchmark" ? argv.slice(1) : argv
  const command = tokens[0]
  const flags = parse_flags(tokens.slice(1))
  if (command === "run") return { command, flags }
  if (command === "compare") return { command, flags }
  if (command === "report") return { command, flags }
  if (command === "fetch") return { command, flags }
  throw new Error("usage: benchmark <run|compare|report> [--flags]")
}

const as_dataset = (value: string): benchmark_dataset_name => {
  if (value === "locomo" || value === "longmemeval") return value
  throw new Error(`invalid dataset: ${value}`)
}

const as_adapter = (value: string): benchmark_adapter_name => {
  if (value === "openmemory" || value === "mem0" || value === "zep") return value
  throw new Error(`invalid adapter: ${value}`)
}

const as_boolean = (value: string | undefined, fallback: boolean): boolean => {
  if (value === undefined) return fallback
  if (value === "true" || value === "1") return true
  if (value === "false" || value === "0") return false
  return fallback
}

const as_number = (value: string | undefined, fallback: number): number => {
  if (value === undefined) return fallback
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

const parse_json_flag = (value: string | undefined): Record<string, unknown> => {
  if (!value) return {}
  const parsed = JSON.parse(value) as unknown
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new Error("adapter config must be an object")
  }
  return parsed as Record<string, unknown>
}

const pick_prefixed_flags = (flags: cli_flags, prefix: string): Record<string, unknown> => {
  const out: Record<string, unknown> = {}
  const parse_value = (value: string): unknown => {
    if (value === "true") return true
    if (value === "false") return false
    const num = Number(value)
    if (Number.isFinite(num) && value.trim() !== "") return num
    if ((value.startsWith("{") && value.endsWith("}")) || (value.startsWith("[") && value.endsWith("]"))) {
      try {
        return JSON.parse(value)
      } catch {
        return value
      }
    }
    return value
  }
  for (const [key, value] of Object.entries(flags)) {
    if (!key.startsWith(prefix)) continue
    out[key.slice(prefix.length)] = parse_value(value)
  }
  return out
}

const default_dataset_path = (dataset: benchmark_dataset_name): string =>
  dataset === "locomo"
    ? resolve("benchmarks", "data", "locomo", "locomo10.json")
    : resolve("benchmarks", "data", "longmemeval", "longmemeval_s_cleaned.json")

const run_from_flags = (flags: cli_flags): benchmark_run_config => {
  const dataset = as_dataset(flags.dataset ?? "")
  const adapter = as_adapter(flags.adapter ?? "")
  const dataset_cfg: dataset_config = {
    name: dataset,
    split: flags.split ?? "test",
    path: resolve(flags["dataset-path"] ?? default_dataset_path(dataset)),
  }
  const fairness = {
    ...default_fairness_config,
    question_limit: flags["question-limit"] ? as_number(flags["question-limit"], 0) : null,
    max_turns_per_session: as_number(flags["max-turns"], default_fairness_config.max_turns_per_session),
    timeout_ms: as_number(flags["timeout-ms"], default_fairness_config.timeout_ms),
    seed: as_number(flags.seed, default_fairness_config.seed),
    retry: {
      ...default_fairness_config.retry,
      max_attempts: as_number(flags["retry-max-attempts"], default_fairness_config.retry.max_attempts),
      base_delay_ms: as_number(flags["retry-base-delay-ms"], default_fairness_config.retry.base_delay_ms),
      max_delay_ms: as_number(flags["retry-max-delay-ms"], default_fairness_config.retry.max_delay_ms),
    },
  }

  const llm_judge = {
    ...default_llm_judge_config,
    enabled: as_boolean(flags["llm-judge"], default_llm_judge_config.enabled),
    model: flags["llm-judge-model"] ?? default_llm_judge_config.model,
    api_key_env: flags["llm-judge-api-key-env"] ?? default_llm_judge_config.api_key_env,
  }

  const default_adapter_config = adapter === "openmemory"
    ? default_openmemory_config
    : adapter === "mem0"
      ? default_mem0_config
      : default_zep_config

  const adapter_config = {
    ...default_adapter_config,
    ...pick_prefixed_flags(flags, "adapter."),
    ...parse_json_flag(flags["adapter-config"]),
  }

  return {
    dataset: dataset_cfg,
    adapter,
    adapter_config,
    output_dir: resolve(flags["output-dir"] ?? resolve("benchmarks", "results")),
    resume: as_boolean(flags.resume, false),
    fairness,
    llm_judge,
  }
}

const compare_from_flags = (flags: cli_flags): benchmark_compare_config => {
  const dataset_names = (flags.datasets ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)
    .map(as_dataset)
  const adapters = (flags.adapters ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)
    .map(as_adapter)
  if (dataset_names.length === 0) throw new Error("--datasets is required for compare")
  if (adapters.length === 0) throw new Error("--adapters is required for compare")

  const datasets: dataset_config[] = dataset_names.map((name) => ({
    name,
    split: flags.split ?? "test",
    path: resolve(flags[`${name}-path`] ?? default_dataset_path(name)),
  }))

  const adapter_configs: Partial<Record<benchmark_adapter_name, Record<string, unknown>>> = {}
  for (const adapter of adapters) {
    const defaults = adapter === "openmemory"
      ? default_openmemory_config
      : adapter === "mem0"
        ? default_mem0_config
        : default_zep_config
    adapter_configs[adapter] = {
      ...defaults,
      ...pick_prefixed_flags(flags, `${adapter}.`),
    }
  }

  return {
    datasets,
    adapters,
    adapter_configs,
    output_dir: resolve(flags["output-dir"] ?? resolve("benchmarks", "results")),
    fairness: {
      ...default_fairness_config,
      question_limit: flags["question-limit"] ? as_number(flags["question-limit"], 0) : null,
      max_turns_per_session: as_number(flags["max-turns"], default_fairness_config.max_turns_per_session),
      timeout_ms: as_number(flags["timeout-ms"], default_fairness_config.timeout_ms),
      seed: as_number(flags.seed, default_fairness_config.seed),
      retry: {
        ...default_fairness_config.retry,
        max_attempts: as_number(flags["retry-max-attempts"], default_fairness_config.retry.max_attempts),
        base_delay_ms: as_number(flags["retry-base-delay-ms"], default_fairness_config.retry.base_delay_ms),
        max_delay_ms: as_number(flags["retry-max-delay-ms"], default_fairness_config.retry.max_delay_ms),
      },
    },
    llm_judge: {
      ...default_llm_judge_config,
      enabled: as_boolean(flags["llm-judge"], default_llm_judge_config.enabled),
      model: flags["llm-judge-model"] ?? default_llm_judge_config.model,
      api_key_env: flags["llm-judge-api-key-env"] ?? default_llm_judge_config.api_key_env,
    },
  }
}

const main = async (): Promise<void> => {
  const command = parse_cli_args(process.argv.slice(2))
  if (command.command === "run") {
    const config = run_from_flags(command.flags)
    const summary = await run_benchmark(config)
    process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`)
    return
  }
  if (command.command === "compare") {
    const config = compare_from_flags(command.flags)
    const summaries = await compare_benchmarks(config)
    process.stdout.write(`${JSON.stringify(summaries, null, 2)}\n`)
    return
  }
  if (command.command === "report") {
    const run_dir = command.flags.input
    if (!run_dir) throw new Error("--input is required for report")
    const summary = await regenerate_report(resolve(run_dir))
    process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`)
    return
  }
  if (command.command === "fetch") {
    const dataset = command.flags.dataset ?? "all"
    const output_dir = resolve(command.flags["output-dir"] ?? resolve("benchmarks", "data"))
    const force = as_boolean(command.flags.force, false)
    const summary = await fetch_benchmark_datasets(dataset, output_dir, { force })
    process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`)
    return
  }
}

const is_main = process.argv[1]?.endsWith("/index.ts") || process.argv[1]?.endsWith("\\index.ts")
if (is_main) {
  main().catch((error) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`)
    process.exitCode = 1
  })
}
