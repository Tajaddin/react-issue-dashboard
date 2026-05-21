// Tiny typed client. In this demo the "server" is the in-memory seeded set,
// but the surface mirrors a real REST API so swapping in fetch is trivial.

import { generateIssues } from "./seed";
import type { CreateIssueInput } from "./schema";
import type { Issue } from "./types";

let dataset: Issue[] = generateIssues(2000);

export async function fetchIssues(): Promise<Issue[]> {
  // Simulate a network tick without a real request.
  await Promise.resolve();
  return dataset;
}

export async function createIssue(input: CreateIssueInput): Promise<Issue> {
  await Promise.resolve();
  const nextId = dataset.reduce((m, i) => Math.max(m, i.id), 0) + 1;
  const issue: Issue = { id: nextId, comments: 0, createdAt: Date.now(), ...input };
  dataset = [issue, ...dataset];
  return issue;
}

// Test seam: reset the in-memory dataset to a known size.
export function __resetDataset(count: number, seed = 7): void {
  dataset = generateIssues(count, seed);
}
