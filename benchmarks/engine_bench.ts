// Benchmark the data-grid engine over a large dataset. Imports the shipped
// runQuery and generateIssues from src/lib, so it times the code the UI runs.
// Pure Node, no DOM.
//
//   npm run bench -- --rows 50000
//
// Two queries:
//   keystroke  search + status + priority filter + 2-key sort + paginate, what
//              fires as the user types; the filters leave `matched` rows to sort.
//   full_sort  no filters, a 2-key sort of every row + paginate.

import { mkdirSync, writeFileSync } from "node:fs";
import { performance } from "node:perf_hooks";

import { runQuery } from "../src/lib/dataEngine";
import { generateIssues } from "../src/lib/seed";
import type { QuerySpec } from "../src/lib/types";

const rowsArg = process.argv.indexOf("--rows");
const rows = rowsArg >= 0 ? Number(process.argv[rowsArg + 1]) : 50_000;
const data = generateIssues(rows);
const ITER = 200;

function time(query: string, spec: QuerySpec) {
  for (let i = 0; i < 20; i++) runQuery(data, spec);
  let matched = 0;
  const t0 = performance.now();
  for (let i = 0; i < ITER; i++) matched = runQuery(data, spec).total;
  const perQuery = (performance.now() - t0) / ITER;
  return {
    query,
    matched,
    ms_per_query: Number(perQuery.toFixed(3)),
    queries_per_sec: Math.round(1000 / perQuery),
  };
}

const summary = {
  rows,
  iterations: ITER,
  node: process.version,
  keystroke: time("search + status + priority filter + 2-key sort + paginate", {
    search: "api",
    status: "open",
    priority: "high",
    sort: [
      { key: "comments", dir: "desc" },
      { key: "createdAt", dir: "desc" },
    ],
    page: 0,
    pageSize: 1000,
  }),
  full_sort: time("2-key sort of every row + paginate", {
    sort: [
      { key: "priority", dir: "desc" },
      { key: "createdAt", dir: "desc" },
    ],
    page: 0,
    pageSize: 1000,
  }),
};

mkdirSync("benchmarks/results", { recursive: true });
writeFileSync("benchmarks/results/engine.json", JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 2));
