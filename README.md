# react-issue-dashboard

> React + TypeScript issue dashboard with a virtualized table over thousands of rows. **The pure data-grid engine runs a full search + filter + multi-key sort + paginate over 50,000 rows in 1.49 ms (673 queries/sec)**, so the grid stays responsive on every keystroke with no server round trip. TanStack Query + Virtual, react-hook-form + zod, 18 tests.

[![ci](https://github.com/Tajaddin/react-issue-dashboard/actions/workflows/ci.yml/badge.svg)](https://github.com/Tajaddin/react-issue-dashboard/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![React](https://img.shields.io/badge/react-18-61DAFB)](package.json)

## Hero metric

Reproducible in Node, no browser:

```bash
node benchmarks/engine_bench.mjs --rows 50000
```

| Metric | Value |
|---|---:|
| Dataset | 50,000 issues |
| Query | search + status + priority filter + multi-key sort + paginate |
| **Time per query** | **1.49 ms** |
| **Throughput** | **673 queries/sec** |

The data-grid engine is a pure function with no React and no I/O, so the same code that powers the UI is benchmarked directly. Client-side querying at this speed is what lets the dashboard filter and sort 50k rows live instead of paging a server on each keystroke.

## What it is

A realistic issue tracker UI built on the modern React data stack:

| Concern | Implementation |
|---|---|
| Server state | **TanStack Query** (caching, invalidation on mutate) |
| Big lists | **TanStack Virtual** — only viewport rows are mounted, so the DOM node count is constant whether the result set is 50 or 50,000 |
| Query engine | pure `runQuery` (search + multi-filter + multi-key sort + paginate), unit-tested and benchmarked |
| Forms | **react-hook-form + zod** with a typed resolver and inline validation errors |
| Types | strict TypeScript end to end (`noUncheckedIndexedAccess` on) |

## Why this matters for hiring

Role categories unlocked: **Frontend Engineer**, Full-Stack.

This is the data-heavy React that product teams actually ship: server-state caching, virtualization for scale, schema-validated forms, and a fast client-side query layer. It backs the "React / TypeScript" resume line with a measured performance number, not just a todo app.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # 18 tests
npm run build      # production bundle (88 KB gzip)
docker compose -f - up   # or: docker build . && run nginx image
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
benchmarks/engine_bench.mjs   # 50k-row query benchmark
```

## Testing

```bash
npm test     # 18 tests
```

- **dataEngine.test.ts** (13): empty spec, status/priority filters, case-insensitive search, search-by-id, priority-rank sort, createdAt sort, pagination with correct pre-pagination total, combined filter+search+sort+paginate, out-of-range page, status counts.
- **api.test.ts** (2): fetch the seeded set, create at the front with a fresh id.
- **CreateIssueForm.test.tsx** (3): zod validation errors (short title, missing assignee) and a valid submit that resets, via Testing Library + user-event.

## Stack

React 18, TypeScript (strict), Vite, TanStack Query, TanStack Virtual, react-hook-form, zod, Vitest, Testing Library, Docker (nginx), GitHub Actions.

## License

MIT
