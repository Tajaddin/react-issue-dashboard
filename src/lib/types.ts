export type IssueStatus = "open" | "in_progress" | "closed";
export type IssuePriority = "low" | "medium" | "high" | "critical";

export interface Issue {
  id: number;
  title: string;
  assignee: string;
  status: IssueStatus;
  priority: IssuePriority;
  createdAt: number; // epoch ms
  comments: number;
}

export interface SortRule {
  key: keyof Issue;
  dir?: "asc" | "desc"; // default "asc"
}

export interface QuerySpec {
  search?: string;
  status?: IssueStatus | "all";
  priority?: IssuePriority | "all";
  /** Sort keys in priority order. When non-empty, overrides sortKey/sortDir. */
  sort?: SortRule[];
  /** One-key sort, same as `sort: [{ key: sortKey, dir: sortDir }]`. */
  sortKey?: keyof Issue;
  sortDir?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

export interface QueryResult {
  rows: Issue[];
  total: number; // matches before pagination
  page: number;
  pageSize: number;
}
