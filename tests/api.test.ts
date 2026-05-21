import { beforeEach, describe, expect, it } from "vitest";
import { __resetDataset, createIssue, fetchIssues } from "../src/lib/api";

describe("api", () => {
  beforeEach(() => __resetDataset(100));

  it("fetches the seeded dataset", async () => {
    const issues = await fetchIssues();
    expect(issues).toHaveLength(100);
  });

  it("creates an issue at the front with a new id", async () => {
    const before = await fetchIssues();
    const created = await createIssue({ title: "New issue", assignee: "alice", priority: "high", status: "open" });
    const after = await fetchIssues();
    expect(after).toHaveLength(before.length + 1);
    expect(created.id).toBeGreaterThan(100);
    expect(after[0]!.id).toBe(created.id);
    expect(created.comments).toBe(0);
  });
});
