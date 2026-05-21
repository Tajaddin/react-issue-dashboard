import { z } from "zod";

export const createIssueSchema = z.object({
  title: z.string().min(3, "Title needs at least 3 characters").max(120),
  assignee: z.string().min(1, "Assignee is required"),
  priority: z.enum(["low", "medium", "high", "critical"]),
  status: z.enum(["open", "in_progress", "closed"]),
});

export type CreateIssueInput = z.infer<typeof createIssueSchema>;
