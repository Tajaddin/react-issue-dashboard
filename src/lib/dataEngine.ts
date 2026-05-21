// Pure client-side data-grid engine: search + filter + multi-key sort +
// pagination over an in-memory issue list. No React, no I/O, so it is fast,
// deterministic, and unit/benchmark testable. This is the hot path that keeps
// a 50k-row grid responsive without a server round trip per keystroke.

import type { Issue, QueryResult, QuerySpec } from "./types";

const PRIORITY_RANK: Record<Issue["priority"], number> = {
  low: 0,
  medium: 1,
  high: 2,
  critical: 3,
};

function matchesSearch(issue: Issue, needle: string): boolean {
  if (!needle) return true;
  const n = needle.toLowerCase();
  return (
    issue.title.toLowerCase().includes(n) ||
    issue.assignee.toLowerCase().includes(n) ||
    String(issue.id) === n
  );
}

function compare(a: Issue, b: Issue, key: keyof Issue): number {
  if (key === "priority") {
    return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
  }
  const av = a[key];
  const bv = b[key];
  if (typeof av === "number" && typeof bv === "number") return av - bv;
  return String(av).localeCompare(String(bv));
}

/**
 * Apply a query (search, status/priority filters, sort, pagination) to the
 * dataset. Returns the page plus the pre-pagination match total.
 */
export function runQuery(data: readonly Issue[], spec: QuerySpec): QueryResult {
  const {
    search = "",
    status = "all",
    priority = "all",
    sortKey,
    sortDir = "asc",
    page = 0,
    pageSize = 50,
  } = spec;

  let matched: Issue[] = [];
  for (const issue of data) {
    if (status !== "all" && issue.status !== status) continue;
    if (priority !== "all" && issue.priority !== priority) continue;
    if (!matchesSearch(issue, search.trim())) continue;
    matched.push(issue);
  }

  if (sortKey) {
    const dir = sortDir === "asc" ? 1 : -1;
    matched.sort((a, b) => compare(a, b, sortKey) * dir);
  }

  const total = matched.length;
  const start = Math.max(0, page) * pageSize;
  const rows = matched.slice(start, start + pageSize);
  return { rows, total, page, pageSize };
}

/** Aggregate counts by status, for dashboard summary cards. */
export function statusCounts(data: readonly Issue[]): Record<Issue["status"], number> {
  const counts: Record<Issue["status"], number> = { open: 0, in_progress: 0, closed: 0 };
  for (const issue of data) counts[issue.status]++;
  return counts;
}
