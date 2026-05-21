import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createIssue, fetchIssues } from "../lib/api";
import type { CreateIssueInput } from "../lib/schema";

export function useIssues() {
  return useQuery({ queryKey: ["issues"], queryFn: fetchIssues, staleTime: 30_000 });
}

export function useCreateIssue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateIssueInput) => createIssue(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["issues"] });
    },
  });
}
