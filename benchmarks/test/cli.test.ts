import test from "node:test"
import assert from "node:assert/strict"
import { parse_cli_args } from "../src/index.ts"

test("cli parser handles run command", () => {
  const parsed = parse_cli_args([
    "benchmark",
    "run",
    "--dataset",
    "locomo",
    "--adapter",
    "openmemory",
    "--dataset-path",
    "./benchmarks/fixtures/locomo.json",
  ])
  assert.equal(parsed.command, "run")
  assert.equal(parsed.flags.dataset, "locomo")
  assert.equal(parsed.flags.adapter, "openmemory")
})

test("cli parser handles compare command", () => {
  const parsed = parse_cli_args([
    "compare",
    "--datasets",
    "locomo,longmemeval",
    "--adapters",
    "openmemory,mem0,zep",
  ])
  assert.equal(parsed.command, "compare")
  assert.equal(parsed.flags.datasets, "locomo,longmemeval")
  assert.equal(parsed.flags.adapters, "openmemory,mem0,zep")
})

test("cli parser handles report command", () => {
  const parsed = parse_cli_args([
    "report",
    "--input",
    "./benchmarks/results/run-x",
  ])
  assert.equal(parsed.command, "report")
  assert.equal(parsed.flags.input, "./benchmarks/results/run-x")
})

test("cli parser handles fetch command", () => {
  const parsed = parse_cli_args([
    "fetch",
    "--dataset",
    "all",
    "--output-dir",
    "./benchmarks/data",
  ])
  assert.equal(parsed.command, "fetch")
  assert.equal(parsed.flags.dataset, "all")
})
