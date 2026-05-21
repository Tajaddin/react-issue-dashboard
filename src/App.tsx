import { useMemo, useState } from "react";
import { CreateIssueForm } from "./components/CreateIssueForm";
import { FilterBar } from "./components/FilterBar";
import { IssueTable } from "./components/IssueTable";
import { useCreateIssue, useIssues } from "./hooks/useIssues";
import { runQuery, statusCounts } from "./lib/dataEngine";
import type { QuerySpec } from "./lib/types";

export function App() {
  const { data: issues = [], isLoading } = useIssues();
  const createIssue = useCreateIssue();
  const [spec, setSpec] = useState<QuerySpec>({ sortKey: "id", sortDir: "desc", pageSize: 1000 });

  const result = useMemo(() => runQuery(issues, spec), [issues, spec]);
  const counts = useMemo(() => statusCounts(issues), [issues]);

  return (
    <main style={{ maxWidth: 980, margin: "0 auto", padding: 16, fontFamily: "system-ui, sans-serif" }}>
      <h1>Issue Dashboard</h1>
      <p style={{ display: "flex", gap: 16 }}>
        <span>open: {counts.open}</span>
        <span>in progress: {counts.in_progress}</span>
        <span>closed: {counts.closed}</span>
        <span>showing: {result.total}</span>
      </p>

      <CreateIssueForm onCreate={(input) => createIssue.mutate(input)} />
      <div style={{ height: 12 }} />
      <FilterBar spec={spec} onChange={setSpec} />
      <div style={{ height: 12 }} />

      {isLoading ? <p>Loading…</p> : <IssueTable rows={result.rows} />}
    </main>
  );
}
