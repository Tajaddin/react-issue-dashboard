// Deterministic issue generator for the demo dataset, tests, and benchmark.

import type { Issue, IssuePriority, IssueStatus } from "./types";

const STATUSES: IssueStatus[] = ["open", "in_progress", "closed"];
const PRIORITIES: IssuePriority[] = ["low", "medium", "high", "critical"];
const ASSIGNEES = ["alice", "bob", "carol", "dave", "erin", "frank", "grace", "heidi"];
const VERBS = ["Fix", "Add", "Refactor", "Investigate", "Document", "Optimize", "Remove"];
const NOUNS = ["login flow", "cache layer", "API client", "dashboard", "auth token", "query engine", "CI pipeline"];

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateIssues(count: number, seed = 7): Issue[] {
  const rand = mulberry32(seed);
  const pick = <T>(arr: readonly T[]): T => arr[Math.floor(rand() * arr.length)]!;
  const base = 1_700_000_000_000;
  const issues: Issue[] = new Array(count);
  for (let i = 0; i < count; i++) {
    issues[i] = {
      id: i + 1,
      title: `${pick(VERBS)} ${pick(NOUNS)}`,
      assignee: pick(ASSIGNEES),
      status: pick(STATUSES),
      priority: pick(PRIORITIES),
      createdAt: base - Math.floor(rand() * 90 * 86_400_000),
      comments: Math.floor(rand() * 50),
    };
  }
  return issues;
}
