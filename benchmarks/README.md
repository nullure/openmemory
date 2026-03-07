# OpenMemory Benchmark Harness

This package provides a reproducible benchmark harness for long-term memory evaluation across multiple memory systems:

- `openmemory`
- `mem0`
- `zep` (Graphiti-style wrapper)

The harness is adapter-based and dataset-agnostic at the runner layer.  
It supports:

- LoCoMo-style long-conversation memory evaluation
- LongMemEval-style multi-session memory evaluation
- consistent fairness controls across systems
- resumable runs with raw artifact logging
- summary outputs in JSON, CSV, and Markdown

## Directory Layout

```text
benchmarks/
  src/
    index.ts
    config.ts
    runner.ts
    datasets/
    adapters/
    grading/
    metrics/
    reports/
    utils/
  fixtures/
  results/
```

## Adapter Interface

All systems implement the same interface:

```ts
interface MemorySystemAdapter {
  name(): string
  setup(config: Record<string, unknown>): Promise<void>
  reset(): Promise<void>
  ingestConversation(session: BenchmarkSession): Promise<void>
  answerQuestion(input: BenchmarkQuestion): Promise<BenchmarkAnswer>
  teardown(): Promise<void>
}
```

## Supported Datasets

- `locomo`
- `longmemeval`

Official source locations used by the dataset downloader:

- LoCoMo repo (`snap-research/locomo`) data file `locomo10.json`
- LongMemEval cleaned dataset on Hugging Face (`xiaowu0162/longmemeval-cleaned`)

Dataset loaders normalize each source format into internal benchmark types:

- `BenchmarkConversation`
- `BenchmarkSession`
- `BenchmarkQuestion`
- `BenchmarkAnswer`
- `benchmark_category`

## Fairness Rules Enforced

- same dataset split per comparison batch
- same sampled question set across all compared systems
- same grading logic (`exact` + token `f1`, optional same judge settings)
- same timeout policy
- same retry policy
- same answer normalization
- fixed max turns per ingested session
- explicit adapter metadata logging for embedding/provider differences

If two systems require different embedding stacks, the difference is recorded in metadata.

## Running Benchmarks

From repo root:

Fetch official full benchmark datasets first:

```bash
node --experimental-strip-types benchmarks/src/index.ts benchmark fetch --dataset all --output-dir ./benchmarks/data
```

This downloads:

- `benchmarks/data/locomo/locomo10.json`
- `benchmarks/data/longmemeval/longmemeval_oracle.json`
- `benchmarks/data/longmemeval/longmemeval_s_cleaned.json`
- `benchmarks/data/longmemeval/longmemeval_m_cleaned.json`

It also writes `benchmarks/data/dataset-lock.json` (source URL, bytes, SHA256).

```bash
node --experimental-strip-types benchmarks/src/index.ts benchmark run --dataset locomo --adapter openmemory --dataset-path ./benchmarks/data/locomo/locomo10.json
```

```bash
node --experimental-strip-types benchmarks/src/index.ts benchmark run --dataset longmemeval --adapter mem0 --dataset-path ./benchmarks/data/longmemeval/longmemeval_s_cleaned.json --adapter.mode replay --adapter.replay_file ./benchmarks/fixtures/mem0_replay.jsonl
```

```bash
node --experimental-strip-types benchmarks/src/index.ts benchmark compare --datasets locomo,longmemeval --adapters openmemory,mem0,zep --locomo-path ./benchmarks/data/locomo/locomo10.json --longmemeval-path ./benchmarks/data/longmemeval/longmemeval_s_cleaned.json --mem0.mode replay --mem0.replay_file ./benchmarks/fixtures/mem0_replay.jsonl --zep.mode replay --zep.replay_file ./benchmarks/fixtures/zep_replay.jsonl
```

```bash
node --experimental-strip-types benchmarks/src/index.ts benchmark report --input ./benchmarks/results/locomo-openmemory
```

## OpenMemory Adapter

`openmemory` supports:

- `inproc` mode: runs core ingest/recall directly in-process
- `http` mode: calls an OpenMemory-compatible server endpoint (`/ingest`, `/recall`)

Config examples:

- `adapter.mode=inproc`
- `adapter.embedding_provider=fake|openai|siray`
- `adapter.recall_mode=fast|deep`
- `adapter.token_budget=4096`

## Mem0 Adapter

`mem0` wrapper supports:

- `replay` mode (implemented)
- `http` mode (requires explicit `ingest_path` and `query_path`)
- `unimplemented` mode (default; fails clearly)

The harness does not fabricate Mem0 results. If native integration is unavailable, use replay mode and supply recorded outputs.

## Zep / Graphiti Adapter

`zep` wrapper follows the same pattern:

- `replay` mode (implemented)
- `http` mode (requires explicit endpoints)
- `unimplemented` mode (default; fails clearly)

No unsupported API is assumed implicitly.

## Artifacts Logged Per Run

Each run directory stores:

- `config.json`
- `metadata.json`
- `raw_answers.jsonl`
- `grading.jsonl`
- `ingest.jsonl`
- `errors.jsonl`
- `retries.jsonl`
- `judge.jsonl` (when enabled)
- `summary.json`
- `summary.csv`
- `report.md`

Runs are resumable when `resume=true`.

## LLM Judge

LLM grading is:

- off by default
- deterministic prompt format
- only applied when exact/F1 is insufficient (below threshold)
- persisted to `judge.jsonl` for auditability

## Limitations

- Mem0/Zep native SDK integration is environment-dependent and may remain unavailable.
- HTTP modes for competitor adapters require explicit endpoint mapping; no undocumented API assumptions are made.
- Official dataset releases can evolve; loaders fail loudly on schema mismatches.
