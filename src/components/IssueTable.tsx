import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef } from "react";
import type { Issue } from "../lib/types";

const ROW_HEIGHT = 36;

/**
 * Virtualized table: only the rows in the viewport are mounted, so the DOM
 * node count stays constant whether the result set is 50 rows or 50,000.
 */
export function IssueTable({ rows }: { rows: Issue[] }) {
  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 8,
  });

  return (
    <div ref={parentRef} role="table" aria-rowcount={rows.length}
      style={{ height: 480, overflow: "auto", border: "1px solid #ddd" }}>
      <div style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
        {virtualizer.getVirtualItems().map((vi) => {
          const issue = rows[vi.index]!;
          return (
            <div
              key={issue.id}
              role="row"
              data-testid="issue-row"
              style={{
                position: "absolute",
                top: 0,
                transform: `translateY(${vi.start}px)`,
                height: ROW_HEIGHT,
                display: "flex",
                gap: 12,
                width: "100%",
                alignItems: "center",
                padding: "0 8px",
                borderBottom: "1px solid #f0f0f0",
              }}
            >
              <span style={{ width: 56 }}>#{issue.id}</span>
              <span style={{ flex: 1 }}>{issue.title}</span>
              <span style={{ width: 80 }}>{issue.assignee}</span>
              <span style={{ width: 96 }}>{issue.priority}</span>
              <span style={{ width: 96 }}>{issue.status}</span>
              <span style={{ width: 48, textAlign: "right" }}>{issue.comments}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
