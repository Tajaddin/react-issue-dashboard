import type { QuerySpec } from "../lib/types";

export function FilterBar({ spec, onChange }: { spec: QuerySpec; onChange: (next: QuerySpec) => void }) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <input
        aria-label="Search"
        placeholder="Search title, assignee, or #id"
        value={spec.search ?? ""}
        onChange={(e) => onChange({ ...spec, search: e.target.value, page: 0 })}
        style={{ flex: 1, minWidth: 200 }}
      />
      <select
        aria-label="Status filter"
        value={spec.status ?? "all"}
        onChange={(e) => onChange({ ...spec, status: e.target.value as QuerySpec["status"], page: 0 })}
      >
        <option value="all">all statuses</option>
        <option value="open">open</option>
        <option value="in_progress">in_progress</option>
        <option value="closed">closed</option>
      </select>
      <select
        aria-label="Priority filter"
        value={spec.priority ?? "all"}
        onChange={(e) => onChange({ ...spec, priority: e.target.value as QuerySpec["priority"], page: 0 })}
      >
        <option value="all">all priorities</option>
        <option value="low">low</option>
        <option value="medium">medium</option>
        <option value="high">high</option>
        <option value="critical">critical</option>
      </select>
    </div>
  );
}
