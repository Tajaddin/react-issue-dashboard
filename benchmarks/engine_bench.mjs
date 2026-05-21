// Benchmark the data-grid engine over a large dataset. Reports the time to
// run a combined search + filter + multi-key sort + paginate query, which is
// what fires on each keystroke in the dashboard. Pure Node, no DOM.
//
//   node benchmarks/engine_bench.mjs --rows 50000

import { writeFileSync, mkdirSync } from "node:fs";
import { performance } from "node:perf_hooks";

// Inline copies of the engine + seed so the benchmark needs no build step.
const PRIORITY_RANK = { low: 0, medium: 1, high: 2, critical: 3 };

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function generateIssues(count, seed = 7) {
  const rand = mulberry32(seed);
  const STATUSES = ["open", "in_progress", "closed"];
  const PRIORITIES = ["low", "medium", "high", "critical"];
  const ASSIGNEES = ["alice", "bob", "carol", "dave", "erin", "frank", "grace", "heidi"];
  const VERBS = ["Fix", "Add", "Refactor", "Investigate", "Document", "Optimize", "Remove"];
  const NOUNS = ["login flow", "cache layer", "API client", "dashboard", "auth token", "query engine", "CI pipeline"];
  const pick = (arr) => arr[Math.floor(rand() * arr.length)];
  const out = new Array(count);
  for (let i = 0; i < count; i++) {
    out[i] = {
      id: i + 1, title: `${pick(VERBS)} ${pick(NOUNS)}`, assignee: pick(ASSIGNEES),
      status: pick(STATUSES), priority: pick(PRIORITIES),
      createdAt: 1_700_000_000_000 - Math.floor(rand() * 90 * 86400000), comments: Math.floor(rand() * 50),
    };
  }
  return out;
}

function runQuery(data, spec) {
  const { search = "", status = "all", priority = "all", sortKey, sortDir = "asc", page = 0, pageSize = 50 } = spec;
  const n = search.trim().toLowerCase();
  const matched = [];
  for (const issue of data) {
    if (status !== "all" && issue.status !== status) continue;
    if (priority !== "all" && issue.priority !== priority) continue;
    if (n && !(issue.title.toLowerCase().includes(n) || issue.assignee.toLowerCase().includes(n) || String(issue.id) === n)) continue;
    matched.push(issue);
  }
  if (sortKey) {
    const dir = sortDir === "asc" ? 1 : -1;
    matched.sort((a, b) => {
      if (sortKey === "priority") return (PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]) * dir;
      const av = a[sortKey], bv = b[sortKey];
      return (typeof av === "number" ? av - bv : String(av).localeCompare(String(bv))) * dir;
    });
  }
  const start = page * pageSize;
  return { rows: matched.slice(start, start + pageSize), total: matched.length };
}

const rowsArg = process.argv.indexOf("--rows");
const rows = rowsArg >= 0 ? Number(process.argv[rowsArg + 1]) : 50000;
const data = generateIssues(rows);

// warm up
for (let i = 0; i < 20; i++) runQuery(data, { search: "fix", status: "open", sortKey: "comments", sortDir: "desc" });

const ITER = 200;
const t0 = performance.now();
for (let i = 0; i < ITER; i++) {
  runQuery(data, { search: "api", status: "open", priority: "high", sortKey: "createdAt", sortDir: "desc", page: 0, pageSize: 1000 });
}
const elapsed = performance.now() - t0;
const perQuery = elapsed / ITER;

const summary = {
  rows,
  iterations: ITER,
  ms_per_query: Number(perQuery.toFixed(3)),
  queries_per_sec: Math.round(1000 / perQuery),
  query: "search + status + priority filter + multi-key sort + paginate",
};
mkdirSync("benchmarks/results", { recursive: true });
writeFileSync("benchmarks/results/engine.json", JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 2));
