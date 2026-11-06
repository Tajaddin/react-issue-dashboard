# react-issue-dashboard

> React + TypeScript issue dashboard with a virtualized table over thousands of rows. **The pure data-grid engine runs a search + filter + 2-key sort + paginate over 50,000 rows in 1.04 ms (962 queries/sec)**, so the grid stays responsive on every keystroke with no server round trip. TanStack Query + Virtual, react-hook-form + zod, 23 tests.

[![ci](https://github.com/Tajaddin/react-issue-dashboard/actions/workflows/ci.yml/badge.svg)](https://github.com/Tajaddin/react-issue-dashboard/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![React](https://img.shields.io/badge/react-18-61DAFB)](package.json)

## Hero metric

Reproducible in Node, no browser:

```bash
npm run bench -- --rows 50000
```

| 50,000 issues | Keystroke query | Full sort |
|---|---:|---:|
| Query | search `api` + status + priority filter, sort by comments desc then createdAt desc, first 1,000 | sort by priority desc then createdAt desc, first 1,000 |
| Rows left to sort | 575 | 50,000 |
| **Time per query** | **1.04 ms** | 66.7 ms |
| **Throughput** | **962 queries/sec** | 15 queries/sec |

200 iterations after 20 warm-up runs, Node 24.14, i5-13600KF. The table is one run (`benchmarks/results/engine.json`); over five back-to-back runs the keystroke query took 0.80-1.42 ms and the full sort 39.6-74.0 ms.

The data-grid engine is a pure function with no React and no I/O, and the benchmark imports `runQuery` and `generateIssues` from `src/lib`, so it times the same code the UI runs. Filtered queries at this speed are what let the dashboard search and filter 50k rows live instead of paging a server on each keystroke; an unfiltered sort of all 50k rows is the slow case, at tens of milliseconds.

## What it is

A realistic issue tracker UI built on the modern React data stack:

| Concern | Implementation |
|---|---|
| Server state | **TanStack Query** (caching, invalidation on mutate) |
| Big lists | **TanStack Virtual** — only viewport rows are mounted, so the DOM node count is constant whether the result set is 50 or 50,000 |
| Query engine | pure `runQuery` (search + multi-filter + stable multi-key sort via `sort: [{ key, dir }, ...]` + paginate), unit-tested and benchmarked |
| Forms | **react-hook-form + zod** with a typed resolver and inline validation errors |
| Types | strict TypeScript end to end (`noUncheckedIndexedAccess` on) |

## Why this matters for hiring

Role categories unlocked: **Frontend Engineer**, Full-Stack.

This is the data-heavy React that product teams actually ship: server-state caching, virtualization for scale, schema-validated forms, and a fast client-side query layer. It backs the "React / TypeScript" resume line with a measured performance number, not just a todo app.

## How to run

Prerequisites: Node 20+; Docker (optional, for the nginx-served production build).

```bash
npm install
npm test                       # 23 vitest cases
npm run dev                    # http://localhost:5173
npm run build                  # production bundle (88 KB gzip)
npm run bench -- --rows 50000  # 50k-row data-grid hero
docker build -t react-issue-dashboard . && docker run -p 8080:80 react-issue-dashboard
```

## Architecture

```
src/lib/
  dataEngine.ts   # pure search + filter + multi-key sort + paginate (the hero)
  types.ts        # Issue, QuerySpec, QueryResult
  schema.ts       # zod create-issue schema
  seed.ts         # deterministic dataset generator
  api.ts          # typed client (in-memory demo backend)
src/hooks/useIssues.ts        # TanStack Query read + create mutation
src/components/
  IssueTable.tsx              # TanStack Virtual table
  FilterBar.tsx               # search + status/priority filters
  CreateIssueForm.tsx         # react-hook-form + zod
src/App.tsx                   # composition + summary cards
benchmarks/engine_bench.ts    # 50k-row query benchmark
```

## Testing

```bash
npm test     # 23 tests
```

- **dataEngine.test.ts** (18): empty spec, status/priority filters, case-insensitive search, search-by-id, priority-rank sort, createdAt sort, multi-key sort (tie-breaking, per-key direction, stability in both directions, `sort` overriding `sortKey`, a 5,000-row lexicographic-order check), pagination with correct pre-pagination total, combined filter+search+sort+paginate, out-of-range page, status counts.
- **api.test.ts** (2): fetch the seeded set, create at the front with a fresh id.
- **CreateIssueForm.test.tsx** (3): zod validation errors (short title, missing assignee) and a valid submit that resets, via Testing Library + user-event.

## Stack

React 18, TypeScript (strict), Vite, TanStack Query, TanStack Virtual, react-hook-form, zod, Vitest, Testing Library, Docker (nginx), GitHub Actions.

## License

MIT
