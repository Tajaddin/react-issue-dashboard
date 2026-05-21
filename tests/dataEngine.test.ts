import { describe, expect, it } from "vitest";
import { runQuery, statusCounts } from "../src/lib/dataEngine";
import { generateIssues } from "../src/lib/seed";
import type { Issue } from "../src/lib/types";

const sample: Issue[] = [
  { id: 1, title: "Fix login flow", assignee: "alice", status: "open", priority: "high", createdAt: 100, comments: 3 },
  { id: 2, title: "Add cache layer", assignee: "bob", status: "closed", priority: "low", createdAt: 200, comments: 0 },
  { id: 3, title: "Refactor API client", assignee: "alice", status: "in_progress", priority: "critical", createdAt: 150, comments: 9 },
];

describe("runQuery", () => {
  it("returns all rows with an empty spec", () => {
    expect(runQuery(sample, {}).total).toBe(3);
  });

  it("filters by status", () => {
    const r = runQuery(sample, { status: "open" });
    expect(r.total).toBe(1);
    expect(r.rows[0]!.id).toBe(1);
  });

  it("filters by priority", () => {
    expect(runQuery(sample, { priority: "critical" }).total).toBe(1);
  });

  it("searches title (case-insensitive)", () => {
    expect(runQuery(sample, { search: "CACHE" }).total).toBe(1);
  });

  it("searches assignee", () => {
    expect(runQuery(sample, { search: "alice" }).total).toBe(2);
  });

  it("searches by exact id", () => {
    expect(runQuery(sample, { search: "3" }).total).toBe(1);
  });

  it("sorts by priority rank ascending", () => {
    const r = runQuery(sample, { sortKey: "priority", sortDir: "asc" });
    expect(r.rows.map((x) => x.priority)).toEqual(["low", "high", "critical"]);
  });

  it("sorts by createdAt descending", () => {
    const r = runQuery(sample, { sortKey: "createdAt", sortDir: "desc" });
    expect(r.rows.map((x) => x.id)).toEqual([2, 3, 1]);
  });

  it("paginates and preserves the pre-pagination total", () => {
    const data = generateIssues(120);
    const r = runQuery(data, { page: 1, pageSize: 50 });
    expect(r.total).toBe(120);
    expect(r.rows).toHaveLength(50);
    expect(r.rows[0]!.id).toBe(51);
  });

  it("combines filter + search + sort + paginate", () => {
    const data = generateIssues(5000);
    const r = runQuery(data, { status: "open", search: "fix", sortKey: "comments", sortDir: "desc", page: 0, pageSize: 10 });
    expect(r.rows.length).toBeLessThanOrEqual(10);
    expect(r.rows.every((x) => x.status === "open")).toBe(true);
    expect(r.rows.every((x) => x.title.toLowerCase().includes("fix"))).toBe(true);
    // sorted by comments desc
    for (let i = 1; i < r.rows.length; i++) {
      expect(r.rows[i - 1]!.comments).toBeGreaterThanOrEqual(r.rows[i]!.comments);
    }
  });

  it("empty page beyond the end returns no rows but the real total", () => {
    const r = runQuery(sample, { page: 99, pageSize: 50 });
    expect(r.rows).toHaveLength(0);
    expect(r.total).toBe(3);
  });
});

describe("statusCounts", () => {
  it("counts each status", () => {
    expect(statusCounts(sample)).toEqual({ open: 1, in_progress: 1, closed: 1 });
  });

  it("is generation-stable for a seeded dataset", () => {
    const counts = statusCounts(generateIssues(3000));
    expect(counts.open + counts.in_progress + counts.closed).toBe(3000);
  });
});
